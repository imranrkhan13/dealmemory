'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import InstallationGuide from '@/components/installation-guide';
import { Terminal, Shield, ArrowRight, Zap } from 'lucide-react';

const steps = [
  {
    n: '01',
    icon: Terminal,
    title: 'Emit Product Milestones',
    body: 'Call track() for key actions like trial_started, goal_set, repository_connected, and first_value_reached with stable user identifiers.',
  },
  {
    n: '02',
    icon: Shield,
    title: 'Privacy-Safe Redaction',
    body: 'Targeted credential scanners reject sensitive values (passwords, JWTs, bearer tokens) before storage. URL queries are stripped automatically.',
  },
  {
    n: '03',
    icon: Zap,
    title: 'Autonomous Synthesis',
    body: 'DealMemory automatically reconstructs canonical journeys, detects setup drop-offs, and provides actionable recommendations.',
  },
];

export default function SdkPage() {
  return (
    <AppShell>
      <main className="space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow">
              <Terminal size={13} /> Developer Hub
            </span>
            <span className="text-xs font-mono text-slate-400">Lightweight SDK</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            From Event to Intelligence
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Integrate DealMemory into your TypeScript, Node.js, Python, or curl workflows with simple HTTP endpoints.
          </p>
        </div>

        <InstallationGuide
          creatingKey={false}
          onCreatePublicKey={() => {
            location.href = '/settings';
          }}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <section
                key={step.n}
                className="relative overflow-hidden rounded-2xl border border-sky-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-600">{step.n}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200 shadow-xs">
                    <Icon size={15} />
                  </div>
                </div>
                <h2 className="mt-4 font-bold text-base text-slate-900">{step.title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.body}</p>
              </section>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50/80 via-white to-blue-50/60 p-6 shadow-sm">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Ready to configure your project?</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Generate public keys and test real event ingestion from your local development environment.
            </p>
          </div>
          <Link href="/settings" className="btn btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2 shrink-0">
            Go to Settings &amp; Keys <ArrowRight size={13} />
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
