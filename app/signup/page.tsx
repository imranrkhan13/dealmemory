'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { AppShell } from '@/components/app-shell';
import { Brain, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignInError, setIsSignInError] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const create = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setIsSignInError(false);
    setBusy(true);
    try {
      const r = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? 'Signup failed');
        return;
      }
      // Auto sign-in then go to Settings to show API keys onboarding
      const res: any = await signIn('credentials', { redirect: false, email, password });
      if (res?.error) {
        setIsSignInError(true);
        return;
      }
      router.push('/settings');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <main className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-5 py-16">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[550px] rounded-full bg-gradient-to-tr from-sky-400/20 via-blue-400/10 to-transparent blur-3xl" />

        <div className="relative w-full max-w-md rounded-2xl border border-sky-100 bg-white/95 p-8 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-xs">
              <Brain size={20} />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-sky-700">
                DealMemory
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Create founder workspace
              </h1>
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Start tracking user intent, setup friction, and activation in less than 3 minutes.
          </p>

          <form onSubmit={create} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-2">
                Work Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
                placeholder="founder@company.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-2">
                Your Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Alex Morgan"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-2">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
            </div>

            {isSignInError ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span className="leading-relaxed">
                  Could not sign you in. If you already have an account,{' '}
                  <Link href="/auth/signin" className="underline font-semibold text-amber-800 hover:text-amber-950">
                    sign in instead
                  </Link>
                  .
                </span>
              </div>
            ) : error ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              className="btn btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 mt-6"
              disabled={busy}
              aria-busy={busy}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Creating workspace…</span>
                </>
              ) : (
                <>
                  <span>Create workspace</span>
                  <ArrowRight size={15} className="text-white" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
