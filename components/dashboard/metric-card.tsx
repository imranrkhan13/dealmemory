import { ReactNode } from "react";
import { ArrowUpRight, TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: "indigo" | "green" | "amber" | "red";
}

const colors = {
  indigo: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-200",
  },
  green: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
  },
  red: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
  },
};

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color = "indigo",
}: MetricCardProps) {
  const theme = colors[color];

  return (
    <div className="relative group overflow-hidden rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-sky-300 hover:translate-y-[-2px] hover:shadow-md">
      {/* Top subtle highlight shimmer */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent group-hover:via-sky-400 transition-colors" />

      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${theme.border} ${theme.bg}`}
        >
          <span className={theme.text}>{icon}</span>
        </div>

        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 group-hover:text-slate-600 transition-colors">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
          {title}
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </p>
      </div>

      {subtitle && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium text-emerald-600">
            <TrendingUp size={12} /> Live
          </span>
          <span>·</span>
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
