'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, Plus, RefreshCw, AlertCircle } from 'lucide-react';

type Project = {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
};

export default function ProjectGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/projects', { cache: 'no-store' });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Projects load failed (${res.status}) ${text}`);
        }
        const data = await res.json();
        if (mounted) setProjects(Array.isArray(data?.projects) ? data.projects : []);
      } catch (e: any) {
        if (mounted) {
          setError(e?.message ?? 'Failed to load projects');
          setProjects([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-card border border-line bg-white px-5 py-3 ">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-xs font-medium text-ink-soft">Loading workspace context…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-card border border-danger/40 bg-danger-tint text-danger ">
          <AlertCircle size={22} />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-danger">Workspace Access</p>
        <h1 className="mt-2 text-[26px] font-medium leading-tight tracking-[-0.025em] text-ink">Could not load workspace</h1>
        <p className="mt-3 text-sm leading-6 text-ink-soft">{error}</p>
        <button
          className="btn btn-primary mt-6 inline-flex items-center gap-2"
          onClick={() => location.reload()}
        >
          <RefreshCw size={14} /> Retry connection
        </button>
      </main>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-card border border-line bg-accent-tint text-accent ">
          <Layers size={22} />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-accent">Workspace Setup</p>
        <h1 className="mt-2 text-[28px] font-medium leading-tight tracking-[-0.025em] text-ink">Create your first project</h1>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          Projects scope your AI activation memories, API keys, and journey diagnostics. Create a project to begin.
        </p>
        <Link className="btn btn-primary mt-6 inline-flex items-center gap-2" href="/signup">
          <Plus size={15} /> Create project workspace
        </Link>
      </main>
    );
  }

  return <>{children}</>;
}
