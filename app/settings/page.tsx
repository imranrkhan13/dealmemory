'use client';

import { useCallback, useEffect, useState } from 'react';
import { KeyRound, CheckCircle2, Radio, Copy, Plus, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import InstallationGuide from '@/components/installation-guide';
import CustomerPortalButton from '@/components/customer-portal-button';
import { ProTag } from '@/components/pro-upsell';
import { usePlan } from '@/components/use-plan';

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
  const { plan, isPro } = usePlan();

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
            <span className="eyebrow">Connection &amp; keys</span>
            <h1 className="mt-2 text-[28px] font-medium leading-tight tracking-[-0.025em] text-ink">
              Connect your product
            </h1>
            <p className="mt-1 text-[13px] text-ink-soft">
              Manage public ingest keys, monitor incoming events, and configure optional integrations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 rounded-md border border-line bg-white px-2.5 py-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status?.eventCount ? 'bg-success' : 'bg-warn'
                }`}
              />
              <span className="font-mono text-[11px] text-ink-soft">
                {loading
                  ? 'Loading workspace…'
                  : status?.eventCount
                  ? 'Receiving events'
                  : 'Ready to connect'}
              </span>
            </div>

            {isPro ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-accent-line bg-accent-tint px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.04em] text-accent">
                Pro plan
              </span>
            ) : (
              <a
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.04em] text-ink-soft transition-colors hover:border-accent-line hover:text-accent"
              >
                Starter plan · Upgrade
              </a>
            )}
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-card border border-danger/40 bg-danger-tint p-4 text-xs text-danger">
            {error}
          </div>
        )}

        {notice && (
          <div role="status" className="rounded-card border border-line bg-accent-tint p-4 text-xs text-accent flex items-center gap-2">
            <CheckCircle2 size={14} className="text-accent" />
            <span>{notice}</span>
          </div>
        )}

        {/* Status Panels */}
        <div className="grid gap-4 sm:grid-cols-3">
          <section className="rounded-card border border-line bg-white p-6 ">
            <p className="eyebrow">
              <KeyRound size={13} /> Project Workspace
            </p>
            <h2 className="mt-2 break-words font-medium text-[15px] text-ink">
              {project?.name || (loading ? 'Loading…' : 'No project')}
            </h2>
            <p className="mt-1 break-all font-mono text-xs text-ink-faint">{project?.id}</p>
          </section>

          <section className="rounded-card border border-line bg-white p-6 ">
            <p className="eyebrow">
              <Radio size={13} /> Ingested Events
            </p>
            <p className="mt-2 text-3xl font-extrabold text-ink tabular-nums tracking-tight">
              {loading ? '—' : status?.eventCount || 0}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {isPro
                ? 'Total actions persisted · unlimited'
                : `${(plan?.usage.eventsThisMonth ?? 0).toLocaleString()} of 10,000 account events used this month`}
            </p>
          </section>

          <section className="rounded-card border border-line bg-white p-6 ">
            <p className="eyebrow">
              <CheckCircle2 size={13} /> Last Telemetry
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">
              {status?.latestEvent ? new Date(status.latestEvent).toLocaleString() : 'Awaiting first event'}
            </p>
            <p className="mt-1 text-xs text-ink-soft">Automated heartbeat</p>
          </section>
        </div>

        {/* One-time raw key banner */}
        {raw && (
          <section className="rounded-card border border-success/40 bg-success-tint p-6 ">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-success" />
              <h2 className="text-sm font-bold text-success">New Public Ingest Key · Shown Once</h2>
            </div>
            <p className="mt-1 text-xs text-success">
              Copy and store this key now. For your security, only the key prefix is retained in the database.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <code className="min-w-0 flex-1 rounded-lg border border-success/40 bg-white p-3 font-mono text-xs text-success break-all ">
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
                {copiedRaw ? <Check size={14} className="text-white" /> : <Copy size={14} />}
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
        <section className="rounded-card border border-line bg-white p-6 sm:p-8 ">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <h2 className="font-medium text-[15px] text-ink">Active Public Ingest Keys</h2>
              <p className="mt-0.5 text-xs text-ink-soft">
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

          <div className="mt-4 divide-y divide-line">
            {keys.map((k) => (
              <div className="flex flex-wrap items-center justify-between gap-3 py-3.5" key={k.prefix}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-accent-tint font-mono text-xs font-semibold text-accent ">
                    pk
                  </div>
                  <div>
                    <code className="text-xs font-mono font-medium text-ink">{k.prefix}…</code>
                    <p className="text-[11px] font-mono text-ink-faint">
                      Created {new Date(k.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      k.revokedAt
                        ? 'border-line bg-muted text-ink-soft'
                        : 'border-success/40 bg-success-tint text-success'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${k.revokedAt ? 'bg-slate-400' : 'bg-success'}`} />
                    {k.revokedAt ? 'Revoked' : 'Active'}
                  </span>

                  {!k.revokedAt && (
                    <button
                      className="text-xs font-medium text-danger hover:text-danger transition-colors"
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
              <p className="py-8 text-center text-xs text-ink-faint">
                No public keys generated yet. Click &quot;Create public key&quot; above to connect your first client.
              </p>
            )}
          </div>
        </section>

        {/* Optional Integrations */}
        <section className="rounded-card border border-line bg-white p-6 sm:p-8 ">
          <div className="border-b border-line pb-4">
            <h2 className="font-medium text-[15px] text-ink">Ecosystem Integrations</h2>
            <p className="mt-0.5 text-xs text-ink-soft">
              Optional upstream services for vector memory indexing and subscription billing.
            </p>
          </div>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-paper p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">Supermemory Vector Store</p>
                {isPro ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-line text-ink-soft font-medium">
                    {status?.supermemory ? 'Configured' : 'Standby'}
                  </span>
                ) : (
                  <ProTag />
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                {isPro
                  ? 'Provides semantic vector retrieval over user goals and historical failure notes. Core telemetry operates autonomously.'
                  : 'Semantic retrieval over user goals and failure notes is a Growth Pro feature. Core telemetry keeps flowing on Starter.'}
              </p>
              {!isPro && (
                <a
                  href="/pricing"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-deep"
                >
                  Upgrade to unlock <ArrowRight size={12} />
                </a>
              )}
            </div>

            <div className="rounded-lg border border-line bg-paper p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">Dodo Payments Billing</p>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-line text-ink-soft font-medium">
                  {status?.dodo ? 'Configured' : 'Standby'}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
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
