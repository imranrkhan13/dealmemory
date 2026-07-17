import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Rocket,
} from "lucide-react";

interface EventItem {
    id: string;
    name: string;
    user: string;
    time: string;
}

interface Props {
    events: EventItem[];
}

function icon(name: string) {
    const n = name.toLowerCase();

    if (n.includes("failed")) {
        return (
            <div className="rounded-full bg-red-100 p-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
        );
    }

    if (
        n.includes("activated") ||
        n.includes("paid") ||
        n.includes("completed")
    ) {
        return (
            <div className="rounded-full bg-green-100 p-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
        );
    }

    if (n.includes("trial")) {
        return (
            <div className="rounded-full bg-indigo-100 p-2">
                <Rocket className="h-4 w-4 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="rounded-full bg-gray-100 p-2">
            <Activity className="h-4 w-4 text-gray-600" />
        </div>
    );
}

export default function LiveActivity({
    events,
}: Props) {
    return (
        <section className="mt-10 rounded-3xl border bg-white shadow-sm overflow-hidden">

            <div className="border-b p-6">

                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                    Live Feed
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                    Live Activity
                </h2>

                <p className="mt-2 text-gray-500">
                    Incoming product activity from your SDK.
                </p>

            </div>

            <div>

                {events.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        Waiting for events...
                    </div>
                )}

                {events.map((event) => (

                    <div
                        key={event.id}
                        className="flex items-start justify-between border-b px-6 py-5 last:border-b-0 hover:bg-gray-50 transition"
                    >

                        <div className="flex gap-4">

                            {icon(event.name)}

                            <div>

                                <p className="font-semibold">

                                    {event.name
                                        .replaceAll("_", " ")
                                        .replace(/\b\w/g, l => l.toUpperCase())}

                                </p>

                                <p className="mt-1 text-sm text-gray-500">

                                    {event.user}

                                </p>

                            </div>

                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">

                            <Clock3 size={15} />

                            {event.time}

                        </div>

                    </div>

                ))}

            </div>

        </section>
    );
}