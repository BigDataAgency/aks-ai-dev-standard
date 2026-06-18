# AI Work Event Logging

This document defines how BDA AI Dev Standard records useful AI-assisted work without asking staff to write manual daily logs.

Security note: this public standard repo must not contain production API keys, private endpoints, customer data, or employee secrets. Real endpoint values must come from private config or environment variables.

## Purpose

Work events let BDA generate:

- dev/nondev daily work logs
- PM lead project logs
- usage audit by personal API key
- useful AI usage reports

The signal is not raw token volume. The signal is command, project, task, owner, status, blocker, next step, and useful AI usage.

## Required Config

Each employee should have a private config outside the repo:

```json
{
  "name": "Employee Name",
  "employee_code": "BDA_EMPLOYEE_CODE",
  "employee_group": "dev",
  "work_log_url": "https://example.com/bda/work-events",
  "api_key": "sk-private-user-key",
  "gsd_profile": "budget"
}
```

Supported locations:

- `~/.bda-skills/config.json`
- project-local `.bda-skills/config.json`
- environment variables

Environment variables:

```text
BDA_EMPLOYEE_CODE
BDA_EMPLOYEE_GROUP
BDA_WORK_LOG_URL
BDA_AI_WORK_EVENT_URL
BDA_AI_ROUTER_API_KEY
BDA_AI_ROUTER_BASE_URL
```

## Required Event Fields

```json
{
  "employee_code": "BDA_EMPLOYEE_CODE",
  "employee_group": "dev",
  "project": "Project Name",
  "tool": "bda-ai-dev",
  "command": "/fix-bug",
  "task_summary": "fix login validation bug",
  "session_id": "YYYY-MM-DD-EMPLOYEE_CODE-project-fix-bug",
  "work_type": "debug",
  "status": "done"
}
```

## Optional PM Fields

Use these when the work affects PM/project tracking:

```json
{
  "pm_status": "in-progress",
  "priority": "high",
  "due_date": "YYYY-MM-DD",
  "blocker": "waiting for stakeholder approval",
  "outcome": "UAT checklist drafted",
  "next_step": "send to stakeholder"
}
```

## Command Behavior

For real BDA work, commands should send:

1. `status=started` at the beginning
2. `status=done`, `blocked`, or `failed` at the end

If sending the work event fails, continue the main work but report that automatic daily logging did not complete.
If `BDA_WORK_LOG_URL` is not configured, the helper prints a dry-run event instead of sending data to the network.

## Session Behavior

The recommended user workflow is:

```bash
bda start --project "Project Name" --task "short useful task" --command bda-dev-debug
bda help
bda event --command bda-dev-review --task "review result" --status done
bda stop --status done --outcome "what changed" --next-step "what happens next"
```

When used inside AI chat, `bda start` means the AI should draft metadata and ask for confirmation before starting the real task. This replaces a popup UI and keeps the flow usable in Hermes, Claude, Codex, Windsurf, Cursor, Gemini, and other chat tools.

Use the compact confirmation format for Hermes/local models:

```text
Project:
Task:
Command:
Work type:
Employee:
Model:

ถ้าถูกต้องตอบ "เริ่ม"; ถ้าผิดแก้เฉพาะ field นั้น
```

During an active session, staff can write commands as:

```text
bda-dev-debug: debug login error
bda-nondev-explore: summarize meeting notes
bda-pm-status: summarize project status for lead
```

The AI or local helper must turn each useful command into a work event. If the staff member uses a non-BDA AI provider, `used_bda_gateway=false` is valid, but the event should still be sent through the BDA work-event endpoint or queued locally.

Stop behavior:

- `bda stop` closes the active session created by `bda start`.
- Keep the same `session_id`, employee, project, task, provider, and model unless the staff explicitly corrects a wrong field.
- Stop may add final `status`, `outcome`, `blocker`, `next_step`, and `duration_ms`.
- If the AI cannot identify the active session, ask for confirmation instead of sending a new mismatched stop event.

Context and model routing:

- Local Qwen3 Coder style models are for text/code and should receive small, targeted context.
- For long code tasks, split work into smaller steps or use a larger-context model.
- For screenshot/vision/doc-image tasks, first use Gemini, NotebookLM, or a vision-capable model to extract the visual facts; then continue in Hermes using the extracted summary.
- If context limit appears, stop adding content, summarize what is known, and continue in a new session or larger-context model.

## Tool Support

Run the helper directly:

```bash
node scripts/bda-work-event.mjs \
  --employee-code EMPLOYEE_CODE \
  --employee-group dev \
  --command "/fix-bug" \
  --work-type debug \
  --status done \
  --project "Project Name" \
  --task "fix login validation bug" \
  --dry-run
```

Or install/copy it as `bda-work-event` in the employee PATH.

Run the session CLI:

```bash
npm run bda -- help
npm run bda -- start --project "Project Name" --task "fix login validation bug" --command bda-dev-debug --dry-run
```

## Groups

```text
owner
advisor
dev
pm_lead
pm
nondev
```

Use one API key per person. Do not create a second key just because a person has a PM role; set the role/group metadata correctly.
