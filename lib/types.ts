export type PlanStatus =
    | "trial"
    | "activated"
    | "checkoutstarted"
    | "paid"
    | "cancelled";

export type EventType =
    | "goalset"

    // Authentication
    | "signup_started"
    | "signup_completed"
    | "login"

    // Product
    | "page_viewed"
    | "page_left"
    | "feature_clicked"

    // Upload
    | "document_uploaded"
    | "upload_failed"

    // Summary
    | "summary_started"
    | "summary_generated"
    | "summary_viewed"
    | "summary_scrolled"

    // AI Chat
    | "chat_opened"
    | "chat_message_sent"

    // Export
    | "export_clicked"

    // Pricing
    | "pricing_opened"
    | "pricing_plan_selected"

    // Billing
    | "checkoutstarted"
    | "paymentcompleted"
    | "subscription_cancelled"

    // Legacy RepoMap
    | "githubconnectionstarted"
    | "githuboauthfailed"
    | "githubconnected"
    | "architecturemapgenerated";

export type MemoryCategory =
    | "goal"
    | "behavior"
    | "blocker"
    | "progress"
    | "engagement"
    | "pricing"
    | "churn"
    | "activation"
    | "setupstate"
    | "objection"
    | "purchasecontext";

export type TrialUser = {
    id: string;
    name: string;
    email?: string;

    planStatus: PlanStatus;

    goal?: string;

    activationMilestone: string;

    githubConnected: boolean;

    firstMapGenerated: boolean;

    currentBlocker?: string;

    checkoutUrl?: string;

    createdAt: string;

    updatedAt: string;
};

export type ProductEvent = {
    id: string;

    userId: string;

    type: EventType;

    detail: string;

    createdAt: string;
};

export type MemoryItem = {
    category: MemoryCategory;

    content: string;

    source: "usermessage" | "productevent";

    createdAt: string;
};

export type Store = {
    user: TrialUser;

    events: ProductEvent[];

    memories: MemoryItem[];
};