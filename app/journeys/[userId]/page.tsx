'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';
import { MessageSquareText } from 'lucide-react';

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
        <main className="mx-auto max-w-5xl px-5 py-10">
          {!data && !error ? <p className="text-sm text-[#6B6B6B]">Loading journey…</p> : null}
          {error ? <><p className="text-sm text-red-600">{error}</p><Link className="btn mt-5" href="/journeys">Back to journeys</Link></> : null}
          {data ? <JourneyDetails data={data} /> : null}
        </main>
      </ProjectGate>
    </AppShell>
  );
}

function JourneyDetails({ data }: { data: Response }) {
  const journey = data.journey;
  return (
    <>
      <p className="text-sm font-semibold text-[#4F46E5]">User journey</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{journey.userId}</h1>
        <span className="rounded-full bg-[#FFF7ED] px-3 py-1 text-sm font-semibold capitalize text-[#B45309]">{data.state.replace('_', ' ')}</span>
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_280px]">
        <section>
          <h2 className="font-semibold">Observed product events</h2>
          <p className="mt-1 text-sm text-[#6B6B6B]">Chronological, deterministic evidence from the host product.</p>
          <ol className="mt-6 border-l border-[#E8E7E3]">
            {journey.events.map((event) => (
              <li key={event.id} className="relative pb-7 pl-6">
                <span className={`absolute -left-[7px] top-0 h-3.5 w-3.5 rounded-full ${event.name.includes('failed') ? 'bg-[#B45309]' : 'bg-[#4F46E5]'}`} />
                <p className="font-medium capitalize">{event.name.replaceAll('_', ' ')}</p>
                <p className="mt-1 text-sm text-[#6B6B6B]">{new Date(event.occurredAt).toLocaleString()} · session {event.sessionId}</p>
                {Object.keys(event.properties).length > 0 ? <p className="mt-2 text-sm text-[#6B6B6B]">{Object.entries(event.properties).map(([key, value]) => `${key.replaceAll('_', ' ')}: ${value}`).join(' · ')}</p> : null}
              </li>
            ))}
          </ol>
        </section>

        <aside className="space-y-5">
          <div className="rounded-xl border border-[#E8E7E3] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">Original goal</p><p className="mt-2 font-medium">{journey.goal ?? 'No stated goal captured'}</p></div>
          <div className="rounded-xl border border-[#E8E7E3] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">Recommended next action</p><p className="mt-2 text-sm leading-6">{data.recommendation ?? 'Everything looks healthy.'}</p></div>
          <div className="rounded-xl border border-[#E8E7E3] bg-white p-5"><div className="flex gap-2"><MessageSquareText size={16} className="text-[#4F46E5]" /><p className="font-semibold">Remembered user context</p></div><p className="mt-3 text-sm leading-6 text-[#6B6B6B]">{journey.memories?.length ? `${journey.memories.length} memory item${journey.memories.length === 1 ? '' : 's'} retrieved.` : 'No remembered context was returned for this journey.'}</p></div>
        </aside>
      </div>
    </>
  );
}
