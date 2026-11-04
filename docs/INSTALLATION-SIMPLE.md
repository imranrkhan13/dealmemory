# DealMemory Installation - Super Simple

## 3-Step Setup

That's it. Just 3 steps and DealMemory tracks everything automatically.

```bash
# Step 1: Install the package
npm install dealmemory

# Step 2: Run the installer (adds tracking code to your app)
npx dealmemory install

# Step 3: Add your API key to .env
DEALMEMORY_API_KEY=pk_live_...
```

**Restart your dev server and you're done!**

---

## What Gets Tracked Automatically

Once installed, DealMemory tracks **everything** without any additional code:

- ✅ **Page views** - Every page load
- ✅ **All clicks** - Every button, link, and interactive element
- ✅ **Form submissions** - All forms with field counts
- ✅ **Scroll depth** - How far users scroll (25%, 50%, 75%, 90%, 100%)
- ✅ **Input changes** - When users type (debounced, no sensitive data)
- ✅ **Errors** - JavaScript errors with stack traces
- ✅ **Time on page** - How long users spend on each page

---

## Getting Your API Key

1. Go to http://localhost:3000/signup (create an account)
2. Go to Settings → API Keys
3. Click "Generate New Key"
4. Copy the key (starts with `pk_live_...`)
5. Paste it in your `.env` file

---

## What the Installer Does

The `npx dealmemory install` command automatically:

1. ✅ Adds `DEALMEMORY_API_KEY=` to your `.env` file
2. ✅ Detects your framework (Next.js, React, vanilla)
3. ✅ Writes the tracking import to your entry file
4. ✅ Sets up everything for zero-config tracking

**No manual code changes needed.**

---

## Example: What Gets Added

**To your `.env`**:
```env
DEALMEMORY_API_KEY=pk_live_...
```

**To your app** (Next.js App Router):
```typescript
// app/dealmemory.client.ts (created automatically)
'use client';
import 'dealmemory/auto';

// app/layout.tsx (import added automatically)
import './dealmemory.client';
```

**That's all the code you need.**

---

## Privacy & Security

DealMemory automatically protects sensitive data:

- ❌ Passwords are never tracked
- ❌ Tokens and secrets are stripped
- ❌ Credit card numbers are ignored
- ❌ Keystrokes are not recorded
- ✅ Only interaction patterns are captured

---

## Testing Your Setup

After installation, visit your app and check the dashboard at http://localhost:3000/overview

You should see:
- Recent events appearing in real-time
- User journeys being reconstructed
- Scroll depth data
- Click heatmaps

---

## Custom Events (Optional)

If you want to track product-specific events:

```typescript
import { track } from 'dealmemory/auto';

track('trial_started', { plan: 'pro' });
track('feature_used', { feature: 'export_pdf' });
```

But you don't have to - automatic tracking covers everything!

---

## Troubleshooting

**Events not appearing?**
1. Check your API key is correct in `.env`
2. Restart your dev server
3. Check the browser console for errors

**401 Invalid key error?**
- Your key doesn't exist in the database
- Generate a new key in Settings

**Want to stop tracking?**
- Remove the import line from your entry file
- Or set `DEALMEMORY_API_KEY=` (empty) in `.env`

---

## Need Help?

- Full documentation: [HOW-DEALMEMORY-WORKS.md](../HOW-DEALMEMORY-WORKS.md)
- API reference: [API-REFERENCE.md](API-REFERENCE.md)
- SDK guide: [SDK-GUIDE.md](SDK-GUIDE.md)

---

**That's the entire setup. 3 steps, 1 environment variable, automatic tracking of everything.**
