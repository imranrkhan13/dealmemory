import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: ReactNode;
    color?: "indigo" | "green" | "amber" | "red";
}

const colors = {
    indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        border: "border-indigo-100",
    },
    green: {
        bg: "bg-green-50",
        text: "text-green-600",
        border: "border-green-100",
    },
    amber: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-100",
    },
    red: {
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-100",
    },
};

export default function MetricCard({
    title,
    value,
    subtitle,
    icon,
    color = "indigo",
}: MetricCardProps) {
    const theme = colors[color];

    return (
        <div
            className={`rounded-2xl border ${theme.border} bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
        >
            <div className="flex items-center justify-between">
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.bg}`}
                >
                    <span className={theme.text}>{icon}</span>
                </div>

                <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {title}
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                {value}
            </h2>

            {subtitle && (
                <p className="mt-2 text-sm text-gray-500">
                    {subtitle}
                </p>
            )}
        </div>
    );
}