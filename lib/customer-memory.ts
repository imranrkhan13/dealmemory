import { ActivationEvent } from '@/packages/shared/src/events';

export interface TimelineStep {
  id: string;
  name: string;
  readableName: string;
  occurredAt: string;
  formattedTime: string;
  relativeTime: string;
  sessionId: string;
  properties: Record<string, string | number | boolean | null>;
  isFailure: boolean;
  isMilestone: boolean;
  isLast: boolean;
  narrative: string;
}

export interface LastActionSummary {
  name: string;
  readableName: string;
  occurredAt: string;
  relativeTime: string;
  formattedTime: string;
  properties: Record<string, string | number | boolean | null>;
  isFailure: boolean;
  isMilestone: boolean;
  narrative: string;
}

export interface OnboardingDiagnosis {
  stage: 'signup' | 'dashboard' | 'project' | 'integration' | 'first_value' | 'checkout' | 'paid';
  stageLabel: string;
  isBroke: boolean;
  brokeAt: string | null;
  summary: string;
  progressPercent: number;
  recommendation: string;
}

export interface CustomerMemoryCapsule {
  title: string;
  summary: string;
  intent: string;
  techStack: string[];
  frictionPoints: string[];
  contextNotes: string[];
  suggestedAction: string;
  founderNotes?: string;
  lastUpdated: string;
}

/** Formats a date string into relative time, e.g. "4m ago", "2h ago", "3d ago" */
export function formatRelativeTime(dateStr: string): string {
  try {
    const ms = Date.now() - new Date(dateStr).getTime();
    if (isNaN(ms) || ms < 0) return 'just now';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  } catch {
    return 'recently';
  }
}

/** Formats an ISO string to a clean time label, e.g. "10:14 AM" */
export function formatClockTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

/** Formats full date with time, e.g. "Oct 28, 10:14 AM" */
export function formatFullDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return dateStr;
  }
}

/** Human-readable event title dictionary */
const EVENT_READABLE_NAMES: Record<string, string> = {
  trial_started: 'Signed up & started trial',
  signup: 'Account registered',
  user_signed_up: 'Account registered',
  identified: 'Identified user session',
  page_view: 'Viewed page',
  dashboard_opened: 'Opened workspace dashboard',
  project_created: 'Created new project',
  workspace_created: 'Created workspace',
  goal_set: 'Configured onboarding goal',
  integration_connect_attempted: 'Attempted integration connection',
  integration_connected: 'Connected integration',
  repository_connected: 'Connected code repository',
  githubconnected: 'Connected GitHub account',
  integration_connection_failed: 'Integration connection failed',
  integration_failed: 'Integration connection failed',
  repository_connection_failed: 'Repository connection failed',
  githuboauthfailed: 'GitHub OAuth authorization failed',
  oauth_failed: 'OAuth authorization failed',
  first_map_generated: 'Generated first architecture map',
  first_value_reached: 'Reached first product value',
  activation_completed: 'Completed activation milestone',
  summary_viewed: 'Viewed architecture summary',
  checkout_started: 'Initiated subscription checkout',
  payment_completed: 'Completed subscription payment',
  subscription_created: 'Subscription activated',
  subscription_cancelled: 'Subscription cancelled',
  api_key_created: 'Created API project key',
  team_invited: 'Invited team member',
  meaningful_action: 'Completed milestone action',
};

