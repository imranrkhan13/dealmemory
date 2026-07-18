'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';

export default function Journeys() {
    const [journeys, setJourneys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const project = JSON.parse(
            localStorage.getItem('activation-memory-project') ?? 'null'
        );

        if (!project) {
            setLoading(false);
            return;
        }

        fetch(`/api/v1/journeys?projectKey=${project.testKey}`)
            .then(async (r) => {
                if (!r.ok) {
                    const text = await r.text();
                    console.error("Journeys API failed:", r.status, text);
                    return { journeys: [] };
                }

                return r.json();
            })
            .then((data) => {
                setJourneys(data.journeys ?? []);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setJourneys([]);
                setLoading(false);
            });
    }, []);

    return (
        <AppShell>
            <ProjectGate>
                <main className="mx-auto max-w-7xl px-6 py-10">

                    <p className="text-sm font-semibold text-[#4F46E5]">
                        DealMemory Intelligence
                    </p>

                    <h1 className="mt-2 text-4xl font-bold">
                        AI Product Analytics
                    </h1>

                    <p className="mt-3 text-gray-500">
                        Understand why users activate, struggle, convert and churn.
                    </p>

                    {loading && (
                        <div className="mt-10">
                            Loading journeys...
                        </div>
                    )}

                    {!loading && journeys.length === 0 && (
                        <div className="mt-10 rounded-xl border p-10 bg-white">
                            No activation events yet.
                        </div>
                    )}

                    {!loading && journeys.length > 0 && (

                        <div className="mt-10 grid gap-6">

                            {journeys.map((journey) => (

                                <Link
                                    key={journey.userId}
                                    href={`/journeys/${journey.userId}`}
                                >

                                    <div className="rounded-xl border bg-white p-6 hover:shadow-lg transition">

                                        <div className="flex justify-between">

                                            <div>

                                                <h2 className="text-lg font-semibold">
                                                    {journey.userId}
                                                </h2>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    {journey.events.length} events
                                                </p>

                                            </div>

                                            <div className="text-right">

                                                <div className="text-sm font-medium">
                                                    {journey.currentState}
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    {journey.inactiveHours} hrs inactive
                                                </div>

                                            </div>

                                        </div>

                                        <div className="mt-5">

                                            <div className="font-medium">
                                                Current Blocker
                                            </div>

                                            <div className="text-gray-600 mt-1">
                                                {journey.blocker ?? "None"}
                                            </div>

                                        </div>

                                        <div className="mt-5">

                                            <div className="font-medium">
                                                AI Recommendation
                                            </div>

                                            <div className="text-gray-600 mt-1">
                                                {journey.recommendation ?? "Everything looks healthy."}
                                            </div>

                                        </div>

                                        {journey.memories?.length > 0 && (

                                            <div className="mt-5">

                                                <div className="font-medium">
                                                    Supermemory
                                                </div>

                                                <ul className="mt-2 list-disc ml-5 text-sm text-gray-600">

                                                    {journey.memories.slice(0, 3).map((m: any, i: number) => (
                                                        <li key={i}>
                                                            <div className="font-medium">
                                                                {m.title}
                                                            </div>

                                                            <div className="text-xs text-gray-500">
                                                                {m.chunks?.[0]?.text ??
                                                                    m.chunks?.[0]?.content ??
                                                                    "No content"}
                                                            </div>
                                                        </li>
                                                    ))}

                                                </ul>

                                            </div>

                                        )}

                                        {journey.insights?.length > 0 && (

                                            <div className="mt-5">

                                                <div className="font-medium">
                                                    AI Insights
                                                </div>

                                                <div className="mt-3 space-y-3">

                                                    {journey.insights.map((insight: any, index: number) => (

                                                        <div
                                                            key={index}
                                                            className="rounded-lg bg-indigo-50 p-3"
                                                        >

                                                            <div className="font-semibold">
                                                                {insight.title}
                                                            </div>

                                                            <div className="text-sm mt-1">
                                                                {insight.description}
                                                            </div>

                                                            <div className="text-xs mt-2 text-indigo-700">
                                                                Recommendation: {insight.recommendation}
                                                            </div>

                                                        </div>

                                                    ))}

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                </Link>

                            ))}

                        </div>

                    )}

                </main>
            </ProjectGate>
        </AppShell>
    );
}