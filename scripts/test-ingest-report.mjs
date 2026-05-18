#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const cli = join(root, 'scripts', 'send-ingest-report.mjs');

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, INNOHUB_INGEST_TOKEN: '', INNOHUB_INGEST_URL: '' },
  });
}

async function main() {
  const dir = await mkdtemp(join(tmpdir(), 'bda-ingest-report-test-'));
  try {
    const validReport = join(dir, 'valid-report.md');
    await writeFile(validReport, `# Test Scenario Report: Checkout smoke

## Summary
- Report title: Checkout smoke
- Product/feature: Demo Shop Checkout
- Environment: local
- Base URL: http://localhost:3000
- Build/version/commit: abc1234
- Date/time: 2026-05-18T13:30:00+07:00
- Tester/agent/tool: Hermes Agent
- Test account classification: synthetic test
- Credentials/secrets included in report? no only

## Test matrix
- Scenario ID: TC-001
  - Title: Checkout loads
  - Status: PASS
  - Severity if issue: none
  - Screenshot evidence: screenshots/TC-001-01-start.png

## Evidence manifest / screenshot inventory
- File: screenshots/TC-001-01-start.png
  - Scenario/step: TC-001 Step 1
  - Contains PII/secret/customer/payment data? no
  - Masking applied? not needed
  - Safe to share externally? yes
`);

    const dry = run(['--file', validReport]);
    assert.equal(dry.status, 0, dry.stderr);
    const payload = JSON.parse(dry.stdout);
    assert.equal(payload.mode, 'dry-run');
    assert.equal(payload.payload.report_summary.schema_version, '0.4.1');
    assert.equal(payload.payload.report_summary.project, 'Demo Shop Checkout');
    assert.equal(payload.payload.report_summary.status, 'PASS');
    assert.equal(payload.payload.report_summary.evidence_manifest.length, 1);

    const missing = run(['--file', join(dir, 'missing.md')]);
    assert.notEqual(missing.status, 0);
    assert.match(missing.stderr, /Input file not found/);

    const secretReport = join(dir, 'secret-report.md');
    await writeFile(secretReport, `${await (await import('node:fs/promises')).readFile(validReport, 'utf8')}
- Authorization: Bearer ghp_1234567890abcdefghijklmnopqrstuvwxyzABCD
`);
    const secret = run(['--file', secretReport]);
    assert.notEqual(secret.status, 0);
    assert.match(secret.stderr, /high-confidence secret/i);
    assert.doesNotMatch(secret.stderr, /ghp_1234567890/);
    assert.equal(secret.stdout, '');

    const sendNoAuth = run(['--file', validReport, '--send']);
    assert.notEqual(sendNoAuth.status, 0);
    assert.match(sendNoAuth.stderr, /--endpoint and --token-file are required/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

main().then(() => {
  console.log('PASS ingest report connector smoke tests');
}).catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
