"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from '@/components/app-shell';

export default function Signup() {
	const [email, setEmail] = useState('demo@dealmemory.local');
	const [name, setName] = useState('Demo Founder');
	const [password, setPassword] = useState('demo1234');
	const [error, setError] = useState('');
	const router = useRouter();

	const create = async () => {
		setError('');
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
			router.push('/login');
		} catch (e) {
			setError((e as Error).message);
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
						<input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-3 w-full rounded-lg border border-[#E7E2DA] bg-[#FFFDF9] px-3 py-2.5" />
					</label>
					<label className="block text-sm font-medium mt-4">Name
						<input value={name} onChange={(e) => setName(e.target.value)} className="mt-3 w-full rounded-lg border border-[#E7E2DA] bg-[#FFFDF9] px-3 py-2.5" />
					</label>
					<label className="block text-sm font-medium mt-4">Password
						<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-3 w-full rounded-lg border border-[#E7E2DA] bg-[#FFFDF9] px-3 py-2.5" />
					</label>

					<button className="btn btn-primary mt-6" onClick={create}>Create account</button>
					{error && <p className="mt-3 text-sm text-[#B91C1C]">{error}</p>}
				</div>
			</main>
		</AppShell>
	);
}
