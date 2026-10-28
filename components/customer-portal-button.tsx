'use client';

import { useState } from 'react';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';

export default function CustomerPortalButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const openPortal = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch('/api/billing/customer-portal', { method: 'GET' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Portal failed (${res.status})`);
      if (!data?.url) throw new Error('Missing portal URL');
      window.location.href = data.url as string;
    } catch (e: any) {
      setErr(e?.message ?? 'Unable to open customer portal');
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        className="btn w-full flex items-center justify-center gap-2 border border-white/[0.08] bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white py-2.5 text-sm font-medium transition-all"
        onClick={openPortal}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            <span>Opening billing portal…</span>
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 text-zinc-400" />
            <span>Manage subscription</span>
          </>
        )}
      </button>
      {err ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{err}</span>
        </div>
      ) : null}
    </div>
  );
}
