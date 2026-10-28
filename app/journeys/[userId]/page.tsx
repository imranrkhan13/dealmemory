'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';
import { Brain, ArrowLeft, MessageSquareText, Sparkles, CheckCircle2, AlertTriangle, Clock3, Terminal, Copy, Check } from 'lucide-react';

type Event = {
  id: string;
  name: string;
  sessionId: string;
  occurredAt: string;
  properties: Record<string, string | number | boolean | null>;
};

type Journey = { userId: string; goal?: string; events: Event[]; memories?: unknown[] };
type Response = { journey: Journey; state: string; recommendation?: string };

export default function JourneyPage() {
  const { userId } = useParams<{ userId: string }>();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    fetch(`/api/v1/journeys/${encodeURIComponent(userId)}${query}`, { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body?.error ?? 'Could not load journey');
        return body;
      })
      .then(setData)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load journey'));
  }, [projectId, userId]);

  return (
    <AppShell>
      <ProjectGate>
        <main className="space-y-8">
          <Link
            href="/journeys"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} /> Back to all journeys
          </Link>

          {!data && !error && (
            <div className="py-20 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              Loading customer timeline…
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300">
              <p>{error}</p>
              <Link className="btn btn-primary mt-4 text-xs" href="/journeys">
                Return to journeys
              </Link>
            </div>
          )}

          {data && <JourneyDetails data={data} />}
        </main>
      </ProjectGate>
    </AppShell>
  );
}

function JourneyDetails({ data }: { data: Response }) {
  const journey = data.journey;
  const [copied, setCopied] = useState(false);

  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(journey.userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const isHealthy = !data.state.includes('stuck') && !data.state.includes('failed');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow">
              <Brain size={13} /> User Journey Replay
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {journey.userId}
            </h1>
            <button
              onClick={copyUserId}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900/80 text-zinc-400 hover:text-white transition-colors"
              title="Copy user ID"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            {journey.events.length} chronological actions observed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
              isHealthy
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            {data.state.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Main Grid: Timeline + AI Memory Sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Timeline */}
        <section className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <h2 className="font-bold text-lg text-white">Observed Action Sequence</h2>
              <p className="text-xs text-zinc-400">
                Deterministic, tamper-proof progression from your application SDK.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">{journey.events.length} steps</span>
          </div>

          <ol className="relative mt-8 ml-3 border-l border-indigo-500/30 space-y-8">
            {journey.events.map((event, idx) => {
              const isFailed = event.name.includes('failed') || event.name.includes('error');
              const propKeys = Object.keys(event.properties);

              return (
                <li key={event.id} className="relative pl-7">
                  {/* Glowing Node Dot */}
                  <span
                    className={`absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full border ${
                      isFailed
                        ? 'border-rose-400 bg-rose-500 shadow-sm shadow-rose-500'
                        : 'border-indigo-400 bg-indigo-600 shadow-sm shadow-indigo-500'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>

                  <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-4 transition hover:border-white/[0.12]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-white capitalize">
                        {event.name.replace(/_/g, ' ')}
                      </p>
                      <time className="text-[11px] font-mono text-zinc-500">
                        {new Date(event.occurredAt).toLocaleString()}
                      </time>
                    </div>

                    <p className="mt-1 text-xs text-zinc-500 font-mono">
                      session: {event.sessionId}
                    </p>

                    {propKeys.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.04]">
                        {Object.entries(event.properties).map(([k, v]) => (
                          <span
                            key={k}
                            className="rounded-md border border-white/[0.06] bg-zinc-900 px-2 py-0.5 text-[11px] font-mono text-zinc-300"
                          >
                            <span className="text-zinc-500">{k}: </span>
                            <span className="font-medium text-indigo-300">{String(v)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Aside: AI Copilot Context */}
        <aside className="space-y-4">
          {/* User Goal */}
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 shadow-xl backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Stated User Goal
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {journey.goal ?? 'Evaluate application and setup integration'}
            </p>
          </div>

          {/* Recommended Next Action */}
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 shadow-xl backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Autonomous Recommendation
            </p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-200">
              {data.recommendation ?? 'Journey is proceeding along optimal milestone path.'}
            </p>
          </div>

          {/* Remembered Context / Supermemory */}
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 text-indigo-400">
              <MessageSquareText size={16} />
              <p className="font-semibold text-xs uppercase tracking-wider text-zinc-200">
                Persistent Memory
              </p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-400">
              {journey.memories?.length
                ? `${journey.memories.length} vector memory record(s) indexed for this user.`
                : 'Session context and failure states are automatically remembered for seamless user resumption.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
