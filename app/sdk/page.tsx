import { AppShell } from '@/components/app-shell';

export default function Sdk() {
  const code = `import { ActivationMemory } from '@activation-memory/sdk'

const activation = new ActivationMemory({
  projectKey: '<YOUR_PROJECT_KEY>', // obtain from your backend after project creation
  apiUrl: process.env.NEXT_PUBLIC_ACTIVATION_API_URL
})

// Identify a user and track key activation events
activation.identify('user_123', { plan: 'trial' })
activation.track('trial_started')
activation.setGoal('Generate my first architecture map')
activation.track('repository_connected')
activation.track('first_map_generated')`;

  return (
    <AppShell>
      <main className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-sm font-semibold text-[#4F46E5]">Developer experience</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Install activation intelligence in minutes.</h1>
        <pre className="mono mt-8 overflow-x-auto rounded-xl border border-[#E8E7E3] bg-[#171717] p-5 text-sm leading-6 text-[#F4F4F2]">
          {code}
        </pre>
        <div className="mt-8 grid gap-7 md:grid-cols-2">
          <section>
            <h2 className="font-semibold">Product truth, not replay</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
              Track only explicit activation events. Never send passwords, form contents, or arbitrary page text.
            </p>
          </section>
          <section>
            <h2 className="font-semibold">Context stays separate</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
              Supermemory stores meaningful user context; SDK events remain the source of truth for product behavior.
            </p>
          </section>
        </div>
        <section className="mt-9 border-t border-[#E8E7E3] pt-6">
          <h2 className="font-semibold">Supported methods</h2>
          <p className="mt-2 text-sm text-[#6B6B6B]">
            <code>init</code>, <code>identify</code>, <code>track</code>, <code>page</code>, <code>setGoal</code>,{' '}
            <code>reset</code>, <code>flush</code>. Dodo checkout can be gated by a configured activation event.
          </p>
        </section>
      </main>
    </AppShell>
  );
}
