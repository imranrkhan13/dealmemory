'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { CheckCircle2, AlertTriangle, ArrowRight, Activity, ShieldCheck, Sparkles } from 'lucide-react';

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
      <main className="mx-auto max-w-5xl px-5 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <Sparkles size={13} /> Interactive Demo
              </span>
              <span className="text-xs text-[#6B6B6B]">Read-only sample data</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#29221D] sm:text-4xl">
              Sample Activation Journeys
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B6B6B]">
              Explore sample customer journeys analyzed by AgentLens intelligence. No API keys or writes required.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link className="btn btn-primary" href="/signup">
              Create account
            </Link>
            <Link className="btn" href="/sdk">
              View SDK setup
            </Link>
          </div>
        </div>

        {/* Demo journeys list */}
        <div className="mt-10 space-y-6">
          {SAMPLE_JOURNEYS.map((journey) => {
            const isHealthy = !journey.blocker;
            return (
              <div
                key={journey.userId}
                className="overflow-hidden rounded-2xl border border-[#E7E2DA] bg-[#FFFDF9] shadow-sm transition hover:shadow-md"
              >
                <div className="border-b border-[#E7E2DA] bg-white px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-sm">
                        {journey.userId.slice(5, 7).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-[#29221D]">{journey.userId}</h2>
                          <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600 font-medium">
                            {journey.plan}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B6B6B]">{journey.events.length} observed events</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-sm font-medium">
                        {isHealthy ? (
                          <>
                            <CheckCircle2 size={16} className="text-emerald-600" />
                            <span className="text-emerald-700 capitalize">
                              {journey.state.replace(/_/g, ' ')}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={16} className="text-amber-600" />
                            <span className="text-amber-700 capitalize">
                              {journey.state.replace(/_/g, ' ')}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-[#6B6B6B]">{journey.inactiveHours}h inactive</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Event pipeline */}
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase text-[#6B6B6B]">
                      Observed Event Sequence
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {journey.events.map((evt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="rounded-lg border border-[#E7E2DA] bg-white px-3 py-1.5 text-xs shadow-xs">
                            <span className="font-medium text-[#29221D]">{evt.label}</span>
                            <span className="ml-1.5 text-stone-400">({evt.occurredAt})</span>
                          </div>
                          {idx < journey.events.length - 1 && (
                            <ArrowRight size={13} className="text-stone-400 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Intelligence insights */}
                  <div className="mt-6 grid gap-4 rounded-xl border border-[#E7E2DA] bg-white p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-stone-500">Current blocker</p>
                      <p className="mt-1 text-sm font-medium text-[#29221D]">
                        {journey.blocker ?? 'None detected'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-stone-500">Recommended action</p>
                      <p className="mt-1 text-sm font-medium text-[#29221D]">
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
        <div className="mt-10 rounded-2xl border border-[#E7E2DA] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-[#29221D]">How AgentLens Intelligence Works</h3>
              <p className="mt-1 text-sm leading-6 text-[#6B6B6B]">
                Your application sends minimal, privacy-safe events via the lightweight client SDK. AgentLens automatically constructs canonical journeys, diagnoses drop-off points, and surfaces actionable recommendations without session recordings or invasive tracking.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link className="btn btn-primary" href="/signup">
                  Get started with your project
                </Link>
                <Link className="btn" href="/pricing">
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
