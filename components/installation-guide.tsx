'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Terminal, KeyRound } from 'lucide-react';
import { installSnippet, SnippetRuntime } from '@/lib/sdk-install';

export default function InstallationGuide({
  publicKey,
  creatingKey,
  onCreatePublicKey,
}: {
  publicKey?: string | null;
  creatingKey: boolean;
  onCreatePublicKey: () => void;
}) {
  const [runtime, setRuntime] = useState<SnippetRuntime>('curl');
  const [apiUrl, setApiUrl] = useState('/api');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  useEffect(() => {
    setApiUrl(`${location.origin}/api`);
  }, []);

  const code = installSnippet(runtime, apiUrl, publicKey || undefined);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-card border border-line bg-white ">
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow">
                <Terminal size={13} /> Quick Integration
              </span>
              <span className="text-[11px] font-mono text-ink-faint">Zero Dependencies</span>
            </div>
            <h2 className="mt-2 text-[26px] font-medium leading-tight tracking-[-0.025em] text-ink">
              Connect in 3 lines of code
            </h2>
            <p className="mt-1 text-xs text-ink-soft">
              Send privacy-safe product actions directly over HTTP. No heavy tracking bundles required.
            </p>
          </div>

          {!publicKey && (
            <button
              className="btn btn-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
              onClick={onCreatePublicKey}
              disabled={creatingKey}
            >
              <KeyRound size={13} />
              {creatingKey ? 'Generating…' : 'Generate public key'}
            </button>
          )}
        </div>

        {/* Language Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {(['curl', 'fetch', 'python'] as const).map((t) => (
            <button
              key={t}
              aria-pressed={runtime === t}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                runtime === t
                  ? 'bg-accent text-white font-semibold '
                  : 'bg-paper text-ink-soft hover:text-accent hover:bg-accent-tint border border-line'
              }`}
              onClick={() => setRuntime(t)}
            >
              {t === 'curl' ? 'Terminal (cURL)' : t === 'fetch' ? 'JavaScript / Node (fetch)' : 'Python'}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Code Window */}
      <div className="relative border-t border-ink bg-ink">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink bg-ink">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-warn/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
            <span className="ml-2 font-mono text-[11px] text-ink-faint">
              {runtime === 'curl' ? 'terminal-curl.sh' : runtime === 'fetch' ? 'dealmemory.ts' : 'dealmemory.py'}
            </span>
          </div>

          <button
            className="flex items-center gap-1.5 rounded-lg border border-ink bg-ink px-2.5 py-1 text-xs text-ink-faint hover:text-white transition-colors"
            onClick={copyCode}
          >
            {copied ? (
              <>
                <Check size={12} className="text-success" />
                <span className="text-success font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy snippet</span>
              </>
            )}
          </button>
        </div>

        <pre className="overflow-x-auto p-5 font-mono text-[11.5px] leading-relaxed text-[#cfd6df]">
          {code}
        </pre>
      </div>

      <div className="px-6 py-3.5 border-t border-line bg-paper text-[11px] text-ink-soft flex items-center justify-between">
        <span>
          {copyError
            ? 'Copy unavailable. Select and copy snippet manually.'
            : !publicKey
            ? 'Generate a public key above to pre-fill your credential.'
            : 'Your active public key is embedded in the snippet above.'}
        </span>
        <span className="font-mono text-ink-faint">HTTPS only · 4 KB cap</span>
      </div>
    </section>
  );
}
