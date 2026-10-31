/**
 * `import 'dealmemory/auto'` — zero-code setup.
 *
 * The whole integration is:
 *
 *   1. npm install dealmemory
 *   2. DEALMEMORY_API_KEY=pk_live_...   (in .env)
 *   3. import 'dealmemory/auto'          (written into your app by `npx dealmemory init`)
 *
 * No client object, no project id, no apiUrl, no config file. The key is read
 * from the environment and the shared client starts itself.
 */
import { AgentLens, KEY_ENV_VARS, readEnv } from './client.js';

type Host = typeof globalThis & {
  /** Set by `npx dealmemory init` for static/HTML apps that cannot read .env. */
  DEALMEMORY_API_KEY?: string;
  __DEALMEMORY_CLIENT__?: AgentLens;
};

const MISSING_KEY_MESSAGE =
  'DealMemory: no API key found. Add DEALMEMORY_API_KEY=pk_live_... to your .env, then run `npx dealmemory init` to write the tracking code into your app.';

/** Resolution order: injected global → injected meta tag → environment. */
function readKey(): string | undefined {
  const g = globalThis as Host;

  const injected = typeof g.DEALMEMORY_API_KEY === 'string' ? g.DEALMEMORY_API_KEY.trim() : '';
  if (injected) return injected;

  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="dealmemory-api-key"]');
    const content = meta?.getAttribute('content')?.trim();
    if (content) return content;
  }

  return readEnv(...KEY_ENV_VARS);
}

let warned = false;
function warnOnce(message: string) {
  if (warned) return;
  warned = true;
  console.warn(`[DealMemory] ${message}`);
}

/** True once a key is resolvable — useful to skip work when tracking is off. */
export function isDealMemoryConfigured(): boolean {
  return Boolean(readKey());
}

/**
 * The shared, auto-created client. Every call after the first returns the same
 * instance, so tracking works from anywhere in the app without wiring state.
 */
export function getDealMemory(): AgentLens {
  const g = globalThis as Host;
  if (!g.__DEALMEMORY_CLIENT__) {
    const key = readKey();
    if (!key) {
      warnOnce(MISSING_KEY_MESSAGE);
      throw new Error(MISSING_KEY_MESSAGE);
    }
    g.__DEALMEMORY_CLIENT__ = new AgentLens({ projectKey: key });
  }
  return g.__DEALMEMORY_CLIENT__;
}

/**
 * Runs an operation against the shared client, never throwing into host code.
 * Tracking failures must never break the application using DealMemory.
 */
function safely<T>(run: (dm: AgentLens) => T, fallback: T): T {
  try {
    return run(getDealMemory());
  } catch {
    return fallback;
  }
}

export function track(name: string, properties: Record<string, string | number | boolean | null> = {}): void {
  safely((dm) => dm.track(name, properties), undefined);
}

export function identify(userId: string, traits: Record<string, string | number | boolean | null> = {}): void {
  safely((dm) => dm.identify(userId, traits), undefined);
}

export function setGoal(goal: string): void {
  safely((dm) => dm.setGoal(goal), undefined);
}

export function page(name?: string): void {
  safely((dm) => dm.page(name), undefined);
}

export function reset(): void {
  safely((dm) => dm.reset(), undefined);
}

/** Flush queued events now instead of waiting for the interval. */
export async function flush(): Promise<void> {
  await safely(async (dm) => dm.flush(), Promise.resolve());
}

// Side effect: starting the client on import is the entire integration.
try {
  getDealMemory();
} catch {
  // Missing key already warned once; the host app keeps running.
}
