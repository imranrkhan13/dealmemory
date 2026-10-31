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
  Activity,
  UserCheck,
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

interface UserEventItem {
  id: string;
  eventId: string;
  name: string;
  readableName: string;
  userId: string;
  cleanUserId: string;
  occurredAt: string;
  timeAgo: string;
  url?: string;
  properties: Record<string, unknown>;
  isMilestone: boolean;
  isFailure: boolean;
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

function cleanField(val?: string | null): string | null {
  if (!val) return null;
  return val.replace(/^[:\s*#•\-]+|[:\s*#•\-]+$/g, '').trim();
}

function parseInlineMarkdown(text: string): React.ReactNode {
  const clean = text.replace(/^[#•\-*]+\s*/, '');
  const parts = clean.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part.replace(/\*\*/g, '');
  });
}

function GenericMarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={`sp-${idx}`} className="h-1.5" />);
      return;
    }

    if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
      const title = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');
      elements.push(
        <h4 key={`h-${idx}`} className="text-xs font-bold text-ink mt-2 mb-1">
          {title}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={`b-${idx}`} className="flex items-start gap-2 py-0.5 text-xs text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
          <span className="leading-relaxed">{parseInlineMarkdown(trimmed)}</span>
        </div>
      );
      return;
    }

    elements.push(
      <p key={`p-${idx}`} className="text-xs text-ink-soft leading-relaxed py-0.5">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });

  return <div className="space-y-1">{elements}</div>;
}

