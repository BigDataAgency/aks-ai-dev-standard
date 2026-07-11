# BDA Session CLI

`bda` is the lightweight session command for useful AI work logging. It works with BDA Gateway and with other AI tools, as long as the employee runs the CLI with their personal config/key.

Public repo rule: do not commit production endpoint or employee keys. Configure private values in `~/.bda-skills/config.json`, project `.bda-skills/config.json`, or environment variables.

## Private Config

```json
{
  "employee_code": "BDA001",
  "employee_group": "dev",
  "work_event_url": "https://example.com/bda/work-events",
  "api_key": "sk-personal-key",
  "tool": "hermes-desktop-agent"
}
```

Supported environment variables:

```text
BDA_EMPLOYEE_CODE
BDA_EMPLOYEE_GROUP
BDA_AI_WORK_EVENT_URL
BDA_WORK_LOG_URL
BDA_AI_ROUTER_API_KEY
BDA_WORK_EVENT_API_KEY
BDA_AI_PROVIDER
BDA_AI_MODEL
BDA_USED_BDA_GATEWAY
```

## Basic Flow

Start a real BDA work session:

```bash
bda start --project "BDA-InnoHub" --task "debug login error" --command bda-dev --work-type debug
```

Send an event during the session:

```bash
bda event --command bda-dev --work-type review --task "review login fix" --status done
```

Stop the session:

```bash
bda stop --status done --outcome "login validation fixed" --next-step "deploy staging"
```

`bda stop` must close the current active session. Do not create a new `session_id` at stop time. The project/task/session identity comes from the previous `bda start`; only the final status, outcome, blocker, and next step should change.

The CLI keeps one active local session in `.bda-skills/current-session.json`. A new `bda start` must not overwrite that file while a session is still active; run `bda stop` first. If a stale local session was already closed through the Coverage/admin dashboard, use `bda start --force` only after the dashboard close is tagged as a manual close, because the local CLI can no longer prove the old stop event by itself.

Show help and command catalog:

```bash
bda help
```

Show current session:

```bash
bda current
```

Update BDA AI Dev Standard without reinstalling the full employee pack:

```bash
bda update
```

`bda update` refreshes the local standard repo from `main` using git and overwrites local edits in `~/.bda-ai-dev-standard`. This is intentional for employee machines; the standard is centrally managed. Restart Hermes Desktop after the update if it is open.

Important: `bda update` in v0.10.15 updates command/session behavior, cleans Hermes BDA provider/model config, and keeps the supported local models by their real names plus paid cloud models: `bda/qwable-27b-local`, `bda/qwythos-9b-local`, DeepSeek, Qwen3.7, GLM 5.1, and MiniMax M3. Restart Hermes Desktop after the update so the model picker reloads without the legacy BDA group. If Hermes still shows two BDA groups, close Hermes, run `bda config-clean`, and open Hermes again.

## Model Change Runbook

When production model names change, do not keep old aliases in any active layer. A partial cleanup can make employees see the new model in Hermes but still get `HTTP 401 key not allowed to access model`.

Required checklist:

1. Update LiteLLM runtime config on A40: `/home/maripae/bda-ai-router/litellm_config.yaml`.
2. Update model permissions in LiteLLM DB:
   - `"LiteLLM_TeamTable".models`
   - `"LiteLLM_VerificationToken".models`
   - If `bda/dev` is internally rewritten to hidden node aliases, run the idempotent sync in `scripts/litellm-sync-dev-node-alias-permissions.sql` and verify both missing counts are `0`. See `docs/litellm-dev-node-alias-permissions.md`.
   - If internal BDA non-dev/PM users can be routed to `bda/dev` or paid fallback, run `scripts/litellm-sync-staff-model-permissions.sql`. Old DeepSeek-only non-dev keys will otherwise fail with `HTTP 401 key_model_access_denied` when gateway routes to Qwen paid or A40 aliases.
3. Update metadata-gate model catalog:
   - `BDA_PUBLIC_MODEL_IDS` in `docker-compose.yml`
   - default `PUBLIC_MODEL_IDS` in `metadata_gateway/app.py`
   - any routing/context constants that still point to old names
4. Update this standard package:
   - `scripts/aks.mjs` (`scripts/bda.mjs` remains a permanent shim alias)
   - tests that assert Hermes model lists
   - docs that name supported production models
5. Restart/recreate services:
   - `docker compose restart litellm`
   - `docker compose up -d --build --force-recreate metadata-gate`
6. Verify both model endpoints show the same clean list:
   - `http://127.0.0.1:18080/v1/models`
   - `http://127.0.0.1:14000/v1/models`
7. Smoke test each new local model with a real chat completion. Treat 401 as permission drift and 500 as worker/runtime failure.
8. Have employees run `bda update`, fully restart Hermes Desktop, and use `bda config-clean` if old model names remain in the picker.

Rule of thumb: deleting a model means deleting it from runtime config, DB permissions, public catalog, client config templates, and client caches in the same rollout.

