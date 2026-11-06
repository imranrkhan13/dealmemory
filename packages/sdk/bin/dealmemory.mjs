#!/usr/bin/env node
/**
 * dealmemory — zero-config setup CLI.
 *
 *   npx dealmemory install
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
const command = args[0] ?? 'install';

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

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage', '.turbo', '.vercel']);
const SEARCH_DEPTH = 3;

function dirDeclaresNext(dir) {
  try {
    const pkg = JSON.parse(readIfExists(path.join(dir, 'package.json')) ?? '{}');
    return Boolean(pkg?.dependencies?.next || pkg?.devDependencies?.next);
  } catch {
    return false;
  }
}

/**
 * Monorepos: the nearest package.json is often the repo root, while the real
 * app sits one or two levels down (e.g. `frontend/`, `apps/web/`). Walk
 * breadth-first for the closest directory that looks like a Next.js app —
 * either it declares `next` or it contains a layout/_app entry file.
 */
function findAppRoot(start) {
  const queue = [{ dir: start, depth: 0 }];
  while (queue.length) {
    const { dir, depth } = queue.shift();
    if (
      pickFile(dir, LAYOUT_CANDIDATES) ||
      pickFile(dir, PAGES_CANDIDATES) ||
      dirDeclaresNext(dir)
    ) {
      return dir;
    }
    if (depth >= SEARCH_DEPTH) continue;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && !SKIP_DIRS.has(entry.name)) {
        queue.push({ dir: path.join(dir, entry.name), depth: depth + 1 });
      }
    }
  }
  return start;
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
  log('  ⚠ Could not find a Next.js entry file automatically.');
  log('');
  log('  If this is a Next.js app, it may use a custom directory.');
  log('  Otherwise, add these two lines yourself (this is everything):');
  log('');
  log('    # .env   ' + PRIMARY_KEY + '=pk_live_...');
  log("    // top of your app entry file");
  log("    import '" + IMPORT_MARKER + "'");
  log('');
  if (!primary) {
    warn(PRIMARY_KEY + ' in .env is empty — paste your pk_live_... key there, then run `npx dealmemory init` again.');
  }
  return false;
}

/* ── commands ────────────────────────────────────────────── */

function install() {
  const cwdRoot = findProjectRoot();
  const root = findAppRoot(cwdRoot);
  projectRoot = root;
  log('\n✨ DealMemory setup — ' + root + '\n');
  if (root !== cwdRoot) {
    const rel = path.relative(cwdRoot, root);
    skip('found your app in `' + rel + '` (ran from the repo root)');
  }

  const pkg = JSON.parse(readIfExists(path.join(root, 'package.json')) ?? '{}');
  const isNext = Boolean(pkg?.dependencies?.next || pkg?.devDependencies?.next);

  const layout = pickFile(root, LAYOUT_CANDIDATES);
  const pagesApp = pickFile(root, PAGES_CANDIDATES);
  const primary = ensureEnv(root, isNext);

  let wired = false;
  if (layout) {
    wired = setupNextAppRouter(root, primary);
  } else if (pagesApp) {
    wired = setupNextPagesRouter(root, primary);
  } else {
    wired = setupOther(root, primary);
  }

  log('');
  if (!wired) {
    log('  Nothing was changed in your source files yet — see the steps above.');
    log('  Re-run `npx dealmemory init` from inside your app directory if it lives in a subfolder.');
    log('');
    return;
  }

  log('  ✅ Setup complete! DealMemory will now track:');
  log('     • Page views and navigation');
  log('     • All clicks and button interactions');
  log('     • Form submissions');
  log('     • Scroll depth');
  log('     • Input changes (without sensitive data)');
  log('     • Errors and exceptions');
  log('     • Time spent on pages');
  log('');
  log('  📝 Next steps:');
  log('     1. Set ' + PRIMARY_KEY + '=pk_live_... in .env');
  log('     2. Restart your dev server');
  log('     3. Visit your dashboard to see real-time tracking');
  log('');
  log('  💡 Custom events: `import { track } from "dealmemory/auto"` then `track("name")`');
  log('');
}

// Keep init as an alias for install
const init = install;

function help() {
  log('');
  log('  DealMemory CLI — Track everything, automatically');
  log('');
  log('    npx dealmemory install    Install DealMemory (adds .env key + tracking code)');
  log('    npx dealmemory init       Alias for install');
  log('    npx dealmemory help       Show this message');
  log('');
  log('  Setup is two steps and nothing else:');
  log('    1. npm install dealmemory');
  log('    2. npx dealmemory install');
  log('    3. ' + PRIMARY_KEY + '=pk_live_...   (in .env)');
  log('');
  log('  DealMemory automatically tracks:');
  log('    • Page views and navigation');
  log('    • All clicks and button interactions');
  log('    • Form submissions');
  log('    • Scroll depth');
  log('    • Input changes (without sensitive data)');
  log('    • Errors and exceptions');
  log('    • Time spent on pages');
  log('');
}

if (command === 'install' || command === 'init') {
  try {
    install();
  } catch (e) {
    warn(e?.message ?? String(e));
    process.exitCode = 1;
  }
} else if (command === 'hint') {
  log('\n  dealmemory: add ' + PRIMARY_KEY + '=pk_live_... to .env, then run `npx dealmemory install`.\n');
} else {
  help();
}
