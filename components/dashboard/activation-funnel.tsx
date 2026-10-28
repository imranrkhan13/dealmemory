import {
  Flag,
  Link2,
  Rocket,
  CreditCard,
  CheckCircle2,
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
    color: "from-sky-500 to-blue-600",
  },
  {
    title: "Integration Connected",
    key: "connected" as const,
    icon: Link2,
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "First Value Reached",
    key: "activated" as const,
    icon: Rocket,
    color: "from-indigo-500 to-violet-600",
  },
  {
    title: "Checkout Started",
    key: "checkout" as const,
    icon: CreditCard,
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Payment Converted",
    key: "paid" as const,
    icon: CheckCircle2,
    color: "from-emerald-500 to-teal-600",
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
    <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 font-mono">
              Pipeline Conversion
            </span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Activation Funnel
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Track user journey velocity from signup to value and payment.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
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
              className="relative rounded-xl border border-sky-100/80 bg-slate-50/60 p-4 transition hover:border-sky-200 hover:bg-sky-50/30"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr ${s.color} text-white shadow-xs`}>
                  <Icon size={16} />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {pct}%
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium text-slate-600 truncate" title={s.title}>
                  {s.title}
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {val}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${s.color}`}
                  style={{ width: `${Math.max(pct, 4)}%` }}
                />
              </div>

              {index > 0 && dropoffPct > 0 && (
                <p className="mt-2 text-[10px] text-slate-500 font-mono">
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
