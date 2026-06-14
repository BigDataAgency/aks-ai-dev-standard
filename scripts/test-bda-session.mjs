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
assert.match(help.stdout, /bda-dev-debug/);

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
assert.equal(startJson.session.command, "bda-dev-debug");
assert.equal(startJson.send_result.dry_run, true);

const current = run(["current"]);
assert.equal(JSON.parse(current.stdout).active, true);

const event = run([
  "event",
  "--task", "review login fix",
  "--command", "bda-dev-review",
  "--status", "done",
  "--dry-run",
]);
assert.equal(JSON.parse(event.stdout).event.command, "bda-dev-review");

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
assert.equal(fs.existsSync(path.join(work, ".bda-skills", "current-session.json")), false);
assert.equal(fs.existsSync(stopJson.archived_session), true);

console.log("bda session CLI smoke test passed");
