'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { AuthShell, AuthField, AuthButton } from '@/components/auth-shell';
import { Loader2, AlertCircle } from 'lucide-react';

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
    <AuthShell
      title="Create your workspace"
      subtitle="Start tracking intent, setup friction, and activation in under three minutes."
    >
      <form onSubmit={create} className="space-y-4">
        <AuthField
          label="Work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          required
          placeholder="founder@company.com"
        />
        <AuthField
          label="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="Alex Morgan"
        />
        <AuthField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="Minimum 8 characters"
        />

        {isSignInError ? (
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-400/25 bg-amber-400/10 p-3 text-[12px] text-amber-200">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="leading-relaxed">
              Could not sign you in. If you already have an account,{' '}
              <Link href="/auth/signin" className="font-medium underline underline-offset-2">
                sign in instead
              </Link>
              .
            </span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-400/25 bg-red-400/10 p-3 text-[12px] text-red-200">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        ) : null}

        <AuthButton type="submit" disabled={busy} aria-busy={busy}>
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating workspace…
            </>
          ) : (
            'Create workspace'
          )}
        </AuthButton>
      </form>

      <p className="mt-6 border-t border-white/10 pt-5 text-center text-[12px] text-white/45">
        Already have an account?{' '}
        <Link href="/auth/signin" className="font-medium text-[#8ab4ff] hover:text-white">
          Sign in
        </Link>
      </p>
      <p className="mt-8 text-center text-[11px] leading-relaxed text-white/30">
        By continuing, you agree to our Terms and Privacy Policy.
      </p>
    </AuthShell>
  );
}
