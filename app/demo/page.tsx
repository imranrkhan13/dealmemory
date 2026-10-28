'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Sparkles, Brain, Clock3 } from 'lucide-react';

interface SampleJourney {
  userId: string;
  plan: string;
  state: string;
  inactiveHours: number;
  blocker?: string;
  recommendation?: string;
  events: Array<{
    name: string;
    label: string;
    occurredAt: string;
    details?: string;
  }>;
}

const SAMPLE_JOURNEYS: SampleJourney[] = [
  {
    userId: 'user_alex_dev',
    plan: 'Founder Pro',
    state: 'activated',
    inactiveHours: 1,
    blocker: undefined,
    recommendation: 'User reached first value milestone. Optimal time to offer annual billing upgrade.',
    events: [
      { name: 'trial_started', label: 'Trial started', occurredAt: '10:02 AM', details: 'Plan: pro_trial' },
      { name: 'goal_set', label: 'Goal configured', occurredAt: '10:04 AM', details: 'Goal: reduce churn' },
      { name: 'integration_connected', label: 'GitHub connected', occurredAt: '10:07 AM', details: 'Repo: imran/dealmemory' },
      { name: 'first_value_reached', label: 'First map generated', occurredAt: '10:11 AM', details: 'Milestone reached' },
      { name: 'checkout_started', label: 'Checkout initiated', occurredAt: '10:15 AM', details: 'Tier: monthly' },
    ],
  },
  {
    userId: 'user_sarah_growth',
    plan: 'Starter',
    state: 'stalled_at_integration',
    inactiveHours: 6,
    blocker: 'Integration connection failed: repository permissions rejected',
    recommendation: 'Send in-app prompt to verify GitHub organization admin permissions.',
    events: [
      { name: 'trial_started', label: 'Trial started', occurredAt: '08:30 AM', details: 'Plan: starter' },
      { name: 'goal_set', label: 'Goal configured', occurredAt: '08:35 AM', details: 'Goal: track activation' },
      { name: 'integration_connection_failed', label: 'Integration failed', occurredAt: '08:42 AM', details: 'OAuth permission error' },
    ],
  },
  {
    userId: 'user_marcus_cto',
    plan: 'Enterprise Trial',
    state: 'onboarding_in_progress',
    inactiveHours: 14,
    blocker: 'Drop-off after signup without setting an activation milestone',
    recommendation: 'Trigger automated onboarding checklist email with quick-start template.',
    events: [
      { name: 'trial_started', label: 'Trial started', occurredAt: 'Yesterday', details: 'Plan: enterprise_eval' },
    ],
  },
];

export default function DemoPage() {
  return (
    <AppShell>
      <main className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow">
                <Sparkles size={13} /> Interactive Simulation
              </span>
              <span className="text-xs font-mono text-zinc-500">Read-only Sample Data</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Sample Activation Journeys
            </h1>
            <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
              Explore customer journey memory and autonomous blocker diagnosis without sending live events.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link className="btn btn-primary text-xs py-2 px-3.5" href="/signup">
              Create account
            </Link>
            <Link className="btn text-xs py-2 px-3.5" href="/sdk">
              View SDK setup
            </Link>
          </div>
        </div>

        {/* Demo journeys list */}
        <div className="space-y-4">
          {SAMPLE_JOURNEYS.map((journey) => {
            const isHealthy = !journey.blocker;
            return (
              <div
                key={journey.userId}
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60 shadow-xl backdrop-blur-xl transition hover:border-white/[0.14]"
              >
                <div className="border-b border-white/[0.06] bg-zinc-950/60 px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs">
                        {journey.userId.slice(5, 7).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-sm text-white">{journey.userId}</h2>
                          <span className="rounded-md bg-zinc-800 border border-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-300 font-mono">
                            {journey.plan}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          {journey.events.length} observed milestone{journey.events.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                          isHealthy
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}
                      >
                        {isHealthy ? (
                          <CheckCircle2 size={13} className="text-emerald-400" />
                        ) : (
                          <AlertTriangle size={13} className="text-amber-400" />
                        )}
                        <span>{journey.state.replace(/_/g, ' ')}</span>
                      </div>

                      <span className="flex items-center gap-1 text-zinc-500 font-mono text-[11px]">
                        <Clock3 size={11} /> {journey.inactiveHours}h inactive
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Event pipeline */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Observed Event Progression
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {journey.events.map((evt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="rounded-xl border border-white/[0.06] bg-zinc-950/70 px-3 py-1.5 text-xs shadow-xs">
                            <span className="font-medium text-white">{evt.label}</span>
                            <span className="ml-1.5 text-zinc-500 font-mono text-[11px]">({evt.occurredAt})</span>
                          </div>
                          {idx < journey.events.length - 1 && (
                            <ArrowRight size={13} className="text-zinc-600 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Intelligence insights */}
                  <div className="grid gap-4 rounded-xl border border-white/[0.04] bg-zinc-950/40 p-4 sm:grid-cols-2 text-xs">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Current blocker</p>
                      <p className="mt-1 font-medium text-zinc-200">
                        {journey.blocker ?? 'None detected · Pipeline flowing normally'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Recommended action</p>
                      <p className="mt-1 font-medium text-indigo-200">
                        {journey.recommendation ?? 'Everything looks healthy.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informational banner */}
        <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950/40 p-7 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Continuous Activation Memory</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400 max-w-3xl">
                DealMemory turns raw events into canonical journeys, diagnoses drop-off points, and provides actionable recommendations without session recordings or invasive tracking.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link className="btn btn-primary text-xs py-2 px-4" href="/signup">
                  Get started with your project
                </Link>
                <Link className="btn text-xs py-2 px-4" href="/pricing">
                  View plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
