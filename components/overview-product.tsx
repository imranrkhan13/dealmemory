'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    Activity,
    AlertTriangle,
    DollarSign,
    Link2,
    TrendingUp,
    Users,
    CheckCircle2,
    Copy,
} from 'lucide-react';

import MetricCard from './dashboard/metric-card';
import CopilotSummary from './dashboard/copilot-summary';
import ActivationFunnel from './dashboard/activation-funnel';
import UsersAttention from './dashboard/users-attention';
import LiveActivity from './dashboard/live-activity';

type Journey = {
    userId: string;
    state: string;
    blocker?: string;
    recommendation: string;
    inactiveHours: number;
    goal?: string;
    events: any[];
};

export default function OverviewProduct() {
    const [project, setProject] = useState<any>(null);
    const [dashboard, setDashboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const selected = JSON.parse(
            localStorage.getItem('activation-memory-project') ?? 'null'
        );

        setProject(selected);

        if (!selected) {
            setLoading(false);
            return;
        }

        fetch(`/api/v1/journeys?projectKey=${selected.testKey}`)
            .then((r) => r.json())
            .then(setDashboard)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Memoize all complex data calculations to optimize render performance
    const processedData = useMemo(() => {
        const journeys: Journey[] = dashboard?.journeys ?? [];
        const events = journeys.flatMap((j) => j.events);

        const stuckUsers = journeys.filter((j) => j.state === 'stuck');
        const activatedUsers = journeys.filter((j) => j.state === 'activated');
        const checkoutUsers = journeys.filter((j) => j.state === 'checkout_started');
        const paidUsers = journeys.filter((j) => j.state === 'paid');

        const connectedUsers = journeys.filter((j) =>
            j.events.some((e: any) =>
                e.name === 'repository_connected' || e.name === 'integration_connected'
            )
        );

        const total = journeys.length;
        const activationRate = total ? Math.round((activatedUsers.length / total) * 100) : 0;
        const recoveryRate = total ? Math.round(((activatedUsers.length + paidUsers.length) / total) * 100) : 0;
        const revenueOpportunity = stuckUsers.length * 49;
        const topBlocker = stuckUsers[0]?.blocker ?? 'No blocker detected';

        const attentionUsers = journeys.map((j) => ({
            id: j.userId,
            name: j.userId.replace('user_', ''),
            goal: j.goal ?? 'Complete activation',
            state: j.state,
            blocker: j.blocker,
            inactiveHours: j.inactiveHours ?? 0,
            recommendation: j.recommendation,
        }));

        const liveEvents = [...events]
            .sort((a: any, b: any) => b.occurredAt.localeCompare(a.occurredAt))
            .slice(0, 10)
            .map((e: any) => ({
                id: e.id,
                name: e.name,
                user: e.userId ?? e.anonymousId,
                time: new Date(e.occurredAt).toLocaleString(),
            }));

        return {
            journeys,
            events,
            stuckUsers,
            activatedUsers,
            checkoutUsers,
            paidUsers,
            connectedUsers,
            activationRate,
            recoveryRate,
            revenueOpportunity,
            topBlocker,
            attentionUsers,
            liveEvents
        };
    }, [dashboard]);

    const handleCopyKey = () => {
        if (!project?.testKey) return;
        navigator.clipboard.writeText(project.testKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!project) return null;

    if (loading) {
        return (
            <main className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 w-64 rounded-xl bg-gray-200" />
                    <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-32 rounded-2xl bg-gray-200" />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    const {
        journeys,
        events,
        stuckUsers,
        activatedUsers,
        checkoutUsers,
        paidUsers,
        connectedUsers,
        activationRate,
        recoveryRate,
        revenueOpportunity,
        topBlocker,
        attentionUsers,
        liveEvents
    } = processedData;

    // Empty state view
    if (!events.length) {
        return (
            <main className="mx-auto max-w-4xl px-4 sm:px-6 py-20 text-center sm:text-left">
                <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
                    {project.name}
                </p>
                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                    No activation events yet
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-gray-500 leading-relaxed">
                    Install the SDK and send your first activation event.  Dealmemory will
                    automatically build journeys, identify blockers, and recommend the next best action.
                </p>
                <div className="mt-8 flex flex-wrap gap-3 justify-center sm:justify-start">
                    <button
                        onClick={handleCopyKey}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                        <Copy size={15} />
                        {copied ? 'Copied!' : 'Copy Project Key'}
                    </button>
                    <Link
                        href="/sdk"
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
                    >
                        Install SDK
                        <ArrowRight size={15} />
                    </Link>
                    <Link
                        href="/settings"
                        className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                        Project Settings
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-10">
            {/* Header section */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                        {project.name}
                    </p>
                    <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                        Activation Overview
                    </h1>
                    <p className="mt-3 max-w-2xl text-gray-500 leading-relaxed">
                        Monitor activation pipelines, identify critical blockers, recover leaking trials, and boost overall conversion metrics.
                    </p>
                </div>

                <div className="self-start sm:self-auto rounded-2xl border border-green-100 bg-green-50/60 px-6 py-4 backdrop-blur-sm min-w-[160px]">
                    <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
                        Activation Health
                    </p>
                    <p className="mt-1 text-4xl font-black text-green-600">
                        92%
                    </p>
                    <p className="text-xs font-medium text-green-700 mt-0.5">
                        Excellent Status
                    </p>
                </div>
            </div>

            {/* Grid Metrics */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <MetricCard
                    title="Revenue Opportunity"
                    value={`$${revenueOpportunity}`}
                    subtitle="Recoverable MRR"
                    color="green"
                    icon={<DollarSign size={20} />}
                />
                <MetricCard
                    title="Activation Rate"
                    value={`${activationRate}%`}
                    subtitle="Reached activation"
                    color="indigo"
                    icon={<TrendingUp size={20} />}
                />
                <MetricCard
                    title="Trial Users"
                    value={journeys.length}
                    subtitle="Tracked users"
                    color="indigo"
                    icon={<Users size={20} />}
                />
                <MetricCard
                    title="Users At Risk"
                    value={stuckUsers.length}
                    subtitle="Need attention"
                    color="red"
                    icon={<AlertTriangle size={20} />}
                />
                <MetricCard
                    title="Connected"
                    value={connectedUsers.length}
                    subtitle="Integrations active"
                    color="amber"
                    icon={<Link2 size={20} />}
                />
                <MetricCard
                    title="Paid Users"
                    value={paidUsers.length}
                    subtitle="Converted accounts"
                    color="green"
                    icon={<CheckCircle2 size={20} />}
                />
            </div>

            {/* Component Views */}
            <CopilotSummary
                totalUsers={journeys.length}
                stuckUsers={stuckUsers.length}
                activationRate={activationRate}
                topBlocker={topBlocker}
            />

            <ActivationFunnel
                trial={journeys.length}
                connected={connectedUsers.length}
                activated={activatedUsers.length}
                checkout={checkoutUsers.length}
                paid={paidUsers.length}
            />

            {/* Layout Breakdown split */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main panel */}
                <div className="lg:col-span-2">
                    <UsersAttention users={attentionUsers} />
                </div>

                {/* Side Insights Panels */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                            AI Insights
                        </p>
                        <h2 className="mt-2 text-xl font-bold text-gray-900">
                            Biggest Opportunity
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-gray-500">
                            {stuckUsers.length} users are currently blocked at{' '}
                            <span className="font-semibold text-gray-900">{topBlocker}</span>.
                        </p>
                        <div className="mt-4 rounded-xl bg-indigo-50/70 p-4 border border-indigo-100/50">
                            <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide">
                                Recommended Action
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-indigo-950">
                                Detect the step anomalies contextually and drop native inline help triggers before they drop out.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                            Revenue Leakage
                        </p>
                        <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900">
                            ${revenueOpportunity.toLocaleString()}
                        </h2>
                        <p className="mt-2 text-xs text-gray-400">
                            Estimated recoverable value from current active blockers.
                        </p>
                        <div className="mt-5 space-y-2.5 text-sm">
                            <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                                <span className="text-gray-500">Activation Rate</span>
                                <span className="font-semibold text-gray-900">{activationRate}%</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                                <span className="text-gray-500">Recovery Rate</span>
                                <span className="font-semibold text-gray-900">{recoveryRate}%</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                                <span className="text-gray-500">At Risk Users</span>
                                <span className="font-semibold text-red-600">{stuckUsers.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white shadow-md">
                        <p className="text-xs font-semibold uppercase tracking-widest opacity-75">
                            DealMemory AI
                        </p>
                        <h2 className="mt-2 text-2xl font-bold">
                            Daily Summary
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-indigo-100">
                            Analyzed <span className="font-bold text-white">{journeys.length} trial pipelines</span>. The core performance choke-point centers on <span className="font-bold text-white">{topBlocker}</span>. Addressing this flow systematically positions up to <span className="font-bold text-white">${revenueOpportunity.toLocaleString()}</span> in direct recovery options.
                        </p>
                    </div>
                </div>
            </div>

            <LiveActivity events={liveEvents} />

            {/* Bottom Footer Callout */}
            <section className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                            Activation Engine Active
                        </p>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            Watching every milestone execution.
                        </h2>
                        <p className="max-w-3xl text-sm leading-relaxed text-gray-600">
                            Every single telemetry event adds context to consumer behavior. DealMemory weaves ongoing runtime interactions with foundational trial metadata to extract transparent dropout indicators before your users consider churn.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                        <Link
                            href="/journeys"
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
                        >
                            View All Journeys
                            <ArrowRight size={15} />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}