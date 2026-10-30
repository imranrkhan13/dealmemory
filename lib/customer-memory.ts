import { ActivationEvent } from '@/packages/shared/src/events';

export type EventCategory = 'conversion' | 'friction' | 'creation' | 'engagement' | 'navigation' | 'general';

export interface TimelineStep {
  id: string;
  name: string;
  readableName: string;
  occurredAt: string;
  formattedTime: string;
  relativeTime: string;
  sessionId: string;
  category: EventCategory;
  properties: Record<string, string | number | boolean | null>;
  isFailure: boolean;
  isMilestone: boolean;
  isBrowsing: boolean;
  isLast: boolean;
  narrative: string;
}

export interface LastActionSummary {
  name: string;
  readableName: string;
  occurredAt: string;
  relativeTime: string;
  formattedTime: string;
  category: EventCategory;
  properties: Record<string, string | number | boolean | null>;
  isFailure: boolean;
  isMilestone: boolean;
  isBrowsing: boolean;
  narrative: string;
}

export interface OnboardingDiagnosis {
  stage: string;
  stageLabel: string;
  isBroke: boolean;
  brokeAt: string | null;
  summary: string;
  progressPercent: number;
  recommendation: string;
  archetype: 'explorer' | 'evaluator' | 'creator' | 'converted' | 'friction_stalled' | 'general';
}

export interface LovedItem {
  label: string;
  count: number;
  category: 'feature' | 'topic' | 'action' | 'product';
}

export interface UserActivitySummary {
  totalTimeSpent: string; // e.g. "~12 minutes", "< 1 min", "~1h 15m"
  activeTimeWindow: string; // e.g. "around 2:15 PM – 2:35 PM" or "around 11:20 AM"
  lovedFeature: string; // e.g. 'Loved: "Design Systems" (viewed 3x)'
  lovedItems: LovedItem[];
  executiveStory: string; // The rich founder summary
}

export interface CustomerMemoryCapsule {
  title: string;
  summary: string;
  intent: string;
  techStack: string[];
  interests: string[];
  frictionPoints: string[];
  contextNotes: string[];
  suggestedAction: string;
  archetype: string;
  founderNotes?: string;
  lastUpdated: string;
  activitySummary?: UserActivitySummary;
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
    if (isNaN(d.getTime())) return 'recently';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'recently';
  }
}

/** Formats full date with time, e.g. "Oct 28, 10:14 AM" */
export function formatFullDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'recently';
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return 'recently';
  }
}

/**
 * Universal dynamic event name formatter.
 * Converts ANY event string (snake_case, camelCase, kebab-case, dots) into human-readable Title Case.
 * Works dynamically across any organization domain without hardcoded lookup tables.
 */
export function getReadableEventName(name: string): string {
  if (!name) return 'Unknown Action';
  const cleaned = name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._\-:/]+/g, ' ')
    .trim();

  return cleaned
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Dynamic event classifier.
 * Infers behavioral semantics (failure, milestone, engagement, creation) from ANY event name or properties.
 */
export function classifyEvent(event: ActivationEvent): {
  category: EventCategory;
  isFailure: boolean;
  isMilestone: boolean;
  isBrowsing: boolean;
} {
  const name = event.name.toLowerCase();
  const props = (event.properties ?? {}) as Record<string, unknown>;

  // 1. Friction / Failure detection
  const isFailure =
    /(?:fail|error|denied|reject|abort|cancel|block|drop|stalled|crash|exception|timeout|invalid|limit|conflict)/i.test(
      name
    ) ||
    Boolean(props.error) ||
    Boolean(props.errorCode) ||
    Boolean(props.errorMessage) ||
    Boolean(props.failureReason) ||
    (typeof props.status === 'number' && props.status >= 400) ||
    props.success === false;

  // 2. Conversion / Milestone detection
  const isMilestone =
    /(?:activated|completed|paid|purchase|subscribed|converted|finished|first_|milestone|goal_reached|success|map_generated)/i.test(
      name
    ) ||
    props.verified === true ||
    props.status === 'success' ||
    Boolean(props.orderId) ||
    Boolean(props.transactionId);

  // 3. Browsing / Engagement / Scrolling
  const isBrowsing =
    /(?:scroll|view|read|watch|listen|browse|search|hover|tap|click|navigate|explore|open|feed|page|screen)/i.test(
      name
    ) &&
    !isFailure &&
    !isMilestone;

  // Category determination
  let category: EventCategory = 'general';
  if (isFailure) {
    category = 'friction';
  } else if (isMilestone) {
    category = 'conversion';
  } else if (
    /(?:create|setup|new|add|connect|install|config|register|signup|start|init)/i.test(name)
  ) {
    category = 'creation';
  } else if (isBrowsing) {
    category = 'engagement';
  } else if (/(?:view|page|screen|tab|navigate|url)/i.test(name)) {
    category = 'navigation';
  }

  return { category, isFailure, isMilestone, isBrowsing };
}

