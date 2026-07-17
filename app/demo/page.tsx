'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';

const DEMO_USER_ID = 'demo_user_001';

function generateId() {
  return crypto.randomUUID();
}

function createEvent(projectKey: string, name: string, userId: string, anonymousId: string, sessionId: string, occurredAt: string, properties = {}) {
  return {
    id: generateId(),
    projectKey,
    name,
    userId,
    anonymousId,
    sessionId,
    occurredAt,
    url: window.location.href,
    referrer: document.referrer,
    properties,
  };
}

export default function DemoPage() {
  const [project, setProject] = useState<any>(null);
  const [status, setStatus] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('activation-memory-project') ?? 'null');
    setProject(stored);
  }, []);

  const emitDemoFlow = async () => {
    if (!project) return;
    setBusy(true);
    setStatus('Sending demo events...');
    const anonymousId = generateId();
    const sessionId = generateId();
    const baseTime = Date.now() - 60000;
    const events = [
      createEvent(project.testKey, 'trial_started', DEMO_USER_ID, anonymousId, sessionId, new Date(baseTime).toISOString()),
      createEvent(project.testKey, 'goal_set', DEMO_USER_ID, anonymousId, sessionId, new Date(baseTime + 1000).toISOString(), { goal: 'Generate my first map' }),
      createEvent(project.testKey, 'integration_connection_failed', DEMO_USER_ID, anonymousId, sessionId, new Date(baseTime + 2000).toISOString(), { error: 'OAuth callback failed' }),
      createEvent(project.testKey, 'session_returned', DEMO_USER_ID, anonymousId, sessionId, new Date(baseTime + 3000).toISOString()),
      createEvent(project.testKey, 'repository_connected', DEMO_USER_ID, anonymousId, sessionId, new Date(baseTime + 4000).toISOString()),
      createEvent(project.testKey, 'first_map_generated', DEMO_USER_ID, anonymousId, sessionId, new Date(baseTime + 5000).toISOString()),
    ];

    try {
      const response = await fetch('/api/v1/events/batch', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-project-key': project.testKey,
        },
        body: JSON.stringify({ events }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Failed to send events');
      setResult(json);
      setStatus('Demo events sent successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <ProjectGate>
        <main className="mx-auto max-w-4xl px-5 py-10">
          <p className="text-sm font-semibold text-[#4F46E5]">Demo flow</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Emit a real SDK event stream</h1>
          <p className="mt-3 text-sm leading-6 text-[#6B6B6B]">
            This page sends a canonical activation event sequence into the same `/api/v1/events/batch` ingestion API used by the app.
          </p>

          <div className="mt-8 space-y-4 rounded-2xl border border-[#E7E2DA] bg-[#FFFDF9] p-6">
            <div className="grid gap-2 text-sm text-[#6B6B6B]">
              <div className="flex justify-between"><span>Project key</span><code className="mono">{project?.testKey ?? 'missing'}</code></div>
              <div className="flex justify-between"><span>User</span><span>{DEMO_USER_ID}</span></div>
              <div className="flex justify-between"><span>Stream</span><span>trial_started → integration_connection_failed → session_returned → repository_connected → first_map_generated</span></div>
            </div>

            <button
              className="btn btn-primary mt-4"
              disabled={!project || busy}
              onClick={emitDemoFlow}
            >
              {busy ? 'Sending events…' : 'Send canonical demo flow'}
            </button>

            {status && <p className="text-sm text-[#4F46F0]">{status}</p>}
            {result && (
              <div className="rounded-xl border border-[#E7E2DA] bg-white p-4 text-sm text-[#6B6B6B]">
                <p className="font-semibold">Batch result</p>
                <pre className="mt-2 overflow-x-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>

          <div className="mt-10 rounded-2xl border border-[#E7E2DA] bg-white p-6">
            <h2 className="text-lg font-semibold">What this emits</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#6B6B6B]">
              <li><strong>trial_started</strong> starts the activation journey.</li>
              <li><strong>goal_set</strong> captures the intent behind the trial.</li>
              <li><strong>integration_connection_failed</strong> records the blocker.</li>
              <li><strong>repository_connected</strong> records recovery.</li>
              <li><strong>first_map_generated</strong> reaches activation and unlocks checkout eligibility.</li>
            </ul>
          </div>
        </main>
      </ProjectGate>
    </AppShell>
  );
}
