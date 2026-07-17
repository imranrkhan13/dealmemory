import {
    Flag,
    Link2,
    Rocket,
    CreditCard,
    CheckCircle2,
} from "lucide-react";

interface ActivationFunnelProps {
    trial: number;
    connected: number;
    activated: number;
    checkout: number;
    paid: number;
}

const steps = [
    {
        title: "Trial Started",
        key: "trial",
        icon: Flag,
        color: "bg-blue-500",
    },
    {
        title: "Integration Connected",
        key: "connected",
        icon: Link2,
        color: "bg-indigo-500",
    },
    {
        title: "Activated",
        key: "activated",
        icon: Rocket,
        color: "bg-violet-500",
    },
    {
        title: "Checkout Started",
        key: "checkout",
        icon: CreditCard,
        color: "bg-orange-500",
    },
    {
        title: "Paid",
        key: "paid",
        icon: CheckCircle2,
        color: "bg-green-500",
    },
];

export default function ActivationFunnel({
    trial,
    connected,
    activated,
    checkout,
    paid,
}: ActivationFunnelProps) {
    const values = {
        trial,
        connected,
        activated,
        checkout,
        paid,
    };

    const max = Math.max(trial, 1);

    return (
        <section className="mt-10 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

            <div className="mb-8">

                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                    Funnel
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                    Activation Funnel
                </h2>

                <p className="mt-2 text-gray-500">
                    See where trial users lose momentum before becoming customers.
                </p>

            </div>

            <div className="space-y-6">

                {steps.map((step) => {

                    const value =
                        values[step.key as keyof typeof values];

                    const percent = Math.round(
                        (value / max) * 100
                    );

                    const Icon = step.icon;

                    return (
                        <div key={step.key}>

                            <div className="mb-2 flex items-center justify-between">

                                <div className="flex items-center gap-3">

                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${step.color}`}
                                    >
                                        <Icon size={18} />
                                    </div>

                                    <div>

                                        <p className="font-semibold">
                                            {step.title}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {percent}% conversion
                                        </p>

                                    </div>

                                </div>

                                <div className="text-right">

                                    <p className="text-2xl font-bold">
                                        {value}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        users
                                    </p>

                                </div>

                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                                <div
                                    className={`h-full rounded-full ${step.color}`}
                                    style={{
                                        width: `${percent}%`,
                                    }}
                                />

                            </div>

                        </div>
                    );
                })}

            </div>

        </section>
    );
}