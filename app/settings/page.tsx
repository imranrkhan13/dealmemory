'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';
import CustomerPortalButton from '@/components/customer-portal-button';

type NormalizedSubscription = {
  dodo_customer_id: string | null;
  subscription_id: string | null;
  subscription_status: string | null;
  current_plan: string | null;
  next_billing_date: string | null;
};

type KeyItem = {
  prefix: string;
  type: 'public' | 'secret';
  createdAt: string;
  revokedAt: string | null;
  masked: string;
};

export default function Settings() {
  const [project, setProject] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [subLoading, setSubLoading] = useState(true);
  const [subscription, setSubscription] = useState<NormalizedSubscription | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelErr, setCancelErr] = useState<string | null>(null);

  // Keys state
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [keysBusy, setKeysBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One-time onboarding (raw keys immediately after signup or first project creation)
  const [onboard, setOnboard] = useState<{ projectId: string; publicKey?: string | null; secretKey?: string | null } | null>(null);
  const [revealed, setRevealed] = useState<Record<string, string>>({}); // prefix -> raw shown in session

  const rawPrefix = useCallback((raw?: string | null) => {
    if (!raw) return null;
    const parts = raw.split('_');
    if (parts.length < 3) return null;
    return `${parts[0]}_${parts[1]}`; // e.g., sk_live_xxxxxxxxxx
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Ensure user has at least one project (server auto-creates for legacy accounts)
        const projectsRes = await fetch('/api/projects', { cache: 'no-store' });
        const projectsData = await projectsRes.json();
        const first = Array.isArray(projectsData?.projects) ? projectsData.projects[0] : null;
        setProject(first ?? null);

        // Load one-time onboarding keys (if present)
        const ob = await fetch('/api/projects/keys/onboard', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ onboard: null }));
        setOnboard(ob?.onboard ?? null);

        // Keys list
        if (first?.id) {
          const list = await fetch(`/api/projects/keys/list?projectId=${first.id}`, { cache: 'no-store' }).then(r => r.json());
          setKeys(Array.isArray(list?.keys) ? list.keys : []);
        }

        // Integration status
        const statusRes = await fetch('/api/v1/integration-status', { cache: 'no-store' });
        const statusData = await statusRes.json();
        setStatus(statusData);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    setSubLoading(true);
    fetch('/api/billing/subscription')
      .then((r) => r.json())
      .then((d) => setSubscription(d?.subscription ?? null))
      .catch(() => setSubscription(null))
      .finally(() => setSubLoading(false));
  }, []);

  const refreshKeys = useCallback(async () => {
    if (!project?.id) return;
    setKeysBusy(true);
    try {
      const list = await fetch(`/api/projects/keys/list?projectId=${project.id}`, { cache: 'no-store' }).then(r => r.json());
      setKeys(Array.isArray(list?.keys) ? list.keys : []);
    } finally {
      setKeysBusy(false);
    }
  }, [project?.id]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const onReveal = (k: KeyItem) => {
    // Reveal is only available for one-time raw in cookie or immediately after regeneration
    const pubPrefix = rawPrefix(onboard?.publicKey);
    const secPrefix = rawPrefix(onboard?.secretKey);
    if (k.prefix === pubPrefix && onboard?.publicKey) {
      setRevealed((m) => ({ ...m, [k.prefix]: onboard!.publicKey! }));
    } else if (k.prefix === secPrefix && onboard?.secretKey) {
      setRevealed((m) => ({ ...m, [k.prefix]: onboard!.secretKey! }));
    } else if (revealed[k.prefix]) {
      // already revealed in-session (e.g., after regeneration)
      return;
    } else {
      alert('Secret can only be viewed once at creation time. Regenerate to get a new secret value.');
    }
  };

  const createKey = async (kind: 'pk_live' | 'sk_live') => {
    if (!project?.id) return;
    setKeysBusy(true);
    try {
      const r = await fetch('/api/projects/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, kind }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error ?? `Create failed (${r.status})`);
      // d.raw contains the one-time key; store in revealed map for the new prefix
      const newPrefix = d?.prefix as string;
      const raw = d?.raw as string;
      if (newPrefix && raw) setRevealed((m) => ({ ...m, [newPrefix]: raw }));
      await refreshKeys();
    } catch (e: any) {
      alert(e?.message ?? 'Create key failed');
    } finally {
      setKeysBusy(false);
    }
  };

  const regenerateSecret = async () => {
    if (!project?.id) return;
    setKeysBusy(true);
    try {
      const r = await fetch('/api/projects/keys/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error ?? `Regenerate failed (${r.status})`);
      const newPrefix = d?.prefix as string;
      const raw = d?.raw as string;
      if (newPrefix && raw) setRevealed((m) => ({ ...m, [newPrefix]: raw }));
      await refreshKeys();
    } catch (e: any) {
      alert(e?.message ?? 'Regenerate failed');
    } finally {
      setKeysBusy(false);
    }
  };

  const revokeKey = async (prefix: string) => {
    if (!project?.id) return;
    if (!confirm('Revoke this key? Applications using this key will stop working.')) return;
    setKeysBusy(true);
    try {
      const r = await fetch('/api/projects/keys/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, prefix }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error ?? `Revoke failed (${r.status})`);
      await refreshKeys();
    } catch (e: any) {
      alert(e?.message ?? 'Revoke failed');
    } finally {
      setKeysBusy(false);
    }
  };

  const projectId = project?.id as string | undefined;

  return (
    <AppShell>
      <ProjectGate>
        <main className="mx-auto max-w-4xl px-5 py-10">
          <p className="text-sm font-semibold text-[#4F46E5]">API Keys</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Manage your API keys</h1>

          {project && (
            <div className="mt-6 rounded-xl border border-[#E7E2DA] bg-[#FFFDF9]">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-5 text-sm border-b md:border-b-0 md:border-r border-[#E7E2DA]">
                  <div className="text-[#6B6B6B]">Project Name</div>
                  <div className="mt-1 font-medium">{project?.name ?? '—'}</div>
                </div>
                <div className="p-5 text-sm">
                  <div className="text-[#6B6B6B]">Project ID</div>
                  <div className="mt-1 font-medium">{project?.id ?? '—'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Keys table */}
          <section className="mt-8 rounded-xl border border-[#E7E2DA] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">API Keys</h2>
              <div className="flex gap-2">
                <button className="btn" disabled={!projectId || keysBusy} onClick={() => createKey('pk_live')}>
                  Create Public Key
                </button>
                <button className="btn btn-primary" disabled={!projectId || keysBusy} onClick={() => createKey('sk_live')}>
                  Create Secret Key
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#E7E2DA] text-xs uppercase text-[#6B6B6B]">
                  <tr>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Key</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => {
                    const canReveal =
                      (rawPrefix(onboard?.publicKey) === k.prefix && !!onboard?.publicKey) ||
                      (rawPrefix(onboard?.secretKey) === k.prefix && !!onboard?.secretKey) ||
                      !!revealed[k.prefix];

                    const display = revealed[k.prefix] ?? k.masked;

                    return (
                      <tr key={k.prefix} className="border-b border-[#E7E2DA] last:border-0">
                        <td className="py-2 pr-4 font-medium capitalize">{k.type}</td>
                        <td className="py-2 pr-4 font-mono">{display}</td>
                        <td className="py-2 pr-4">{new Date(k.createdAt).toLocaleString()}</td>
                        <td className="py-2 pr-4">{k.revokedAt ? 'revoked' : 'active'}</td>
                        <td className="py-2 pr-4">
                          <div className="flex flex-wrap gap-2">
                            <button className="btn" onClick={() => copy(display)} disabled={k.revokedAt !== null}>
                              Copy
                            </button>
                            <button
                              className="btn"
                              onClick={() => onReveal(k)}
                              disabled={!canReveal || k.revokedAt !== null}
                              title={!canReveal ? 'Only shown once at creation time' : ''}
                            >
                              Reveal Secret
                            </button>
                            {k.type === 'secret' && !k.revokedAt && (
                              <button className="btn" onClick={regenerateSecret} disabled={keysBusy}>
                                Regenerate Secret
                              </button>
                            )}
                            {!k.revokedAt && (
                              <button className="btn" onClick={() => revokeKey(k.prefix)} disabled={keysBusy}>
                                Revoke Key
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {keys.length === 0 && (
                    <tr>
                      <td className="py-4 text-[#6B6B6B]" colSpan={5}>
                        No keys yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-[#6B6B6B]">
              Security note: Secrets are only displayed once at the time of creation. If you lose a secret, regenerate a new one.
            </p>
          </section>

          {/* Ingestion / integration status */}
          <section className="mt-8 rounded-xl border border-[#E7E2DA] bg-white p-5">
            <h2 className="font-semibold">Integration Status</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="text-sm">
                <div className="text-[#6B6B6B]">Ingestion</div>
                <div className="mt-1 font-medium">{loading ? 'Loading…' : status?.ingestion ?? 'unknown'}</div>
              </div>
              <div className="text-sm">
                <div className="text-[#6B6B6B]">Events received</div>
                <div className="mt-1 font-medium">{loading ? '…' : status?.eventCount ?? 0}</div>
              </div>
              <div className="text-sm">
                <div className="text-[#6B6B6B]">Latest event</div>
                <div className="mt-1 font-medium">
                  {loading ? '…' : status?.latestEvent ? new Date(status.latestEvent).toLocaleString() : 'No events yet'}
                </div>
              </div>
            </div>
          </section>

          {/* Billing section */}
          <section className="mt-8 rounded-xl border border-[#E7E2DA] bg-white p-5">
            <h2 className="font-semibold">Billing</h2>
            <p className="mt-1 text-sm text-[#6B6B6B]">Manage your Dodo Payments subscription.</p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="text-sm">
                <div className="text-[#6B6B6B]">Status</div>
                <div className="mt-1 font-medium">
                  {subLoading ? 'Loading…' : (subscription?.subscription_status ?? 'none')}
                </div>
              </div>
              <div className="text-sm">
                <div className="text-[#6B6B6B]">Next billing date</div>
                <div className="mt-1 font-medium">
                  {subLoading
                    ? '…'
                    : subscription?.next_billing_date
                    ? new Date(subscription.next_billing_date).toLocaleString()
                    : '—'}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <CustomerPortalButton />
              <button className="btn" onClick={() => {
                setCancelErr(null);
                setCancelBusy(true);
                fetch('/api/billing/subscription/cancel', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ cancel_at_period_end: false }),
                })
                  .then(async (r) => {
                    const d = await r.json();
                    if (!r.ok) throw new Error(d?.error || `Cancel failed (${r.status})`);
                    return fetch('/api/billing/subscription').then((x) => x.json()).catch(() => null);
                  })
                  .then((s) => setSubscription(s?.subscription ?? null))
                  .catch((e) => setCancelErr(e?.message ?? 'Cancel failed'))
                  .finally(() => setCancelBusy(false));
              }} disabled={cancelBusy}>
                {cancelBusy ? 'Cancelling…' : 'Cancel immediately'}
              </button>
            </div>
            {cancelErr ? <p className="mt-2 text-sm text-red-600">{cancelErr}</p> : null}
          </section>
        </main>
      </ProjectGate>
    </AppShell>
  );
}
