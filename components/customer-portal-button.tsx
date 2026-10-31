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
        className="btn w-full flex items-center justify-center gap-2 border border-line bg-white hover:bg-accent-tint text-ink-soft hover:text-accent py-2.5 text-sm font-medium transition-all "
        onClick={openPortal}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-ink-faint" />
            <span>Opening billing portal…</span>
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 text-ink-soft" />
            <span>Manage subscription</span>
          </>
        )}
      </button>
      {err ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-danger/40 bg-danger-tint p-3 text-xs text-danger">
          <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
          <span>{err}</span>
        </div>
      ) : null}
    </div>
  );
}
