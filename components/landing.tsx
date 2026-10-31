'use client';

import Link from 'next/link';
import { ArrowRight, AlertTriangle, CreditCard, Sparkles } from 'lucide-react';
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
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-full max-w-6xl from-sky-200/40 via-accent-tint to-transparent  -z-10" />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-20 text-center md:pt-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-accent-tint px-3.5 py-1 text-xs font-medium text-accent ">
          <Sparkles size={13} className="text-accent" />
          <span>The Activation Layer for AI SaaS</span>
        </div>

        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-ink md:text-6xl md:leading-[1.15]">
          Your trial users do not need another chatbot.{' '}
          <span className="from-sky-600 to-blue-700 bg-clip-text text-transparent">
            They need a product that remembers.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
          DealMemory remembers a user’s goal, failed setup attempts, and blockers, then helps them reach
          value before asking them to pay.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            className="btn btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2"
            href="/demo"
          >
            <span>Try the guided demo</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            className="btn px-5 py-3 text-sm font-medium border border-line bg-white hover:bg-accent-tint text-ink-soft hover:text-accent "
            href="/signup"
          >
            Create free workspace
          </Link>
        </div>
      </section>

      {/* Product Loop */}
      <section className="border-y border-line bg-paper">
        <div className="mx-auto grid max-w-6xl md:grid-cols-2">
          <div className="p-8 md:border-r md:border-line md:p-12">
            <p className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
              A Calm Product Loop
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">
              One path from intent to value.
            </h2>
            <div className="mt-8 space-y-6">
              {steps.map(([n, title, text]) => (
                <div className="flex gap-4" key={n}>
                  <span className="font-mono pt-0.5 text-xs font-semibold text-accent">{n}</span>
                  <div>
                    <p className="font-semibold text-ink text-sm">{title}</p>
                    <p className="mt-1 text-xs text-ink-soft leading-relaxed">{text}</p>
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
            className="bg-accent-tint p-8 md:p-12 flex items-center justify-center"
          >
            <div className="w-full max-w-sm rounded-card border border-line bg-white p-6 ">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">RepoMap Trial Session</span>
                <span className="rounded-full border border-line bg-accent-tint px-2.5 py-0.5 text-[11px] font-mono font-medium text-accent">
                  Remembered
                </span>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-ink-soft">
                You were connecting GitHub to generate your first architecture map. The connection stopped
                at authorization.
              </p>
              <div className="mt-4 rounded-lg border border-danger/40 bg-danger-tint p-3 text-xs text-danger flex items-start gap-2">
                <AlertTriangle className="shrink-0 text-danger mt-0.5" size={15} />
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
        <p className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
          Memory Is the Conversion Engine
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">
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
              className="rounded-card border border-line bg-white p-6 "
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-tint border border-line text-accent ">
                {i === 0 ? <Sparkles size={17} /> : i === 1 ? <AlertTriangle size={17} /> : <CreditCard size={17} />}
              </span>
              <h3 className="mt-4 font-semibold text-ink text-base">{a}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder View Preview */}
      <section className="border-t border-line bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
            For Founders & Growth Teams
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            Know who is stuck, and why.
          </h2>
          <div className="mt-8 grid gap-4 rounded-card border border-line bg-white p-6 text-xs  md:grid-cols-4">
            <div>
              <p className="font-mono text-ink-faint uppercase tracking-wider text-[11px]">Trial User</p>
              <p className="mt-1 font-semibold text-ink text-sm">Maya Chen</p>
            </div>
            <div>
              <p className="font-mono text-ink-faint uppercase tracking-wider text-[11px]">Goal</p>
              <p className="mt-1 text-ink-soft">Understand GitHub repo</p>
            </div>
            <div>
              <p className="font-mono text-ink-faint uppercase tracking-wider text-[11px]">Blocker</p>
              <p className="mt-1 text-danger font-medium">GitHub authorization</p>
            </div>
            <div>
              <p className="font-mono text-ink-faint uppercase tracking-wider text-[11px]">Recommended Action</p>
              <p className="mt-1 font-medium text-accent">Resume GitHub setup</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-5 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink">
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
