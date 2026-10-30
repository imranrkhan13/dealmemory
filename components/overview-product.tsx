'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
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
  Zap,
  MessageSquare,
  X,
  Send,
  Copy,
  Check,
  Clock,
  Heart,
  Bot,
  HelpCircle,
} from 'lucide-react';

interface MetricState {
  documents: number;
  memories: number;
  searchRequests: number;
  namespaces: number;
  connectors: number;
  trackedUsers?: number;
  totalEvents?: number;
  stalledUsers?: number;
  activeToday?: number;
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
  story?: string;
  loved?: string;
  timeSpent?: string;
  activeWindow?: string;
  namespace: string;
  state: string;
  isBroke: boolean;
  brokeReason?: string | null;
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

interface GeminiAnswer {
  ok: boolean;
  answer: string;
  model: string;
  sources?: Array<{ type: string; title: string; detail: string }>;
  contextStats?: {
    usersCount: number;
    eventsCount: number;
    stalledCount: number;
  };
  error?: string;
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
  const [apiKeyPrefix, setApiKeyPrefix] = useState<string>('pk_live_default');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | 'all'>('30d');
  const [simulating, setSimulating] = useState(false);
  const [isLivePolling, setIsLivePolling] = useState(true);

  // Setup Snippet State
  const [showSetup, setShowSetup] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Gemini AI Assistant State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<GeminiAnswer | null>(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'gemini'; text: string; time: string }>
  >([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Core Data Fetcher
  const loadData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const projectsRes = await fetch('/api/projects', { cache: 'no-store' });
      const projectsData = await projectsRes.json();
      const first = Array.isArray(projectsData?.projects) ? projectsData.projects[0] : null;
      setProject(first ?? null);

      if (!first?.id) {
        if (!isBackground) setLoading(false);
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
        setRecentMemories(data.userStories ?? data.recentMemories ?? []);
        setLatestSearches(data.latestSearches ?? []);
        if (data.apiKeyPrefix) {
          setApiKeyPrefix(data.apiKeyPrefix);
        }
      }
    } catch (err) {
      console.error('Failed to load overview data', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Real-time dynamic background polling every 4 seconds (nothing static!)
  useEffect(() => {
    if (!isLivePolling) return;
    const interval = setInterval(() => {
      void loadData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLivePolling, loadData]);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, aiLoading]);

  // Greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName =
    session?.user?.name?.split(' ')[0] ||
    session?.user?.email?.split('@')[0] ||
    'Imran';

  // One-click simulation of real onboarding telemetry
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
        await loadData(true);
      }
    } catch (err) {
      console.error('Simulation failed', err);
    } finally {
      setSimulating(false);
    }
  };

