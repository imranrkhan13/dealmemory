'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

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
        className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 shadow-md transition-all duration-200"
        onClick={onClick}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Redirecting to Checkout…</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-white" />
            <span>{label}</span>
          </>
        )}
      </button>
      {err ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{err}</span>
        </div>
      ) : null}
    </div>
  );
}
