#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const VERSION = "installer/0.11.4";
const STANDARD_REPO_URL = "https://github.com/BigDataAgency/bda-ai-dev-standard.git";
const BDA_GATEWAY_BASE_URL = "https://ai.bda.co.th/v1";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const raw = argv[i];
    if (!raw.startsWith("--")) continue;
    const key = raw.slice(2).replaceAll("-", "_");
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function repoRoot() {
  return path.dirname(path.dirname(fileURLToPath(import.meta.url)));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(dirPath, dryRun) {
  if (dryRun) return;
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(filePath, content, dryRun, mode) {
  if (dryRun) return;
  ensureDir(path.dirname(filePath), false);
  fs.writeFileSync(filePath, content);
  if (mode) fs.chmodSync(filePath, mode);
}

function copyFile(src, dest, dryRun, mode) {
  if (dryRun) return;
  ensureDir(path.dirname(dest), false);
  fs.copyFileSync(src, dest);
  if (mode) fs.chmodSync(dest, mode);
}

function commandExists(command) {
  const check = process.platform === "win32" ? "where" : "command";
  const args = process.platform === "win32" ? [command] : ["-v", command];
  const result = spawnSync(check, args, { stdio: "ignore", shell: process.platform !== "win32" });
  return result.status === 0;
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    stdio: options.stdio || "pipe",
    encoding: options.encoding || "utf8",
    cwd: options.cwd,
    env: options.env || process.env,
  });
}

function normalizeConfig(input = {}, args = {}) {
  const config = {
    employee_code: args.employee_code || input.employee_code || process.env.BDA_EMPLOYEE_CODE || "",
    employee_group: args.employee_group || input.employee_group || input.group || process.env.BDA_EMPLOYEE_GROUP || "",
    api_key: args.api_key || input.api_key || input.work_event_api_key || process.env.BDA_AI_ROUTER_API_KEY || process.env.BDA_WORK_EVENT_API_KEY || "",
    work_event_url: args.work_event_url || input.work_event_url || input.bda_work_event_url || process.env.BDA_WORK_LOG_URL || "",
    ai_model: args.ai_model || input.ai_model || process.env.BDA_AI_MODEL || "bda/dev",
    ai_provider: args.ai_provider || input.ai_provider || "bda-gateway",
    used_bda_gateway: true,
    tool: input.tool || "hermes-desktop-agent",
    installer_version: VERSION,
  };
  if (!config.work_event_url) config.work_event_url = `${BDA_GATEWAY_BASE_URL.replace(/\/v1$/, "")}/bda/work-events`;
  return config;
}

function validateConfig(config) {
  const missing = [];
  if (!config.employee_code) missing.push("employee_code");
  if (!config.employee_group) missing.push("employee_group");
  if (!config.api_key) missing.push("api_key");
  if (missing.length) {
    throw new Error(`Missing private config field(s): ${missing.join(", ")}. Provide --private-config <file>.`);
  }
}

function redactConfig(config) {
  return {
    ...config,
    api_key: config.api_key ? `sha256:${cryptoSafeHash(config.api_key)}` : "",
  };
}

function cryptoSafeHash(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function writeBdaConfig(config, dryRun) {
  const configPath = path.join(os.homedir(), ".bda-skills", "config.json");
  writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, dryRun, 0o600);
  return configPath;
}

function standardDir(args = {}) {
  return args.standard_dir || path.join(os.homedir(), ".bda-ai-dev-standard");
}

function installStandardRepo(targetDir, dryRun) {
  if (dryRun) return { target_dir: targetDir, action: fs.existsSync(targetDir) ? "would_update" : "would_clone" };
  if (!commandExists("git")) {
    throw new Error("git is required for installer/update. Install git first.");
  }
  if (fs.existsSync(path.join(targetDir, ".git"))) {
    run("git", ["fetch", "origin", "main"], { cwd: targetDir, stdio: "inherit" });
    run("git", ["reset", "--hard", "origin/main"], { cwd: targetDir, stdio: "inherit" });
    return { target_dir: targetDir, action: "updated" };
  }
  if (fs.existsSync(targetDir)) {
    throw new Error(`${targetDir} exists but is not a git repo. Move it aside or pass --standard-dir.`);
  }
  ensureDir(path.dirname(targetDir), false);
  run("git", ["clone", "--depth", "1", STANDARD_REPO_URL, targetDir], { stdio: "inherit" });
  return { target_dir: targetDir, action: "cloned" };
}

function shellWrapper(standardPath) {
  return `#!/usr/bin/env sh
set -eu
exec node "${standardPath}/scripts/bda.mjs" "$@"
`;
}

function cmdWrapper(standardPath) {
  const escaped = standardPath.replaceAll("%", "%%");
  return `@echo off\r\nnode "${escaped}\\scripts\\bda.mjs" %*\r\n`;
}

function ps1Wrapper(standardPath) {
  return `& node ${JSON.stringify(path.join(standardPath, "scripts", "bda.mjs"))} @args\n`;
}

