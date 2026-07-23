'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';

type Project = { id: string; name: string };

export default function DemoPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/projects', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setProject(Array.isArray(data?.projects) ? data.projects[0] ?? null : null))
      .catch(() => setProject(null));
  }, []);

  const runDemo = async () => {
    if (!project) return;
    setBusy(true);
    setStatus('Sending demo events…');

    try {
      const response = await fetch('/api/v1/demo/emit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? 'Could not send demo events');
      setStatus(`Demo journey added for ${data.userId}. View it in your dashboard.`);
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : 'Could not send demo events');
    } finally {
      setBusy(false);
    }
  };

  const resetDemo = async () => {
    if (!project) return;
    setBusy(true);
    setStatus('Removing demo events…');

    try {
      const response = await fetch('/api/v1/demo/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? 'Could not remove demo events');
      setStatus(`Removed ${data.removed} demo event${data.removed === 1 ? '' : 's'}.`);
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : 'Could not remove demo events');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <ProjectGate>
        <main className="mx-auto max-w-4xl px-5 py-10">
          <p className="text-sm font-semibold text-[#4F46E5]">Demo flow</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">See a complete activation journey</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B6B6B]">
            Add a safe, clearly marked event sequence to {project?.name ?? 'your project'} without exposing an API key in the browser.
          </p>

          <div className="mt-8 rounded-2xl border border-[#E7E2DA] bg-[#FFFDF9] p-6">
            <p className="font-semibold">The demo journey</p>
            <p className="mt-2 text-sm text-[#6B6B6B]">
              Trial started → goal set → GitHub connection failed → repository connected → first value reached.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn btn-primary" disabled={!project || busy} onClick={runDemo}>
                {busy ? 'Working…' : 'Add demo journey'}
              </button>
              <button className="btn" disabled={!project || busy} onClick={resetDemo}>
                Remove demo data
              </button>
              <Link className="btn" href="/overview">View overview</Link>
            </div>

            {status ? <p className="mt-4 text-sm text-[#4F46E5]" role="status">{status}</p> : null}
          </div>

          <div className="mt-10 rounded-2xl border border-[#E7E2DA] bg-white p-6">
            <h2 className="text-lg font-semibold">Use real events when you are ready</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
              The demo uses the same journey analysis as SDK data, but it is intentionally tagged and can be removed at any time.
            </p>
            <Link className="btn mt-4" href="/sdk">Open SDK setup</Link>
          </div>
        </main>
      </ProjectGate>
    </AppShell>
  );
}
