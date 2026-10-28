'use client';
import { useEffect,useState } from 'react';
import { Check,Copy,Terminal } from 'lucide-react';
import { sdkInstall,installSnippet,SnippetRuntime } from '@/lib/sdk-install';
export default function InstallationGuide({publicKey,creatingKey,onCreatePublicKey}:{publicKey?:string|null;creatingKey:boolean;onCreatePublicKey:()=>void}) {
  const [runtime,setRuntime]=useState<SnippetRuntime>('fetch');
  const [apiUrl,setApiUrl]=useState('/api');
  const [copied,setCopied]=useState(false);
  const [copyError,setCopyError]=useState(false);
  useEffect(()=>setApiUrl(`${location.origin}/api`),[]);
  const code=installSnippet(runtime,apiUrl,publicKey||undefined);
  return <section className="mt-8 overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-sm">
    <div className="p-6 sm:p-8"><p className="eyebrow"><Terminal size={14}/> Your first event</p><h2 className="mt-3 text-2xl font-semibold tracking-tight">A few lines. A clearer picture.</h2><p className="mt-2 text-sm leading-6 text-slate-500">Send a product action from your app. No package installation needed.</p>
    <div className="mt-6 flex flex-wrap items-center gap-2">{(['fetch','curl','python'] as const).map(t=><button key={t} aria-pressed={runtime===t} className={`btn ${runtime===t?'btn-primary':''}`} onClick={()=>setRuntime(t)}>{t==='fetch'?'JavaScript':t==='curl'?'cURL':'Python'}</button>)}{!publicKey&&<button className="btn ml-auto" onClick={onCreatePublicKey} disabled={creatingKey}>{creatingKey?'Creating…':'Create public key'}</button>}</div></div>
    <div className="relative bg-[#141c2d] p-5 pt-16 sm:p-7 sm:pt-16"><button className="absolute right-4 top-3 rounded-lg bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/20" onClick={async()=>{try{await navigator.clipboard.writeText(code);setCopied(true);setCopyError(false);setTimeout(()=>setCopied(false),1800);}catch{setCopyError(true);}}}>{copied?<Check className="mr-2 inline" size={13}/>:<Copy className="mr-2 inline" size={13}/>} {copied?'Copied':'Copy snippet'}</button><pre className="overflow-x-auto text-xs leading-6 text-indigo-100 sm:text-sm">{code}</pre></div>
    <p className="px-6 py-4 text-xs leading-5 text-slate-500" role="status">{copyError?'Copy unavailable. Select and copy the snippet above.':!publicKey?'Create a public key, then copy your snippet. Full keys are shown once.':'Your new key is filled in. Save it now; only the prefix is stored.'} {!sdkInstall.published&&'npm and pip packages: coming soon, not published yet.'}</p>
  </section>;
}
