# agentlens

Browser SDK for AgentLens. It records privacy-safe product actions without blocking the host product.

```bash
npm install agentlens
```

```ts
import { AgentLens } from 'agentlens';

const agentlens = new AgentLens({
  projectKey: 'pk_live_your_project_key',
  apiUrl: 'https://api.your-domain.com/api'
});

agentlens.identify('user_123', { plan: 'trial' });
agentlens.track('trial_started');
agentlens.setGoal('Create my first project');
```

## API

`identify`, `track`, `page`, `setGoal`, `flush`, `reset`, and `destroy` are available alongside helpers such as `trialStarted`, `oauthFailed`, `integrationConnected`, `firstValueReached`, and `checkoutStarted`.

By default, it records page views, clicks, and form submissions. It never captures form values, passwords, arbitrary page text, screen recordings, or session replay. Set `autoCapture: false` to use explicit events only. Add `data-agentlens-action="invite_team"` to give an interaction a meaningful name without exposing its text.
