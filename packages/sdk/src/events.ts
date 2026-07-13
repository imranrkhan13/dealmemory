import type { ActivationProperties } from './types.js';

export const activationEvents = {
  trialStarted: 'trial_started',
  checkoutStarted: 'checkout_started',
  checkoutCompleted: 'payment_completed',
  integrationConnected: 'repository_connected',
  integrationFailed: 'integration_connection_failed',
  firstValueReached: 'first_map_generated',
  subscriptionCreated: 'subscription_created',
  subscriptionCancelled: 'subscription_cancelled',
  apiError: 'api_error',
  teamInvited: 'team_invited'
} as const;

export type ActivationEventName = (typeof activationEvents)[keyof typeof activationEvents] | string;
export type EventProperties = ActivationProperties;
