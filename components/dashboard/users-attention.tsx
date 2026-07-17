import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Clock3,
    Rocket,
} from "lucide-react";

interface UserAttention {
    id: string;
    name: string;
    goal: string;
    state: string;
    blocker?: string;
    inactiveHours: number;
    recommendation: string;
}

interface Props {
    users: UserAttention[];
}

function health(state: string) {
    switch (state) {
        case "activated":
            return {
                label: "Healthy",
                score: 96,
                color: "text-green-600",
                bg: "bg-green-50",
            };

        case "stuck":
            return {
                label: "At Risk",
                score: 34,
                color: "text-red-600",
                bg: "bg-red-50",
            };

        default:
            return {
                label: "Progressing",
                score: 72,
                color: "text-amber-600",
                bg: "bg-amber-50",
            };
    }
}

export default function UsersAttention({
    users,
}: Props) {
    return (
        <section className="mt-10 rounded-3xl border bg-white shadow-sm overflow-hidden">

            <div className="border-b p-6">

                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                    Users
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                    Users Needing Attention
                </h2>

                <p className="mt-2 text-gray-500">
                    Prioritize the users who are most likely to abandon their trial.
                </p>

            </div>

            <div className="overflow-x-auto">

                <table className="min-w-full">

                    <thead className="bg-gray-50">

                        <tr className="text-left text-sm text-gray-500">

                            <th className="px-6 py-4">
                                User
                            </th>

                            <th className="px-6 py-4">
                                Goal
                            </th>

                            <th className="px-6 py-4">
                                Health
                            </th>

                            <th className="px-6 py-4">
                                Blocker
                            </th>

                            <th className="px-6 py-4">
                                Inactive
                            </th>

                            <th className="px-6 py-4">
                                Recommendation
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {users.map((user) => {

                            const h = health(user.state);

                            return (

                                <tr
                                    key={user.id}
                                    className="border-t hover:bg-gray-50 transition"
                                >

                                    <td className="px-6 py-5">

                                        <div>

                                            <p className="font-semibold">
                                                {user.name}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {user.id}
                                            </p>

                                        </div>

                                    </td>

                                    <td className="px-6 py-5">

                                        {user.goal}

                                    </td>

                                    <td className="px-6 py-5">

                                        <div
                                            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 ${h.bg}`}
                                        >

                                            {user.state === "activated" ? (
                                                <CheckCircle2
                                                    size={16}
                                                    className={h.color}
                                                />
                                            ) : user.state === "stuck" ? (
                                                <AlertTriangle
                                                    size={16}
                                                    className={h.color}
                                                />
                                            ) : (
                                                <Rocket
                                                    size={16}
                                                    className={h.color}
                                                />
                                            )}

                                            <span
                                                className={`font-semibold ${h.color}`}
                                            >
                                                {h.score}%
                                            </span>

                                        </div>

                                    </td>

                                    <td className="px-6 py-5">

                                        {user.blocker ?? "—"}

                                    </td>

                                    <td className="px-6 py-5">

                                        <div className="flex items-center gap-2">

                                            <Clock3 size={15} />

                                            {user.inactiveHours}h

                                        </div>

                                    </td>

                                    <td className="px-6 py-5">

                                        <div className="flex items-center gap-2 text-indigo-600 font-medium">

                                            {user.recommendation}

                                            <ArrowRight size={15} />

                                        </div>

                                    </td>

                                </tr>

                            );
                        })}

                    </tbody>

                </table>

            </div>

        </section>
    );
}