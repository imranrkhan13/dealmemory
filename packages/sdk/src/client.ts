import { activationEvents } from './events.js';
import type { ActivationOptions, ActivationProperties, QueuedEvent } from './types.js';

const storageKey = (name: string) => `activation-memory:${name}`;
const createId = () => crypto.randomUUID();

export class ActivationMemory {
  private readonly options: ActivationOptions;
  private userId?: string;
  private anonymousId: string;
  private sessionId: string;
  private queue: QueuedEvent[];
  private timer?: number;

  constructor(options: ActivationOptions) {
    this.options = options;
    this.anonymousId = localStorage.getItem(storageKey('anonymous')) ?? createId();
    this.sessionId = createId();
    this.queue = JSON.parse(localStorage.getItem(storageKey('queue')) ?? '[]') as QueuedEvent[];
    localStorage.setItem(storageKey('anonymous'), this.anonymousId);
    this.timer = window.setInterval(() => void this.flush(), options.flushIntervalMs ?? 5000);
  }

  identify(userId: string, traits: ActivationProperties = {}) { this.userId = userId; this.track('identified', traits); }
  setGoal(goal: string) { this.track('goal_set', { goal }); }
  page(name?: string) { this.track('page_view', { name: name ?? document.title }); }

  track(name: string, properties: ActivationProperties = {}) {
    if (this.options.privacy?.blockedEvents?.includes(name)) return;
    const safe = Object.fromEntries(Object.entries(properties).filter(([key, value]) => !/password|token|secret|text|value/i.test(key) && ['string', 'number', 'boolean'].includes(typeof value))) as ActivationProperties;
    const event: QueuedEvent = { id: createId(), projectKey: this.options.projectKey, name, userId: this.userId, anonymousId: this.anonymousId, sessionId: this.sessionId, occurredAt: new Date().toISOString(), properties: safe };
    if (this.options.privacy?.capturePageUrl !== false) event.url = location.href;
    if (this.options.privacy?.captureReferrer !== false) event.referrer = document.referrer;
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
    if (!this.queue.length) return;
    const batch = this.queue.splice(0, 20);
    try {
      const response = await fetch(`${this.options.apiUrl.replace(/\/$/, '')}/v1/events/batch`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-project-key': this.options.projectKey }, body: JSON.stringify({ events: batch }) });
      if (!response.ok) throw new Error('Activation Memory ingestion failed.');
      this.persist();
    } catch { this.queue.unshift(...batch); this.persist(); }
  }

  reset() { this.userId = undefined; this.sessionId = createId(); this.anonymousId = createId(); localStorage.setItem(storageKey('anonymous'), this.anonymousId); }
  destroy() { if (this.timer) window.clearInterval(this.timer); void this.flush(); }
  private persist() { localStorage.setItem(storageKey('queue'), JSON.stringify(this.queue)); }
}
