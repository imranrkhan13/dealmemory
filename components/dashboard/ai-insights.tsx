type Insight = {
    title: string;
    description: string;
    recommendation: string;
    confidence: number;
    type: "success" | "warning" | "danger" | "info";
};
export default function AIInsights({
    insights,
}: {
    insights: Insight[];
}) {

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
                        className={`rounded-xl border p-4 ${x.type === "success"
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

                        <div className="mt-3 text-xs text-indigo-700">

                            Recommendation

                        </div>

                        <div className="text-sm">

                            {x.recommendation}

                        </div>

                        <div className="mt-2 text-xs text-gray-500">

                            Confidence {(x.confidence * 100).toFixed(0)}%

                        </div>

                    </div>

                ))}

            </div>

        </div>

    )

}