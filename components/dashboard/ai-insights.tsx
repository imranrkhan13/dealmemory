import { Brain, CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles } from "lucide-react";

type Insight = {
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  type: "success" | "warning" | "danger" | "info";
  evidence?: string[];
  reasoning?: string;
};

export default function AIInsights({ insights }: { insights: Insight[] }) {
  const percent = (c: number) => {
    if (Number.isNaN(c)) return "—";
    const v = c <= 1 ? c * 100 : c;
    return `${Math.round(Math.max(0, Math.min(100, v)))}%`;
  };

  const typeConfig = {
    success: {
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      icon: CheckCircle2,
    },
    warning: {
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      icon: AlertTriangle,
    },
    danger: {
      border: "border-rose-500/20",
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      icon: AlertCircle,
    },
    info: {
      border: "border-indigo-500/20",
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
      icon: Info,
    },
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
            <Sparkles size={14} />
          </div>
          <h3 className="font-semibold text-white text-base">AI Diagnostic Insights</h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">Autonomous Evaluation</span>
      </div>

      <div className="mt-5 space-y-4">
        {insights.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No active anomalies or friction points detected. All user journeys are progressing normally.
          </div>
        ) : (
          insights.map((x, i) => {
            const config = typeConfig[x.type] || typeConfig.info;
            const Icon = config.icon;

            return (
              <div
                key={i}
                className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-4 transition hover:border-white/[0.12]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={config.text} />
                    <h4 className="font-semibold text-sm text-white">{x.title}</h4>
                  </div>
                  <span className="rounded-md border border-white/[0.08] bg-zinc-900 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-400">
                    {percent(x.confidence)} confidence
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-zinc-300">{x.description}</p>

                {/* Evidence block */}
                {Array.isArray(x.evidence) && x.evidence.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {x.evidence.map((ev, ei) => (
                      <span
                        key={ei}
                        className="rounded-md border border-white/[0.06] bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400 font-mono"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recommendation */}
                {x.recommendation && (
                  <div className="mt-3 rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-2.5 text-xs text-indigo-200">
                    <span className="font-semibold text-indigo-300">Action: </span>
                    {x.recommendation}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
