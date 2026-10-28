'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import InstallationGuide from '@/components/installation-guide';
import { Terminal, Shield, ArrowRight, Zap, Layers, Sparkles } from 'lucide-react';

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
            <span className="text-xs font-mono text-zinc-500">Lightweight SDK</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            From Event to Intelligence
          </h1>
          <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
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
                className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-400">{step.n}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Icon size={15} />
                  </div>
                </div>
                <h2 className="mt-4 font-bold text-base text-white">{step.title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{step.body}</p>
              </section>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-6 backdrop-blur-xl">
          <div>
            <h3 className="font-bold text-white text-base">Ready to configure your project?</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
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
