#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DEFAULT_URL = "https://example.com/bda/work-events";

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function loadConfig() {
  const globalConfig = readJson(path.join(os.homedir(), ".bda-skills", "config.json"));
  const projectConfig = readJson(path.join(process.cwd(), ".bda-skills", "config.json"));
  return { ...globalConfig, ...projectConfig, project_name: projectConfig.project_name || globalConfig.project_name };
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
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

function envOrConfig(envName, config, keys, fallback = "") {
  if (process.env[envName]) return process.env[envName];
  for (const key of keys) {
    if (config[key]) return String(config[key]);
  }
  return fallback;
}

function numberValue(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function booleanValue(value) {
  if (value === true) return true;
  if (!value) return false;
  return ["1", "true", "yes", "y"].includes(String(value).toLowerCase());
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = loadConfig();
  const command = args.command || "";
  const taskSummary = args.task || args.task_summary || "";
  const employeeCode = args.employee_code || envOrConfig("BDA_EMPLOYEE_CODE", config, ["employee_code"]);
  const employeeGroup = args.employee_group || envOrConfig("BDA_EMPLOYEE_GROUP", config, ["employee_group", "group"]);
  const project = args.project || envOrConfig("BDA_PROJECT", config, ["project_name"], "BDA-General");
  const sessionId = args.session_id || `${new Date().toISOString().slice(0, 10)}-${employeeCode || "unknown"}-${project}-${command.replaceAll("/", "-")}`;
  const url = args.url || envOrConfig("BDA_AI_WORK_EVENT_URL", config, ["work_event_url"])
    || envOrConfig("BDA_WORK_LOG_URL", config, ["work_log_url"], DEFAULT_URL);
  const apiKey = args.api_key || envOrConfig("BDA_AI_ROUTER_API_KEY", config, ["api_key"]);

  const event = {
    employee_code: employeeCode,
    employee_group: employeeGroup,
    project,
    tool: args.tool || "bda-ai-dev",
    command,
    task_summary: taskSummary,
    session_id: sessionId,
    work_type: args.work_type || "ai-work",
    status: args.status || "done",
    ai_provider: args.ai_provider || "",
    ai_model: args.ai_model || "",
    used_bda_gateway: booleanValue(args.used_bda_gateway),
    prompt_tokens: numberValue(args.prompt_tokens),
    completion_tokens: numberValue(args.completion_tokens),
    total_tokens: numberValue(args.total_tokens),
    duration_ms: numberValue(args.duration_ms),
    quality_score: args.quality_score || "",
    outcome: args.outcome || "",
    next_step: args.next_step || "",
    blocker: args.blocker || "",
    priority: args.priority || "",
    due_date: args.due_date || "",
    pm_status: args.pm_status || "",
  };

  const missing = ["employee_code", "project", "command", "task_summary", "session_id", "work_type", "status"]
    .filter((key) => !String(event[key] || "").trim());
  if (missing.length) {
    console.error(JSON.stringify({ ok: false, missing, event }, null, 2));
    process.exit(2);
  }

  if (args.dry_run || url === DEFAULT_URL) {
    console.log(JSON.stringify({
      ok: true,
      dry_run: true,
      reason: url === DEFAULT_URL ? "BDA_WORK_LOG_URL is not configured" : "dry-run requested",
      event,
    }, null, 2));
    return;
  }

  const headers = { "content-type": "application/json" };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(event),
  });
  const body = await response.text();
  if (!response.ok) {
    console.error(body);
    process.exit(1);
  }
  console.log(body);
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }));
  process.exit(1);
});
