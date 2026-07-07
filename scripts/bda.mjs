#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// production endpoint เป็น default — เครื่องที่ env เก่า/หายจะได้รายงาน inventory ได้ (แก้ false negative ตอนเช็ค adoption 2026-07-07)
const DEFAULT_URL = "https://ai-local.scmc.digital/bda/work-events";
const SESSION_VERSION = "bda-session/0.12.3";
const STANDARD_REPO_URL = "https://github.com/BigDataAgency/bda-ai-dev-standard.git";
const BDA_GATEWAY_BASE_URL = process.env.BDA_GATEWAY_BASE_URL || "https://ai-local.scmc.digital/v1";

// Live context windows learned from the gateway /v1/models response (id -> context_window).
// Populated by fetchBdaGatewayModels and preferred over the hardcoded heuristic so that
// backend/gateway context changes (e.g. bda/dev 64k -> 256k) flow through `bda update`
// without editing this script. Seeded from BDA_GATEWAY_CONTEXT_JSON so the config-clean
// subprocess (spawned by cleanHermesConfigWithUpdatedScript) inherits the same values.
const GATEWAY_CONTEXT_WINDOWS = new Map();
function seedGatewayContextFromEnv() {
  try {
    const parsed = JSON.parse(process.env.BDA_GATEWAY_CONTEXT_JSON || "{}");
    if (parsed && typeof parsed === "object") {
      for (const [id, ctx] of Object.entries(parsed)) {
        const n = Number(ctx);
        if (typeof id === "string" && id.startsWith("bda/") && Number.isFinite(n) && n > 0) {
          GATEWAY_CONTEXT_WINDOWS.set(id, Math.trunc(n));
        }
      }
    }
  } catch {
    // ignore malformed env seed; fall back to heuristic
  }
}
seedGatewayContextFromEnv();
const FALLBACK_BDA_MODELS = [
  "bda/qwable-27b-local",
  "bda/qwythos-9b-local",
  "bda/nondev",
  "bda/deepseek-fast-paid-cloud",
  "bda/deepseek-paid-cloud",
  "bda/deepseek-v4-pro-paid-cloud",
  "bda/minimax-m3-paid-cloud",
  "bda/qwen3.7-plus-paid-cloud",
  "bda/qwen3.7-max-paid-cloud",
  "bda/glm-5.1-paid-cloud",
];
const REQUIRED_COMPATIBILITY_BDA_MODELS = [
  "bda/dev",
  "bda/nondev",
  "bda/deepseek-fast-paid-cloud",
  "bda/deepseek-paid-cloud",
  "bda/deepseek-v4-pro-paid-cloud",
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
const HERMES_STATE_PATHS = Array.from(new Set([
  path.join(os.homedir(), ".hermes", "sessions"),
  path.join(os.homedir(), ".hermes", "pastes"),
  path.join(os.homedir(), ".hermes", "state.db"),
  path.join(os.homedir(), ".hermes", "state.db-wal"),
  path.join(os.homedir(), ".hermes", "state.db-shm"),
  path.join(MAC_HERMES_APP_SUPPORT, "Session Storage"),
  path.join(MAC_HERMES_APP_SUPPORT, "Local Storage"),
  path.join(MAC_HERMES_APP_SUPPORT, "IndexedDB"),
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "sessions") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "pastes") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "state.db") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "state.db-wal") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "state.db-shm") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "sessions") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "pastes") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "state.db") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "state.db-wal") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "state.db-shm") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes", "Session Storage") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes", "Local Storage") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes", "Session Storage") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes", "Local Storage") : "",
].filter(Boolean)));
const HERMES_STATE_ROOTS = Array.from(new Set([
  path.join(os.homedir(), ".hermes"),
  MAC_HERMES_APP_SUPPORT,
  path.join(os.homedir(), "Library", "Application Support", "hermes"),
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes") : "",
].filter(Boolean)));
const HERMES_STATE_WARN_BYTES = 100 * 1024 * 1024;
const HERMES_STATE_CRITICAL_BYTES = 500 * 1024 * 1024;
const HERMES_REQUEST_DUMP_WARN_BYTES = 5 * 1024 * 1024;
const HERMES_SKILL_DIRS = Array.from(new Set([
  path.join(os.homedir(), ".hermes", "skills"),
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", "skills") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", "skills") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes", "skills") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes", "skills") : "",
].filter(Boolean)));
const HERMES_SKILL_SNAPSHOT_PATHS = Array.from(new Set([
  path.join(os.homedir(), ".hermes", ".skills_prompt_snapshot.json"),
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "hermes", ".skills_prompt_snapshot.json") : "",
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Hermes", ".skills_prompt_snapshot.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "hermes", ".skills_prompt_snapshot.json") : "",
  process.env.APPDATA ? path.join(process.env.APPDATA, "Hermes", ".skills_prompt_snapshot.json") : "",
].filter(Boolean)));
const HERMES_SKILL_KEEP_NAMES = new Set(["bda-ai-dev-standard"]);
const FORBIDDEN_HERMES_ARCHIVE_PATHS = Array.from(new Set([
  ...HERMES_STATE_ROOTS,
  "/Applications/Hermes.app",
  path.join(os.homedir(), "Applications", "Hermes.app"),
].filter(Boolean).map((entry) => path.resolve(entry))));

function bdaModelContextLength(model) {
  // Prefer the live context_window reported by the gateway /v1/models response.
  const gatewayCtx = GATEWAY_CONTEXT_WINDOWS.get(model);
  if (Number.isFinite(gatewayCtx) && gatewayCtx > 0) return gatewayCtx;
  // Fallback heuristic for offline/dry-run when the gateway did not report a value.
  if (model.includes("qwen3.7") || model.includes("minimax")) return 262144;
  if (model.includes("deepseek") || model.includes("glm")) return 131072;
  if (model.includes("qwythos")) return 262144;
  if (model.includes("qwable")) return 131072;
  if (model === "bda/dev") return 262144;
  if (model === "bda/nondev") return 131072;
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
  return path.resolve(config.config_dir || path.join(os.homedir(), ".bda-skills"));
}

