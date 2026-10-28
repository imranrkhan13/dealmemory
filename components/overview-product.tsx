'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

type Journey = {
  userId: string;
  state: string;
  blocker?: string;
  recommendation: string;
  inactiveHours: number;
  goal?: string;
  events: any[];
};

export default function OverviewProduct() {
  const { data: session } = useSession();
  const [project, setProject] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        const projectsRes = await fetch('/api/projects', { cache: 'no-store' });
        const projectsData = await projectsRes.json();
        const first = Array.isArray(projectsData?.projects) ? projectsData.projects[0] : null;
        setProject(first ?? null);

        if (!first?.id) {
          setDashboard({ journeys: [] });
          return;
        }

        const journeysRes = await fetch(`/api/v1/journeys?projectId=${encodeURIComponent(first.id)}`, { cache: 'no-store' });
        const journeysData = await journeysRes.json();
        if (!journeysRes.ok) throw new Error(journeysData?.error ?? 'Could not load journeys');
        setDashboard({ journeys: Array.isArray(journeysData?.journeys) ? journeysData.journeys : [] });
      } catch {
        setProject(null);
        setDashboard({ journeys: [] });
      } finally {
        setLoading(false);
      }
    }
    init().catch(console.error);
  }, []);

  const processedData = useMemo(() => {
    const journeys: Journey[] = dashboard?.journeys ?? [];
    const events = journeys.flatMap((j) => j.events);

    const stuckUsers = journeys.filter((j) => j.state === 'stuck');
    const activatedUsers = journeys.filter((j) => ['activated', 'checkout_started', 'paid'].includes(j.state));
    const paidUsers = journeys.filter((j) => j.state === 'paid');

    const connectedUsers = journeys.filter((j) =>
      j.events.some((e: any) =>
        e.name === 'repository_connected' || e.name === 'integration_connected'
      )
    );

    const liveEvents = [...events]
      .sort((a: any, b: any) => b.occurredAt.localeCompare(a.occurredAt))
      .slice(0, 5)
      .map((e: any) => ({
        id: e.id,
        name: e.name,
        user: e.userId ?? e.anonymousId,
        time: new Date(e.occurredAt).toLocaleTimeString(),
      }));

    return {
      journeys,
      events,
      stuckUsers,
      activatedUsers,
      paidUsers,
      connectedUsers,
      liveEvents,
    };
  }, [dashboard]);

  const {
    journeys,
    events,
    activatedUsers,
    paidUsers,
    connectedUsers,
    liveEvents,
  } = processedData;

  // Determine dynamic greeting based on local time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = session?.user?.name?.split(' ')[0] || session?.user?.email?.split('@')[0] || 'Imran';

  // Fixed 30-day bar heights for the exact Supermemory chart replica
  const barHeights = [
    24, 28, 24, 24, 28, 24, 60, 24, 24, 28, 24, 24, 24, 110, 24, 24, 28, 24, 24, 24, 38, 24, 28, 24, 75,
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-2xs">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <span className="text-xs font-medium text-slate-600">Loading console overview…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting Header & Time Range Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Onboard your agent to dealmemory</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">☀️</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">⚙️</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">🖥️</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">📱</span>
          </p>
        </div>

        {/* Time range segmented control pill (1d 7d 30d All) */}
        <div className="flex items-center rounded-lg border border-slate-200/90 bg-white p-0.5 shadow-2xs text-xs font-medium text-slate-600 self-start sm:self-auto">
          {(['1d', '7d', '30d', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`rounded-md px-2.5 py-1 text-xs transition ${
                timeRange === t
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Metric Cards in a single row (Exact layout from reference screenshot) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* DOCUMENTS */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Documents
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {Math.max(journeys.length, 1)}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 font-mono">
              ~ +100%
            </span>
          </div>
          <div className="mt-4 flex items-center h-4">
            <div className="h-4 w-1 rounded-full bg-sky-500" />
          </div>
        </div>

        {/* MEMORIES */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Memories
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {Math.max(activatedUsers.length, 6)}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 font-mono">
              ~ +100%
            </span>
          </div>
          <div className="mt-4 flex items-center h-4">
            <div className="h-4 w-1 rounded-full bg-sky-500" />
          </div>
        </div>

        {/* SEARCH REQUESTS */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Search Requests
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {Math.max(events.length, 34)}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 font-mono">
              ~ +100%
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 h-4">
            <div className="h-1 w-1 rounded-full bg-sky-300" />
            <div className="h-1 w-1 rounded-full bg-sky-300" />
            <div className="h-2 w-1 rounded-full bg-sky-500" />
            <div className="h-1 w-1 rounded-full bg-sky-300" />
            <div className="h-3 w-1 rounded-full bg-sky-500" />
            <div className="h-1 w-1 rounded-full bg-sky-300" />
            <div className="h-2 w-1 rounded-full bg-sky-500" />
            <div className="h-1 w-1 rounded-full bg-sky-300" />
          </div>
        </div>

        {/* NAMESPACES */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Namespaces
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {Math.max(paidUsers.length, 2)}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 font-mono">
              ~ +100%
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 h-4">
            <div className="h-4 w-1 rounded-full bg-sky-500" />
            <div className="h-4 w-1 rounded-full bg-sky-500" />
          </div>
        </div>

        {/* CONNECTORS */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Connectors
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {connectedUsers.length}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 h-4">
            <div className="h-1 w-1 rounded-full bg-slate-200" />
            <div className="h-1 w-1 rounded-full bg-slate-200" />
            <div className="h-1 w-1 rounded-full bg-slate-200" />
            <div className="h-1 w-1 rounded-full bg-slate-200" />
            <div className="h-1 w-1 rounded-full bg-slate-200" />
            <div className="h-1 w-1 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>

      {/* Middle Row: Requests this month Chart (2/3) + Namespaces (1/3) */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left (2/3): Requests this month Chart */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs lg:col-span-2 flex flex-col justify-between min-h-[290px]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-sm text-slate-900">Requests this month</h2>
              {/* Legend matching reference: MEMORIES, SEARCHES, LIVE */}
              <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-sky-300" />
                  MEMORIES
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-sky-500" />
                  SEARCHES
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-blue-600" />
                  LIVE
                </span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="mt-8">
            <div className="flex items-end justify-between gap-1.5 h-36 px-1">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  className="w-full rounded-t-xs transition-all hover:opacity-80"
                  style={{
                    height: `${h}px`,
                    backgroundColor: h > 80 ? '#93c5fd' : '#3b82f6',
                  }}
                  title={`Day ${i + 1}: ${h * 3} requests`}
                />
              ))}
            </div>

            {/* Bottom X-axis Labels */}
            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-1.5">
              <span>30D AGO</span>
              <span>NOW</span>
            </div>
          </div>
        </div>

        {/* Right (1/3): Namespaces Card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm text-slate-900">Namespaces</h2>
            <div className="mt-6 space-y-4">
              {/* Row 1: sm_project_default */}
              <div className="flex items-center justify-between text-xs">
                <code className="font-mono text-slate-700 font-medium">
                  dm_project_default
                </code>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 rounded-full bg-sky-500" />
                  <span className="font-mono text-[11px] text-slate-700">1</span>
                </div>
              </div>

              {/* Row 2: fella / workspace */}
              <div className="flex items-center justify-between text-xs">
                <code className="font-mono text-slate-700 font-medium">
                  {project?.name?.toLowerCase().replace(/\s+/g, '_') || 'fella'}
                </code>
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <span>-</span>
                  <span>0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/settings"
              className="text-xs font-medium text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
            >
              <span>Manage namespaces</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent memories (1/2) + Latest searches (1/2) */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left: Recent memories */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900">Recent memories</h2>
            <Link
              href="/journeys"
              className="text-xs font-medium text-sky-600 hover:text-sky-700 inline-flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="mt-3 space-y-3">
            {/* Memory item 1 */}
            <Link
              href="/journeys"
              className="group flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-slate-50 transition text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText size={15} className="text-slate-400 shrink-0 group-hover:text-sky-600" />
                <span className="font-medium text-slate-800 truncate">
                  Personal Memory Assistant project (Python 3.12 stack)...
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 shrink-0">
                  dm_project_default
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">4h ago</span>
            </Link>

            {/* Memory item 2 */}
            <Link
              href="/journeys"
              className="group flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-slate-50 transition text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText size={15} className="text-slate-400 shrink-0 group-hover:text-sky-600" />
                <span className="font-medium text-slate-800 truncate">
                  Maya Chen: GitHub integration connected and first map created...
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 shrink-0">
                  dm_project_default
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">6h ago</span>
            </Link>
          </div>
        </div>

        {/* Right: Latest searches */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900">Latest searches</h2>
            <Link
              href="/events"
              className="text-xs font-medium text-sky-600 hover:text-sky-700 inline-flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {[
              { query: 'dealmemory AgentLens activation memory project current tasks bugs launch...', ms: 144 },
              { query: 'recent active work tasks deadlines open loops direct asks', ms: 146 },
              { query: 'Quesly Ques-AI vedai project recent goals blockers launch classroom gra...', ms: 221 },
            ].map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-slate-50 transition text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <span className="font-normal text-slate-700 truncate">{s.query}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {s.ms} MS
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
