import {
    Sparkles,
    AlertTriangle,
    TrendingUp,
    ArrowRight,
} from "lucide-react";

interface CopilotSummaryProps {
    totalUsers: number;
    stuckUsers: number;
    activationRate: number;
    topBlocker: string;
}

export default function CopilotSummary({
    totalUsers,
    stuckUsers,
    activationRate,
    topBlocker,
}: CopilotSummaryProps) {
    const estimatedRecovery = stuckUsers * 49;

    return (
        <section className="mt-10 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-700 text-white shadow-2xl">

            <div className="p-8">

                <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
                        <Sparkles className="h-6 w-6" />
                    </div>

                    <div>
                        <p className="text-sm font-medium opacity-90">
                            DealMemory AI
                        </p>

                        <h2 className="text-3xl font-bold">
                            Activation Copilot
                        </h2>
                    </div>

                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-2">

                    <div>

                        <p className="text-lg leading-8 text-indigo-100">
                            I analyzed
                            <span className="mx-2 font-bold text-white">
                                {totalUsers}
                            </span>
                            trial users.

                            The biggest activation blocker is

                            <span className="mx-2 font-bold text-white">
                                {topBlocker}
                            </span>

                            affecting

                            <span className="mx-2 font-bold text-white">
                                {stuckUsers}
                            </span>

                            users.
                        </p>

                        <div className="mt-8 rounded-2xl bg-white/10 p-5 backdrop-blur">

                            <div className="flex items-center gap-2">

                                <TrendingUp className="h-5 w-5 text-green-300" />

                                <p className="font-semibold">
                                    Estimated Revenue Recovery
                                </p>

                            </div>

                            <p className="mt-3 text-4xl font-bold">

                                ${estimatedRecovery.toLocaleString()}

                            </p>

                            <p className="mt-2 text-sm text-indigo-100">

                                Potential monthly recovery by fixing this blocker.

                            </p>

                        </div>

                    </div>

                    <div className="space-y-4">

                        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

                            <div className="flex items-center gap-2">

                                <AlertTriangle className="h-5 w-5 text-amber-300" />

                                <p className="font-semibold">
                                    Biggest Blocker
                                </p>

                            </div>

                            <p className="mt-3 text-lg font-medium">
                                {topBlocker}
                            </p>

                        </div>

                        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

                            <p className="font-semibold">
                                Recommended Action
                            </p>

                            <p className="mt-3 text-indigo-100 leading-7">

                                Detect the failure immediately and guide the user
                                through reconnecting before asking them to upgrade.

                            </p>

                        </div>

                        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="font-semibold">
                                        Activation Rate
                                    </p>

                                    <p className="mt-2 text-3xl font-bold">

                                        {activationRate}%

                                    </p>

                                </div>

                                <ArrowRight className="h-8 w-8 opacity-70" />

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}