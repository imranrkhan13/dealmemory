'use client';

import { useState } from 'react';

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
      <button className="btn" onClick={openPortal} disabled={loading} aria-busy={loading}>
        {loading ? 'Opening portal…' : 'Manage subscription'}
      </button>
      {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
    </div>
  );
}