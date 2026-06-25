#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const DEFAULT_URL = "https://example.com/bda/work-events";
const SESSION_VERSION = "bda-session/0.10.19";
const STANDARD_REPO_URL = "https://github.com/BigDataAgency/bda-ai-dev-standard.git";
const BDA_GATEWAY_BASE_URL = "https://ai.bda.co.th/v1";
const FALLBACK_BDA_MODELS = [
  "bda/qwable-27b-local",
  "bda/qwythos-9b-local",
  "bda/deepseek-fast-paid-cloud",
  "bda/deepseek-paid-cloud",
  "bda/minimax-m3-paid-cloud",
  "bda/qwen3.7-plus-paid-cloud",
  "bda/qwen3.7-max-paid-cloud",
  "bda/glm-5.1-paid-cloud",
];
const REQUIRED_COMPATIBILITY_BDA_MODELS = [
  "bda/dev",
  "bda/deepseek-fast-paid-cloud",
  "bda/deepseek-paid-cloud",
  "bda/minimax-m3-paid-cloud",
  "bda/qwen3.7-plus-paid-cloud",
  "bda/qwen3.7-max-paid-cloud",
  "bda/glm-5.1-paid-cloud",
];
const MAC_HERMES_APP_SUPPORT = path.join(os.homedir(), "Library", "Application Support", "Hermes");
const THCLAWS_CONFIG_DIR = path.join(os.homedir(), ".config", "thclaws");
const HERMES_CONFIG_PATHS = Array.from(new Set([
  path.join(os.homedir(), ".hermes", "config.yaml"),
  path.join(MAC_HERMES_APP_SUPPORT, "config.yaml"),
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "config.yaml") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "config.yaml") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes", "config.yaml") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes", "config.yaml") : "",
].filter(Boolean)));
const HERMES_ENV_PATHS = Array.from(new Set([
  path.join(os.homedir(), ".hermes", ".env"),
  path.join(MAC_HERMES_APP_SUPPORT, ".env"),
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", ".env") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", ".env") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes", ".env") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes", ".env") : "",
].filter(Boolean)));
const HERMES_CACHE_PATHS = [
  path.join(os.homedir(), ".hermes", "provider_models_cache.json"),
  path.join(os.homedir(), ".hermes", "models_dev_cache.json"),
  path.join(os.homedir(), ".hermes", "ollama_cloud_models_cache.json"),
  path.join(os.homedir(), ".hermes", "cache", "model_catalog.json"),
  path.join(MAC_HERMES_APP_SUPPORT, "provider_models_cache.json"),
  path.join(MAC_HERMES_APP_SUPPORT, "models_dev_cache.json"),
  path.join(MAC_HERMES_APP_SUPPORT, "ollama_cloud_models_cache.json"),
  path.join(MAC_HERMES_APP_SUPPORT, "cache", "model_catalog.json"),
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "provider_models_cache.json") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "models_dev_cache.json") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "ollama_cloud_models_cache.json") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "cache", "model_catalog.json") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "provider_models_cache.json") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "models_dev_cache.json") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "ollama_cloud_models_cache.json") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "cache", "model_catalog.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes", "provider_models_cache.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes", "models_dev_cache.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes", "ollama_cloud_models_cache.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes", "cache", "model_catalog.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes", "provider_models_cache.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes", "models_dev_cache.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes", "ollama_cloud_models_cache.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes", "cache", "model_catalog.json") : "",
].filter(Boolean);

function bdaModelContextLength(model) {
  if (model.includes("qwen3.7") || model.includes("minimax")) return 262144;
  if (model.includes("deepseek") || model.includes("glm")) return 131072;
  if (model.includes("qwythos")) return 262144;
  if (model.includes("qwable")) return 131072;
  return 65536;
}

function bdaModelMaxOutput(model) {
  return 8192;
}

