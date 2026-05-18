#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const STATE_VERSION = 1;
const DEFAULT_PATTERNS = ['reports/**/*.md', 'reports/**/*.json', 'Testing/**/*.md', 'Testing/**/*.json', '**/test-scenario-report*.md', '**/test-scenario-report*.json'];
const DEFAULT_STATE_FILE = join(homedir(), '.bda-ai-dev', 'ingest-sync-state.json');
const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const connector = join(root, 'scripts', 'send-ingest-report.mjs');

class CliError extends Error {
  constructor(message, code = 1) {
    super(message);
    this.code = code;
  }
}

function usage() {
  return `Usage: node scripts/sync-github-reports.mjs [--repo-dir <checkout>] [--patterns <csv>] [--state-file <path>] [--pull] [--send] [--force] [--endpoint <url>] [--token-file <path>|--token-env <ENV_NAME>] [--tenant <id>] [--project <name>] [--source <source>]

Dry-run is the default: scan matching report files and validate each one through scripts/send-ingest-report.mjs without sending.
Remote ingest requires explicit --send plus endpoint/token inputs. Keep real endpoint/token values in private runner config, never in this public repo.

Defaults:
  --repo-dir      current working directory
  --patterns      ${DEFAULT_PATTERNS.join(',')}
  --state-file    ${DEFAULT_STATE_FILE}

Examples:
  npm run sync:github-reports -- --repo-dir ../employee-reports
  npm run sync:github-reports -- --repo-dir ../employee-reports --pull --send --endpoint https://example.com/ingest --token-file /private/path/token`;
}