function wrapperTargets() {
  const targets = [];
  const skillsBin = path.join(os.homedir(), ".bda-skills", "bin");
  if (process.platform === "win32") {
    targets.push({ path: path.join(skillsBin, "bda.cmd"), type: "cmd" });
    targets.push({ path: path.join(skillsBin, "bda.ps1"), type: "ps1" });
    if (process.env.LOCALAPPDATA) {
      const hermesNode = path.join(process.env.LOCALAPPDATA, "hermes", "node");
      targets.push({ path: path.join(hermesNode, "bda.cmd"), type: "cmd", reason: "Hermes Desktop PATH compatibility" });
      targets.push({ path: path.join(hermesNode, "bda.ps1"), type: "ps1", reason: "Hermes Desktop PATH compatibility" });
      targets.push({ path: path.join(hermesNode, "bda"), type: "cmd", reason: "Hermes Desktop PATH compatibility" });
    }
  } else {
    targets.push({ path: path.join(skillsBin, "bda"), type: "sh" });
  }
  return targets;
}

function installWrappers(standardPath, dryRun) {
  return wrapperTargets().map((target) => {
    let content = "";
    let mode = undefined;
    if (target.type === "sh") {
      content = shellWrapper(standardPath);
      mode = 0o755;
    } else if (target.type === "cmd") {
      content = cmdWrapper(standardPath);
    } else if (target.type === "ps1") {
      content = ps1Wrapper(standardPath);
    }
    writeFile(target.path, content, dryRun, mode);
    return target;
  });
}

function installUpdateScript(standardPath, dryRun) {
  const binDir = path.join(os.homedir(), ".bda-skills", "bin");
  const targets = [];
  if (process.platform === "win32") {
    const ps1 = path.join(binDir, "bda-standard-update.ps1");
    const content = `& node ${JSON.stringify(path.join(standardPath, "scripts", "bda.mjs"))} update @args\n`;
    writeFile(ps1, content, dryRun);
    targets.push(ps1);
  } else {
    const sh = path.join(binDir, "bda-standard-update.sh");
    const content = `#!/usr/bin/env sh
set -eu
exec node "${standardPath}/scripts/bda.mjs" update "$@"
`;
    writeFile(sh, content, dryRun, 0o755);
    targets.push(sh);
  }
  return targets;
}

function installHermesConfig(standardPath, dryRun) {
  if (dryRun) return { skipped: false, dry_run: true };
  const bdaScript = path.join(standardPath, "scripts", "bda.mjs");
  const configClean = run(process.execPath, [bdaScript, "config-clean"], { encoding: "utf8" });
  return JSON.parse(configClean);
}

function runDoctor(standardPath, dryRun) {
  if (dryRun) return { action: "doctor", dry_run: true };
  const bdaScript = path.join(standardPath, "scripts", "bda.mjs");
  const doctor = run(process.execPath, [bdaScript, "doctor"], { encoding: "utf8" });
  return JSON.parse(doctor);
}

function printUsage() {
  console.log(`BDA employee installer ${VERSION}

Usage:
  node scripts/install-bda-standard.mjs --private-config /path/to/employee-config.json

Private config example:
  {
    "employee_code": "BDA001",
    "employee_group": "dev",
    "api_key": "sk-...",
    "ai_model": "bda/dev"
  }

Notes:
  - Do not commit private config files.
  - Installer writes ~/.bda-skills/config.json and bda wrappers.
  - Installer runs config-clean and doctor after setup.
  - Use bda update after this; do not reinstall unless lead asks.
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }
  const dryRun = Boolean(args.dry_run);
  const privateConfigPath = args.private_config;
  const privateConfig = privateConfigPath ? readJson(privateConfigPath) : {};
  const config = normalizeConfig(privateConfig, args);
  validateConfig(config);

  const targetDir = standardDir(args);
  const repo = installStandardRepo(targetDir, dryRun);
  const configPath = writeBdaConfig(config, dryRun);
  const wrappers = installWrappers(targetDir, dryRun);
  const updateScripts = installUpdateScript(targetDir, dryRun);
  const hermesConfig = installHermesConfig(targetDir, dryRun);
  const doctor = runDoctor(targetDir, dryRun);

  console.log(JSON.stringify({
    ok: !doctor.issues || doctor.issues.length === 0,
    action: "install-bda-standard",
    installer_version: VERSION,
    dry_run: dryRun,
    standard_repo: repo,
    config_path: configPath,
    config: redactConfig(config),
    wrappers,
    update_scripts: updateScripts,
    hermes_config: hermesConfig,
    doctor,
    next_steps: [
      "Restart Hermes Desktop.",
      "Run: bda version",
      "Run: bda doctor",
      "Use bda update from now on; do not reinstall unless lead asks.",
    ],
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, action: "install-bda-standard", installer_version: VERSION, error: error.message }, null, 2));
  process.exit(1);
});
