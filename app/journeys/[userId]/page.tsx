'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';
import { Brain, ArrowLeft, MessageSquareText, Copy, Check } from 'lucide-react';

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
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-sky-700 transition-colors"
          >
            <ArrowLeft size={13} /> Back to all journeys
          </Link>

          {!data && !error && (
            <div className="py-20 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
              Loading customer timeline…
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow">
              <Brain size={13} /> User Journey Replay
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {journey.userId}
            </h1>
            <button
              onClick={copyUserId}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 transition-colors shadow-xs"
              title="Copy user ID"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-mono">
            {journey.events.length} chronological actions observed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
              isHealthy
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {data.state.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Main Grid: Timeline + AI Memory Sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Timeline */}
        <section className="rounded-2xl border border-sky-100 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-bold text-lg text-slate-900">Observed Action Sequence</h2>
              <p className="text-xs text-slate-500">
                Deterministic, tamper-proof progression from your application SDK.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{journey.events.length} steps</span>
          </div>

          <ol className="relative mt-8 ml-3 border-l border-sky-200 space-y-8">
            {journey.events.map((event) => {
              const isFailed = event.name.includes('failed') || event.name.includes('error');
              const propKeys = Object.keys(event.properties);

              return (
                <li key={event.id} className="relative pl-7">
                  {/* Glowing Node Dot */}
                  <span
                    className={`absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full border ${
                      isFailed
                        ? 'border-rose-400 bg-rose-500 shadow-sm shadow-rose-500/30'
                        : 'border-sky-400 bg-sky-600 shadow-sm shadow-sky-500/30'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>

                  <div className="rounded-xl border border-sky-100/80 bg-slate-50/60 p-4 transition hover:border-sky-200 hover:bg-sky-50/20">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-slate-900 capitalize">
                        {event.name.replace(/_/g, ' ')}
                      </p>
                      <time className="text-[11px] font-mono text-slate-400">
                        {new Date(event.occurredAt).toLocaleString()}
                      </time>
                    </div>

                    <p className="mt-1 text-xs text-slate-500 font-mono">
                      session: {event.sessionId}
                    </p>

                    {propKeys.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                        {Object.entries(event.properties).map(([k, v]) => (
                          <span
                            key={k}
                            className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-mono text-slate-700 shadow-xs"
                          >
                            <span className="text-slate-400">{k}: </span>
                            <span className="font-medium text-sky-700">{String(v)}</span>
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
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-700 font-mono">
              Stated User Goal
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {journey.goal ?? 'Evaluate application and setup integration'}
            </p>
          </div>

          {/* Recommended Next Action */}
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 font-mono">
              Autonomous Recommendation
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-700">
              {data.recommendation ?? 'Journey is proceeding along optimal milestone path.'}
            </p>
          </div>

          {/* Remembered Context */}
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sky-600">
              <MessageSquareText size={16} />
              <p className="font-semibold text-xs uppercase tracking-wider text-slate-900 font-mono">
                Persistent Memory
              </p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
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
