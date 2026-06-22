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
fs.mkdirSync(path.join(home, ".hermes"), { recursive: true });
fs.mkdirSync(work, { recursive: true });
fs.writeFileSync(path.join(home, ".bda-skills", "config.json"), JSON.stringify({
  employee_code: "BDA999",
  employee_group: "dev",
  work_event_url: "https://example.com/bda/work-events",
  api_key: "sk-test-redacted",
}, null, 2));
fs.writeFileSync(path.join(home, ".hermes", "config.yaml"), `model:
  provider: bda
  default: bda/qwen3-coder
  context_length: 262144
  max_tokens: 1024
  compression_model: bda/gemma-4-26b-a4b-local
providers:
  bda:
    name: BDA AI Gateway
    api: https://ai.bda.co.th/v1
    key_env: BDA_AI_ROUTER_API_KEY
    models:
      bda/qwen3-coder:
        context_length: 32768
      bda/qwen3.6-35b-a3b-local:
        context_length: 65536
      bda/gemma-4-26b-a4b-local:
        context_length: 262144
custom_providers:
  - name: bda-router
    base_url: https://ai.bda.co.th/v1
agent:
  system_prompt: |
    You are running with BDA AI Dev Standard v0.10.3.
    During an active session, treat bda-dev-*, bda-nondev-*, and bda-pm-* prefixes as real BDA work commands and send/prepare bda event.
    Command catalog: bda-dev-debug, bda-dev-review, bda-dev-tdd, bda-dev-plan-discuss, bda-dev-plan-create, bda-dev-plan-execute, bda-dev-plan-review, bda-dev-plan-verify, bda-nondev-explore, bda-nondev-write, bda-pm-log, bda-pm-status, bda-pm-risk, bda-pm-followup, bda-pm-requirement, bda-pm-standup.
`);

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
assert.match(help.stdout, /bda-session\/0\.10\.14/);
assert.match(help.stdout, /bda update/);
assert.match(help.stdout, /bda config-status/);
assert.match(help.stdout, /bda config-clean/);

const version = run(["version"]);
const versionJson = JSON.parse(version.stdout);
assert.equal(versionJson.ok, true);
assert.equal(versionJson.cli_version, "0.10.14");

const updateDryRun = run(["update", "--dry-run"]);
const updateJson = JSON.parse(updateDryRun.stdout);
assert.equal(updateJson.ok, true);
assert.equal(updateJson.action, "update");
assert.equal(updateJson.dry_run, true);
assert.equal(updateJson.hermes_config.config_paths[0].changed, true);
assert.ok(updateJson.hermes_config.config_paths[0].before_models.includes("bda/qwen3-coder"));
assert.ok(!updateJson.hermes_config.config_paths[0].after_models.includes("bda/qwen3-coder"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/qwable-27b-local"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/qwythos-9b-local"));
assert.ok(!updateJson.hermes_config.config_paths[0].after_models.includes("bda/dev-local"));
assert.ok(!updateJson.hermes_config.config_paths[0].after_models.includes("bda/nondev-local"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/deepseek-fast-paid-cloud"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/deepseek-paid-cloud"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/qwen3.7-plus-paid-cloud"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/qwen3.7-max-paid-cloud"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/glm-5.1-paid-cloud"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/minimax-m3-paid-cloud"));
assert.equal(updateJson.hermes_config.config_paths[0].after_models.length, 8);
assert.ok(!updateJson.hermes_config.config_paths[0].after_models.includes("bda/gemma-4-26b-a4b-local"));
assert.ok(!updateJson.hermes_config.config_paths[0].after_models.includes("bda/gpt-oss-20b-local"));
assert.ok(!updateJson.hermes_config.config_paths[0].after_models.includes("bda/kimi-k2.7-code-paid-cloud"));

const configStatus = run(["config-status"]);
const configStatusJson = JSON.parse(configStatus.stdout);
assert.equal(configStatusJson.ok, true);
assert.equal(configStatusJson.hermes_config.config_paths[0].changed, true);

const configClean = run(["config-clean"]);
const configCleanJson = JSON.parse(configClean.stdout);
assert.equal(configCleanJson.ok, true);
assert.equal(configCleanJson.hermes_config.config_paths[0].changed, true);
const configStatusAfterClean = run(["config-status"]);
const configStatusAfterCleanJson = JSON.parse(configStatusAfterClean.stdout);
assert.equal(configStatusAfterCleanJson.hermes_config.config_paths[0].changed, false);

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
