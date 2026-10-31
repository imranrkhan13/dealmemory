'use client';

import { useEffect, useState } from 'react';

export type PlanLimits = {
  projects: number | null;
  monthlyEvents: number | null;
};

export type PlanState = {
  plan: 'starter' | 'pro';
  isPro: boolean;
  status?: string | null;
  currentPeriodEnd?: string | null;
  limits: PlanLimits;
  usage: { projects: number; eventsThisMonth: number };
};

/**
 * Resolves the signed-in user's plan from the billing API.
 * Returns `loading` until the first response so gated UI never flashes the wrong state.
 */
export function usePlan() {
  const [plan, setPlan] = useState<PlanState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch('/api/billing/subscription', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || `Plan lookup failed (${res.status})`);
        return data as { plan?: PlanState };
      })
      .then((data) => {
        if (mounted && data?.plan) setPlan(data.plan);
      })
      .catch((e: Error) => {
        if (mounted) setError(e.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { plan, isPro: !!plan?.isPro, loading, error };
}
