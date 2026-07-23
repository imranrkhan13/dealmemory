'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';

type Event = {
  id: string;
  name: string;
  userId?: string;
  anonymousId: string;
  url?: string;
  occurredAt: string;
  properties: Record<string, string | number | boolean | null>;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const projectsResponse = await fetch('/api/projects', { cache: 'no-store' });
        const projectsData = await projectsResponse.json();
        const project = Array.isArray(projectsData?.projects) ? projectsData.projects[0] : null;
        if (!project?.id) {
          setEvents([]);
          return;
        }

        const eventsResponse = await fetch(`/api/v1/events/recent?projectId=${encodeURIComponent(project.id)}&limit=500`, { cache: 'no-store' });
        const eventsData = await eventsResponse.json();
        if (!eventsResponse.ok) throw new Error(eventsData?.error ?? 'Could not load events');
        setEvents(Array.isArray(eventsData?.events) ? eventsData.events : []);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Could not load events');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <AppShell>
      <ProjectGate>
        <main className="mx-auto max-w-5xl px-5 py-10">
          <p className="text-sm font-semibold text-[#4F46E5]">Events</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Every product action</h1>
          <p className="mt-2 text-sm text-[#6B7280]">The 500 most recent actions captured for this project.</p>

          {loading ? <p className="mt-7 text-sm text-[#6B7280]">Loading events…</p> : null}
          {error ? <p className="mt-7 text-sm text-red-600">{error}</p> : null}

          {!loading && !error && events.length > 0 ? (
            <div className="mt-7 divide-y divide-[#E7E2DA] border-y border-[#E7E2DA] bg-[#FFFDF9]">
              {events.map((event) => (
                <div className="p-4 text-sm" key={event.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="font-medium">{event.name.replaceAll('_', ' ')}</p>
                    <time className="text-xs text-[#6B7280]">{new Date(event.occurredAt).toLocaleString()}</time>
                  </div>
                  <p className="mt-1 text-xs text-[#6B7280]">{event.userId ?? event.anonymousId} · {event.url ?? 'No path'}</p>
                  {Object.keys(event.properties).length > 0 ? (
                    <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#4B5563]">
                      {Object.entries(event.properties).map(([key, value]) => <div key={key}><dt className="inline text-[#6B7280]">{key.replaceAll('_', ' ')}: </dt><dd className="inline font-medium">{String(value)}</dd></div>)}
                    </dl>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {!loading && !error && events.length === 0 ? (
            <p className="mt-7 border-y border-[#E7E2DA] py-10 text-sm text-[#6B7280]">
              No actions received yet. Copy the ready-to-use AgentLens setup from Settings, or add the demo journey.
            </p>
          ) : null}
        </main>
      </ProjectGate>
    </AppShell>
  );
}
