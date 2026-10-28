"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { AppShell } from '@/components/app-shell';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignInError, setIsSignInError] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const create = async () => {
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
      <main className="mx-auto max-w-2xl px-5 py-16">
        <p className="text-sm font-semibold text-[#4F46E5]">Create founder account</p>
        <h1 className="landing-display mt-3 text-5xl">Create your founder account.</h1>
        <p className="mt-4 text-sm leading-7 text-[#6B7280]">Create an account to manage projects and billing.</p>

        <div className="mt-9 border-y border-[#E7E2DA] py-7">
          <label className="block text-sm font-medium">Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required className="mt-3 w-full rounded-lg border border-[#E7E2DA] bg-[#FFFDF9] px-3 py-2.5" />
          </label>
          <label className="block text-sm font-medium mt-4">Name
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="mt-3 w-full rounded-lg border border-[#E7E2DA] bg-[#FFFDF9] px-3 py-2.5" />
          </label>
          <label className="block text-sm font-medium mt-4">Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="new-password" minLength={8} required className="mt-3 w-full rounded-lg border border-[#E7E2DA] bg-[#FFFDF9] px-3 py-2.5" />
          </label>

          <button className="btn btn-primary mt-6" onClick={create} disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
          {isSignInError ? (
            <p className="mt-3 text-sm text-[#B91C1C]">
              Could not sign you in. If you already have an account,{' '}
              <Link href="/auth/signin" className="underline font-semibold hover:text-[#7F1D1D]">
                sign in instead
              </Link>
              .
            </p>
          ) : error ? (
            <p className="mt-3 text-sm text-[#B91C1C]">{error}</p>
          ) : null}
        </div>
      </main>
    </AppShell>
  );
}
