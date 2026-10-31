'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';
import {
  Brain,
  ArrowLeft,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Layers,
  Sparkles,
  Send,
  MessageSquare,
  Save,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

type TimelineStep = {
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
};

type LastAction = {
  name: string;
  readableName: string;
  occurredAt: string;
  relativeTime: string;
  formattedTime: string;
  properties: Record<string, string | number | boolean | null>;
  isFailure: boolean;
  isMilestone: boolean;
  narrative: string;
};

type OnboardingDiagnosis = {
  stage: string;
  stageLabel: string;
  isBroke: boolean;
  brokeAt: string | null;
  summary: string;
  progressPercent: number;
  recommendation: string;
  archetype?: string;
};

type ActivitySummary = {
  totalTimeSpent: string;
  activeTimeWindow: string;
  lovedFeature: string;
  executiveStory: string;
};

type CustomerMemory = {
  title: string;
  summary: string;
  intent: string;
  techStack: string[];
  interests?: string[];
  frictionPoints: string[];
  contextNotes: string[];
  suggestedAction: string;
  archetype?: string;
  founderNotes?: string;
  lastUpdated: string;
  activitySummary?: ActivitySummary;
};

type Journey = {
  userId: string;
  email: string;
  goal?: string;
  state: string;
  blocker?: string;
  recommendation?: string;
  inactiveHours: number;
  lastAction?: LastAction;
  onboardingDiagnosis?: OnboardingDiagnosis;
  timeline?: TimelineStep[];
  customerMemory?: CustomerMemory;
  events: Array<{
    id: string;
    name: string;
    sessionId: string;
    occurredAt: string;
    properties: Record<string, string | number | boolean | null>;
  }>;
};

export default function JourneyPage() {
  const { userId } = useParams<{ userId: string }>();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [founderNote, setFounderNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
      const response = await fetch(`/api/v1/journeys/${encodeURIComponent(userId)}${query}`, {
        cache: 'no-store',
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error ?? 'Could not load customer timeline');

      const j = body.journey ?? body;
      setJourney(j);
      setFounderNote(j.customerMemory?.founderNotes ?? '');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load journey');
    } finally {
      setLoading(false);
    }
  }, [projectId, userId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveFounderNote = async () => {
    try {
      setSavingNote(true);
      const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
      const res = await fetch(`/api/v1/journeys/${encodeURIComponent(userId)}${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: founderNote }),
      });
      if (res.ok) {
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const copyEmailDraft = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2000);
    } catch {}
  };

  const diagnosis = journey?.onboardingDiagnosis;
  const last = journey?.lastAction;
  const memory = journey?.customerMemory;
  const timeline = journey?.timeline ?? [];

  const isBroke = diagnosis?.isBroke || Boolean(journey?.blocker);
  const cleanName = userId.replace(/^(user_|usr_)/, '');

  // Dynamic outreach message template tailored to user's real behavior across any domain
  const outreachTemplate = (() => {
    if (diagnosis?.archetype === 'explorer') {
      const topInterests = memory?.interests?.slice(0, 2).join(' and ');
      return `Hi ${cleanName},

I noticed you were exploring our app recently${topInterests ? ` and looking into ${topInterests}` : ''} (last action: ${last?.readableName ?? 'browsing'}).

Is there anything specific you are looking to find or achieve? Happy to share personalized recommendations or answer any questions!`;
    }

    if (isBroke) {
      return `Hi ${cleanName},

I saw you were working in our app but ran into an issue during "${last?.readableName ?? 'your setup'}" (${diagnosis?.brokeAt ?? 'friction encountered'}).

Would love to help get you unblocked—happy to take a look together or send direct instructions!`;
    }

    if (diagnosis?.archetype === 'creator') {
      return `Hi ${cleanName},

I saw you recently initiated "${last?.readableName ?? 'setup'}" in our app.

Let me know if you have any questions about next steps or if you'd like a quick 5-minute walkthrough!`;
    }

    return `Hi ${cleanName},

Thanks for trying out our app! I noticed your recent activity (${last?.readableName ?? 'session'}).

Would love to hear how your experience was so far and if you have any feedback or feature requests!`;
  })();

  return (
    <AppShell>
      <ProjectGate>
        <main className="space-y-6 max-w-6xl mx-auto pb-16">
          <Link
            href="/journeys"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-accent transition-colors"
          >
            <ArrowLeft size={13} /> Back to all customer journeys
          </Link>

          {loading && (
            <div className="py-24 text-center text-xs text-ink-soft flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              Reconstructing timeline and synthesizing team memory…
            </div>
          )}

          {error && (
            <div className="rounded-card border border-danger/40 bg-danger-tint p-6 text-sm text-danger">
              <p>{error}</p>
              <Link className="btn btn-primary mt-4 text-xs" href="/journeys">
                Return to journeys
              </Link>
            </div>
          )}

          {!loading && journey && (
            <div className="space-y-6">
              {/* User Profile Header */}
              <div className="rounded-card border border-line bg-white p-6  space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-card bg-ink text-white font-bold text-lg ">
                      {userId.replace(/^(user_|usr_)/, '')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h1 className="min-w-0 break-words text-[22px] font-medium leading-tight tracking-[-0.025em] text-ink sm:text-[26px]">
                          {userId}
                        </h1>
                        <button
                          onClick={copyUserId}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-white text-ink-faint hover:text-ink transition "
                          title="Copy User ID"
                        >
                          {copied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                        </button>
                      </div>
                      <p className="text-xs text-ink-soft mt-0.5 font-mono">
                        {timeline.length} sequential action{timeline.length === 1 ? '' : 's'} observed · Last active {last?.relativeTime ?? `${journey.inactiveHours}h ago`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.05em] ${
                        journey.state === 'paid'
                          ? 'text-success'
                          : journey.state === 'activated'
                          ? 'text-accent'
                          : isBroke
                          ? 'text-danger'
                          : 'text-ink-soft'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          journey.state === 'paid'
                            ? 'bg-success'
                            : journey.state === 'activated'
                            ? 'bg-accent'
                            : isBroke
                            ? 'bg-danger'
                            : 'bg-slate-400'
                        }`}
                      />
                      {diagnosis?.stageLabel ?? journey.state.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="border-t border-line pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-ink-faint">
                      Progress
                    </span>
                    <div className="h-1 w-24 overflow-hidden rounded-full bg-line sm:w-36">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${diagnosis?.progressPercent ?? 30}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-ink-soft">
                      {diagnosis?.progressPercent ?? 30}%
                    </span>
                  </div>

                  {last && (
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[11px] text-ink-soft">
                      <span className="text-ink-faint">Last action:</span>
                      <span className="font-semibold text-ink">{last.readableName}</span>
                      <span>({last.relativeTime})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* WHERE ONBOARDING BROKE BANNER */}
              {isBroke && (
                <div className="rounded-card border border-line border-l-2 border-l-danger bg-white p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-ink">
                      <AlertTriangle size={15} className="text-danger" />
                      <span>Where onboarding broke</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-danger">
                      Action required
                    </span>
                  </div>

                  <p className="text-[12px] leading-relaxed text-ink-soft">
                    {diagnosis?.summary ??
                      `User reached "${last?.readableName}" and stopped without completing the next milestone.`}
                  </p>

                  <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-paper p-3 text-xs sm:flex-row sm:items-start sm:gap-2.5">
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.05em] text-ink-faint">
                      Recommendation
                    </span>
                    <span className="text-ink-soft">
                      {diagnosis?.recommendation ??
                        'Reach out with direct integration setup guide or check organization OAuth permissions.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Main Content Grid: Left (Timeline Sequence) & Right (Customer Memory) */}
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                {/* LEFT: TIMELINE SEQUENCE */}
                <section className="rounded-card border border-line bg-white p-6  space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line pb-4">
                    <div className="min-w-0">
                      <h2 className="font-medium text-[14px] text-ink">
                        Action Sequence Timeline
                      </h2>
                      <p className="text-xs text-ink-soft mt-0.5">
                        Chronological progression showing every step this user took before stopping
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-mono text-ink-faint">
                      {timeline.length} step{timeline.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {timeline.length === 0 ? (
                    <div className="py-12 text-center text-xs text-ink-faint">
                      No chronological steps recorded.
                    </div>
                  ) : (
                    <ol className="relative ml-3 border-l-2 border-line space-y-7 pl-6 pt-2">
                      {timeline.map((step, idx) => {
                        const isLastAction = step.isLast;
                        const isFailure = step.isFailure;

                        return (
                          <li key={step.id} className="relative">
                            {/* Timeline Node Marker */}
                            <span
                              className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
                                isFailure
                                  ? 'bg-danger'
                                  : isLastAction
                                  ? 'bg-accent animate-pulse'
                                  : step.isMilestone
                                  ? 'bg-success'
                                  : 'bg-slate-400'
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            </span>

                            {/* Step Card */}
                            <div
                              className={`rounded-lg border bg-white p-4 transition-colors ${
                                isLastAction
                                  ? 'border-accent-line'
                                  : isFailure
                                  ? 'border-line border-l-2 border-l-danger'
                                  : 'border-line'
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] font-bold text-ink-faint">
                                    0{idx + 1}
                                  </span>
                                  <h3 className="font-medium text-[12px] text-ink">
                                    {step.readableName}
                                  </h3>
                                  {isLastAction && (
                                    <span className="tag-mono text-accent">Last action</span>
                                  )}
                                  {isFailure && (
                                    <span className="tag-mono text-danger">Halted here</span>
                                  )}
                                </div>
                                <time className="text-[11px] font-mono text-ink-faint">
                                  {step.formattedTime} ({step.relativeTime})
                                </time>
                              </div>

                              <p className="mt-2 text-xs text-ink-soft leading-relaxed">
                                {step.narrative}
                              </p>

                              {/* Properties Badges */}
                              {Object.keys(step.properties).length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-line">
                                  {Object.entries(step.properties).map(([k, v]) => (
                                    <span
                                      key={k}
                                      className="rounded bg-white border border-line px-2 py-0.5 text-[10px] font-mono text-ink-soft "
                                    >
                                      <span className="text-ink-faint">{k}: </span>
                                      <span className="font-semibold text-accent">
                                        {String(v)}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </section>

                {/* RIGHT: CUSTOMER MEMORY & TEAM CONTEXT */}
                <aside className="space-y-5">
                  {/* Customer Memory Capsule Card */}
                  <div className="rounded-card border border-line bg-white p-5  space-y-4">
                    <div className="flex items-center gap-2 border-b border-line pb-3 text-ink-soft">
                      <Brain size={14} />
                      <h3 className="mono-label">Customer memory</h3>
                    </div>

                    <p className="text-[12.5px] leading-relaxed text-ink-soft">
                      {memory?.summary ?? 'Autonomous customer memory synthesized from user milestones.'}
                    </p>

                    {/* Behavioral Dwell & Loved Highlights */}
                    {memory?.activitySummary && (
                      <div className="space-y-2 rounded-lg border border-line bg-paper p-3">
                        <p className="mono-label">Behavioral dwell &amp; affinity</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="tag-mono">{memory.activitySummary.totalTimeSpent} active</span>
                          <span className="tag-mono">{memory.activitySummary.activeTimeWindow}</span>
                          <span className="tag-mono text-accent">{memory.activitySummary.lovedFeature}</span>
                        </div>
                      </div>
                    )}

                    {/* Stated Goal */}
                    <div className="rounded-lg border border-line bg-paper p-3 space-y-1">
                      <p className="mono-label">Stated goal</p>
                      <p className="text-[12.5px] text-ink">
                        {memory?.intent || 'Evaluate product activation'}
                      </p>
                    </div>

                    {/* Discovered Tech Stack */}
                    {memory && memory.techStack.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="mono-label">Discovered stack</p>
                        <div className="flex flex-wrap gap-1.5">
                          {memory.techStack.map((tech) => (
                            <span key={tech} className="tag-mono">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Browsed Interests & Topics */}
                    {memory && memory.interests && memory.interests.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="mono-label">Browsed topics</p>
                        <div className="flex flex-wrap gap-1.5">
                          {memory.interests.map((interest) => (
                            <span key={interest} className="tag-mono">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Founder Notes (Saved to PostgreSQL) */}
                  <div className="rounded-card border border-line bg-white p-5  space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-ink font-medium text-[12px] font-mono uppercase tracking-wider">
                        <MessageSquare size={14} className="text-accent" />
                        <span>Team Context Notes</span>
                      </div>
                      {noteSaved && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-success font-bold">
                          <Check size={11} className="stroke-[2.5]" />
                          <span>Saved to Postgres</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-ink-soft">
                      Persistent notes your team should remember about this specific customer.
                    </p>

                    <textarea
                      rows={3}
                      value={founderNote}
                      onChange={(e) => setFounderNote(e.target.value)}
                      placeholder="e.g. Discussed with Sarah on Slack; waiting for their VP Eng to approve GitHub OAuth permissions..."
                      className="w-full text-xs p-3 rounded-lg border border-line bg-paper text-ink placeholder-slate-400 focus:border-accent focus:bg-white transition"
                    />

                    <button
                      onClick={saveFounderNote}
                      disabled={savingNote}
                      className="btn btn-primary text-xs py-1.5 px-3 w-full inline-flex items-center justify-center gap-1.5"
                    >
                      <Save size={12} />
                      <span>{savingNote ? 'Saving…' : 'Save Context Note'}</span>
                    </button>
                  </div>

                  {/* Ready-to-Send Founder Outreach Draft */}
                  {isBroke && (
                    <div className="rounded-card border border-line bg-white p-5  space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-ink font-medium text-[12px] font-mono uppercase tracking-wider">
                          <Send size={13} className="text-accent" />
                          <span>Founder Outreach Draft</span>
                        </div>
                        <button
                          onClick={() => copyEmailDraft(outreachTemplate)}
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-accent hover:text-accent font-semibold"
                        >
                          {copiedDraft ? (
                            <>
                              <Check size={11} className="text-success stroke-[2.5]" />
                              <span className="text-success">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy Draft</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="rounded-lg bg-ink p-3 font-mono text-[10px] leading-relaxed text-ink-faint overflow-x-auto whitespace-pre-wrap">
                        {outreachTemplate}
                      </pre>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          )}
        </main>
      </ProjectGate>
    </AppShell>
  );
}
