'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { ArrowRight, ArrowUpRight, Check, Copy, Play, AlertTriangle, Activity, Sparkles, Zap, Shield } from 'lucide-react';
import { useState } from 'react';

const stack = ['TypeScript', 'Python', 'HTTP', 'React', 'Next.js', 'Postgres'];

const layers = [
  {
    label: 'Observed',
    title: 'The SDK records what happened',
    desc: 'trial_started, oauth_callback_failed, first_map_generated — explicit events sent on purpose. Nothing inferred, nothing scraped.',
    icon: Activity,
  },
  {
    label: 'Remembered',
    title: 'Memory explains why it mattered',
    desc: 'The goal the user signed up for, the step that blocked them, and how support resolved it — persisted across sessions, even days apart.',
    icon: Sparkles,
  },
  {
    label: 'Recommended',
    title: 'The console shows what to do next',
    desc: 'One funnel, the largest blocker, and a specific next action. Not a chart to interpret at the end of the quarter.',
    icon: ArrowRight,
  },
];

const steps = [
  { step: '01', title: 'Capture intent', desc: 'Persist the exact goal a trial user arrived to solve, so context never resets between tabs, sessions, or devices.' },
  { step: '02', title: 'Detect friction', desc: 'Failed setup attempts, empty states and permission errors surface in real time — with no session replay scripts.' },
  { step: '03', title: 'Reconstruct the journey', desc: 'Every event in order with timestamps, grouped into a single readable story per customer, not a metric aggregate.' },
  { step: '04', title: 'Monetize at first value', desc: 'Checkout and upgrade prompts unlock only after the activation milestone is reached, so conversion follows real value.' },
];

const journey = [
  { time: '14:02:10', name: 'trial_started', detail: 'Plan: pro_trial · source: pricing', tone: 'ok' },
  { time: '14:02:44', name: 'goal_submitted', detail: 'Map repository architecture', tone: 'neutral' },
  { time: '14:03:12', name: 'oauth_callback_failed', detail: 'HTTP 401 · github authorization', tone: 'bad' },
  { time: '14:04:18', name: 'first_map_generated', detail: 'RepoMap Pro · activation reached', tone: 'ok' },
];

const faqs = [
  {
    q: 'How is this different from product analytics?',
    a: 'Analytics tells you that 80% of users drop off at step three. DealMemory keeps the individual story: the goal they arrived with, the exact failure, and the action that recovers them.',
  },
  {
    q: 'Does it record sensitive data?',
    a: 'No keystrokes, screen recordings, or arbitrary form values. Edge-level sanitization strips authorization headers, tokens, and credential-shaped properties before an event is persisted.',
  },
  {
    q: 'How long does integration take?',
    a: 'Under five minutes. Install the SDK or call the HTTP endpoint, provide a public project key, and emit semantic events such as trialStarted() and milestoneReached().',
  },
  {
    q: 'Can we try it without a card?',
    a: 'Yes. The Starter tier is free up to 10,000 monthly events with full journey analysis. Upgrade only when you need higher volume and AI synthesis.',
  },
];

const codeSnippet = `import { DealMemory } from '@dealmemory/sdk';

const dm = new DealMemory({ projectKey: 'pk_live_production' });

dm.identify('usr_maya_chen', { plan: 'trial' });
dm.trialStarted({ goal: 'Map repository architecture' });

// a blocker is recorded, then resolved
dm.track('oauth_callback_failed', { code: 401 });
dm.firstMapGenerated({ repo: 'org/repo-main' });`;

