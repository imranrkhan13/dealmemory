'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Shield,
  Zap,
  Layers,
  Activity,
  Check,
  Copy,
} from 'lucide-react';
import { useState } from 'react';

export default function Page() {
  const [copied, setCopied] = useState(false);

  const codeSnippet = `import { DealMemory } from '@dealmemory/sdk';

const dm = new DealMemory({ projectKey: 'pk_live_production' });

// Record trial start with user intent
dm.trialStarted({
  userId: 'usr_maya_chen',
  goal: 'Map repository architecture',
});

// Record key milestone
dm.firstMapGenerated({
  userId: 'usr_maya_chen',
  repo: 'org/repo-main',
});`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <main className="relative overflow-hidden pb-24">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-full max-w-7xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-200/50 via-blue-100/30 to-transparent blur-3xl -z-10" />

        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-5 pt-20 pb-16 text-center md:pt-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-medium text-sky-700 shadow-xs">
            <Sparkles size={13} className="text-sky-600" />
            <span>DealMemory · AI Activation Engine</span>
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl md:leading-[1.15]">
            Product memory that turns trial friction into{' '}
            <span className="bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
              checkout conversions.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            DealMemory captures real user intent, detects silent setup blockers, and delivers
            personalized recovery interventions — so trial users reach true value before you ask
            them to pay.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              className="btn btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2"
              href="/signup"
            >
              <span>Create free workspace</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              className="btn px-5 py-3 text-sm font-medium border border-slate-200 bg-white hover:bg-sky-50/60 hover:border-sky-300 text-slate-700 hover:text-sky-700 flex items-center gap-2 shadow-xs transition-all"
              href="/docs"
            >
              <span>Setup in 30 seconds</span>
              <ArrowRight size={14} className="text-sky-600" />
            </Link>
            <Link
              className="btn px-5 py-3 text-sm font-medium border border-slate-200 bg-white hover:bg-sky-50/60 hover:border-sky-300 text-slate-700 hover:text-sky-700 shadow-xs transition-all"
              href="/pricing"
            >
              Pricing
            </Link>
          </div>
        </section>

        {/* Live Interactive Product Memory Simulation */}
        <section className="mx-auto max-w-5xl px-5 pb-20">
          <div className="rounded-2xl border border-sky-200 bg-white/95 p-1 shadow-lg">
            <div className="rounded-xl border border-sky-100 bg-slate-50/60 p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-xs">
                    <Brain size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">Maya Chen</span>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-700">
                        ACTIVATED · PAID
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">Session ID: sess_94103a_prod</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono text-slate-600 font-medium">Live Memory Sync</span>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {/* Left: Observed Stream */}
                <div className="space-y-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    Observed Telemetry Stream
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between rounded-xl bg-white border border-slate-200 p-3 text-xs shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span className="text-slate-800">trial_started</span>
                      </div>
                      <span className="font-mono text-slate-400">14:02:10</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white border border-slate-200 p-3 text-xs shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <Activity size={15} className="text-sky-600" />
                        <span className="text-slate-800">goal_submitted (Map GitHub repo)</span>
                      </div>
                      <span className="font-mono text-slate-400">14:02:44</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle size={15} className="text-rose-600" />
                        <span className="text-rose-800 font-medium">oauth_callback_failed (HTTP 401)</span>
                      </div>
                      <span className="font-mono text-rose-700">14:03:12</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <Sparkles size={15} className="text-emerald-600" />
                        <span className="text-emerald-800 font-medium">first_map_generated (RepoMap Pro)</span>
                      </div>
                      <span className="font-mono text-emerald-700">14:04:18</span>
                    </div>
                  </div>
                </div>

                {/* Right: Cognitive Synthesis */}
                <div className="space-y-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    DealMemory Cognitive Synthesis
                  </p>
                  <div className="rounded-xl border border-sky-100 bg-white p-4 space-y-3 shadow-xs">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                        Primary Intent
                      </span>
                      <p className="mt-1 text-xs text-slate-800 font-medium">
                        Connect private GitHub repository to generate system architecture map.
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-2.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-rose-700 font-semibold">
                        Blocker Detected
                      </span>
                      <p className="mt-1 text-xs text-slate-700">
                        GitHub authorization token callback failed. User stopped at OAuth permission step.
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-2.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-sky-700 font-semibold">
                        Automated Intervention
                      </span>
                      <p className="mt-1 text-xs text-slate-700">
                        Triggered in-app reconnect banner with direct token refresh.
                      </p>
                    </div>

                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 flex items-center justify-between text-xs text-emerald-800">
                      <span className="font-medium">Trial Recovered in 42s</span>
                      <span className="font-mono font-bold">$49/mo Unlocked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Step Calm Activation Loop */}
        <section className="mx-auto max-w-6xl px-5 py-20 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-mono uppercase tracking-wider text-sky-700 font-semibold">
              The Activation Framework
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              One calm path from intent to monetization.
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Stop guessing why users drop off. DealMemory guides customers to value before requesting payment.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Capture User Intent',
                desc: 'When users arrive, persist the exact goal they signed up to solve. Never lose context between browser tabs or visits.',
              },
              {
                step: '02',
                title: 'Detect Real Friction',
                desc: 'Detect failed setup attempts, empty states, and configuration blockers in real time without heavy session replay scripts.',
              },
              {
                step: '03',
                title: 'Persistent Product Memory',
                desc: 'When users return, resume from where they stopped. No blank canvases, no repetitive onboarding wizard forms.',
              },
              {
                step: '04',
                title: 'Monetize at First Value',
                desc: 'Unlock checkout and upgrade prompts only after the first successful milestone is achieved, maximizing upgrade conversion.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition hover:border-sky-300 hover:shadow-md"
              >
                <span className="font-mono text-xs font-semibold text-sky-600">
                  {s.step}
                </span>
                <h3 className="mt-3 text-base font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mx-auto max-w-6xl px-5 py-20 border-t border-slate-200">
          <div className="max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-wider text-sky-700 font-semibold">
              Engineered for Modern SaaS
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Built for engineering speed and product clarity.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-sky-100 bg-white p-8 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-xs">
                <Zap size={20} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">Ultra-Lightweight SDKs</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Single-line client libraries for TypeScript/JavaScript and Python. Zero runtime
                dependencies, under 5KB bundle size, and automatic offline background queuing.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-white p-8 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-xs">
                <Shield size={20} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">Edge Privacy & Credential Scanner</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Zero keystroke logging, zero arbitrary screen scraping. Automatic edge scanners strip
                Bearer tokens, passwords, and sensitive credentials before events reach storage.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-white p-8 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shadow-xs">
                <Layers size={20} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">Automatic Blocker Synthesis</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                DealMemory groups telemetry events into coherent trial journeys. Instant visibility into
                which step causes trial churn without complex SQL queries or data pipelines.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-white p-8 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 shadow-xs">
                <Sparkles size={20} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">Actionable Recovery Playbooks</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Transform dead-end trial drop-offs into proactive interventions. Feed synthesized
                recommendations back into your product UI, email sequences, or founder alerts.
              </p>
            </div>
          </div>
        </section>

        {/* Developer Quickstart Terminal */}
        <section className="mx-auto max-w-5xl px-5 py-20 border-t border-slate-200">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="text-xs font-mono uppercase tracking-wider text-sky-700 font-semibold">
              Developer Quickstart
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Up and running in two lines of code.
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-xs text-slate-400">dealmemory-quickstart.ts</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-sky-200">
              {codeSnippet}
            </pre>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mx-auto max-w-5xl px-5 py-20 border-t border-slate-200">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-mono uppercase tracking-wider text-sky-700 font-semibold">
              Frequently Asked Questions
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Everything you need to know.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                q: 'How is DealMemory different from traditional analytics tools?',
                a: 'Traditional tools tell you that 80% of users drop off at step 3. DealMemory captures the user’s original intent, explains the exact failure point, and helps your product recover them automatically before they abandon.',
              },
              {
                q: 'Will DealMemory record sensitive passwords or customer data?',
                a: 'Never. DealMemory does not capture keystrokes, screen recordings, or arbitrary form inputs. Edge-level sanitization filters strip all authorization headers, session cookies, and sensitive tokens automatically.',
              },
              {
                q: 'How difficult is integration for our engineering team?',
                a: 'Under 5 minutes. Import our lightweight SDK in TypeScript or Python, supply your project key, and call semantic methods like trialStarted() and firstMilestoneAchieved().',
              },
              {
                q: 'Can we try DealMemory without entering a credit card?',
                a: 'Yes. Our Starter plan is completely free up to 10,000 monthly events with full journey analysis and blocker alerts. Upgrade to Growth Pro only when you need higher volumes.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-900">{faq.q}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="mx-auto max-w-4xl px-5 pt-10 text-center">
          <div className="relative overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-b from-sky-50 via-white to-blue-50/60 p-10 md:p-14 shadow-sm">
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-80 rounded-full bg-sky-200/40 blur-3xl" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Stop losing trial users to silent setup friction.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-slate-600 leading-relaxed">
              Start monitoring customer intent and unlock real checkout conversions with DealMemory today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                className="btn btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2"
                href="/signup"
              >
                <span>Create free workspace</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                className="btn px-5 py-3 text-sm font-medium border border-slate-200 bg-white hover:bg-sky-50/60 text-slate-700 hover:text-sky-700 shadow-xs"
                href="/auth/signin"
              >
                Sign in to existing account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
