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
  "tool": "hermes-desktop-agent",
  "ai_provider": "bda-gateway",
  "ai_model": "bda/deepseek-paid-cloud",
  "used_bda_gateway": true
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
BDA_SESSION_KEY
CODEX_THREAD_ID
CODEX_SESSION_ID
```

## Basic Flow

Check active sessions first:

```bash
bda current --all
```

Start a real BDA work session:

```bash
bda start --project "BDA-InnoHub" --task "debug login error" --command bda-dev-debug --tool hermes-desktop-agent --ai-provider bda-gateway --ai-model bda/deepseek-paid-cloud --used-bda-gateway true
```

Send an event during the session:

```bash
bda event --session-id "<session_id from bda start>" --command bda-dev-review --task "review login fix" --status done
```

Stop the session:

```bash
bda stop --session-id "<session_id from bda start>" --status done --outcome "login validation fixed" --next-step "deploy staging"
```

`bda stop` must close the current active session. Do not create a new `session_id` at stop time. The project/task/session identity comes from the previous `bda start`; only the final status, outcome, blocker, and next step should change.

Show help and command catalog:

```bash
bda help
```

Show current session:

```bash
bda current --all
```

Show one exact session:

```bash
bda current --session-id "<session_id>"
```

## Project Map Auto-Detection

The CLI can infer the project from the current working directory using the user-level map:

```text
~/.bda-skills/project-map.json
```

This file is personal/user-level config. It should map local folders to BDA project names, for example `PWA-DMAMA3`, `Sriphat-Care-U`, `KTB-UAPP`, or `CMU-Drinking-Water`. If the user provides `--project`, the explicit value wins. If no mapping matches, the AI should ask for the project before starting a session.

## Concurrent AI Sessions

Multiple Codex Desktop, Hermes, IDE, or terminal sessions may run at the same time, even on the same project. To prevent one AI from closing another AI's work log:

- Always run `bda current --all` before starting or stopping.
- Keep the `session_id` returned by `bda start` in the AI thread context.
- During the session, use `bda event --session-id "<session_id>"`.
- At the end, use `bda stop --session-id "<session_id>"`.
- Use bare `bda stop` only for simple single-session terminal use where there is no ambiguity.

For Codex Desktop, a stable session key can also come from `BDA_SESSION_KEY`, `CODEX_THREAD_ID`, or `CODEX_SESSION_ID` when available.

## Runtime Metadata and Token Usage

Runtime metadata must describe the AI tool that actually did the work, not the transport used to send the log. For example, Codex Desktop should use:

```bash
--tool codex-desktop-agent --ai-provider openai --ai-model codex/gpt-5 --used-bda-gateway false
```

Hermes/BDA Gateway work should use Hermes/BDA Gateway values. Do not record `used_bda_gateway=true` unless the actual AI work was routed through BDA Gateway.

For Codex Desktop bounded Gateway checkpoints, prefer `bda/deepseek-paid-cloud`. Fall back to `bda/auto-default-local` or another configured BDA model only when the preferred paid-cloud route is unavailable or unsuitable, and always log the actual model used.

If exact token usage is available from the provider or gateway, send exact numbers. If exact usage is unavailable, estimated values are acceptable only when clearly marked:

```bash
--prompt-tokens <estimated_prompt_tokens> --completion-tokens <estimated_completion_tokens> --total-tokens <sum> --token-estimate true --token-estimate-method codex-rough-v1
```

Use `total_tokens = prompt_tokens + completion_tokens`. Estimates should be rough, rounded, and based only on visible task context and output, not hidden/internal reasoning.

## Gateway-First BDA Gateway Usage

For mapped BDA work, the standard is gateway-first-by-default, not Gateway-always. After a real `bda start`, the AI should attempt at least one useful bounded BDA Gateway subtask for every non-trivial mapped session before closeout. The AI must decide and record one Gateway status:

- `gateway_used`: a real Hermes/BDA Gateway model call succeeded, its output was used, and a separate event was sent with `tool=hermes-cli`, `ai_provider=bda-gateway`, and `used_bda_gateway=true`.
- `gateway_deferred`: Codex or another primary tool must first gather deterministic repo/tool evidence, but a useful Gateway checkpoint is planned before closeout.
- `gateway_skipped`: Gateway would be artificial, would expose unnecessary sensitive data, was explicitly declined, the work is unmapped/non-BDA, Gateway is unavailable, or the work is trivial/deterministic.
- `gateway_failed`: Gateway returned no usable final response or was unavailable; continue with the main AI only when safe and record the fallback/limitation.

Use Gateway for bounded subtasks where usage should be visible or a second lane improves quality:

- commit/push evidence, release, deploy, production verification, or customer acceptance
- PM/status/risk/report/daily log wording
- requirement summary, acceptance criteria, or stakeholder-facing summary
- security, auth/RBAC, data/privacy, schema, migration, CI/CD, or high-risk architecture review
- test-plan draft, evidence audit, or second-opinion checklist

Per-file subagent/sub-session delegation is optional and case-by-case. It can reduce Codex Desktop context tokens only when each file is independent, the prompt is tightly bounded, no secrets or sensitive data are sent, and the expected Codex context saved is greater than the setup plus verification overhead. Do not delegate mechanical batch edits, shared-interface/schema/security decisions, conflict-prone branch work, or tasks that require fresh deterministic tool evidence in the primary Codex session.

Do not mark `used_bda_gateway=true` for ordinary Codex/Claude/Gemini work. The BDA CLI sends work-event logs, but Gateway usage is counted only when the actual AI subtask was routed through BDA Gateway.

Gateway-first does not mean sending an empty prompt or duplicating every event. It means each non-trivial mapped session should contain at least one useful Gateway checkpoint whose output is actually used. Trivial deterministic checks include `bda current`, `bda help`, exact `git status`, simple command output, targeted `rg`/`curl` observations, and syntax-only questions where model reasoning adds no value.

Target ranges for CEO usage visibility:

| Work class | Gateway target |
| --- | --- |
| PM/status/risk/report/daily log, requirement summary, customer/stakeholder summary | 80-100% |
| Commit/push evidence, release, deploy, production verification, acceptance, delivery handoff | 80-100% |
| Auth/RBAC, security, schema/migration, CI/CD, high-risk architecture, data/privacy | 70-100% |
| Multi-module work, ambiguous scope, cross-repo investigation, second-opinion-heavy work | 50-80% |
| Normal bug/feature work | 30-60% |
| Deterministic checks such as git status, rg, curl, short log inspection, simple build observation | 0-20% |
| Casual chat, setup questions, secrets-sensitive prompts, explicit Codex-only work | 0% |

These ranges are guidance, not a rigid KPI. For non-trivial mapped sessions, prefer at least one useful Gateway checkpoint unless unsafe, unavailable/failed, explicitly declined, unmapped/non-BDA, or fully deterministic. Gateway output must be verified against real repo/tool evidence before use.

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
bda-dev-debug: debug login error after password reset
bda-nondev-explore: สรุป requirement จาก meeting note วันนี้
bda-pm-status: สรุปสถานะ project สำหรับ lead
```