Extra rule for node-aware A40 routing: `bda/dev` can stay as the only employee-facing model, but the internal aliases selected by metadata-gate must be allowed in every LiteLLM permission layer. LiteLLM checks the rewritten model name. A setup where keys allow `bda/dev-a40-1-local` but teams do not will still fail with `HTTP 401 team_model_access_denied`.

Extra rule for internal staff access: behavior guidance and access policy are separate. We can tell non-dev/PM to avoid local A40 unless needed, but their keys must still include every model the gateway may choose on their behalf. Otherwise a valid staff request can fail after routing, even though the employee selected an allowed model in Hermes.

## How AI Should React to `bda start`

When a staff member types `bda start` inside an AI chat, the AI must not continue blindly. The AI should draft the metadata and ask the staff member to confirm or edit:

```text
ผมจะเริ่ม BDA work session ให้ครับ ช่วยตรวจ metadata นี้ก่อน:

project: <project name>
task_summary: <short useful task>
command: <bda command>
work_type: <debug/review/documentation/pm-status/...>
employee_code: <from config/user>
employee_group: <dev/nondev/pm_lead/...>
ai_provider: <bda-gateway/openai/claude/gemini/...>
ai_model: <model if known>
used_bda_gateway: true/false

ถ้าถูกต้อง ให้ตอบ "เริ่ม" หรือแก้ field ที่ผิด
```

If the AI can infer a field safely from the user request or project context, fill it in and ask for confirmation. If a field affects reporting quality and cannot be inferred, ask only for that field.

For local/Hermes models with small context windows, use the shortest possible metadata confirmation. Do not paste the full standard. A good short version is:

```text
Project:
Task:
Command:
Work type:
Employee:
Model:

ถ้าถูกต้องตอบ "เริ่ม"; ถ้าผิดแก้เฉพาะ field นั้น
```

## Command Syntax in Chat

Use a command prefix followed by the staff prompt:

```text
bda-dev: debug login error after password reset
bda-nondev: สรุป requirement จาก meeting note วันนี้
bda-pm: สรุปสถานะ project สำหรับ lead
```

During an active `bda start` session, each command should produce or trigger a `bda event` with command, `work_type`, task summary, status, outcome, blocker/next step when relevant, and token/duration values when available.

When the staff member types `bda stop`, the AI must summarize the current session and close that same session:

```text
Status: done/blocked/failed
Outcome:
Blocker:
Next step:
```

The AI must not invent a new project, task, employee, or session id during stop. If it is unsure which session is active, ask the staff member to confirm instead of sending a mismatched stop event.

Important for Hermes/tool agents: after the staff member confirms `bda start`, the AI must execute the real CLI command through the available terminal/tool. It is not enough to print metadata or say the session is open. Coverage only trusts work events sent by `bda.mjs`/the work-event endpoint.

Good behavior:

```text
Ran: node ~/.bda-ai-dev-standard/scripts/aks.mjs start --project ... --task ... --command bda-dev --work-type debug
```

Bad behavior:

```text
เปิด BDA session แล้วครับ
{ "session_id": "...", "status": "active" }
```

For non-session commands, run or answer them as utilities, not as work sessions:

- `bda help` should show the command help.
- `bda version` should run the version command.
- `bda update` should run the update command.
- None of these should create a new BDA work session.

## Context and Vision Limits

Local coding models can hit context limits quickly. Use these rules:

- Do not paste long standards, large files, build logs, or full repo trees into local models.
- Ask the model to read or discuss only the file/function/error slice needed for the current step.
- If context is near full, summarize the session in 5-8 bullets and start a new session or switch to a larger-context model.
- For screenshots, circled UI points, or image documents, use Gemini/NotebookLM/a vision model to extract the visual facts first, then continue the work in Hermes with that summary.
- Qwen3 Coder Local is primarily for text/code. Do not force it to guess visual details.

## Command Catalog

```text
bda-dev       dev      งาน dev/code/debug/review/test แบบ targeted
bda-nondev    nondev   งานเอกสาร/สรุป/วิเคราะห์/operation
bda-pm        pm       งาน PM/status/risk/requirement เฉพาะ PM/lead
```

Use `work_type` for detail, for example `debug`, `review`, `test`, `implementation`, `document`, `pm-status`, `risk`, or `requirement`. Legacy names such as `bda-dev-debug` and `bda-pm-status` are still accepted by the CLI for migration, but they should not be shown in Hermes employee help.

`bda/dev` is the main AI Gateway model and can be used by staff from every employee group when they need BDA Gateway support. `bda-nondev` is metadata for document, summary, analysis, and operation work; it is not a model access lock.

## Fallback for Non-BDA Gateway AI

If the staff member uses another AI provider, the CLI still sends work events to BDA:

```bash
bda start --project "Project" --task "write customer summary" --command bda-nondev --work-type documentation --ai-provider claude --ai-model "subscription" --used-bda-gateway false
bda stop --status done --outcome "summary drafted and reviewed"
```

If the endpoint is unreachable, `bda` writes an outbox file under `.bda-skills/outbox/` so the event is not lost.