  // Ask Gemini AI over real site telemetry
  const handleAskGemini = async (overrideQuery?: string) => {
    const query = (overrideQuery || aiQuestion || chatInput).trim();
    if (!query || !project?.id || aiLoading) return;

    try {
      setAiLoading(true);
      setAiAnswer(null);

      // Append to chat drawer if open
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'user',
          text: query,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setChatInput('');

      const res = await fetch(
        `/api/v1/ai/ask?projectId=${encodeURIComponent(project.id)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: query }),
        }
      );

      const data: GeminiAnswer = await res.json();
      setAiAnswer(data);

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'gemini',
          text: data.answer || 'No answer generated.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('AI ask failed', err);
      setAiAnswer({
        ok: false,
        answer: 'Failed to contact Gemini API. Please check your network and GEMINI_API_KEY.',
        model: 'gemini-2.5-flash',
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Copy API key snippet
  const scriptHost = typeof window !== 'undefined' ? window.location.origin : 'https://dealmemory.vercel.app';
  const embedSnippet = `<script src="${scriptHost}/v1.js" data-key="${apiKeyPrefix || 'YOUR_PROJECT_API_KEY'}" async></script>`;

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {}
  };

  // Filter 30-day dynamic chart data
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
            Streaming live telemetry and customer memories…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Greeting Header & Time Range Selector (Supermemory Console Header) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-2">
            <span>Onboard your agent to dealmemory</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">☀️</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">⚙️</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">🖥️</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">📱</span>
            <span className="inline-flex items-center gap-1.5 ml-2 text-[10px] font-mono font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/80">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
              Real-time Ingest Active
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {/* Quick Setup Code Button */}
          <button
            onClick={() => setShowSetup(!showSetup)}
            className="btn btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1.5 bg-white text-slate-700 hover:text-sky-700 hover:border-sky-300"
          >
            <Zap size={12} className="text-sky-600" />
            <span>{showSetup ? 'Hide Setup' : 'Quick Setup'}</span>
          </button>

          {/* Simulate Action Button */}
          <button
            onClick={handleSimulate}
            disabled={simulating}
            title="Simulate realistic user onboarding drop-off sequence"
            className="btn btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1.5 bg-white text-slate-700 hover:text-sky-700 hover:border-sky-300"
          >
            {simulating ? (
              <RefreshCw size={12} className="animate-spin text-sky-600" />
            ) : (
              <Sparkles size={12} className="text-sky-600" />
            )}
            <span>{simulating ? 'Simulating…' : 'Simulate Onboarding'}</span>
          </button>

          {/* Time range selector pill (1d 7d 30d All) */}
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

      {/* QUICK SETUP DRAWER (If toggled) */}
      {showSetup && (
        <div className="rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50/80 via-white to-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white text-[10px] font-bold">
                ✓
              </span>
              <h3 className="font-bold text-xs text-slate-900">
                1-Line Website Setup: Stream Live Telemetry in 30 Seconds
              </h3>
            </div>
            <button
              onClick={() => setShowSetup(false)}
              className="text-slate-400 hover:text-slate-600 p-1 text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-600">
            Add this script tag to your web app header. Every button click, scroll, and page view will stream dynamically to your DealMemory console:
          </p>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-900 text-slate-100 px-4 py-2.5 font-mono text-xs overflow-x-auto">
            <code>{embedSnippet}</code>
            <button
              onClick={handleCopySnippet}
              className="ml-4 shrink-0 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] font-sans font-medium text-slate-200 hover:text-white transition inline-flex items-center gap-1.5"
            >
              {copiedKey ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* GEMINI AI SEARCH & ASK BAR (Powered by GEMINI_API_KEY) */}
      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Sparkles size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500" />
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
              placeholder="Ask DealMemory AI: 'Why did onboarding drop off today?' or 'What did users love most?'"
              className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 pl-10 pr-24 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition"
            />
            <button
              onClick={() => handleAskGemini()}
              disabled={aiLoading || !aiQuestion.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 transition inline-flex items-center gap-1.5 shadow-2xs"
            >
              {aiLoading ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
              <span>{aiLoading ? 'Thinking…' : 'Ask Gemini'}</span>
            </button>
          </div>

          <button
            onClick={() => setAiDrawerOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:text-sky-700 hover:border-sky-300 transition shadow-2xs shrink-0"
          >
            <Bot size={15} className="text-sky-600" />
            <span>AI Playground</span>
          </button>
        </div>

        {/* Quick Suggested Prompt Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-mono text-slate-400 mr-1">Suggested:</span>
          {[
            'Where did onboarding break today?',
            'What features did users love most?',
            'Who was active and what did they do?',
            'Draft outreach email to unblock stalled users',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setAiQuestion(prompt);
                void handleAskGemini(prompt);
              }}
              className="rounded-lg bg-slate-100/80 hover:bg-sky-50 hover:text-sky-800 border border-slate-200/60 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Live Gemini AI Response Banner */}
        {aiAnswer && (
          <div className="mt-3 rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50/60 via-white to-white p-4 text-xs text-slate-800 shadow-2xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-500 text-white">
                  <Sparkles size={12} />
                </div>
                <span className="font-bold text-slate-900">DealMemory AI Analysis</span>
                <span className="rounded bg-sky-100 text-sky-800 font-mono text-[10px] font-bold px-1.5 py-0.5">
                  {aiAnswer.model}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Ground-truth database telemetry verified
                </span>
              </div>
              <button
                onClick={() => setAiAnswer(null)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="leading-relaxed whitespace-pre-line font-medium text-slate-700">
              {aiAnswer.answer}
            </div>

            {aiAnswer.sources && aiAnswer.sources.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-2 border-t border-sky-100/70">
                <span className="text-[10px] font-mono text-slate-400">Context used:</span>
                {aiAnswer.sources.slice(0, 3).map((s, i) => (
                  <span
                    key={i}
                    className="rounded bg-white border border-sky-200/80 px-2 py-0.5 text-[10px] font-mono text-sky-800"
                  >
                    {s.title} ({s.detail})
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5 DYNAMIC METRIC CARDS (Exact Supermemory Console Layout) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* DOCUMENTS */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
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
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
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

        {/* SEARCH REQUESTS / TELEMETRY */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
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
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
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
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
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

      {/* MIDDLE ROW: Requests this month (2/3) + Namespaces (1/3) */}
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

              {/* Legend matching Supermemory Console */}
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

          {/* Dynamic 30-Day Bar Chart from PostgreSQL */}
          <div className="mt-8">
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
                namespaces.map((ns) => (
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

      {/* BOTTOM ROW: Recent memories (1/2) + Latest searches (1/2) */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left: Recent memories */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Recent memories</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Synthesized customer memory capsules from real user telemetry
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
              <p className="text-xs text-slate-400 py-6 text-center">
                No customer memories synthesized yet.
              </p>
            ) : (
              recentMemories.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  href={`/journeys/${encodeURIComponent(item.userId)}`}
                  className="group flex items-start gap-2.5 rounded-lg p-2 transition hover:bg-slate-50"
                >
                  <FileText
                    size={15}
                    className="mt-0.5 shrink-0 text-slate-400 group-hover:text-sky-600 transition"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-800 group-hover:text-sky-900 transition truncate">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                      {item.story || item.summary}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                      {item.namespace}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                      {item.timeAgo}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right: Latest searches / Real telemetry stream */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Latest searches</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time API requests and telemetry received from your site
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

          <div className="mt-3 space-y-2.5">
            {latestSearches.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No searches or requests recorded yet.
              </p>
            ) : (
              latestSearches.slice(0, 5).map((search) => (
                <div
                  key={search.id}
                  className="flex items-start justify-between gap-3 text-xs py-1"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Search size={14} className="mt-0.5 shrink-0 text-slate-400" />
                    <span className="font-mono text-slate-700 truncate text-[11px]">
                      {search.query}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-slate-400 shrink-0">
                    {search.latencyMs} MS
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FLOATING AI CHAT BUBBLE (Exact Supermemory Console Chat Widget) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition hover:scale-105"
          title="Ask DealMemory AI"
        >
          {aiDrawerOpen ? <X size={20} /> : <MessageSquare size={20} />}
        </button>
      </div>

      {/* GEMINI AI ASSISTANT DRAWER */}
      {aiDrawerOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col h-[520px] overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 p-4 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-white">
                <Sparkles size={14} />
              </div>
              <div>
                <h3 className="font-bold text-xs">DealMemory AI</h3>
                <p className="text-[10px] text-sky-300 font-mono">
                  Gemini 2.5 Flash · Ground-truth memory
                </p>
              </div>
            </div>
            <button
              onClick={() => setAiDrawerOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8 px-4 space-y-2">
                <Bot className="mx-auto h-8 w-8 text-sky-500" />
                <p className="text-xs font-semibold text-slate-800">
                  Ask anything about your users &amp; telemetry
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  I analyze real-time PostgreSQL events, dwell times, and user roadblocks received from your site.
                </p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-sky-600 text-white font-medium rounded-br-xs'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-2xs whitespace-pre-line rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-1 text-[9px] font-mono text-slate-400 px-1">
                    {msg.time}
                  </span>
                </div>
              ))
            )}
            {aiLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 p-2.5 rounded-xl w-fit shadow-2xs">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                <span className="font-mono text-[11px]">Gemini is analyzing user telemetry…</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-slate-200 p-3 bg-white flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
              placeholder="Ask about users, drop-offs, dwell times…"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={() => handleAskGemini()}
              disabled={aiLoading || !chatInput.trim()}
              className="rounded-lg bg-sky-600 text-white p-2 hover:bg-sky-700 disabled:opacity-40 transition"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
