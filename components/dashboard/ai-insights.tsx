type Insight = {
  title: string;
  description: string;
  recommendation: string;
  confidence: number; // may be 0..1 or 0..100; we normalize
  type: "success" | "warning" | "danger" | "info";
  evidence?: string[];
  reasoning?: string;
};
export default function AIInsights({
  insights,
}: {
  insights: Insight[];
}) {
  const percent = (c: number) => {
    if (Number.isNaN(c)) return "—";
    // normalize: treat <=1 as fraction, else as %
    const v = c <= 1 ? c * 100 : c;
    return `${Math.round(Math.max(0, Math.min(100, v)))}%`;
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
        AI Product Insights
      </p>

      <div className="mt-5 space-y-4">
        {insights.length === 0 && (
          <p className="text-gray-500">
            No insights yet.
          </p>
        )}

        {insights.map((x, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 ${
              x.type === "success"
                ? "bg-green-50 border-green-200"
                : x.type === "warning"
                ? "bg-yellow-50 border-yellow-200"
                : x.type === "danger"
                ? "bg-red-50 border-red-200"
                : "bg-indigo-50 border-indigo-200"
            }`}
          >
            <div className="font-semibold">
              {x.title}
            </div>

            <p className="mt-2 text-sm">
              {x.description}
            </p>

            {/* Evidence block */}
            {Array.isArray(x.evidence) && x.evidence.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Evidence
                </div>
                <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                  {x.evidence.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reasoning block */}
            {x.reasoning && (
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Reasoning
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  {x.reasoning}
                </div>
              </div>
            )}

            <div className="mt-3 text-xs text-indigo-700">
              Recommendation
            </div>

            <div className="text-sm">
              {x.recommendation}
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Confidence {percent(x.confidence)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}