During an active `bda start` session, each command should produce or trigger a `bda event` with command, task summary, status, outcome, blocker/next step when relevant, and token/duration values when available.
If multiple sessions are active, the event must include the exact `--session-id` from this chat/thread.

When the staff member types `bda stop`, the AI must summarize the current session and close that same session:

```text
Status: done/blocked/failed
Outcome:
Blocker:
Next step:
```

The AI must not invent a new project, task, employee, or session id during stop. If it is unsure which session is active, ask the staff member to confirm instead of sending a mismatched stop event.

## Context and Vision Limits

Local coding models can hit context limits quickly. Use these rules:

- Do not paste long standards, large files, build logs, or full repo trees into local models.
- Ask the model to read or discuss only the file/function/error slice needed for the current step.
- If context is near full, summarize the session in 5-8 bullets and start a new session or switch to a larger-context model.
- For screenshots, circled UI points, or image documents, use Gemini/NotebookLM/a vision model to extract the visual facts first, then continue the work in Hermes with that summary.
- Qwen3 Coder Local is primarily for text/code. Do not force it to guess visual details.

## Command Catalog

```text
bda-dev-debug          debug            แก้บั๊ก / ไล่ error / หาสาเหตุ
bda-dev-review         review           review code / PR / design risk
bda-dev-tdd            test             เขียน test ก่อนแก้หรือเพิ่ม feature
bda-dev-plan-discuss   plan             คุย scope และทางเลือกก่อนทำ
bda-dev-plan-create    plan             สร้างแผนงาน
bda-dev-plan-execute   implementation   ทำงานตามแผน
bda-dev-plan-review    review           ตรวจแผน/ผลลัพธ์
bda-dev-plan-verify    verification     ตรวจผล/หลักฐาน
bda-nondev-explore     explore          ค้น/สรุป/วิเคราะห์งาน non-dev
bda-nondev-write       documentation    เขียนเอกสาร/ข้อความ/สรุป
bda-pm-log             pm-log           สร้าง PM daily/project log
bda-pm-status          pm-status        สรุป project status
bda-pm-risk            pm-risk          สรุป risk/blocker
bda-pm-followup        pm-followup      ติดตาม next step
bda-pm-requirement     pm-requirement   สรุป requirement
bda-pm-standup         pm-standup       standup/team update
```

## Fallback for Non-BDA Gateway AI

If the staff member uses another AI provider, the CLI still sends work events to BDA:

```bash
bda start --project "Project" --task "write customer summary" --command bda-nondev-write --tool codex-desktop-agent --ai-provider openai --ai-model codex/gpt-5 --used-bda-gateway false
bda stop --session-id "<session_id>" --status done --outcome "summary drafted and reviewed"
```

If the endpoint is unreachable, `bda` writes an outbox file under `.bda-skills/outbox/` so the event is not lost.
