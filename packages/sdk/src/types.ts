export type ActivationProperties = Record<string, string | number | boolean | null>;

export type PrivacyOptions = {
  capturePageUrl?: boolean;
  captureReferrer?: boolean;
  captureQueryString?: boolean;
  blockedEvents?: string[];
};

export type ActivationOptions = {
  /**
   * Your `pk_live_...` project key. Optional: when omitted the SDK reads
   * `DEALMEMORY_API_KEY` from the environment automatically, so a normal `.env`
   * is the only setup required.
   */
  projectKey?: string;
  /**
   * Ingestion base URL (origin + `/api`). Optional: defaults to DealMemory's
   * hosted endpoint, override only for self-hosting.
   */
  apiUrl?: string;
  privacy?: PrivacyOptions;
  flushIntervalMs?: number;
  /** Capture page views, clicks, and form submissions without collecting form values. Defaults to true. */
  autoCapture?: boolean;
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
