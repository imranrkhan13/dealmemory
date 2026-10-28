'use client';

import { useCallback, useEffect, useState } from 'react';
import { KeyRound, CheckCircle2, Radio, Copy, Plus, Check, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import InstallationGuide from '@/components/installation-guide';
import CustomerPortalButton from '@/components/customer-portal-button';

type Key = { prefix: string; type: string; createdAt: string; revokedAt: string | null };

export default function Settings() {
  const [project, setProject] = useState<{ id: string; name: string } | null>(null);
  const [keys, setKeys] = useState<Key[]>([]);
  const [raw, setRaw] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [copiedRaw, setCopiedRaw] = useState(false);

  const refresh = useCallback(async (id: string) => {
    const r = await fetch(`/api/projects/keys/list?projectId=${encodeURIComponent(id)}`, { cache: 'no-store' });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    setKeys((d.keys || []).filter((k: Key) => k.type === 'public'));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/projects', { cache: 'no-store' });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        const p = d.projects?.[0];
        setProject(p || null);
        if (p) {
          await refresh(p.id);
          const s = await fetch(`/api/v1/integration-status?projectId=${encodeURIComponent(p.id)}`).then((x) => x.json());
          setStatus(s);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const create = async () => {
    if (!project) return;
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/projects/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, kind: 'pk_live' }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setRaw(d.raw);
      setNotice('Public key created. Copy it now; it is shown only in this session.');
      await refresh(project.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (prefix: string) => {
    if (
      !project ||
      !confirm('Revoke this key? Apps using it will stop sending events. Existing history stays available.')
    )
      return;
    setBusy(true);
    try {
      const r = await fetch('/api/projects/keys/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, prefix }),
      });
      if (!r.ok) throw new Error('Could not revoke key');
      if (raw?.startsWith(prefix)) setRaw(null);
      await refresh(project.id);
      setNotice('Key revoked. Your event history is preserved.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <main className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow">
                <KeyRound size={13} /> Connection &amp; Keys
              </span>
              <span className="text-xs font-mono text-zinc-500">API Access</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Connect Your Product
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage public ingest keys, monitor incoming events, and configure optional integrations.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl border border-white/[0.08] bg-zinc-900/60 px-4 py-2 backdrop-blur">
            <span
              className={`h-2 w-2 rounded-full ${
                status?.eventCount ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-semibold text-zinc-300">
              {loading
                ? 'Loading workspace…'
                : status?.eventCount
                ? 'Receiving events'
                : 'Ready to connect'}
            </span>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300">
            {error}
          </div>
        )}

        {notice && (
          <div role="status" className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-xs text-indigo-300 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-indigo-400" />
            <span>{notice}</span>
          </div>
        )}

        {/* Status Panels */}
        <div className="grid gap-4 sm:grid-cols-3">
          <section className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
            <p className="eyebrow">
              <KeyRound size={13} /> Project Workspace
            </p>
            <h2 className="mt-2 break-words font-bold text-lg text-white">
              {project?.name || (loading ? 'Loading…' : 'No project')}
            </h2>
            <p className="mt-1 break-all font-mono text-xs text-zinc-500">{project?.id}</p>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
            <p className="eyebrow">
              <Radio size={13} /> Ingested Events
            </p>
            <p className="mt-2 text-3xl font-extrabold text-white tabular-nums tracking-tight">
              {loading ? '—' : status?.eventCount || 0}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Total actions persisted</p>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
            <p className="eyebrow">
              <CheckCircle2 size={13} /> Last Telemetry
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-200">
              {status?.latestEvent ? new Date(status.latestEvent).toLocaleString() : 'Awaiting first event'}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Automated heartbeat</p>
          </section>
        </div>

        {/* One-time raw key banner */}
        {raw && (
          <section className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <h2 className="text-sm font-bold text-emerald-300">New Public Ingest Key · Shown Once</h2>
            </div>
            <p className="mt-1 text-xs text-emerald-200/70">
              Copy and store this key now. For your security, only the key prefix is retained in the database.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <code className="min-w-0 flex-1 rounded-xl border border-emerald-500/30 bg-black/50 p-3 font-mono text-xs text-emerald-300 break-all">
                {raw}
              </code>
              <button
                className="btn btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(raw);
                    setCopiedRaw(true);
                    setNotice('Key copied to clipboard');
                    setTimeout(() => setCopiedRaw(false), 2000);
                  } catch {
                    setNotice('Select the key and copy it manually.');
                  }
                }}
              >
                {copiedRaw ? <Check size={14} className="text-emerald-900" /> : <Copy size={14} />}
                {copiedRaw ? 'Copied' : 'Copy key'}
              </button>
            </div>
          </section>
        )}

        {/* Installation Guide */}
        <InstallationGuide
          publicKey={raw}
          creatingKey={busy || !project}
          onCreatePublicKey={() => void create()}
        />

        {/* Public Keys Management */}
        <section className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div>
              <h2 className="font-bold text-lg text-white">Active Public Ingest Keys</h2>
              <p className="mt-0.5 text-xs text-zinc-400">
                Safe to include in browser/mobile client applications. Only prefixes and bcrypt hashes are saved.
              </p>
            </div>
            <button
              className="btn btn-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
              disabled={busy || !project}
              onClick={() => void create()}
            >
              <Plus size={14} /> Create public key
            </button>
          </div>

          <div className="mt-4 divide-y divide-white/[0.04]">
            {keys.map((k) => (
              <div className="flex flex-wrap items-center justify-between gap-3 py-3.5" key={k.prefix}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-950 font-mono text-xs text-indigo-400">
                    pk
                  </div>
                  <div>
                    <code className="text-xs font-mono font-medium text-white">{k.prefix}…</code>
                    <p className="text-[11px] font-mono text-zinc-500">
                      Created {new Date(k.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      k.revokedAt
                        ? 'border-zinc-800 bg-zinc-900 text-zinc-500'
                        : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${k.revokedAt ? 'bg-zinc-600' : 'bg-emerald-400'}`} />
                    {k.revokedAt ? 'Revoked' : 'Active'}
                  </span>

                  {!k.revokedAt && (
                    <button
                      className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors"
                      disabled={busy}
                      onClick={() => void revoke(k.prefix)}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}

            {!keys.length && (
              <p className="py-8 text-center text-xs text-zinc-500">
                No public keys generated yet. Click &quot;Create public key&quot; above to connect your first client.
              </p>
            )}
          </div>
        </section>

        {/* Optional Integrations */}
        <section className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          <div className="border-b border-white/[0.06] pb-4">
            <h2 className="font-bold text-lg text-white">Ecosystem Integrations</h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Optional upstream services for vector memory indexing and subscription billing.
            </p>
          </div>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-zinc-950/40 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Supermemory Vector Store</p>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {status?.supermemory ? 'Configured' : 'Standby'}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Provides semantic vector retrieval over user goals and historical failure notes. Core telemetry operates autonomously.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-zinc-950/40 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Dodo Payments Billing</p>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {status?.dodo ? 'Configured' : 'Standby'}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Synchronizes subscription tiers, customer invoices, and automated checkout upgrades.
              </p>
              {status?.dodo && (
                <div className="mt-4">
                  <CustomerPortalButton />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
