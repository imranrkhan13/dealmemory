"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AppShell } from '@/components/app-shell';

export default function Login() {
	const [email, setEmail] = useState('demo@dealmemory.local');
	const [password, setPassword] = useState('demo1234');
	const [error, setError] = useState('');
	const router = useRouter();

	const submit = async () => {
		setError('');
		const res: any = await signIn('credentials', { redirect: false, email, password });
		if (res?.error) return setError(res.error);
		router.push('/overview');
	};

	return (
		<AppShell>
			<main className="mx-auto max-w-2xl px-5 py-16">
				<p className="text-sm font-semibold text-[#4F46E5]">Sign in</p>
				<h1 className="landing-display mt-3 text-5xl">Sign in to your account.</h1>
				<p className="mt-4 text-sm leading-7 text-[#6B7280]">Use your founder credentials to manage projects and billing.</p>

				<div className="mt-9 border-y border-[#E7E2DA] py-7">
					<label className="block text-sm font-medium">Email
						<input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-3 w-full rounded-lg border border-[#E7E2DA] bg-[#FFFDF9] px-3 py-2.5" />
					</label>
					<label className="block text-sm font-medium mt-4">Password
						<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-3 w-full rounded-lg border border-[#E7E2DA] bg-[#FFFDF9] px-3 py-2.5" />
					</label>

					<button className="btn btn-primary mt-6" onClick={submit}>Sign in</button>
					{error && <p className="mt-3 text-sm text-[#B91C1C]">{error}</p>}
				</div>
			</main>
		</AppShell>
	);
}
