'use client';

import JourneyTimeline from "./timeline";
import AIAnalysis from "./ai-analysis";

import {
    User,
    Clock,
    Flag,
    AlertTriangle,
} from "lucide-react";

type Props = {
    journey: any;
};

export default function JourneyReplay({
    journey,
}: Props) {

    return (

        <div className="space-y-6">

            {/* Header */}

            <div className="rounded-card border bg-white ">

                <div className="p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <h1 className="text-2xl font-bold">
                                User Journey Replay
                            </h1>

                            <p className="mt-1 text-gray-500">
                                AI explanation of this customer&apos;s complete journey.
                            </p>

                        </div>

                        <div className="rounded-lg bg-accent-tint px-4 py-2">

                            <p className="text-xs uppercase text-accent">
                                Journey State
                            </p>

                            <p className="font-bold capitalize">
                                {journey.state}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* User Info */}

            <div className="grid gap-4 md:grid-cols-4">

                <div className="rounded-lg border bg-white p-5">

                    <div className="flex items-center gap-3">

                        <User
                            size={18}
                            className="text-accent"
                        />

                        <div>

                            <p className="text-xs uppercase text-gray-400">
                                User
                            </p>

                            <p className="font-semibold">
                                {journey.userId}
                            </p>

                        </div>

                    </div>

                </div>

                <div className="rounded-lg border bg-white p-5">

                    <div className="flex items-center gap-3">

                        <Clock
                            size={18}
                            className="text-orange-600"
                        />

                        <div>

                            <p className="text-xs uppercase text-gray-400">
                                Inactive
                            </p>

                            <p className="font-semibold">
                                {journey.inactiveHours ?? 0} hrs
                            </p>

                        </div>

                    </div>

                </div>

                <div className="rounded-lg border bg-white p-5">

                    <div className="flex items-center gap-3">

                        <Flag
                            size={18}
                            className="text-green-600"
                        />

                        <div>

                            <p className="text-xs uppercase text-gray-400">
                                Goal
                            </p>

                            <p className="font-semibold">
                                {journey.goal ?? "Unknown"}
                            </p>

                        </div>

                    </div>

                </div>

                <div className="rounded-lg border bg-white p-5">

                    <div className="flex items-center gap-3">

                        <AlertTriangle
                            size={18}
                            className="text-danger"
                        />

                        <div>

                            <p className="text-xs uppercase text-gray-400">
                                Blocker
                            </p>

                            <p className="font-semibold">
                                {journey.blocker ?? "None"}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* Replay */}

            <div className="grid gap-6 xl:grid-cols-5">

                <div className="xl:col-span-3">

                    <JourneyTimeline
                        events={journey.events}
                    />

                </div>

                <div className="xl:col-span-2">

                    <AIAnalysis
                        journey={journey}
                    />

                </div>

            </div>

        </div>

    );

}