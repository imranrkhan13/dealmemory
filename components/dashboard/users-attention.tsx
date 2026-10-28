import {
  AlertTriangle,
  ArrowRight,
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
        color: "text-emerald-700",
        bg: "bg-emerald-50 border-emerald-200",
        indicator: "bg-emerald-500",
      };

    case "stuck":
    case "integration_connection_failed":
    case "error":
      return {
        label: "At Risk",
        score: 34,
        color: "text-rose-700",
        bg: "bg-rose-50 border-rose-200",
        indicator: "bg-rose-500",
      };

    default:
      return {
        label: "Progressing",
        score: 72,
        color: "text-amber-700",
        bg: "bg-amber-50 border-amber-200",
        indicator: "bg-amber-500",
      };
  }
}

export default function UsersAttention({ users }: Props) {
  return (
    <section className="mt-8 rounded-2xl border border-sky-100 bg-white p-6 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 font-mono">
              Founder Attention
            </span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Trial Users &amp; Live States
          </h3>
        </div>

        <Link
          href="/journeys"
          className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
        >
          View all journeys →
        </Link>
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {users.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            No active trial users yet. Connect your app with the SDK to track user milestones.
          </div>
        ) : (
          users.map((u) => {
            const h = health(u.state);

            return (
              <div
                key={u.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 transition hover:bg-sky-50/40 rounded-xl px-2"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-800 font-mono text-xs font-bold shadow-xs">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/journeys/${encodeURIComponent(u.id)}`}
                        className="font-semibold text-sm text-slate-900 hover:text-sky-600 transition-colors"
                      >
                        {u.name}
                      </Link>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${h.bg} ${h.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${h.indicator}`} />
                        {h.label}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Goal: <span className="text-slate-700">{u.goal || "Evaluate platform"}</span>
                    </p>

                    {u.blocker && (
                      <p className="mt-1 text-xs text-amber-800 flex items-center gap-1 font-medium">
                        <AlertTriangle size={11} className="text-amber-600 shrink-0" />
                        <span>Blocker: {u.blocker}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-left sm:text-right text-xs">
                    <p className="text-slate-400 font-mono text-[11px]">{u.inactiveHours}h inactive</p>
                    <p className="mt-0.5 text-sky-700 font-medium text-[11px] max-w-xs truncate" title={u.recommendation}>
                      {u.recommendation}
                    </p>
                  </div>

                  <Link
                    href={`/journeys/${encodeURIComponent(u.id)}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 group-hover:text-slate-700 group-hover:border-sky-300 transition-colors shadow-xs"
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