function parseArgs(argv) {
  const args = {
    repoDir: process.cwd(),
    patterns: DEFAULT_PATTERNS,
    stateFile: DEFAULT_STATE_FILE,
    pull: false,
    send: false,
    force: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--pull') args.pull = true;
    else if (arg === '--send') args.send = true;
    else if (arg === '--force') args.force = true;
    else if (['--repo-dir', '--patterns', '--state-file', '--endpoint', '--token-file', '--token-env', '--tenant', '--project', '--source'].includes(arg)) {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new CliError(`${arg} requires a value`);
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      args[key] = arg === '--patterns' ? value.split(',').map((item) => item.trim()).filter(Boolean) : value;
      index += 1;
    } else {
      throw new CliError(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function normalizeRel(path) {
  return path.split(sep).join('/').replace(/^\.\//, '');
}

function escapeRegex(value) {
  return value.replace(/[.+^${}()|[\]\\]/g, '\\$&');
}

function globToRegex(glob) {
  const parts = normalizeRel(glob).split('/');
  let out = '^';
  parts.forEach((part, index) => {
    if (part === '**') {
      out += '(?:[^/]+/)*';
      return;
    }
    if (index > 0 && parts[index - 1] !== '**') out += '/';
    let chunk = '';
    for (const ch of part) {
      if (ch === '*') chunk += '[^/]*';
      else if (ch === '?') chunk += '[^/]';
      else chunk += escapeRegex(ch);
    }
    out += chunk;
  });
  out += '$';
  return new RegExp(out);
}

async function walkFiles(dir, base = dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walkFiles(full, base, out);
    else if (entry.isFile()) out.push({ full, rel: normalizeRel(relative(base, full)) });
  }
  return out;
}

function runGit(args, cwd) {
  return spawnSync('git', args, { cwd, encoding: 'utf8' });
}

async function fingerprint(repoDir, file) {
  const git = runGit(['hash-object', '--', file.rel], repoDir);
  if (git.status === 0 && git.stdout.trim()) return `git:${git.stdout.trim()}`;
  const raw = await readFile(file.full);
  return `sha256:${createHash('sha256').update(raw).digest('hex')}`;
}

async function loadState(path) {
  if (!existsSync(path)) return { version: STATE_VERSION, entries: {} };
  try {
    const state = JSON.parse(await readFile(path, 'utf8'));
    return { version: STATE_VERSION, entries: state.entries && typeof state.entries === 'object' ? state.entries : {} };
  } catch {
    throw new CliError(`State file is malformed: ${path}`);
  }
}

async function saveState(path, state) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(state, null, 2)}\n`);
}

function connectorArgs(file, args) {
  const out = ['--file', file.full, '--source', args.source || `github-report-sync/${file.rel}`];
  if (args.project) out.push('--project', args.project);
  if (args.send) {
    out.push('--send');
    if (args.endpoint) out.push('--endpoint', args.endpoint);
    if (args.tokenFile) out.push('--token-file', args.tokenFile);
    if (args.tokenEnv) out.push('--token-env', args.tokenEnv);
    if (args.tenant) out.push('--tenant', args.tenant);
  }
  return out;
}

function runConnector(file, args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [connector, ...connectorArgs(file, args)], {
      cwd: root,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (status) => resolve({ status, stdout, stderr }));
  });
}

function safeError(result) {
  const text = (result.stderr || result.stdout || '').split('\n').find(Boolean) || `exit ${result.status}`;
  return text.replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]').slice(0, 300);
}

function parseEventId(stdout) {
  try {
    const parsed = JSON.parse(stdout);
    return String(parsed?.result?.event_id || parsed?.event_id || '');
  } catch {
    return '';
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const repoDir = resolve(args.repoDir);
  const repoInfo = await stat(repoDir).catch(() => null);
  if (!repoInfo || !repoInfo.isDirectory()) throw new CliError(`--repo-dir is not a directory: ${repoDir}`);

  if (args.pull) {
    const pulled = runGit(['pull', '--ff-only'], repoDir);
    if (pulled.status !== 0) throw new CliError(`git pull --ff-only failed in --repo-dir (exit ${pulled.status})`, 2);
  }

  if (args.send) {
    const hasEndpoint = args.endpoint || process.env.INNOHUB_INGEST_URL || process.env.BDA_INGEST_ENDPOINT;
    const hasToken = args.tokenFile || args.tokenEnv || process.env.INNOHUB_INGEST_TOKEN_FILE || process.env.INNOHUB_INGEST_TOKEN;
    if (!hasEndpoint) throw new CliError('--send requires --endpoint or private INNOHUB_INGEST_URL');
    if (!hasToken) throw new CliError('--send requires --token-file, --token-env, or private ingest token env');
  }

  const regexes = args.patterns.map(globToRegex);
  const allFiles = await walkFiles(repoDir);
  const matched = allFiles
    .filter((file) => /\.(md|json)$/i.test(file.rel))
    .filter((file) => regexes.some((regex) => regex.test(file.rel)))
    .sort((a, b) => a.rel.localeCompare(b.rel));

  const stateFile = isAbsolute(args.stateFile) ? args.stateFile : resolve(args.stateFile);
  const state = await loadState(stateFile);
  const summary = {
    mode: args.send ? 'send' : 'dry-run',
    repo_dir: repoDir,
    state_file: stateFile,
    scanned: allFiles.length,
    candidates: matched.length,
    validated: 0,
    sent: 0,
    skipped: 0,
    errors: [],
    event_ids: [],
  };

  for (const file of matched) {
    const hash = await fingerprint(repoDir, file);
    const prior = state.entries[file.rel];
    if (!args.force && prior?.fingerprint === hash && prior?.sent_at) {
      summary.skipped += 1;
      continue;
    }

    const result = await runConnector(file, args);
    if (result.status !== 0) {
      summary.errors.push({ file: file.rel, error: safeError(result) });
      continue;
    }
    summary.validated += 1;

    if (args.send) {
      const eventId = parseEventId(result.stdout);
      summary.sent += 1;
      if (eventId) summary.event_ids.push(eventId);
      state.entries[file.rel] = {
        fingerprint: hash,
        sent_at: new Date().toISOString(),
        event_id: eventId || undefined,
      };
    }
  }

  if (args.send && (summary.sent > 0 || args.force)) await saveState(stateFile, state);
  console.log(JSON.stringify(summary, null, 2));
  if (summary.errors.length) process.exitCode = 3;
}

main().catch((error) => {
  const message = error instanceof CliError ? error.message : 'Unexpected GitHub report sync error';
  console.error(`ERROR: ${message}`);
  if (!(error instanceof CliError) && process.env.BDA_INGEST_DEBUG === '1') console.error(error.stack || String(error));
  process.exit(error instanceof CliError ? error.code : 1);
});