export function getReadableEventName(name: string): string {
  if (EVENT_READABLE_NAMES[name]) return EVENT_READABLE_NAMES[name];
  return name
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Builds human narrative for an individual event */
export function buildEventNarrative(event: ActivationEvent): string {
  const props = event.properties ?? {};
  const name = event.name;

  if (name === 'trial_started') {
    const plan = props.plan ? `on ${props.plan}` : '';
    const src = props.source ? `via ${props.source}` : '';
    return `User created their account ${plan} ${src}`.trim() + '.';
  }
  if (name === 'goal_set' && props.goal) {
    return `Stated activation goal: "${props.goal}".`;
  }
  if (name === 'project_created') {
    return `Created project "${props.name ?? props.projectName ?? 'Default'}".`;
  }
  if (name === 'dashboard_opened' || name === 'page_view') {
    return `Opened ${props.name ?? props.page ?? event.url ?? 'dashboard'}.`;
  }
  if (name === 'integration_connect_attempted' || name === 'github_connect_started') {
    const provider = props.provider ?? 'GitHub';
    return `Attempted to connect ${provider} OAuth integration.`;
  }
  if (name === 'integration_connection_failed' || name === 'githuboauthfailed' || name === 'repository_connection_failed') {
    const provider = props.provider ?? 'GitHub';
    const error = props.errorCode ?? props.error ?? 'OAuth authorization failed';
    return `Connection to ${provider} failed (${error}).`;
  }
  if (name === 'integration_connected' || name === 'repository_connected' || name === 'githubconnected') {
    const provider = props.provider ?? 'GitHub';
    const repo = props.repo ?? props.repository;
    return `Successfully linked ${provider}${repo ? ` (${repo})` : ''}.`;
  }
  if (name === 'first_map_generated' || name === 'first_value_reached' || name === 'activation_completed') {
    return 'Generated first architecture map and reached core product value.';
  }
  if (name === 'checkout_started') {
    return `Opened checkout session for ${props.tier ?? props.plan ?? 'Pro'} plan.`;
  }
  if (name === 'payment_completed' || name === 'subscription_created') {
    return `Payment verified: converted to ${props.tier ?? props.plan ?? 'Pro'} subscription.`;
  }

  // Fallback narrative from properties
  const propPairs = Object.entries(props)
    .filter(([k]) => !['password', 'token', 'secret'].includes(k))
    .slice(0, 3)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');

  return propPairs ? `${getReadableEventName(name)} (${propPairs}).` : `${getReadableEventName(name)}.`;
}

/** Formats the user's event history into an interactive timeline sequence */
export function buildTimelineSequence(events: ActivationEvent[]): TimelineStep[] {
  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const total = sorted.length;

  return sorted.map((evt, idx) => {
    const isFailure =
      evt.name.includes('failed') ||
      evt.name.includes('error') ||
      Boolean(evt.properties?.error) ||
      Boolean(evt.properties?.errorCode);

    const isMilestone =
      evt.name === 'first_map_generated' ||
      evt.name === 'first_value_reached' ||
      evt.name === 'activation_completed' ||
      evt.name === 'payment_completed' ||
      evt.name === 'integration_connected' ||
      evt.name === 'repository_connected';

    return {
      id: evt.id,
      name: evt.name,
      readableName: getReadableEventName(evt.name),
      occurredAt: evt.occurredAt,
      formattedTime: formatFullDateTime(evt.occurredAt),
      relativeTime: formatRelativeTime(evt.occurredAt),
      sessionId: evt.sessionId,
      properties: (evt.properties ?? {}) as Record<string, string | number | boolean | null>,
      isFailure,
      isMilestone,
      isLast: idx === total - 1,
      narrative: buildEventNarrative(evt),
    };
  });
}

/** Extracts the user's last recorded action */
export function extractLastRecordedAction(events: ActivationEvent[]): LastActionSummary | null {
  if (!events.length) return null;
  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const last = sorted[sorted.length - 1];

  const isFailure =
    last.name.includes('failed') ||
    last.name.includes('error') ||
    Boolean(last.properties?.error) ||
    Boolean(last.properties?.errorCode);

  const isMilestone =
    last.name === 'first_map_generated' ||
    last.name === 'first_value_reached' ||
    last.name === 'activation_completed' ||
    last.name === 'payment_completed';

  return {
    name: last.name,
    readableName: getReadableEventName(last.name),
    occurredAt: last.occurredAt,
    relativeTime: formatRelativeTime(last.occurredAt),
    formattedTime: formatFullDateTime(last.occurredAt),
    properties: (last.properties ?? {}) as Record<string, string | number | boolean | null>,
    isFailure,
    isMilestone,
    narrative: buildEventNarrative(last),
  };
}

/** Diagnoses where onboarding broke or progressed */
export function diagnoseOnboarding(events: ActivationEvent[]): OnboardingDiagnosis {
  if (!events.length) {
    return {
      stage: 'signup',
      stageLabel: 'Not Started',
      isBroke: true,
      brokeAt: 'No actions received',
      summary: 'No product actions have been recorded yet.',
      progressPercent: 0,
      recommendation: 'Verify SDK installation and event streaming.',
    };
  }

  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const last = sorted[sorted.length - 1];
  const lastTime = new Date(last.occurredAt).getTime();
  const inactiveHours = Math.max(0, Math.round((Date.now() - lastTime) / 3600000));
  const isStalled = inactiveHours >= 1; // stopped for more than 1 hour

  const hasPaid = sorted.some((e) => e.name === 'payment_completed' || e.name === 'subscription_created');
  const hasCheckout = sorted.some((e) => e.name === 'checkout_started');
  const hasValue = sorted.some((e) => e.name === 'first_map_generated' || e.name === 'first_value_reached' || e.name === 'activation_completed');
  const hasConnected = sorted.some((e) => e.name === 'integration_connected' || e.name === 'repository_connected' || e.name === 'githubconnected');
  const hasAttemptedConnect = sorted.some((e) => e.name === 'integration_connect_attempted' || e.name === 'github_connect_started');
  const hasFailedConnect = sorted.some((e) => e.name.includes('failed') || e.name.includes('error') || e.name === 'githuboauthfailed');
  const hasProject = sorted.some((e) => e.name === 'project_created' || e.name === 'workspace_created');
  const hasDashboard = sorted.some((e) => e.name === 'dashboard_opened' || e.name === 'page_view');

  if (hasPaid) {
    return {
      stage: 'paid',
      stageLabel: 'Paid Account',
      isBroke: false,
      brokeAt: null,
      summary: 'User successfully completed onboarding and converted to paid subscription.',
      progressPercent: 100,
      recommendation: 'Deliver premium onboarding and monitor recurring value delivery.',
    };
  }

  if (hasCheckout) {
    return {
      stage: 'checkout',
      stageLabel: 'Checkout Initiated',
      isBroke: isStalled,
      brokeAt: isStalled ? 'Checkout Abandonment' : null,
      summary: isStalled
        ? `User opened checkout ${formatRelativeTime(last.occurredAt)} but has not completed payment.`
        : 'User is currently in checkout process.',
      progressPercent: 85,
      recommendation: 'Send checkout recovery reminder or offer billing assistance.',
    };
  }

  if (hasValue) {
    return {
      stage: 'first_value',
      stageLabel: 'First Value Reached',
      isBroke: false,
      brokeAt: null,
      summary: 'User successfully connected integration and achieved core value milestone.',
      progressPercent: 75,
      recommendation: 'User is highly activated. Offer annual plan or invite teammates.',
    };
  }

  // Broken or stalled at Integration stage
  if (hasFailedConnect || (hasAttemptedConnect && !hasConnected)) {
    const errorProp = last.properties?.errorCode ?? last.properties?.error ?? 'OAuth permission denied';
    return {
      stage: 'integration',
      stageLabel: 'Integration Setup',
      isBroke: true,
      brokeAt: `Integration connection failed (${errorProp})`,
      summary: `User tried to connect an integration but halted after encountering an error: ${errorProp}. Last recorded action: ${formatRelativeTime(last.occurredAt)}.`,
      progressPercent: 40,
      recommendation: 'Send integration troubleshooting guide or check organization OAuth permissions.',
    };
  }

  if (hasConnected && !hasValue) {
    return {
      stage: 'integration',
      stageLabel: 'Integration Connected',
      isBroke: isStalled,
      brokeAt: isStalled ? 'Stopped before reaching first value' : null,
      summary: isStalled
        ? `User successfully linked integration, but stopped before generating their first map or reaching value.`
        : 'Integration linked. User is actively preparing first milestone.',
      progressPercent: 50,
      recommendation: 'Prompt the first-value action (e.g. generate map or run initial sync).',
    };
  }

  if (hasProject) {
    return {
      stage: 'project',
      stageLabel: 'Project Created',
      isBroke: isStalled,
      brokeAt: isStalled ? 'Stopped before connecting integration' : null,
      summary: isStalled
        ? `User created a project ${formatRelativeTime(last.occurredAt)} but stopped before connecting an integration.`
        : 'Project created. Awaiting integration connection.',
      progressPercent: 30,
      recommendation: 'Highlight one-click connectors in their workspace dashboard.',
    };
  }

  if (hasDashboard) {
    return {
      stage: 'dashboard',
      stageLabel: 'Dashboard Opened',
      isBroke: isStalled,
      brokeAt: isStalled ? 'Stopped after opening dashboard' : null,
      summary: `User opened the dashboard ${formatRelativeTime(last.occurredAt)} but has not created a project or connected any data source.`,
      progressPercent: 20,
      recommendation: 'Trigger automated onboarding checklist guide.',
    };
  }

  // Dropped off right at signup
  return {
    stage: 'signup',
    stageLabel: 'Signed Up',
    isBroke: isStalled,
    brokeAt: isStalled ? 'Drop-off immediately after sign up' : null,
    summary: `User registered an account ${formatRelativeTime(last.occurredAt)} but stopped before exploring the dashboard or creating a project.`,
    progressPercent: 10,
    recommendation: 'Send welcome email with quickstart video walkthrough.',
  };
}

/** Synthesizes the Customer Memory Capsule: what the team should remember about this specific user */
export function buildCustomerMemoryCapsule(
  userId: string,
  events: ActivationEvent[],
  existingNotes?: string
): CustomerMemoryCapsule {
  const diagnosis = diagnoseOnboarding(events);
  const lastAction = extractLastRecordedAction(events);

  // Extract goal
  const goalEvent = events.find((e) => e.name === 'goal_set' && e.properties?.goal);
  const statedGoal = goalEvent?.properties?.goal ? String(goalEvent.properties.goal) : '';

  // Extract tech stack & environment clues from properties
  const stack = new Set<string>();
  events.forEach((e) => {
    const p = e.properties ?? {};
    if (p.provider) stack.add(String(p.provider));
    if (p.repo || p.repository) stack.add(String(p.repo ?? p.repository));
    if (p.language) stack.add(String(p.language));
    if (p.framework) stack.add(String(p.framework));
    if (p.format) stack.add(String(p.format).toUpperCase());
    if (p.platform) stack.add(String(p.platform));
    if (e.name.includes('github')) stack.add('GitHub');
    if (e.name.includes('slack')) stack.add('Slack');
  });

  // Friction points
  const frictionPoints: string[] = [];
  events.forEach((e) => {
    if (e.name.includes('failed') || e.name.includes('error')) {
      const err = e.properties?.errorCode ?? e.properties?.error ?? e.name;
      frictionPoints.push(`${getReadableEventName(e.name)}: ${err}`);
    }
  });
  if (diagnosis.isBroke && diagnosis.brokeAt && !frictionPoints.length) {
    frictionPoints.push(diagnosis.brokeAt);
  }

  // Key context notes for the team
  const contextNotes: string[] = [];
  if (statedGoal) {
    contextNotes.push(`Goal: ${statedGoal}`);
  }
  if (stack.size > 0) {
    contextNotes.push(`Stack & Tools: ${Array.from(stack).join(', ')}`);
  }
  if (lastAction) {
    contextNotes.push(`Last activity: ${lastAction.readableName} (${lastAction.relativeTime})`);
  }
  if (diagnosis.isBroke) {
    contextNotes.push(`Onboarding roadblock: ${diagnosis.brokeAt}`);
  } else {
    contextNotes.push(`Status: ${diagnosis.stageLabel} (${diagnosis.progressPercent}% milestone progression)`);
  }

  // High-level narrative summary
  const summary = `User "${userId}" ${
    statedGoal ? `signed up to ${statedGoal.toLowerCase()}` : 'signed up for evaluation'
  }. ${
    diagnosis.isBroke
      ? `Onboarding stalled at the ${diagnosis.stageLabel} stage: ${diagnosis.summary}`
      : `Progressing through onboarding (${diagnosis.stageLabel}).`
  }`;

  return {
    title: diagnosis.isBroke
      ? `Onboarding Friction: ${diagnosis.brokeAt ?? diagnosis.stageLabel}`
      : `Active User: ${diagnosis.stageLabel}`,
    summary,
    intent: statedGoal || 'Evaluate application capabilities and setup workflow.',
    techStack: Array.from(stack),
    frictionPoints,
    contextNotes,
    suggestedAction: diagnosis.recommendation,
    founderNotes: existingNotes,
    lastUpdated: lastAction?.occurredAt ?? new Date().toISOString(),
  };
}
