# Activation Memory

Activation Memory is a project-scoped activation intelligence platform. Install the SDK, send explicit trial events, and inspect real incoming events and journeys in the dashboard. No data is seeded automatically.

## Quick start

```bash
npm install
npm run dev
```

1. Open `/signup` and create a project.
2. Copy its test project key.
3. Install and initialize the SDK:

```ts
import { ActivationMemory } from '@activationmemory/sdk';
const activation = new ActivationMemory({ projectKey: 'pk_test_…', apiUrl: 'http://localhost:3000/api' });
activation.identify(user.id);
activation.track('trial_started');
activation.page('/onboarding');
activation.setGoal('Create my first project');
```

4. Open `/dashboard` to see only events for that project.

## Product model

- `/` is the marketing site.
- `/dashboard` is project-gated and contains real incoming event data.
- `/events` lists every received SDK event.
- `/journeys` reconstructs user paths from ordered events.
- `/settings` exposes project keys and webhook configuration.

Supermemory is optional, server-side customer context for goals, objections, and support outcomes. Dodo is optional, server-side activation-gated checkout; payments are accepted only through signed webhook verification.

## Privacy

Track only explicit activation events. The SDK filters sensitive property names and does not capture passwords, arbitrary form contents, or session replay data.

## Honest limitations

This prototype uses JSON persistence and local browser project selection; it does not implement production authentication, team roles, or durable secret management. Supermemory and Dodo need environment credentials before their provider requests can be tested.

```bash
npm run lint
npm run typecheck
npm run build
```
