# DealMemory Web SDK

Browser and Node.js SDK for DealMemory. It records privacy-safe product milestone actions without blocking host application threads or capturing sensitive form values.

```bash
npm install ./packages/sdk
# or npm install @dealmemory/sdk
```

```ts
import { DealMemory } from '@dealmemory/sdk';

const dm = new DealMemory({
  projectKey: 'pk_live_your_project_key',
  apiUrl: 'https://api.your-domain.com/api'
});

dm.identify('user_123', { plan: 'trial' });
dm.track('trial_started');
dm.setGoal('Create my first project');
```

## API

`identify`, `track`, `page`, `setGoal`, `flush`, `reset`, and `destroy` are available alongside milestone helpers such as `trialStarted`, `integrationConnected`, `firstValueReached`, `checkoutStarted`, and `checkoutCompleted`.

By default, it records page views, clicks, and form submissions. It never captures form values, passwords, arbitrary page text, screen recordings, or session replay. Set `autoCapture: false` to use explicit events only. Add `data-agentlens-action="invite_team"` to give an interaction a meaningful name without exposing its text.
