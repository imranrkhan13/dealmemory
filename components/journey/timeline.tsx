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
  signup_started: 'text-accent bg-accent-tint border-line',
  signup_completed: 'text-success bg-success-tint border-success/40',
  login: 'text-accent bg-accent-tint border-line',
  document_uploaded: 'text-accent bg-accent-tint border-line',
  repository_connected: 'text-accent bg-accent-tint border-line',
  summary_generated: 'text-violet-700 bg-violet-50 border-violet-200',
  first_map_generated: 'text-violet-700 bg-violet-50 border-violet-200',
  summary_viewed: 'text-violet-700 bg-violet-50 border-violet-200',
  chat_opened: 'text-accent bg-accent-tint border-line',
  pricing_opened: 'text-warn bg-warn-tint border-warn/40',
  checkout_started: 'text-warn bg-warn-tint border-warn/40',
  payment_completed: 'text-success bg-success-tint border-success/40',
  subscription_created: 'text-success bg-success-tint border-success/40',
  subscription_cancelled: 'text-danger bg-danger-tint border-danger/40',
  upload_failed: 'text-danger bg-danger-tint border-danger/40',
  error_occurred: 'text-danger bg-danger-tint border-danger/40',
  export_clicked: 'text-success bg-success-tint border-success/40',
};

export default function JourneyTimeline({ events }: Props) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  return (
    <div className="rounded-card border border-line bg-white  overflow-hidden">
      <div className="border-b border-line px-6 py-4 bg-paper">
        <h2 className="text-base font-semibold text-ink">Journey Timeline</h2>
        <p className="text-xs text-ink-soft">Chronological telemetry stream for this session</p>
      </div>

      <div className="p-6">
        <div className="relative">
          {sorted.map((event, index) => {
            const Icon = iconMap[event.name] ?? CheckCircle2;
            const colors =
              colorMap[event.name] ?? 'text-ink-soft bg-muted border-line';

            return (
              <div key={event.id ?? index} className="relative flex gap-4 pb-8 last:pb-2">
                {index !== sorted.length - 1 && (
                  <div className="absolute left-5 top-11 h-full w-[1.5px] bg-line" />
                )}

                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${colors} `}
                >
                  <Icon size={17} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium text-sm text-ink">
                      {getEventLabel(event.name)}
                    </h3>
                    <span className="text-xs font-mono text-ink-faint">
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
                    <pre className="mt-2.5 overflow-x-auto rounded-lg bg-ink border border-ink p-3 text-xs font-mono text-accent leading-relaxed ">
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
