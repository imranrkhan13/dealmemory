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
  Clock3,
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
};

type CustomerMemory = {
  title: string;
  summary: string;
  intent: string;
  techStack: string[];
  frictionPoints: string[];
  contextNotes: string[];
  suggestedAction: string;
  founderNotes?: string;
  lastUpdated: string;
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

  // Outreach message template tailored to where onboarding broke
  const outreachTemplate = `Hi ${userId.replace(/^user_/, '')},

I noticed you created a project in our workspace but ran into an issue connecting ${
    memory?.techStack.find((t) => t.toLowerCase().includes('git')) || 'your integration'
  } (${last?.readableName ?? 'integration step'}).

Did you hit an organization permission roadblock? Happy to jump on a quick call or send direct setup instructions to get you unblocked.`;

  return (
    <AppShell>
      <ProjectGate>
        <main className="space-y-6 max-w-6xl mx-auto pb-16">
          <Link
            href="/journeys"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-sky-700 transition-colors"
          >
            <ArrowLeft size={13} /> Back to all customer journeys
          </Link>

          {loading && (
            <div className="py-24 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
              Reconstructing timeline and synthesizing team memory…
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              <p>{error}</p>
              <Link className="btn btn-primary mt-4 text-xs" href="/journeys">
                Return to journeys
              </Link>
            </div>
          )}

          {!loading && journey && (
            <div className="space-y-6">
              {/* User Profile Header */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-lg shadow-sm">
                      {userId.replace(/^(user_|usr_)/, '')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                          {userId}
                        </h1>
                        <button
                          onClick={copyUserId}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 hover:text-slate-800 transition shadow-2xs"
                          title="Copy User ID"
                        >
                          {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        {timeline.length} sequential action{timeline.length === 1 ? '' : 's'} observed · Last active {last?.relativeTime ?? `${journey.inactiveHours}h ago`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        journey.state === 'paid'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : journey.state === 'activated'
                          ? 'bg-sky-50 border-sky-200 text-sky-700'
                          : isBroke
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          journey.state === 'paid'
                            ? 'bg-emerald-500'
                            : journey.state === 'activated'
                            ? 'bg-sky-500'
                            : isBroke
                            ? 'bg-rose-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      {diagnosis?.stageLabel ?? journey.state.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700">Onboarding Progression:</span>
                    <div className="w-36 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isBroke ? 'bg-rose-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${diagnosis?.progressPercent ?? 30}%` }}
                      />
                    </div>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {diagnosis?.progressPercent ?? 30}%
                    </span>
                  </div>

                  {last && (
                    <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5">
                      <span className="text-slate-400">Last action:</span>
                      <span className="font-semibold text-slate-800">{last.readableName}</span>
                      <span>({last.relativeTime})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* WHERE ONBOARDING BROKE BANNER */}
              {isBroke && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                      <AlertTriangle size={16} className="text-rose-600" />
                      <span>Where Onboarding Broke</span>
                    </div>
                    <span className="rounded bg-rose-100/90 text-rose-800 font-mono text-[10px] px-2 py-0.5 font-bold uppercase">
                      Action Required
                    </span>
                  </div>

                  <p className="text-xs text-rose-900 leading-relaxed">
                    {diagnosis?.summary ??
                      `User reached "${last?.readableName}" and stopped without completing the next milestone.`}
                  </p>

                  <div className="rounded-xl border border-rose-200 bg-white/90 p-3 text-xs flex items-start gap-2.5">
                    <span className="font-bold text-rose-700 shrink-0 font-mono text-[11px]">
                      FOUNDER INTERVENTION:
                    </span>
                    <span className="text-slate-700">
                      {diagnosis?.recommendation ??
                        'Reach out with direct integration setup guide or check organization OAuth permissions.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Main Content Grid: Left (Timeline Sequence) & Right (Customer Memory) */}
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                {/* LEFT: TIMELINE SEQUENCE */}
                <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="font-bold text-base text-slate-900">
                        Action Sequence Timeline
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Chronological progression showing every step this user took before stopping
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {timeline.length} step{timeline.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {timeline.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No chronological steps recorded.
                    </div>
                  ) : (
                    <ol className="relative ml-3 border-l-2 border-slate-200 space-y-7 pl-6 pt-2">
                      {timeline.map((step, idx) => {
                        const isLastAction = step.isLast;
                        const isFailure = step.isFailure;

                        return (
                          <li key={step.id} className="relative">
                            {/* Timeline Node Marker */}
                            <span
                              className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
                                isFailure
                                  ? 'bg-rose-500'
                                  : isLastAction
                                  ? 'bg-sky-600 animate-pulse'
                                  : step.isMilestone
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-400'
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            </span>

                            {/* Step Card */}
                            <div
                              className={`rounded-xl border p-4 transition-all ${
                                isLastAction
                                  ? 'border-sky-300 bg-sky-50/30 shadow-xs'
                                  : isFailure
                                  ? 'border-rose-200 bg-rose-50/30'
                                  : 'border-slate-100 bg-slate-50/60'
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] font-bold text-slate-400">
                                    0{idx + 1}
                                  </span>
                                  <h3 className="font-bold text-xs text-slate-900">
                                    {step.readableName}
                                  </h3>
                                  {isLastAction && (
                                    <span className="rounded bg-sky-100 text-sky-800 font-mono text-[9px] font-bold px-1.5 py-0.2">
                                      LAST RECORDED ACTION
                                    </span>
                                  )}
                                  {isFailure && (
                                    <span className="rounded bg-rose-100 text-rose-800 font-mono text-[9px] font-bold px-1.5 py-0.2">
                                      HALTED HERE
                                    </span>
                                  )}
                                </div>
                                <time className="text-[11px] font-mono text-slate-400">
                                  {step.formattedTime} ({step.relativeTime})
                                </time>
                              </div>

                              <p className="mt-2 text-xs text-slate-700 leading-relaxed">
                                {step.narrative}
                              </p>

                              {/* Properties Badges */}
                              {Object.keys(step.properties).length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                                  {Object.entries(step.properties).map(([k, v]) => (
                                    <span
                                      key={k}
                                      className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-600 shadow-2xs"
                                    >
                                      <span className="text-slate-400">{k}: </span>
                                      <span className="font-semibold text-sky-700">
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
                  <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 text-sky-700">
                      <Brain size={16} />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-mono">
                        Customer Memory Capsule
                      </h3>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {memory?.summary ?? 'Autonomous customer memory synthesized from user milestones.'}
                    </p>

                    {/* Stated Goal */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-1">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Stated Goal / Intent
                      </p>
                      <p className="text-xs text-slate-800 font-semibold">
                        {memory?.intent || 'Evaluate product activation'}
                      </p>
                    </div>

                    {/* Discovered Tech Stack */}
                    {memory && memory.techStack.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          Discovered Stack &amp; Tools
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {memory.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="rounded-lg bg-sky-50 border border-sky-200 px-2 py-1 text-xs font-mono font-medium text-sky-800"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Founder Notes (Saved to PostgreSQL) */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-xs font-mono uppercase tracking-wider">
                        <MessageSquare size={14} className="text-sky-600" />
                        <span>Team Context Notes</span>
                      </div>
                      {noteSaved && (
                        <span className="text-[10px] font-mono text-emerald-600 font-bold">
                          ✓ Saved to Postgres
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Persistent notes your team should remember about this specific customer.
                    </p>

                    <textarea
                      rows={3}
                      value={founderNote}
                      onChange={(e) => setFounderNote(e.target.value)}
                      placeholder="e.g. Discussed with Sarah on Slack; waiting for their VP Eng to approve GitHub OAuth permissions..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white transition"
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
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs font-mono uppercase tracking-wider">
                          <Send size={13} className="text-sky-600" />
                          <span>Founder Outreach Draft</span>
                        </div>
                        <button
                          onClick={() => copyEmailDraft(outreachTemplate)}
                          className="text-[10px] font-mono text-sky-600 hover:text-sky-700 font-semibold"
                        >
                          {copiedDraft ? '✓ Copied' : 'Copy Draft'}
                        </button>
                      </div>

                      <pre className="rounded-xl bg-slate-950 p-3 font-mono text-[10px] leading-relaxed text-slate-200 overflow-x-auto whitespace-pre-wrap">
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
