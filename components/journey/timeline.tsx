'use client';

import {
  CheckCircle2,
  FileText,
  Upload,
  CreditCard,
  MessageCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  FolderGit2,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { getEventLabel } from '@/lib/journey-analysis';

type Props = {
  events: any[];
};

const iconMap: Record<string, any> = {
  signup_started: UserPlus,
  signup_completed: CheckCircle2,
  login: LogIn,
  document_uploaded: Upload,
  repository_connected: FolderGit2,
  summary_generated: Sparkles,
  first_map_generated: Sparkles,
  summary_viewed: FileText,
  chat_opened: MessageCircle,
  pricing_opened: CreditCard,
  checkout_started: CreditCard,
  payment_completed: CheckCircle2,
  subscription_created: CheckCircle2,
  subscription_cancelled: XCircle,
  upload_failed: AlertTriangle,
  error_occurred: AlertTriangle,
  export_clicked: FileText,
};

const colorMap: Record<string, string> = {
  signup_started: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  signup_completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  login: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  document_uploaded: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  repository_connected: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  summary_generated: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  first_map_generated: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  summary_viewed: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  chat_opened: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  pricing_opened: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  checkout_started: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  payment_completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  subscription_created: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  subscription_cancelled: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  upload_failed: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  error_occurred: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  export_clicked: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

export default function JourneyTimeline({ events }: Props) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 backdrop-blur-xl shadow-xl overflow-hidden">
      <div className="border-b border-white/[0.08] px-6 py-4 bg-zinc-950/40">
        <h2 className="text-base font-semibold text-white">Journey Timeline</h2>
        <p className="text-xs text-zinc-400">Chronological telemetry stream for this session</p>
      </div>

      <div className="p-6">
        <div className="relative">
          {sorted.map((event, index) => {
            const Icon = iconMap[event.name] ?? CheckCircle2;
            const colors =
              colorMap[event.name] ?? 'text-zinc-400 bg-zinc-800/80 border-white/[0.06]';

            return (
              <div key={event.id ?? index} className="relative flex gap-4 pb-8 last:pb-2">
                {index !== sorted.length - 1 && (
                  <div className="absolute left-5 top-11 h-full w-[1.5px] bg-zinc-800" />
                )}

                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${colors}`}
                >
                  <Icon size={17} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium text-sm text-zinc-100">
                      {getEventLabel(event.name)}
                    </h3>
                    <span className="text-xs font-mono text-zinc-500">
                      {event.occurredAt
                        ? new Date(event.occurredAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>

                  {event.properties && Object.keys(event.properties).length > 0 && (
                    <pre className="mt-2.5 overflow-x-auto rounded-xl bg-zinc-950/70 border border-white/[0.06] p-3 text-xs font-mono text-zinc-400 leading-relaxed">
                      {JSON.stringify(event.properties, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
