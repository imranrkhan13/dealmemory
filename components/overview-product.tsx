'use client';

import { useEffect, useMemo, useState } from 'react';
import AIInsights from "./dashboard/ai-insights";
import { analyzeOrganization } from '@/lib/organization-intelligence';
import Link from 'next/link';
import {
  ArrowRight,
  AlertTriangle,
  DollarSign,
  Link2,
  TrendingUp,
  Users,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
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

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        const projectsRes = await fetch('/api/projects', { cache: 'no-store' });
        const projectsData = await projectsRes.json();
        const first = Array.isArray(projectsData?.projects) ? projectsData.projects[0] : null;
        setProject(first ?? null);

        if (!first?.id) {
          setDashboard({ journeys: [] });
          return;
        }

        const journeysRes = await fetch(`/api/v1/journeys?projectId=${encodeURIComponent(first.id)}`, { cache: 'no-store' });
        const journeysData = await journeysRes.json();
        if (!journeysRes.ok) throw new Error(journeysData?.error ?? 'Could not load journeys');
        setDashboard({ journeys: Array.isArray(journeysData?.journeys) ? journeysData.journeys : [] });
      } catch (e) {
        setProject(null);
        setDashboard({ journeys: [] });
      } finally {
        setLoading(false);
      }
    }
    init().catch(console.error);
  }, []);

  const processedData = useMemo(() => {
    const journeys: Journey[] = dashboard?.journeys ?? [];
    const events = journeys.flatMap((j) => j.events);

    const stuckUsers = journeys.filter((j) => j.state === 'stuck');
    const activatedUsers = journeys.filter((j) => ['activated', 'checkout_started', 'paid'].includes(j.state));
    const checkoutUsers = journeys.filter((j) => ['checkout_started', 'paid'].includes(j.state));
    const paidUsers = journeys.filter((j) => j.state === 'paid');

    const connectedUsers = journeys.filter((j) =>
      j.events.some((e: any) =>
        e.name === 'repository_connected' || e.name === 'integration_connected'
      )
    );

    const total = journeys.length;
    const activationRate = total ? Math.round((activatedUsers.length / total) * 100) : 0;
    const recoveryRate = total ? Math.round((activatedUsers.length / total) * 100) : 0;
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
        time: new Date(e.occurredAt).toLocaleTimeString(),
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
      liveEvents,
    };
  }, [dashboard]);

  const {
    journeys,
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
    liveEvents,
  } = processedData;

  const organizationInsights = useMemo(() => {
    return analyzeOrganization(journeys);
  }, [journeys]);

  const productHealth = useMemo(() => {
    let score = 100;
    if (journeys.length > 0) {
      const dropRate = (stuckUsers.length / journeys.length) * 100;
      score = Math.max(20, Math.round(100 - dropRate * 0.7));
    }
    return score;
  }, [journeys, stuckUsers]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white px-5 py-3 shadow-md">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <span className="text-xs font-medium text-slate-600">Loading activation engine…</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600 shadow-sm">
          <Sparkles size={22} />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-sky-700 font-mono">Memory Engine</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">No active project connected</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Connect your product with the lightweight SDK snippet. DealMemory will automatically synthesize user intent, friction, and activation milestones.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/sdk" className="btn btn-primary">
            Connect your app <ArrowRight size={14} />
          </Link>
          <Link href="/demo" className="btn">
            Explore sample demo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Health Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 shadow-xs">
              <Sparkles size={11} /> {project.name}
            </span>
            <span className="text-xs text-slate-400 font-mono">live telemetry</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Activation Overview
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Synthesize user behavior, pinpoint critical friction points, and recover stalled trials before asking them to pay.
          </p>
        </div>

        {/* Health score badge card */}
        <div className="self-start sm:self-auto rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs min-w-[170px] relative overflow-hidden group">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-800 font-mono">
            Activation Health
          </p>
          <p className="mt-1 text-4xl font-extrabold text-slate-900 tabular-nums tracking-tight">
            {productHealth}%
          </p>
          <p className="text-xs font-medium text-emerald-700 mt-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {productHealth > 80 ? "Optimal Flow" : productHealth > 60 ? "Healthy" : "Friction Detected"}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Revenue Recovery"
          value={`$${revenueOpportunity}`}
          subtitle="Recoverable MRR"
          color="green"
          icon={<DollarSign size={18} />}
        />
        <MetricCard
          title="Activation Rate"
          value={`${activationRate}%`}
          subtitle="Reached first value"
          color="indigo"
          icon={<TrendingUp size={18} />}
        />
        <MetricCard
          title="Total Trials"
          value={journeys.length}
          subtitle="Tracked users"
          color="indigo"
          icon={<Users size={18} />}
        />
        <MetricCard
          title="Users At Risk"
          value={stuckUsers.length}
          subtitle="Need reconnection"
          color="red"
          icon={<AlertTriangle size={18} />}
        />
        <MetricCard
          title="Integrations"
          value={connectedUsers.length}
          subtitle="Active setups"
          color="amber"
          icon={<Link2 size={18} />}
        />
        <MetricCard
          title="Paid Accounts"
          value={paidUsers.length}
          subtitle="Converted to pro"
          color="green"
          icon={<CheckCircle2 size={18} />}
        />
      </div>

      {/* Copilot Summary */}
      <CopilotSummary
        totalUsers={journeys.length}
        stuckUsers={stuckUsers.length}
        activationRate={activationRate}
        topBlocker={topBlocker}
      />

      {/* Visual Funnel */}
      <ActivationFunnel
        trial={journeys.length}
        connected={connectedUsers.length}
        activated={activatedUsers.length}
        checkout={checkoutUsers.length}
        paid={paidUsers.length}
      />

      {/* Two Column Layout: Users Attention & Intelligence Panels */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UsersAttention users={attentionUsers} />
        </div>

        <div className="space-y-6">
          <AIInsights insights={organizationInsights} />

          {/* Revenue Leakage card */}
          <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 font-mono">
                Revenue Leakage
              </p>
              <span className="text-[10px] font-mono text-slate-400">Monthly Projection</span>
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
              ${revenueOpportunity.toLocaleString()}
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Estimated recoverable MRR from trials currently stalled by integration or setup blockers.
            </p>
            <div className="mt-5 space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                <span className="text-slate-600">Activation Conversion</span>
                <span className="font-semibold text-slate-900">{activationRate}%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                <span className="text-slate-600">Recovery Conversion</span>
                <span className="font-semibold text-slate-900">{recoveryRate}%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                <span className="text-slate-600">Blocked Trial Users</span>
                <span className="font-semibold text-rose-600">{stuckUsers.length} users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Event Stream */}
      <LiveActivity events={liveEvents} />

      {/* Bottom Mission Card */}
      <section className="relative overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-50/80 via-white to-blue-50/60 p-7 sm:p-9 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <span className="eyebrow">
              <ShieldCheck size={13} /> Continuous Activation Engine
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Never ask users to pay before they succeed.
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
              DealMemory preserves the user&apos;s goal, recognizes exact setup friction, and surfaces guidance so every customer reaches their first milestone with confidence.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/journeys" className="btn btn-primary">
              Explore All Journeys <ArrowRight size={14} />
            </Link>
            <Link href="/sdk" className="btn">
              View SDK Docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
