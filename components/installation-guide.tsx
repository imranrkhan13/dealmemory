'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Terminal, Sparkles, KeyRound } from 'lucide-react';
import { sdkInstall, installSnippet, SnippetRuntime } from '@/lib/sdk-install';

export default function InstallationGuide({
  publicKey,
  creatingKey,
  onCreatePublicKey,
}: {
  publicKey?: string | null;
  creatingKey: boolean;
  onCreatePublicKey: () => void;
}) {
  const [runtime, setRuntime] = useState<SnippetRuntime>('fetch');
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
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60 shadow-xl backdrop-blur-xl">
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow">
                <Terminal size={13} /> Quick Integration
              </span>
              <span className="text-[11px] font-mono text-zinc-500">Zero Dependencies</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Connect in 3 lines of code
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
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
          {(['fetch', 'curl', 'python'] as const).map((t) => (
            <button
              key={t}
              aria-pressed={runtime === t}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                runtime === t
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-white/[0.06]'
              }`}
              onClick={() => setRuntime(t)}
            >
              {t === 'fetch' ? 'JavaScript / TypeScript' : t === 'curl' ? 'cURL' : 'Python'}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Code Window */}
      <div className="relative border-t border-white/[0.06] bg-[#0c0d12]">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] bg-zinc-950/50">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-[11px] text-zinc-500">
              {runtime === 'fetch' ? 'agentlens.ts' : runtime === 'curl' ? 'curl.sh' : 'agentlens.py'}
            </span>
          </div>

          <button
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-300 hover:text-white hover:border-white/[0.15] transition-colors"
            onClick={copyCode}
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy snippet</span>
              </>
            )}
          </button>
        </div>

        <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-indigo-200">
          {code}
        </pre>
      </div>

      <div className="px-6 py-3.5 border-t border-white/[0.04] bg-zinc-950/40 text-[11px] text-zinc-500 flex items-center justify-between">
        <span>
          {copyError
            ? 'Copy unavailable. Select and copy snippet manually.'
            : !publicKey
            ? 'Generate a public key above to pre-fill your credential.'
            : 'Your active public key is embedded in the snippet above.'}
        </span>
        <span className="font-mono text-zinc-600">HTTPS only · 4 KB cap</span>
      </div>
    </section>
  );
}
