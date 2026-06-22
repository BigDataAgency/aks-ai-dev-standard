#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { execFileSync } from "node:child_process";

const DEFAULT_URL = "https://example.com/bda/work-events";
const SESSION_VERSION = "bda-session/0.10.12";
const STANDARD_REPO_URL = "https://github.com/BigDataAgency/bda-ai-dev-standard.git";
const MAC_HERMES_APP_SUPPORT = path.join(os.homedir(), "Library", "Application Support", "Hermes");
const HERMES_CONFIG_PATHS = Array.from(new Set([
  path.join(os.homedir(), ".hermes", "config.yaml"),
  path.join(MAC_HERMES_APP_SUPPORT, "config.yaml"),
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "config.yaml") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "config.yaml") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes", "config.yaml") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes", "config.yaml") : "",
].filter(Boolean)));
const HERMES_CACHE_PATHS = [
  path.join(os.homedir(), ".hermes", "provider_models_cache.json"),
  path.join(os.homedir(), ".hermes", "models_dev_cache.json"),
  path.join(os.homedir(), ".hermes", "cache", "model_catalog.json"),
  path.join(MAC_HERMES_APP_SUPPORT, "provider_models_cache.json"),
  path.join(MAC_HERMES_APP_SUPPORT, "models_dev_cache.json"),
  path.join(MAC_HERMES_APP_SUPPORT, "cache", "model_catalog.json"),
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "provider_models_cache.json") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "models_dev_cache.json") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "cache", "model_catalog.json") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "provider_models_cache.json") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "models_dev_cache.json") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "cache", "model_catalog.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes", "provider_models_cache.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes", "models_dev_cache.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes", "cache", "model_catalog.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes", "provider_models_cache.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes", "models_dev_cache.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes", "cache", "model_catalog.json") : "",
].filter(Boolean);

const BDA_HERMES_CONFIG_BLOCK = `model:
  provider: bda
  default: bda/dev-local
  context_length: 131072
  max_tokens: 8192
  compression_model: bda/nondev-local
  auxiliary_compression_model: bda/nondev-local
auxiliary:
  compression:
    provider: bda
    model: bda/nondev-local
    context_length: 262144
providers:
  bda:
    name: BDA AI Gateway
    api: https://ai.bda.co.th/v1
    key_env: BDA_AI_ROUTER_API_KEY
    transport: openai_chat
    default_model: bda/dev-local
    discover_models: false
    models:
      bda/nondev-local:
        context_length: 262144
      bda/dev-local:
        context_length: 131072
`;

const COMMANDS = [
  ["bda-dev", "dev", "งาน dev/code/debug/review/test แบบ targeted"],
  ["bda-nondev", "nondev", "งานเอกสาร/สรุป/วิเคราะห์/operation"],
  ["bda-pm", "pm", "งาน PM/status/risk/requirement เฉพาะ PM/lead"],
];

const LEGACY_COMMANDS = new Map([
  ["bda-dev-debug", ["bda-dev", "debug"]],
  ["bda-dev-review", ["bda-dev", "review"]],
  ["bda-dev-tdd", ["bda-dev", "test"]],
  ["bda-dev-plan-discuss", ["bda-dev", "plan"]],
  ["bda-dev-plan-create", ["bda-dev", "plan"]],
  ["bda-dev-plan-execute", ["bda-dev", "implementation"]],
  ["bda-dev-plan-review", ["bda-dev", "review"]],
  ["bda-dev-plan-verify", ["bda-dev", "verification"]],
  ["bda-nondev-explore", ["bda-nondev", "explore"]],
  ["bda-nondev-write", ["bda-nondev", "documentation"]],
  ["bda-pm-log", ["bda-pm", "pm-log"]],
  ["bda-pm-status", ["bda-pm", "pm-status"]],
  ["bda-pm-risk", ["bda-pm", "pm-risk"]],
  ["bda-pm-followup", ["bda-pm", "pm-followup"]],
  ["bda-pm-requirement", ["bda-pm", "pm-requirement"]],
  ["bda-pm-standup", ["bda-pm", "pm-standup"]],
]);

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      out._.push(arg);
      continue;
    }
    const key = arg.slice(2).replaceAll("-", "_");
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function loadConfig() {
  const globalConfig = readJson(path.join(os.homedir(), ".bda-skills", "config.json"));
  const projectConfig = readJson(path.join(process.cwd(), ".bda-skills", "config.json"));
  return { ...globalConfig, ...projectConfig };
}

