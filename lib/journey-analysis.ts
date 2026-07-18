export type JourneyAnalysis = {
    goal: string;
    summary: string;
    problem?: string;
    recommendation: string;
    confidence: number;
    health: "healthy" | "warning" | "critical";
};

const LABELS: Record<string, string> = {
    signup_started: "Signup Started",
    signup_completed: "Signup Completed",
    login: "Logged In",

    document_uploaded: "Uploaded Document",
    repository_connected: "Connected Repository",

    summary_generated: "Generated Summary",
    first_map_generated: "Generated First Map",

    summary_viewed: "Viewed Summary",

    chat_opened: "Opened AI Chat",

    pricing_opened: "Viewed Pricing",

    checkout_started: "Started Checkout",

    payment_completed: "Completed Payment",

    subscription_created: "Subscribed",

    subscription_cancelled: "Cancelled Subscription",

    export_clicked: "Exported",

    upload_failed: "Upload Failed",

    error_occurred: "Application Error",
};

export function getEventLabel(name: string) {
    return LABELS[name] ?? name.replace(/_/g, " ");
}

export function analyzeJourney(journey: any): JourneyAnalysis {
    const names = journey.events.map((e: any) => e.name);

    const hasUpload =
        names.includes("document_uploaded") ||
        names.includes("repository_connected");

    const hasSummary =
        names.includes("summary_generated") ||
        names.includes("first_map_generated");

    const hasPricing =
        names.includes("pricing_opened");

    const hasCheckout =
        names.includes("checkout_started");

    const hasPayment =
        names.includes("payment_completed") ||
        names.includes("subscription_created");

    const cancelled =
        names.includes("subscription_cancelled");

    const uploadFailed =
        names.includes("upload_failed");

    if (uploadFailed) {
        return {
            goal: "Upload content",
            summary: "User could not upload successfully.",
            problem: "Upload failed.",
            recommendation:
                "Retry automatically and show clearer upload errors.",
            confidence: 97,
            health: "critical",
        };
    }

    if (cancelled) {
        return {
            goal: "Use premium features",
            summary: "Customer cancelled subscription.",
            problem: "Churn detected.",
            recommendation:
                "Trigger win-back email and ask for cancellation feedback.",
            confidence: 96,
            health: "critical",
        };
    }

    if (hasPricing && !hasPayment) {
        return {
            goal: "Evaluate pricing",
            summary: "Reached pricing but never converted.",
            problem: "Pricing friction.",
            recommendation:
                "Delay pricing until users experience more product value.",
            confidence: 94,
            health: "warning",
        };
    }

    if (hasUpload && !hasSummary) {
        return {
            goal: "Generate first AI result",
            summary: "Uploaded content but never received AI output.",
            problem: "Activation failure.",
            recommendation:
                "Prioritize showing the first AI result immediately.",
            confidence: 93,
            health: "warning",
        };
    }

    if (hasPayment) {
        return {
            goal: "Become paying customer",
            summary: "Successful customer journey.",
            recommendation:
                "Offer advanced features and encourage referrals.",
            confidence: 99,
            health: "healthy",
        };
    }

    return {
        goal: "Explore product",
        summary: "Journey completed without major issues.",
        recommendation:
            "Keep monitoring engagement.",
        confidence: 85,
        health: "healthy",
    };
}