function buildHermesBdaConfigBlock(models = FALLBACK_BDA_MODELS) {
  const uniqueModels = [...new Set(models)].filter((model) => model.startsWith("bda/"));
  const defaultModel = uniqueModels.includes("bda/qwable-27b-local")
    ? "bda/qwable-27b-local"
    : uniqueModels[0] || "bda/qwable-27b-local";
  const compressionModel = uniqueModels.includes("bda/qwythos-9b-local")
    ? "bda/qwythos-9b-local"
    : defaultModel;
  const modelEntries = uniqueModels
    .map((model) => `      ${model}:\n        context_length: ${bdaModelContextLength(model)}`)
    .join("\n");
  return `model:
  provider: bda
  default: ${defaultModel}
  context_length: ${bdaModelContextLength(defaultModel)}
  max_tokens: 8192
  compression_model: ${compressionModel}
  auxiliary_compression_model: ${compressionModel}
auxiliary:
  compression:
    provider: bda
    model: ${compressionModel}
    context_length: ${bdaModelContextLength(compressionModel)}
providers:
  bda:
    name: BDA AI Gateway
    api: ${BDA_GATEWAY_BASE_URL}
    key_env: BDA_AI_ROUTER_API_KEY
    transport: openai_chat
    default_model: ${defaultModel}
    discover_models: false
    models:
${modelEntries}
`;
}

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
    const data = JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function readDotEnv(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    const out = {};
    const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[match[1]] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function serializeDotEnv(values) {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== null && String(value) !== "")
    .map(([key, value]) => `${key}=${String(value).replace(/\r?\n/g, "")}`)
    .join("\n") + "\n";
}

function mergeDotEnvText(text, values) {
  const nextValues = { ...values };
  const out = [];
  for (const rawLine of String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/)) {
    if (!rawLine.trim()) continue;
    const match = rawLine.match(/^(\s*(?:export\s+)?)([A-Za-z_][A-Za-z0-9_]*)(=)(.*)$/);
    if (!match || !(match[2] in nextValues)) {
      out.push(rawLine);
      continue;
    }
    const value = nextValues[match[2]];
    if (value !== undefined && value !== null && String(value) !== "") {
      out.push(`${match[1]}${match[2]}=${String(value).replace(/\r?\n/g, "")}`);
    }
    delete nextValues[match[2]];
  }
  const appended = serializeDotEnv(nextValues).trimEnd();
  if (appended) out.push(appended);
  return out.join("\n").trimEnd() + "\n";
}

function workEventUrlFromBaseUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  try {
    const url = new URL(text);
    url.pathname = url.pathname.replace(/\/v1\/?$/, "/bda/work-events");
    if (!url.pathname.endsWith("/bda/work-events")) url.pathname = "/bda/work-events";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function configFromEnvMap(envMap) {
  const baseUrl = envMap.BDA_AI_ROUTER_BASE_URL || envMap.OPENAI_BASE_URL || "";
  return {
    employee_code: envMap.BDA_EMPLOYEE_CODE,
    employee_group: envMap.BDA_EMPLOYEE_GROUP,
    work_event_url: envMap.BDA_AI_WORK_EVENT_URL || envMap.BDA_WORK_LOG_URL || workEventUrlFromBaseUrl(baseUrl),
    api_key: envMap.BDA_AI_ROUTER_API_KEY || envMap.BDA_WORK_EVENT_API_KEY || envMap.OPENAI_API_KEY,
    ai_provider: envMap.BDA_AI_PROVIDER || (baseUrl ? "bda-gateway" : ""),
    ai_model: envMap.BDA_AI_MODEL,
    used_bda_gateway: envMap.BDA_USED_BDA_GATEWAY,
  };
}

function mergeConfig(...configs) {
  const out = {};
  for (const config of configs) {
    for (const [key, value] of Object.entries(config || {})) {
      if (value === undefined || value === null || value === "") continue;
      out[key] = value;
    }
  }
  if (
    out.api_key &&
    out.work_event_url &&
    out.work_event_url !== DEFAULT_URL &&
    out.used_bda_gateway === undefined
  ) {
    out.used_bda_gateway = true;
  }
  if (out.api_key && !out.ai_provider) out.ai_provider = "bda-gateway";
  return out;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function loadConfig() {
  const home = os.homedir();
  const processEnvConfig = configFromEnvMap(process.env);
  const hermesEnvConfig = configFromEnvMap(readDotEnv(path.join(home, ".hermes", ".env")));
  const globalConfig = readJson(path.join(home, ".bda-skills", "config.json"));
  const installedConfig = readJson(path.join(repoRoot(), ".bda-skills", "config.json"));
  const projectConfig = readJson(path.join(process.cwd(), ".bda-skills", "config.json"));
  return mergeConfig(hermesEnvConfig, globalConfig, installedConfig, projectConfig, processEnvConfig);
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

async function fetchBdaGatewayModels(config = {}) {
  const apiKey = envOrConfig(
    ["BDA_AI_ROUTER_API_KEY", "OPENAI_COMPAT_API_KEY", "BDA_WORK_EVENT_API_KEY"],
    config,
    ["api_key", "work_event_api_key"],
  );
  if (!apiKey || String(apiKey).includes("test")) return FALLBACK_BDA_MODELS;
  try {
    const response = await fetch(`${BDA_GATEWAY_BASE_URL}/models`, {
      headers: { authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) return FALLBACK_BDA_MODELS;
    const payload = await response.json();
    const models = Array.isArray(payload.data)
      ? payload.data.map((row) => row && row.id).filter((id) => typeof id === "string" && id.startsWith("bda/"))
      : [];
    return models.length ? mergeBdaGatewayModels(models) : FALLBACK_BDA_MODELS;
  } catch {
    return FALLBACK_BDA_MODELS;
  }
}

function mergeBdaGatewayModels(models = []) {
  const merged = [];
  for (const model of [...models, ...REQUIRED_COMPATIBILITY_BDA_MODELS]) {
    if (typeof model !== "string" || !model.startsWith("bda/")) continue;
    if (!merged.includes(model)) merged.push(model);
  }
  return merged.length ? merged : FALLBACK_BDA_MODELS;
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

function authFingerprint(value) {
  const token = String(value || "").trim();
  if (!token) return "";
  return crypto.createHash("sha256").update(token).digest("hex").slice(0, 16);
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
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

async function updateStandard(args, config = {}) {
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
      hint: "Do not reinstall BDA. Send this error to lead/admin with Get-Command bda and the current bda update output.",
      standard_dir: standardDir,
    }, null, 2));
    process.exit(2);
  }

  if (!dryRun) {
    if (!hasGitRepo) fs.rmSync(standardDir, { recursive: true, force: true });
    const commands = hasGitRepo
      ? [
          ["git", ["-C", standardDir, "fetch", "--depth", "1", "origin", "main"]],
          ["git", ["-C", standardDir, "reset", "--hard", "origin/main"]],
          ["git", ["-C", standardDir, "clean", "-fd"]],
        ]
      : [
          ["git", ["clone", "--depth", "1", STANDARD_REPO_URL, standardDir]],
        ];
    for (const [command, commandArgs] of commands) {
      execFileSync(command, commandArgs, { stdio: "inherit" });
    }
  }

  const afterVersion = dryRun
    ? beforeVersion
    : (fs.existsSync(path.join(standardDir, "VERSION"))
        ? fs.readFileSync(path.join(standardDir, "VERSION"), "utf8").trim()
        : "unknown");

  const gatewayModels = await fetchBdaGatewayModels(config);
  const configResult = dryRun
    ? cleanHermesConfig({ dryRun: true, models: gatewayModels })
    : cleanHermesConfigWithUpdatedScript(standardDir, gatewayModels);
  const thclawsResult = syncThclawsCatalogue(gatewayModels, { dryRun });

  console.log(JSON.stringify({
    ok: true,
    action: "update",
    dry_run: dryRun,
    standard_dir: standardDir,
    before_version: beforeVersion,
    after_version: afterVersion,
    used_git_repo: hasGitRepo,
    gateway_models: gatewayModels,
    hermes_config: configResult,
    thclaws_config: thclawsResult,
    note: "Restart Hermes Desktop after update if it is open. Hermes BDA provider/model config has been cleaned so only the BDA AI Gateway group remains.",
  }, null, 2));
}

function cleanHermesConfigWithUpdatedScript(standardDir, gatewayModels = FALLBACK_BDA_MODELS) {
  const updatedScript = path.join(standardDir, "scripts", "bda.mjs");
  if (fs.existsSync(updatedScript) && path.resolve(updatedScript) !== path.resolve(new URL(import.meta.url).pathname)) {
    try {
      const raw = execFileSync(process.execPath, [updatedScript, "config-clean"], {
        encoding: "utf8",
        env: { ...process.env, BDA_UPDATE_POST_CLEAN: "1", BDA_GATEWAY_MODELS_JSON: JSON.stringify(gatewayModels) },
      });
      const parsed = JSON.parse(raw);
      if (parsed && parsed.hermes_config) return parsed.hermes_config;
    } catch {
      // Fall back to this process' cleaner below.
    }
  }
  return cleanHermesConfig({ dryRun: false, models: gatewayModels });
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
    .replace(/You are running with BDA AI Dev Standard v[0-9.]+/g, "You are running with BDA AI Dev Standard v0.10.19")
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

function normalizeHermesBdaConfig(yamlText, models = FALLBACK_BDA_MODELS) {
  let next = removeTopLevelBlocks(yamlText, new Set(["model", "auxiliary", "providers", "custom_providers"]));
  next = removeLegacyAgentCommandCatalog(next);
  next = next.replace(/^\s+$/gm, "");
  next = next.replace(/\n{3,}/g, "\n\n").trimStart();
  const merged = `${buildHermesBdaConfigBlock(models)}${next.trim() ? `\n${next}` : ""}\n`;
  return merged;
}

function modelsFromEnvOverride() {
  try {
    const parsed = JSON.parse(process.env.BDA_GATEWAY_MODELS_JSON || "[]");
    return Array.isArray(parsed) && parsed.length ? parsed : FALLBACK_BDA_MODELS;
  } catch {
    return FALLBACK_BDA_MODELS;
  }
}

function cleanHermesConfig({ dryRun = false, models = modelsFromEnvOverride() } = {}) {
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
    const after = normalizeHermesBdaConfig(before, models);
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

function syncHermesEnv(config = {}, { dryRun = false } = {}) {
  const apiKey = envOrConfig(
    ["BDA_AI_ROUTER_API_KEY", "BDA_WORK_EVENT_API_KEY", "OPENAI_API_KEY"],
    config,
    ["api_key", "work_event_api_key"],
  );
  const values = {
    BDA_AI_ROUTER_BASE_URL: BDA_GATEWAY_BASE_URL,
    BDA_WORK_LOG_URL: workEventUrlFromBaseUrl(BDA_GATEWAY_BASE_URL),
    BDA_AI_ROUTER_API_KEY: apiKey,
    BDA_USED_BDA_GATEWAY: apiKey ? "true" : "",
    BDA_AI_PROVIDER: apiKey ? "bda-gateway" : "",
    BDA_AI_MODEL: envOrConfig(["BDA_AI_MODEL"], config, ["ai_model"], "bda/auto-default-local"),
    BDA_EMPLOYEE_CODE: envOrConfig(["BDA_EMPLOYEE_CODE"], config, ["employee_code"]),
    BDA_EMPLOYEE_GROUP: envOrConfig(["BDA_EMPLOYEE_GROUP"], config, ["employee_group", "group"]),
  };
  const targets = new Set(HERMES_ENV_PATHS.filter((envPath) => fs.existsSync(envPath)));
  for (const configPath of HERMES_CONFIG_PATHS) {
    if (fs.existsSync(configPath)) targets.add(path.join(path.dirname(configPath), ".env"));
  }
  if (!targets.size) targets.add(path.join(os.homedir(), ".hermes", ".env"));

  const result = {
    env_paths: [...targets].map((envPath) => ({
      env_path: envPath,
      exists: fs.existsSync(envPath),
      changed: false,
      backup_path: "",
      wrote_key: Boolean(apiKey),
      before_fingerprint: authFingerprint(readDotEnv(envPath).BDA_AI_ROUTER_API_KEY),
      after_fingerprint: authFingerprint(apiKey),
    })),
    changed: false,
    wrote_key: Boolean(apiKey),
    expected_fingerprint: authFingerprint(apiKey),
  };
  for (const entry of result.env_paths) {
    const before = fs.existsSync(entry.env_path) ? fs.readFileSync(entry.env_path, "utf8") : "";
    const after = mergeDotEnvText(before, values);
    entry.changed = before !== after;
    result.changed = result.changed || entry.changed;
    if (entry.changed && !dryRun) {
      ensureDir(path.dirname(entry.env_path));
      if (entry.exists) {
        const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
        entry.backup_path = `${entry.env_path}.bak-${stamp}`;
        fs.copyFileSync(entry.env_path, entry.backup_path);
      }
      fs.writeFileSync(entry.env_path, after);
    }
  }
  return result;
}

function syncThclawsCatalogue(models = FALLBACK_BDA_MODELS, { dryRun = false } = {}) {
  const installed = fs.existsSync(THCLAWS_CONFIG_DIR)
    || fs.existsSync(path.join(os.homedir(), "bin", "thclaws"))
    || fs.existsSync("/Applications/thclaws.app");
  const filePath = path.join(THCLAWS_CONFIG_DIR, "model_catalogue.json");
  const result = {
    installed,
    changed: false,
    catalogue_path: filePath,
    models: models.map((model) => `oai/${model}`),
  };
  if (!installed) return result;
  const modelEntries = {};
  const aliases = {};
  for (const model of models) {
    if (!model.startsWith("bda/")) continue;
    const thclawsModel = `oai/${model}`;
    modelEntries[thclawsModel] = {
      context: bdaModelContextLength(model),
      maxOutput: bdaModelMaxOutput(model),
      source: "BDA Gateway /v1/models",
      chat: true,
    };
    aliases[model] = thclawsModel;
  }
  const catalogue = {
    schema: 4,
    source: "BDA Gateway /v1/models live sync",
    providers: { "openai-compat": { models: modelEntries } },
    aliases,
    fallback: 65536,
  };
  const next = JSON.stringify(catalogue, null, 2) + "\n";
  const before = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  result.changed = before !== next;
  if (result.changed && !dryRun) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, next);
  }
  return result;
}

async function printConfigStatus(config = {}) {
  const models = await fetchBdaGatewayModels(config);
  const result = cleanHermesConfig({ dryRun: true, models });
  const hermesEnv = syncHermesEnv(config, { dryRun: true });
  const thclaws = syncThclawsCatalogue(models, { dryRun: true });
  console.log(JSON.stringify({ ok: true, action: "config-status", gateway_models: models, hermes_config: result, hermes_env: hermesEnv, thclaws_config: thclaws }, null, 2));
}

async function printConfigClean(config = {}) {
  const models = await fetchBdaGatewayModels(config);
  const result = cleanHermesConfig({ dryRun: false, models });
  const hermesEnv = syncHermesEnv(config, { dryRun: false });
  const thclaws = syncThclawsCatalogue(models, { dryRun: false });
  console.log(JSON.stringify({
    ok: true,
    action: "config-clean",
    gateway_models: models,
    hermes_config: result,
    hermes_env: hermesEnv,
    thclaws_config: thclaws,
    note: "Restart Hermes Desktop after cleaning config/cache/env.",
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

Model policy:
  bda/dev เป็น gateway หลักที่พนักงานทุกกลุ่มใช้ได้เมื่อทำงานกับ AI Gateway
  bda-nondev เป็น command metadata สำหรับงานเอกสาร/สรุป ไม่ใช่การล็อคไม่ให้ใช้ bda/dev

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
  if (subcommand === "update") return updateStandard(args, config);
  if (subcommand === "config-status") return printConfigStatus(config);
  if (subcommand === "config-clean") return printConfigClean(config);
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
