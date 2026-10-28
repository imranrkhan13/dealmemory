'use client';

import Link from 'next/link';
import { ArrowRight, AlertTriangle, CreditCard, Sparkles, Brain, CheckCircle2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const steps = [
  ['01', 'A user arrives with a goal', '“I want to understand my repository architecture.”'],
  ['02', 'They get stuck during setup', 'OAuth callback could not be verified (HTTP 401).'],
  ['03', 'They return and it remembers', 'Resume from authorization — not from zero.'],
  ['04', 'They reach value and upgrade', 'First map generated. Checkout is now eligible.'],
];

export default function Landing() {
  const reduced = useReducedMotion();

  return (
    <main className="relative overflow-hidden pb-20">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-full max-w-6xl bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl -z-10" />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-20 text-center md:pt-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300">
          <Sparkles size={13} className="text-indigo-400" />
          <span>The Activation Layer for AI SaaS</span>
        </div>

        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl md:leading-[1.15]">
          Your trial users do not need another chatbot.{' '}
          <span className="bg-gradient-to-r from-indigo-300 via-indigo-100 to-white bg-clip-text text-transparent">
            They need a product that remembers.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
          DealMemory remembers a user’s goal, failed setup attempts, and blockers, then helps them reach
          value before asking them to pay.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            className="btn btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2 shadow-[0_0_20px_-3px_rgba(255,255,255,0.3)]"
            href="/demo"
          >
            <span>Try the guided demo</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            className="btn px-5 py-3 text-sm font-medium border border-white/[0.08] bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white"
            href="/signup"
          >
            Create free workspace
          </Link>
        </div>
      </section>

      {/* Product Loop */}
      <section className="border-y border-white/[0.08] bg-zinc-950/40">
        <div className="mx-auto grid max-w-6xl md:grid-cols-2">
          <div className="p-8 md:border-r md:border-white/[0.08] md:p-12">
            <p className="text-xs font-mono uppercase tracking-wider text-indigo-400">
              A Calm Product Loop
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
              One path from intent to value.
            </h2>
            <div className="mt-8 space-y-6">
              {steps.map(([n, title, text]) => (
                <div className="flex gap-4" key={n}>
                  <span className="font-mono pt-0.5 text-xs font-semibold text-indigo-400">{n}</span>
                  <div>
                    <p className="font-semibold text-zinc-200 text-sm">{title}</p>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.22 }}
            className="bg-zinc-900/20 p-8 md:p-12 flex items-center justify-center"
          >
            <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-zinc-900/80 p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">RepoMap Trial Session</span>
                <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-indigo-300">
                  Remembered
                </span>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-zinc-300">
                You were connecting GitHub to generate your first architecture map. The connection stopped
                at authorization.
              </p>
              <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="shrink-0 text-rose-400 mt-0.5" size={15} />
                <span>
                  <b>Blocker:</b> OAuth callback could not be verified.
                </span>
              </div>
              <button className="btn btn-primary mt-5 w-full py-2.5 text-xs font-semibold">
                Reconnect GitHub
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-xs font-mono uppercase tracking-wider text-indigo-400">
          Memory Is the Conversion Engine
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Do not sell before users succeed.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            [
              'Remembers the goal',
              'Persist the reason someone signed up across browser sessions and devices.',
            ],
            [
              'Detects the blocker',
              'Turn an unhandled error or failed step into a precise, self-service recovery path.',
            ],
            [
              'Earns the upgrade after value',
              'Unlock checkout only once the first useful outcome exists for the customer.',
            ],
          ].map(([a, b], i) => (
            <div
              key={a}
              className="rounded-2xl border border-white/[0.08] bg-zinc-900/50 p-6 backdrop-blur-xl"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                {i === 0 ? <Sparkles size={17} /> : i === 1 ? <AlertTriangle size={17} /> : <CreditCard size={17} />}
              </span>
              <h3 className="mt-4 font-semibold text-white text-base">{a}</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder View Preview */}
      <section className="border-t border-white/[0.08] bg-zinc-950/40">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-xs font-mono uppercase tracking-wider text-indigo-400">
            For Founders & Growth Teams
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Know who is stuck, and why.
          </h2>
          <div className="mt-8 grid gap-4 rounded-2xl border border-white/[0.08] bg-zinc-900/70 p-6 text-xs backdrop-blur-xl md:grid-cols-4">
            <div>
              <p className="font-mono text-zinc-500 uppercase tracking-wider text-[11px]">Trial User</p>
              <p className="mt-1 font-semibold text-white text-sm">Maya Chen</p>
            </div>
            <div>
              <p className="font-mono text-zinc-500 uppercase tracking-wider text-[11px]">Goal</p>
              <p className="mt-1 text-zinc-300">Understand GitHub repo</p>
            </div>
            <div>
              <p className="font-mono text-zinc-500 uppercase tracking-wider text-[11px]">Blocker</p>
              <p className="mt-1 text-rose-400 font-medium">GitHub authorization</p>
            </div>
            <div>
              <p className="font-mono text-zinc-500 uppercase tracking-wider text-[11px]">Recommended Action</p>
              <p className="mt-1 font-medium text-indigo-400">Resume GitHub setup</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-5 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Do not sell before users succeed.
        </h2>
        <div className="mt-6 flex justify-center gap-3">
          <Link className="btn btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2" href="/demo">
            <span>Run the guided demo</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
