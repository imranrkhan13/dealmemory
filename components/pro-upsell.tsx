'use client';

import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';

export function ProTag({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[4px] border border-accent-line bg-accent-tint px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-accent ${className}`}
    >
      <Lock size={9} />
      Pro
    </span>
  );
}

/**
 * Inline locked state for a Growth Pro feature.
 * Rendered in place of the feature so the surrounding layout stays intact.
 */
export default function ProUpsell({
  title,
  description,
  className = '',
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <section className={`rounded-card border border-line bg-white p-5 sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-accent-tint text-accent">
            <Lock size={16} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-medium leading-tight text-ink">{title}</h2>
              <ProTag />
            </div>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-ink-soft">{description}</p>
          </div>
        </div>

        <Link
          href="/pricing"
          className="btn btn-primary shrink-0 inline-flex items-center gap-1.5"
        >
          Upgrade to Pro
          <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