/**
 * Dynamic narrative generator.
 * Formulates a natural English sentence for ANY event based on its properties and category.
 */
export function buildEventNarrative(event: ActivationEvent): string {
  const props = (event.properties ?? {}) as Record<string, unknown>;
  const readable = getReadableEventName(event.name);
  const { category, isFailure } = classifyEvent(event);

  // Search or query action
  if (props.query || props.searchQuery || props.search) {
    const q = props.query || props.searchQuery || props.search;
    return `Searched for "${q}".`;
  }

  // Scrolling depth or position
  if (props.scrollDepth || props.depth || props.scrolledPixels || props.percent) {
    const depth = props.scrollDepth || props.depth || props.percent || `${props.scrolledPixels}px`;
    const target = props.page || props.screen || props.feed || event.url || 'content';
    return `Scrolled ${depth} through ${target}.`;
  }

  // Stated goal / intent
  if (props.goal || props.intent || props.objective) {
    const goal = props.goal || props.intent || props.objective;
    return `Stated objective: "${goal}".`;
  }

  // Error / failure condition
  if (isFailure) {
    const err = props.errorMessage || props.errorCode || props.error || props.failureReason;
    return err ? `${readable} encountered error: ${err}.` : `${readable} failed.`;
  }

  // Specific content or item interaction (products, videos, articles, posts)
  if (props.item || props.product || props.title || props.article || props.video || props.post) {
    const item = props.item || props.product || props.title || props.article || props.video || props.post;
    return `${readable} on "${item}".`;
  }

  // External repository, integration, or provider
  if (props.provider || props.repo || props.repository) {
    const provider = props.provider ? `${props.provider} ` : '';
    const repo = props.repo || props.repository ? `(${props.repo || props.repository})` : '';
    return `${readable}: ${provider}${repo}`.trim() + '.';
  }

  // Created project, workspace, document, or entity
  if (props.name || props.projectName || props.workspaceName || props.docName) {
    const entity = props.name || props.projectName || props.workspaceName || props.docName;
    return `${readable}: "${entity}".`;
  }

  // Plan, pricing, or billing tier
  if (props.plan || props.tier || props.amount || props.price) {
    const plan = props.plan || props.tier ? `plan "${props.plan || props.tier}"` : '';
    const price = props.amount || props.price ? `$${props.amount || props.price}` : '';
    return `${readable} for ${plan} ${price}`.trim() + '.';
  }

  // Navigation page or screen
  if (props.page || props.screen || props.path || event.url) {
    const dest = props.page || props.screen || props.path || event.url;
    return `${readable}: ${dest}.`;
  }

  // Dynamic fallback from properties
  const safeEntries = Object.entries(props)
    .filter(([k]) => !['password', 'token', 'secret'].includes(k))
    .slice(0, 2)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');

  return safeEntries ? `${readable} (${safeEntries}).` : `${readable}.`;
}