function configDir(config) {
  return path.resolve(config.config_dir || path.join(process.cwd(), ".bda-skills"));
}

function sessionPath(config) {
  return path.resolve(config.session_file || path.join(configDir(config), "current-session.json"));
}

function envOrConfig(envNames, config, keys, fallback = "") {
  for (const envName of envNames) {
    if (process.env[envName]) return process.env[envName];
  }
  for (const key of keys) {
    if (config[key]) return String(config[key]);
  }
  return fallback;
}

function boolValue(value) {
  if (value === true) return true;
  if (!value) return false;
  return ["1", "true", "yes", "y"].includes(String(value).toLowerCase());
}

function numValue(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function slug(value) {
  return String(value || "work")
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "work";
}

function inferWorkType(command, fallback = "ai-work") {
  const normalized = String(command || "").replace(/^\//, "");
  if (LEGACY_COMMANDS.has(normalized)) return LEGACY_COMMANDS.get(normalized)[1];
  const found = COMMANDS.find(([name]) => name === normalized);
  return found ? found[1] : fallback;
}

function normalizeCommand(command) {
  const normalized = String(command || "").trim().replace(/^\//, "");
  if (LEGACY_COMMANDS.has(normalized)) return LEGACY_COMMANDS.get(normalized)[0];
  return normalized;
}

function buildSessionId(employeeCode, project, command) {
  const day = new Date().toISOString().slice(0, 10);
  const random = crypto.randomBytes(3).toString("hex");
  return `${day}-${employeeCode || "unknown"}-${slug(project)}-${slug(command)}-${random}`;
}

async function askMissing(args, fields) {
  if (!process.stdin.isTTY) return args;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    for (const [key, question] of fields) {
      if (String(args[key] || "").trim()) continue;
      const answer = await rl.question(`${question}: `);
      if (answer.trim()) args[key] = answer.trim();
    }
  } finally {
    rl.close();
  }
  return args;
}

function missingFields(event) {
  return ["employee_code", "project", "tool", "command", "task_summary", "session_id", "work_type", "status"]
    .filter((key) => !String(event[key] || "").trim());
}

function redactedEvent(event) {
  const clone = { ...event };
  if (clone.api_key) clone.api_key = "<redacted>";
  return clone;
}

function outboxPath(config) {
  return path.join(configDir(config), "outbox", `${new Date().toISOString().slice(0, 10)}.jsonl`);
}

function writeOutbox(config, payload, reason) {
  const filePath = outboxPath(config);
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, JSON.stringify({
    queued_at: new Date().toISOString(),
    reason,
    payload,
  }, null, 0) + "\n");
  return filePath;
}

async function sendEvent(config, event, args) {
  const url = args.url || envOrConfig(
    ["BDA_AI_WORK_EVENT_URL", "BDA_WORK_LOG_URL"],
    config,
    ["work_event_url", "work_log_url"],
    DEFAULT_URL,
  );
  const apiKey = args.api_key || envOrConfig(
    ["BDA_AI_ROUTER_API_KEY", "BDA_WORK_EVENT_API_KEY"],
    config,
    ["api_key", "work_event_api_key"],
  );
  const dryRun = boolValue(args.dry_run) || url === DEFAULT_URL;
  const payload = { ...event };

  if (dryRun) {
    return {
      ok: true,
      dry_run: true,
      reason: url === DEFAULT_URL ? "BDA work event URL is not configured" : "dry-run requested",
      event: redactedEvent(payload),
    };
  }

  const headers = { "content-type": "application/json" };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  try {
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
    const text = await response.text();
    if (!response.ok) {
      const filePath = writeOutbox(config, payload, `HTTP ${response.status}: ${text.slice(0, 300)}`);
      return { ok: false, queued: true, outbox: filePath, status: response.status, body: text.slice(0, 500) };
    }
    try {
      return JSON.parse(text);
    } catch {
      return { ok: true, response: text };
    }
  } catch (error) {
    const filePath = writeOutbox(config, payload, error.message);
    return { ok: false, queued: true, outbox: filePath, error: error.message };
  }
}

function baseEvent(config, args, session = {}) {
  const employeeCode = args.employee_code || envOrConfig(["BDA_EMPLOYEE_CODE"], config, ["employee_code"]);
  const employeeGroup = args.employee_group || envOrConfig(["BDA_EMPLOYEE_GROUP"], config, ["employee_group", "group"]);
  const rawCommand = args.command || session.command || "bda-nondev";
  const command = normalizeCommand(rawCommand);
  const project = args.project || session.project || envOrConfig(["BDA_PROJECT"], config, ["project_name"], "BDA-General");
  const taskSummary = args.task || args.task_summary || session.task_summary || "";
  return {
    employee_code: employeeCode,
    employee_group: employeeGroup,
    project,
    tool: args.tool || session.tool || envOrConfig(["BDA_AI_TOOL"], config, ["tool"], "bda-ai-dev"),
    command,
    task_summary: taskSummary,
    session_id: args.session_id || session.session_id || buildSessionId(employeeCode, project, command),
    work_type: args.work_type || (args.command ? inferWorkType(args.command) : session.work_type) || inferWorkType(rawCommand),
    status: args.status || "started",
    ai_provider: args.ai_provider || session.ai_provider || envOrConfig(["BDA_AI_PROVIDER"], config, ["ai_provider"]),
    ai_model: args.ai_model || session.ai_model || envOrConfig(["BDA_AI_MODEL"], config, ["ai_model"]),
    used_bda_gateway: boolValue(args.used_bda_gateway ?? session.used_bda_gateway ?? envOrConfig(["BDA_USED_BDA_GATEWAY"], config, ["used_bda_gateway"])),
    prompt_tokens: numValue(args.prompt_tokens),
    completion_tokens: numValue(args.completion_tokens),
    total_tokens: numValue(args.total_tokens),
    duration_ms: numValue(args.duration_ms),
    quality_score: args.quality_score || "",
    outcome: args.outcome || "",
    next_step: args.next_step || "",
    blocker: args.blocker || "",
    priority: args.priority || session.priority || "",
    due_date: args.due_date || session.due_date || "",
    pm_status: args.pm_status || "",
  };
}

function saveSession(config, session) {
  const filePath = sessionPath(config);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2) + "\n");
  return filePath;
}

