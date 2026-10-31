'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Brain,
  Search,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

type LastAction = {
  name: string;
  readableName: string;
  occurredAt: string;
  relativeTime: string;
  isFailure: boolean;
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
  interests?: string[];
  frictionPoints: string[];
  suggestedAction: string;
  archetype?: string;
  founderNotes?: string;
  activitySummary?: {
    totalTimeSpent: string;
    activeTimeWindow: string;
    lovedFeature: string;
  };
};

type Journey = {
  userId: string;
  events: { id: string; name?: string }[];
  state: string;
  blocker?: string;
  recommendation?: string;
  inactiveHours: number;
  lastAction?: LastAction;
  onboardingDiagnosis?: OnboardingDiagnosis;
  customerMemory?: CustomerMemory;
};

export default function JourneysView() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'stuck' | 'activated' | 'paid'>('all');

  const loadJourneys = useCallback(async () => {
    try {
      setLoading(true);
      const projectsResponse = await fetch('/api/projects', { cache: 'no-store' });
      const projectsData = await projectsResponse.json();
      const project = Array.isArray(projectsData?.projects) ? projectsData.projects[0] : null;
      if (!project?.id) {
        setJourneys([]);
        return;
      }
      setProjectId(project.id);

      const journeysResponse = await fetch(
        `/api/v1/journeys?projectId=${encodeURIComponent(project.id)}`,
        { cache: 'no-store' }
      );
      const journeysData = await journeysResponse.json();
      if (!journeysResponse.ok) {
        console.warn('Journeys request warning:', journeysResponse.status, journeysData);
        if (journeysResponse.status === 401) {
          throw new Error('Authentication required. Please sign in.');
        }
        if (journeysResponse.status === 403) {
          throw new Error('Access restricted to project owner.');
        }
        setJourneys([]);
        setError(null);
        return;
      }
      setJourneys(Array.isArray(journeysData?.journeys) ? journeysData.journeys : []);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load journeys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJourneys();
  }, [loadJourneys]);

  const handleSimulate = async () => {
    if (!projectId || simulating) return;
    try {
      setSimulating(true);
      const res = await fetch(`/api/v1/demo/simulate?projectId=${encodeURIComponent(projectId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await loadJourneys();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const filteredJourneys = useMemo(() => {
    return journeys.filter((j) => {
      const memoryText = j.customerMemory?.summary ?? '';
      const lastText = j.lastAction?.readableName ?? '';
      const matchesSearch =
        search === '' ||
        j.userId.toLowerCase().includes(search.toLowerCase()) ||
        (j.blocker && j.blocker.toLowerCase().includes(search.toLowerCase())) ||
        (j.recommendation && j.recommendation.toLowerCase().includes(search.toLowerCase())) ||
        memoryText.toLowerCase().includes(search.toLowerCase()) ||
        lastText.toLowerCase().includes(search.toLowerCase());

      let matchesFilter = true;
      if (filterState === 'activated') {
        matchesFilter = ['activated', 'first_value_reached'].includes(j.state);
      } else if (filterState === 'stuck') {
        matchesFilter = j.state === 'stuck' || Boolean(j.blocker) || Boolean(j.onboardingDiagnosis?.isBroke);
      } else if (filterState === 'paid') {
        matchesFilter = j.state === 'paid';
      }

      return matchesSearch && matchesFilter;
    });
  }, [journeys, search, filterState]);

  const stateBadge = (state: string, blocker?: string, diagnosis?: OnboardingDiagnosis) => {
    if (state === 'paid') {
      return {
        label: 'Paid Customer',
        color: 'text-success bg-success-tint border-success/40',
        dot: 'bg-success',
      };
    }
    if (state === 'activated' || diagnosis?.stage === 'first_value') {
      return {
        label: 'First Value Reached',
        color: 'text-accent bg-accent-tint border-line',
        dot: 'bg-accent',
      };
    }
    if (blocker || diagnosis?.isBroke || state === 'stuck') {
      return {
        label: diagnosis?.brokeAt ?? 'Onboarding Friction',
        color: 'text-danger bg-danger-tint border-danger/40',
        dot: 'bg-danger',
      };
    }
    return {
      label: diagnosis?.stageLabel ?? state.replace(/_/g, ' '),
      color: 'text-ink-soft bg-muted border-line',
      dot: 'bg-slate-400',
    };
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow">Customer memory &amp; timelines</span>
          <h1 className="mt-2 text-[28px] font-medium leading-tight tracking-[-0.025em] text-ink">
            Customer journeys
          </h1>
          <p className="mt-1 max-w-2xl text-[13px] text-ink-soft">
            See the exact sequence of actions each user took, where onboarding broke, and what context your team should remember.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="btn btn-outline text-xs py-2 px-3.5 inline-flex items-center gap-1.5 bg-white  hover:border-accent-line"
          >
            {simulating ? (
              <RefreshCw size={12} className="animate-spin text-accent" />
            ) : (
              <Sparkles size={12} className="text-accent" />
            )}
            <span>{simulating ? 'Simulating…' : 'Simulate Onboarding'}</span>
          </button>

          <div className="flex items-center gap-2 rounded-md border border-line bg-white px-2.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="font-mono text-[11px] text-ink-soft tabular-nums">
              {journeys.length} profile{journeys.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Pills */}
      <div className="flex flex-col gap-3 rounded-card border border-line bg-white p-4  sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            placeholder="Search by user ID, last action, blocker, or team memory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full !pl-10 !pr-4 !py-2 text-xs !bg-paper border border-line rounded-lg text-ink placeholder-slate-400 focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(['all', 'stuck', 'activated', 'paid'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterState(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                filterState === filter
                  ? 'bg-accent text-white font-semibold '
                  : 'bg-paper text-ink-soft hover:text-accent hover:bg-accent-tint border border-line'
              }`}
            >
              {filter === 'all'
                ? 'All Customers'
                : filter === 'stuck'
                ? 'Onboarding Friction'
                : filter === 'activated'
                ? 'Activated'
                : 'Paid'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="py-20 text-center text-xs text-ink-soft flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Reconstructing user timelines and customer memory…
        </div>
      )}

      {error && (
        <div className="rounded-card border border-danger/40 bg-danger-tint p-5 text-sm text-danger flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => void loadJourneys()}
            className="text-xs font-semibold text-danger underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && journeys.length === 0 && (
        <div className="rounded-card border border-line bg-white p-12 text-center ">
          <Brain size={36} className="mx-auto text-ink-faint mb-3" />
          <h3 className="font-medium text-[14px] text-ink">No customer timelines observed yet</h3>
          <p className="mt-1 text-xs text-ink-soft max-w-md mx-auto">
            Once real users perform actions, DealMemory will reconstruct their sequence as an interactive timeline, detect setup breakpoints, and synthesize context for your team.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={handleSimulate} className="btn btn-primary text-xs inline-flex items-center gap-1.5">
              <Sparkles size={13} />
              Simulate User Onboarding Sequence
            </button>
            <Link href="/docs" className="btn text-xs">
              Install SDK snippet
            </Link>
          </div>
        </div>
      )}

      {/* Journeys Grid - Each Card Shows Sequence, Last Action & Team Context */}
      {!loading && !error && filteredJourneys.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredJourneys.map((journey) => {
            const badge = stateBadge(journey.state, journey.blocker, journey.onboardingDiagnosis);
            const last = journey.lastAction;
            const diagnosis = journey.onboardingDiagnosis;
            const memory = journey.customerMemory;

            return (
              <Link
                key={journey.userId}
                href={`/journeys/${encodeURIComponent(journey.userId)}${
                  projectId ? `?projectId=${encodeURIComponent(projectId)}` : ''
                }`}
                className="group flex flex-col rounded-card border border-line bg-white transition-colors hover:border-line-strong"
              >
                {/* Status row */}
                <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
                  <span className="flex min-w-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.05em] text-ink-soft">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${badge.dot}`} />
                    <span className="truncate">{badge.label}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-ink-faint">
                    {journey.inactiveHours}h ago
                  </span>
                </div>

                <div className="flex-1 space-y-4 px-4 py-4">
                  {/* Identity */}
                  <div>
                    <h3 className="truncate text-[14px] font-medium text-ink transition-colors group-hover:text-accent">
                      {journey.userId}
                    </h3>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-ink-faint">
                      {journey.events.length} step{journey.events.length === 1 ? '' : 's'} recorded
                    </p>
                  </div>

                  {/* Last action */}
                  {last && (
                    <div className="border-l-2 border-line pl-3">
                      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.05em] text-ink-faint">
                        <span>Last action</span>
                        <span className="normal-case tracking-normal">{last.relativeTime}</span>
                      </div>
                      <p className="mt-1 flex items-center gap-2 truncate text-[13px] font-medium text-ink">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            last.isFailure ? 'bg-danger' : 'bg-accent'
                          }`}
                        />
                        <span className="truncate">{last.readableName}</span>
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-ink-soft">
                        {last.narrative}
                      </p>
                    </div>
                  )}

                  {/* Blocker */}
                  {diagnosis?.isBroke && diagnosis.brokeAt && (
                    <div className="border-l-2 border-danger/40 pl-3">
                      <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.05em] text-danger">
                        <AlertTriangle size={11} />
                        <span>Where onboarding broke</span>
                      </p>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-danger">{diagnosis.brokeAt}</p>
                    </div>
                  )}

                  {/* Remembered context */}
                  {memory && (
                    <div className="space-y-2 border-t border-line pt-3">
                      <p className="mono-label flex items-center gap-1.5">
                        <Brain size={11} /> Context to remember
                      </p>
                      <p className="line-clamp-2 text-[11.5px] leading-relaxed text-ink-soft">
                        {memory.summary}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {memory.activitySummary && (
                          <span className="tag-mono">{memory.activitySummary.totalTimeSpent}</span>
                        )}
                        {memory.activitySummary && (
                          <span className="tag-mono">{memory.activitySummary.lovedFeature}</span>
                        )}
                        {memory.techStack?.map((tech) => (
                          <span key={tech} className="tag-mono">
                            {tech}
                          </span>
                        ))}
                        {memory.interests?.map((interest) => (
                          <span key={interest} className="tag-mono">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[12px] text-ink-soft transition-colors group-hover:text-accent">
                  <span>Replay timeline</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
