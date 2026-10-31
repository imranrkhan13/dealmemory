# DealMemory Web SDK

Browser and Node.js SDK for DealMemory. It records privacy-safe product milestone actions without blocking host application threads or capturing sensitive form values.

```bash
npm install dealmemory
```

One key in your environment — no project id, no apiUrl, no config file:

```bash
# .env
DEALMEMORY_API_KEY=pk_live_your_project_key

# writes the tracking code into your app for you
npx dealmemory init
```

```ts
// zero-code path: the CLI already wrote this import into your entry file
import 'dealmemory/auto';

// or grab the shared client — it configures itself from the environment
import { DealMemory } from 'dealmemory';
const dm = new DealMemory(); // reads DEALMEMORY_API_KEY from the environment

dm.identify('user_123', { plan: 'trial' });
dm.track('trial_started');
dm.setGoal('Create my first project');
```

## API

`identify`, `track`, `page`, `setGoal`, `flush`, `reset`, and `destroy` are available alongside milestone helpers such as `trialStarted`, `integrationConnected`, `firstValueReached`, `checkoutStarted`, and `checkoutCompleted`.

By default, it records page views, clicks, and form submissions. It never captures form values, passwords, arbitrary page text, screen recordings, or session replay. Set `autoCapture: false` to use explicit events only. Add `data-agentlens-action="invite_team"` to give an interaction a meaningful name without exposing its text.