function sessionPath(config) {
  return path.resolve(config.session_file || path.join(configDir(config), "current-session.json"));
}

function legacySessionPaths(config) {
  const primary = sessionPath(config);
  return Array.from(new Set([
    path.join(process.cwd(), ".bda-skills", "current-session.json"),
    path.join(repoRoot(), ".bda-skills", "current-session.json"),
  ].map((filePath) => path.resolve(filePath))))
    .filter((filePath) => filePath !== primary);
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
    const rows = Array.isArray(payload.data) ? payload.data : [];
    for (const row of rows) {
      if (!row || typeof row.id !== "string" || !row.id.startsWith("bda/")) continue;
      const ctx = Number(row.context_window ?? row.max_context_tokens ?? row.context_length ?? row.max_model_len);
      if (Number.isFinite(ctx) && ctx > 0) GATEWAY_CONTEXT_WINDOWS.set(row.id, Math.trunc(ctx));
    }
    const models = rows
      .map((row) => row && row.id)
      .filter((id) => typeof id === "string" && id.startsWith("bda/"));
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
  const dryRun = boolValue(args.dry_run) || url.includes("example.com");
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

function cliVersion() {
  return SESSION_VERSION.replace(/^bda-session\//, "");
}

async function sendInventoryEvent(config, args = {}, data = {}) {
  const source = data.source || "bda";
  const utilityCommand = data.utility_command || source;
  const event = {
    ...baseEvent(config, {
      project: args.project || "BDA-AI-Installer",
      task: data.task_summary || `BDA inventory report from ${source}`,
      command: "bda-nondev",
      work_type: "operation",
      status: "done",
      tool: "bda-ai-dev-standard",
      session_id: buildSessionId(
        config.employee_code || envOrConfig(["BDA_EMPLOYEE_CODE"], config, ["employee_code"]) || "unknown",
        "BDA-AI-Installer",
        "bda-inventory",
      ),
    }),
    event_kind: "bda_inventory",
    utility_command: utilityCommand,
    source,
    installer_version: data.installer_version || config.installer_version || "",
    bda_cli_version: data.bda_cli_version || cliVersion(),
    bda_ai_dev_standard_version: data.bda_ai_dev_standard_version || data.after_version || cliVersion(),
    before_version: data.before_version || "",
    after_version: data.after_version || "",
    standard_dir: data.standard_dir || "",
    used_git_repo: Boolean(data.used_git_repo),
    doctor_issue_count: numValue(data.doctor_issue_count),
    hermes_state_total_bytes: numValue(data.hermes_state_total_bytes),
    request_dump_total_bytes: numValue(data.request_dump_total_bytes),
    gateway_models_count: numValue(data.gateway_models_count),
    hermes_session_count: numValue(data.hermes_session_count),
    hermes_largest_session_est_tokens: numValue(data.hermes_largest_session_est_tokens),
    hermes_skill_entries: numValue(data.hermes_skill_entries),
    light_mode_applied: data.light_mode_applied === undefined ? null : Boolean(data.light_mode_applied),
    stale_gateway_domain: data.stale_gateway_domain === undefined ? null : Boolean(data.stale_gateway_domain),
    reported_at: new Date().toISOString(),
  };
  return sendEvent(config, event, args);
}

function saveSession(config, session) {
  const filePath = sessionPath(config);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2) + "\n");
  return filePath;
}

function readSession(config) {
  const primaryPath = sessionPath(config);
  const primary = readJson(primaryPath);
  if (primary.session_id) return primary;
  for (const legacyPath of legacySessionPaths(config)) {
    const legacy = readJson(legacyPath);
    if (!legacy.session_id) continue;
    ensureDir(path.dirname(primaryPath));
    fs.writeFileSync(primaryPath, JSON.stringify(legacy, null, 2) + "\n");
    try {
      fs.renameSync(legacyPath, `${legacyPath}.migrated-${Date.now()}`);
    } catch {}
    return legacy;
  }
  return primary;
}

function removeLegacySessionFiles(config) {
  for (const legacyPath of legacySessionPaths(config)) {
    try {
      fs.unlinkSync(legacyPath);
    } catch {}
  }
}

