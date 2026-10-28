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
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
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
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    };
  }

  if (n.includes("trial") || n.includes("connected")) {
    return {
      icon: Rocket,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    };
  }

  return {
    icon: Zap,
    color: "text-zinc-400",
    bg: "bg-zinc-800/50 border-white/[0.06]",
  };
}

export default function LiveActivity({ events }: Props) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="font-semibold text-white text-base">Live Activity Feed</h3>
        </div>
        <Link
          href="/events"
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View all events →
        </Link>
      </div>

      <div className="mt-4 space-y-2.5">
        {events.length === 0 ? (
          <div className="py-10 text-center">
            <Activity className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-400 font-medium">No live events captured yet</p>
            <p className="text-[11px] text-zinc-600 mt-1">Send an event with your public key to see real-time ingest.</p>
          </div>
        ) : (
          events.slice(0, 8).map((event) => {
            const badge = eventBadge(event.name);
            const Icon = badge.icon;

            return (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-zinc-950/40 px-3.5 py-2.5 hover:bg-zinc-950/70 hover:border-white/[0.08] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${badge.bg}`}>
                    <Icon size={14} className={badge.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate capitalize">
                      {event.name.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] font-mono text-zinc-500 truncate">
                      {event.user}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 shrink-0 font-mono">
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
