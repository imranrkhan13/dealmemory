#!/usr/bin/env tsx

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('🧪 Testing public/v1.js standalone browser script bundle...');

const code = readFileSync(resolve(process.cwd(), 'public/v1.js'), 'utf8');
assert(code.length > 500, 'v1.js must not be empty');

// Create mock browser DOM environment
const sentBatches: any[] = [];
const mockLocalStorage: Record<string, string> = {};

const mockDocument: any = {
  currentScript: {
    getAttribute(name: string) {
      if (name === 'data-key') return 'pk_live_test_1234567890abcdef';
      if (name === 'data-host') return 'https://dealmemory.vercel.app';
      return null;
    },
    src: 'https://dealmemory.vercel.app/v1.js',
  },
  title: 'Test App Home',
  referrer: 'https://google.com',
  visibilityState: 'visible',
  addEventListener() {},
};

const mockWindow: any = {
  location: {
    href: 'https://example.com/dashboard',
    origin: 'https://example.com',
  },
  localStorage: {
    getItem(k: string) { return mockLocalStorage[k] || null; },
    setItem(k: string, v: string) { mockLocalStorage[k] = v; },
    removeItem(k: string) { delete mockLocalStorage[k]; },
  },
  addEventListener() {},
  setInterval() { return 1; },
  clearInterval() {},
  fetch(url: string, opts: any) {
    sentBatches.push({ url, headers: opts.headers, body: JSON.parse(opts.body) });
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ accepted: 1 }) });
  },
};

// Execute script in mock environment
const runFn = new Function('window', 'document', 'localStorage', 'fetch', code);
runFn(mockWindow, mockDocument, mockWindow.localStorage, mockWindow.fetch);

assert(mockWindow.dealmemory, 'window.dealmemory must be initialized');
assert.equal(mockWindow.dealmemory.projectKey, 'pk_live_test_1234567890abcdef');
assert(mockWindow.dealmemory.anonymousId.startsWith('anon_'), 'Anonymous ID must be generated');

// 1. Check auto page view
assert(mockWindow.dealmemory.queue.length >= 1, 'Initial page_view must be queued');
const pageView = mockWindow.dealmemory.queue[0];
assert.equal(pageView.name, 'page_view');
assert.equal(pageView.properties.title, 'Test App Home');

// 2. Identify user
mockWindow.dealmemory.identify('sarah@acme.inc', { plan: 'growth' });
assert.equal(mockWindow.dealmemory.userId, 'sarah@acme.inc');
const identifyEvent = mockWindow.dealmemory.queue.find((e: any) => e.name === 'identified');
assert(identifyEvent, 'identified event must be queued');
assert.equal(identifyEvent.properties.plan, 'growth');

// 3. Track custom event with sensitive data filtering test
mockWindow.dealmemory.track('feature_used', {
  feature: 'Export PDF',
  password: 'SHOULD_BE_DROPPED',
  token: 'SHOULD_BE_DROPPED',
  validCount: 42,
});

const featureEvent = mockWindow.dealmemory.queue.find((e: any) => e.name === 'feature_used');
assert(featureEvent, 'feature_used event must be queued');
assert.equal(featureEvent.properties.feature, 'Export PDF');
assert.equal(featureEvent.properties.validCount, 42);
assert.equal(featureEvent.properties.password, undefined, 'Passwords must be stripped');
assert.equal(featureEvent.properties.token, undefined, 'Tokens must be stripped');

// 4. Test flush
mockWindow.dealmemory.flush();
assert.equal(sentBatches.length, 1, 'Should call fetch batch endpoint');
assert.equal(sentBatches[0].url, 'https://dealmemory.vercel.app/api/v1/events/batch');
assert.equal(sentBatches[0].headers['x-project-key'], 'pk_live_test_1234567890abcdef');
assert(sentBatches[0].body.events.length >= 3, 'Batch should contain all queued events');

console.log('✅ public/v1.js successfully tested: auto-init, auto-capture, identify, redaction & batch flushing all PASSED!');
process.exit(0);