/** Formats the user's event history into an interactive timeline sequence */
export function buildTimelineSequence(events: ActivationEvent[]): TimelineStep[] {
  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const total = sorted.length;

  return sorted.map((evt, idx) => {
    const { category, isFailure, isMilestone, isBrowsing } = classifyEvent(evt);

    return {
      id: evt.id,
      name: evt.name,
      readableName: getReadableEventName(evt.name),
      occurredAt: evt.occurredAt,
      formattedTime: formatFullDateTime(evt.occurredAt),
      relativeTime: formatRelativeTime(evt.occurredAt),
      sessionId: evt.sessionId,
      category,
      properties: (evt.properties ?? {}) as Record<string, string | number | boolean | null>,
      isFailure,
      isMilestone,
      isBrowsing,
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
  const { category, isFailure, isMilestone, isBrowsing } = classifyEvent(last);

  return {
    name: last.name,
    readableName: getReadableEventName(last.name),
    occurredAt: last.occurredAt,
    relativeTime: formatRelativeTime(last.occurredAt),
    formattedTime: formatFullDateTime(last.occurredAt),
    category,
    properties: (last.properties ?? {}) as Record<string, string | number | boolean | null>,
    isFailure,
    isMilestone,
    isBrowsing,
    narrative: buildEventNarrative(last),
  };
}

/**
 * Universal dynamic journey diagnosis.
 * Analyzes where the user stopped, whether they encountered friction, browsed casually,
 * or completed a conversion milestone — without requiring hardcoded funnel names.
 */
export function diagnoseOnboarding(events: ActivationEvent[]): OnboardingDiagnosis {
  if (!events.length) {
    return {
      stage: 'none',
      stageLabel: 'No Activity',
      isBroke: false,
      brokeAt: null,
      summary: 'No product actions have been recorded yet.',
      progressPercent: 0,
      recommendation: 'Verify SDK installation and event streaming.',
      archetype: 'general',
    };
  }

  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const last = sorted[sorted.length - 1];
  const lastTime = new Date(last.occurredAt).getTime();
  const inactiveHours = Math.max(0, Math.round(Math.abs(Date.now() - lastTime) / 3600000));
  const isAttemptWithoutCompletion = /attempt|try|start|init|request|pending/i.test(last.name);
  const isStalled = inactiveHours >= 1 || isAttemptWithoutCompletion;

  const classified = sorted.map((e) => ({ event: e, ...classifyEvent(e) }));
  const failureEvent = classified.slice().reverse().find((c) => c.isFailure);
  const milestoneEvent = classified.slice().reverse().find((c) => c.isMilestone);
  const creationEvent = classified.slice().reverse().find((c) => c.category === 'creation');
  const browsingEvents = classified.filter((c) => c.isBrowsing);

  const lastClassified = classified[classified.length - 1];
  const lastReadable = getReadableEventName(last.name);

  // 1. Friction / Failure encountered:
  if (failureEvent) {
    const errorProp =
      failureEvent.event.properties?.errorCode ??
      failureEvent.event.properties?.errorMessage ??
      failureEvent.event.properties?.error ??
      'Operation failed';

    return {
      stage: 'friction',
      stageLabel: `${getReadableEventName(failureEvent.event.name)} Error`,
      isBroke: true,
      brokeAt: `${getReadableEventName(failureEvent.event.name)} failed (${errorProp})`,
      summary: `User encountered friction at "${getReadableEventName(failureEvent.event.name)}": ${errorProp}. Last recorded action: ${formatRelativeTime(last.occurredAt)}.`,
      progressPercent: Math.max(20, Math.min(80, Math.round((events.length / 8) * 100))),
      recommendation: `Check error logs for "${errorProp}" or reach out to assist with ${getReadableEventName(failureEvent.event.name)}.`,
      archetype: 'friction_stalled',
    };
  }

  // 2. Conversion / Milestone achieved:
  if (milestoneEvent) {
    return {
      stage: 'milestone',
      stageLabel: getReadableEventName(milestoneEvent.event.name),
      isBroke: false,
      brokeAt: null,
      summary: `User achieved milestone "${getReadableEventName(milestoneEvent.event.name)}" ${formatRelativeTime(milestoneEvent.event.occurredAt)}.`,
      progressPercent: 100,
      recommendation: `User is highly engaged. Encourage team sharing or expansion.`,
      archetype: 'converted',
    };
  }

  // 3. Casual Browsing / Scrolling on app (e.g. users who just scroll on feeds, explore content, or search):
  if (browsingEvents.length >= Math.ceil(events.length * 0.6)) {
    return {
      stage: 'exploration',
      stageLabel: 'Content Browsing',
      isBroke: isStalled,
      brokeAt: isStalled ? `Stopped browsing after ${lastReadable}` : null,
      summary: isStalled
        ? `User engaged in casual browsing (${events.length} actions recorded, e.g. ${lastReadable}) and left ${formatRelativeTime(last.occurredAt)}.`
        : `User is actively browsing content (${lastReadable}).`,
      progressPercent: Math.min(60, events.length * 10),
      recommendation: `Surface relevant content or call-to-action aligned with what they viewed.`,
      archetype: 'explorer',
    };
  }

  // 4. Creation / Setup in progress:
  if (creationEvent) {
    return {
      stage: 'creation',
      stageLabel: getReadableEventName(creationEvent.event.name),
      isBroke: isStalled,
      brokeAt: isStalled ? `Halted after ${lastReadable}` : null,
      summary: isStalled
        ? `User performed "${getReadableEventName(creationEvent.event.name)}" but halted after "${lastReadable}" ${formatRelativeTime(last.occurredAt)}.`
        : `User is actively configuring setup (${lastReadable}).`,
      progressPercent: Math.min(70, Math.max(30, events.length * 15)),
      recommendation: `Prompt the next milestone action following ${lastReadable}.`,
      archetype: 'creator',
    };
  }

  // 5. General interaction flow:
  return {
    stage: 'general',
    stageLabel: lastReadable,
    isBroke: isStalled,
    brokeAt: isStalled ? `Inactive after ${lastReadable}` : null,
    summary: `User performed ${events.length} interaction${events.length === 1 ? '' : 's'}. Last recorded action was "${lastReadable}" ${formatRelativeTime(last.occurredAt)}.`,
    progressPercent: Math.min(50, events.length * 10),
    recommendation: `Monitor user activity or trigger onboarding assistance.`,
    archetype: isStalled ? 'friction_stalled' : 'general',
  };
}

/**
 * Computes dwell time, peak active window, repeat feature affinity ("loved this"),
 * and synthesizes a human behavioral story for the user.
 */
export function computeUserActivitySummary(
  events: ActivationEvent[],
  userId?: string
): UserActivitySummary {
  if (!events || events.length === 0) {
    return {
      totalTimeSpent: 'No active time recorded',
      activeTimeWindow: 'N/A',
      lovedFeature: 'None recorded',
      lovedItems: [],
      executiveStory: 'No user activity recorded yet.',
    };
  }

  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const cleanUser = (userId || 'User').replace(/^(user_|usr_)/, '');

  // 1. Time Spent calculation (grouping by sessions separated by >= 90 mins inactivity)
  let totalActiveMs = 0;
  let sessionStart = new Date(sorted[0].occurredAt).getTime();
  let sessionEnd = sessionStart;

  const sessions: Array<{ start: Date; end: Date; count: number }> = [];

  for (let i = 1; i < sorted.length; i++) {
    const t = new Date(sorted[i].occurredAt).getTime();
    if (t - sessionEnd > 90 * 60 * 1000) {
      const dur = Math.max(60 * 1000, sessionEnd - sessionStart);
      totalActiveMs += dur;
      sessions.push({ start: new Date(sessionStart), end: new Date(sessionEnd), count: 1 });
      sessionStart = t;
      sessionEnd = t;
    } else {
      sessionEnd = t;
    }
  }
  const finalDur = Math.max(sorted.length > 1 ? 60 * 1000 : 0, sessionEnd - sessionStart);
  totalActiveMs += finalDur;
  sessions.push({ start: new Date(sessionStart), end: new Date(sessionEnd), count: 1 });

  // Format Total Time Spent
  let totalTimeSpent = '< 1 min';
  if (totalActiveMs >= 3600 * 1000) {
    const hours = Math.floor(totalActiveMs / (3600 * 1000));
    const mins = Math.round((totalActiveMs % (3600 * 1000)) / (60 * 1000));
    totalTimeSpent = mins > 0 ? `~${hours}h ${mins}m` : `~${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (totalActiveMs >= 60 * 1000) {
    const mins = Math.max(1, Math.round(totalActiveMs / (60 * 1000)));
    totalTimeSpent = `~${mins} minute${mins === 1 ? '' : 's'}`;
  } else if (sorted.length > 1) {
    totalTimeSpent = '~1 minute';
  }

  // 2. Active Time Window of most recent session
  const latestSession = sessions[sessions.length - 1];
  let activeTimeWindow = 'recently';
  if (latestSession && !isNaN(latestSession.start.getTime()) && !isNaN(latestSession.end.getTime())) {
    try {
      const startClock = formatClockTime(latestSession.start.toISOString());
      const endClock = formatClockTime(latestSession.end.toISOString());
      activeTimeWindow =
        startClock === endClock ? `around ${startClock}` : `around ${startClock} – ${endClock}`;
    } catch {
      activeTimeWindow = 'recently';
    }
  }

  // 3. Affinity & "What they loved" calculation
  const itemCounts = new Map<string, { label: string; count: number; category: LovedItem['category'] }>();

  function registerItem(label: string, category: LovedItem['category']) {
    if (!label || label.trim().length === 0) return;
    const clean = label.trim();
    const key = `${category}:${clean.toLowerCase()}`;
    const existing = itemCounts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      itemCounts.set(key, { label: clean, count: 1, category });
    }
  }

  for (const evt of sorted) {
    const props = (evt.properties ?? {}) as Record<string, unknown>;

    // Topics, articles, and content
    if (props.topic) registerItem(String(props.topic), 'topic');
    if (props.category) registerItem(String(props.category), 'topic');
    if (props.title) registerItem(String(props.title), 'topic');
    if (props.article) registerItem(String(props.article), 'topic');
    if (props.product) registerItem(String(props.product), 'product');
    if (props.item) registerItem(String(props.item), 'product');

    // Integrations / Providers / Tech Stack
    if (props.provider) registerItem(`${props.provider} Integration`, 'feature');
    if (props.feature) registerItem(String(props.feature), 'feature');

    // Searches
    if (props.query || props.searchQuery) {
      registerItem(`Search: "${props.query || props.searchQuery}"`, 'action');
    }

    // Repeated action events
    const readable = getReadableEventName(evt.name);
    if (/(?:scrolled|read|viewed|created|search|connect|editor|dashboard|page)/i.test(readable)) {
      registerItem(readable, 'action');
    }
  }

  const lovedItems: LovedItem[] = Array.from(itemCounts.values()).sort((a, b) => b.count - a.count);

  // Determine top loved feature / highlight
  let lovedFeature = '';
  const topRepeated = lovedItems.find((item) => item.count >= 2);
  const topTopic = lovedItems.find((item) => item.category === 'topic' || item.category === 'product');
  const topFeature = lovedItems.find((item) => item.category === 'feature');

  if (topRepeated) {
    const verb = topRepeated.category === 'topic' ? 'viewed' : topRepeated.category === 'action' ? 'used' : 'engaged';
    lovedFeature = `Loved: "${topRepeated.label}" (${verb} ${topRepeated.count}x)`;
  } else if (topTopic) {
    lovedFeature = `Loved exploring "${topTopic.label}"`;
  } else if (topFeature) {
    lovedFeature = `Loved the ${topFeature.label}`;
  } else if (lovedItems.length > 0) {
    lovedFeature = `Engaged with ${lovedItems[0].label}`;
  } else {
    lovedFeature = `Engaged with app features`;
  }

  // 4. Executive Behavioral Story Synthesis
  const lastAction = extractLastRecordedAction(sorted);
  const diagnosis = diagnoseOnboarding(sorted);

  let statusPhrase = '';
  if (diagnosis.isBroke && diagnosis.brokeAt) {
    statusPhrase = `, but session stalled during "${lastAction?.readableName ?? 'setup'}" (${diagnosis.brokeAt})`;
  } else if (diagnosis.archetype === 'converted') {
    statusPhrase = `, and successfully completed milestone "${diagnosis.stageLabel}"`;
  } else if (diagnosis.archetype === 'explorer') {
    statusPhrase = `. Last action recorded was "${lastAction?.readableName ?? 'browsing'}" before leaving`;
  } else {
    statusPhrase = `. Last recorded action: "${lastAction?.readableName ?? 'action'}"`;
  }

  const lovedStoryPart = topRepeated
    ? `Loved "${topRepeated.label}" (viewed ${topRepeated.count} times)`
    : topTopic
    ? `Loved exploring "${topTopic.label}"`
    : topFeature
    ? `Loved ${topFeature.label}`
    : `Explored ${lovedItems[0]?.label || 'key features'}`;

  const executiveStory = `User "${userId || 'user'}" spent ${totalTimeSpent} active ${activeTimeWindow}. ${cleanUser} ${lovedStoryPart.toLowerCase().startsWith('loved') ? lovedStoryPart : `loved ${lovedStoryPart}`}${statusPhrase}.`;

  return {
    totalTimeSpent,
    activeTimeWindow,
    lovedFeature,
    lovedItems: lovedItems.slice(0, 5),
    executiveStory,
  };
}

/**
 * Universal Customer Memory Capsule synthesis.
 * Captures what the team should remember about this specific user across ANY organization domain.
 */
export function buildCustomerMemoryCapsule(
  userId: string,
  events: ActivationEvent[],
  existingNotes?: string
): CustomerMemoryCapsule {
  const diagnosis = diagnoseOnboarding(events);
  const lastAction = extractLastRecordedAction(events);
  const activitySummary = computeUserActivitySummary(events, userId);

  // Extract explicit or implicit intent / goals
  let statedGoal = '';
  events.forEach((e) => {
    const p = (e.properties ?? {}) as Record<string, unknown>;
    if (p.goal || p.intent || p.objective) {
      statedGoal = String(p.goal || p.intent || p.objective);
    } else if (!statedGoal && (p.query || p.searchQuery || p.search)) {
      statedGoal = `Interested in searching for "${p.query || p.searchQuery || p.search}"`;
    }
  });

  // Extract tech stack, tools, and platforms dynamically
  const techStack = new Set<string>();
  events.forEach((e) => {
    const p = (e.properties ?? {}) as Record<string, unknown>;
    ['provider', 'repo', 'repository', 'platform', 'framework', 'language', 'stack', 'os', 'browser'].forEach(
      (key) => {
        if (p[key] && typeof p[key] === 'string') {
          techStack.add(String(p[key]));
        }
      }
    );
  });

  // Extract interests (content, categories, viewed pages, products)
  const interests = new Set<string>();
  events.forEach((e) => {
    const p = (e.properties ?? {}) as Record<string, unknown>;
    ['category', 'topic', 'product', 'item', 'title', 'article', 'video', 'page'].forEach((key) => {
      if (p[key] && typeof p[key] === 'string') {
        interests.add(String(p[key]));
      }
    });
  });

  // Collect friction points
  const frictionPoints: string[] = [];
  events.forEach((e) => {
    const { isFailure } = classifyEvent(e);
    if (isFailure) {
      const p = (e.properties ?? {}) as Record<string, unknown>;
      const err = p.errorMessage || p.errorCode || p.error || p.failureReason || e.name;
      frictionPoints.push(`${getReadableEventName(e.name)}: ${err}`);
    }
  });
  if (diagnosis.isBroke && diagnosis.brokeAt && !frictionPoints.length) {
    frictionPoints.push(diagnosis.brokeAt);
  }

  // Key bulleted context notes for the team
  const contextNotes: string[] = [];
  contextNotes.push(`Active time: ${activitySummary.totalTimeSpent} (${activitySummary.activeTimeWindow})`);
  contextNotes.push(`Affinity: ${activitySummary.lovedFeature}`);
  if (statedGoal) {
    contextNotes.push(`Intent: ${statedGoal}`);
  }
  if (interests.size > 0) {
    contextNotes.push(`Interests / Viewed: ${Array.from(interests).slice(0, 4).join(', ')}`);
  }
  if (techStack.size > 0) {
    contextNotes.push(`Stack & Tools: ${Array.from(techStack).join(', ')}`);
  }
  if (lastAction) {
    contextNotes.push(`Last recorded action: ${lastAction.readableName} (${lastAction.relativeTime})`);
  }
  if (diagnosis.isBroke) {
    contextNotes.push(`Roadblock: ${diagnosis.brokeAt}`);
  } else {
    contextNotes.push(`Status: ${diagnosis.stageLabel} (${diagnosis.progressPercent}% milestone progression)`);
  }

  // Human executive summary
  const summary = activitySummary.executiveStory;

  return {
    title: diagnosis.isBroke
      ? `Friction: ${diagnosis.brokeAt ?? diagnosis.stageLabel}`
      : `${diagnosis.stageLabel} (${userId})`,
    summary,
    intent: statedGoal || (diagnosis.archetype === 'explorer' ? 'Explore & browse application content' : 'Evaluate product capabilities'),
    techStack: Array.from(techStack),
    interests: Array.from(interests),
    frictionPoints,
    contextNotes,
    suggestedAction: diagnosis.recommendation,
    archetype: diagnosis.archetype,
    founderNotes: existingNotes,
    lastUpdated: lastAction?.occurredAt ?? new Date().toISOString(),
    activitySummary,
  };
}
