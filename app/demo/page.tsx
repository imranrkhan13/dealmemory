'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Sparkles, Clock3 } from 'lucide-react';

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
              <span className="text-xs font-mono text-slate-400">Read-only Sample Data</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Sample Activation Journeys
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
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
                className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition hover:border-sky-300"
              >
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 border border-sky-200 text-sky-700 font-bold text-xs shadow-xs">
                        {journey.userId.slice(5, 7).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-sm text-slate-900">{journey.userId}</h2>
                          <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700 font-mono">
                            {journey.plan}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {journey.events.length} observed milestone{journey.events.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                          isHealthy
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}
                      >
                        {isHealthy ? (
                          <CheckCircle2 size={13} className="text-emerald-600" />
                        ) : (
                          <AlertTriangle size={13} className="text-amber-600" />
                        )}
                        <span>{journey.state.replace(/_/g, ' ')}</span>
                      </div>

                      <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                        <Clock3 size={11} /> {journey.inactiveHours}h inactive
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Event pipeline */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
                      Observed Event Progression
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {journey.events.map((evt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs shadow-xs">
                            <span className="font-medium text-slate-900">{evt.label}</span>
                            <span className="ml-1.5 text-slate-400 font-mono text-[11px]">({evt.occurredAt})</span>
                          </div>
                          {idx < journey.events.length - 1 && (
                            <ArrowRight size={13} className="text-slate-400 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Intelligence insights */}
                  <div className="grid gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:grid-cols-2 text-xs">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">Current blocker</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {journey.blocker ?? 'None detected · Pipeline flowing normally'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-700 font-mono">Recommended action</p>
                      <p className="mt-1 font-medium text-sky-800">
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
        <div className="rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-50/80 via-white to-blue-50/60 p-7 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 shadow-xs">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Continuous Activation Memory</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 max-w-3xl">
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
