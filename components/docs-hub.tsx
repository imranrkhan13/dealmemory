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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow">Developer documentation</span>
            <span className="font-mono text-[10px] text-ink-faint">v1.0</span>
          </div>
          <h1 className="mt-2 text-[28px] font-medium leading-tight tracking-[-0.025em] text-ink">
            Integration &amp; architecture
          </h1>
          <p className="mt-1 max-w-2xl text-[13px] text-ink-soft">
            Self-host DealMemory, configure PostgreSQL, and stream privacy-safe product activation telemetry.
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
      <div className="flex items-center gap-1 overflow-x-auto border-b border-line pb-px scrollbar-none">
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
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[12.5px] transition-colors ${
                isActive
                  ? 'border-ink font-medium text-ink'
                  : 'border-transparent text-ink-soft hover:border-line-strong hover:text-ink'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-ink' : 'text-ink-faint'} />
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
                  className="rounded-card border border-line bg-white p-5 transition-colors hover:border-line-strong"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-ink-faint">{step.n}</span>
                    <Icon size={14} className="text-ink-faint" />
                  </div>
                  <h2 className="mt-4 text-[14px] font-medium text-ink">{step.title}</h2>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">{step.body}</p>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SELF-HOSTING & INSTALLATION */}
      {activeTab === 'installation' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="rounded-card border border-line bg-white p-6 sm:p-8  space-y-6">
            <div>
              <span className="eyebrow">Setup</span>
              <h2 className="mt-2 text-[20px] font-medium tracking-[-0.02em] text-ink">
                How to install and run DealMemory
              </h2>
              <p className="mt-1 text-[12.5px] text-ink-soft">
                DealMemory runs as a standalone Next.js application with a PostgreSQL database. Follow the steps below to run it locally or deploy on your own servers.
              </p>
            </div>

            {/* Step 1: Requirements */}
            <div className="border-t border-line pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-[5px] border border-line font-mono text-[10px] text-ink-soft">1</span>
                <h3 className="font-medium text-[13px] text-ink">System requirements</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="p-3.5 rounded-lg border border-line bg-paper">
                  <p className="font-medium text-[12px] text-ink">Node.js Runtime</p>
                  <p className="text-[11px] text-ink-soft mt-0.5">Version 18.18+ or 20.x LTS</p>
                </div>
                <div className="p-3.5 rounded-lg border border-line bg-paper">
                  <p className="font-medium text-[12px] text-ink">PostgreSQL database</p>
                  <p className="text-[11px] text-ink-soft mt-0.5">PostgreSQL 14, 15, or 16</p>
                </div>
                <div className="p-3.5 rounded-lg border border-line bg-paper">
                  <p className="font-medium text-[12px] text-ink">Package Manager</p>
                  <p className="text-[11px] text-ink-soft mt-0.5">npm, pnpm, or yarn</p>
                </div>
              </div>
            </div>

            {/* Step 2: Clone & Install */}
            <div className="border-t border-line pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-[5px] border border-line text-ink-soft text-[10px] font-mono">2</span>
                  <h3 className="font-medium text-[13px] text-ink">Clone &amp; install dependencies</h3>
                </div>
                <button
                  onClick={() => copyToClipboard('git clone https://github.com/your-org/dealmemory.git\ncd dealmemory\nnpm install', 'step2')}
                  className="text-xs font-medium text-ink-soft hover:text-accent inline-flex items-center gap-1"
                >
                  {copiedSection === 'step2' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  {copiedSection === 'step2' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="rounded-lg bg-ink p-4 font-mono text-[11.5px] leading-relaxed text-[#cfd6df] overflow-x-auto">
{`git clone https://github.com/your-org/dealmemory.git
cd dealmemory
npm install`}
              </pre>
            </div>

            {/* Step 3: Environment Configuration */}
            <div className="border-t border-line pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-[5px] border border-line text-ink-soft text-[10px] font-mono">3</span>
                  <h3 className="font-medium text-[13px] text-ink">Configure environment variables</h3>
                </div>
                <button
                  onClick={() => copyToClipboard('cp .env.example .env\nopenssl rand -hex 32', 'step3')}
                  className="text-xs font-medium text-ink-soft hover:text-accent inline-flex items-center gap-1"
                >
                  {copiedSection === 'step3' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  {copiedSection === 'step3' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-ink-soft">
                Copy the template and set a 32-byte hexadecimal secret for NextAuth:
              </p>
              <pre className="rounded-lg bg-ink p-4 font-mono text-[11.5px] leading-relaxed text-[#cfd6df] overflow-x-auto">
{`cp .env.example .env
openssl rand -hex 32`}
              </pre>
            </div>

            {/* Step 4: Database Schema Init */}
            <div className="border-t border-line pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-[5px] border border-line text-ink-soft text-[10px] font-mono">4</span>
                  <h3 className="font-medium text-[13px] text-ink">Initialize database &amp; Prisma</h3>
                </div>
                <button
                  onClick={() => copyToClipboard('npx prisma db push', 'step4')}
                  className="text-xs font-medium text-ink-soft hover:text-accent inline-flex items-center gap-1"
                >
                  {copiedSection === 'step4' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  {copiedSection === 'step4' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="rounded-lg bg-ink p-4 font-mono text-[11.5px] leading-relaxed text-[#cfd6df] overflow-x-auto">
{`# Synchronize Prisma schema with PostgreSQL
npx prisma db push`}
              </pre>
            </div>

            {/* Step 5: Start Server */}
            <div className="border-t border-line pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-[5px] border border-line text-ink-soft text-[10px] font-mono">5</span>
                  <h3 className="font-medium text-[13px] text-ink">Start development server</h3>
                </div>
                <button
                  onClick={() => copyToClipboard('npm run dev', 'step5')}
                  className="text-xs font-medium text-ink-soft hover:text-accent inline-flex items-center gap-1"
                >
                  {copiedSection === 'step5' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  {copiedSection === 'step5' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="rounded-lg bg-ink p-4 font-mono text-[11.5px] leading-relaxed text-[#cfd6df] overflow-x-auto">
{`npm run dev
# DealMemory runs at http://localhost:3000`}
              </pre>
            </div>
          </div>

          {/* Docker Section */}
          <div className="rounded-card border border-line bg-white p-6 sm:p-8  space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[14px] text-ink">Quick PostgreSQL with Docker</h3>
                <p className="text-xs text-ink-soft mt-0.5">Need a local PostgreSQL database instantly? Run this single command:</p>
              </div>
              <button
                onClick={() => copyToClipboard('docker run --name dealmemory-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dealmemory -p 5432:5432 -d postgres:16-alpine', 'docker')}
                className="text-xs font-medium text-ink-soft hover:text-accent inline-flex items-center gap-1"
              >
                {copiedSection === 'docker' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                {copiedSection === 'docker' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="rounded-lg bg-ink p-4 font-mono text-[11.5px] leading-relaxed text-[#cfd6df] overflow-x-auto">
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
          <div className="rounded-card border border-line bg-white p-6 sm:p-8  space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="eyebrow">
                  <Code2 size={13} /> Browser &amp; Node.js
                </span>
                <h2 className="mt-2 text-[20px] font-medium text-ink">TypeScript / JavaScript SDK</h2>
                <p className="mt-1 text-xs text-ink-soft">
                  Importable into React, Next.js, Vue, Svelte, or Node.js services with offline queueing and privacy controls.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(`import { DealMemory } from 'dealmemory';

// key + endpoint come from DEALMEMORY_KEY in .env
const dm = new DealMemory();

// Identify user
dm.identify('user_123', { plan: 'trial' });

// Milestone tracking
dm.trialStarted();
dm.setGoal('connect_git_repo');
dm.integrationConnected({ provider: 'github' });
dm.firstValueReached();`, 'ts-sdk')}
                className="btn btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1"
              >
                {copiedSection === 'ts-sdk' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                {copiedSection === 'ts-sdk' ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre className="rounded-lg bg-ink p-4 font-mono text-[11.5px] leading-relaxed text-[#cfd6df] overflow-x-auto">
{`import { DealMemory } from 'dealmemory';

// key + endpoint come from DEALMEMORY_KEY in .env
const dm = new DealMemory();

// Identify authenticated user
dm.identify('user_123', { plan: 'trial' });

// Standard activation milestones
dm.trialStarted();
dm.setGoal('connect_git_repo');
dm.integrationConnected({ provider: 'github' });
dm.firstValueReached();`}
            </pre>

            <div className="border-t border-line pt-4">
              <h4 className="font-medium text-[12px] text-ink">Key Client Methods:</h4>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
                <div className="p-3 rounded-lg border border-line bg-paper">
                  <code className="text-accent font-bold">dm.identify(userId, traits)</code>
                  <p className="text-ink-soft mt-1">Associates future events with a stable user ID.</p>
                </div>
                <div className="p-3 rounded-lg border border-line bg-paper">
                  <code className="text-accent font-bold">dm.track(name, properties)</code>
                  <p className="text-ink-soft mt-1">Records an explicit product milestone event.</p>
                </div>
                <div className="p-3 rounded-lg border border-line bg-paper">
                  <code className="text-accent font-bold">dm.setGoal(goalName)</code>
                  <p className="text-ink-soft mt-1">Declares onboarding goals for journey tracking.</p>
                </div>
                <div className="p-3 rounded-lg border border-line bg-paper">
                  <code className="text-accent font-bold">dm.reset()</code>
                  <p className="text-ink-soft mt-1">Clears local user context on sign-out.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Python SDK */}
          <div className="rounded-card border border-line bg-white p-6 sm:p-8  space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="eyebrow">
                  <Code2 size={13} /> Backend &amp; Workers
                </span>
                <h2 className="mt-2 text-[20px] font-medium text-ink">Python SDK</h2>
                <p className="mt-1 text-xs text-ink-soft">
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
                {copiedSection === 'py-sdk' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                {copiedSection === 'py-sdk' ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre className="rounded-lg bg-ink p-4 font-mono text-[11.5px] leading-relaxed text-[#cfd6df] overflow-x-auto">
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
          <div className="rounded-card border border-line bg-white p-6 sm:p-8  space-y-6">
            <div>
              <span className="eyebrow">
                <Layers size={13} /> HTTP Endpoints
              </span>
              <h2 className="mt-2 text-[22px] font-medium text-ink">REST API reference</h2>
              <p className="mt-1 text-xs text-ink-soft">
                Emit telemetry batches and check ingestion health via standard HTTP requests.
              </p>
            </div>

            {/* Ingestion Batch */}
            <div className="border-t border-line pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-success-tint text-success text-[10px] font-medium font-mono">POST</span>
                <code className="text-sm font-medium text-ink">/api/v1/events/batch</code>
              </div>
              <p className="text-xs text-ink-soft">
                Ingests an array of up to 100 events in an atomic transaction with deduplication.
              </p>

              <div className="mt-4 space-y-2">
                <p className="font-medium text-[12px] text-ink-soft">Headers:</p>
                <pre className="rounded-lg bg-ink p-3 font-mono text-[11px] leading-relaxed text-[#cfd6df]">
{`Content-Type: application/json
x-project-key: pk_live_your_project_key`}
                </pre>
              </div>

              <div className="mt-4 space-y-2">
                <p className="font-medium text-[12px] text-ink-soft">Response Status Codes:</p>
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  <div className="p-3 rounded-lg border border-success/40 bg-success-tint">
                    <span className="font-medium text-success">200 OK</span>
                    <p className="text-ink-soft mt-0.5">Events accepted and persisted to Postgres.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-warn/40 bg-warn-tint">
                    <span className="font-medium text-warn">409 Conflict</span>
                    <p className="text-ink-soft mt-0.5">Duplicate event IDs resolved idempotently.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-danger/40 bg-danger-tint">
                    <span className="font-medium text-danger">400 Bad Request</span>
                    <p className="text-ink-soft mt-0.5">Payload validation or credential leak rejected.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-danger/40 bg-danger-tint">
                    <span className="font-medium text-danger">401 Unauthorized</span>
                    <p className="text-ink-soft mt-0.5">Invalid or missing project key.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Endpoint */}
            <div className="border-t border-line pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-accent-tint text-accent text-[10px] font-medium font-mono">GET</span>
                <code className="text-sm font-medium text-ink">/api/v1/integration-status</code>
              </div>
              <p className="text-xs text-ink-soft">
                Returns workspace ingestion status, event count, and connector states.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRIVACY & REDACTION */}
      {activeTab === 'privacy' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="rounded-card border border-line bg-white p-6 sm:p-8  space-y-6">
            <div>
              <span className="eyebrow">
                <Shield size={13} /> Zero-Trust Telemetry
              </span>
              <h2 className="mt-2 text-[22px] font-medium text-ink">Edge privacy &amp; credential scanning</h2>
              <p className="mt-1 text-xs text-ink-soft">
                DealMemory is architected so that sensitive customer data never enters your database or third-party loggers.
              </p>
            </div>

            <div className="border-t border-line pt-6 space-y-4">
              <h3 className="text-sm font-medium text-ink">Automatic redaction filters</h3>
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-lg border border-line bg-paper space-y-1">
                  <p className="font-medium text-ink flex items-center gap-1.5">
                    <Lock size={13} className="text-accent" />
                    Blocked Credential Patterns
                  </p>
                  <p className="text-ink-soft">
                    Regex scanners match and strip API keys (<code className="text-accent">pk_live_</code>, <code className="text-accent">sk_live_</code>), JWT tokens, Bearer headers, and PEM private keys.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-line bg-paper space-y-1">
                  <p className="font-medium text-ink flex items-center gap-1.5">
                    <Lock size={13} className="text-accent" />
                    Blocked Property Keys
                  </p>
                  <p className="text-ink-soft">
                    Keys containing <code className="text-accent">password</code>, <code className="text-accent">token</code>, <code className="text-accent">secret</code>, <code className="text-accent">message</code>, or <code className="text-accent">value</code> are filtered out.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-line bg-paper space-y-1">
                  <p className="font-medium text-ink flex items-center gap-1.5">
                    <Lock size={13} className="text-accent" />
                    URL Query Sanitization
                  </p>
                  <p className="text-ink-soft">
                    Query strings (<code className="text-accent">?token=xyz&amp;auth=123</code>) and hash anchors are automatically stripped before sending.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-card border border-line from-accent-tint via-white to-accent-tint p-6 ">
        <div>
          <h3 className="font-medium text-[14px] text-ink">Explore the Complete Markdown Guides</h3>
          <p className="text-xs text-ink-soft mt-0.5">
            Detailed markdown manuals are also available directly in the repository at <code className="text-accent">docs/</code>.
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

