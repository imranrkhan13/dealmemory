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
        color: "text-success",
        bg: "bg-success-tint border-success/40",
        indicator: "bg-success",
      };

    case "stuck":
    case "integration_connection_failed":
    case "error":
      return {
        label: "At Risk",
        score: 34,
        color: "text-danger",
        bg: "bg-danger-tint border-danger/40",
        indicator: "bg-danger",
      };

    default:
      return {
        label: "Progressing",
        score: 72,
        color: "text-warn",
        bg: "bg-warn-tint border-warn/40",
        indicator: "bg-warn",
      };
  }
}

export default function UsersAttention({ users }: Props) {
  return (
    <section className="mt-8 rounded-card border border-line bg-white p-6  overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent font-mono">
              Founder Attention
            </span>
          </div>
          <h3 className="mt-1 text-[22px] font-medium tracking-[-0.02em] text-ink">
            Trial Users &amp; Live States
          </h3>
        </div>

        <Link
          href="/journeys"
          className="text-xs font-medium text-accent hover:text-accent transition-colors"
        >
          View all journeys →
        </Link>
      </div>

      <div className="mt-4 divide-y divide-line">
        {users.length === 0 ? (
          <div className="py-10 text-center text-ink-faint text-xs">
            No active trial users yet. Connect your app with the SDK to track user milestones.
          </div>
        ) : (
          users.map((u) => {
            const h = health(u.state);

            return (
              <div
                key={u.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 transition hover:bg-accent-tint rounded-lg px-2"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-accent-tint text-accent font-mono text-xs font-bold ">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/journeys/${encodeURIComponent(u.id)}`}
                        className="font-semibold text-sm text-ink hover:text-accent transition-colors"
                      >
                        {u.name}
                      </Link>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${h.bg} ${h.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${h.indicator}`} />
                        {h.label}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-ink-soft">
                      Goal: <span className="text-ink-soft">{u.goal || "Evaluate platform"}</span>
                    </p>

                    {u.blocker && (
                      <p className="mt-1 text-xs text-warn flex items-center gap-1 font-medium">
                        <AlertTriangle size={11} className="text-warn shrink-0" />
                        <span>Blocker: {u.blocker}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-left sm:text-right text-xs">
                    <p className="text-ink-faint font-mono text-[11px]">{u.inactiveHours}h inactive</p>
                    <p className="mt-0.5 text-accent font-medium text-[11px] max-w-xs truncate" title={u.recommendation}>
                      {u.recommendation}
                    </p>
                  </div>

                  <Link
                    href={`/journeys/${encodeURIComponent(u.id)}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-ink-faint group-hover:text-ink-soft group-hover:border-accent-line transition-colors "
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
