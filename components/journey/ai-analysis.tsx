'use client';

import {
    Brain,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Target,
    Sparkles,
} from "lucide-react";

import { analyzeJourney } from "@/lib/journey-analysis";

type Props = {
    journey: any;
};

export default function AIAnalysis({ journey }: Props) {

    const analysis = analyzeJourney(journey);

    const badgeColor =
        analysis.health === "healthy"
            ? "bg-green-100 text-green-700"
            : analysis.health === "warning"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700";

    const Icon =
        analysis.health === "healthy"
            ? CheckCircle2
            : analysis.health === "warning"
                ? AlertTriangle
                : XCircle;

    return (

        <div className="rounded-2xl border bg-white shadow-sm">

            <div className="border-b px-6 py-4 flex items-center gap-3">

                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">

                    <Brain
                        size={20}
                        className="text-indigo-600"
                    />

                </div>

                <div>

                    <h2 className="text-lg font-bold">
                        DealMemory AI Analysis
                    </h2>

                    <p className="text-sm text-gray-500">
                        AI explanation of this customer's journey
                    </p>

                </div>

            </div>

            <div className="space-y-6 p-6">

                <div>

                    <p className="text-xs uppercase font-semibold tracking-wider text-gray-500">
                        User Goal
                    </p>

                    <div className="mt-2 flex items-center gap-2">

                        <Target
                            size={18}
                            className="text-indigo-600"
                        />

                        <span className="font-semibold">
                            {analysis.goal}
                        </span>

                    </div>

                </div>

                <div>

                    <p className="text-xs uppercase font-semibold tracking-wider text-gray-500">
                        AI Summary
                    </p>

                    <p className="mt-2 text-gray-700 leading-relaxed">
                        {analysis.summary}
                    </p>

                </div>

                {analysis.problem && (

                    <div>

                        <p className="text-xs uppercase font-semibold tracking-wider text-gray-500">
                            Problem Detected
                        </p>

                        <div className="mt-2 rounded-xl border border-red-100 bg-red-50 p-4">

                            <p className="font-medium text-red-700">
                                {analysis.problem}
                            </p>

                        </div>

                    </div>

                )}

                <div>

                    <p className="text-xs uppercase font-semibold tracking-wider text-gray-500">
                        AI Recommendation
                    </p>

                    <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50 p-4">

                        <div className="flex gap-3">

                            <Sparkles
                                className="mt-0.5 text-indigo-600"
                                size={18}
                            />

                            <p className="leading-relaxed text-indigo-900">
                                {analysis.recommendation}
                            </p>

                        </div>

                    </div>

                </div>

                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">

                    <div className="flex items-center gap-2">

                        <Icon
                            size={18}
                            className={
                                analysis.health === "healthy"
                                    ? "text-green-600"
                                    : analysis.health === "warning"
                                        ? "text-yellow-600"
                                        : "text-red-600"
                            }
                        />

                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
                            {analysis.health.toUpperCase()}
                        </span>

                    </div>

                    <div className="text-right">

                        <p className="text-xs uppercase text-gray-400">
                            Confidence
                        </p>

                        <p className="text-xl font-bold">
                            {analysis.confidence}%
                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

}