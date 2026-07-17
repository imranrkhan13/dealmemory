# activationmemory

Browser SDK for DealMemory. It batches explicit activation events without blocking the host product.

```bash
npm install activationmemory
```

```ts
import { ActivationMemory } from 'activationmemory';

const activation = new ActivationMemory({
  projectKey: 'pk_test_your_project_key',
  apiUrl: 'https://api.your-domain.com/api'
});

activation.identify('user_123', { plan: 'trial' });
activation.track('trial_started');
activation.setGoal('Create my first project');
```

## API

`identify`, `track`, `page`, `setGoal`, `flush`, `reset`, and `destroy` are available alongside helpers such as `trialStarted`, `oauthFailed`, `integrationConnected`, `firstValueReached`, and `checkoutStarted`.

The SDK captures only explicit events plus optional page/referrer metadata. It filters sensitive property names and supports event/page/referrer privacy settings.
