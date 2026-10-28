#!/usr/bin/env node

const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => mem.get(k) ?? null,
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};
globalThis.window = globalThis;
globalThis.location = { href: 'http://127.0.0.1:3005/app' };
globalThis.document = { referrer: 'http://127.0.0.1:3005/start', title: 'Node Test App' };

const args = process.argv.slice(2);
const keyIdx = args.indexOf('--project-key');
const urlIdx = args.indexOf('--api-url');
if (keyIdx === -1 || urlIdx === -1) {
  console.error('Usage: node send-node-events.mjs --project-key <key> --api-url <url>');
  process.exit(1);
}
const projectKey = args[keyIdx + 1];
const apiUrl = args[urlIdx + 1];

const { AgentLens } = await import('../packages/sdk/dist/index.js');
const client = new AgentLens({
  projectKey,
  apiUrl,
  autoCapture: false,
});

client.identify('user_alice_node');
client.trialStarted();
client.firstValueReached();

const qKey = `agentlens:${projectKey}:queue`;
for (let i = 0; i < 30; i++) {
  const q = JSON.parse(mem.get(qKey) || '[]');
  if (q.length === 0) break;
  await client.flush();
  await new Promise((r) => setTimeout(r, 150));
}

console.log(`[Node Client] Sent events for user_alice_node using projectKey prefix: ${projectKey.split('_').slice(0, 3).join('_')}`);
process.exit(0);
