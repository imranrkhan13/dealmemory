export type ActivationProperties = Record<string, string | number | boolean | null>;

export type PrivacyOptions = {
  capturePageUrl?: boolean;
  captureReferrer?: boolean;
  blockedEvents?: string[];
};

export type ActivationOptions = {
  projectKey: string;
  apiUrl: string;
  privacy?: PrivacyOptions;
  flushIntervalMs?: number;
};

export type QueuedEvent = {
  id: string;
  projectKey: string;
  name: string;
  userId?: string;
  anonymousId: string;
  sessionId: string;
  occurredAt: string;
  url?: string;
  referrer?: string;
  properties: ActivationProperties;
};
