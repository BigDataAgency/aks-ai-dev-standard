#!/usr/bin/env node
import { readFile, stat } from 'node:fs/promises';
import { basename } from 'node:path';
import { randomUUID } from 'node:crypto';

const VERSION = '0.4.1';
const DEFAULT_SOURCE = 'bda-ai-dev-standard/test-scenario-report';
const MAX_INPUT_BYTES = 512 * 1024;
const MAX_FIELD_LENGTH = 4000;

class CliError extends Error {
  constructor(message, code = 1) {
    super(message);
    this.code = code;
  }
}

function usage() {
  return `Usage: node scripts/send-ingest-report.mjs --file <report.md|report.json> [--project <name>] [--source <source>] [--send --endpoint <url> (--token-file <path>|--token-env <ENV_NAME>) [--tenant <id>]]

Defaults to dry-run local JSON output. Remote ingest requires explicit --send plus an endpoint and token source.

Private env alternatives for staff/CI (never commit real values):
  INNOHUB_INGEST_URL          endpoint used when --endpoint is omitted
  INNOHUB_INGEST_TOKEN_FILE   token-file path used when --token-file is omitted
  INNOHUB_INGEST_TOKEN        token value used when --token-env is omitted and no token-file is set
  INNOHUB_TENANT_ID           tenant used when --tenant is omitted

Examples:
  npm run ingest:report -- --file reports/test-report.md
  npm run ingest:report -- --file reports/test-report.md --send --endpoint https://example.com/ingest --token-file /private/path/ingest-token`;
}

function parseArgs(argv) {
  const args = { send: false, source: DEFAULT_SOURCE };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--send') args.send = true;
    else if (['--file', '--endpoint', '--token-file', '--token-env', '--tenant', '--project', '--source'].includes(arg)) {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new CliError(`${arg} requires a value`);
      args[arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
      index += 1;
    } else {
      throw new CliError(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function reportAndExit(error) {
  const message = error instanceof CliError ? error.message : 'Unexpected connector error';
  console.error(`ERROR: ${message}`);
  if (!(error instanceof CliError) && process.env.BDA_INGEST_DEBUG === '1') {
    console.error(error.stack || String(error));
  }
  process.exit(error instanceof CliError ? error.code : 1);
}

function detectHighConfidenceSecrets(text) {
  const patterns = [
    /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/,
    /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
    /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
    /\bAuthorization\s*:\s*Bearer\s+[A-Za-z0-9._~+/=-]{24,}\b/i,
    /\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|secret|password|passwd|pwd)\s*[:=]\s*['"]?[A-Za-z0-9._~+/=-]{24,}['"]?/i,
  ];
  return patterns.some((pattern) => pattern.test(text));
}

function redactText(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/\bAuthorization\s*:\s*Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Authorization: Bearer [REDACTED]')
    .replace(/\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|secret|password|passwd|pwd)\s*[:=]\s*['"]?[^\s,'"]+['"]?/gi, (match) => `${match.split(/[:=]/)[0]}=[REDACTED]`)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
    .replace(/\b(?:\+?66|0)\d{8,9}\b/g, '[REDACTED_PHONE]')
    .slice(0, MAX_FIELD_LENGTH);
}

function redactDeep(value) {
  if (Array.isArray(value)) return value.map(redactDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, redactDeep(val)]));
  }
  return redactText(value);
}

function extractFirst(regex, text) {
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

function extractMarkdownField(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return extractFirst(new RegExp(`^-\\s*${escaped}\\s*:\\s*(.+)$`, 'im'), text);
}

function stripMarkdown(value) {
  return String(value || '')
    .replace(/\*\*/g, '')
    .replace(/^`|`$/g, '')
    .trim();
}

function extractAnyMarkdownField(text, labels) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const value = extractFirst(new RegExp(`^-\\s*(?:\\*\\*)?${escaped}(?:\\*\\*)?\\s*[:：]\\s*(.+)$`, 'im'), text);
    if (value) return stripMarkdown(value);
  }
  return '';
}

function normalizeStatus(raw) {
  const value = String(raw || '').toUpperCase();
  if (/FAIL/.test(value)) return 'FAIL';
  if (/BLOCKED/.test(value)) return 'BLOCKED';
  if (/NOT[_ -]?RUN/.test(value)) return 'NOT_RUN';
  if (/LIMITED/.test(value)) return 'LIMITED';
  if (/INFO/.test(value)) return 'INFO';
  if (/PASS/.test(value)) return 'PASS';
  return '';
}

