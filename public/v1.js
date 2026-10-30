/**
 * DealMemory Browser SDK v1.0
 * Lightweight, privacy-first customer memory & activation telemetry.
 * https://dealmemory.vercel.app
 */
(function (window, document) {
  'use strict';

  if (window.__dealmemory_loaded) return;
  window.__dealmemory_loaded = true;

  var CREDENTIAL_PATTERNS = [
    /(?:pk_live|sk_live|whsec)_[a-zA-Z0-9_]{16,}/,
    /\bBearer(?:\s|%20)+[a-zA-Z0-9_\-\.~+/]{16,}={0,2}/i,
    /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/,
    /-----BEGIN[ A-Z0-9_-]*PRIVATE KEY-----/,
    /(?:password|token|secret)\s*=\s*['"]?[^\s'";&]{3,}['"]?/i,
  ];

  function containsCredential(value) {
    if (typeof value !== 'string') return false;
    for (var i = 0; i < CREDENTIAL_PATTERNS.length; i++) {
      if (CREDENTIAL_PATTERNS[i].test(value)) return true;
    }
    return false;
  }

  function randomUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function safeString(val, maxLen) {
    if (val === null || val === undefined) return '';
    return String(val).slice(0, maxLen || 200);
  }

  function cleanUrl(href) {
    if (!href) return '';
    try {
      var url = new URL(href);
      url.search = '';
      url.hash = '';
      return url.toString();
    } catch (e) {
      return href.split('?')[0].split('#')[0];
    }
  }

  function DealMemoryClient(config) {
    this.projectKey = config.projectKey || '';
    this.host = (config.host || 'https://dealmemory.vercel.app').replace(/\/+$/, '');
    this.batchUrl = this.host + '/api/v1/events/batch';
    this.storagePrefix = 'dm:' + (this.projectKey ? this.projectKey.slice(0, 16) : 'default') + ':';
    this.queue = [];
    this.flushing = false;
    this.autoCapture = config.autoCapture !== false;

    // Load or generate identity
    this.anonymousId = this.getStorage('anon') || ('anon_' + randomUUID());
    this.setStorage('anon', this.anonymousId);

    this.sessionId = 'sess_' + randomUUID();
    this.userId = this.getStorage('user') || null;

    // Load persisted queue
    try {
      var saved = JSON.parse(this.getStorage('queue') || '[]');
      if (Array.isArray(saved)) this.queue = saved.slice(-200);
    } catch (e) {
      this.queue = [];
    }

    var self = this;
    this.timer = setInterval(function () {
      self.flush();
    }, config.flushIntervalMs || 4000);

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', function () {
        self.flush(true);
      });
      window.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') self.flush(true);
      });
    }

    if (this.autoCapture) {
      this.initAutoCapture();
      // Track initial page view
      this.page();
    }
  }

  DealMemoryClient.prototype.getStorage = function (key) {
    try {
      return localStorage.getItem(this.storagePrefix + key);
    } catch (e) {
      return null;
    }
  };

  DealMemoryClient.prototype.setStorage = function (key, val) {
    try {
      if (val === null) localStorage.removeItem(this.storagePrefix + key);
      else localStorage.setItem(this.storagePrefix + key, String(val));
    } catch (e) {}
  };

  DealMemoryClient.prototype.persistQueue = function () {
    try {
      localStorage.setItem(this.storagePrefix + 'queue', JSON.stringify(this.queue.slice(-200)));
    } catch (e) {}
  };

  DealMemoryClient.prototype.identify = function (userId, traits) {
    if (!userId) return;
    this.userId = String(userId);
    this.setStorage('user', this.userId);
    this.track('identified', traits || {});
  };

  DealMemoryClient.prototype.reset = function () {
    this.userId = null;
    this.setStorage('user', null);
    this.anonymousId = 'anon_' + randomUUID();
    this.setStorage('anon', this.anonymousId);
    this.sessionId = 'sess_' + randomUUID();
  };

  DealMemoryClient.prototype.sanitizeProps = function (raw) {
    var out = {};
    if (!raw || typeof raw !== 'object') return out;
    var keys = Object.keys(raw);
    for (var i = 0; i < keys.length && i < 30; i++) {
      var k = keys[i];
      if (k.length > 80 || /password|secret|token|bearer/i.test(k)) continue;
      var val = raw[k];
      if (typeof val === 'string') {
        if (val.length <= 500 && !containsCredential(val)) out[k] = val;
      } else if (typeof val === 'number' || typeof val === 'boolean' || val === null) {
        out[k] = val;
      }
    }
    return out;
  };

  DealMemoryClient.prototype.track = function (name, properties) {
    if (!name || typeof name !== 'string') return;
    if (!this.projectKey) {
      console.warn('[DealMemory] No API key configured. Provide data-key="pk_live_..." on your script tag.');
      return;
    }

    var event = {
      id: randomUUID(),
      projectKey: this.projectKey,
      name: safeString(name, 100),
      userId: this.userId || undefined,
      anonymousId: this.anonymousId,
      sessionId: this.sessionId,
      occurredAt: new Date().toISOString(),
      url: cleanUrl(window.location.href),
      referrer: cleanUrl(document.referrer),
      properties: this.sanitizeProps(properties),
    };

    this.queue.push(event);
    this.persistQueue();

    // If queue is building up, trigger immediate flush
    if (this.queue.length >= 5) {
      this.flush();
    }
  };

  DealMemoryClient.prototype.page = function (name, properties) {
    var title = name || document.title || 'Page View';
    var props = Object.assign({ title: safeString(title, 150) }, properties || {});
    this.track('page_view', props);
  };

  DealMemoryClient.prototype.featureUsed = function (featureName, props) {
    this.track('feature_used', Object.assign({ feature: safeString(featureName, 100) }, props || {}));
  };

  DealMemoryClient.prototype.flush = function (isBeacon) {
    if (this.flushing || !this.queue.length) return;
    var batch = this.queue.slice(0, 25);
    var self = this;

    var payload = JSON.stringify({ events: batch });

    if (isBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        var blob = new Blob([payload], { type: 'application/json' });
        var sent = navigator.sendBeacon(this.batchUrl, blob);
        if (sent) {
          this.queue = this.queue.filter(function (e) {
            return !batch.some(function (b) { return b.id === e.id; });
          });
          this.persistQueue();
          return;
        }
      } catch (e) {}
    }

    this.flushing = true;
    fetch(this.batchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-project-key': this.projectKey,
      },
      body: payload,
      keepalive: true,
    })
      .then(function (res) {
        if (res.ok || res.status === 409) {
          // Success or already deduplicated
          self.queue = self.queue.filter(function (e) {
            return !batch.some(function (b) { return b.id === e.id; });
          });
          self.persistQueue();
        } else if (res.status === 401 || res.status === 403) {
          console.error('[DealMemory] Ingestion authentication failed (' + res.status + '). Check your project API key.');
          self.queue = [];
          self.persistQueue();
        }
      })
      .catch(function () {
        // Network failure, retry on next interval
      })
      .finally(function () {
        self.flushing = false;
      });
  };

  DealMemoryClient.prototype.initAutoCapture = function () {
    var self = this;

    // Track button & link clicks
    document.addEventListener(
      'click',
      function (e) {
        var target = e.target;
        if (!target || !(target instanceof Element)) return;
        var el = target.closest('button, a, [role="button"], input[type="submit"]');
        if (!el) return;

        var actionName =
          el.getAttribute('data-dealmemory-action') ||
          el.getAttribute('data-action') ||
          el.getAttribute('aria-label') ||
          safeString(el.textContent, 50).trim() ||
          el.id ||
          'button_click';

        self.track('action_clicked', {
          action: actionName,
          element: el.tagName.toLowerCase(),
          href: el instanceof HTMLAnchorElement ? cleanUrl(el.href) : undefined,
        });
      },
      true
    );

    // Track form submits
    document.addEventListener(
      'submit',
      function (e) {
        var form = e.target;
        if (!form || !(form instanceof HTMLFormElement)) return;
        var formName =
          form.getAttribute('data-dealmemory-form') ||
          form.getAttribute('name') ||
          form.id ||
          'form_submit';

        self.track('form_submitted', {
          form: formName,
          action: cleanUrl(form.action || ''),
        });
      },
      true
    );
  };

  // Auto-initialize from script tag attributes
  var script = document.currentScript || document.querySelector('script[data-key]');
  var projectKey = script ? (script.getAttribute('data-key') || script.getAttribute('data-project-key')) : '';
  var scriptSrc = script ? script.src : '';
  var detectedHost = '';
  if (scriptSrc) {
    try {
      detectedHost = new URL(scriptSrc).origin;
    } catch (e) {}
  }
  var customHost = script ? script.getAttribute('data-host') : null;
  var host = customHost || detectedHost || window.location.origin;

  var client = new DealMemoryClient({
    projectKey: projectKey,
    host: host,
    autoCapture: script ? script.getAttribute('data-autocapture') !== 'false' : true,
  });

  window.DealMemory = DealMemoryClient;
  window.dealmemory = client;
  window.agentlens = client; // backward-compatibility alias

})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : {});