function readSession(config) {
  return readJson(sessionPath(config));
}

function archiveSession(config, session) {
  const dir = path.join(configDir(config), "sessions");
  ensureDir(dir);
  const filePath = path.join(dir, `${session.session_id || Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2) + "\n");
  try {
    fs.unlinkSync(sessionPath(config));
  } catch {}
  return filePath;
}

function archiveSupersededSession(config, session, replacementSessionId) {
  const dir = path.join(configDir(config), "sessions", "superseded-active");
  ensureDir(dir);
  const archivedAt = new Date().toISOString();
  const filePath = path.join(dir, `${session.session_id || Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify({
    ...session,
    status: session.status || "active",
    superseded_at: archivedAt,
    superseded_by_session_id: replacementSessionId,
    superseded_reason: "bda start --force replaced the local active session file; server-side close still requires bda stop or dashboard manual close.",
  }, null, 2) + "\n");
  return filePath;
}

function printVersion() {
  console.log(JSON.stringify({
    ok: true,
    name: "bda-ai-dev-standard",
    session_version: SESSION_VERSION,
    cli_version: SESSION_VERSION.replace(/^bda-session\//, ""),
  }, null, 2));
}

function commandExists(command) {
  try {
    execFileSync(command, ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function repoRoot() {
  return path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
}

function updateStandard(args) {
  const standardDir = path.resolve(process.env.BDA_AI_DEV_STANDARD_DIR || repoRoot());
  const beforeVersion = fs.existsSync(path.join(standardDir, "VERSION"))
    ? fs.readFileSync(path.join(standardDir, "VERSION"), "utf8").trim()
    : "unknown";
  const hasGitRepo = fs.existsSync(path.join(standardDir, ".git"));
  const dryRun = boolValue(args.dry_run);

  if (!commandExists("git")) {
    console.error(JSON.stringify({
      ok: false,
      error: "git is required for bda update",
      hint: "Install git once, or run the latest BDA hotfix installer one last time.",
      standard_dir: standardDir,
    }, null, 2));
    process.exit(2);
  }

  const commands = hasGitRepo
    ? [
        ["git", ["-C", standardDir, "fetch", "--depth", "1", "origin", "main"]],
        ["git", ["-C", standardDir, "reset", "--hard", "origin/main"]],
        ["git", ["-C", standardDir, "clean", "-fd"]],
      ]
    : [
        ["rm", ["-rf", standardDir]],
        ["git", ["clone", "--depth", "1", STANDARD_REPO_URL, standardDir]],
      ];

  if (!dryRun) {
    for (const [command, commandArgs] of commands) {
      execFileSync(command, commandArgs, { stdio: "inherit" });
    }
  }

  const afterVersion = dryRun
    ? beforeVersion
    : (fs.existsSync(path.join(standardDir, "VERSION"))
        ? fs.readFileSync(path.join(standardDir, "VERSION"), "utf8").trim()
        : "unknown");

  const configResult = dryRun ? cleanHermesConfig({ dryRun: true }) : cleanHermesConfigWithUpdatedScript(standardDir);

  console.log(JSON.stringify({
    ok: true,
    action: "update",
    dry_run: dryRun,
    standard_dir: standardDir,
    before_version: beforeVersion,
    after_version: afterVersion,
    used_git_repo: hasGitRepo,
    hermes_config: configResult,
    note: "Restart Hermes Desktop after update if it is open. Hermes BDA provider/model config has been cleaned so only the BDA AI Gateway group remains.",
  }, null, 2));
}

function cleanHermesConfigWithUpdatedScript(standardDir) {
  const updatedScript = path.join(standardDir, "scripts", "bda.mjs");
  if (fs.existsSync(updatedScript) && path.resolve(updatedScript) !== path.resolve(new URL(import.meta.url).pathname)) {
    try {
      const raw = execFileSync(process.execPath, [updatedScript, "config-clean"], {
        encoding: "utf8",
        env: { ...process.env, BDA_UPDATE_POST_CLEAN: "1" },
      });
      const parsed = JSON.parse(raw);
      if (parsed && parsed.hermes_config) return parsed.hermes_config;
    } catch {
      // Fall back to this process' cleaner below.
    }
  }
  return cleanHermesConfig({ dryRun: false });
}

function topLevelKey(line) {
  const match = line.match(/^([A-Za-z0-9_-]+):(?:\s|$)/);
  return match ? match[1] : "";
}

function removeTopLevelBlocks(yamlText, keys) {
  const lines = yamlText.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const key = topLevelKey(lines[i]);
    if (!key || !keys.has(key)) {
      out.push(lines[i]);
      continue;
    }
    i += 1;
    while (i < lines.length && !topLevelKey(lines[i])) {
      i += 1;
    }
    i -= 1;
  }
  return out.join("\n");
}

function removeLegacyAgentCommandCatalog(yamlText) {
  return yamlText
    .replace(/You are running with BDA AI Dev Standard v[0-9.]+/g, "You are running with BDA AI Dev Standard v0.10.12")
    .replace(/During an active session, treat bda-dev-\*, bda-nondev-\*, and bda-pm-\* prefixes as real BDA work commands and send\/prepare bda event\./g,
      "During an active session, use only the compact BDA commands: bda-dev, bda-nondev, and bda-pm. Send/prepare bda event for meaningful subtasks.")
    .replace(/Command catalog: bda-dev-debug, bda-dev-review, bda-dev-tdd, bda-dev-plan-discuss, bda-dev-plan-create, bda-dev-plan-execute, bda-dev-plan-review, bda-dev-plan-verify, bda-nondev-explore, bda-nondev-write, bda-pm-log, bda-pm-status, bda-pm-risk, bda-pm-followup, bda-pm-requirement, bda-pm-standup\./g,
      "Command catalog: bda-dev, bda-nondev, bda-pm.");
}

function collectBdaModelNames(yamlText) {
  const names = new Set();
  const modelPattern = /\bbda\/[A-Za-z0-9._-]+/g;
  for (const match of yamlText.matchAll(modelPattern)) names.add(match[0]);
  return [...names].sort();
}

function normalizeHermesBdaConfig(yamlText) {
  let next = removeTopLevelBlocks(yamlText, new Set(["model", "auxiliary", "providers", "custom_providers"]));
  next = removeLegacyAgentCommandCatalog(next);
  next = next.replace(/^\s+$/gm, "");
  next = next.replace(/\n{3,}/g, "\n\n").trimStart();
  const merged = `${BDA_HERMES_CONFIG_BLOCK}${next.trim() ? `\n${next}` : ""}\n`;
  return merged;
}

function cleanHermesConfig({ dryRun = false } = {}) {
  const result = {
    config_paths: HERMES_CONFIG_PATHS.map((configPath) => ({
      config_path: configPath,
      exists: fs.existsSync(configPath),
      changed: false,
      backup_path: "",
      before_models: [],
      after_models: [],
    })),
    changed: false,
    removed_caches: [],
  };

  for (const entry of result.config_paths) {
    if (!entry.exists) continue;
    const before = fs.readFileSync(entry.config_path, "utf8");
    const after = normalizeHermesBdaConfig(before);
    entry.before_models = collectBdaModelNames(before);
    entry.after_models = collectBdaModelNames(after);
    entry.changed = before !== after;
    result.changed = result.changed || entry.changed;
    if (entry.changed && !dryRun) {
      const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
      entry.backup_path = `${entry.config_path}.bak-${stamp}`;
      fs.copyFileSync(entry.config_path, entry.backup_path);
      fs.writeFileSync(entry.config_path, after);
    }
  }

  for (const cachePath of HERMES_CACHE_PATHS) {
    if (!fs.existsSync(cachePath)) continue;
    result.removed_caches.push(cachePath);
    if (!dryRun) fs.rmSync(cachePath, { force: true });
  }
  return result;
}

function printConfigStatus() {
  const result = cleanHermesConfig({ dryRun: true });
  console.log(JSON.stringify({ ok: true, action: "config-status", hermes_config: result }, null, 2));
}

function printConfigClean() {
  const result = cleanHermesConfig({ dryRun: false });
  console.log(JSON.stringify({
    ok: true,
    action: "config-clean",
    hermes_config: result,
    note: "Restart Hermes Desktop after cleaning config/cache.",
  }, null, 2));
}

/*
 * Kept intentionally small: Hermes config has historically drifted between
 * releases, so bda update owns the BDA provider/model block end-to-end.
 */
function unusedLegacyModelCleanerForReference(yamlText) {
  const lines = yamlText.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(/^(\s{6})(bda\/[^:]+):\s*$/);
    if (!match || !disabled.has(match[2])) {
      out.push(line);
      continue;
    }
    i += 1;
    while (i < lines.length && /^\s{8,}\S/.test(lines[i])) i += 1;
    i -= 1;
  }
  return out.join("\n");
}

function printHelp() {
  console.log(`BDA AI Dev CLI ${SESSION_VERSION}

Flow:
  bda start   เริ่ม session งานจริง และส่ง status=started
  bda help    ดู command ที่ใช้ได้
  bda version แสดง version ของ CLI/session format
  bda update  อัปเดต BDA AI Dev Standard โดยไม่ต้องแจก zip ใหม่
  bda config-status  ตรวจ Hermes provider/model config ที่ bda update จะ rewrite
  bda config-clean   rewrite Hermes provider/model config และล้าง model cache ทันที
  bda event   ส่ง event ระหว่าง session เช่น command ย่อย/งานย่อย
  bda stop    ปิด session และส่ง status=done/blocked/failed

Examples:
  bda start --project "BDA-InnoHub" --task "debug login error" --command bda-dev --work-type debug
  bda update
  bda event --command bda-dev --work-type review --task "review login fix" --status done
  bda stop --status done --outcome "fixed login validation" --next-step "deploy to staging"

Prompt style in AI chat:
  bda-dev: debug login error
  bda-nondev: สรุป requirement จาก meeting note
  bda-pm: สรุป project status วันนี้

Available commands:`);
  for (const [name, workType, desc] of COMMANDS) {
    console.log(`  ${name.padEnd(24)} ${workType.padEnd(15)} ${desc}`);
  }
}

async function start(config, args) {
  const activeSession = readSession(config);
  const force = boolValue(args.force);
  if (activeSession.session_id && !force) {
    console.error(JSON.stringify({
      ok: false,
      error: "Active BDA session already exists. Run bda stop before starting a new session.",
      session_file: sessionPath(config),
      active_session: {
        session_id: activeSession.session_id,
        project: activeSession.project,
        command: activeSession.command,
        task_summary: activeSession.task_summary,
        started_at: activeSession.started_at,
      },
      hint: "If the old session was already closed elsewhere, close it from Coverage/admin as manual-dashboard-close, then run bda start --force.",
    }, null, 2));
    process.exit(2);
  }
  await askMissing(args, [
    ["project", "Project"],
    ["task", "Task summary"],
    ["command", "Command เช่น bda-dev / bda-nondev / bda-pm"],
  ]);
  const event = baseEvent(config, { ...args, status: "started" });
  const missing = missingFields(event);
  if (missing.length) {
    console.error(JSON.stringify({ ok: false, missing, hint: "Run bda start with --employee-code/--project/--task/--command or configure ~/.bda-skills/config.json" }, null, 2));
    process.exit(2);
  }
  const startedAt = new Date().toISOString();
  const session = {
    version: SESSION_VERSION,
    ...event,
    status: "active",
    started_at: startedAt,
    events: [{ at: startedAt, status: "started", command: event.command, task_summary: event.task_summary }],
  };
  let supersededSession;
  if (activeSession.session_id && force) {
    supersededSession = archiveSupersededSession(config, activeSession, session.session_id);
  }
  const filePath = saveSession(config, session);
  const result = await sendEvent(config, { ...event, status: "started" }, args);
  console.log(JSON.stringify({ ok: true, action: "start", session_file: filePath, superseded_session: supersededSession, session, send_result: result }, null, 2));
}

async function event(config, args) {
  const session = readSession(config);
  if (!session.session_id) {
    console.error(JSON.stringify({ ok: false, error: "No active BDA session. Run bda start first." }, null, 2));
    process.exit(2);
  }
  await askMissing(args, [["task", "Task summary for this event"]]);
  const now = new Date().toISOString();
  const payload = baseEvent(config, { ...args, session_id: session.session_id, status: args.status || "done" }, session);
  const missing = missingFields(payload);
  if (missing.length) {
    console.error(JSON.stringify({ ok: false, missing }, null, 2));
    process.exit(2);
  }
  session.events = Array.isArray(session.events) ? session.events : [];
  session.events.push({ at: now, status: payload.status, command: payload.command, task_summary: payload.task_summary });
  saveSession(config, session);
  const result = await sendEvent(config, payload, args);
  console.log(JSON.stringify({ ok: true, action: "event", event: payload, send_result: result }, null, 2));
}

async function stop(config, args) {
  const session = readSession(config);
  if (!session.session_id) {
    console.error(JSON.stringify({ ok: false, error: "No active BDA session. Nothing to stop." }, null, 2));
    process.exit(2);
  }
  const started = Date.parse(session.started_at || "");
  const durationMs = Number.isFinite(started) ? Date.now() - started : 0;
  await askMissing(args, [["outcome", "Outcome / result summary"]]);
  const payload = baseEvent(config, {
    ...args,
    project: session.project,
    command: "bda stop",
    session_id: session.session_id,
    work_type: session.work_type,
    status: args.status || "done",
    duration_ms: args.duration_ms || durationMs,
    task: args.task || session.task_summary,
  }, session);
  const missing = missingFields(payload);
  if (missing.length) {
    console.error(JSON.stringify({ ok: false, missing }, null, 2));
    process.exit(2);
  }
  const stoppedAt = new Date().toISOString();
  session.status = payload.status;
  session.stopped_at = stoppedAt;
  session.outcome = payload.outcome;
  session.next_step = payload.next_step;
  session.blocker = payload.blocker;
  session.duration_ms = payload.duration_ms;
  session.events = Array.isArray(session.events) ? session.events : [];
  session.events.push({ at: stoppedAt, status: payload.status, command: payload.command, task_summary: payload.task_summary });
  const archived = archiveSession(config, session);
  const result = await sendEvent(config, payload, args);
  console.log(JSON.stringify({ ok: true, action: "stop", archived_session: archived, event: payload, send_result: result }, null, 2));
}

function current(config) {
  const session = readSession(config);
  console.log(JSON.stringify({ ok: true, session_file: sessionPath(config), active: Boolean(session.session_id), session }, null, 2));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const subcommand = args._[0] || "help";
  const config = loadConfig();
  if (subcommand === "help" || subcommand === "--help" || subcommand === "-h") return printHelp();
  if (subcommand === "version" || subcommand === "--version" || subcommand === "-v") return printVersion();
  if (subcommand === "update") return updateStandard(args);
  if (subcommand === "config-status") return printConfigStatus();
  if (subcommand === "config-clean") return printConfigClean();
  if (subcommand === "start") return start(config, args);
  if (subcommand === "event") return event(config, args);
  if (subcommand === "stop") return stop(config, args);
  if (subcommand === "current") return current(config);
  console.error(`Unknown command: ${subcommand}\n`);
  printHelp();
  process.exit(2);
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