function parseEvidenceManifest(text) {
  const evidence = [];
  const fileRegex = /^-\s*File:\s*`?([^`\n]+?)`?\s*$/gim;
  let match;
  while ((match = fileRegex.exec(text)) !== null) {
    const start = match.index + match[0].length;
    const next = text.slice(start).search(/^-[ \t]*File:/im);
    const block = next === -1 ? text.slice(start) : text.slice(start, start + next);
    evidence.push(redactDeep({
      file: match[1].trim(),
      scenario_step: extractFirst(/^\s*-\s*Scenario\/step:\s*(.+)$/im, block),
      contains_sensitive_data: extractFirst(/^\s*-\s*Contains PII\/secret\/customer\/payment data\?\s*(.+)$/im, block),
      masking_applied: extractFirst(/^\s*-\s*Masking applied\?\s*(.+)$/im, block),
      safe_to_share_externally: extractFirst(/^\s*-\s*Safe to share externally\?\s*(.+)$/im, block),
    }));
  }
  if (!evidence.length) {
    const labeledPathRegex = /^-\s*([^:\n]+):\s*`([^`\n]+)`\s*$/gim;
    while ((match = labeledPathRegex.exec(text)) !== null) {
      evidence.push(redactDeep({
        file: match[2].trim(),
        scenario_step: match[1].trim(),
        contains_sensitive_data: 'not stated',
        masking_applied: 'not stated',
        safe_to_share_externally: 'not stated',
      }));
    }
  }
  return evidence;
}

