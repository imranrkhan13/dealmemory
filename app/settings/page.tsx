'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';

export default function Settings() {
  const [project, setProject] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('activation-memory-project') ?? 'null');
    setProject(stored);

    if (!stored) {
      setLoading(false);
      return;
    }

    fetch(`/api/v1/integration-status?projectKey=${stored.testKey}`)
      .then((res) => res.json())
      .then(setStatus)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <ProjectGate>
        <main className="mx-auto max-w-4xl px-5 py-10">
          <p className="text-sm font-semibold text-[#4F46E5]">Project settings</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Keys and SDK setup</h1>

          {project && (
            <div className="mt-8 divide-y divide-[#E7E2DA] border-y border-[#E7E2DA] bg-[#FFFDF9]">
              {[
                ['Test API key', project.testKey],
                ['Live API key', project.liveKey],
                ['Webhook secret', project.webhookSecret],
              ].map(([label, value]) => (
                <div className="flex justify-between p-5 text-sm" key={String(label)}>
                  <span>{label}</span>
                  <code className="mono">{value}</code>
                </div>
              ))}

              <div className="flex justify-between p-5 text-sm">
                <span>Ingestion status</span>
                <span>{loading ? 'Loading…' : status?.ingestion ?? 'unknown'}</span>
              </div>
              <div className="flex justify-between p-5 text-sm">
                <span>Events received</span>
                <span>{loading ? '…' : status?.eventCount ?? 0}</span>
              </div>
              <div className="flex justify-between p-5 text-sm">
                <span>Latest event</span>
                <span>{loading ? '…' : status?.latestEvent ? new Date(status.latestEvent).toLocaleString() : 'No events yet'}</span>
              </div>
            </div>
          )}
        </main>
      </ProjectGate>
    </AppShell>
  );
}
