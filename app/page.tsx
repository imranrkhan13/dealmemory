'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import {
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Activity,
  ShieldCheck,
  Brain,
  BarChart3,
  Rocket,
  LayoutGrid,
  Film,
  Github,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';
import CopyButton from '@/components/ui/copy-button';

export default function Page() {
  const reduced = useReducedMotion();
  const videoSrc = process.env.NEXT_PUBLIC_DEALMEMORY_VIDEO_URL || '';

  const hoverLift = reduced
    ? {}
    : {
        whileHover: { y: -4, scale: 1.01 },
        transition: { type: 'spring', stiffness: 260, damping: 20, duration: 0.2 },
      };

  // SDK quick-start snippets (landing examples)
  const frameworks = ['React', 'Next.js', 'Vue', 'Angular', 'Node', 'Express', 'FastAPI', 'Laravel', 'Django'] as const;
  const [fw, setFw] = useState<(typeof frameworks)[number]>('React');
  const code = useMemo(() => {
    const k = 'pk_live_xxxxxxxxx';
    switch (fw) {
      case 'React':
        return `import { DealMemory } from "@dealmemory/sdk"

const dm = new DealMemory({ projectKey: "${k}" })`;
      case 'Next.js':
        return `// app/layout.tsx or pages/_app.tsx
import { DealMemory } from "@dealmemory/sdk"

if (typeof window !== "undefined") {
  const dm = new DealMemory({ projectKey: "${k}" })
}`;
      case 'Vue':
        return `import { DealMemory } from "@dealmemory/sdk"
const dm = new DealMemory({ projectKey: "${k}" })`;
      case 'Angular':
        return `import { DealMemory } from "@dealmemory/sdk";
const dm = new DealMemory({ projectKey: "${k}" });`;
      case 'Node':
        return `import { DealMemory } from "@dealmemory/sdk"
const dm = new DealMemory({ projectKey: "${k}" })`;
      case 'Express':
        return `import express from "express"
import { DealMemory } from "@dealmemory/sdk"

const app = express()
const dm = new DealMemory({ projectKey: "${k}" })`;
      case 'FastAPI':
        return `# Python
# pip install dealmemory  (example)
# from dealmemory import DealMemory
# dm = DealMemory(project_key="${k}")`;
      case 'Laravel':
        return `// PHP
// composer require dealmemory/sdk
// use DealMemory\\SDK\\DealMemory;
// $dm = new DealMemory(['projectKey' => '${k}']);`;
      case 'Django':
        return `# Python Django
# from dealmemory import DealMemory
# dm = DealMemory(project_key="${k}")`;
      default:
        return '';
    }
  }, [fw]);

  return (
    <AppShell>
      <main className="mx-auto w-full">
        {/* HERO */}
        <section className="relative mx-auto w-full max-w-7xl px-5">
          {/* Animated gradient background */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-[-10%] h-[50rem] w-[50rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.12),_transparent_55%)] blur-2xl" />
            <motion.div
              initial={reduced ? false : { opacity: 0.4, scale: 0.95 }}
              animate={reduced ? {} : { opacity: 0.6, scale: 1 }}
              transition={{ duration: 2.4, repeat: Infinity, repeatType: 'reverse' }}
              className="absolute right-[10%] top-[20%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15),_transparent_60%)] blur-xl"
            />
          </div>

          <div className="min-h-[100dvh] flex flex-col items-center justify-center text-center">
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.22 }}
              className="text-sm font-semibold text-[#4F46E5]"
            >
              AI Activation Intelligence for Developers
            </motion.p>

            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.26, delay: 0.03 }}
              className="mt-5 max-w-5xl text-4xl font-extrabold tracking-[-.04em] text-[#111827] md:text-6xl"
            >
              Ship onboarding that remembers. Convert trials without guesswork.
            </motion.h1>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.26, delay: 0.06 }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#6B7280]"
            >
              DealMemory installs in minutes and automatically tracks onboarding, builds journeys,
              remembers factual context, identifies blockers, predicts churn, and recommends the next
              action — without manual configuration.
            </motion.p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                className="btn btn-primary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                href="/signup"
                aria-label="Get started"
              >
                Get started <ArrowRight size={16} />
              </Link>
              <Link
                className="btn transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                href="/pricing"
                aria-label="View pricing"
              >
                View pricing
              </Link>
            </div>

            {/* Quick value props (hover animated) */}
            <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ['Zero Config', 'Auto-capture sessions, views, clicks, checkouts'],
                ['Evidence First', 'No hallucinations — every insight cites events'],
                ['60s Setup', 'SDK install to first event in under a minute'],
              ].map(([title, desc], i) => (
                <motion.div
                  key={title}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.22, delay: i * 0.03 }}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left shadow-sm"
                  {...hoverLift}
                >
                  <div className="flex items-center gap-2">
                    {i === 0 ? (
                      <Zap size={16} className="text-[#4F46E5]" />
                    ) : i === 1 ? (
                      <CheckCircle2 size={16} className="text-[#10B981]" />
                    ) : (
                      <Activity size={16} className="text-[#F59E0B]" />
                    )}
                    <span className="text-sm font-semibold text-[#111827]">{title}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT IT DOES (Feature grid w/ hover) */}
        <section className="mx-auto w-full max-w-7xl px-5 py-20">
          <p className="text-sm font-semibold text-[#4F46E5]">What DealMemory does for you</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827]">Everything, automatically.</h2>
          <p className="mt-3 max-w-3xl text-[#6B7280]">
            Install the SDK and DealMemory handles the rest — building journeys, remembering facts,
            detecting blockers, and surfacing clear, evidence-first recommendations that drive
            activation and conversion.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              [
                <Brain key="i" size={18} className="text-[#4F46E5]" />,
                'Builds journeys',
                'Aggregates sessions and events into transparent journeys, no manual setup.',
              ],
              [
                <ShieldCheck key="s" size={18} className="text-[#10B981]" />,
                'Remembers facts',
                'Stores only factual context (goals, failures, milestones), never opinions.',
              ],
              [
                <BarChart3 key="b" size={18} className="text-[#F59E0B]" />,
                'Identifies blockers',
                'Turns failures into next steps so users reach value faster.',
              ],
              [
                <Rocket key="r" size={18} className="text-[#EF4444]" />,
                'Predicts churn',
                'Highlights risky journeys with confidence and evidence.',
              ],
              [
                <LayoutGrid key="g" size={18} className="text-[#6366F1]" />,
                'Auto-capture events',
                'Sessions, views, route changes, clicks, checkouts, errors — out of the box.',
              ],
              [
                <Sparkles key="p" size={18} className="text-[#A855F7]" />,
                'Recommends actions',
                'Shows exactly what to do next — with source events and reasoning.',
              ],
            ].map(([icon, title, desc], i) => (
              <motion.div
                key={String(title)}
                className="group rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-all hover:shadow-lg"
                {...hoverLift}
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-[#EEF2FF] text-[#4F46E5] group-hover:scale-110 transition-transform">
                    {icon as React.ReactNode}
                  </span>
                  <h3 className="font-semibold text-[#111827]">{title as string}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">{desc as string}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SDK QUICK START (animated tabs + copy) */}
        <section className="mx-auto w-full max-w-7xl px-5 py-20">
          <p className="text-sm font-semibold text-[#4F46E5]">SDK Quick Start</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827]">Copy personalized code.</h2>
          <p className="mt-3 max-w-3xl text-[#6B7280]">
            Initialize the SDK with a single line. Everything else — sessions, views, clicks, checkouts, errors —
            works automatically. These examples are ready to paste.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {frameworks.map((name) => {
              const active = fw === name;
              return (
                <motion.button
                  key={name}
                  type="button"
                  onClick={() => setFw(name)}
                  aria-pressed={active}
                  className={[
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-all',
                    active ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]' : 'border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]',
                  ].join(' ')}
                  {...hoverLift}
                >
                  {name}
                </motion.button>
              );
            })}
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.24 }}
            className="relative mt-6 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#0B0F19] shadow-xl"
          >
            <div className="absolute right-3 top-3 z-10">
              <CopyButton getText={() => code} label="Copy" ariaLabel="Copy SDK snippet" />
            </div>
            <pre className="mono relative z-0 overflow-x-auto p-5 text-sm leading-6 text-[#E5E7EB]">
              {code}
            </pre>
          </motion.div>
        </section>

        {/* ONBOARDING STEPS */}
        <section className="border-y border-[#E5E7EB] bg-white">
          <div className="mx-auto grid w-full max-w-7xl md:grid-cols-2">
            <div className="p-8 md:border-r md:border-[#E5E7EB] md:p-12">
              <p className="text-sm font-semibold text-[#4F46E5]">Onboard in under 60 seconds</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827]">Copy. Install. Paste. Start. Done.</h2>
              <div className="mt-8 space-y-6">
                {[
                  ['01', 'Copy SDK', 'Personalized snippet from your dashboard.'],
                  ['02', 'Install package', 'npm i @dealmemory/sdk (or pnpm/yarn).'],
                  ['03', 'Paste code', 'Initialize with your project key.'],
                  ['04', 'Start app', 'We wait for the first event — then celebrate.'],
                ].map(([n, title, text]) => (
                  <motion.div key={n} className="flex gap-4" {...hoverLift}>
                    <span className="mono pt-0.5 text-xs text-[#9CA3AF]">{n}</span>
                    <div>
                      <p className="font-semibold text-[#111827]">{title}</p>
                      <p className="mt-1 text-sm text-[#6B7280]">{text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-sm text-[#6B7280]">
                Prefer a demo first?{' '}
                <Link className="text-[#4F46E5] underline underline-offset-2" href="/demo">
                  Run the guided demo
                </Link>
              </div>
            </div>

            {/* Visual card */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.22 }}
              className="bg-[#FAFAF8] p-8 md:p-12"
            >
              <div className="mx-auto max-w-sm rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#111827]">Welcome to DealMemory</span>
                  <span className="rounded-full bg-[#EEF2FF] px-2 py-1 text-[11px] font-semibold text-[#4F46E5]">Ready</span>
                </div>
                <p className="mt-5 text-sm leading-6 text-[#374151]">
                  Your default project is ready. Copy the SDK, install, and start your app. We’ll
                  listen for the first event and confirm your integration instantly.
                </p>
                <Link
                  className="btn btn-primary mt-4 w-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  href="/signup"
                  aria-label="Sign up now"
                >
                  Get your SDK <Sparkles size={15} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PRODUCT VIDEO (animated ring, paste your video URL via NEXT_PUBLIC_DEALMEMORY_VIDEO_URL) */}
        <section className="relative mx-auto w-full max-w-7xl px-5 py-20">
          <p className="text-sm font-semibold text-[#4F46E5]">See it in action</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827]">Product walkthrough</h2>
          <p className="mt-3 max-w-3xl text-[#6B7280]">
            Paste your video URL in the NEXT_PUBLIC_DEALMEMORY_VIDEO_URL environment variable to display your own demo
            here. The frame animates subtly to draw attention.
          </p>

          <motion.div
            initial={reduced ? false : { opacity: 0.8, scale: 0.99 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="group relative mx-auto mt-8 w-full max-w-5xl"
          >
            {/* Glow ring */}
            <motion.div
              aria-hidden="true"
              initial={reduced ? false : { opacity: 0.5 }}
              whileInView={{ opacity: 1 }}
              animate={reduced ? {} : { opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="pointer-events-none absolute -inset-1 rounded-3xl bg-[radial-gradient(ellipse_at_center,_rgba(79,70,229,0.25),_transparent_60%)] blur-lg"
            />
            <div className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-xl transition-all group-hover:shadow-2xl">
              {videoSrc ? (
                <video className="h-full w-full" src={videoSrc} controls playsInline preload="metadata" poster="/video-poster.jpg" />
              ) : (
                <div className="grid h-[320px] w-full place-items-center bg-[#F9FAFB] text-center sm:h-[420px]">
                  <div>
                    <Film size={28} className="mx-auto text-[#9CA3AF]" />
                    <p className="mt-3 text-sm text-[#6B7280]">Set NEXT_PUBLIC_DEALMEMORY_VIDEO_URL to show your product video here.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* WHY DEALMEMORY (evidence-first) */}
        <section className="mx-auto w-full max-w-7xl px-5 pb-20">
          <p className="text-sm font-semibold text-[#4F46E5]">Evidence over guesses</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827]">Insights that explain themselves.</h2>
          <p className="mt-3 max-w-3xl text-[#6B7280]">
            Every recommendation includes Confidence, Evidence, Observed Events, and Reasoning. No hallucinations. Only
            traceable, actionable suggestions.
          </p>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              ['Remembers facts only', 'We remember goals, failures, milestones — never opinions. No made-up context.'],
              [
                'Explains the why',
                'Each suggestion cites concrete events and inactivity windows to justify the action.',
              ],
              [
                'Boosts conversion',
                'Prevent drop-offs by turning blockers into precise next steps before asking for payment.',
              ],
            ].map(([a, b], i) => (
              <motion.div
                key={String(a)}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-all hover:shadow-lg"
                {...hoverLift}
              >
                <span className="grid h-8 w-8 place-items-center rounded-md bg-[#EEF2FF] text-[#4F46E5]">
                  {i === 0 ? <ShieldCheck size={16} /> : i === 1 ? <Brain size={16} /> : <Rocket size={16} />}
                </span>
                <h3 className="mt-4 font-semibold text-[#111827]">{a as string}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">{b as string}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[#E5E7EB] bg-white">
          <div className="mx-auto max-w-4xl px-5 py-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#111827]">From install to insight in minutes.</h2>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link className="btn btn-primary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg" href="/signup" aria-label="Start free">
                Start free <ArrowRight size={16} />
              </Link>
              <Link className="btn transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md" href="/sdk" aria-label="See SDK docs">
                See SDK
              </Link>
              <Link
                className="btn transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="View on GitHub"
              >
                <Github size={16} />
                GitHub
              </Link>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
