import { CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles } from "lucide-react";

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
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      icon: CheckCircle2,
    },
    warning: {
      border: "border-amber-200",
      bg: "bg-amber-50",
      text: "text-amber-700",
      icon: AlertTriangle,
    },
    danger: {
      border: "border-rose-200",
      bg: "bg-rose-50",
      text: "text-rose-700",
      icon: AlertCircle,
    },
    info: {
      border: "border-sky-200",
      bg: "bg-sky-50",
      text: "text-sky-700",
      icon: Info,
    },
  };

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
            <Sparkles size={14} />
          </div>
          <h3 className="font-semibold text-slate-900 text-base">AI Diagnostic Insights</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Autonomous Evaluation</span>
      </div>

      <div className="mt-5 space-y-4">
        {insights.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No active anomalies or friction points detected. All user journeys are progressing normally.
          </div>
        ) : (
          insights.map((x, i) => {
            const config = typeConfig[x.type] || typeConfig.info;
            const Icon = config.icon;

            return (
              <div
                key={i}
                className="rounded-xl border border-sky-100/80 bg-slate-50/60 p-4 transition hover:border-sky-200 hover:bg-sky-50/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={config.text} />
                    <h4 className="font-semibold text-sm text-slate-900">{x.title}</h4>
                  </div>
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600 shadow-xs">
                    {percent(x.confidence)} confidence
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-600">{x.description}</p>

                {/* Evidence block */}
                {Array.isArray(x.evidence) && x.evidence.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {x.evidence.map((ev, ei) => (
                      <span
                        key={ei}
                        className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 font-mono shadow-xs"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recommendation */}
                {x.recommendation && (
                  <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50/90 p-2.5 text-xs text-sky-900">
                    <span className="font-semibold text-sky-800">Action: </span>
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
