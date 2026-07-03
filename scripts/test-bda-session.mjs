#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

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
    api: https://ai-local.scmc.digital/v1
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
    base_url: https://ai-local.scmc.digital/v1
agent:
  system_prompt: |
    You are running with BDA AI Dev Standard v0.10.3.
    During an active session, treat bda-dev-*, bda-nondev-*, and bda-pm-* prefixes as real BDA work commands and send/prepare bda event.
    Command catalog: bda-dev-debug, bda-dev-review, bda-dev-tdd, bda-dev-plan-discuss, bda-dev-plan-create, bda-dev-plan-execute, bda-dev-plan-review, bda-dev-plan-verify, bda-nondev-explore, bda-nondev-write, bda-pm-log, bda-pm-status, bda-pm-risk, bda-pm-followup, bda-pm-requirement, bda-pm-standup.
`);

function run(args, options = {}) {
  const runHome = options.home || home;
  const runWork = options.work || work;
  const result = spawnSync("node", [path.join(repo, "scripts/bda.mjs"), ...args], {
    cwd: runWork,
    env: { ...process.env, HOME: runHome, USERPROFILE: runHome },
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

function runInstaller(args, options = {}) {
  const runHome = options.home || home;
  const runWork = options.work || work;
  const result = spawnSync("node", [path.join(repo, "scripts/install-bda-standard.mjs"), ...args], {
    cwd: runWork,
    env: { ...process.env, HOME: runHome, USERPROFILE: runHome },
    text: true,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return result;
}

function runAsync(args, options = {}) {
  const runHome = options.home || home;
  const runWork = options.work || work;
  return new Promise((resolve, reject) => {
    const child = spawn("node", [path.join(repo, "scripts/bda.mjs"), ...args], {
      cwd: runWork,
      env: { ...process.env, HOME: runHome, USERPROFILE: runHome },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (status) => {
      if (status !== 0) {
        reject(new Error(stdout + stderr));
        return;
      }
      resolve({ stdout, stderr, status });
    });
  });
}

const help = run(["help"]);
assert.match(help.stdout, /bda start/);
assert.match(help.stdout, /bda-dev/);
assert.doesNotMatch(help.stdout, /bda-dev-plan-execute/);
assert.match(help.stdout, /bda-session\/0\.11\.6/);
assert.match(help.stdout, /TERMINAL COMMANDS/);
assert.match(help.stdout, /CHAT-ONLY PROMPT PREFIXES/);
assert.match(help.stdout, /ถ้าพิมพ์ใน terminal ให้ใช้ bda start \/ bda event \/ bda stop แทน/);
assert.match(help.stdout, /bda update/);
assert.match(help.stdout, /bda config-status/);
assert.match(help.stdout, /bda config-clean/);
assert.match(help.stdout, /bda doctor/);
assert.match(help.stdout, /bda hermes-reset/);
assert.match(help.stdout, /bda hermes-clean-context --yes/);
assert.match(help.stdout, /bda hermes-light-mode --yes/);

const version = run(["version"]);
const versionJson = JSON.parse(version.stdout);
assert.equal(versionJson.ok, true);
assert.equal(versionJson.cli_version, "0.11.6");

const privateInstallerConfigPath = path.join(temp, "installer-private-config.json");
fs.writeFileSync(privateInstallerConfigPath, JSON.stringify({
  employee_code: "BDA999",
  employee_group: "dev",
  api_key: "sk-installer-secret",
  ai_model: "bda/dev",
}, null, 2));
const installerDryRun = runInstaller([
  "--private-config", privateInstallerConfigPath,
  "--standard-dir", path.join(temp, "standard-target"),
  "--dry-run",
]);
const installerDryRunJson = JSON.parse(installerDryRun.stdout);
assert.equal(installerDryRunJson.action, "install-bda-standard");
assert.equal(installerDryRunJson.installer_version, "installer/0.11.6");
assert.equal(installerDryRunJson.dry_run, true);
assert.equal(installerDryRunJson.config.employee_code, "BDA999");
assert.match(installerDryRunJson.config.api_key, /^sha256:/);
assert.doesNotMatch(installerDryRun.stdout, /sk-installer-secret/);

const updateDryRun = run(["update", "--dry-run"]);
const updateJson = JSON.parse(updateDryRun.stdout);
assert.equal(updateJson.ok, true);
assert.equal(updateJson.action, "update");
assert.equal(updateJson.dry_run, true);
assert.equal(updateJson.inventory_send_result.dry_run, true);
assert.equal(updateJson.inventory_send_result.event.event_kind, "bda_inventory");
assert.equal(updateJson.inventory_send_result.event.utility_command, "bda update");
assert.equal(updateJson.inventory_send_result.event.bda_cli_version, "0.11.6");
assert.equal(updateJson.hermes_config.config_paths[0].changed, true);
assert.ok(updateJson.hermes_config.config_paths[0].before_models.includes("bda/qwen3-coder"));
assert.ok(!updateJson.hermes_config.config_paths[0].after_models.includes("bda/qwen3-coder"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/qwable-27b-local"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/qwythos-9b-local"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/nondev"));
assert.ok(!updateJson.hermes_config.config_paths[0].after_models.includes("bda/auto-default-local"));
assert.ok(!updateJson.hermes_config.config_paths[0].after_models.includes("bda/free-fast-local"));
assert.ok(!updateJson.hermes_config.config_paths[0].after_models.includes("bda/qwen3.6-local"));
assert.ok(!updateJson.hermes_config.config_paths[0].after_models.includes("bda/dev-local"));
assert.ok(!updateJson.hermes_config.config_paths[0].after_models.includes("bda/nondev-local"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/deepseek-fast-paid-cloud"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/deepseek-paid-cloud"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/deepseek-v4-pro-paid-cloud"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/qwen3.7-plus-paid-cloud"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/qwen3.7-max-paid-cloud"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/glm-5.1-paid-cloud"));
assert.ok(updateJson.hermes_config.config_paths[0].after_models.includes("bda/minimax-m3-paid-cloud"));
assert.equal(updateJson.hermes_config.config_paths[0].after_models.length, 10);
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

fs.mkdirSync(path.join(home, ".hermes", "sessions"), { recursive: true });
fs.mkdirSync(path.join(home, ".hermes", "pastes"), { recursive: true });
fs.mkdirSync(path.join(home, ".hermes", "skills", "bda-ai-dev-standard"), { recursive: true });
fs.mkdirSync(path.join(home, ".hermes", "skills", "creative"), { recursive: true });
fs.mkdirSync(path.join(home, ".hermes", "skills", "mlops"), { recursive: true });
fs.writeFileSync(path.join(home, ".hermes", "sessions", "request_dump_test.json"), "{}\n");
fs.writeFileSync(path.join(home, ".hermes", "pastes", "paste_1.txt"), "large stale paste\n");
fs.writeFileSync(path.join(home, ".hermes", "state.db"), "stale state\n");
fs.writeFileSync(path.join(home, ".hermes", "skills", "bda-ai-dev-standard", "SKILL.md"), "BDA skill\n");
fs.writeFileSync(path.join(home, ".hermes", "skills", "creative", "SKILL.md"), "Creative skill\n");
fs.writeFileSync(path.join(home, ".hermes", "skills", "mlops", "SKILL.md"), "MLOps skill\n");
fs.writeFileSync(path.join(home, ".hermes", ".skills_prompt_snapshot.json"), "{}\n");
const doctor = run(["doctor"]);
const doctorJson = JSON.parse(doctor.stdout);
assert.equal(doctorJson.action, "doctor");
assert.equal(doctorJson.inventory_send_result.dry_run, true);
assert.equal(doctorJson.inventory_send_result.event.event_kind, "bda_inventory");
assert.equal(doctorJson.inventory_send_result.event.utility_command, "bda doctor");
assert.equal(doctorJson.active_bda_session, false);
assert.ok(doctorJson.hermes_state_total_bytes > 0);
assert.ok(doctorJson.request_dumps.some((entry) => entry.count === 1));
assert.ok(doctorJson.hermes_skills.some((entry) => entry.entries >= 3));
const hermesLightModeDryRun = run(["hermes-light-mode"]);
const hermesLightModeDryRunJson = JSON.parse(hermesLightModeDryRun.stdout);
assert.equal(hermesLightModeDryRunJson.ok, true);
assert.equal(hermesLightModeDryRunJson.dry_run, true);
assert.equal(fs.existsSync(path.join(home, ".hermes", "skills", "creative")), true);
const hermesLightMode = run(["hermes-light-mode", "--yes"]);
const hermesLightModeJson = JSON.parse(hermesLightMode.stdout);
assert.equal(hermesLightModeJson.ok, true);
assert.equal(hermesLightModeJson.action, "hermes-light-mode");
assert.equal(fs.existsSync(path.join(home, ".hermes", "skills", "bda-ai-dev-standard")), true);
assert.equal(fs.existsSync(path.join(home, ".hermes", "skills", "creative")), false);
assert.equal(fs.existsSync(path.join(home, ".hermes", "skills", "mlops")), false);
assert.equal(fs.existsSync(path.join(home, ".hermes", ".skills_prompt_snapshot.json")), false);
assert.ok(hermesLightModeJson.hermes_skills.moved.some((entry) => entry.from.endsWith(path.join("skills", "creative"))));
const hermesResetDryRun = run(["hermes-reset", "--dry-run"]);
const hermesResetDryRunJson = JSON.parse(hermesResetDryRun.stdout);
assert.equal(hermesResetDryRunJson.ok, true);
assert.equal(hermesResetDryRunJson.dry_run, true);
assert.equal(fs.existsSync(path.join(home, ".hermes", "state.db")), true);
const hermesReset = run(["hermes-reset"]);
const hermesResetJson = JSON.parse(hermesReset.stdout);
assert.equal(hermesResetJson.ok, true);
assert.equal(hermesResetJson.action, "hermes-reset");
assert.equal(fs.existsSync(path.join(home, ".hermes", "state.db")), false);
assert.equal(fs.existsSync(path.join(home, ".hermes", "sessions")), false);
assert.equal(fs.existsSync(path.join(home, ".hermes")), true);
assert.equal(fs.existsSync(path.join(home, ".hermes", "config.yaml")), true);
assert.equal(hermesResetJson.hermes_state.moved.some((entry) => entry.from === path.join(home, ".hermes")), false);
assert.equal(hermesResetJson.hermes_state.moved.some((entry) => entry.from.endsWith("Hermes.app")), false);
assert.ok(hermesResetJson.hermes_state.moved.some((entry) => entry.from.endsWith(path.join(".hermes", "state.db"))));
fs.writeFileSync(path.join(home, ".hermes", "state.db"), "stale state again\n");
const hermesCleanContext = run(["hermes-clean-context", "--yes"]);
const hermesCleanContextJson = JSON.parse(hermesCleanContext.stdout);
assert.equal(hermesCleanContextJson.ok, true);
assert.equal(hermesCleanContextJson.action, "hermes-reset");
assert.equal(fs.existsSync(path.join(home, ".hermes", "state.db")), false);
fs.writeFileSync(path.join(home, ".hermes", "state.db"), "stale state via doctor\n");
const doctorFix = run(["doctor", "--fix"]);
const doctorFixJson = JSON.parse(doctorFix.stdout);
assert.equal(doctorFixJson.action, "doctor");
assert.equal(doctorFixJson.inventory_send_result.event.utility_command, "bda doctor --fix");
assert.equal(fs.existsSync(path.join(home, ".hermes", "state.db")), false);
assert.equal(fs.existsSync(path.join(home, ".hermes")), true);
assert.equal(fs.existsSync(path.join(home, ".hermes", "config.yaml")), true);
assert.equal(doctorFixJson.fix_result.moved.some((entry) => entry.from === path.join(home, ".hermes")), false);
assert.equal(doctorFixJson.fix_result.moved.some((entry) => entry.from.endsWith("Hermes.app")), false);

const start = run([
  "start",
  "--project", "BDA-InnoHub",
  "--task", "debug login error",
  "--command", "bda-dev-debug",
  "--dry-run",
]);
const startJson = JSON.parse(start.stdout);
assert.equal(startJson.ok, true);
assert.equal(startJson.session_file, path.join(home, ".bda-skills", "current-session.json"));
assert.equal(startJson.session.employee_code, "BDA999");
assert.equal(startJson.session.command, "bda-dev");
assert.equal(startJson.session.work_type, "debug");
assert.equal(startJson.send_result.dry_run, true);
const activeSessionId = startJson.session.session_id;

const hermesOnlyHome = path.join(temp, "hermes-only-home");
const hermesOnlyWork = path.join(temp, "hermes-only-work");
fs.mkdirSync(path.join(hermesOnlyHome, ".hermes"), { recursive: true });
fs.mkdirSync(hermesOnlyWork, { recursive: true });
fs.writeFileSync(path.join(hermesOnlyHome, ".hermes", ".env"), [
  "BDA_EMPLOYEE_CODE=BDA777",
  "BDA_EMPLOYEE_GROUP=dev",
  "BDA_AI_ROUTER_BASE_URL=https://ai.example.test/v1",
  "BDA_AI_ROUTER_API_KEY=sk-hermes-env-test",
  "BDA_AI_MODEL=bda/dev",
  "",
].join("\n"));
const hermesStart = run([
  "start",
  "--project", "HermesEnv",
  "--task", "debug metadata binding",
  "--command", "bda-dev",
  "--work-type", "debug",
  "--dry-run",
], { home: hermesOnlyHome, work: hermesOnlyWork });
const hermesStartJson = JSON.parse(hermesStart.stdout);
assert.equal(hermesStartJson.session.employee_code, "BDA777");
assert.equal(hermesStartJson.session.ai_provider, "bda-gateway");
assert.equal(hermesStartJson.session.ai_model, "bda/dev");
assert.equal(hermesStartJson.session.used_bda_gateway, true);
assert.equal(hermesStartJson.send_result.dry_run, true);
assert.equal(hermesStartJson.send_result.reason, "dry-run requested");

const current = run(["current"]);
assert.equal(JSON.parse(current.stdout).active, true);

const legacyHome = path.join(temp, "legacy-home");
const legacyWork = path.join(temp, "legacy-work");
fs.mkdirSync(path.join(legacyHome, ".bda-skills"), { recursive: true });
fs.mkdirSync(path.join(legacyWork, ".bda-skills"), { recursive: true });
fs.writeFileSync(path.join(legacyHome, ".bda-skills", "config.json"), JSON.stringify({
  employee_code: "BDA555",
  employee_group: "dev",
  work_event_url: "https://example.com/bda/work-events",
  api_key: "sk-test-redacted",
}, null, 2));
const legacySession = {
  version: "bda-session/0.10.19",
  employee_code: "BDA555",
  employee_group: "dev",
  project: "LegacyPath",
  tool: "hermes-desktop-agent",
  command: "bda-dev",
  task_summary: "legacy session path",
  session_id: "legacy-session-path-test",
  work_type: "debug",
  status: "active",
  started_at: new Date().toISOString(),
  events: [],
};
const legacyFile = path.join(legacyWork, ".bda-skills", "current-session.json");
const canonicalLegacyFile = path.join(legacyHome, ".bda-skills", "current-session.json");
fs.writeFileSync(legacyFile, JSON.stringify(legacySession, null, 2) + "\n");
const migratedCurrent = run(["current"], { home: legacyHome, work: legacyWork });
const migratedCurrentJson = JSON.parse(migratedCurrent.stdout);
assert.equal(migratedCurrentJson.active, true);
assert.equal(migratedCurrentJson.session.session_id, "legacy-session-path-test");
assert.equal(migratedCurrentJson.session_file, canonicalLegacyFile);
assert.equal(fs.existsSync(canonicalLegacyFile), true);
assert.equal(fs.existsSync(legacyFile), false);
const migratedDuplicateStart = run([
  "start",
  "--project", "LegacyPath",
  "--task", "should not duplicate migrated session",
  "--command", "bda-dev",
  "--dry-run",
], { home: legacyHome, work: legacyWork, expectFailure: true });
assert.match(JSON.parse(migratedDuplicateStart.stderr).error, /Active BDA session already exists/);

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

const server = http.createServer((request, response) => {
  let body = "";
  request.setEncoding("utf8");
  request.on("data", (chunk) => {
    body += chunk;
  });
  request.on("end", () => {
    const payload = JSON.parse(body || "{}");
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({
      ok: true,
      event_file: "test.jsonl",
      session_id: "server-reused-session",
      client_session_id: payload.session_id || "",
      deduped_start: true,
      session_id_source: "server_deduped_start",
    }));
  });
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
try {
  const address = server.address();
  const synced = await runAsync([
    "start",
    "--project", "BDA-InnoHub",
    "--task", "server dedupe",
    "--command", "bda-dev",
    "--url", `http://127.0.0.1:${address.port}/bda/work-events`,
  ]);
  const syncedJson = JSON.parse(synced.stdout);
  assert.equal(syncedJson.session.session_id, "server-reused-session");
  assert.equal(syncedJson.session.server_deduped_start, true);
  assert.equal(JSON.parse(fs.readFileSync(path.join(home, ".bda-skills", "current-session.json"), "utf8")).session_id, "server-reused-session");
} finally {
  await new Promise((resolve) => server.close(resolve));
}

console.log("bda session CLI smoke test passed");
