import Link from 'next/link';
import UpgradeButton from '@/components/upgrade-button';
import { AppShell } from '@/components/app-shell';
import { Check } from 'lucide-react';

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
  'AI copilot synthesis & recommendations',
  'Supermemory vector semantic retrieval',
  'Multi-team access & role permissions',
  'Priority ingestion pipeline & dedicated SLAs',
  'Automated Slack & webhook blocker alerts',
];

export default function PricingPage() {
  return (
    <AppShell>
      <main className="space-y-12">
        <div className="grid gap-6 border-b border-line pb-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">Pricing</p>
            <h1 className="mt-3 text-[36px] font-normal leading-[1.08] tracking-[-0.03em] text-ink sm:text-[48px]">
              Start free. Upgrade for scale.
            </h1>
          </div>
          <p className="max-w-md text-[14px] leading-relaxed text-ink-soft lg:justify-self-end">
            Never lose another trial to an avoidable setup blocker. Keep the full journey history on every plan;
            unlock AI synthesis when your funnel is ready.
          </p>
        </div>

        <div className="grid max-w-4xl gap-4 md:grid-cols-2">
          {/* Starter */}
          <section className="flex flex-col rounded-card border border-line bg-white">
            <div className="border-b border-line px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-soft">
                  Starter
                </span>
                <span className="tag-mono">Forever free</span>
              </div>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-[40px] font-normal leading-none tracking-[-0.03em] text-ink">$0</span>
                <span className="text-[12px] text-ink-faint">/ month</span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                For indie hackers and early-stage SaaS validating their first activation loop.
              </p>
            </div>

            <div className="flex-1 px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-faint">
                Included
              </p>
              <ul className="mt-3 space-y-2.5">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-ink-soft">
                    <Check size={13} className="mt-0.5 shrink-0 text-ink-faint" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 pb-6">
              <Link href="/signup" className="btn h-10 w-full justify-center">
                Get started free
              </Link>
            </div>
          </section>

          {/* Growth Pro */}
          <section className="flex flex-col rounded-card border border-accent bg-white">
            <div className="border-b border-accent-line px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-accent">
                  Growth Pro
                </span>
                <span className="inline-flex items-center rounded-[4px] bg-accent px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-white">
                  Recommended
                </span>
              </div>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-[40px] font-normal leading-none tracking-[-0.03em] text-ink">$49</span>
                <span className="text-[12px] text-ink-faint">/ month</span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                For growth-stage AI products that need continuous customer memory and autonomous recovery.
              </p>
            </div>

            <div className="flex-1 px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-faint">
                Everything in Starter, plus
              </p>
              <ul className="mt-3 space-y-2.5">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-ink">
                    <Check size={13} className="mt-0.5 shrink-0 text-accent" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 pb-6">
              <UpgradeButton />
            </div>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          <p className="text-[12px] text-ink-faint">
            Prices in USD. Cancel anytime from the customer portal.
          </p>
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:text-accent-deep"
          >
            Read the setup guide
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
