import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Rocket,
  User,
} from "lucide-react";
import Link from "next/link";

interface UserAttention {
  id: string;
  name: string;
  goal: string;
  state: string;
  blocker?: string;
  inactiveHours: number;
  recommendation: string;
}

interface Props {
  users: UserAttention[];
}

function health(state: string) {
  switch (state) {
    case "activated":
    case "paid":
      return {
        label: "Healthy",
        score: 96,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/20",
        indicator: "bg-emerald-400",
      };

    case "stuck":
    case "integration_connection_failed":
    case "error":
      return {
        label: "At Risk",
        score: 34,
        color: "text-rose-400",
        bg: "bg-rose-500/10 border-rose-500/20",
        indicator: "bg-rose-400",
      };

    default:
      return {
        label: "Progressing",
        score: 72,
        color: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/20",
        indicator: "bg-amber-400",
      };
  }
}

export default function UsersAttention({ users }: Props) {
  return (
    <section className="mt-8 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Founder Attention
            </span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-white">
            Trial Users &amp; Live States
          </h3>
        </div>

        <Link
          href="/journeys"
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View all journeys →
        </Link>
      </div>

      <div className="mt-4 divide-y divide-white/[0.04]">
        {users.length === 0 ? (
          <div className="py-10 text-center text-zinc-500 text-xs">
            No active trial users yet. Connect your app with the SDK to track user milestones.
          </div>
        ) : (
          users.map((u) => {
            const h = health(u.state);

            return (
              <div
                key={u.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 transition hover:bg-white/[0.02] rounded-xl px-2"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-zinc-950/70 text-zinc-300 font-mono text-xs font-bold">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/journeys/${encodeURIComponent(u.id)}`}
                        className="font-semibold text-sm text-white hover:text-indigo-400 transition-colors"
                      >
                        {u.name}
                      </Link>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${h.bg} ${h.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${h.indicator}`} />
                        {h.label}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-zinc-400">
                      Goal: <span className="text-zinc-200">{u.goal || "Evaluate platform"}</span>
                    </p>

                    {u.blocker && (
                      <p className="mt-1 text-xs text-amber-300 flex items-center gap-1 font-medium">
                        <AlertTriangle size={11} className="text-amber-400 shrink-0" />
                        <span>Blocker: {u.blocker}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-left sm:text-right text-xs">
                    <p className="text-zinc-400 font-mono text-[11px]">{u.inactiveHours}h inactive</p>
                    <p className="mt-0.5 text-indigo-300 font-medium text-[11px] max-w-xs truncate" title={u.recommendation}>
                      {u.recommendation}
                    </p>
                  </div>

                  <Link
                    href={`/journeys/${encodeURIComponent(u.id)}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-950 text-zinc-400 group-hover:text-white group-hover:border-white/[0.15] transition-colors"
                    title="Inspect user journey"
                  >
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
