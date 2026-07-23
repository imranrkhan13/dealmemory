'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';

type Journey = {
  userId: string;
  events: { id: string }[];
  state: string;
  blocker?: string;
  recommendation?: string;
  inactiveHours: number;
};

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <AppShell>
      <ProjectGate>
        <main className="mx-auto max-w-5xl px-5 py-10">
          <p className="text-sm font-semibold text-[#4F46E5]">AgentLens Intelligence</p>
          <h1 className="mt-2 text-4xl font-bold">Activation journeys</h1>
          <p className="mt-3 text-gray-500">Understand where users activate, struggle, and convert.</p>

          {loading ? <p className="mt-10 text-sm text-[#6B6B6B]">Loading journeys…</p> : null}
          {error ? <p className="mt-10 text-sm text-red-600">{error}</p> : null}
          {!loading && !error && journeys.length === 0 ? (
            <div className="mt-10 rounded-xl border border-[#E7E2DA] bg-white p-10 text-sm text-[#6B6B6B]">
              No activation events yet. Send SDK events or add a demo journey to get started.
            </div>
          ) : null}

          {!loading && !error && journeys.length > 0 ? (
            <div className="mt-10 grid gap-4">
              {journeys.map((journey) => (
                <Link
                  key={journey.userId}
                  href={`/journeys/${encodeURIComponent(journey.userId)}${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ''}`}
                  className="rounded-xl border border-[#E7E2DA] bg-white p-6 transition hover:shadow-lg"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">{journey.userId}</h2>
                      <p className="mt-1 text-sm text-gray-500">{journey.events.length} observed events</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium capitalize">{journey.state.replace('_', ' ')}</p>
                      <p className="mt-1 text-xs text-gray-500">{journey.inactiveHours}h inactive</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
                    <div><p className="font-medium">Current blocker</p><p className="mt-1 text-gray-600">{journey.blocker ?? 'None detected'}</p></div>
                    <div><p className="font-medium">Recommended next action</p><p className="mt-1 text-gray-600">{journey.recommendation ?? 'Everything looks healthy.'}</p></div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </main>
      </ProjectGate>
    </AppShell>
  );
}
