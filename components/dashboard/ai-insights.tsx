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
      border: "border-success/40",
      bg: "bg-success-tint",
      text: "text-success",
      icon: CheckCircle2,
    },
    warning: {
      border: "border-warn/40",
      bg: "bg-warn-tint",
      text: "text-warn",
      icon: AlertTriangle,
    },
    danger: {
      border: "border-danger/40",
      bg: "bg-danger-tint",
      text: "text-danger",
      icon: AlertCircle,
    },
    info: {
      border: "border-line",
      bg: "bg-accent-tint",
      text: "text-accent",
      icon: Info,
    },
  };

  return (
    <div className="rounded-card border border-line bg-white p-6 ">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-tint text-accent border border-line">
            <Sparkles size={14} />
          </div>
          <h3 className="font-semibold text-ink text-base">AI Diagnostic Insights</h3>
        </div>
        <span className="text-[11px] font-mono text-ink-faint">Autonomous Evaluation</span>
      </div>

      <div className="mt-5 space-y-4">
        {insights.length === 0 ? (
          <div className="py-8 text-center text-xs text-ink-faint">
            No active anomalies or friction points detected. All user journeys are progressing normally.
          </div>
        ) : (
          insights.map((x, i) => {
            const config = typeConfig[x.type] || typeConfig.info;
            const Icon = config.icon;

            return (
              <div
                key={i}
                className="rounded-lg border border-line bg-paper p-4 transition hover:border-line hover:bg-accent-tint"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={config.text} />
                    <h4 className="font-semibold text-sm text-ink">{x.title}</h4>
                  </div>
                  <span className="rounded-md border border-line bg-white px-2 py-0.5 text-[10px] font-mono font-medium text-ink-soft ">
                    {percent(x.confidence)} confidence
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-ink-soft">{x.description}</p>

                {/* Evidence block */}
                {Array.isArray(x.evidence) && x.evidence.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {x.evidence.map((ev, ei) => (
                      <span
                        key={ei}
                        className="rounded-md border border-line bg-white px-2 py-0.5 text-[10px] text-ink-soft font-mono "
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recommendation */}
                {x.recommendation && (
                  <div className="mt-3 rounded-lg border border-line bg-accent-tint p-2.5 text-xs text-accent">
                    <span className="font-semibold text-accent">Action: </span>
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
