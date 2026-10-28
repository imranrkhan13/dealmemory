import Link from 'next/link';
import UpgradeButton from '@/components/upgrade-button';
import { AppShell } from '@/components/app-shell';
import { Check, Sparkles, Zap, Shield, HelpCircle } from 'lucide-react';

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
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Start Free. Upgrade for Scale.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Never lose another customer to avoidable setup blockers. Unlock full AI Copilot synthesis when you are ready.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-3xl border border-white/[0.08] bg-zinc-900/60 p-8 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Starter</span>
                <span className="rounded-md border border-white/[0.08] bg-zinc-950 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                  Forever Free
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white tracking-tight">$0</span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                Ideal for indie hackers and early-stage SaaS launching their first product loop.
              </p>

              <div className="mt-8 border-t border-white/[0.06] pt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">What is included:</p>
                <ul className="space-y-2.5 text-xs text-zinc-300">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
                        <Check size={10} />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <Link href="/signup" className="btn w-full justify-center text-xs py-2.5">
                Get started free
              </Link>
            </div>
          </div>

          {/* Pro Tier (Supermemory glow style) */}
          <div className="relative rounded-3xl border border-indigo-500/40 bg-gradient-to-b from-indigo-950/60 via-zinc-900/90 to-zinc-950/90 p-8 shadow-2xl backdrop-blur-2xl flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Growth Pro</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300">
                  <Sparkles size={10} /> Recommended
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white tracking-tight">$49</span>
                <span className="text-xs text-zinc-400">/ month</span>
              </div>
              <p className="mt-2 text-xs text-indigo-200/80">
                For growth-stage AI startups that need continuous user memory and autonomous drop-off recovery.
              </p>

              <div className="mt-8 border-t border-white/[0.06] pt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Everything in Free, plus:</p>
                <ul className="space-y-2.5 text-xs text-zinc-200">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        <Check size={10} />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative mt-8 pt-6 border-t border-white/[0.06]">
              <UpgradeButton />
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
