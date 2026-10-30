export const sdkInstall = { npmPackage: 'dealmemory-sdk-local', pypiPackage: 'dealmemory-sdk-local', published: false, directHttp: true } as const;
export type SnippetRuntime = 'curl' | 'fetch' | 'python';

export function installSnippet(runtime: SnippetRuntime, apiUrl: string, key = '<YOUR_PROJECT_KEY>') {
  const event = {
    id: 'replace-with-a-unique-uuid',
    projectKey: key,
    name: 'user_signed_up',
    userId: 'sarah@acme.inc',
    anonymousId: 'anon_123',
    sessionId: 'sess_123',
    occurredAt: new Date().toISOString(),
    properties: { plan: 'growth', teamSize: 12 },
  };

  if (runtime === 'curl') {
    return `# 1. Send live product events via standard HTTP cURL
curl -X POST '${apiUrl}/v1/events/batch' \\
  -H 'Content-Type: application/json' \\
  -H 'x-project-key: ${key}' \\
  -d '${JSON.stringify({ events: [event] }, null, 2)}'`;
  }

  if (runtime === 'fetch') {
    return `// Send live product events via standard JavaScript fetch (Browser, Node.js, Next.js)
const event = {
  id: crypto.randomUUID(),
  projectKey: '${key}',
  name: 'user_signed_up',
  userId: 'sarah@acme.inc',
  anonymousId: 'anon_123',
  sessionId: 'sess_123',
  occurredAt: new Date().toISOString(),
  properties: { plan: 'growth', teamSize: 12 }
};

const res = await fetch('${apiUrl}/v1/events/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-project-key': '${key}'
  },
  body: JSON.stringify({ events: [event] })
});

console.log('DealMemory Ingestion:', res.status, await res.json());`;
  }

  return `# Send live product events via standard Python urllib
import json, uuid
from datetime import datetime, timezone
from urllib.request import Request, urlopen

event = ${JSON.stringify(event, null, 2)}
event['id'] = str(uuid.uuid4())
event['occurredAt'] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

req = Request(
    '${apiUrl}/v1/events/batch',
    data=json.dumps({'events': [event]}).encode(),
    headers={'Content-Type': 'application/json', 'x-project-key': '${key}'}
)
with urlopen(req, timeout=5) as res:
    print('DealMemory Ingestion:', res.status, res.read().decode())`;
}
