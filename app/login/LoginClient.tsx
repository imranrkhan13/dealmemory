"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { AppShell } from '@/components/app-shell';

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

  const submit = async () => {
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
      <main className="mx-auto max-w-2xl px-5 py-16">
        <p className="text-sm font-semibold text-[#4F46E5]">Sign in</p>
        <h1 className="landing-display mt-3 text-5xl">Sign in to your account.</h1>
        <p className="mt-4 text-sm leading-7 text-[#6B7280]">
          Use your founder credentials to manage projects and billing.
        </p>

        <div className="mt-9 border-y border-[#E7E2DA] py-7">
          <label className="block text-sm font-medium">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              className="mt-3 w-full rounded-lg border border-[#E7E2DA] bg-[#FFFDF9] px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium mt-4">
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              className="mt-3 w-full rounded-lg border border-[#E7E2DA] bg-[#FFFDF9] px-3 py-2.5"
            />
          </label>

          <button
            className="btn btn-primary mt-6"
            onClick={submit}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          {error && <p className="mt-3 text-sm text-[#B91C1C]">{error}</p>}
          <div className="mt-6 text-sm text-[#6B7280]">
            <span>Don&apos;t have an account?</span>
            <button
              type="button"
              className="ml-2 underline text-[#4F46E5]"
              onClick={() => router.push('/signup')}
            >
              Create account
            </button>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
