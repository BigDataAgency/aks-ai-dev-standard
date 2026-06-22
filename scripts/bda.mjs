#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";

const DEFAULT_URL = "https://example.com/bda/work-events";
const SESSION_VERSION = "bda-session/0.10.3";

const COMMANDS = [
  ["bda-dev-debug", "debug", "แก้บั๊ก / ไล่ error / หาสาเหตุ"],
  ["bda-dev-review", "review", "review code / PR / design risk"],
  ["bda-dev-tdd", "test", "เขียน test ก่อนแก้หรือเพิ่ม feature"],
  ["bda-dev-plan-discuss", "plan", "คุย scope และทางเลือกก่อนทำ"],
  ["bda-dev-plan-create", "plan", "สร้างแผนงาน"],
  ["bda-dev-plan-execute", "implementation", "ทำงานตามแผน"],
  ["bda-dev-plan-review", "review", "ตรวจแผน/ผลลัพธ์"],
  ["bda-dev-plan-verify", "verification", "ตรวจผล/หลักฐาน"],
  ["bda-nondev-explore", "explore", "ค้น/สรุป/วิเคราะห์งาน non-dev"],
  ["bda-nondev-write", "documentation", "เขียนเอกสาร/ข้อความ/สรุป"],
  ["bda-pm-log", "pm-log", "สร้าง PM daily/project log"],
  ["bda-pm-status", "pm-status", "สรุป project status"],
  ["bda-pm-risk", "pm-risk", "สรุป risk/blocker"],
  ["bda-pm-followup", "pm-followup", "ติดตาม next step"],
  ["bda-pm-requirement", "pm-requirement", "สรุป requirement"],
  ["bda-pm-standup", "pm-standup", "standup/team update"],
];

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
  const found = COMMANDS.find(([name]) => name === normalized);
  return found ? found[1] : fallback;
}

function normalizeCommand(command) {
  return String(command || "").trim().replace(/^\//, "");
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
  const command = normalizeCommand(args.command || session.command || "bda-nondev-explore");
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
    work_type: args.work_type || session.work_type || inferWorkType(command),
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

function printHelp() {
  console.log(`BDA AI Dev CLI ${SESSION_VERSION}

Flow:
  bda start   เริ่ม session งานจริง และส่ง status=started
  bda help    ดู command ที่ใช้ได้
  bda version แสดง version ของ CLI/session format
  bda event   ส่ง event ระหว่าง session เช่น command ย่อย/งานย่อย
  bda stop    ปิด session และส่ง status=done/blocked/failed

Examples:
  bda start --project "BDA-InnoHub" --task "debug login error" --command bda-dev-debug
  bda event --command bda-dev-review --task "review login fix" --status done
  bda stop --status done --outcome "fixed login validation" --next-step "deploy to staging"

Prompt style in AI chat:
  bda-dev-debug: debug login error
  bda-nondev-explore: สรุป requirement จาก meeting note
  bda-pm-status: สรุป project status วันนี้

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
    ["command", "Command เช่น bda-dev-debug / bda-nondev-explore / bda-pm-status"],
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
