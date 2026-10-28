'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Brain, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get('callbackUrl') || '/overview';
  const callbackUrl =
    rawCallback.startsWith('/') && !rawCallback.startsWith('/auth')
      ? rawCallback
      : '/overview';
  const { status } = useSession();

  useEffect(() => {
    if (typeof window !== 'undefined' && searchParams.get('callbackUrl')) {
      window.history.replaceState(null, '', '/auth/signin');
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res: any = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl,
      });
      if (res?.error) {
        setError('Invalid email or password. If you are new, create an account below.');
        return;
      }
      router.push(res?.url ?? callbackUrl);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <main className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-5 py-16">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[550px] rounded-full bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-transparent blur-3xl" />

        <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-zinc-900/70 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Brain size={20} />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
                DealMemory
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Sign in to workspace
              </h1>
            </div>
          </div>

          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            Access your telemetry streams, activation funnels, and customer journey memory.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                Email Address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
                placeholder="founder@company.com"
                className="w-full rounded-xl border border-white/[0.1] bg-zinc-950/70 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-white/[0.1] bg-zinc-950/70 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_-3px_rgba(255,255,255,0.3)] mt-6"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={15} className="text-zinc-950" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-white/[0.06] pt-4 text-center">
            <p className="text-xs text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Create a workspace
              </Link>
            </p>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
