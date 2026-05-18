#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const cli = join(root, 'scripts', 'sync-github-reports.mjs');

function run(args, env = {}) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, INNOHUB_INGEST_TOKEN: '', INNOHUB_INGEST_TOKEN_FILE: '', INNOHUB_INGEST_URL: '', INNOHUB_TENANT_ID: '', ...env },
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

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

async function writeReport(path, title = 'Checkout smoke') {
  await writeFile(path, `# Test Scenario Report: ${title}

## Summary
- Report title: ${title}
- Product/feature: Demo Shop Checkout
- Environment: local
- Base URL: http://localhost:3000
- Build/version/commit: abc1234
- Date/time: 2026-05-18T14:30:00+07:00
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
}

async function main() {
  const dir = await mkdtemp(join(tmpdir(), 'bda-github-sync-test-'));
  try {
    const repoDir = join(dir, 'repo');
    const stateFile = join(dir, 'state.json');
    await mkdir(join(repoDir, 'reports'), { recursive: true });
    await writeReport(join(repoDir, 'reports', 'test-scenario-report-checkout.md'));
    await writeFile(join(repoDir, 'notes.md'), '# not a report\n');

    const dry = run(['--repo-dir', repoDir, '--state-file', stateFile]);
    assert.equal(dry.status, 0, dry.stderr);
    const drySummary = JSON.parse(dry.stdout);
    assert.equal(drySummary.mode, 'dry-run');
    assert.equal(drySummary.candidates, 1);
    assert.equal(drySummary.validated, 1);
    assert.equal(drySummary.sent, 0);
    assert.equal(drySummary.skipped, 0);
    assert.deepEqual(drySummary.event_ids, []);
    assert.doesNotMatch(dry.stdout, /payload|authorization|Bearer/i);

    const sendNoEndpoint = run(['--repo-dir', repoDir, '--state-file', stateFile, '--send']);
    assert.notEqual(sendNoEndpoint.status, 0);
    assert.match(sendNoEndpoint.stderr, /--send requires --endpoint/i);

    let requests = 0;
    const server = createServer((req, res) => {
      let body = '';
      req.setEncoding('utf8');
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        requests += 1;
        const parsed = JSON.parse(body);
        assert.equal(parsed.type, 'test_report');
        assert.equal(req.headers.authorization, 'Bearer local-sync-token');
        res.writeHead(202, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ event_id: `evt_sync_${requests}` }));
      });
    });
    const port = await listen(server);
    try {
      const endpoint = `http://127.0.0.1:${port}/ingest`;
      const first = await runAsync(['--repo-dir', repoDir, '--state-file', stateFile, '--send', '--endpoint', endpoint], {
        INNOHUB_INGEST_TOKEN: 'local-sync-token',
      });
      assert.equal(first.status, 0, first.stderr);
      const firstSummary = JSON.parse(first.stdout);
      assert.equal(firstSummary.sent, 1);
      assert.equal(firstSummary.skipped, 0);
      assert.deepEqual(firstSummary.event_ids, ['evt_sync_1']);
      assert.equal(requests, 1);
      assert.doesNotMatch(first.stdout, /local-sync-token|payload|Bearer/i);

      const state = JSON.parse(await readFile(stateFile, 'utf8'));
      assert.equal(state.entries['reports/test-scenario-report-checkout.md'].event_id, 'evt_sync_1');

      const duplicate = await runAsync(['--repo-dir', repoDir, '--state-file', stateFile, '--send', '--endpoint', endpoint], {
        INNOHUB_INGEST_TOKEN: 'local-sync-token',
      });
      assert.equal(duplicate.status, 0, duplicate.stderr);
      const duplicateSummary = JSON.parse(duplicate.stdout);
      assert.equal(duplicateSummary.sent, 0);
      assert.equal(duplicateSummary.skipped, 1);
      assert.equal(requests, 1);

      const forced = await runAsync(['--repo-dir', repoDir, '--state-file', stateFile, '--send', '--endpoint', endpoint, '--force'], {
        INNOHUB_INGEST_TOKEN: 'local-sync-token',
      });
      assert.equal(forced.status, 0, forced.stderr);
      const forcedSummary = JSON.parse(forced.stdout);
      assert.equal(forcedSummary.sent, 1);
      assert.equal(forcedSummary.skipped, 0);
      assert.deepEqual(forcedSummary.event_ids, ['evt_sync_2']);
      assert.equal(requests, 2);
    } finally {
      server.close();
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

main().then(() => {
  console.log('PASS GitHub/KitHub report sync smoke tests');
}).catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
