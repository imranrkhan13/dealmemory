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
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
    glow: "rgba(99, 102, 241, 0.15)",
  },
  green: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    glow: "rgba(16, 185, 129, 0.15)",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    glow: "rgba(245, 158, 11, 0.15)",
  },
  red: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    glow: "rgba(244, 63, 94, 0.15)",
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
    <div className="relative group overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-white/[0.16] hover:translate-y-[-2px] hover:shadow-2xl">
      {/* Top subtle highlight shimmer */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-indigo-500/40 transition-colors" />

      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${theme.border} ${theme.bg}`}
        >
          <span className={theme.text}>{icon}</span>
        </div>

        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.05] bg-zinc-950/40 text-zinc-500 group-hover:text-zinc-300 transition-colors">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-white tabular-nums">
          {value}
        </p>
      </div>

      {subtitle && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="flex items-center gap-1 font-medium text-emerald-400">
            <TrendingUp size={12} /> Live
          </span>
          <span>·</span>
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
