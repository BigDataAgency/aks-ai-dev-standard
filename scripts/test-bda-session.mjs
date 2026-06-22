#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repo = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "bda-session-test-"));
const home = path.join(temp, "home");
const work = path.join(temp, "work");
fs.mkdirSync(path.join(home, ".bda-skills"), { recursive: true });
fs.mkdirSync(work, { recursive: true });
fs.writeFileSync(path.join(home, ".bda-skills", "config.json"), JSON.stringify({
  employee_code: "BDA999",
  employee_group: "dev",
  work_event_url: "https://example.com/bda/work-events",
  api_key: "sk-test-redacted",
}, null, 2));

function run(args, options = {}) {
  const result = spawnSync("node", [path.join(repo, "scripts/bda.mjs"), ...args], {
    cwd: work,
    env: { ...process.env, HOME: home },
    text: true,
    encoding: "utf8",
  });
  if (options.expectFailure) {
    assert.notEqual(result.status, 0, result.stdout + result.stderr);
    return result;
  }
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return result;
}

const help = run(["help"]);
assert.match(help.stdout, /bda start/);
assert.match(help.stdout, /bda-dev/);
assert.doesNotMatch(help.stdout, /bda-dev-plan-execute/);
assert.match(help.stdout, /bda-session\/0\.10\.4/);

const version = run(["version"]);
const versionJson = JSON.parse(version.stdout);
assert.equal(versionJson.ok, true);
assert.equal(versionJson.cli_version, "0.10.4");

const start = run([
  "start",
  "--project", "BDA-InnoHub",
  "--task", "debug login error",
  "--command", "bda-dev-debug",
  "--dry-run",
]);
const startJson = JSON.parse(start.stdout);
assert.equal(startJson.ok, true);
assert.equal(startJson.session.employee_code, "BDA999");
assert.equal(startJson.session.command, "bda-dev");
assert.equal(startJson.session.work_type, "debug");
assert.equal(startJson.send_result.dry_run, true);
const activeSessionId = startJson.session.session_id;

const current = run(["current"]);
assert.equal(JSON.parse(current.stdout).active, true);

const duplicateStart = run([
  "start",
  "--project", "BDA-InnoHub",
  "--task", "new task should not overwrite active session",
  "--command", "bda-dev",
  "--dry-run",
], { expectFailure: true });
const duplicateStartJson = JSON.parse(duplicateStart.stderr);
assert.equal(duplicateStartJson.ok, false);
assert.match(duplicateStartJson.error, /Active BDA session already exists/);
assert.equal(duplicateStartJson.active_session.session_id, activeSessionId);
const currentAfterDuplicate = run(["current"]);
assert.equal(JSON.parse(currentAfterDuplicate.stdout).session.session_id, activeSessionId);

const event = run([
  "event",
  "--task", "review login fix",
  "--command", "bda-dev-review",
  "--status", "done",
  "--dry-run",
]);
const eventJson = JSON.parse(event.stdout);
assert.equal(eventJson.event.command, "bda-dev");
assert.equal(eventJson.event.work_type, "review");
assert.equal(eventJson.event.session_id, activeSessionId);

const stop = run([
  "stop",
  "--status", "done",
  "--outcome", "login validation fixed",
  "--next-step", "deploy staging",
  "--dry-run",
]);
const stopJson = JSON.parse(stop.stdout);
assert.equal(stopJson.ok, true);
assert.equal(stopJson.event.status, "done");
assert.equal(stopJson.event.command, "bda stop");
assert.equal(stopJson.event.session_id, activeSessionId);
assert.equal(fs.existsSync(path.join(work, ".bda-skills", "current-session.json")), false);
assert.equal(fs.existsSync(stopJson.archived_session), true);

console.log("bda session CLI smoke test passed");
