#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const cli = join(root, 'scripts', 'send-ingest-report.mjs');

function run(args, env = {}) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, INNOHUB_INGEST_TOKEN: '', INNOHUB_INGEST_TOKEN_FILE: '', INNOHUB_INGEST_URL: '', INNOHUB_TENANT_ID: '', ...env },
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function runAsync(args, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cli, ...args], {
      cwd: root,
      env: { ...process.env, INNOHUB_INGEST_TOKEN: '', INNOHUB_INGEST_TOKEN_FILE: '', INNOHUB_INGEST_URL: '', INNOHUB_TENANT_ID: '', ...env },
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
    assert.equal(payload.payload.standard_version, 'test_report.v0.4.1');
    assert.equal(payload.payload.payload.summary.project, 'Demo Shop Checkout');
    assert.equal(payload.payload.payload.summary.status, 'PASS');
    assert.equal(payload.payload.payload.summary.evidence_manifest.length, 1);

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
    assert.match(sendNoAuth.stderr, /--endpoint or INNOHUB_INGEST_URL is required/);

    let capturedRequest = null;
    const server = createServer((req, res) => {
      let body = '';
      req.setEncoding('utf8');
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        capturedRequest = { headers: req.headers, body: JSON.parse(body) };
        res.writeHead(202, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ event_id: 'evt_test_12345' }));
      });
    });
    const port = await listen(server);
    try {
      const sent = await runAsync(['--file', validReport, '--send'], {
        INNOHUB_INGEST_URL: `http://127.0.0.1:${port}/api/ingest`,
        INNOHUB_INGEST_TOKEN: 'staff-test-token-value',
        INNOHUB_TENANT_ID: 'tenant-test',
      });
      assert.equal(sent.status, 0, sent.stderr);
      const sentOutput = JSON.parse(sent.stdout);
      assert.equal(sentOutput.mode, 'sent');
      assert.equal(sentOutput.endpoint, `http://127.0.0.1:${port}/api/ingest`);
      assert.equal(sentOutput.result.status, 202);
      assert.equal(sentOutput.result.event_id, 'evt_test_12345');
      assert.equal(capturedRequest.headers.authorization, 'Bearer staff-test-token-value');
      assert.equal(capturedRequest.headers['x-innohub-tenant-id'], 'tenant-test');
      assert.equal(capturedRequest.body.payload.summary.project, 'Demo Shop Checkout');
      assert.doesNotMatch(sent.stdout, /staff-test-token-value/);
    } finally {
      server.close();
    }
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
