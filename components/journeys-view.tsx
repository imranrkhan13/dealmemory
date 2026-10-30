'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Brain,
  Search,
  AlertTriangle,
  ArrowRight,
  Clock3,
  Sparkles,
  Activity,
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
        if (journeysResponse.status === 401 || journeysResponse.status === 403) {
          throw new Error(journeysData?.error || 'Authentication required');
        }
        setJourneys([]);
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
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    }
    if (state === 'activated' || diagnosis?.stage === 'first_value') {
      return {
        label: 'First Value Reached',
        color: 'text-sky-700 bg-sky-50 border-sky-200',
        dot: 'bg-sky-500',
      };
    }
    if (blocker || diagnosis?.isBroke || state === 'stuck') {
      return {
        label: diagnosis?.brokeAt ?? 'Onboarding Friction',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        dot: 'bg-rose-500',
      };
    }
    return {
      label: diagnosis?.stageLabel ?? state.replace(/_/g, ' '),
      color: 'text-slate-600 bg-slate-100 border-slate-200',
      dot: 'bg-slate-400',
    };
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow">
              <Brain size={13} /> Customer Memory &amp; Timelines
            </span>
            <span className="text-xs font-mono text-slate-400">User-Specific Context</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Customer Journeys
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            See the exact sequence of actions each user took, where onboarding broke, and what context your team should remember.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="btn btn-outline text-xs py-2 px-3.5 inline-flex items-center gap-1.5 bg-white shadow-2xs hover:border-sky-300"
          >
            {simulating ? (
              <RefreshCw size={12} className="animate-spin text-sky-600" />
            ) : (
              <Sparkles size={12} className="text-sky-600" />
            )}
            <span>{simulating ? 'Simulating…' : 'Simulate Onboarding'}</span>
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-4 py-2 shadow-2xs">
            <Activity size={14} className="text-sky-600" />
            <span className="text-xs font-semibold text-slate-700 tabular-nums">
              {journeys.length} customer profile{journeys.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Pills */}
      <div className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user ID, last action, blocker, or team memory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full !pl-10 !pr-4 !py-2 text-xs !bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(['all', 'stuck', 'activated', 'paid'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterState(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition capitalize ${
                filterState === filter
                  ? 'bg-sky-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-slate-200'
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
        <div className="py-20 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          Reconstructing user timelines and customer memory…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => void loadJourneys()}
            className="text-xs font-semibold text-rose-800 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && journeys.length === 0 && (
        <div className="rounded-2xl border border-sky-100 bg-white p-12 text-center shadow-sm">
          <Brain size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-900 text-base">No customer timelines observed yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
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
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="space-y-4">
                  {/* Top Status Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                      <span className="truncate max-w-[180px]">{badge.label}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Clock3 size={11} /> {journey.inactiveHours}h ago
                    </span>
                  </div>

                  {/* User Identity */}
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                      {journey.userId}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {journey.events.length} milestone step{journey.events.length === 1 ? '' : 's'} recorded
                    </p>
                  </div>

                  {/* LAST RECORDED ACTION (Highlighted) */}
                  {last && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                      <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider uppercase text-slate-400 font-mono">
                        <span>Last Recorded Action</span>
                        <span className="text-slate-500 font-normal">{last.relativeTime}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            last.isFailure ? 'bg-rose-500' : 'bg-sky-500'
                          }`}
                        />
                        <p className="font-semibold text-xs text-slate-900 truncate">
                          {last.readableName}
                        </p>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 leading-snug line-clamp-1">
                        {last.narrative}
                      </p>
                    </div>
                  )}

                  {/* WHERE ONBOARDING BROKE (if stalled / error) */}
                  {diagnosis?.isBroke && diagnosis.brokeAt && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-800">
                      <div className="flex items-center gap-1.5 font-bold text-rose-700">
                        <AlertTriangle size={13} />
                        <span>Where Onboarding Broke</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-rose-900 font-medium">
                        {diagnosis.brokeAt}
                      </p>
                    </div>
                  )}

                  {/* CONTEXT THE TEAM SHOULD REMEMBER */}
                  {memory && (
                    <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/50 to-white p-3 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-sky-800 font-bold text-[11px] font-mono uppercase tracking-wider">
                        <Brain size={12} className="text-sky-600" />
                        <span>Context to Remember</span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-relaxed line-clamp-2">
                        {memory.summary}
                      </p>
                      {memory.activitySummary && (
                        <div className="flex flex-wrap gap-1 pt-1 text-[10px] font-mono text-slate-600">
                          <span className="rounded bg-sky-50 border border-sky-200/60 px-1.5 py-0.5 font-medium text-sky-800">
                            🕒 {memory.activitySummary.totalTimeSpent}
                          </span>
                          <span className="rounded bg-sky-50 border border-sky-200/60 px-1.5 py-0.5 font-medium text-sky-800">
                            ❤️ {memory.activitySummary.lovedFeature}
                          </span>
                        </div>
                      )}
                      {((memory.techStack && memory.techStack.length > 0) || (memory.interests && memory.interests.length > 0)) && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {memory.techStack?.map((tech) => (
                            <span
                              key={tech}
                              className="rounded bg-white border border-sky-200/80 px-1.5 py-0.5 text-[10px] font-mono text-sky-800 font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                          {memory.interests?.map((interest) => (
                            <span
                              key={interest}
                              className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-700 font-medium"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Card Footer */}
                <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-medium text-slate-500 group-hover:text-sky-700 transition-colors">
                  <span>Replay complete timeline</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
