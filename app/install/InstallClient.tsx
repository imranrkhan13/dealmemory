'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Copy, Play, Terminal } from 'lucide-react';

export default function InstallClient() {
  const [copied, setCopied] = useState(false);

  const snippet = `npm install dealmemory

# .env — the only line you add
DEALMEMORY_API_KEY=pk_live_your_project_key

# the CLI writes the tracking import for you
npx dealmemory init`;

  const applicationCode = `import 'dealmemory/auto';

// that single import is the whole integration.
// page views, clicks, and session starts are recorded automatically.
// send your own events too:

import { track, identify } from 'dealmemory/auto';
identify('user_10293', { plan: 'trial' });
track('integration_connected', { provider: 'github' });`;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — user can still select the text */
    }
  };

  return (
    <>
      <div className="mx-auto grid max-w-5xl gap-12 px-5 py-12 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-1.5 text-[13px]">
            <div className="eyebrow mb-2">On this page</div>
            <a href="#install" className="block text-ink-soft hover:text-ink">
              Install
            </a>
            <a href="#env" className="block text-ink-soft hover:text-ink">
              Project key
            </a>
            <a href="#code" className="block text-ink-soft hover:text-ink">
              What gets written
            </a>
            <a href="#play" className="block text-ink-soft hover:text-ink">
              Try without code
            </a>
          </div>
        </aside>

        <main className="min-w-0 pb-20 text-[14.5px] leading-relaxed text-ink-soft">
          <span className="eyebrow">Setup</span>
          <h1 className="mt-2 text-[32px] font-medium leading-tight tracking-[-0.03em] text-ink">
            Install DealMemory
          </h1>
          <p className="mt-3 text-[15px]">
            Two steps. One project key. The CLI writes the tracking code into your app for you, so you do not
            touch your source files by hand.
          </p>

          <section id="install" className="mt-10">
            <h2 className="scroll-mt-20 text-[22px] font-medium tracking-[-0.02em] text-ink">
              1. Install
            </h2>
            <p className="mt-3 text-[15px]">
              Run this in the root of the app you want to track.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-[#0f1115] p-4 text-[12.5px] leading-relaxed text-[#e6e8ec]">
              <code>npm install dealmemory</code>
            </pre>
          </section>

          <section id="env" className="mt-12">
            <h2 className="scroll-mt-20 text-[22px] font-medium tracking-[-0.02em] text-ink">
              2. Add your project key
            </h2>
            <p className="mt-3 text-[15px]">
              Create a project in the DealMemory console and copy its public key. Put it in a{' '}
              <code className="font-mono text-[12.5px]">.env</code> file in your project root.
            </p>

            <div className="mt-4 space-y-4">
              <div className="flex gap-4 rounded-card border border-line bg-white p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-accent-tint text-accent font-mono text-sm font-semibold">
                  01
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-ink">One key, no other config</h3>
                  <div className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                    DealMemory reads{' '}
                    <code className="font-mono text-[12.5px]">DEALMEMORY_API_KEY</code> from your environment.
                    There is no project id, no apiUrl, and no config object to wire up.
                  </div>
                </div>
              </div>

              <div className="flex gap-4 rounded-card border border-line bg-white p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-accent-tint text-accent font-mono text-sm font-semibold">
                  02
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-ink">The full local setup</h3>
                  <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-[#0f1115] p-4 text-[12.5px] leading-relaxed text-[#e6e8ec]">
                    <code>{`# .env
DEALMEMORY_API_KEY=pk_live_your_project_key`}</code>
                  </pre>
                  <p className="mt-3 text-[13px]">
                    If you self-host DealMemory, you can also set{' '}
                    <code className="font-mono text-[12.5px]">DEALMEMORY_API_URL</code> to point at your own
                    ingestion endpoint. Everything else stays the same.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-card border border-line bg-white p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-accent-tint text-accent font-mono text-sm font-semibold">
                  03
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-ink">The CLI writes the rest</h3>
                  <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-[#0f1115] p-4 text-[12.5px] leading-relaxed text-[#e6e8ec]">
                    <code>{`npx dealmemory init`}</code>
                  </pre>
                  <p className="mt-3 text-[13px]">The init command detects whether you are on Next.js App Router, Next.js Pages Router, or plain React, writes the correct tracking import, and keeps your{' '}
                    <code className="font-mono text-[12.5px]">.env</code> in sync. Run it as many times as you
                    like &mdash; the second run changes nothing.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="code" className="mt-12">
            <h2 className="scroll-mt-20 text-[22px] font-medium tracking-[-0.02em] text-ink">
              3. What gets written into your app
            </h2>
            <p className="mt-3 text-[15px]">
              After init, the only line added to your app entry is the auto-track import.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                className="flex items-center gap-1.5 rounded-lg border border-ink bg-ink px-3 py-1.5 text-xs text-ink-faint hover:text-white"
                onClick={() => copy(snippet)}
              >
                <Copy size={12} />
                {copied ? 'Copied' : 'Copy setup'}
              </button>
              <button
                className="flex items-center gap-1.5 rounded-lg border border-ink bg-ink px-3 py-1.5 text-xs text-ink-faint hover:text-white"
                onClick={() => copy(applicationCode)}
              >
                <Copy size={12} />
                Copy app code
              </button>
            </div>

            <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-[#0f1115] p-4 text-[12.5px] leading-relaxed text-[#e6e8ec]">
              <code>{applicationCode}</code>
            </pre>

            <p className="mt-4 text-[13px]">
              <code className="font-mono text-[12.5px]">import 'dealmemory/auto'</code> starts the shared client
              from your environment. It captures page views, clicks, form submissions, and session starts by
              default, and it never throws into your app if the key is missing.
            </p>

            <div className="mt-6 rounded-card border border-line bg-paper p-4">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-ink-faint">
                <Terminal size={12} />
                Works with
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {['Next.js App Router', 'Next.js Pages Router', 'React', 'TypeScript', 'JavaScript', 'Node.js'].map(
                  (s) => (
                    <span key={s} className="rounded-full border border-line bg-white px-3 py-1 text-[12px] text-ink">
                      {s}
                    </span>
                  )
                )}
              </div>
            </div>
          </section>

          <section id="play" className="mt-12 rounded-card border border-line bg-paper p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="eyebrow">Try it now</span>
                <h2 className="mt-2 text-[22px] font-medium leading-tight tracking-[-0.02em] text-ink">
                  Before you touch your own app
                </h2>
                <p className="mt-1 text-[14px] text-ink-soft">
                  Run the interactive demo to see how events turn into journeys and recovery prompts, without
                  installing anything yet.
                </p>
              </div>
              <Link
                href="/demo"
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-ink bg-ink px-4 py-2 text-xs font-medium text-white hover:bg-ink/90"
              >
                <Play size={13} />
                Open demo
              </Link>
            </div>
          </section>

          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <Link href="/signup" className="btn btn-primary text-sm">
              Create free workspace
            </Link>
            <Link href="/quickstart" className="btn btn-outline text-sm">
              Quickstart sandbox
            </Link>
            <Link href="/docs" className="btn btn-outline text-sm">
              SDK docs
            </Link>
          </div>

          <p className="mt-6 text-[12.5px] text-ink-faint">
            DealMemory — product memory for SaaS trials. Install once. Remember everything.
          </p>
        </main>
      </div>
    </>
  );
}
