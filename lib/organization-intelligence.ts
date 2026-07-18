export type OrganizationInsight = {
    title: string;
    description: string;
    recommendation: string;
    confidence: number;
    type: "success" | "warning" | "danger" | "info";
};

export function analyzeOrganization(journeys: any[]): OrganizationInsight[] {

    const insights: OrganizationInsight[] = [];

    if (!journeys.length) return insights;

    const eventCount: Record<string, number> = {};

    journeys.forEach(journey => {
        journey.events.forEach((event: any) => {
            eventCount[event.name] = (eventCount[event.name] || 0) + 1;
        });
    });

    const uploaded =
        eventCount.document_uploaded ??
        eventCount.repository_connected ??
        0;

    const summarized =
        eventCount.summary_generated ??
        eventCount.first_map_generated ??
        0;

    const pricing =
        eventCount.pricing_opened ?? 0;

    const checkout =
        eventCount.checkout_started ?? 0;

    const paid =
        eventCount.payment_completed ??
        eventCount.subscription_created ??
        0;

    const chat =
        eventCount.chat_opened ?? 0;

    const cancelled =
        eventCount.subscription_cancelled ?? 0;

    if (uploaded > summarized) {

        insights.push({
            type: "warning",
            title: "Users disappear after upload",
            description:
                `${uploaded - summarized} uploaded content but never reached AI.`,
            recommendation:
                "Show the first AI result immediately after upload.",
            confidence: 0.93
        });

    }

    if (pricing > checkout) {

        insights.push({
            type: "danger",
            title: "Pricing page causes drop-off",
            description:
                `${pricing - checkout} users left after viewing pricing.`,
            recommendation:
                "Delay pricing or improve pricing clarity.",
            confidence: 0.91
        });

    }

    if (checkout > paid) {

        insights.push({
            type: "danger",
            title: "Checkout abandonment",
            description:
                `${checkout - paid} users started checkout but never paid.`,
            recommendation:
                "Simplify checkout and reduce required steps.",
            confidence: 0.95
        });

    }

    if (chat > 0) {

        insights.push({
            type: "success",
            title: "AI Chat is being used",
            description:
                `${chat} chat sessions were started.`,
            recommendation:
                "Encourage users to open AI Chat earlier.",
            confidence: 0.82
        });

    }

    if (cancelled > 0) {

        insights.push({
            type: "danger",
            title: "Subscription cancellations detected",
            description:
                `${cancelled} users cancelled subscriptions.`,
            recommendation:
                "Trigger win-back emails automatically.",
            confidence: 0.94
        });

    }

    return insights;

}