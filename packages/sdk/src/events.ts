import type { ActivationProperties } from './types.js';

export const activationEvents = {
  // Authentication
  signupStarted: "signup_started",
  signupCompleted: "signup_completed",
  login: "login",

  // Trial
  trialStarted: "trial_started",

  // Upload
  documentUploaded: "document_uploaded",
  uploadFailed: "upload_failed",

  // Summary
  summaryStarted: "summary_started",
  summaryGenerated: "summary_generated",
  summaryViewed: "summary_viewed",
  summaryScrolled: "summary_scrolled",

  // AI Chat
  chatOpened: "chat_opened",
  chatMessageSent: "chat_message_sent",

  // Export
  exportClicked: "export_clicked",

  // Pricing
  pricingOpened: "pricing_opened",
  pricingPlanSelected: "pricing_plan_selected",

  // Billing
  checkoutStarted: "checkout_started",
  checkoutCompleted: "payment_completed",
  subscriptionCreated: "subscription_created",
  subscriptionCancelled: "subscription_cancelled",

  // Product
  featureClicked: "feature_clicked",
  pageViewed: "page_viewed",
  pageLeft: "page_left",
  sessionReturned: "session_returned",

  // Generic
  errorOccurred: "error_occurred",
  apiError: "api_error",
  teamInvited: "team_invited",

  // Legacy (keep compatibility)
  integrationConnected: "repository_connected",
  integrationFailed: "repository_connection_failed",
  firstValueReached: "first_map_generated",
  goalSet: "goal_set"
} as const;

export type ActivationEventName = (typeof activationEvents)[keyof typeof activationEvents] | string;
export type EventProperties = ActivationProperties;
