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
bda start --project "BDA-InnoHub" --task "debug login error" --command bda-dev-debug
```

Send an event during the session:

```bash
bda event --command bda-dev-review --task "review login fix" --status done
```

Stop the session:

```bash
bda stop --status done --outcome "login validation fixed" --next-step "deploy staging"
```

`bda stop` must close the current active session. Do not create a new `session_id` at stop time. The project/task/session identity comes from the previous `bda start`; only the final status, outcome, blocker, and next step should change.

Show help and command catalog:

```bash
bda help
```

Show current session:

```bash
bda current
```

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
bda start --project "Project" --task "write customer summary" --command bda-nondev-write --ai-provider claude --ai-model "subscription" --used-bda-gateway false
bda stop --status done --outcome "summary drafted and reviewed"
```

If the endpoint is unreachable, `bda` writes an outbox file under `.bda-skills/outbox/` so the event is not lost.
