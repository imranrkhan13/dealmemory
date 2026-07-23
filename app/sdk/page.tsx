import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';

export default function SdkPage() {
  return (
    <AppShell>
      <ProjectGate>
        <main className="mx-auto max-w-4xl px-5 py-10">
          <p className="text-sm font-semibold text-[#4F46E5]">AgentLens SDK</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Install once. See what users do.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B6B6B]">
            AgentLens is built for founders: use the ready-to-copy setup in Settings, then return to Events and Journeys as your users move through the product.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <section className="rounded-xl border border-[#E8E7E3] bg-white p-6">
              <p className="mono text-sm font-semibold text-[#4F46E5]">JavaScript</p>
              <pre className="mono mt-4 overflow-x-auto rounded-lg bg-[#171717] p-4 text-sm text-[#F4F4F2]">npm install agentlens</pre>
              <p className="mt-4 text-sm leading-6 text-[#6B6B6B]">Automatically captures safe page, click, and form-submission events. Add custom events for important product milestones.</p>
            </section>
            <section className="rounded-xl border border-[#E8E7E3] bg-white p-6">
              <p className="mono text-sm font-semibold text-[#4F46E5]">Python</p>
              <pre className="mono mt-4 overflow-x-auto rounded-lg bg-[#171717] p-4 text-sm text-[#F4F4F2]">pip install agentlens</pre>
              <p className="mt-4 text-sm leading-6 text-[#6B6B6B]">Use it from a backend or worker to send meaningful server-side product events.</p>
            </section>
          </div>

          <section className="mt-8 rounded-xl border border-[#E8E7E3] bg-white p-6">
            <h2 className="font-semibold">What AgentLens records</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
              Page views, clicks, form submissions, and the explicit events you choose. It does not capture passwords, form values, arbitrary page text, screen recordings, or session replay.
            </p>
            <Link className="btn btn-primary mt-5" href="/settings">Open my ready-to-copy setup</Link>
          </section>
        </main>
      </ProjectGate>
    </AppShell>
  );
}