function archiveSession(config, session) {
  const dir = path.join(configDir(config), "sessions");
  ensureDir(dir);
  const filePath = path.join(dir, `${session.session_id || Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2) + "\n");
  try {
    fs.unlinkSync(sessionPath(config));
  } catch {}
  removeLegacySessionFiles(config);
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

function applyServerSessionResult(session, result) {
  const serverSessionId = String(result?.session_id || "").trim();
  if (!serverSessionId || serverSessionId === session.session_id) return false;
  session.client_session_id = session.session_id;
  session.session_id = serverSessionId;
  session.session_id_source = result.session_id_source || (result.deduped_start ? "server_deduped_start" : "server");
  session.server_deduped_start = Boolean(result.deduped_start);
  return true;
}

function readStandardVersion(standardDir) {
  try {
    const p = path.join(standardDir || repoRoot(), "VERSION");
    return fs.existsSync(p) ? fs.readFileSync(p, "utf8").trim() : "unknown";
  } catch {
    return "unknown";
  }
}

function printVersion() {
  const standardDir = path.resolve(process.env.BDA_AI_DEV_STANDARD_DIR || repoRoot());
  console.log(JSON.stringify({
    ok: true,
    name: "bda-ai-dev-standard",
    session_version: SESSION_VERSION,
    cli_version: cliVersion(),
    standard_version: readStandardVersion(standardDir),
    note: "cli_version = version ของตัว CLI; standard_version = version ของชุด docs/commands/eval (bda update ดึงล่าสุดให้)",
  }, null, 2));
}

// day-1 client setup: ทำ Cline config ให้อัตโนมัติ (ต้นทาง ไม่ต้องเปิด docs) — defensive, ไม่พังของเดิม
function runClineSetup(standardDir) {
  const script = path.join(standardDir, "scripts", "setup-cline-bda.sh");
  if (process.platform === "win32") return { ran: false, reason: "windows-ยังไม่รองรับ script (ตั้งใน Cline UI: ctx 262144)" };
  if (!fs.existsSync(script)) return { ran: false, reason: "script-missing" };
  const clineState = path.join(os.homedir(), ".cline", "data", "globalState.json");
  if (!fs.existsSync(clineState)) return { ran: false, reason: "cline-ยังไม่ได้ติดตั้ง/ตั้งค่า — ข้าม" };
  try {
    const out = execFileSync("bash", [script], { encoding: "utf8", env: process.env });
    return { ran: true, ok: true, detail: out.trim().split("\n").filter(Boolean).slice(-2).join(" | ") };
  } catch (err) {
    const msg = String((err.stdout || "") + (err.stderr || "") + (err.message || ""));
    if (msg.includes("ต้องปิด")) return { ran: false, reason: "editors-open", hint: "ปิด VS Code / Devin / Windsurf ให้หมด แล้วรัน: bda setup" };
    return { ran: false, reason: "error", detail: msg.slice(0, 160) };
  }
}

async function setupClient(config, args) {
  const standardDir = path.resolve(process.env.BDA_AI_DEV_STANDARD_DIR || repoRoot());
  const cline = runClineSetup(standardDir);
  console.log(JSON.stringify({
    ok: true,
    action: "setup",
    standard_dir: standardDir,
    standard_version: readStandardVersion(standardDir),
    cli_version: cliVersion(),
    cline_config: cline,
    claude_code_model: "Claude Code ตั้ง model = claude-code-local (ถ้าตั้ง claude-sonnet-4-5 ไว้จะได้ 400 — เปลี่ยนใน settings)",
    next: cline.reason === "editors-open"
      ? "ปิด editor ทุกตัวแล้วรัน: bda setup"
      : "เปิด Cline task ใหม่ จะเห็น context 262k",
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
  let clientSetup = null;
  if (!boolValue(args.no_setup) && !dryRun) {
    try { clientSetup = runClineSetup(standardDir); } catch (e) { clientSetup = { ran: false, reason: "error", detail: String(e.message || e).slice(0, 120) }; }
  }
  const inventorySendResult = await sendInventoryEvent(config, args, {
    source: "bda update",
    utility_command: "bda update",
    before_version: beforeVersion,
    after_version: afterVersion,
    bda_ai_dev_standard_version: afterVersion,
    standard_dir: standardDir,
    used_git_repo: hasGitRepo,
    gateway_models_count: gatewayModels.length,
  });

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
    client_setup: clientSetup,
    inventory_send_result: inventorySendResult,
    note: "Restart Hermes Desktop after update if it is open. Hermes BDA provider/model config has been cleaned so only the BDA AI Gateway group remains.",
  }, null, 2));
}

function cleanHermesConfigWithUpdatedScript(standardDir, gatewayModels = FALLBACK_BDA_MODELS) {
  const updatedScript = path.join(standardDir, "scripts", "bda.mjs");
  if (fs.existsSync(updatedScript) && path.resolve(updatedScript) !== path.resolve(new URL(import.meta.url).pathname)) {
    try {
      const raw = execFileSync(process.execPath, [updatedScript, "config-clean"], {
        encoding: "utf8",
        env: {
          ...process.env,
          BDA_UPDATE_POST_CLEAN: "1",
          BDA_GATEWAY_MODELS_JSON: JSON.stringify(gatewayModels),
          BDA_GATEWAY_CONTEXT_JSON: JSON.stringify(Object.fromEntries(GATEWAY_CONTEXT_WINDOWS)),
        },
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
    .replace(/You are running with BDA AI Dev Standard v[0-9.]+/g, "You are running with BDA AI Dev Standard v0.11.6")
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

function safeBackupName(filePath) {
  return filePath
    .replaceAll("\\", "_")
    .replaceAll("/", "_")
    .replaceAll(":", "")
    .replace(/^_+/, "");
}

function movePathToBackup(filePath, backupDir, result, dryRun) {
  const backupPath = path.join(backupDir, safeBackupName(filePath));
  result.moved.push({ from: filePath, to: backupPath });
  if (dryRun) return;
  try {
    ensureDir(path.dirname(backupPath));
    fs.renameSync(filePath, backupPath);
  } catch (error) {
    result.errors.push({ path: filePath, error: error.message });
  }
}

function isForbiddenHermesArchivePath(filePath) {
  return FORBIDDEN_HERMES_ARCHIVE_PATHS.includes(path.resolve(filePath));
}

function moveHermesState(config = {}, { dryRun = false } = {}) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const backupDir = path.join(configDir(config), "hermes-state-backups", stamp);
  const result = {
    backup_dir: backupDir,
    moved: [],
    missing: [],
    skipped_for_safety: [],
    errors: [],
    dry_run: dryRun,
  };

  for (const statePath of HERMES_STATE_PATHS) {
    if (isForbiddenHermesArchivePath(statePath)) {
      result.skipped_for_safety.push({
        path: statePath,
        reason: "Refusing to archive whole Hermes app/profile root. Only targeted state paths may be archived.",
      });
      continue;
    }
    if (!fs.existsSync(statePath)) {
      result.missing.push(statePath);
      continue;
    }
    movePathToBackup(statePath, backupDir, result, dryRun);
  }
  return result;
}

function pruneHermesSkills(config = {}, { dryRun = false } = {}) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const backupDir = path.join(configDir(config), "hermes-light-mode-backups", stamp);
  const result = {
    backup_dir: backupDir,
    keep_names: [...HERMES_SKILL_KEEP_NAMES],
    moved: [],
    kept: [],
    missing: [],
    skipped_for_safety: [],
    errors: [],
    dry_run: dryRun,
  };

  for (const skillDir of HERMES_SKILL_DIRS) {
    if (!fs.existsSync(skillDir)) {
      result.missing.push(skillDir);
      continue;
    }
    if (isForbiddenHermesArchivePath(skillDir)) {
      result.skipped_for_safety.push({ path: skillDir, reason: "Refusing to archive whole Hermes app/profile root." });
      continue;
    }
    let entries = [];
    try {
      entries = fs.readdirSync(skillDir, { withFileTypes: true });
    } catch (error) {
      result.errors.push({ path: skillDir, error: error.message });
      continue;
    }
    for (const entry of entries) {
      const entryPath = path.join(skillDir, entry.name);
      if (HERMES_SKILL_KEEP_NAMES.has(entry.name)) {
        result.kept.push(entryPath);
        continue;
      }
      movePathToBackup(entryPath, backupDir, result, dryRun);
    }
  }

  for (const snapshotPath of HERMES_SKILL_SNAPSHOT_PATHS) {
    if (!fs.existsSync(snapshotPath)) {
      result.missing.push(snapshotPath);
      continue;
    }
    movePathToBackup(snapshotPath, backupDir, result, dryRun);
  }

  return result;
}

function pathInfo(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { path: filePath, exists: false, type: "missing", bytes: 0, modified_at: "" };
    }
    const stats = fs.statSync(filePath);
    return {
      path: filePath,
      exists: true,
      type: stats.isDirectory() ? "dir" : "file",
      bytes: stats.size,
      modified_at: stats.mtime.toISOString(),
    };
  } catch (error) {
    return { path: filePath, exists: false, type: "error", bytes: 0, modified_at: "", error: error.message };
  }
}

function directorySize(rootPath, { maxEntries = 50000 } = {}) {
  const result = { bytes: 0, files: 0, dirs: 0, truncated: false, errors: [] };
  function walk(currentPath) {
    if (result.truncated) return;
    let stats;
    try {
      stats = fs.statSync(currentPath);
    } catch (error) {
      result.errors.push({ path: currentPath, error: error.message });
      return;
    }
    result.bytes += stats.size;
    if (!stats.isDirectory()) {
      result.files += 1;
      return;
    }
    result.dirs += 1;
    let entries = [];
    try {
      entries = fs.readdirSync(currentPath);
    } catch (error) {
      result.errors.push({ path: currentPath, error: error.message });
      return;
    }
    for (const entry of entries) {
      if (result.files + result.dirs >= maxEntries) {
        result.truncated = true;
        return;
      }
      walk(path.join(currentPath, entry));
    }
  }
  if (fs.existsSync(rootPath)) walk(rootPath);
  return result;
}

function requestDumpSummary(rootPath) {
  const sessionsDir = path.join(rootPath, "sessions");
  const summary = { path: sessionsDir, exists: fs.existsSync(sessionsDir), count: 0, bytes: 0, largest: [] };
  if (!summary.exists) return summary;
  try {
    for (const name of fs.readdirSync(sessionsDir)) {
      if (!/^request_dump_.*\.json$/.test(name)) continue;
      const filePath = path.join(sessionsDir, name);
      const stats = fs.statSync(filePath);
      summary.count += 1;
      summary.bytes += stats.size;
      summary.largest.push({ path: filePath, bytes: stats.size, modified_at: stats.mtime.toISOString() });
    }
  } catch (error) {
    summary.error = error.message;
  }
  summary.largest.sort((a, b) => b.bytes - a.bytes);
  summary.largest = summary.largest.slice(0, 5);
  return summary;
}

function skillSummary(rootPath) {
  const summary = { path: rootPath, exists: fs.existsSync(rootPath), entries: 0, bytes: 0, kept_recommended: [...HERMES_SKILL_KEEP_NAMES] };
  if (!summary.exists) return summary;
  try {
    for (const name of fs.readdirSync(rootPath)) {
      const entryPath = path.join(rootPath, name);
      const stats = fs.statSync(entryPath);
      summary.entries += 1;
      summary.bytes += stats.isDirectory() ? directorySize(entryPath, { maxEntries: 200 }).bytes : stats.size;
    }
  } catch (error) {
    summary.error = error.message;
  }
  return summary;
}

const HERMES_SESSION_WARN_TOKENS = 30000;
const HERMES_SESSION_CRITICAL_TOKENS = 80000;
const DEAD_GATEWAY_DOMAINS = ["ai.bda.co.th"];

function estimateTokensFromBytes(bytes) {
  return Math.round((bytes || 0) / 4);
}

function hermesSessionSummary() {
  const sessionDirs = HERMES_STATE_PATHS.filter((statePath) => path.basename(statePath) === "sessions");
  const summary = { dirs: [], count: 0, bytes: 0, largest: [], errors: [] };
  for (const dir of sessionDirs) {
    if (!fs.existsSync(dir)) continue;
    summary.dirs.push(dir);
    let entries = [];
    try {
      entries = fs.readdirSync(dir);
    } catch (error) {
      summary.errors.push({ path: dir, error: error.message });
      continue;
    }
    for (const name of entries) {
      if (/^request_dump_.*\.json$/.test(name)) continue;
      const filePath = path.join(dir, name);
      let stats;
      try {
        stats = fs.statSync(filePath);
      } catch {
        continue;
      }
      const bytes = stats.isDirectory() ? directorySize(filePath, { maxEntries: 500 }).bytes : stats.size;
      summary.count += 1;
      summary.bytes += bytes;
      summary.largest.push({
        path: filePath,
        bytes,
        est_tokens: estimateTokensFromBytes(bytes),
        modified_at: stats.mtime.toISOString(),
      });
    }
  }
  summary.largest.sort((a, b) => b.bytes - a.bytes);
  summary.largest = summary.largest.slice(0, 3);
  return summary;
}

function hermesLightModeSummary() {
  const summary = { applied: true, non_bda_entries: 0, sample_names: [] };
  for (const skillDir of HERMES_SKILL_DIRS) {
    if (!fs.existsSync(skillDir)) continue;
    let entries = [];
    try {
      entries = fs.readdirSync(skillDir);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (HERMES_SKILL_KEEP_NAMES.has(name)) continue;
      summary.applied = false;
      summary.non_bda_entries += 1;
      if (summary.sample_names.length < 5) summary.sample_names.push(name);
    }
  }
  for (const snapshotPath of HERMES_SKILL_SNAPSHOT_PATHS) {
    if (fs.existsSync(snapshotPath)) summary.applied = false;
  }
  return summary;
}

function gatewayDomainSanity(config = {}) {
  const candidateFiles = Array.from(new Set([
    path.join(configDir(config), "config.json"),
    ...HERMES_CONFIG_PATHS,
    ...HERMES_CONFIG_PATHS.map((configPath) => path.join(path.dirname(configPath), ".env")),
  ]));
  const staleFiles = [];
  for (const filePath of candidateFiles) {
    if (!filePath || !fs.existsSync(filePath)) continue;
    try {
      const content = fs.readFileSync(filePath, "utf8");
      if (DEAD_GATEWAY_DOMAINS.some((domain) => content.includes(domain))) staleFiles.push(filePath);
    } catch {}
  }
  return {
    expected_base_url: BDA_GATEWAY_BASE_URL,
    stale_domain_files: staleFiles,
    stale_domain_found: staleFiles.length > 0,
  };
}

function fixStaleGatewayDomains(config = {}, { dryRun = false } = {}) {
  const newHost = new URL(BDA_GATEWAY_BASE_URL).host;
  const candidateFiles = Array.from(new Set([
    path.join(configDir(config), "config.json"),
    ...HERMES_CONFIG_PATHS,
    ...HERMES_ENV_PATHS,
    ...HERMES_CONFIG_PATHS.map((configPath) => path.join(path.dirname(configPath), ".env")),
  ]));
  const result = { new_host: newHost, fixed: [], unchanged: [], dry_run: dryRun, errors: [] };
  for (const filePath of candidateFiles) {
    if (!filePath || !fs.existsSync(filePath)) continue;
    try {
      const before = fs.readFileSync(filePath, "utf8");
      let after = before;
      for (const domain of DEAD_GATEWAY_DOMAINS) {
        after = after.split(domain).join(newHost);
      }
      if (after === before) {
        result.unchanged.push(filePath);
        continue;
      }
      let backupPath = "";
      if (!dryRun) {
        const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
        backupPath = `${filePath}.bak-${stamp}`;
        fs.copyFileSync(filePath, backupPath);
        fs.writeFileSync(filePath, after);
      }
      result.fixed.push({ path: filePath, backup_path: backupPath });
    } catch (error) {
      result.errors.push({ path: filePath, error: error.message });
    }
  }
  return result;
}

function buildDoctorReport(config = {}, fixResult = null) {
  const session = readSession(config);
  const configFiles = {
    bda_config: pathInfo(path.join(configDir(config), "config.json")),
    hermes_config: pathInfo(path.join(os.homedir(), ".hermes", "config.yaml")),
    hermes_env: { ...pathInfo(path.join(os.homedir(), ".hermes", ".env")), note: "content not printed" },
  };
  const hermesState = HERMES_STATE_ROOTS.map((rootPath) => {
    const info = pathInfo(rootPath);
    if (info.exists && info.type === "dir") {
      const size = directorySize(rootPath);
      info.bytes = size.bytes;
      info.files = size.files;
      info.dirs = size.dirs;
      info.truncated = size.truncated;
      if (size.errors.length) info.errors = size.errors.slice(0, 5);
    }
    return info;
  }).filter((entry) => entry.exists);
  const requestDumps = HERMES_STATE_ROOTS.map(requestDumpSummary).filter((entry) => entry.exists);
  const hermesSkills = HERMES_SKILL_DIRS.map(skillSummary).filter((entry) => entry.exists);
  const totalHermesBytes = hermesState.reduce((sum, entry) => sum + (entry.bytes || 0), 0);
  const totalDumpBytes = requestDumps.reduce((sum, entry) => sum + (entry.bytes || 0), 0);
  const totalSkillEntries = hermesSkills.reduce((sum, entry) => sum + (entry.entries || 0), 0);
  const hermesSessions = hermesSessionSummary();
  const lightMode = hermesLightModeSummary();
  const gatewayDomain = gatewayDomainSanity(config);
  const largestSessionTokens = hermesSessions.largest.length ? hermesSessions.largest[0].est_tokens : 0;
  const warnings = [
    "Do not paste request_dump_*.json, state.db, state.db-wal, .env, auth.json, or config files into AI chat.",
    "bda current only checks BDA CLI session, not hidden Hermes chat/context state.",
  ];
  const issues = [];
  if (!configFiles.bda_config.exists) issues.push({ code: "missing_bda_config", message: "Missing ~/.bda-skills/config.json." });
  if (!configFiles.hermes_config.exists) issues.push({ code: "missing_hermes_config", message: "Missing ~/.hermes/config.yaml." });
  if (!configFiles.hermes_env.exists) issues.push({ code: "missing_hermes_env", message: "Missing ~/.hermes/.env." });
  if (totalHermesBytes >= HERMES_STATE_CRITICAL_BYTES) {
    issues.push({ code: "hermes_state_critical", message: "Hermes hidden state is very large and can carry stale context into new requests.", bytes: totalHermesBytes, action: "Close Hermes and run bda doctor --fix." });
  } else if (totalHermesBytes >= HERMES_STATE_WARN_BYTES) {
    warnings.push(`Hermes hidden state is large (${totalHermesBytes} bytes). Run bda doctor --fix if context leaks or paid usage spikes.`);
  }
  if (totalDumpBytes >= HERMES_REQUEST_DUMP_WARN_BYTES) {
    issues.push({ code: "large_request_dumps", message: "Hermes request dumps are large; they usually indicate repeated large-context failures.", bytes: totalDumpBytes, action: "Close Hermes and run bda doctor --fix." });
  }
  if (gatewayDomain.stale_domain_found) {
    issues.push({
      code: "stale_gateway_domain",
      message: `Config still references a dead gateway domain (${DEAD_GATEWAY_DOMAINS.join(", ")}). Requests to it will fail.`,
      files: gatewayDomain.stale_domain_files,
      action: "Run: bda update, then bda doctor --fix (rewrites BDA_AI_ROUTER_BASE_URL/BDA_WORK_LOG_URL to the current gateway), then restart Hermes.",
    });
  }
  if (largestSessionTokens >= HERMES_SESSION_CRITICAL_TOKENS) {
    issues.push({
      code: "hermes_session_bloat",
      message: `Largest Hermes session is ~${largestSessionTokens} tokens; every reply resends all of it and slows responses.`,
      est_tokens: largestSessionTokens,
      action: "Open a New session in Hermes for new tasks. Old sessions stay available.",
    });
  } else if (largestSessionTokens >= HERMES_SESSION_WARN_TOKENS) {
    warnings.push(`Largest Hermes session is ~${largestSessionTokens} tokens. Open a New session in Hermes for new tasks to keep prompts small and fast.`);
  }
  if (!lightMode.applied) {
    warnings.push(`Hermes light mode not applied (${lightMode.non_bda_entries} non-BDA skill entries). Run bda hermes-light-mode --yes to slim the base prompt.`);
  }
  return {
    ok: issues.length === 0,
    action: "doctor",
    version: SESSION_VERSION,
    bda_cli_version: cliVersion(),
    platform: process.platform,
    employee_code: config.employee_code || "",
    employee_group: config.employee_group || "",
    ai_model: config.ai_model || "",
    active_bda_session: Boolean(session.session_id),
    session_file: sessionPath(config),
    config_files: configFiles,
    hermes_state: hermesState,
    hermes_state_total_bytes: totalHermesBytes,
    request_dumps: requestDumps,
    request_dump_total_bytes: totalDumpBytes,
    hermes_skills: hermesSkills,
    hermes_skill_entries: totalSkillEntries,
    hermes_sessions: hermesSessions,
    hermes_session_count: hermesSessions.count,
    hermes_largest_session_est_tokens: largestSessionTokens,
    light_mode_applied: lightMode.applied,
    light_mode: lightMode,
    gateway_domain: gatewayDomain,
    issues,
    warnings,
    fix_result: fixResult,
  };
}

async function printDoctor(config = {}, args = {}) {
  const shouldFix = boolValue(args.fix) || boolValue(args.yes);
  let fixResult = null;
  if (shouldFix) {
    fixResult = moveHermesState(config, { dryRun: false });
    fixResult.gateway_env_sync = syncHermesEnv(config, { dryRun: false });
    fixResult.gateway_domain_fix = fixStaleGatewayDomains(config, { dryRun: false });
  }
  const report = buildDoctorReport(config, fixResult);
  report.inventory_send_result = await sendInventoryEvent(config, args, {
    source: "bda doctor",
    utility_command: shouldFix ? "bda doctor --fix" : "bda doctor",
    bda_ai_dev_standard_version: report.bda_cli_version,
    doctor_issue_count: report.issues.length,
    hermes_state_total_bytes: report.hermes_state_total_bytes,
    request_dump_total_bytes: report.request_dump_total_bytes,
    hermes_session_count: report.hermes_session_count,
    hermes_largest_session_est_tokens: report.hermes_largest_session_est_tokens,
    hermes_skill_entries: report.hermes_skill_entries,
    light_mode_applied: report.light_mode_applied,
    stale_gateway_domain: report.gateway_domain.stale_domain_found,
  });
  console.log(JSON.stringify(report, null, 2));
}

async function printHermesReset(config = {}, args = {}) {
  const dryRun = boolValue(args.dry_run);
  const stateResult = moveHermesState(config, { dryRun });
  const models = await fetchBdaGatewayModels(config);
  const configResult = cleanHermesConfig({ dryRun, models });
  const hermesEnv = syncHermesEnv(config, { dryRun });
  const thclaws = syncThclawsCatalogue(models, { dryRun });
  console.log(JSON.stringify({
    ok: stateResult.errors.length === 0,
    action: "hermes-reset",
    dry_run: dryRun,
    hermes_state: stateResult,
    gateway_models: models,
    hermes_config: configResult,
    hermes_env: hermesEnv,
    thclaws_config: thclaws,
    note: "Close Hermes Desktop before running this command. This archives Hermes chat/session state only; config.yaml, .env, and API keys are kept. Open Hermes again and start a fresh chat after reset.",
  }, null, 2));
  if (stateResult.errors.length) process.exit(1);
}

function printHermesLightMode(config = {}, args = {}) {
  const dryRun = boolValue(args.dry_run) || !(boolValue(args.yes) || boolValue(args.force));
  const result = pruneHermesSkills(config, { dryRun });
  console.log(JSON.stringify({
    ok: result.errors.length === 0,
    action: "hermes-light-mode",
    dry_run: dryRun,
    hermes_skills: result,
    note: dryRun
      ? "Dry run only. Re-run with: bda hermes-light-mode --yes"
      : "Archived unused Hermes skill cache/snapshots. Restart Hermes Desktop and open a New session.",
  }, null, 2));
  if (result.errors.length) process.exit(1);
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
    BDA_AI_WORK_EVENT_URL: workEventUrlFromBaseUrl(BDA_GATEWAY_BASE_URL),
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

/*
 * bda thai-check — deterministic Thai text validator (safety net สุดท้าย)
 * เหตุผล: local model (Qwen3.6) มีจุดอ่อนตอน generate ภาษาไทย (สระ/วรรณยุกต์เพี้ยนเป็นรายครั้ง)
 * ตัวนี้จับเฉพาะ sequence ที่ "ผิดโครงสร้างภาษาไทยแน่นอน" — ส่วนคำสะกดถูกแต่ผิดความหมาย
 * (เช่น "หน่า" แทน "น่า") ต้องพึ่ง self-review rule ใน CLAUDE.md/AGENTS.md/.clinerules แทน
 *
 * Character classes (Unicode Thai block):
 *   consonant   ก-ฮ           U+0E01-U+0E2E
 *   above vowel ั ิ ี ึ ื ็    U+0E31, U+0E34-U+0E37, U+0E47  (ำ U+0E33 ไม่นับ — น้ำ = tone+ำ ถูกต้อง)  (thai-check:ignore)
 *   below vowel ุ ู ฺ          U+0E38-U+0E3A  (thai-check:ignore)
 *   tone        ่ ้ ๊ ๋        U+0E48-U+0E4B  (thai-check:ignore)
 *   other above ์ ํ ๎          U+0E4C-U+0E4E  (thai-check:ignore)
 */
const THAI_CONSONANT = "ก-ฮ";
const THAI_ABOVE_VOWEL = "ัิ-ื็"; // thai-check:ignore
const THAI_BELOW_VOWEL = "ุ-ฺ"; // thai-check:ignore
const THAI_TONE = "่-๋"; // thai-check:ignore
const THAI_COMBINING = `${THAI_ABOVE_VOWEL}${THAI_BELOW_VOWEL}${THAI_TONE}ำ์-๎`; // thai-check:ignore

const THAI_CHECK_RULES = [
  {
    code: "double-tone",
    message: "วรรณยุกต์ซ้อนกัน 2 ตัวขึ้นไป",
    regex: new RegExp(`[${THAI_TONE}]{2,}`, "gu"),
  },
  {
    code: "stacked-vowel",
    message: "สระบน/สระล่างซ้อนกัน",
    regex: new RegExp(`[${THAI_ABOVE_VOWEL}${THAI_BELOW_VOWEL}][${THAI_ABOVE_VOWEL}${THAI_BELOW_VOWEL}]`, "gu"),
  },
  {
    code: "tone-before-vowel",
    message: "วรรณยุกต์นำหน้าสระบน/สระล่าง (ลำดับผิด เช่น น้ี ที่ถูกคือ นี้)", // thai-check:ignore
    regex: new RegExp(`[${THAI_TONE}][${THAI_ABOVE_VOWEL}${THAI_BELOW_VOWEL}]`, "gu"),
  },
  {
    code: "orphan-mark",
    message: "สระบน/ล่าง/วรรณยุกต์ไม่มีพยัญชนะนำหน้า",
    // combining mark ที่ตัวก่อนหน้าไม่ใช่พยัญชนะและไม่ใช่ combining mark ตัวอื่น (รวมขึ้นต้นบรรทัด)
    regex: new RegExp(`(?:^|[^${THAI_CONSONANT}${THAI_COMBINING}])[${THAI_COMBINING}]`, "gu"),
  },
  {
    code: "repeated-char",
    message: "อักษรไทยตัวเดียวกันซ้ำติดกันเกิน 4 ตัว (น่าสงสัยว่า generate เพี้ยน)",
    regex: new RegExp("([ก-๎])\\1{4,}", "gu"), // thai-check:ignore
  },
];

function thaiCheckLine(line) {
  const findings = [];
  // pragma: บรรทัดที่ตั้งใจมีตัวอย่างข้อความเพี้ยน (docs/สอน) ใส่ thai-check:ignore ในบรรทัดเดียวกันเพื่อข้าม
  if (line.includes("thai-check:ignore")) return findings;
  for (const rule of THAI_CHECK_RULES) {
    rule.regex.lastIndex = 0;
    let match;
    while ((match = rule.regex.exec(line)) !== null) {
      const col = match.index + 1;
      const from = Math.max(0, match.index - 6);
      const context = line.slice(from, Math.min(line.length, match.index + match[0].length + 6));
      findings.push({ code: rule.code, message: rule.message, col, context });
      if (match.index === rule.regex.lastIndex) rule.regex.lastIndex += 1;
    }
  }
  return findings;
}

function thaiCheckText(text, label) {
  const problems = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const finding of thaiCheckLine(line)) {
      problems.push({ file: label, line: index + 1, ...finding });
    }
  });
  return problems;
}

function thaiCheckStagedDiff() {
  const raw = execFileSync("git", ["diff", "--cached", "--unified=0", "--no-color"], { encoding: "utf8" });
  const problems = [];
  let currentFile = "(unknown)";
  let lineNo = 0;
  for (const line of raw.split(/\r?\n/)) {
    const fileMatch = line.match(/^\+\+\+ b\/(.+)$/);
    if (fileMatch) { currentFile = fileMatch[1]; continue; }
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) { lineNo = Number(hunkMatch[1]); continue; }
    if (line.startsWith("+") && !line.startsWith("+++")) {
      const content = line.slice(1);
      for (const finding of thaiCheckLine(content)) {
        problems.push({ file: currentFile, line: lineNo, ...finding });
      }
      lineNo += 1;
    }
  }
  return problems;
}

async function readStdinText() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function thaiCheck(args) {
  const files = args._.slice(1);
  let problems = [];
  const scanned = [];
  if (boolValue(args.diff)) {
    problems = thaiCheckStagedDiff();
    scanned.push("git diff --cached");
  } else if (files.length === 0 || (files.length === 1 && files[0] === "-")) {
    if (process.stdin.isTTY) {
      console.error(JSON.stringify({
        ok: false,
        error: "No input. Usage: bda thai-check <files...> | bda thai-check --diff | <cmd> | bda thai-check",
      }, null, 2));
      process.exit(2);
    }
    problems = thaiCheckText(await readStdinText(), "(stdin)");
    scanned.push("(stdin)");
  } else {
    for (const file of files) {
      if (!fs.existsSync(file)) {
        console.error(JSON.stringify({ ok: false, error: `File not found: ${file}` }, null, 2));
        process.exit(2);
      }
      problems = problems.concat(thaiCheckText(fs.readFileSync(file, "utf8"), file));
      scanned.push(file);
    }
  }
  if (problems.length === 0) {
    console.log(JSON.stringify({ ok: true, action: "thai-check", scanned, problems: [] }, null, 2));
    return;
  }
  for (const p of problems) {
    console.error(`${p.file}:${p.line}:${p.col} [${p.code}] ${p.message} -> "${p.context}"`);
  }
  console.error(JSON.stringify({
    ok: false,
    action: "thai-check",
    scanned,
    problem_count: problems.length,
    hint: "ข้อความไทยเพี้ยนจากการ generate — อ่านทวนแล้วแก้ให้ถูกก่อน commit (โมเดลตรวจ/แก้ไทยได้แม่น แค่สั่งให้ทวน)",
  }, null, 2));
  process.exit(1);
}

function printHelp() {
  console.log(`BDA AI Dev CLI ${SESSION_VERSION}

TERMINAL COMMANDS
  คำสั่งกลุ่มนี้พิมพ์ใน PowerShell / Terminal / Hermes terminal ได้จริง:

  bda start        เริ่ม session งานจริง และส่ง status=started
  bda current      ดู session ปัจจุบันจากไฟล์ BDA CLI
  bda stop         ปิด session และส่ง status=done/blocked/failed
  bda event        ส่ง event ระหว่าง session เช่น command ย่อย/งานย่อย
  bda help         ดู command และกติกาสั้น ๆ
  bda version      แสดง version ของ CLI/session format
  bda update       อัปเดต BDA AI Dev Standard + ตั้งค่า client ให้อัตโนมัติ (Cline 262k)
  bda setup        ตั้งค่า client (Cline context 262k) อย่างเดียว โดยไม่ดึง repo ใหม่
  bda doctor       ตรวจ config/session/Hermes hidden context โดยไม่เปิดเผย key/prompt
  bda doctor --fix archive Hermes state ที่เสี่ยง โดยไม่ลบ key/config/app
  bda config-status ตรวจ Hermes provider/model config ที่ bda update จะ rewrite
  bda config-clean rewrite Hermes provider/model config และล้าง model cache ทันที
  bda hermes-reset recovery ขั้นสูง: archive Hermes chat/session state เฉพาะจุด ไม่ลบ app/key/config
  bda hermes-clean-context --yes alias ของ hermes-reset สำหรับ installer/เครื่องที่ใช้ชื่อเดิม
  bda hermes-light-mode --yes archive skill cache ที่ไม่ใช้ ให้ Hermes prompt เบาลง
  bda thai-check     ตรวจข้อความไทยเพี้ยน (สระ/วรรณยุกต์ซ้อน/ลำดับผิด) ในไฟล์/stdin/git diff
                     ใช้: bda thai-check <files...> | bda thai-check --diff (staged) | <cmd> | bda thai-check
                     เจอปัญหา = exit 1 พร้อมบรรทัด/ตำแหน่ง — ใช้เป็น pre-commit hook ได้ (ดู docs/thai-output-safety.md)

Terminal examples:
  bda start --project "BDA-InnoHub" --task "debug login error" --command bda-dev --work-type debug
  bda current
  bda stop --status done --outcome "login validation fixed" --next-step "deploy staging"
  bda update
  bda doctor
  bda doctor --fix
  bda hermes-reset
  bda hermes-clean-context --yes
  bda hermes-light-mode --yes
  bda event --command bda-dev --work-type review --task "review login fix" --status done

CHAT-ONLY PROMPT PREFIXES
  ข้อความกลุ่มนี้พิมพ์ในช่อง chat ของ AI เท่านั้น ไม่ใช่ terminal command:

  bda-dev: debug login error
  bda-nondev: สรุป requirement จาก meeting note
  bda-pm: สรุป project status วันนี้

  ถ้าพิมพ์ใน terminal ให้ใช้ bda start / bda event / bda stop แทน

Model policy:
  bda/dev เป็น gateway หลักที่พนักงานทุกกลุ่มใช้ได้เมื่อทำงานกับ AI Gateway
  bda/nondev เป็น model สำหรับงานเอกสาร/สรุป/วิเคราะห์ทั่วไป ผ่าน OpenRouter DeepSeek v4 Flash
  bda-nondev เป็น command metadata สำหรับงานเอกสาร/สรุป ไม่ใช่การล็อคไม่ให้ใช้ bda/dev

COMMAND METADATA VALUES
  ค่า command ด้านล่างใช้ใส่ใน --command หรือใช้เป็น chat prefix ได้
  ตัวอย่าง terminal: bda event --command bda-dev --work-type review --task "review login fix" --status done

Available command metadata:`);
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
  if (applyServerSessionResult(session, result)) {
    saveSession(config, session);
  }
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
  if (applyServerSessionResult(session, result)) {
    saveSession(config, session);
  }
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
  if (applyServerSessionResult(session, result)) {
    const syncedArchived = archiveSession(config, session);
    console.log(JSON.stringify({ ok: true, action: "stop", archived_session: syncedArchived, event: payload, send_result: result }, null, 2));
    return;
  }
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
  if (subcommand === "setup") return setupClient(config, args);
  if (subcommand === "config-status") return printConfigStatus(config);
  if (subcommand === "config-clean") return printConfigClean(config);
  if (subcommand === "doctor") return printDoctor(config, args);
  if (subcommand === "hermes-reset") return printHermesReset(config, args);
  if (subcommand === "hermes-clean-context") return printHermesReset(config, args);
  if (subcommand === "hermes-light-mode") return printHermesLightMode(config, args);
  if (subcommand === "start") return start(config, args);
  if (subcommand === "event") return event(config, args);
  if (subcommand === "stop") return stop(config, args);
  if (subcommand === "current") return current(config);
  if (subcommand === "thai-check") return thaiCheck(args);
  console.error(`Unknown command: ${subcommand}\n`);
  printHelp();
  process.exit(2);
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