function FormattedAiResponse({ content }: { content: string }) {
  if (!content) return null;

  const isTelemetryReport =
    /Telemetry Intelligence/i.test(content) &&
    (/Active Dwell Time/i.test(content) || /Feature Affinity/i.test(content) || /Executive Summary/i.test(content));

  if (isTelemetryReport) {
    const userMatch = content.match(/Telemetry Intelligence:?\s*\**([^\n*]+)\**/i);
    const dwellMatch = content.match(/(?:Active Dwell Time|Time Spent)\**:\s*([^\n]+)/i);
    const affinityMatch = content.match(/(?:Top Feature Affinity|Feature Affinity)\**:\s*([^\n]+)/i);
    const lastActionMatch = content.match(/Last Recorded Action\**:\s*([^\n]+)/i);
    const statusMatch = content.match(/(?:Onboarding Status|Where Onboarding Broke)\**:\s*([^\n]+)/i);
    const summaryMatch = content.match(/\**Executive Summary\**:\s*\n+([\s\S]*?)(?=\n+\**Recommended|\n*$)/i);
    const nextStepMatch = content.match(/\**Recommended Next (?:Step|Action)\**:\s*\n+([\s\S]*?)$/i);

    const user = cleanField(userMatch?.[1]);
    const dwell = cleanField(dwellMatch?.[1]);
    const affinity = cleanField(affinityMatch?.[1]);
    const lastAction = cleanField(lastActionMatch?.[1]);
    let rawStatus = cleanField(statusMatch?.[1]);
    const summary = cleanField(summaryMatch?.[1]);
    let nextStep = cleanField(nextStepMatch?.[1]);

    // Handle false alarm of First value not reached if user performed feature_used
    if (rawStatus && /First value not reached/i.test(rawStatus) && lastAction && /Feature Used/i.test(lastAction)) {
      rawStatus = 'Healthy · Active session completed';
      if (nextStep && /First value not reached/i.test(nextStep)) {
        nextStep = `Follow up with tailored workflows or advanced tips for ${affinity ? affinity.replace(/\s*\([^)]*\)/, '') : 'key features'}.`;
      }
    }

    const isFriction = rawStatus
      ? /friction|stalled|broke|halted|failed|error/i.test(rawStatus) && !/healthy|completed|smooth/i.test(rawStatus)
      : false;

    return (
      <div className="space-y-3 pt-1">
        {user && (
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-line">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-ink-soft uppercase tracking-wider font-mono">
                Telemetry Intelligence
              </span>
              <span className="rounded-md bg-accent-tint px-2 py-0.5 text-xs font-mono font-bold text-accent border border-line">
                {user}
              </span>
            </div>
            {rawStatus && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold border ${
                  isFriction
                    ? 'bg-danger-tint border-danger/40 text-danger'
                    : 'bg-success-tint border-success/40 text-success'
                }`}
              >
                {isFriction ? (
                  <AlertTriangle size={11} className="text-danger shrink-0" />
                ) : (
                  <CheckCircle2 size={11} className="text-success shrink-0" />
                )}
                <span>{rawStatus}</span>
              </span>
            )}
          </div>
        )}

        {/* Structured Metric Badges Grid */}
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {dwell && (
            <div className="rounded-lg border border-line bg-white p-2.5  flex items-start gap-2.5">
              <Clock size={14} className="mt-0.5 text-accent shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-ink-faint font-semibold">
                  Active Dwell Time
                </p>
                <p className="text-xs font-semibold text-ink truncate">{dwell}</p>
              </div>
            </div>
          )}

          {affinity && (
            <div className="rounded-lg border border-line bg-white p-2.5  flex items-start gap-2.5">
              <Heart size={14} className="mt-0.5 text-danger shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-ink-faint font-semibold">
                  Top Feature Affinity
                </p>
                <p className="text-xs font-semibold text-ink truncate">{affinity}</p>
              </div>
            </div>
          )}

          {lastAction && (
            <div className="rounded-lg border border-line bg-white p-2.5  flex items-start gap-2.5 sm:col-span-2 lg:col-span-1">
              <Activity size={14} className="mt-0.5 text-accent shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-ink-faint font-semibold">
                  Last Recorded Action
                </p>
                <p className="text-xs font-semibold text-ink truncate">{lastAction}</p>
              </div>
            </div>
          )}
        </div>

        {/* Executive Summary Card */}
        {summary && (
          <div className="rounded-lg border border-line bg-white p-3.5  space-y-1">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
              Executive Summary
            </p>
            <p className="text-xs text-ink-soft leading-relaxed font-normal">
              {summary}
            </p>
          </div>
        )}

        {/* Recommended Next Step Card */}
        {nextStep && (
          <div className="rounded-lg border border-line from-accent-tint to-accent-tint p-3 flex items-start gap-2.5">
            <Zap size={14} className="mt-0.5 text-accent shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">
                Recommended Next Step
              </p>
              <p className="text-xs text-accent leading-relaxed font-medium mt-0.5">
                {nextStep}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <GenericMarkdownRenderer content={content} />;
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
  const [userEvents, setUserEvents] = useState<UserEventItem[]>([]);
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
        setUserEvents(data.userEvents ?? []);
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

  // Snippet copy handling
  const [snippetMode, setSnippetMode] = useState<'curl' | 'fetch'>('curl');
  const scriptHost = typeof window !== 'undefined' ? window.location.origin : 'https://dealmemory.vercel.app';
  const keyToUse = apiKeyPrefix || 'pk_live_your_project_key';

  const curlSnippet = `curl -X POST '${scriptHost}/api/v1/events/batch' \\
  -H 'Content-Type: application/json' \\
  -H 'x-project-key: ${keyToUse}' \\
  -d '{"events":[{"id":"'$(uuidgen || echo "evt-$(date +%s)")'","projectKey":"${keyToUse}","name":"user_signed_up","userId":"sarah@acme.inc","anonymousId":"anon_1","sessionId":"sess_1","occurredAt":"'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'","properties":{"plan":"growth"}}]}'`;

  const fetchSnippet = `await fetch('${scriptHost}/api/v1/events/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-project-key': '${keyToUse}'
  },
  body: JSON.stringify({
    events: [{
      id: crypto.randomUUID(),
      projectKey: '${keyToUse}',
      name: 'user_signed_up',
      userId: 'sarah@acme.inc',
      anonymousId: 'anon_1',
      sessionId: 'sess_1',
      occurredAt: new Date().toISOString(),
      properties: { plan: 'growth' }
    }]
  })
});`;

  const handleCopySnippet = async () => {
    try {
      const activeText = snippetMode === 'curl' ? curlSnippet : fetchSnippet;
      await navigator.clipboard.writeText(activeText);
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
        <div className="flex items-center gap-3 rounded-lg border border-line bg-white px-5 py-3 ">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-xs font-medium text-ink-soft">
            Streaming live telemetry and customer memories…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Greeting Header & Time Range Selector (Supermemory Console Header) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[26px] font-medium leading-tight tracking-[-0.025em] text-ink">
            {greeting}, {firstName}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-ink-soft">Here is what changed across your trials.</span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.05em] text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Real-time ingest
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Quick Setup Code Button */}
          <button
            onClick={() => setShowSetup(!showSetup)}
            className="btn btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1.5 bg-white text-ink-soft hover:text-accent hover:border-accent-line"
          >
            <Zap size={12} className="text-accent" />
            <span>{showSetup ? 'Hide Setup' : 'Quick Setup'}</span>
          </button>

          {/* Simulate Action Button */}
          <button
            onClick={handleSimulate}
            disabled={simulating}
            title="Simulate realistic user onboarding drop-off sequence"
            className="btn btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1.5 bg-white text-ink-soft hover:text-accent hover:border-accent-line"
          >
            {simulating ? (
              <RefreshCw size={12} className="animate-spin text-accent" />
            ) : (
              <Sparkles size={12} className="text-accent" />
            )}
            <span>{simulating ? 'Simulating…' : 'Simulate Onboarding'}</span>
          </button>

          {/* Time range selector pill (1d 7d 30d All) */}
          <div className="flex items-center rounded-lg border border-line bg-white p-0.5  text-xs font-medium text-ink-soft">
            {(['1d', '7d', '30d', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`rounded-md px-2.5 py-1 text-xs transition ${
                  timeRange === t
                    ? 'bg-accent-tint text-accent font-semibold'
                    : 'hover:text-ink'
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
        <div className="rounded-card border border-line bg-white p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white text-[10px]">
                <Check size={11} className="stroke-[3]" />
              </span>
              <h3 className="font-medium text-[12px] leading-snug text-ink">
                Live Ingestion Setup: Connect &amp; Stream Events in 30 Seconds
              </h3>
            </div>
            <button
              onClick={() => setShowSetup(false)}
              className="text-ink-faint hover:text-ink-soft p-1 text-xs"
            >
              <X size={14} />
            </button>
          </div>

          <p className="text-xs text-ink-soft">
            Stream events directly to DealMemory over standard HTTP. Send from any frontend app, backend service, or terminal command:
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSnippetMode('curl')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  snippetMode === 'curl'
                    ? 'bg-accent text-white font-semibold '
                    : 'bg-muted text-ink-soft hover:bg-line'
                }`}
              >
                cURL (Terminal)
              </button>
              <button
                onClick={() => setSnippetMode('fetch')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  snippetMode === 'fetch'
                    ? 'bg-accent text-white font-semibold '
                    : 'bg-muted text-ink-soft hover:bg-line'
                }`}
              >
                JavaScript fetch (Web / React / Node)
              </button>
            </div>

            <button
              onClick={handleCopySnippet}
              className="rounded-lg bg-muted hover:bg-line border border-line-strong px-2.5 py-1 text-xs font-medium text-ink-soft transition inline-flex items-center gap-1.5"
            >
              {copiedKey ? (
                <>
                  <Check size={12} className="text-success" />
                  <span className="text-success font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="rounded-lg border border-ink bg-ink p-3.5 font-mono text-xs text-accent overflow-x-auto leading-relaxed ">
            {snippetMode === 'curl' ? curlSnippet : fetchSnippet}
          </pre>
        </div>
      )}

      {/* GEMINI AI SEARCH & ASK BAR (Powered by GEMINI_API_KEY) */}
      <div className="rounded-card border border-line bg-white p-4  space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative flex-1">
            <Sparkles size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent" />
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
              placeholder="Ask DealMemory AI: 'Why did onboarding drop off today?' or 'What did users love most?'"
              className="w-full rounded-lg border border-line bg-paper py-2.5 pl-10 pr-3 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent-line focus:bg-white transition sm:pr-12 lg:pr-28"
            />
            <button
              onClick={() => handleAskGemini()}
              disabled={aiLoading || !aiQuestion.trim()}
              aria-label="Ask Gemini"
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-deep disabled:opacity-50 sm:inline-flex lg:px-3"
            >
              {aiLoading ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
              <span className="hidden lg:inline">{aiLoading ? 'Thinking…' : 'Ask Gemini'}</span>
            </button>
          </div>

          <button
            onClick={() => handleAskGemini()}
            disabled={aiLoading || !aiQuestion.trim()}
            className="btn btn-primary w-full justify-center text-xs sm:hidden"
          >
            {aiLoading ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
            {aiLoading ? 'Thinking…' : 'Ask Gemini'}
          </button>

          <button
            onClick={() => setAiDrawerOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2.5 text-xs font-medium text-ink-soft hover:text-accent hover:border-accent-line transition  shrink-0"
          >
            <Bot size={15} className="text-accent" />
            <span>AI Playground</span>
          </button>
        </div>

        {/* Quick Suggested Prompt Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-mono text-ink-faint mr-1">Suggested:</span>
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
              className="rounded-lg bg-muted hover:bg-accent-tint hover:text-accent border border-line px-2.5 py-1 text-[11px] font-medium text-ink-soft transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Live Gemini AI Response Banner */}
        {aiAnswer && (
          <div className="mt-3 rounded-lg border border-line from-accent-tint via-white to-white p-4 text-xs text-ink  space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-accent text-white">
                  <Sparkles size={12} />
                </div>
                <span className="font-bold text-ink">DealMemory AI Analysis</span>
                <span className="rounded bg-accent-tint text-accent font-mono text-[10px] font-bold px-1.5 py-0.5">
                  {aiAnswer.model}
                </span>
                <span className="text-[11px] font-mono text-ink-faint">
                  Ground-truth database telemetry verified
                </span>
              </div>
              <button
                onClick={() => setAiAnswer(null)}
                className="text-ink-faint hover:text-ink-soft text-xs p-1"
              >
                <X size={14} />
              </button>
            </div>

            <FormattedAiResponse content={aiAnswer.answer} />

            {aiAnswer.sources && aiAnswer.sources.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-2 border-t border-line">
                <span className="text-[10px] font-mono text-ink-faint">Context used:</span>
                {aiAnswer.sources.slice(0, 3).map((s, i) => (
                  <span
                    key={i}
                    className="rounded bg-white border border-line px-2 py-0.5 text-[10px] font-mono text-accent"
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
        <div className="rounded-lg border border-line bg-white p-4  flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-ink-faint uppercase font-mono">
            Documents
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[26px] font-medium leading-tight tracking-[-0.025em] text-ink tabular-nums">
              {metrics.documents}
            </span>
            <span className="text-[11px] font-medium text-success font-mono">
              {metrics.documents > 0 ? '~ +100%' : '0%'}
            </span>
          </div>
          <div className="mt-4 flex items-center h-4">
            <div
              className={`h-4 w-1 rounded-full ${
                metrics.documents > 0 ? 'bg-accent' : 'bg-line'
              }`}
            />
          </div>
        </div>

        {/* MEMORIES */}
        <div className="rounded-lg border border-line bg-white p-4  flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-ink-faint uppercase font-mono">
            Memories
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[26px] font-medium leading-tight tracking-[-0.025em] text-ink tabular-nums">
              {metrics.memories}
            </span>
            <span className="text-[11px] font-medium text-success font-mono">
              {metrics.memories > 0 ? '~ +100%' : '0%'}
            </span>
          </div>
          <div className="mt-4 flex items-center h-4">
            <div
              className={`h-4 w-1 rounded-full ${
                metrics.memories > 0 ? 'bg-accent' : 'bg-line'
              }`}
            />
          </div>
        </div>

        {/* SEARCH REQUESTS / TELEMETRY */}
        <div className="rounded-lg border border-line bg-white p-4  flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-ink-faint uppercase font-mono">
            Search Requests
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[26px] font-medium leading-tight tracking-[-0.025em] text-ink tabular-nums">
              {metrics.searchRequests}
            </span>
            <span className="text-[11px] font-medium text-success font-mono">
              {metrics.searchRequests > 0 ? '~ +100%' : '0%'}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 h-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-${(idx % 3) + 1} w-1 rounded-full ${
                  metrics.searchRequests > idx ? 'bg-accent' : 'bg-line'
                }`}
              />
            ))}
          </div>
        </div>

        {/* NAMESPACES */}
        <div className="rounded-lg border border-line bg-white p-4  flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-ink-faint uppercase font-mono">
            Namespaces
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[26px] font-medium leading-tight tracking-[-0.025em] text-ink tabular-nums">
              {metrics.namespaces}
            </span>
            <span className="text-[11px] font-medium text-success font-mono">
              {metrics.namespaces > 0 ? '~ +100%' : '0%'}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 h-4">
            {Array.from({ length: Math.min(metrics.namespaces, 4) }).map((_, idx) => (
              <div key={idx} className="h-4 w-1 rounded-full bg-accent" />
            ))}
            {metrics.namespaces === 0 && <div className="h-4 w-1 rounded-full bg-line" />}
          </div>
        </div>

        {/* CONNECTORS */}
        <div className="rounded-lg border border-line bg-white p-4  flex flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-ink-faint uppercase font-mono">
            Connectors
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[26px] font-medium leading-tight tracking-[-0.025em] text-ink tabular-nums">
              {metrics.connectors}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 h-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1 w-1 rounded-full ${
                  metrics.connectors > idx ? 'bg-accent' : 'bg-line'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: Requests this month (2/3) + Namespaces (1/3) */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left (2/3): Requests this month Chart */}
        <div className="flex min-h-[290px] min-w-0 flex-col justify-between overflow-hidden rounded-lg border border-line bg-white p-6 lg:col-span-2">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-medium text-[13px] text-ink">Requests this month</h2>
                <p className="text-[11px] text-ink-faint mt-0.5">
                  Real-time telemetry and memory actions received over the last 30 days
                </p>
              </div>

              {/* Legend matching Supermemory Console */}
              <div className="flex items-center gap-3 text-[11px] font-medium text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-accent-line" />
                  MEMORIES
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-accent" />
                  SEARCHES
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-accent" />
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
                            ? '#e9e9ec'
                            : isPeak
                            ? '#93c5fd'
                            : item.memories > 0
                            ? '#0562ef'
                            : '#3b82f6',
                      }}
                    />
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-20">
                      <div className="rounded-lg bg-ink text-white text-[10px] py-1 px-2 whitespace-nowrap ">
                        <p className="font-bold">{item.label || `Day ${item.day}`}</p>
                        <p className="text-ink-faint">{item.total} requests</p>
                        {item.memories > 0 && (
                          <p className="text-accent">{item.memories} memories</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom X-axis Labels */}
            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-ink-faint border-t border-line pt-1.5">
              <span>{timeRange === '7d' ? '7D AGO' : timeRange === '1d' ? 'TODAY' : '30D AGO'}</span>
              <span>NOW</span>
            </div>
          </div>
        </div>

        {/* Right (1/3): Namespaces Card */}
        <div className="flex min-w-0 flex-col justify-between overflow-hidden rounded-lg border border-line bg-white p-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-[13px] text-ink">Namespaces</h2>
              <span className="text-[10px] font-mono text-ink-faint">
                {namespaces.length} active
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {namespaces.length === 0 ? (
                <div className="text-xs text-ink-faint py-4 text-center">
                  No namespaces created yet.
                </div>
              ) : (
                namespaces.map((ns) => (
                  <div key={ns.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                      <code className="font-mono text-ink-soft font-medium truncate">
                        {ns.slug || ns.name.toLowerCase().replace(/\s+/g, '_')}
                      </code>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className="h-1.5 rounded-full bg-accent"
                        style={{
                          width: `${Math.max(16, Math.min(64, (ns.eventsCount || 1) * 8))}px`,
                        }}
                      />
                      <span className="font-mono text-[11px] text-ink-soft tabular-nums">
                        {ns.eventsCount}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-line flex items-center justify-between">
            <Link
              href="/settings"
              className="text-xs font-medium text-accent hover:text-accent inline-flex items-center gap-1"
            >
              <span>Manage namespaces</span>
              <ChevronRight size={13} />
            </Link>
            <Link
              href="/settings"
              className="text-[11px] font-mono text-ink-faint hover:text-ink-soft"
            >
              API Keys ↗
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Recent memories (1/2) + Latest searches (1/2) */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left: Recent memories */}
        <div className="min-w-0 overflow-hidden rounded-lg border border-line bg-white p-5">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div>
              <h2 className="font-medium text-[13px] text-ink">Recent memories</h2>
              <p className="text-[11px] text-ink-faint mt-0.5">
                Synthesized customer memory capsules from real user telemetry
              </p>
            </div>
            <Link
              href="/journeys"
              className="text-xs font-medium text-accent hover:text-accent inline-flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="mt-3 space-y-3">
            {recentMemories.length === 0 ? (
              <p className="text-xs text-ink-faint py-6 text-center">
                No customer memories synthesized yet.
              </p>
            ) : (
              recentMemories.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  href={`/journeys/${encodeURIComponent(item.userId)}`}
                  className="group flex items-start gap-2.5 rounded-lg p-2 transition hover:bg-paper"
                >
                  <FileText
                    size={15}
                    className="mt-0.5 shrink-0 text-ink-faint group-hover:text-accent transition"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-ink group-hover:text-accent transition truncate">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-soft line-clamp-1">
                      {item.story || item.summary}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className="max-w-[88px] truncate rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-ink-soft"
                      title={item.namespace}
                    >
                      {item.namespace}
                    </span>
                    <span className="text-[10px] font-mono text-ink-faint whitespace-nowrap">
                      {item.timeAgo}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right: User-Performed Events / Real Telemetry Stream */}
        <div className="min-w-0 overflow-hidden rounded-lg border border-line bg-white p-5">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-medium text-[13px] text-ink">User-performed events</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-success-tint px-2 py-0.5 text-[10px] font-mono font-medium text-success border border-success/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Live Ingest
                </span>
              </div>
              <p className="text-[11px] text-ink-faint mt-0.5">
                Real-time product actions, milestones &amp; telemetry received from your site
              </p>
            </div>
            <Link
              href="/events"
              className="text-xs font-medium text-accent hover:text-accent inline-flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {userEvents.length === 0 && latestSearches.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Activity size={24} className="mx-auto text-ink-faint" />
                <p className="text-xs text-ink-soft font-medium">
                  No user events recorded yet.
                </p>
                <p className="text-[11px] text-ink-faint max-w-xs mx-auto">
                  Stream product events via the cURL snippet above or click &quot;Simulate Live Events&quot; to test.
                </p>
              </div>
            ) : userEvents.length > 0 ? (
              userEvents.slice(0, 6).map((evt) => {
                const propEntries = Object.entries(evt.properties || {}).slice(0, 2);
                return (
                  <Link
                    key={evt.id}
                    href={`/journeys/${encodeURIComponent(evt.userId)}`}
                    className="group flex items-start justify-between gap-3 rounded-lg p-2 transition hover:bg-paper border border-transparent hover:border-line"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {evt.isMilestone ? (
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
                      ) : evt.isFailure ? (
                        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-danger" />
                      ) : (
                        <Activity size={15} className="mt-0.5 shrink-0 text-accent" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-xs text-ink group-hover:text-accent transition">
                            {evt.readableName}
                          </span>
                          <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-ink-soft font-medium">
                            {evt.name}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] font-mono text-ink-soft truncate">
                          {evt.userId}
                        </p>
                        {propEntries.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {propEntries.map(([k, v]) => (
                              <span
                                key={k}
                                className="max-w-full break-words rounded border border-line bg-accent-tint px-1 py-0.5 text-[9px] font-mono text-accent"
                              >
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-ink-faint shrink-0 whitespace-nowrap mt-0.5">
                      {evt.timeAgo}
                    </span>
                  </Link>
                );
              })
            ) : (
              latestSearches.slice(0, 6).map((search) => (
                <div
                  key={search.id}
                  className="flex items-start justify-between gap-3 text-xs py-1"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Search size={14} className="mt-0.5 shrink-0 text-ink-faint" />
                    <span className="font-mono text-ink-soft truncate text-[11px]">
                      {search.query}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-ink-faint shrink-0">
                    {search.latencyMs} MS
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FLOATING AI CHAT BUBBLE (Exact Supermemory Console Chat Widget) */}
      <div className="fixed bottom-5 right-4 z-40 sm:bottom-6 sm:right-6">
        <button
          onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white  hover:bg-ink transition hover:scale-105"
          title="Ask DealMemory AI"
        >
          {aiDrawerOpen ? <X size={20} /> : <MessageSquare size={20} />}
        </button>
      </div>

      {/* GEMINI AI ASSISTANT DRAWER */}
      {aiDrawerOpen && (
        <div className="fixed bottom-[4.75rem] left-3 right-3 z-50 flex h-[min(520px,calc(100dvh-7rem))] flex-col overflow-hidden rounded-card border border-line bg-white animate-in fade-in slide-in-from-bottom-5 sm:bottom-20 sm:left-auto sm:right-6 sm:w-96">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-line bg-ink p-4 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
                <Sparkles size={14} />
              </div>
              <div>
                <h3 className="font-medium text-[12px]">DealMemory AI</h3>
                <p className="text-[10px] text-accent font-mono">
                  Gemini 2.5 Flash · Ground-truth memory
                </p>
              </div>
            </div>
            <button
              onClick={() => setAiDrawerOpen(false)}
              className="text-ink-faint hover:text-white p-1"
            >
              <X size={14} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#ffffff]">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8 px-4 space-y-2">
                <Bot className="mx-auto h-8 w-8 text-accent" />
                <p className="text-xs font-semibold text-ink">
                  Ask anything about your users &amp; telemetry
                </p>
                <p className="text-[11px] text-ink-soft leading-relaxed">
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
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-accent text-white font-medium rounded-br-xs'
                        : 'bg-white border border-line text-ink  rounded-bl-xs'
                    }`}
                  >
                    {msg.sender === 'user' ? msg.text : <FormattedAiResponse content={msg.text} />}
                  </div>
                  <span className="mt-1 text-[9px] font-mono text-ink-faint px-1">
                    {msg.time}
                  </span>
                </div>
              ))
            )}
            {aiLoading && (
              <div className="flex items-center gap-2 text-xs text-ink-soft bg-white border border-line p-2.5 rounded-lg w-fit ">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                <span className="font-mono text-[11px]">Gemini is analyzing user telemetry…</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-line p-3 bg-white flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
              placeholder="Ask about users, drop-offs, dwell times…"
              className="flex-1 rounded-lg border border-line px-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent"
            />
            <button
              onClick={() => handleAskGemini()}
              disabled={aiLoading || !chatInput.trim()}
              className="rounded-lg bg-accent text-white p-2 hover:bg-accent-deep disabled:opacity-40 transition"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
