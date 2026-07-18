'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

type Props = {
  label?: string;
  className?: string;
};

export default function UpgradeButton({ label = 'Upgrade to Pro', className }: Props) {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    setErr(null);

    if (status !== 'authenticated') {
      // Require login before starting checkout
      await signIn(undefined, { callbackUrl: '/pricing' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Checkout failed (${res.status})`);
      }

      const data = (await res.json()) as { checkout_url?: string };
      if (!data.checkout_url) {
        throw new Error('Checkout URL missing in response');
      }

      window.location.href = data.checkout_url;
    } catch (e: any) {
      setErr(e?.message ?? 'Unable to start checkout');
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        className="btn btn-primary w-full"
        onClick={onClick}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Redirecting…' : label}
      </button>
      {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
    </div>
  );
}