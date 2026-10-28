import { activationEvents } from './events.js';
import type { ActivationOptions, ActivationProperties, QueuedEvent } from './types.js';

const storageKey = (project: string, name: string) => `agentlens:${project}:${name}`;
const createId = () => crypto.randomUUID();

const CREDENTIAL_PATTERNS = [
  /(?:pk_live|sk_live|whsec)_[a-zA-Z0-9_]{16,}/,
  /\bBearer(?:\s|%20)+[a-zA-Z0-9_\-\.~+/]{16,}={0,2}/i,
  /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/,
  /-----BEGIN[ A-Z0-9_-]*PRIVATE KEY-----/,
  /(?:password|token|secret)\s*=\s*['"]?[^\s'";&]{3,}['"]?/i,
];

function containsCredential(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return CREDENTIAL_PATTERNS.some((pattern) => pattern.test(value));
}

export class AgentLens {
  private readonly options: ActivationOptions;
  private userId?: string;
  private anonymousId: string;
  private sessionId: string;
  private queue: QueuedEvent[];
  private timer?: number;
  private flushing = false;
  private failures = 0;
  private retryAt = 0;
  private clickHandler?: (event: MouseEvent) => void;
  private submitHandler?: (event: SubmitEvent) => void;

  constructor(options: ActivationOptions) {
    this.options = options;
    this.anonymousId = localStorage.getItem(storageKey(this.options.projectKey, 'anonymous')) ?? createId();
    this.sessionId = createId();
    this.userId = localStorage.getItem(storageKey(this.options.projectKey, 'user')) ?? undefined;
    try {
      this.queue = JSON.parse(localStorage.getItem(storageKey(this.options.projectKey, 'queue')) ?? '[]') as QueuedEvent[];
    } catch {
      this.queue = [];
    }
    this.queue = Array.isArray(this.queue) ? this.queue.filter(e=>e.projectKey===this.options.projectKey).slice(-1000) : [];
    localStorage.setItem(storageKey(this.options.projectKey, 'anonymous'), this.anonymousId);
    this.timer = window.setInterval(() => void this.flush(), options.flushIntervalMs ?? 5000);

    if (options.autoCapture !== false) {
      this.enableAutoCapture();
      this.track('page_view');
    }
  }

  identify(userId: string, traits: ActivationProperties = {}) {
    this.userId = userId;
    localStorage.setItem(storageKey(this.options.projectKey, 'user'), userId);
    this.track('identified', traits);
  }
  setGoal(goal: string) { this.track('goal_set', { goal }); }
  page(name?: string) { this.track('page_view', { name: name ?? document.title }); }

  track(name: string, properties: ActivationProperties = {}) {
    if (this.options.privacy?.blockedEvents?.includes(name)) return;
    const safe = Object.fromEntries(
      Object.entries(properties).slice(0, 20).filter(([key, value]) =>
        key.length <= 80 &&
        (typeof value !== 'string' || value.length <= 500) &&
        !/password|token|secret|message|text|value/i.test(key) &&
        ['string', 'number', 'boolean'].includes(typeof value) &&
        (typeof value !== 'string' || !containsCredential(value))
      )
    ) as ActivationProperties;
    const event: QueuedEvent = { id: createId(), projectKey: this.options.projectKey, name, userId: this.userId, anonymousId: this.anonymousId, sessionId: this.sessionId, occurredAt: new Date().toISOString(), properties: safe };
    if (this.options.privacy?.capturePageUrl !== false) event.url = this.pageUrl(location.href);
    if (this.options.privacy?.captureReferrer !== false) event.referrer = this.pageUrl(document.referrer);
    this.queue.push(event); this.persist(); void this.flush();
  }

