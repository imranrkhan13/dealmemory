import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Rocket,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface EventItem {
  id: string;
  name: string;
  user: string;
  time: string;
}

interface Props {
  events: EventItem[];
}

function eventBadge(name: string) {
  const n = name.toLowerCase();

  if (n.includes("failed") || n.includes("error")) {
    return {
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-200",
    };
  }

  if (
    n.includes("activated") ||
    n.includes("paid") ||
    n.includes("completed") ||
    n.includes("first_value") ||
    n.includes("first_map")
  ) {
    return {
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
    };
  }

  if (n.includes("trial") || n.includes("connected")) {
    return {
      icon: Rocket,
      color: "text-sky-600",
      bg: "bg-sky-50 border-sky-200",
    };
  }

  return {
    icon: Zap,
    color: "text-slate-500",
    bg: "bg-slate-100 border-slate-200",
  };
}

export default function LiveActivity({ events }: Props) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-semibold text-slate-900 text-base">Live Activity Feed</h3>
        </div>
        <Link
          href="/events"
          className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
        >
          View all events →
        </Link>
      </div>

      <div className="mt-4 space-y-2.5">
        {events.length === 0 ? (
          <div className="py-10 text-center">
            <Activity className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs text-slate-500 font-medium">No live events captured yet</p>
            <p className="text-[11px] text-slate-400 mt-1">Send an event with your public key to see real-time ingest.</p>
          </div>
        ) : (
          events.slice(0, 8).map((event) => {
            const badge = eventBadge(event.name);
            const Icon = badge.icon;

            return (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 hover:bg-sky-50/40 hover:border-sky-200 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${badge.bg}`}>
                    <Icon size={14} className={badge.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate capitalize">
                      {event.name.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 truncate">
                      {event.user}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 shrink-0 font-mono">
                  <Clock3 size={11} />
                  <span>{event.time}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
