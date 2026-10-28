import {
  Flag,
  Link2,
  Rocket,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface ActivationFunnelProps {
  trial: number;
  connected: number;
  activated: number;
  checkout: number;
  paid: number;
}

const steps = [
  {
    title: "Trial Started",
    key: "trial" as const,
    icon: Flag,
    color: "from-blue-500 to-indigo-500",
    glow: "rgba(59, 130, 246, 0.2)",
  },
  {
    title: "Integration Connected",
    key: "connected" as const,
    icon: Link2,
    color: "from-indigo-500 to-violet-500",
    glow: "rgba(99, 102, 241, 0.2)",
  },
  {
    title: "First Value Reached",
    key: "activated" as const,
    icon: Rocket,
    color: "from-violet-500 to-purple-500",
    glow: "rgba(139, 92, 246, 0.2)",
  },
  {
    title: "Checkout Started",
    key: "checkout" as const,
    icon: CreditCard,
    color: "from-amber-500 to-orange-500",
    glow: "rgba(245, 158, 11, 0.2)",
  },
  {
    title: "Payment Converted",
    key: "paid" as const,
    icon: CheckCircle2,
    color: "from-emerald-500 to-teal-500",
    glow: "rgba(16, 185, 129, 0.2)",
  },
];

export default function ActivationFunnel({
  trial,
  connected,
  activated,
  checkout,
  paid,
}: ActivationFunnelProps) {
  const values = {
    trial,
    connected,
    activated,
    checkout,
    paid,
  };

  const base = Math.max(trial, 1);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Pipeline Conversion
            </span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-white">
            Activation Funnel
          </h3>
          <p className="mt-1 text-xs text-zinc-400">
            Track user journey velocity from signup to value and payment.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Calculated from canonical events</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-5">
        {steps.map((s, index) => {
          const val = values[s.key];
          const pct = Math.round((val / base) * 100);
          const Icon = s.icon;
          const prevVal = index > 0 ? values[steps[index - 1].key] : val;
          const dropoffPct = index > 0 && prevVal > 0 ? Math.round(((prevVal - val) / prevVal) * 100) : 0;

          return (
            <div
              key={s.key}
              className="relative rounded-xl border border-white/[0.06] bg-zinc-950/60 p-4 transition hover:border-white/[0.12] hover:bg-zinc-950/80"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr ${s.color} text-white shadow-sm`}>
                  <Icon size={16} />
                </div>
                <span className="text-xs font-mono font-bold text-zinc-400">
                  {pct}%
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium text-zinc-400 truncate" title={s.title}>
                  {s.title}
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-white tabular-nums">
                  {val}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${s.color}`}
                  style={{ width: `${Math.max(pct, 4)}%` }}
                />
              </div>

              {index > 0 && dropoffPct > 0 && (
                <p className="mt-2 text-[10px] text-zinc-500 font-mono">
                  ↓ {dropoffPct}% drop-off
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
