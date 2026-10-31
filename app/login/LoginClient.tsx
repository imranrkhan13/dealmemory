'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { AuthShell, AuthField, AuthButton } from '@/components/auth-shell';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';

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
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see what your users did — and exactly where they stopped."
    >
      <form onSubmit={submit} className="space-y-4">
        <AuthField
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          autoFocus
          required
          placeholder="founder@company.com"
        />
        <AuthField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••••••"
        />

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-400/25 bg-red-400/10 p-3 text-[12px] text-red-200">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <AuthButton type="submit" disabled={loading} aria-busy={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight size={15} />
            </>
          )}
        </AuthButton>
      </form>

      <p className="mt-6 border-t border-white/10 pt-5 text-center text-[12.5px] text-white/50">
        New to DealMemory?{' '}
        <Link href="/signup" className="font-medium text-[#8ab4ff] hover:text-white">
          Create a free workspace
        </Link>
      </p>
      <p className="mt-5 text-center text-[11px] leading-relaxed text-white/30">
        By continuing, you agree to our Terms and Privacy Policy.
      </p>
    </AuthShell>
  );
}
