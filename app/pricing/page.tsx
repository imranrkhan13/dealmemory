import Link from 'next/link';
import UpgradeButton from '@/components/upgrade-button';
import { AppShell } from '@/components/app-shell';
import { Check, Sparkles } from 'lucide-react';

const freeFeatures = [
  'Single project workspace',
  'Up to 10,000 monthly telemetry events',
  'Automated activation funnel mapping',
  'Basic friction & blocker detection',
  'Lightweight SDK & HTTP API access',
  'Community support',
];

const proFeatures = [
  'Unlimited project workspaces',
  'Unlimited monthly telemetry events',
  'AI Copilot synthesis & recommendations',
  'Supermemory vector semantic retrieval',
  'Multi-team access & role permissions',
  'Priority ingestion pipeline & dedicated SLAs',
  'Automated Slack & webhook blocker alerts',
];

export default function PricingPage() {
  return (
    <AppShell>
      <main className="space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow mx-auto justify-center">
            <Sparkles size={13} /> Transparent Pricing
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Start Free. Upgrade for Scale.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Never lose another customer to avoidable setup blockers. Unlock full AI Copilot synthesis when you are ready.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-3xl border border-sky-100 bg-white p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Starter</span>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                  Forever Free
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">$0</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Ideal for indie hackers and early-stage SaaS launching their first product loop.
              </p>

              <div className="mt-8 border-t border-slate-100 pt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">What is included:</p>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <Check size={10} />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link href="/signup" className="btn w-full justify-center text-xs py-2.5">
                Get started free
              </Link>
            </div>
          </div>

          {/* Pro Tier (Light blue gradient) */}
          <div className="relative rounded-3xl border border-sky-300 bg-gradient-to-b from-sky-50/90 via-white to-blue-50/40 p-8 shadow-md flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 font-mono">Growth Pro</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 border border-sky-200 px-2.5 py-0.5 text-[10px] font-bold text-sky-800">
                  <Sparkles size={10} /> Recommended
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">$49</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                For growth-stage AI startups that need continuous user memory and autonomous drop-off recovery.
              </p>

              <div className="mt-8 border-t border-sky-100 pt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-800 font-mono">Everything in Free, plus:</p>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                        <Check size={10} />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative mt-8 pt-6 border-t border-sky-100">
              <UpgradeButton />
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
