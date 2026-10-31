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
    bg: "bg-accent-tint",
    text: "text-accent",
    border: "border-line",
  },
  green: {
    bg: "bg-success-tint",
    text: "text-success",
    border: "border-success/40",
  },
  amber: {
    bg: "bg-warn-tint",
    text: "text-warn",
    border: "border-warn/40",
  },
  red: {
    bg: "bg-danger-tint",
    text: "text-danger",
    border: "border-danger/40",
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
    <div className="relative group overflow-hidden rounded-card border border-line bg-white p-6  transition-all duration-300 hover:border-accent-line hover:translate-y-[-2px] hover:">
      {/* Top subtle highlight shimmer */}
      <div className="absolute inset-x-0 top-0 h-px from-transparent via-sky-200 to-transparent group-hover:via-sky-400 transition-colors" />

      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg border ${theme.border} ${theme.bg}`}
        >
          <span className={theme.text}>{icon}</span>
        </div>

        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-paper text-ink-faint group-hover:text-ink-soft transition-colors">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft font-mono">
          {title}
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-ink tabular-nums">
          {value}
        </p>
      </div>

      {subtitle && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
          <span className="flex items-center gap-1 font-medium text-success">
            <TrendingUp size={12} /> Live
          </span>
          <span>·</span>
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