function countScenarioStatuses(text) {
  const counts = {};
  for (const match of text.matchAll(/^\s*-\s*Status:\s*([A-Z_]+)/gim)) {
    const status = normalizeStatus(match[1]);
    if (status) counts[status] = (counts[status] || 0) + 1;
  }
  for (const match of text.matchAll(/^\s*-\s*(?:\*\*)?(?:Result|ผล)(?:\*\*)?\s*[:：]\s*([A-Z_]+)/gim)) {
    const status = normalizeStatus(match[1]);
    if (status) counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

function buildSummaryFromMarkdown(text, args) {
  const h1 = extractFirst(/^#\s+(.+)$/m, text);
  const reportTitle = extractAnyMarkdownField(text, ['Report title', 'ชื่อรายงาน']) || h1;
  const project = args.project || extractAnyMarkdownField(text, ['Product/feature', 'โครงการ']);
  const statusCounts = countScenarioStatuses(text);
  const statusSummary = extractAnyMarkdownField(text, ['Status summary', 'สถานะสรุป']);
  const status = normalizeStatus(statusSummary) ||
    (statusCounts.FAIL ? 'FAIL' : statusCounts.BLOCKED ? 'BLOCKED' : statusCounts.PASS ? 'PASS' : '');
  const evidenceManifest = parseEvidenceManifest(text);

  return redactDeep({
    project,
    source: args.source || DEFAULT_SOURCE,
    schema_version: VERSION,
    report_title: reportTitle,
    status,
    summary: {
      environment: extractAnyMarkdownField(text, ['Environment', 'สภาพแวดล้อมที่ตรวจ']),
      base_url: extractAnyMarkdownField(text, ['Base URL']) || extractFirst(/(https?:\/\/[^\s`)]+)/i, text),
      build_version_commit: extractAnyMarkdownField(text, ['Build/version/commit']),
      date_time: extractAnyMarkdownField(text, ['Date/time', 'วันที่รายงาน']),
      tester_agent_tool: extractAnyMarkdownField(text, ['Tester/agent/tool']),
      test_account_classification: extractAnyMarkdownField(text, ['Test account classification']),
      credentials_secrets_included: extractAnyMarkdownField(text, ['Credentials/secrets included in report?']),
      scenario_counts: statusCounts,
    },
    evidence_manifest: evidenceManifest,
  });
}

function buildSummaryFromJson(text, args) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new CliError('Input JSON is malformed');
  }
  const summary = parsed.report_summary || parsed;
  return redactDeep({
    ...summary,
    project: args.project || summary.project,
    source: args.source || summary.source || DEFAULT_SOURCE,
    schema_version: summary.schema_version || VERSION,
  });
}

function validateSummary(summary) {
  const missing = [];
  for (const field of ['project', 'source', 'schema_version', 'report_title', 'status', 'summary', 'evidence_manifest']) {
    if (summary[field] === undefined || summary[field] === null || summary[field] === '' || (Array.isArray(summary[field]) && summary[field].length === 0)) missing.push(field);
  }
  if (summary.summary && typeof summary.summary !== 'object') missing.push('summary(object)');
  if (!Array.isArray(summary.evidence_manifest)) missing.push('evidence_manifest(array)');
  if (missing.length) {
    throw new CliError(`Report cannot be converted to bda-standard-ingest v${VERSION} report_summary; missing/invalid: ${missing.join(', ')}`);
  }
}

async function readTokenFile(path) {
  const token = (await readFile(path, 'utf8')).trim();
  if (!token) throw new CliError('Token file is empty');
  if (detectHighConfidenceSecrets(`Authorization: Bearer ${token}`)) {
    // The token itself is expected to be secret; this branch only validates without printing it.
    return token;
  }
  return token;
}

function readTokenEnv(name) {
  const token = (process.env[name] || '').trim();
  if (!token) throw new CliError(`Token environment variable is empty or unset: ${name}`);
  if (detectHighConfidenceSecrets(`Authorization: Bearer ${token}`)) {
    // The token itself is expected to be secret; this branch only validates without printing it.
    return token;
  }
  return token;
}

function resolveSendInputs(args) {
  const endpoint = args.endpoint || process.env.INNOHUB_INGEST_URL || process.env.BDA_INGEST_ENDPOINT || '';
  const tenant = args.tenant || process.env.INNOHUB_TENANT_ID || '';
  const tokenFile = args.tokenFile || process.env.INNOHUB_INGEST_TOKEN_FILE || '';
  const tokenEnv = args.tokenEnv || (!tokenFile && process.env.INNOHUB_INGEST_TOKEN ? 'INNOHUB_INGEST_TOKEN' : '');

  if (!endpoint) {
    throw new CliError('--endpoint or INNOHUB_INGEST_URL is required when --send is used');
  }
  if (!tokenFile && !tokenEnv) {
    throw new CliError('--token-file, --token-env, INNOHUB_INGEST_TOKEN_FILE, or INNOHUB_INGEST_TOKEN is required when --send is used');
  }
  if (tokenFile && tokenEnv) {
    throw new CliError('Choose one token source only: --token-file/INNOHUB_INGEST_TOKEN_FILE or --token-env/INNOHUB_INGEST_TOKEN');
  }
  return { endpoint, tenant, tokenFile, tokenEnv };
}

function validateEndpoint(endpoint) {
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    throw new CliError('--endpoint must be a valid URL');
  }
  if (!['https:', 'http:'].includes(url.protocol)) throw new CliError('--endpoint must be http(s)');
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
    throw new CliError('Refusing non-HTTPS remote endpoint; use HTTPS or localhost for local tests');
  }
  return url;
}

async function sendPayload(endpoint, token, payload, tenant) {
  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`,
    'user-agent': `bda-ai-dev-standard-ingest/${VERSION}`,
    'x-bda-schema-version': payload.standard_version,
    'x-bda-request-id': randomUUID(),
  };
  if (tenant) headers['x-innohub-tenant-id'] = tenant;
  const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
  const body = await response.text();
  if (!response.ok) throw new CliError(`Ingest endpoint rejected request with HTTP ${response.status}`, 4);
  let eventId = '';
  try {
    const parsed = JSON.parse(body);
    eventId = String(parsed.event_id || parsed.eventId || parsed.id || '');
  } catch {
    eventId = '';
  }
  return { status: response.status, event_id: redactText(eventId), response_body_redacted: redactText(body).slice(0, 1000) };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.file) throw new CliError('--file is required');
  const sendInputs = args.send ? resolveSendInputs(args) : null;

  let info;
  try {
    info = await stat(args.file);
  } catch {
    throw new CliError(`Input file not found: ${basename(args.file)}`, 2);
  }
  if (!info.isFile()) throw new CliError('Input path is not a file');
  if (info.size > MAX_INPUT_BYTES) throw new CliError(`Input file is too large; max ${MAX_INPUT_BYTES} bytes`);

  const raw = await readFile(args.file, 'utf8');
  if (detectHighConfidenceSecrets(raw)) {
    throw new CliError('Input report contains a high-confidence secret pattern; redact it before ingest', 3);
  }

  const summary = args.file.toLowerCase().endsWith('.json') ? buildSummaryFromJson(raw, args) : buildSummaryFromMarkdown(raw, args);
  validateSummary(summary);

  const payload = {
    type: 'test_report',
    standard_version: `test_report.v${VERSION}`,
    source: summary.source,
    created_at: new Date().toISOString(),
    payload: {
      title: summary.report_title,
      summary,
      status: summary.status,
      report_path: args.file,
    },
  };

  if (!args.send) {
    console.log(JSON.stringify({ mode: 'dry-run', payload }, null, 2));
    return;
  }

  const endpoint = validateEndpoint(sendInputs.endpoint);
  const token = sendInputs.tokenFile ? await readTokenFile(sendInputs.tokenFile) : readTokenEnv(sendInputs.tokenEnv);
  const result = await sendPayload(endpoint, token, payload, sendInputs.tenant);
  console.log(JSON.stringify({ mode: 'sent', endpoint: `${endpoint.origin}${endpoint.pathname}`, result }, null, 2));
}

main().catch(reportAndExit);
