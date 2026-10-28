'use client';

import { useState } from 'react';
import Link from 'next/link';
import InstallationGuide from '@/components/installation-guide';
import {
  Terminal,
  Shield,
  ArrowRight,
  Zap,
  Server,
  Code2,
  KeyRound,
  Check,
  Copy,
  Layers,
  Database,
  Lock,
  Cpu,
} from 'lucide-react';

type DocTab = 'quickstart' | 'installation' | 'sdk' | 'api' | 'privacy';

export default function DocsHub() {
  const [activeTab, setActiveTab] = useState<DocTab>('quickstart');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      // clipboard fallback
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-sky-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow">
              <Terminal size={13} /> Developer Documentation
            </span>
            <span className="text-xs font-mono text-slate-400">DealMemory v1.0</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Integration &amp; Architecture Hub
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Everything you need to self-host DealMemory, configure your PostgreSQL database, and stream privacy-safe product activation telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/settings"
            className="btn btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5"
          >
            <KeyRound size={13} />
            API Keys
          </Link>
          <Link
            href="/overview"
            className="btn btn-primary text-xs py-2 px-3 inline-flex items-center gap-1.5"
          >
            <Cpu size={13} />
            Console <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-px scrollbar-none">
        {[
          { id: 'quickstart', label: 'Quickstart', icon: Zap },
          { id: 'installation', label: 'Self-Hosting & Install', icon: Server },
          { id: 'sdk', label: 'Client SDKs (TS / Python)', icon: Code2 },
          { id: 'api', label: 'REST API Reference', icon: Layers },
          { id: 'privacy', label: 'Privacy & Redaction', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DocTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-sky-600 text-sky-700 font-semibold bg-sky-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-sky-600' : 'text-slate-400'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: QUICKSTART */}
      {activeTab === 'quickstart' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <InstallationGuide
            creatingKey={false}
            onCreatePublicKey={() => {
              location.href = '/settings';
            }}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                n: '01',
                icon: Terminal,
                title: 'Emit Product Milestones',
                body: 'Call track() for key actions like trial_started, goal_set, repository_connected, and first_value_reached with stable identifiers.',
              },
              {
                n: '02',
                icon: Shield,
                title: 'Privacy-Safe Redaction',
                body: 'Edge credential scanners automatically sanitize sensitive values (passwords, JWTs, bearer tokens) before storage. URL queries are stripped.',
              },
              {
                n: '03',
                icon: Zap,
                title: 'Autonomous Synthesis',
                body: 'DealMemory reconstructs canonical user journeys, calculates time-to-value, and pinpoints where users stall during setup.',
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <section
                  key={step.n}
                  className="relative overflow-hidden rounded-2xl border border-sky-100 bg-white p-6 shadow-sm hover:border-sky-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-600">{step.n}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200 shadow-xs">
                      <Icon size={15} />
                    </div>
                  </div>
                  <h2 className="mt-4 font-bold text-base text-slate-900">{step.title}</h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.body}</p>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SELF-HOSTING & INSTALLATION */}
      {activeTab === 'installation' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-sky-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="eyebrow">
                <Database size={13} /> Step-by-Step Setup
              </span>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                How to Install &amp; Run DealMemory
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                DealMemory runs as a standalone Next.js application with a PostgreSQL database. Follow the steps below to run it locally or deploy on your own servers.
              </p>
            </div>

            {/* Step 1: Requirements */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold font-mono">1</span>
                <h3 className="font-bold text-slate-900 text-sm">System Requirements</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-800">Node.js Runtime</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Version 18.18+ or 20.x LTS</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-800">PostgreSQL Database</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">PostgreSQL 14, 15, or 16</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-800">Package Manager</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">npm, pnpm, or yarn</p>
                </div>
              </div>
            </div>

            {/* Step 2: Clone & Install */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold font-mono">2</span>
                  <h3 className="font-bold text-slate-900 text-sm">Clone &amp; Install Dependencies</h3>
                </div>
                <button
                  onClick={() => copyToClipboard('git clone https://github.com/your-org/dealmemory.git\ncd dealmemory\nnpm install', 'step2')}
                  className="text-xs font-medium text-slate-500 hover:text-sky-600 inline-flex items-center gap-1"
                >
                  {copiedSection === 'step2' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copiedSection === 'step2' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
{`git clone https://github.com/your-org/dealmemory.git
cd dealmemory
npm install`}
              </pre>
            </div>

            {/* Step 3: Environment Configuration */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold font-mono">3</span>
                  <h3 className="font-bold text-slate-900 text-sm">Configure Environment Variables</h3>
                </div>
                <button
                  onClick={() => copyToClipboard('cp .env.example .env\nopenssl rand -hex 32', 'step3')}
                  className="text-xs font-medium text-slate-500 hover:text-sky-600 inline-flex items-center gap-1"
                >
                  {copiedSection === 'step3' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copiedSection === 'step3' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-slate-600">
                Copy the template and set a 32-byte hexadecimal secret for NextAuth:
              </p>
              <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
{`cp .env.example .env
openssl rand -hex 32`}
              </pre>
            </div>

            {/* Step 4: Database Schema Init */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold font-mono">4</span>
                  <h3 className="font-bold text-slate-900 text-sm">Initialize Database &amp; Prisma</h3>
                </div>
                <button
                  onClick={() => copyToClipboard('npx prisma db push', 'step4')}
                  className="text-xs font-medium text-slate-500 hover:text-sky-600 inline-flex items-center gap-1"
                >
                  {copiedSection === 'step4' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copiedSection === 'step4' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
{`# Synchronize Prisma schema with PostgreSQL
npx prisma db push`}
              </pre>
            </div>

            {/* Step 5: Start Server */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold font-mono">5</span>
                  <h3 className="font-bold text-slate-900 text-sm">Start Development Server</h3>
                </div>
                <button
                  onClick={() => copyToClipboard('npm run dev', 'step5')}
                  className="text-xs font-medium text-slate-500 hover:text-sky-600 inline-flex items-center gap-1"
                >
                  {copiedSection === 'step5' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copiedSection === 'step5' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
{`npm run dev
# DealMemory runs at http://localhost:3000`}
              </pre>
            </div>
          </div>

          {/* Docker Section */}
          <div className="rounded-2xl border border-sky-100 bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Quick PostgreSQL with Docker</h3>
                <p className="text-xs text-slate-600 mt-0.5">Need a local PostgreSQL database instantly? Run this single command:</p>
              </div>
              <button
                onClick={() => copyToClipboard('docker run --name dealmemory-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dealmemory -p 5432:5432 -d postgres:16-alpine', 'docker')}
                className="text-xs font-medium text-slate-500 hover:text-sky-600 inline-flex items-center gap-1"
              >
                {copiedSection === 'docker' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copiedSection === 'docker' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
{`docker run --name dealmemory-postgres \\
  -e POSTGRES_USER=postgres \\
  -e POSTGRES_PASSWORD=postgres \\
  -e POSTGRES_DB=dealmemory \\
  -p 5432:5432 \\
  -d postgres:16-alpine`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: CLIENT SDKS */}
      {activeTab === 'sdk' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* TypeScript SDK */}
          <div className="rounded-2xl border border-sky-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="eyebrow">
                  <Code2 size={13} /> Browser &amp; Node.js
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900">TypeScript / JavaScript SDK</h2>
                <p className="mt-1 text-xs text-slate-600">
                  Importable into React, Next.js, Vue, Svelte, or Node.js services with offline queueing and privacy controls.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(`import { DealMemory } from '@dealmemory/sdk';

const dm = new DealMemory({
  projectKey: 'pk_live_your_key',
  apiUrl: 'http://localhost:3000/api',
  flushIntervalMs: 5000,
  autoCapture: true
});

// Identify user
dm.identify('user_123', { plan: 'trial' });

// Milestone tracking
dm.trialStarted();
dm.setGoal('connect_git_repo');
dm.integrationConnected({ provider: 'github' });
dm.firstValueReached();`, 'ts-sdk')}
                className="btn btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1"
              >
                {copiedSection === 'ts-sdk' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copiedSection === 'ts-sdk' ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
{`import { DealMemory } from '@dealmemory/sdk';

const dm = new DealMemory({
  projectKey: 'pk_live_your_key',
  apiUrl: 'http://localhost:3000/api',
  flushIntervalMs: 5000,
  autoCapture: true
});

// Identify authenticated user
dm.identify('user_123', { plan: 'trial' });

// Standard activation milestones
dm.trialStarted();
dm.setGoal('connect_git_repo');
dm.integrationConnected({ provider: 'github' });
dm.firstValueReached();`}
            </pre>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-900">Key Client Methods:</h4>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <code className="text-sky-700 font-bold">dm.identify(userId, traits)</code>
                  <p className="text-slate-600 mt-1">Associates future events with a stable user ID.</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <code className="text-sky-700 font-bold">dm.track(name, properties)</code>
                  <p className="text-slate-600 mt-1">Records an explicit product milestone event.</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <code className="text-sky-700 font-bold">dm.setGoal(goalName)</code>
                  <p className="text-slate-600 mt-1">Declares onboarding goals for journey tracking.</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <code className="text-sky-700 font-bold">dm.reset()</code>
                  <p className="text-slate-600 mt-1">Clears local user context on sign-out.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Python SDK */}
          <div className="rounded-2xl border border-sky-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="eyebrow">
                  <Code2 size={13} /> Backend &amp; Workers
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900">Python SDK</h2>
                <p className="mt-1 text-xs text-slate-600">
                  Synchronous, zero-dependency client for FastAPI, Django, Flask, Celery, and agent pipelines.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(`from agentlens import DealMemory

dm = DealMemory(
    project_key="pk_live_your_key",
    api_url="http://localhost:3000/api",
    timeout=5.0
)

dm.identify("user_123")
dm.track("report_exported", {"format": "pdf", "rows": 1200})`, 'py-sdk')}
                className="btn btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1"
              >
                {copiedSection === 'py-sdk' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copiedSection === 'py-sdk' ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
{`from agentlens import DealMemory

dm = DealMemory(
    project_key="pk_live_your_key",
    api_url="http://localhost:3000/api",
    timeout=5.0
)

# Identify user
dm.identify("user_123")

# Track server-side milestone
dm.track("report_exported", {"format": "pdf", "rows": 1200})`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: REST API */}
      {activeTab === 'api' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-sky-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="eyebrow">
                <Layers size={13} /> HTTP Endpoints
              </span>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">REST API Specifications</h2>
              <p className="mt-1 text-xs text-slate-600">
                Emit telemetry batches and check ingestion health via standard HTTP requests.
              </p>
            </div>

            {/* Ingestion Batch */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">POST</span>
                <code className="text-sm font-bold text-slate-900">/api/v1/events/batch</code>
              </div>
              <p className="text-xs text-slate-600">
                Ingests an array of up to 100 events in an atomic transaction with deduplication.
              </p>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold text-slate-700">Headers:</p>
                <pre className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-slate-200">
{`Content-Type: application/json
x-project-key: pk_live_your_project_key`}
                </pre>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold text-slate-700">Response Status Codes:</p>
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40">
                    <span className="font-bold text-emerald-700">200 OK</span>
                    <p className="text-slate-600 mt-0.5">Events accepted and persisted to Postgres.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/40">
                    <span className="font-bold text-amber-700">409 Conflict</span>
                    <p className="text-slate-600 mt-0.5">Duplicate event IDs resolved idempotently.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/40">
                    <span className="font-bold text-rose-700">400 Bad Request</span>
                    <p className="text-slate-600 mt-0.5">Payload validation or credential leak rejected.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/40">
                    <span className="font-bold text-rose-700">401 Unauthorized</span>
                    <p className="text-slate-600 mt-0.5">Invalid or missing project key.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Endpoint */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 text-xs font-bold font-mono">GET</span>
                <code className="text-sm font-bold text-slate-900">/api/v1/integration-status</code>
              </div>
              <p className="text-xs text-slate-600">
                Returns workspace ingestion status, event count, and connector states.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRIVACY & REDACTION */}
      {activeTab === 'privacy' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-sky-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="eyebrow">
                <Shield size={13} /> Zero-Trust Telemetry
              </span>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Edge Privacy &amp; Credential Scanning</h2>
              <p className="mt-1 text-xs text-slate-600">
                DealMemory is architected so that sensitive customer data never enters your database or third-party loggers.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Automatic Redaction Filters</h3>
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock size={13} className="text-sky-600" />
                    Blocked Credential Patterns
                  </p>
                  <p className="text-slate-600">
                    Regex scanners match and strip API keys (<code className="text-sky-700">pk_live_</code>, <code className="text-sky-700">sk_live_</code>), JWT tokens, Bearer headers, and PEM private keys.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock size={13} className="text-sky-600" />
                    Blocked Property Keys
                  </p>
                  <p className="text-slate-600">
                    Keys containing <code className="text-sky-700">password</code>, <code className="text-sky-700">token</code>, <code className="text-sky-700">secret</code>, <code className="text-sky-700">message</code>, or <code className="text-sky-700">value</code> are filtered out.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock size={13} className="text-sky-600" />
                    URL Query Sanitization
                  </p>
                  <p className="text-slate-600">
                    Query strings (<code className="text-sky-700">?token=xyz&amp;auth=123</code>) and hash anchors are automatically stripped before sending.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50/80 via-white to-blue-50/60 p-6 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Explore the Complete Markdown Guides</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Detailed markdown manuals are also available directly in the repository at <code className="text-sky-700">docs/</code>.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/settings" className="btn btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2">
            Generate Project Key <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
