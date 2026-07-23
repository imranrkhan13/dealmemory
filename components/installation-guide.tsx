'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';

type Runtime = 'javascript' | 'python';

type Props = {
  publicKey?: string | null;
  creatingKey: boolean;
  onCreatePublicKey: () => void;
};

export default function InstallationGuide({ publicKey, creatingKey, onCreatePublicKey }: Props) {
  const [runtime, setRuntime] = useState<Runtime>('javascript');
  const [apiUrl, setApiUrl] = useState('https://your-agentlens-domain/api');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setApiUrl(`${window.location.origin}/api`);
  }, []);

  const key = publicKey ?? '<YOUR_PUBLIC_KEY>';
  const code = useMemo(() => {
    if (runtime === 'python') {
      return `pip install agentlens

from agentlens import AgentLens

agentlens = AgentLens(
    project_key='${key}',
    api_url='${apiUrl}',
)
agentlens.identify('user_123')
agentlens.track('report_exported', {'format': 'pdf'})`;
    }

    return `npm install agentlens

import { AgentLens } from 'agentlens';

const agentlens = new AgentLens({
  projectKey: '${key}',
  apiUrl: '${apiUrl}',
});

agentlens.identify(user.id);
agentlens.track('trial_started');
// Page views, clicks, and form submissions are captured safely by default.`;
  }, [apiUrl, key, runtime]);

  const copy = async () => {
    await navigator.clipboard.writeText(code).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="mt-8 rounded-xl border border-[#C7D2FE] bg-[#F8FAFF] p-5">
      <p className="text-sm font-semibold text-[#4F46E5]">Connect your product</p>
      <h2 className="mt-1 text-xl font-semibold">Copy this into your app.</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B6B6B]">
        AgentLens uses your public project key to collect page views, clicks, form submissions, and the custom events you add. It never records form values or session replay.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button className={`btn ${runtime === 'javascript' ? 'btn-primary' : ''}`} onClick={() => setRuntime('javascript')}>JavaScript / npm</button>
        <button className={`btn ${runtime === 'python' ? 'btn-primary' : ''}`} onClick={() => setRuntime('python')}>Python / pip</button>
        {!publicKey ? <button className="btn ml-auto" onClick={onCreatePublicKey} disabled={creatingKey}>{creatingKey ? 'Creating key…' : 'Create public key'}</button> : null}
      </div>

      <div className="relative mt-4">
        <pre className="mono overflow-x-auto rounded-lg bg-[#171717] p-5 pr-24 text-sm leading-6 text-[#F4F4F2]">{code}</pre>
        <button className="btn absolute right-3 top-3 bg-white" onClick={() => void copy()}>
          {copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {!publicKey ? <p className="mt-3 text-xs text-[#B45309]">Create a public key to replace the placeholder before copying. Public keys are safe for browser and app code; secret keys are not.</p> : null}
      <ol className="mt-5 grid gap-3 text-sm text-[#4B5563] md:grid-cols-3">
        <li><b className="text-[#29221D]">1. Install</b><br />Run the first line in your project.</li>
        <li><b className="text-[#29221D]">2. Paste</b><br />Initialize AgentLens once when your app starts.</li>
        <li><b className="text-[#29221D]">3. Watch</b><br />Return to Events to see actions arrive.</li>
      </ol>
      {runtime === 'javascript' ? <p className="mt-4 text-xs leading-5 text-[#6B7280]">For a browser app on another domain, add that app&apos;s origin to <code>SDK_CORS_ORIGINS</code> on your AgentLens deployment (for example, <code>https://app.example.com</code>).</p> : null}
    </section>
  );
}
