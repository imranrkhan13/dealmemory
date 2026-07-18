import Link from 'next/link';
import UpgradeButton from '@/components/upgrade-button';

const freeFeatures = [
  'Single AI journey',
  'Basic Supermemory retrieval',
  'Personal workspace',
  'Core AI insights (basic)',
  'No API access',
];

const proFeatures = [
  'Unlimited AI journeys',
  'Unlimited Supermemory retrieval',
  'Team workspaces',
  'Advanced AI insights',
  'API access',
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <div className="text-center">
        <p className="text-sm font-semibold text-[#4F46E5]">Plans</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Choose your plan</h1>
        <p className="mt-3 text-[#6B7280]">
          Start free. Upgrade to Pro when you need unlimited journeys, team workspaces, and full AI insights.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-xl border border-[#E8E7E3] bg-white p-6">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-1 text-sm text-[#6B7280]">For evaluation and initial exploration.</p>
          <div className="mt-4 text-3xl font-bold tracking-tight">$0</div>
          <ul className="mt-6 space-y-2 text-sm">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#4F46E5]" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link href="/signup" className="btn mt-6 w-full">
            Get started
          </Link>
        </div>

        {/* Pro */}
        <div className="rounded-xl border border-[#E8E7E3] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Pro</h2>
          <p className="mt-1 text-sm text-[#6B7280]">For teams ready to ship with activation memory.</p>
          <div className="mt-4 text-3xl font-bold tracking-tight">$29<span className="text-base font-medium text-[#6B7280]">/mo</span></div>
          <ul className="mt-6 space-y-2 text-sm">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#4F46E5]" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <UpgradeButton className="mt-6" />
          <p className="mt-2 text-xs text-[#6B7280]">
            You&#39;ll be redirected to a secure Dodo Payments checkout. After payment, you&#39;ll return to Dashboard → Settings.
          </p>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-[#9CA3AF]">
        Need help? Visit Dashboard → Settings to access the customer portal after subscribing.
      </p>
    </main>
  );
}