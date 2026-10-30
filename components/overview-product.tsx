'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  FileText,
  Search,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Layers,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface MetricState {
  documents: number;
  memories: number;
  searchRequests: number;
  namespaces: number;
  connectors: number;
}

interface ChartItem {
  day: number;
  date: string;
  label: string;
  memories: number;
  searches: number;
  live: number;
  total: number;
  height: number;
}

interface NamespaceItem {
  id: string;
  name: string;
  slug: string;
  eventsCount: number;
  usersCount: number;
}

interface MemoryItem {
  id: string;
  userId: string;
  title: string;
  summary: string;
  namespace: string;
  state: string;
  isBroke: boolean;
  timeAgo: string;
  occurredAt: string;
}

interface LatestEventItem {
  id: string;
  query: string;
  name: string;
  user: string;
  timeAgo: string;
  occurredAt: string;
  latencyMs: number;
}

export default function OverviewProduct() {
  const { data: session } = useSession();
  const [project, setProject] = useState<any>(null);
  const [metrics, setMetrics] = useState<MetricState>({
    documents: 0,
    memories: 0,
    searchRequests: 0,
    namespaces: 0,
    connectors: 0,
  });
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [namespaces, setNamespaces] = useState<NamespaceItem[]>([]);
  const [recentMemories, setRecentMemories] = useState<MemoryItem[]>([]);
  const [latestSearches, setLatestSearches] = useState<LatestEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | 'all'>('30d');
  const [simulating, setSimulating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const projectsRes = await fetch('/api/projects', { cache: 'no-store' });
      const projectsData = await projectsRes.json();
      const first = Array.isArray(projectsData?.projects) ? projectsData.projects[0] : null;
      setProject(first ?? null);

      if (!first?.id) {
        setLoading(false);
        return;
      }

      const overviewRes = await fetch(
        `/api/v1/overview?projectId=${encodeURIComponent(first.id)}`,
        { cache: 'no-store' }
      );
      const data = await overviewRes.json();

      if (overviewRes.ok && data.ok) {
        setMetrics(data.metrics);
        setChartData(data.chartData ?? []);
        setNamespaces(data.namespaces ?? []);
        setRecentMemories(data.recentMemories ?? []);
        setLatestSearches(data.latestSearches ?? []);
      }
    } catch (err) {
      console.error('Failed to load overview data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Determine dynamic greeting based on local time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName =
    session?.user?.name?.split(' ')[0] ||
    session?.user?.email?.split('@')[0] ||
    'Founder';

  // One-click simulation of the exact user onboarding friction sequence
  const handleSimulate = async () => {
    if (!project?.id || simulating) return;
    try {
      setSimulating(true);
      const res = await fetch(
        `/api/v1/demo/simulate?projectId=${encodeURIComponent(project.id)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error('Simulation failed', err);
    } finally {
      setSimulating(false);
    }
  };

  // Filter chart data by selected time range pill
  const displayedChartData = useMemo(() => {
    if (!chartData.length) return [];
    if (timeRange === '1d') return chartData.slice(-1);
    if (timeRange === '7d') return chartData.slice(-7);
    return chartData; // '30d' or 'all'
  }, [chartData, timeRange]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-2xs">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <span className="text-xs font-medium text-slate-600">
            Synthesizing customer memory and real-time metrics…
          </span>
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

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Simulate Action Button for rapid verification */}
          <button
            onClick={handleSimulate}
            disabled={simulating}
            title="Simulate a real onboarding sequence: user signs up, opens dashboard, creates project, attempts GitHub OAuth, and halts on error"
            className="btn btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1.5 bg-white text-slate-700 hover:text-sky-700 hover:border-sky-300"
          >
            {simulating ? (
              <RefreshCw size={12} className="animate-spin text-sky-600" />
            ) : (
              <Sparkles size={12} className="text-sky-600" />
            )}
            <span>{simulating ? 'Simulating…' : 'Simulate Onboarding'}</span>
          </button>

          {/* Time range segmented control pill (1d 7d 30d All) */}
          <div className="flex items-center rounded-lg border border-slate-200/90 bg-white p-0.5 shadow-2xs text-xs font-medium text-slate-600">
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
      </div>

      {/* 5 Dynamic Metric Cards (Real PostgreSQL data) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* DOCUMENTS */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Documents
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {metrics.documents}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 font-mono">
              {metrics.documents > 0 ? '~ +100%' : '0%'}
            </span>
          </div>
          <div className="mt-4 flex items-center h-4">
            <div
              className={`h-4 w-1 rounded-full ${
                metrics.documents > 0 ? 'bg-sky-500' : 'bg-slate-200'
              }`}
            />
          </div>
        </div>

        {/* MEMORIES */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Memories
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {metrics.memories}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 font-mono">
              {metrics.memories > 0 ? '~ +100%' : '0%'}
            </span>
          </div>
          <div className="mt-4 flex items-center h-4">
            <div
              className={`h-4 w-1 rounded-full ${
                metrics.memories > 0 ? 'bg-sky-500' : 'bg-slate-200'
              }`}
            />
          </div>
        </div>

        {/* SEARCH REQUESTS / TOTAL EVENTS */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Search Requests
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {metrics.searchRequests}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 font-mono">
              {metrics.searchRequests > 0 ? '~ +100%' : '0%'}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 h-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-${(idx % 3) + 1} w-1 rounded-full ${
                  metrics.searchRequests > idx ? 'bg-sky-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* NAMESPACES */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Namespaces
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {metrics.namespaces}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 font-mono">
              {metrics.namespaces > 0 ? '~ +100%' : '0%'}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 h-4">
            {Array.from({ length: Math.min(metrics.namespaces, 4) }).map((_, idx) => (
              <div key={idx} className="h-4 w-1 rounded-full bg-sky-500" />
            ))}
            {metrics.namespaces === 0 && <div className="h-4 w-1 rounded-full bg-slate-200" />}
          </div>
        </div>

        {/* CONNECTORS */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Connectors
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {metrics.connectors}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 h-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1 w-1 rounded-full ${
                  metrics.connectors > idx ? 'bg-sky-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Requests this month Chart (2/3) + Namespaces (1/3) */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left (2/3): Requests this month Chart */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs lg:col-span-2 flex flex-col justify-between min-h-[290px]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-sm text-slate-900">Requests this month</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Real-time telemetry and memory actions received over the last 30 days
                </p>
              </div>
              {/* Legend */}
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

          {/* Bar Chart Visualization - 100% Dynamic from PostgreSQL */}
          <div className="mt-8">
            <div className="flex items-end justify-between gap-1.5 h-36 px-1">
              {displayedChartData.map((item, i) => {
                const isPeak = item.total > 0 && item.total >= Math.max(...displayedChartData.map((d) => d.total));
                return (
                  <div
                    key={i}
                    className="group relative w-full flex items-end h-full"
                  >
                    <div
                      className="w-full rounded-t-xs transition-all group-hover:opacity-80"
                      style={{
                        height: `${item.height}px`,
                        backgroundColor:
                          item.total === 0
                            ? '#e2e8f0'
                            : isPeak
                            ? '#93c5fd'
                            : item.memories > 0
                            ? '#38bdf8'
                            : '#3b82f6',
                      }}
                    />
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-20">
                      <div className="rounded-lg bg-slate-900 text-white text-[10px] py-1 px-2 whitespace-nowrap shadow-lg">
                        <p className="font-bold">{item.label || `Day ${item.day}`}</p>
                        <p className="text-slate-300">{item.total} requests</p>
                        {item.memories > 0 && (
                          <p className="text-sky-300">{item.memories} memories</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom X-axis Labels */}
            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-1.5">
              <span>{timeRange === '7d' ? '7D AGO' : timeRange === '1d' ? 'TODAY' : '30D AGO'}</span>
              <span>NOW</span>
            </div>
          </div>
        </div>

        {/* Right (1/3): Namespaces Card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-900">Namespaces</h2>
              <span className="text-[10px] font-mono text-slate-400">
                {namespaces.length} active
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {namespaces.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">
                  No namespaces created yet.
                </div>
              ) : (
                namespaces.map((ns, idx) => (
                  <div key={ns.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                      <code className="font-mono text-slate-700 font-medium truncate">
                        {ns.slug || ns.name.toLowerCase().replace(/\s+/g, '_')}
                      </code>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className="h-1.5 rounded-full bg-sky-500"
                        style={{
                          width: `${Math.max(16, Math.min(64, (ns.eventsCount || 1) * 8))}px`,
                        }}
                      />
                      <span className="font-mono text-[11px] text-slate-700 tabular-nums">
                        {ns.eventsCount}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/settings"
              className="text-xs font-medium text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
            >
              <span>Manage namespaces</span>
              <ChevronRight size={13} />
            </Link>
            <Link
              href="/settings"
              className="text-[11px] font-mono text-slate-400 hover:text-slate-600"
            >
              API Keys ↗
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent memories (1/2) + Latest searches (1/2) */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left: Recent memories */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Recent Customer Memories</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Synthesized from individual trial user action sequences
              </p>
            </div>
            <Link
              href="/journeys"
              className="text-xs font-medium text-sky-600 hover:text-sky-700 inline-flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="mt-3 space-y-3">
            {recentMemories.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <FileText size={24} className="mx-auto text-slate-300 mb-2" />
                <p>No customer memories recorded yet.</p>
                <button
                  onClick={handleSimulate}
                  className="mt-3 text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  Simulate sample onboarding sequence
                </button>
              </div>
            ) : (
              recentMemories.map((m) => (
                <Link
                  key={m.id}
                  href={`/journeys/${encodeURIComponent(m.userId)}`}
                  className="group flex items-start justify-between gap-3 rounded-lg p-2.5 hover:bg-slate-50 transition text-xs border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FileText
                      size={15}
                      className={`shrink-0 mt-0.5 ${
                        m.isBroke ? 'text-rose-500' : 'text-slate-400 group-hover:text-sky-600'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 truncate">
                          {m.userId}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-slate-500 shrink-0">
                          {m.namespace}
                        </span>
                        {m.isBroke && (
                          <span className="rounded bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 text-[9px] font-semibold shrink-0">
                            Friction
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {m.summary}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {m.timeAgo}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right: Latest searches / events */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Latest Live Requests</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time stream of ingested client events &amp; latency
              </p>
            </div>
            <Link
              href="/events"
              className="text-xs font-medium text-sky-600 hover:text-sky-700 inline-flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {latestSearches.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <Search size={24} className="mx-auto text-slate-300 mb-2" />
                <p>Awaiting incoming events from your SDK.</p>
                <Link
                  href="/docs"
                  className="mt-3 text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
                >
                  View integration snippet ↗
                </Link>
              </div>
            ) : (
              latestSearches.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-slate-50 transition text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Search size={14} className="text-slate-400 shrink-0" />
                    <span className="font-normal text-slate-700 truncate font-mono text-[11px]">
                      {s.query}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] text-slate-400">
                    <span>{s.timeAgo}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 font-semibold">
                      {s.latencyMs} MS
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
