export const sdkInstall = { npmPackage:'dealmemory-sdk-local', pypiPackage:'dealmemory-sdk-local', published:false, directHttp:true } as const;
export type SnippetRuntime = 'script' | 'fetch' | 'curl' | 'python';
export function installSnippet(runtime: SnippetRuntime, apiUrl: string, key = '<YOUR_PUBLIC_KEY>') {
  const origin = apiUrl.replace(/\/api\/?$/, '');
  if (runtime === 'script') {
    return `<!-- DealMemory 1-line Drop-in Snippet -->\n<script src="${origin}/v1.js" data-key="${key}" async></script>\n\n<!-- Optional: identify user or track actions in JavaScript -->\n<script>\n  // dealmemory.identify('sarah@acme.inc', { plan: 'growth' });\n  // dealmemory.track('integration_connected', { provider: 'Slack' });\n</script>`;
  }
  const event = { id: 'replace-with-a-unique-event-id', projectKey: key, name: 'trial_started', userId: 'user_123', anonymousId: 'anonymous_123', sessionId: 'session_123', occurredAt: '<ISO_TIMESTAMP>', properties: {} };
  if (runtime === 'python') return `import json, uuid\nfrom datetime import datetime, timezone\nfrom urllib.request import Request, urlopen\n\nevent = ${JSON.stringify(event,null,2)}\nevent['id'] = str(uuid.uuid4())\nevent['occurredAt'] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')\nrequest = Request('${apiUrl}/v1/events/batch',\n    data=json.dumps({'events': [event]}).encode(),\n    headers={'Content-Type': 'application/json', 'x-project-key': '${key}'})\nwith urlopen(request, timeout=5) as response:\n    print(response.read().decode())`;
  if (runtime === 'curl') return `curl '${apiUrl}/v1/events/batch' \\\n  -H 'Content-Type: application/json' \\\n  -H 'x-project-key: ${key}' \\\n  --data '${JSON.stringify({events:[event]},null,2)}'\n# Replace <ISO_TIMESTAMP> with the current UTC time, and use a unique id per event.\n# Reuse the same id and payload only when retrying that event.`;
  return `const event = ${JSON.stringify(event,null,2)};\nevent.id = crypto.randomUUID();\nevent.occurredAt = new Date().toISOString();\nconst response = await fetch('${apiUrl}/v1/events/batch', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json', 'x-project-key': '${key}' },\n  body: JSON.stringify({ events: [event] })\n});\nconsole.log(response.status, await response.json());`;
}
