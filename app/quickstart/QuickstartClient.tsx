'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Copy, Play, Terminal, ArrowRight } from 'lucide-react';

interface TrialUser {
  id: string;
  email: string;
  goal: string;
  blocker: string;
  lastAction: string;
  status: string;
}

export default function QuickstartClient() {
  const [copied, setCopied] = useState(false);
  const [trialUser, setTrialUser] = useState<TrialUser | null>(null);
  const [loading, startTransition] = useTransition();

  const snippet = `import { DealMemory } from 'dealmemory';

const dm = new DealMemory();

dm.identify('sarah@acme.inc', { plan: 'trial' });
dm.setGoal('Map repository architecture');
dm.trialStarted();

dm.integrationConnected({ provider: 'github' });
dm.track('oauth_callback_failed', { code: 401 });
dm.firstValueReached({ repo: 'org/repo-main' });`;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const seed = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/v1/quickstart/seed', { method: 'POST' });
        if (!res.ok) throw new Error('demo seed failed');
        const body = await res.json();
        const user = body.user;
        if (user) {
          setTrialUser({
            id: user.userId,
            email: user.email,
            goal: user.goal || 'Map repository architecture',
            blocker: user.blocker || 'GitHub authorization callback failed',
            lastAction: user.lastAction?.readableName || 'Oauth callback failed',
            status: user.status || 'friction',
          });
        }
      } catch {
        /* keep the UI usable even if the demo endpoint is offline */
      }
    });
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-5 py-12 lg:grid-cols-[220px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-6 space-y-1.5 text-[13px]">
          <div className="eyebrow mb-2">On this page</div>
          <a href="#snippet" className="block text-ink-soft hover:text-ink">
            The snippet
          </a>
          <a href="#run" className="block text-ink-soft hover:text-ink">
            Run it
          </a>
          <a href="#result" className="block text-ink-soft hover:text-ink">
            What DealMemory sees
          </a>
        </div>
      </aside>

      <main className="min-w-0 pb-20 text-[14.5px] leading-relaxed text-ink-soft">
        <span className="eyebrow">Quickstart</span>
        <h1 className="mt-2 text-[32px] font-medium leading-tight tracking-[-0.03em] text-ink">
          See DealMemory from one snippet.
        </h1>
        <p className="mt-3 text-[15px]">
          Copy the snippet, paste it into your console, and DealMemory will record a sample trial, reconstruct
          the journey, and show you exactly where it broke.
        </p>

        <section id="snippet" className="mt-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-ink">The snippet</p>
              <p className="mt-1 text-[13px]">
                This is the whole integration. The key is read from{' '}
                <code className="font-mono text-[12.5px]">DEALMEMORY_API_KEY</code>, so you do not paste it
                into the code.
              </p>
            </div>
            <button
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-ink bg-ink px-3 py-1.5 text-xs text-ink-faint hover:text-white"
              onClick={() => copy(snippet)}
            >
              <Copy size={12} />
              {copied ? 'Copied' : 'Copy snippet'}
            </button>
          </div>

          <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-[#0f1115] p-4 text-[12.5px] leading-relaxed text-[#e6e8ec]">
            <code>{snippet}</code>
          </pre>
        </section>

        <section id="run" className="mt-12">
          <h2 className="scroll-mt-20 text-[22px] font-medium tracking-[-0.02em] text-ink">
            Run it on the demo project
          </h2>
          <p className="mt-3 text-[15px]">
            The demo project already has a project key configured. Seed a trial user and watch the journey
            appear.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm text-ink hover:bg-paper"
              onClick={seed}
              disabled={loading || !!trialUser}
            >
              <Play size={14} className="text-accent" />
              {loading ? 'Seeding…' : trialUser ? 'Seeded' : 'Create trial user'}
            </button>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm text-ink hover:bg-paper"
            >
              <Terminal size={14} />
              Open guided demo
            </Link>
          </div>

          <p className="mt-3 text-[13px] text-ink-soft">
            Behind the scenes this posts a small batch of events to{' '}
            <code className="font-mono text-[12.5px]">/api/v1/events/batch</code>, then DealMemory rebuilds the
            user timeline, detects the blocker, and surfaces a recovery prompt.
          </p>
        </section>

        {trialUser && (
          <section
            id="result"
            className="mt-12 rounded-card border border-line bg-paper p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="eyebrow">Journey reconstructed</span>
                <h2 className="mt-2 text-[22px] font-medium leading-tight tracking-[-0.02em] text-ink">
                  One user, one story
                </h2>
                <p className="mt-1 text-[13px] text-ink-soft">
                  This is what DealMemory would show your team in the console after the same snippet ran in
                  production.
                </p>
              </div>
              <Link
                href="/overview"
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-ink bg-ink px-4 py-2 text-xs font-medium text-white hover:bg-ink/90"
              >
                Open console <ArrowRight size={13} />
              </Link>
            </div>

            <div className="mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-white sm:grid-cols-2">
              {[
                ['User', trialUser.email],
                ['Goal', trialUser.goal],
                ['Last recorded action', trialUser.lastAction],
                ['Onboarding status', trialUser.status === 'friction' ? 'Friction detected' : 'Healthy'],
                ['Blocker', trialUser.blocker],
                ['Recommended action', 'Resume GitHub authorization in-app'],
              ].map(([label, value]) => (
                <div key={label} className="bg-white px-4 py-3 sm:border-l sm:border-line">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">{label}</p>
                  <p className="mt-1 text-sm text-ink">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-danger/40 bg-danger-tint p-3 text-sm text-danger">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-danger font-semibold">Blocker</span>
                <p>{trialUser.blocker}. DealMemory flags this automatically so you can reach out with the exact
                  recovery step instead of a generic check-in.</p>
              </div>
            </div>
          </section>
        )}

        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <Link href="/install" className="btn btn-primary text-sm">
            Install DealMemory
          </Link>
          <Link href="/docs" className="btn btn-outline text-sm">
            SDK docs
          </Link>
          <Link href="/signup" className="btn btn-outline text-sm">
            Create free workspace
          </Link>
        </div>

        <p className="mt-6 text-[12.5px] text-ink-faint">
          DealMemory — product memory for SaaS trials. One snippet. One key. One recoverable journey.
        </p>
      </main>
    </div>
  );
}