function CheckCircle2({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="8" fill="#1a7f4b" />
      <path d="M5.5 8l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function JourneyPanel() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <span className="mono-label">demo tenant · repomap</span>
        </div>
        <span className="mono-label">one user, reconstructed end to end</span>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        <div className="border-b border-line lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5 sm:px-5">
            <span className="eyebrow">Observed telemetry</span>
            <span className="mono-label">POST /v1/events/batch</span>
          </div>
          <ul className="divide-y border-y border-line">
            {journey.map((event) => (
              <li key={event.name} className="flex items-start justify-between gap-3 px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-start gap-2.5">
                  {event.tone === 'bad' ? (
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-danger" />
                  ) : event.tone === 'ok' ? (
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-success" />
                  ) : (
                    <Activity size={14} className="mt-0.5 shrink-0 text-ink-faint" />
                  )}
                  <div className="min-w-0">
                    <p className="font-mono text-[12px] text-ink">{event.name}</p>
                    <p className="mt-0.5 truncate text-[12px] text-ink-soft">{event.detail}</p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-ink-faint">{event.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5 sm:px-5">
            <span className="eyebrow">Customer memory</span>
            <span className="mono-label">synced</span>
          </div>
          <dl className="divide-y border-y border-line">
            {[
              ['Primary intent', 'Connect a private GitHub repository to generate an architecture map.'],
              ['Blocker', 'OAuth token callback failed at the permission step.'],
              ['Intervention', 'In-app reconnect banner with a direct token refresh.'],
            ].map(([term, detail]) => (
              <div key={term} className="px-4 py-3 sm:px-5">
                <dt className="mono-label">{term}</dt>
                <dd className="mt-1 text-[13px] leading-relaxed text-ink">{detail}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-auto flex items-center justify-between border-t border-line bg-paper px-4 py-3 sm:px-5">
            <span className="text-[12px] text-ink-soft">Trial recovered in 42s</span>
            <span className="mono-label">$49/mo unlocked</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <main className="text-ink">
        <div className="page-wrap">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-[2px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span className="mono-label">Introducing DealMemory memory for SaaS trials</span>
            </div>
            <Link
              href="/docs"
              className="inline-flex items-center gap-1 mono-label text-accent hover:text-accent-deep"
            >
              Read the docs <ArrowUpRight size={11} />
            </Link>
          </div>

          <section className="grid gap-10 border-b border-line py-14 md:py-20 lg:grid-cols-[1.15fr_1fr] lg:items-end">
            <div>
              <p className="eyebrow">Product memory engine</p>
              <h1 className="mt-4 max-w-2xl text-[36px] font-normal leading-[1.05] tracking-[-0.035em] text-ink sm:text-[52px] md:text-[62px]">
                Product memory that turns trial friction into checkout.
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft md:text-base">
                DealMemory captures the intent a user arrives with, detects the silent blockers that stop them, and
                returns the context your team needs to recover the trial — before you ask for payment.
              </p>

              <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Link href="/signup" className="btn btn--primary">
                  Build with DealMemory
                  <ArrowRight size={14} />
                </Link>
                <Link href="/overview" className="btn">
                  <Play size={13} className="text-accent" />
                  See the live console
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.05em] text-ink-faint">
                <span className="flex items-center gap-1.5">
                  <Check size={12} className="text-success" /> Free tier, no card
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={12} className="text-success" /> 5 minute install
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={12} className="text-success" /> No session replay
                </span>
              </div>
            </div>

            <div>
              <div className="rounded-card border border-line bg-paper p-4">
                <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                  <span className="mono-label">Copy setup prompt</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 mono-label text-ink-faint transition-colors hover:text-ink"
                  >
                    {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-paper px-4 py-3.5 font-mono text-[11.5px] leading-relaxed text-ink">
                  {`npm install @dealmemory/sdk

const dm = new DealMemory({
  projectKey: 'pk_live_...'
});

dm.trialStarted({ goal: '...' });`}
                </pre>
                <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
                  <span className="mono-label">Works with</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {stack.slice(0, 4).map((s) => (
                      <span key={s} className="tag-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-2.5 text-[11.5px] leading-relaxed text-ink-faint">
                Public keys only. Ingestion is idempotent, batched, and sanitized at the edge.
              </p>
            </div>
          </section>

          <section className="border-b border-line py-14 md:py-16">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">The console</p>
                <h2 className="mt-2 text-[26px] font-normal leading-tight tracking-[-0.025em] md:text-[32px]">
                  One customer, one readable story.
                </h2>
              </div>
              <span className="mono-label">overview · journeys · events</span>
            </div>
            <JourneyPanel />
          </section>

          <section className="border-b border-line py-14 md:py-16">
            <div className="max-w-2xl">
              <p className="eyebrow">The thesis</p>
              <h2 className="mt-2 text-[26px] font-normal leading-tight tracking-[-0.025em] md:text-[32px]">
                Three layers. One clear story.
              </h2>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
              {layers.map((layer) => {
                const Icon = layer.icon;
                return (
                  <div key={layer.label} className="bg-white px-5 py-6">
                    <div className="flex items-center justify-between">
                      <span className="eyebrow">{layer.label}</span>
                      <Icon size={15} className="text-ink-faint" />
                    </div>
                    <h3 className="mt-5 text-[16px] font-medium leading-snug tracking-[-0.01em]">
                      {layer.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{layer.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border-b border-line py-14 md:py-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <p className="eyebrow">The activation loop</p>
                <h2 className="mt-2 text-[26px] font-normal leading-tight tracking-[-0.025em] md:text-[32px]">
                  One calm path from intent to monetization.
                </h2>
                <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-ink-soft">
                  Not another dashboard to interpret. A sequence your product can act on at each step of the trial.
                </p>
                <Link
                  href="/docs"
                  className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:text-accent-deep"
                >
                  Read the integration guide <ArrowRight size={13} />
                </Link>
              </div>

              <ol className="divide-y border-y border-line">
                {steps.map((item) => (
                  <li key={item.step} className="grid gap-2 py-5 sm:grid-cols-[56px_1fr_1.15fr] sm:gap-4">
                    <span className="mono-label">{item.step}</span>
                    <h3 className="text-[14px] font-medium text-ink">{item.title}</h3>
                    <p className="text-[13px] leading-relaxed text-ink-soft">{item.desc}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="border-b border-line py-14 md:py-16">
            <div className="mb-8 max-w-2xl">
              <p className="eyebrow">Engineered for modern SaaS</p>
              <h2 className="mt-2 text-[26px] font-normal leading-tight tracking-[-0.025em] md:text-[32px]">
                Small surface area. Honest data.
              </h2>
            </div>

            <div className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Zap, title: 'Lightweight SDKs', desc: 'Zero-dependency TypeScript and Python clients with offline queueing under 5KB.' },
                { icon: Shield, title: 'Edge privacy', desc: 'Credential-shaped properties and authorization headers are stripped before storage.' },
                { icon: Activity, title: 'Blocker synthesis', desc: 'Events group into journeys, so the failing step is named instead of averaged away.' },
                { icon: ArrowRight, title: 'Multi-tenant', desc: 'Projects scope keys, events, and memories. Two accounts never share a query.' },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="bg-white px-5 py-6">
                    <Icon size={16} className="text-ink-faint" />
                    <h3 className="mt-4 text-[14px] font-medium text-ink">{feature.title}</h3>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border-b border-line py-14 md:py-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-12">
              <div>
                <p className="eyebrow">Developer quickstart</p>
                <h2 className="mt-2 text-[26px] font-normal leading-tight tracking-[-0.025em] md:text-[32px]">
                  Two lines to your first memory.
                </h2>
                <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-ink-soft">
                  Install, identify the trial user, and emit the events that matter. No tag manager, no cookies.
                </p>
                <div className="mt-6 space-y-2 border-t border-line pt-5">
                  {['npm install @dealmemory/sdk', 'set projectKey', 'emit milestones'].map((line, i) => (
                    <div key={line} className="flex items-center gap-2.5">
                      <span className="mono-label">0{i + 1}</span>
                      <span className="font-mono text-[12px] text-ink-soft">{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-card border border-ink bg-ink">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                  <span className="mono-label">quickstart.ts</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 mono-label text-white/60 transition-colors hover:text-white"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="overflow-x-auto px-4 py-4 font-mono text-[12px] leading-[1.7] text-white">
                  {codeSnippet}
                </pre>
              </div>
            </div>
          </section>

          <section className="border-b border-line py-14 md:py-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
              <div>
                <p className="eyebrow">Questions</p>
                <h2 className="mt-2 text-[26px] font-normal leading-tight tracking-[-0.025em] md:text-[32px]">
                  Everything you need to know.
                </h2>
              </div>
              <div className="divide-y border-y border-line">
                {faqs.map((faq) => (
                  <details key={faq.q} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-medium text-ink">
                      {faq.q}
                      <span className="mono-label">+</span>
                    </summary>
                    <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-soft">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="py-14 md:py-20">
            <div className="flex flex-col items-start justify-between gap-6 rounded-card border border-line bg-paper px-6 py-10 md:flex-row md:items-center md:px-10">
              <div>
                <p className="eyebrow">Start today</p>
                <h2 className="mt-2 max-w-lg text-[26px] font-normal leading-tight tracking-[-0.025em] md:text-[34px]">
                  Stop losing trials to silent setup friction.
                </h2>
                <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-soft">
                  Free up to 10,000 events per month. Upgrade when your funnel is ready to scale.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/signup" className="btn btn--primary">
                  Create free workspace <ArrowRight size={14} />
                </Link>
                <Link href="/auth/signin" className="btn">
                  Sign in
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
