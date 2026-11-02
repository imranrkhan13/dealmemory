import type { Metadata } from 'next';
import InstallClient from './InstallClient';

export const metadata: Metadata = {
  title: 'Install DealMemory · DealMemory',
  description:
    'Install DealMemory in two steps: npm install dealmemory, then add one project key to .env. The CLI writes the tracking code for you.',
};

export default function InstallPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <a href="/" className="text-[15px] font-medium text-ink">
            DealMemory
          </a>
          <nav className="flex items-center gap-4 text-[13px] text-ink-soft">
            <a href="/docs">SDK docs</a>
            <a href="/pricing">Pricing</a>
            <a href="/signup" className="font-medium text-ink">
              Sign up
            </a>
          </nav>
        </div>
      </header>

      <InstallClient />
    </div>
  );
}
