'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

  if (loading) return null;

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-20">
        <p className="text-sm font-semibold text-[#4F46E5]">Project access</p>
        <h1 className="landing-display mt-3 text-4xl">We could not load your projects.</h1>
        <p className="mt-4 text-sm leading-6 text-[#6B7280]">{error}</p>
        <button className="btn btn-primary mt-6" onClick={() => location.reload()}>Retry</button>
      </main>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-20">
        <p className="text-sm font-semibold text-[#4F46E5]">Project access</p>
        <h1 className="landing-display mt-3 text-4xl">Create your first project.</h1>
        <p className="mt-4 text-sm leading-6 text-[#6B7280]">
          Projects scope event keys and dashboard data. Create a project to continue.
        </p>
        <Link className="btn btn-primary mt-6" href="/signup">Create project</Link>
      </main>
    );
  }

  return <>{children}</>;
}
