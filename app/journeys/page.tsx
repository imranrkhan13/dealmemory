'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';
import { Brain, Search, AlertTriangle, CheckCircle2, ArrowRight, Clock3, Sparkles, User, Zap } from 'lucide-react';

type Journey = {
  userId: string;
  events: { id: string; name?: string }[];
  state: string;
  blocker?: string;
  recommendation?: string;
  inactiveHours: number;
};

export default function JourneysPage() {
  return (
    <AppShell>
      <ProjectGate>
        <JourneysView />
      </ProjectGate>
    </AppShell>
  );
}

function JourneysView() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'activated' | 'stuck' | 'paid'>('all');

  useEffect(() => {
    async function load() {
      try {
        const projectsResponse = await fetch('/api/projects', { cache: 'no-store' });
        const projectsData = await projectsResponse.json();
        const project = Array.isArray(projectsData?.projects) ? projectsData.projects[0] : null;
        if (!project?.id) {
          setJourneys([]);
          return;
        }
        setProjectId(project.id);

        const journeysResponse = await fetch(`/api/v1/journeys?projectId=${encodeURIComponent(project.id)}`, { cache: 'no-store' });
        const journeysData = await journeysResponse.json();
        if (!journeysResponse.ok) throw new Error(journeysData?.error ?? 'Could not load journeys');
        setJourneys(Array.isArray(journeysData?.journeys) ? journeysData.journeys : []);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Could not load journeys');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const filteredJourneys = useMemo(() => {
    return journeys.filter((j) => {
      const matchesSearch =
        search === '' ||
        j.userId.toLowerCase().includes(search.toLowerCase()) ||
        (j.blocker && j.blocker.toLowerCase().includes(search.toLowerCase())) ||
        (j.recommendation && j.recommendation.toLowerCase().includes(search.toLowerCase()));

      let matchesFilter = true;
      if (filterState === 'activated') matchesFilter = ['activated', 'first_value_reached'].includes(j.state);
      else if (filterState === 'stuck') matchesFilter = j.state === 'stuck' || Boolean(j.blocker);
      else if (filterState === 'paid') matchesFilter = j.state === 'paid';

      return matchesSearch && matchesFilter;
    });
  }, [journeys, search, filterState]);

  const stateBadge = (state: string, blocker?: string) => {
    if (state === 'paid') {
      return {
        label: 'Paid Account',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        dot: 'bg-emerald-400',
      };
    }
    if (state === 'activated') {
      return {
        label: 'Value Reached',
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        dot: 'bg-indigo-400',
      };
    }
    if (blocker || state === 'stuck') {
      return {
        label: 'Blocker Detected',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        dot: 'bg-rose-400',
      };
    }
    return {
      label: state.replace(/_/g, ' '),
      color: 'text-zinc-400 bg-zinc-800/60 border-white/[0.06]',
      dot: 'bg-zinc-400',
    };
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow">
              <Brain size={13} /> Activation Memory
            </span>
            <span className="text-xs font-mono text-zinc-500">Autonomous Synthesis</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Customer Journeys
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Understand where trial accounts activate, identify setup drop-offs, and inspect user memory graphs.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-900/60 px-4 py-2 backdrop-blur self-start sm:self-auto">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-xs font-semibold text-zinc-300 tabular-nums">
            {journeys.length} total journeys
          </span>
        </div>
      </div>

      {/* Search & Filter Pills */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-4 shadow-xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by user ID, blocker, or recommended action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full !pl-10 !pr-4 !py-2 text-xs !bg-zinc-950/70 border border-white/[0.08] rounded-xl text-white placeholder-zinc-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(['all', 'stuck', 'activated', 'paid'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterState(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition capitalize ${
                filterState === filter
                  ? 'bg-white text-zinc-950 font-semibold'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {filter === 'all' ? 'All Journeys' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="py-20 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Synthesizing customer journeys…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && journeys.length === 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-12 text-center">
          <Brain size={36} className="mx-auto text-zinc-600 mb-3" />
          <h3 className="font-semibold text-white text-base">No activation journeys observed yet</h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto">
            Once users send actions through the SDK, DealMemory will map out their progression, detect drop-off friction, and present live recommendations.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/sdk" className="btn btn-primary text-xs">
              Install SDK snippet
            </Link>
            <Link href="/demo" className="btn text-xs">
              View sample demo
            </Link>
          </div>
        </div>
      )}

      {/* Journeys Grid */}
      {!loading && !error && filteredJourneys.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJourneys.map((journey) => {
            const badge = stateBadge(journey.state, journey.blocker);

            return (
              <Link
                key={journey.userId}
                href={`/journeys/${encodeURIComponent(journey.userId)}${
                  projectId ? `?projectId=${encodeURIComponent(projectId)}` : ''
                }`}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl transition hover:border-white/[0.18] hover:translate-y-[-2px] hover:shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-500">
                      <Clock3 size={11} /> {journey.inactiveHours}h inactive
                    </span>
                  </div>

                  <h3 className="mt-4 font-semibold text-base text-white group-hover:text-indigo-300 transition-colors truncate">
                    {journey.userId}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 font-mono">
                    {journey.events.length} observed milestone{journey.events.length === 1 ? '' : 's'}
                  </p>

                  {/* Blocker alert if present */}
                  {journey.blocker && (
                    <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
                      <div className="flex items-center gap-1.5 font-semibold text-rose-400">
                        <AlertTriangle size={12} /> Blocker detected
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-rose-200/90">{journey.blocker}</p>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className="mt-4 rounded-xl border border-white/[0.04] bg-zinc-950/60 p-3 text-xs">
                    <span className="font-semibold text-indigo-400">Next Action: </span>
                    <span className="text-zinc-300">
                      {journey.recommendation || 'User reached first value. Prompt annual billing upgrade.'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/[0.04] text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">
                  <span>Replay journey timeline</span>
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
