import type { Metadata } from 'next';
import QuickstartClient from './QuickstartClient';

export const metadata: Metadata = {
  title: 'Quickstart · DealMemory',
  description:
    'Paste a few lines of JavaScript into your browser console and see DealMemory reconstruct a trial user journey, detect a blocker, and suggest the next action.',
};

export default function QuickstartPage() {
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

      <QuickstartClient />
    </div>
  );
}
