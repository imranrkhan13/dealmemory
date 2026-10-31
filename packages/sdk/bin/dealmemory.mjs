#!/usr/bin/env node
/**
 * dealmemory — zero-config setup CLI.
 *
 *   npx dealmemory init
 *
 * Does the two things a user should never have to do by hand:
 *   1. puts DEALMEMORY_API_KEY in .env (and the browser-visible copy Next needs)
 *   2. writes the tracking bootstrap into the app's entry file
 *
 * Everything is idempotent: running it twice changes nothing.
 */
import fs from 'node:fs';
import path from 'node:path';

const PRIMARY_KEY = 'DEALMEMORY_API_KEY';
const PUBLIC_KEY = 'NEXT_PUBLIC_DEALMEMORY_API_KEY';
const IMPORT_MARKER = 'dealmemory/auto';
const CLIENT_FILE_MARKER = 'dealmemory.client';

const args = process.argv.slice(2);
const command = args[0] ?? 'help';

function log(msg) {
  process.stdout.write(msg + '\n');
}
function ok(msg) {
  log('  \x1b[32m✓\x1b[0m ' + msg);
}
function skip(msg) {
  log('  \x1b[90m•\x1b[0m ' + msg);
}
function warn(msg) {
  process.stderr.write('  \x1b[33m!\x1b[0m ' + msg + '\n');
}

let projectRoot = '';

function displayPath(file) {
  const rel = projectRoot ? path.relative(projectRoot, file) : file;
  return rel.startsWith('..') ? file : rel;
}

function findProjectRoot() {
  let dir = process.env.INIT_CWD || process.cwd();
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.env.INIT_CWD || process.cwd();
}

