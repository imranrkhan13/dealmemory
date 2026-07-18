'use client';

import {
    CheckCircle2,
    FileText,
    Upload,
    CreditCard,
    MessageCircle,
    AlertTriangle,
    XCircle,
    Sparkles,
    FolderGit2,
    LogIn,
    UserPlus,
} from 'lucide-react';

import { getEventLabel } from '@/lib/journey-analysis';

type Props = {
    events: any[];
};

const iconMap: Record<string, any> = {
    signup_started: UserPlus,
    signup_completed: CheckCircle2,
    login: LogIn,

    document_uploaded: Upload,
    repository_connected: FolderGit2,

    summary_generated: Sparkles,
    first_map_generated: Sparkles,
    summary_viewed: FileText,

    chat_opened: MessageCircle,

    pricing_opened: CreditCard,
    checkout_started: CreditCard,
    payment_completed: CheckCircle2,
    subscription_created: CheckCircle2,

    subscription_cancelled: XCircle,

    upload_failed: AlertTriangle,
    error_occurred: AlertTriangle,

    export_clicked: FileText,
};

const colorMap: Record<string, string> = {
    signup_started: "text-blue-600 bg-blue-50",
    signup_completed: "text-green-600 bg-green-50",
    login: "text-blue-600 bg-blue-50",

    document_uploaded: "text-indigo-600 bg-indigo-50",
    repository_connected: "text-indigo-600 bg-indigo-50",

    summary_generated: "text-violet-600 bg-violet-50",
    first_map_generated: "text-violet-600 bg-violet-50",
    summary_viewed: "text-violet-600 bg-violet-50",

    chat_opened: "text-cyan-600 bg-cyan-50",

    pricing_opened: "text-orange-600 bg-orange-50",
    checkout_started: "text-orange-600 bg-orange-50",

    payment_completed: "text-green-600 bg-green-50",
    subscription_created: "text-green-600 bg-green-50",

    subscription_cancelled: "text-red-600 bg-red-50",

    upload_failed: "text-red-600 bg-red-50",
    error_occurred: "text-red-600 bg-red-50",

    export_clicked: "text-emerald-600 bg-emerald-50",
};

export default function JourneyTimeline({ events }: Props) {

    const sorted = [...events].sort(
        (a, b) =>
            new Date(a.occurredAt).getTime() -
            new Date(b.occurredAt).getTime()
    );

    return (
        <div className="rounded-2xl border bg-white shadow-sm">

            <div className="border-b px-6 py-4">

                <h2 className="text-lg font-bold">
                    Journey Timeline
                </h2>

                <p className="text-sm text-gray-500">
                    Every action performed by this user.
                </p>

            </div>

            <div className="p-6">

                <div className="relative">

                    {sorted.map((event, index) => {

                        const Icon =
                            iconMap[event.name] ?? CheckCircle2;

                        const colors =
                            colorMap[event.name] ??
                            "text-gray-600 bg-gray-100";

                        return (

                            <div
                                key={event.id ?? index}
                                className="relative flex gap-4 pb-8"
                            >

                                {index !== sorted.length - 1 && (
                                    <div className="absolute left-5 top-12 h-full w-0.5 bg-gray-200" />
                                )}

                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${colors}`}
                                >
                                    <Icon size={18} />
                                </div>

                                <div className="flex-1">

                                    <div className="flex items-center justify-between">

                                        <h3 className="font-semibold text-gray-900">
                                            {getEventLabel(event.name)}
                                        </h3>

                                        <span className="text-xs text-gray-400">
                                            {event.occurredAt
                                                ? new Date(
                                                    event.occurredAt
                                                ).toLocaleString()
                                                : ""}
                                        </span>

                                    </div>

                                    {event.properties && (
                                        <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-600">

                                            {JSON.stringify(event.properties, null, 2)}

                                        </pre>
                                    )}

                                </div>

                            </div>

                        );

                    })}

                </div>

            </div>

        </div>
    );
}