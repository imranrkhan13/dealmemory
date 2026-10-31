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
      color: "text-danger",
      bg: "bg-danger-tint border-danger/40",
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
      color: "text-success",
      bg: "bg-success-tint border-success/40",
    };
  }

  if (n.includes("trial") || n.includes("connected")) {
    return {
      icon: Rocket,
      color: "text-accent",
      bg: "bg-accent-tint border-line",
    };
  }

  return {
    icon: Zap,
    color: "text-ink-soft",
    bg: "bg-muted border-line",
  };
}

export default function LiveActivity({ events }: Props) {
  return (
    <div className="rounded-card border border-line bg-white p-6 ">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <h3 className="font-semibold text-ink text-base">Live Activity Feed</h3>
        </div>
        <Link
          href="/events"
          className="text-xs font-medium text-accent hover:text-accent transition-colors"
        >
          View all events →
        </Link>
      </div>

      <div className="mt-4 space-y-2.5">
        {events.length === 0 ? (
          <div className="py-10 text-center">
            <Activity className="mx-auto h-8 w-8 text-ink-faint mb-2" />
            <p className="text-xs text-ink-soft font-medium">No live events captured yet</p>
            <p className="text-[11px] text-ink-faint mt-1">Send an event with your public key to see real-time ingest.</p>
          </div>
        ) : (
          events.slice(0, 8).map((event) => {
            const badge = eventBadge(event.name);
            const Icon = badge.icon;

            return (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-lg border border-line bg-paper px-3.5 py-2.5 hover:bg-accent-tint hover:border-line transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${badge.bg}`}>
                    <Icon size={14} className={badge.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink truncate capitalize">
                      {event.name.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] font-mono text-ink-soft truncate">
                      {event.user}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-ink-soft shrink-0 font-mono">
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
