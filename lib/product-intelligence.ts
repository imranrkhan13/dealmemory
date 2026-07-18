import { Journey } from "./intelligence";

export type ProductInsight = {
    type: "success" | "warning" | "danger" | "info";
    title: string;
    description: string;
    recommendation: string;
    confidence: number;
};

export function analyzeJourney(
    journey: Journey,
    memories: string[]
): ProductInsight[] {

    const insights: ProductInsight[] = [];

    const hasUploadFailure = journey.events.some(
        e => e.name === "upload_failed"
    );

    const viewedSummary = journey.events.some(
        e => e.name === "summary_viewed"
    );

    const openedPricing = journey.events.some(
        e => e.name === "pricing_opened"
    );

    const cancelled = journey.events.some(
        e => e.name === "subscription_cancelled"
    );

    const activated = journey.events.some(
        e => e.name === "first_map_generated"
    );

    if (activated) {
        insights.push({
            type: "success",
            title: "Activation Completed",
            description:
                "The user successfully reached the activation milestone.",
            recommendation:
                "Encourage upgrading while engagement is high.",
            confidence: 0.98,
        });
    }

    if (hasUploadFailure) {
        insights.push({
            type: "danger",
            title: "Upload Friction",
            description:
                "The user experienced upload failures.",
            recommendation:
                "Improve upload reliability or add retry guidance.",
            confidence: 0.95,
        });
    }

    if (viewedSummary) {
        insights.push({
            type: "warning",
            title: "Heavy Summary Usage",
            description:
                "The user spent significant time on summaries.",
            recommendation:
                "Improve summary quality and promote AI Chat.",
            confidence: 0.82,
        });
    }

    if (openedPricing && !cancelled) {
        insights.push({
            type: "info",
            title: "Purchase Intent",
            description:
                "The user explored pricing.",
            recommendation:
                "Offer a discount or highlight premium features.",
            confidence: 0.74,
        });
    }

    if (cancelled) {
        insights.push({
            type: "danger",
            title: "Customer Churn",
            description:
                "The user cancelled the subscription.",
            recommendation:
                "Launch a win-back campaign and investigate churn reasons.",
            confidence: 0.93,
        });
    }

    if (memories.length) {
        insights.push({
            type: "info",
            title: "Memory Context",
            description:
                memories.slice(0, 2).join(" "),
            recommendation:
                "Use stored memories to personalize onboarding.",
            confidence: 1.0,
        });
    }

    return insights;
}