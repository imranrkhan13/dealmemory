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
  signup_started: 'text-sky-700 bg-sky-50 border-sky-200',
  signup_completed: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  login: 'text-sky-700 bg-sky-50 border-sky-200',
  document_uploaded: 'text-blue-700 bg-blue-50 border-blue-200',
  repository_connected: 'text-blue-700 bg-blue-50 border-blue-200',
  summary_generated: 'text-violet-700 bg-violet-50 border-violet-200',
  first_map_generated: 'text-violet-700 bg-violet-50 border-violet-200',
  summary_viewed: 'text-violet-700 bg-violet-50 border-violet-200',
  chat_opened: 'text-cyan-700 bg-cyan-50 border-cyan-200',
  pricing_opened: 'text-amber-700 bg-amber-50 border-amber-200',
  checkout_started: 'text-amber-700 bg-amber-50 border-amber-200',
  payment_completed: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  subscription_created: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  subscription_cancelled: 'text-rose-700 bg-rose-50 border-rose-200',
  upload_failed: 'text-rose-700 bg-rose-50 border-rose-200',
  error_occurred: 'text-rose-700 bg-rose-50 border-rose-200',
  export_clicked: 'text-emerald-700 bg-emerald-50 border-emerald-200',
};

export default function JourneyTimeline({ events }: Props) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  return (
    <div className="rounded-2xl border border-sky-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
        <h2 className="text-base font-semibold text-slate-900">Journey Timeline</h2>
        <p className="text-xs text-slate-500">Chronological telemetry stream for this session</p>
      </div>

      <div className="p-6">
        <div className="relative">
          {sorted.map((event, index) => {
            const Icon = iconMap[event.name] ?? CheckCircle2;
            const colors =
              colorMap[event.name] ?? 'text-slate-600 bg-slate-100 border-slate-200';

            return (
              <div key={event.id ?? index} className="relative flex gap-4 pb-8 last:pb-2">
                {index !== sorted.length - 1 && (
                  <div className="absolute left-5 top-11 h-full w-[1.5px] bg-slate-200" />
                )}

                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${colors} shadow-xs`}
                >
                  <Icon size={17} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium text-sm text-slate-900">
                      {getEventLabel(event.name)}
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
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
                    <pre className="mt-2.5 overflow-x-auto rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs font-mono text-sky-200 leading-relaxed shadow-inner">
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