function readIfExists(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function pickFile(root, candidates) {
  for (const rel of candidates) {
    const abs = path.join(root, rel);
    if (fs.existsSync(abs)) return abs;
  }
  return null;
}

/**
 * Reads a variable from dotenv text.
 * Whitespace around `=` is horizontal only — a `\s*` would swallow the newline
 * of an empty value and hand back the NEXT line as this variable's value.
 */
function envValue(text, name) {
  const pattern = new RegExp('^[ \\t]*' + name + '[ \\t]*=[ \\t]*([^\\r\\n]*)', 'm');
  const match = text.match(pattern);
  if (!match) return null;
  return match[1].trim().replace(/^["']|["']$/g, '');
}

function hasEnvLine(text, name) {
  // `m` matters: without it `^` only matches the start of the file, so a key
  // sitting on line 2 would look missing and get appended a second time.
  return new RegExp('^[ \\t]*' + name + '[ \\t]*=', 'm').test(text);
}

/* ── 1. .env ─────────────────────────────────────────────── */

function ensureEnv(root, needPublicCopy) {
  const envPath = path.join(root, '.env');
  const existing = readIfExists(envPath) ?? '';
  let text = existing;
  const changes = [];

  if (!hasEnvLine(text, PRIMARY_KEY)) {
    const prefix = text.length && !text.endsWith('\n') ? '\n' : '';
    text +=
      prefix +
      '\n# DealMemory — the only key this SDK needs (get it from Settings -> API keys)\n' +
      PRIMARY_KEY +
      '=\n';
    changes.push('added ' + PRIMARY_KEY + ' to .env');
  }

  const primary = envValue(text, PRIMARY_KEY) ?? '';

  if (needPublicCopy) {
    if (!hasEnvLine(text, PUBLIC_KEY)) {
      text +=
        '# Browser copy of the key — inlined by Next.js at build time (written by `npx dealmemory init`)\n' +
        PUBLIC_KEY +
        '=' +
        primary +
        '\n';
      changes.push('added ' + PUBLIC_KEY + ' (needed for browser tracking)');
    } else if (primary && envValue(text, PUBLIC_KEY) !== primary) {
      const pattern = new RegExp('^[ \\t]*' + PUBLIC_KEY + '[ \\t]*=[^\\r\\n]*', 'm');
      text = text.replace(pattern, PUBLIC_KEY + '=' + primary);
      changes.push('synced ' + PUBLIC_KEY + ' with ' + PRIMARY_KEY);
    }
  }

  if (text !== existing) {
    fs.writeFileSync(envPath, text, 'utf8');
    changes.forEach((c) => ok(c));
  } else {
    skip('.env already configured');
  }

  return primary;
}

/* ── 2. entry file ───────────────────────────────────────── */

const LAYOUT_CANDIDATES = [
  'app/layout.tsx',
  'app/layout.ts',
  'app/layout.jsx',
  'app/layout.js',
  'src/app/layout.tsx',
  'src/app/layout.ts',
  'src/app/layout.jsx',
  'src/app/layout.js',
];
const PAGES_CANDIDATES = [
  'pages/_app.tsx',
  'pages/_app.ts',
  'pages/_app.jsx',
  'pages/_app.js',
  'src/pages/_app.tsx',
  'src/pages/_app.ts',
  'src/pages/_app.jsx',
  'src/pages/_app.js',
];

function insertImport(file, statement) {
  const source = readIfExists(file);
  if (source === null) return skip(path.basename(file) + ' not found');

  // Either marker proves tracking is wired: the direct import, or the relative
  // client bootstrap file the app-router path creates next to the layout.
  if (source.includes(IMPORT_MARKER) || source.includes(CLIENT_FILE_MARKER)) {
    return skip(path.basename(file) + ' already tracks');
  }

  const lines = source.split('\n');
  let insertAt = 0;
  // Keep 'use client' / 'use strict' directives first, then imports.
  while (insertAt < lines.length && /^[ \t]*['"](use client|use strict)['"];?[ \t]*$/.test(lines[insertAt])) {
    insertAt += 1;
  }
  lines.splice(insertAt, 0, statement);
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  ok('wrote `' + statement.trim() + '` into ' + displayPath(file));
}

function setupNextAppRouter(root, primary) {
  const layout = pickFile(root, LAYOUT_CANDIDATES);
  if (!layout) return false;

  const bootstrap = path.join(path.dirname(layout), 'dealmemory.client.ts');
  const rel = './' + path.basename(bootstrap).replace(/\.(tsx|ts|jsx|js)$/, '');

  if (!fs.existsSync(bootstrap)) {
    fs.writeFileSync(
      bootstrap,
      "'use client';\n\n" +
        '// Written by `npx dealmemory init` — DealMemory records page views and actions\n' +
        '// automatically from DEALMEMORY_API_KEY. Delete this file to opt out.\n' +
        "import '" + IMPORT_MARKER + "';\n\n" +
        'export {};\n',
      'utf8'
    );
    ok('created ' + displayPath(bootstrap));
  } else {
    skip(path.basename(bootstrap) + ' already exists');
  }

  insertImport(layout, "import '" + rel + "';\n");

  if (!primary) {
    warn(PRIMARY_KEY + ' in .env is empty — paste your pk_live_... key there, then run `npx dealmemory init` again.');
  }
  return true;
}

function setupNextPagesRouter(root, primary) {
  const app = pickFile(root, PAGES_CANDIDATES);
  if (!app) return false;
  insertImport(app, "import '" + IMPORT_MARKER + "';\n");
  if (!primary) {
    warn(PRIMARY_KEY + ' in .env is empty — paste your pk_live_... key there.');
  }
  return true;
}

function setupOther(root, primary) {
  log('');
  log('  Could not find a Next.js entry file automatically.');
  log('  Add these two lines yourself (this is everything):');
  log('');
  log('    # .env   ' + PRIMARY_KEY + '=pk_live_...');
  log("    // top of your app entry file");
  log("    import '" + IMPORT_MARKER + "'");
  log('');
  if (!primary) warn(PRIMARY_KEY + ' is in .env but still empty — paste your pk_live_... key there.');
  return false;
}

/* ── commands ────────────────────────────────────────────── */

function init() {
  const root = findProjectRoot();
  projectRoot = root;
  log('\nDealMemory setup — ' + root + '\n');

  let isNext = false;
  try {
    const pkg = JSON.parse(readIfExists(path.join(root, 'package.json')) ?? '{}');
    isNext = Boolean(pkg?.dependencies?.next || pkg?.devDependencies?.next);
  } catch {
    /* ignore malformed package.json */
  }

  const layout = pickFile(root, LAYOUT_CANDIDATES);
  const pagesApp = pickFile(root, PAGES_CANDIDATES);
  const primary = ensureEnv(root, isNext);

  if (layout) {
    setupNextAppRouter(root, primary);
  } else if (pagesApp) {
    setupNextPagesRouter(root, primary);
  } else if (isNext) {
    setupOther(root, primary);
  } else {
    setupOther(root, primary);
  }

  log('');
  log('  Next: restart your dev server. Page views and clicks are recorded from then on.');
  log("  Custom events: `import { track } from 'dealmemory/auto'` then `track('name')`.");
  log('');
}

function help() {
  log('');
  log('  DealMemory CLI');
  log('');
  log('    npx dealmemory init    Write the key into .env and the tracking code into your app');
  log('    npx dealmemory help    Show this message');
  log('');
  log('  Setup is two steps and nothing else:');
  log('    1. npm install dealmemory');
  log('    2. ' + PRIMARY_KEY + '=pk_live_...   (in .env)');
  log('');
}

if (command === 'init') {
  try {
    init();
  } catch (e) {
    warn(e?.message ?? String(e));
    process.exitCode = 1;
  }
} else if (command === 'hint') {
  log('\n  dealmemory: add ' + PRIMARY_KEY + '=pk_live_... to .env, then run `npx dealmemory init`.\n');
} else {
  help();
}
