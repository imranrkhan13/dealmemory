/**
 * Single source of truth for "how do I install DealMemory?".
 *
 * Everything the user needs is: `npm install dealmemory` + ONE key in .env.
 * No project id, no apiUrl, no region, no init file.
 */

export type HostingEnv = Record<string, string | undefined>;

export type SetupSummary = {
  sdk: {
    npm: string;
    import: string;
  };
  envKey: string;
  envExample: string;
  eventsPost: string;
  projectKeyPlaceholder: string;
};

/**
 * The one key DealMemory accepts. Read from the environment by the SDK so the
 * user never has to hard-code it in source.
 */
export const DEALMEMORY_KEY_ENV = 'DEALMEMORY_KEY';

/** Backwards-compatible alias used by earlier snippets/docs. */
export const LEGACY_KEY_ENV = 'DEALMEMORY_PROJECT_KEY';

/** Where events are posted when the caller does not pass an apiUrl. */
export const DEFAULT_API_URL = 'https://dealmemory.vercel.app/api';

/**
 * Resolves the ingestion base URL (origin + /api) from the hosting environment.
 * Order: explicit override → public app url → localhost → hosted default.
 */
export function resolveHostUrl(env: HostingEnv = process.env as HostingEnv): string {
  const explicit = env.DEALMEMORY_API_URL ?? env.NEXT_PUBLIC_DEALMEMORY_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const origin = env.NEXT_PUBLIC_APP_URL ?? env.NEXTAUTH_URL;
  if (origin) return `${origin.replace(/\/$/, '')}/api`;

  return DEFAULT_API_URL;
}

/**
 * Resolves the project key from the environment so callers can do:
 *   const dm = new DealMemory({ projectKey: process.env.DEALMEMORY_KEY })
 * or, with the SDK's built-in defaulting, pass nothing at all.
 */
export function resolveProjectKey(env: HostingEnv = process.env as HostingEnv): string | undefined {
  return env[DEALMEMORY_KEY_ENV] ?? env[LEGACY_KEY_ENV] ?? undefined;
}

export function buildSetupSummary(env: HostingEnv = process.env as any): SetupSummary {
  const apiUrl = resolveHostUrl(env);
  return {
    sdk: {
      npm: 'npm install dealmemory',
      import: "import { DealMemory } from 'dealmemory'",
    },
    envKey: DEALMEMORY_KEY_ENV,
    envExample: `${DEALMEMORY_KEY_ENV}=pk_live_your_project_key`,
    eventsPost: `${apiUrl}/v1/events/batch`,
    projectKeyPlaceholder: 'pk_live_your_project_key',
  };
}

/**
 * The copy-paste quickstart: install, drop the key in .env, use the client.
 * This is the ONLY code block a new user should ever see.
 */
export function quickstartSnippet(env: HostingEnv = process.env as any): string {
  const { envKey } = buildSetupSummary(env);
  return `npm install dealmemory

# .env
${envKey}=pk_live_your_project_key

# app code
import { DealMemory } from 'dealmemory'
const dm = new DealMemory()
dm.identify('user_123')
dm.track('trial_started')`;
}

export function suggestKeyName(name = 'DealMemory', kind = 'public'): string {
  const prefix = kind === 'secret' ? 'sk_live' : 'pk_live';
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_/, '').slice(0, 32) || 'project';
  return `${prefix}_${slug}_`;
}

export function formatProjectKey(key: string): string {
  if (key.length <= 16) return key;
  return `${key.slice(0, 12)}_••••••••_`;
}
