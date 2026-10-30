'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Users,
  Activity,
  AlertCircle,
  Clock,
  Heart,
  Sparkles,
  Copy,
  Check,
  Terminal,
  Code2,
  ChevronRight,
  RefreshCw,
  Zap,
  Play,
  ArrowRight,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MetricState {
  trackedUsers?: number;
  totalEvents?: number;
  stalledUsers?: number;
  activeToday?: number;
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

interface UserStoryItem {
  id: string;
  userId: string;
  cleanName: string;
  title: string;
  summary: string;
  story: string;
  loved: string;
  timeSpent: string;
  activeWindow: string;
  lastAction: string;
  namespace: string;
  state: string;
  isBroke: boolean;
  brokeReason: string | null;
  archetype: string;
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
    trackedUsers: 0,
    totalEvents: 0,
    stalledUsers: 0,
    activeToday: 0,
    documents: 0,
    memories: 0,
    searchRequests: 0,
    namespaces: 0,
    connectors: 0,
  });
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [namespaces, setNamespaces] = useState<NamespaceItem[]>([]);
  const [userStories, setUserStories] = useState<UserStoryItem[]>([]);
  const [latestSearches, setLatestSearches] = useState<LatestEventItem[]>([]);
  const [apiKeyPrefix, setApiKeyPrefix] = useState<string>('pk_live_default');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | 'all'>('30d');

  // Setup widget state
  const [setupTab, setSetupTab] = useState<'script' | 'node' | 'python' | 'curl'>('script');
  const [copied, setCopied] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  // Simulation state
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
        setUserStories(data.userStories ?? data.recentMemories ?? []);
        setLatestSearches(data.latestSearches ?? []);
        if (data.apiKeyPrefix) {
          setApiKeyPrefix(data.apiKeyPrefix);
        }
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

  // Greeting based on time of day
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

  // Copy code helper
  const handleCopyCode = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // 1-Click Send Test Event
  const handleSendTestEvent = async () => {
    if (!project?.id || sendingTest) return;
    try {
      setSendingTest(true);
      setTestSuccess(null);
      const res = await fetch(
        `/api/v1/demo/simulate?projectId=${encodeURIComponent(project.id)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'single' }),
        }
      );
      const data = await res.json();
      if (res.ok && data.ok) {
        setTestSuccess(`Live test event recorded for ${data.simulatedUser || 'user'}!`);
        setTimeout(() => setTestSuccess(null), 4000);
        await loadData();
      }
    } catch (err) {
      console.error('Test event failed', err);
    } finally {
      setSendingTest(false);
    }
  };

  // Full onboarding simulation
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

  // Setup code snippets prefilled with the real project API key
  const setupSnippets = useMemo(() => {
    const key = apiKeyPrefix || 'pk_live_your_project_key';
    return {
      script: `<!-- DealMemory 1-Line Setup -->\n<script\n  src="https://cdn.dealmemory.com/v1.js"\n  data-key="${key}"\n  async>\n</script>`,
      node: `// npm install @dealmemory/sdk\nimport { DealMemory } from '@dealmemory/sdk';\n\nconst dm = new DealMemory({ apiKey: '${key}' });\n\n// Record user actions & dwell time:\ndm.track('feature_used', {\n  userId: 'usr_sarah',\n  properties: { feature: 'design_tokens', topic: 'UI Systems' }\n});`,
      python: `# pip install dealmemory\nfrom dealmemory import DealMemory\n\ndm = DealMemory(api_key="${key}")\n\n# Record user actions & dwell time:\ndm.track(\n    name="feature_used",\n    user_id="usr_sarah",\n    properties={"feature": "design_tokens", "topic": "UI Systems"}\n)`,
      curl: `curl -X POST https://api.dealmemory.com/api/v1/events/batch \\\n  -H "Authorization: Bearer ${key}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "events": [{\n      "name": "article_viewed",\n      "userId": "usr_sarah",\n      "properties": { "title": "Design Systems", "dwellSeconds": 180 }\n    }]\n  }'`,
    };
  }, [apiKeyPrefix]);

  const displayedChartData = useMemo(() => {
    if (!chartData.length) return [];
    if (timeRange === '1d') return chartData.slice(-1);
    if (timeRange === '7d') return chartData.slice(-7);
    return chartData;
  }, [chartData, timeRange]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-2xs">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <span className="text-xs font-medium text-slate-600">
            Synthesizing customer memory and user activity…
          </span>
        </div>
      </div>
    );
  }

  const trackedCount = metrics.trackedUsers ?? metrics.documents ?? 0;
  const eventsCount = metrics.totalEvents ?? metrics.searchRequests ?? 0;
  const stalledCount = metrics.stalledUsers ?? 0;
  const activeTodayCount = metrics.activeToday ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-2">
            <span>Customer memory &amp; live behavioral summaries for your team</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
              Live Ingest Active
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Send Test Event */}
          <button
            onClick={handleSendTestEvent}
            disabled={sendingTest}
            className="btn btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1.5 bg-white text-slate-700 hover:text-sky-700 hover:border-sky-300"
            title="Fire a test telemetry event to immediately verify setup"
          >
            {sendingTest ? (
              <RefreshCw size={12} className="animate-spin text-sky-600" />
            ) : (
              <Zap size={12} className="text-sky-600" />
            )}
            <span>{sendingTest ? 'Sending…' : 'Send Test Event'}</span>
          </button>

          {/* Simulate Complete Sequence */}
          <button
            onClick={handleSimulate}
            disabled={simulating}
            title="Simulate realistic user sequence: signs up, opens dashboard, creates project, halts at integration error"
            className="btn btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1.5 bg-white text-slate-700 hover:text-sky-700 hover:border-sky-300"
          >
            {simulating ? (
              <RefreshCw size={12} className="animate-spin text-sky-600" />
            ) : (
              <Sparkles size={12} className="text-sky-600" />
            )}
            <span>{simulating ? 'Simulating…' : 'Simulate Onboarding'}</span>
          </button>

          {/* Time range selector */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs text-xs font-medium text-slate-600">
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

      {/* Success banner when a test event is fired */}
      {testSuccess && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-emerald-600 font-bold" />
            <span>{testSuccess}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700">Dashboard refreshed</span>
        </div>
      )}

      {/* Simple, Founder-First Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* TRACKED USERS */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
              Tracked Users
            </p>
            <div className="rounded-lg bg-sky-50 p-1.5 text-sky-600">
              <Users size={14} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {trackedCount}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 font-mono">
              {trackedCount > 0 ? '+100%' : '0'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Unique accounts observed</p>
        </div>

        {/* EVENTS RECORDED */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
              Recorded Events
            </p>
            <div className="rounded-lg bg-sky-50 p-1.5 text-sky-600">
              <Activity size={14} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {eventsCount}
            </span>
            <span className="text-[11px] font-medium text-sky-600 font-mono">
              Live
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Action telemetry streams</p>
        </div>

        {/* STALLED USERS (NEED ATTENTION) */}
        <Link
          href="/journeys"
          className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between group hover:border-rose-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
              Stalled / Friction
            </p>
            <div
              className={`rounded-lg p-1.5 ${
                stalledCount > 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <AlertCircle size={14} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold tracking-tight tabular-nums ${
                stalledCount > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {stalledCount}
            </span>
            {stalledCount > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/80">
                Needs Help
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 group-hover:text-rose-700 transition-colors">
            {stalledCount > 0 ? 'Halted at roadblocks →' : 'No blockers detected'}
          </p>
        </Link>

        {/* ACTIVE TODAY */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
              Active Today
            </p>
            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
              <Clock size={14} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {activeTodayCount}
            </span>
            <span className="text-[11px] font-mono text-emerald-600 font-medium">
              Last 24h
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Users with active sessions</p>
        </div>
      </div>

      {/* ULTRA-SIMPLE 30-SECOND SETUP CARD */}
      <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/70 via-white to-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white text-[11px] font-bold">
                1
              </span>
              <h2 className="font-bold text-sm text-slate-900">
                Quick Setup: Record Events in 30 Seconds
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 pl-7">
              Paste this snippet into your application. Your project API key is already configured.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto pl-7 sm:pl-0">
            {/* Tab switchers */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-mono font-medium">
              {(
                [
                  { id: 'script', label: 'HTML Web' },
                  { id: 'node', label: 'Node / React' },
                  { id: 'python', label: 'Python' },
                  { id: 'curl', label: 'cURL' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSetupTab(tab.id)}
                  className={`rounded px-2.5 py-1 text-xs transition ${
                    setupTab === tab.id
                      ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200/60 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Toggle collapse */}
            <button
              onClick={() => setShowSetup(!showSetup)}
              className="text-slate-400 hover:text-slate-600 p-1"
              title={showSetup ? 'Collapse setup guide' : 'Expand setup guide'}
            >
              {showSetup ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {showSetup && (
          <div className="mt-4 pt-3 border-t border-sky-100/70">
            <div className="relative rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto shadow-inner">
              <pre className="text-xs leading-relaxed">
                <code>{setupSnippets[setupTab]}</code>
              </pre>

              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(setupSnippets[setupTab])}
                  className="rounded-lg bg-slate-800/90 border border-slate-700 px-3 py-1.5 text-xs font-sans font-medium text-slate-200 hover:text-white hover:bg-slate-700 inline-flex items-center gap-1.5 transition"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">Project API Key:</span>
                <code className="rounded bg-sky-50 border border-sky-200/80 px-2 py-0.5 font-mono text-[11px] text-sky-900 font-bold">
                  {apiKeyPrefix}_••••••••
                </code>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/sdk"
                  className="text-sky-600 hover:text-sky-700 font-medium inline-flex items-center gap-1"
                >
                  <span>Full SDK Reference &amp; Docs</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RECENT USER STORIES & BEHAVIORAL SUMMARIES (Loved This + Time Spent) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-sky-50 p-1 text-sky-600">
                <Heart size={15} />
              </span>
              <h2 className="font-bold text-base text-slate-900">
                User Behavioral Stories &amp; What They Loved
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Synthesized context: time spent, peak active window, repeat feature affinity, and where sessions halted.
            </p>
          </div>

          <Link
            href="/journeys"
            className="text-xs font-medium text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View all journeys</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        {userStories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
            <Activity className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs font-semibold text-slate-700">No user activity recorded yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Paste the setup snippet above or click &ldquo;Send Test Event&rdquo; to see a live summary.
            </p>
          </div>
        ) : (
          <div className="grid gap-3.5 md:grid-cols-2">
            {userStories.map((story) => (
              <Link
                key={story.id}
                href={`/journeys/${encodeURIComponent(story.userId)}`}
                className="group block rounded-xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/40 p-4 transition-all hover:border-sky-300 hover:shadow-xs"
              >
                {/* User card header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-800 font-mono text-xs font-bold">
                      {story.cleanName.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {story.cleanName}
                      </span>
                      <span className="ml-2 text-[10px] font-mono text-slate-400">
                        {story.timeAgo}
                      </span>
                    </div>
                  </div>

                  {story.isBroke ? (
                    <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700 uppercase font-mono tracking-wider">
                      Stalled
                    </span>
                  ) : (
                    <span className="rounded-full bg-sky-50 border border-sky-200/60 px-2 py-0.5 text-[10px] font-bold text-sky-700 uppercase font-mono tracking-wider">
                      {story.archetype}
                    </span>
                  )}
                </div>

                {/* The Executive Behavioral Story */}
                <p className="mt-3 text-xs leading-relaxed text-slate-700 font-medium line-clamp-3">
                  {story.story || story.summary}
                </p>

                {/* Behavioral Feature Chips */}
                <div className="mt-3.5 flex flex-wrap gap-1.5 pt-2.5 border-t border-slate-100">
                  {/* Time Spent */}
                  <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200/80 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600">
                    <Clock size={11} className="text-sky-500" />
                    <span>{story.timeSpent}</span>
                  </span>

                  {/* Active Window */}
                  <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200/80 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600">
                    <span>{story.activeWindow}</span>
                  </span>

                  {/* What They Loved */}
                  <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 border border-sky-200/80 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-800">
                    <Heart size={10} className="text-sky-600 fill-sky-200" />
                    <span>{story.loved}</span>
                  </span>
                </div>

                {/* Action Link Footer */}
                <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-sky-600 group-hover:text-sky-700 pt-1">
                  <span>Replay journey timeline</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM ROW: Activity Trend Chart (2/3) + Real-time Telemetry (1/3) */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: 30-Day Activity Bar Chart */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs lg:col-span-2 flex flex-col justify-between min-h-[290px]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Activity Trend</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Daily event volume recorded across all users over the last 30 days
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-sky-400" />
                  Events
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-blue-600" />
                  Active Days
                </span>
              </div>
            </div>
          </div>

          {/* Chart Bars */}
          <div className="mt-6">
            <div className="flex items-end justify-between gap-1.5 h-36 px-1">
              {displayedChartData.map((item, i) => {
                const isPeak =
                  item.total > 0 &&
                  item.total >= Math.max(...displayedChartData.map((d) => d.total));
                return (
                  <div key={i} className="group relative w-full flex items-end h-full">
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
                            : '#0284c7',
                      }}
                    />
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-20">
                      <div className="rounded-lg bg-slate-900 text-white text-[10px] py-1 px-2 whitespace-nowrap shadow-lg">
                        <p className="font-bold">{item.label || `Day ${item.day}`}</p>
                        <p className="text-slate-300">{item.total} events</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-1.5">
              <span>{timeRange === '7d' ? '7D AGO' : timeRange === '1d' ? 'TODAY' : '30D AGO'}</span>
              <span>NOW</span>
            </div>
          </div>
        </div>

        {/* Right: Live Telemetry Stream */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Live Telemetry</h3>
              <span className="text-[10px] font-mono text-slate-400">
                {latestSearches.length} recent
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {latestSearches.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No events received yet.
                </p>
              ) : (
                latestSearches.slice(0, 6).map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-start justify-between gap-2 text-xs py-1 border-b border-slate-50 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="font-mono font-medium text-slate-800 truncate text-[11px]">
                        {evt.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {evt.user.replace(/^(user_|usr_)/, '')} · {evt.timeAgo}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {evt.latencyMs}ms
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
            <Link
              href="/events"
              className="text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
            >
              <span>View full event stream</span>
              <ChevronRight size={13} />
            </Link>
            <Link
              href="/settings"
              className="text-slate-400 hover:text-slate-600 font-mono text-[11px]"
            >
              API Keys ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