  trialStarted() { this.track(activationEvents.trialStarted); }
  checkoutStarted() { this.track(activationEvents.checkoutStarted); }
  checkoutCompleted() { this.track(activationEvents.checkoutCompleted); }
  oauthFailed(properties: ActivationProperties = {}) { this.track(activationEvents.integrationFailed, { ...properties, errorCode: String(properties.errorCode ?? 'oauth_failed') }); }
  integrationConnected(properties: ActivationProperties = {}) { this.track(activationEvents.integrationConnected, properties); }
  integrationFailed(properties: ActivationProperties = {}) { this.track(activationEvents.integrationFailed, properties); }
  featureUsed(feature: string) { this.track('feature_used', { feature }); }
  repositoryImported() { this.track(activationEvents.integrationConnected); }
  firstValueReached() { this.track(activationEvents.firstValueReached); }
  subscriptionCreated() { this.track(activationEvents.subscriptionCreated); }
  subscriptionCancelled() { this.track(activationEvents.subscriptionCancelled); }
  apiError(properties: ActivationProperties = {}) { this.track(activationEvents.apiError, properties); }
  teamInvited() { this.track(activationEvents.teamInvited); }

  async flush() {
    if (this.flushing || !this.queue.length || Date.now()<this.retryAt) return;
    this.flushing=true;
    const batch=this.queue.slice(0,20);
    try {
      const response=await fetch(`${this.options.apiUrl.replace(/\/$/, '')}/v1/events/batch`,{method:'POST',headers:{'content-type':'application/json','x-project-key':this.options.projectKey},body:JSON.stringify({events:batch}),signal:AbortSignal.timeout(10000)});
      if(response.status===409) {
        const data=await response.json();
        const conflicts=new Set((data.conflicts ?? []).map((e:{eventId:string})=>e.eventId));
        // Valid non-conflicting events in this response have already been accepted or deduplicated.
        this.queue=this.queue.filter(e=>!batch.some(b=>b.id===e.id));
        console.warn('AgentLens dropped conflicting events',conflicts.size);
      } else if([400,401,403,413].includes(response.status)) {
        this.queue=this.queue.filter(e=>!batch.some(b=>b.id===e.id));
        console.warn('AgentLens dropped invalid batch',response.status);
      } else if(!response.ok) throw new Error(`HTTP ${response.status}`);
      else this.queue=this.queue.filter(e=>!batch.some(b=>b.id===e.id));
      this.failures=0;this.retryAt=0;
    } catch {
      this.failures++;
      this.retryAt=Date.now()+Math.min(300000,1000*2**Math.min(this.failures,12)*(0.5+Math.random()));
    } finally {this.flushing=false;this.persist();}
  }

  private pageUrl(value:string) {
    if(!value)return '';
    try {const url=new URL(value);if(!this.options.privacy?.captureQueryString){url.search='';url.hash='';}return url.toString();}catch{return '';}
  }

  reset() {
    this.userId = undefined;
    this.sessionId = createId();
    this.anonymousId = createId();
    localStorage.removeItem(storageKey(this.options.projectKey, 'user'));
    localStorage.setItem(storageKey(this.options.projectKey, 'anonymous'), this.anonymousId);
  }

  destroy() {
    if (this.timer) window.clearInterval(this.timer);
    if (this.clickHandler) document.removeEventListener('click', this.clickHandler, true);
    if (this.submitHandler) document.removeEventListener('submit', this.submitHandler, true);
    void this.flush();
  }

  private enableAutoCapture() {
    this.clickHandler = (event) => {
      const source = event.target;
      if (!(source instanceof Element)) return;
      const control = source.closest('button, a, [role="button"], input[type="submit"]');
      if (!control) return;

      this.track('action_clicked', {
        element: control.tagName.toLowerCase(),
        action:
          control.getAttribute('data-agentlens-action') ??
          control.getAttribute('name') ??
          control.id ??
          'unlabeled',
      });
    };

    this.submitHandler = (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      this.track('form_submitted', {
        form:
          form.getAttribute('data-agentlens-form') ??
          form.getAttribute('name') ??
          form.id ??
          'unlabeled',
      });
    };

    // Capture phase observes an action without changing the host app's events.
    document.addEventListener('click', this.clickHandler, true);
    document.addEventListener('submit', this.submitHandler, true);
  }

  private persist() { this.queue=this.queue.slice(-1000); try { localStorage.setItem(storageKey(this.options.projectKey, 'queue'), JSON.stringify(this.queue)); } catch { /* Storage can be unavailable or full. In-memory delivery still works. */ } }
}

/** DealMemory is the primary client for product activation and event tracking. */
export const DealMemory = AgentLens;

/** @deprecated Use DealMemory or AgentLens. Kept so existing integrations continue to work. */
export const ActivationMemory = AgentLens;
