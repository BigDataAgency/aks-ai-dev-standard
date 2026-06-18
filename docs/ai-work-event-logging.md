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
  "gsd_profile": "budget",
  "tool": "hermes-desktop-agent",
  "ai_provider": "bda-gateway",
  "ai_model": "bda/deepseek-paid-cloud",
  "used_bda_gateway": true
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
BDA_AI_PROVIDER
BDA_AI_MODEL
BDA_USED_BDA_GATEWAY
BDA_SESSION_KEY
CODEX_THREAD_ID
CODEX_SESSION_ID
```

Project names may also be inferred from the user-level project map:

```text
~/.bda-skills/project-map.json
```

This map is personal config and should not be committed to the public standard repo.

## Required Event Fields

```json
{
  "employee_code": "BDA_EMPLOYEE_CODE",
  "employee_group": "dev",
  "project": "Project Name",
  "tool": "codex-desktop-agent",
  "ai_provider": "openai",
  "ai_model": "codex/gpt-5",
  "used_bda_gateway": false,
  "command": "/fix-bug",
  "task_summary": "fix login validation bug",
  "session_id": "YYYY-MM-DD-EMPLOYEE_CODE-project-fix-bug",
  "work_type": "debug",
  "status": "done"
}
```

`tool`, `ai_provider`, `ai_model`, and `used_bda_gateway` must describe the actual AI runtime. For example, Codex Desktop work should use `codex-desktop-agent`, `openai`, `codex/gpt-5`, and `false`. Hermes/BDA Gateway work should use Hermes/BDA Gateway values.

## AI Usage Fields

When exact token usage is known, send exact values:

```json
{
  "prompt_tokens": 1200,
  "completion_tokens": 300,
  "total_tokens": 1500
}
```

When exact usage is unavailable, estimates are acceptable if marked:

```json
{
  "prompt_tokens": 1200,
  "completion_tokens": 300,
  "total_tokens": 1500,
  "token_estimate": true,
  "token_estimate_method": "codex-rough-v1"
}
```

Use `total_tokens = prompt_tokens + completion_tokens`. If even a rough estimate is not defensible, leave token fields as `0` rather than inventing precision.

## Gateway-First Usage Policy

Mapped BDA work should be gateway-first-by-default, not Gateway-always: after a real `bda start`, the AI should attempt at least one useful bounded BDA Gateway subtask for every non-trivial mapped session before closeout. The AI must record the result. This improves usage reporting without creating fake Gateway calls.

Use Gateway when usage should be visible in the audit trail or a second lane materially improves the work:

- commit/push evidence, release, deploy, production verification, or customer acceptance
- PM/status/risk/report/daily log wording
- requirement interpretation, acceptance criteria, or stakeholder-facing summaries
- security, auth/RBAC, data/privacy, schema, migration, CI/CD, or high-risk architecture review
- test-plan draft, evidence audit, document wording, or second-opinion checklist

For Codex Desktop bounded Gateway checkpoints, prefer `bda/deepseek-paid-cloud`. If it is unavailable or unsuitable, fall back to `bda/auto-default-local` or another configured BDA model and log the actual model used.

Per-file subagent/sub-session delegation is a case-by-case token strategy, not a default. Use it only when each file can be reviewed or drafted independently, the prompt is bounded, no secrets or sensitive data are needed, and Codex can verify the result with smaller diff/evidence context than doing the whole task itself. Avoid delegation for mechanical batch edits, shared contracts, schema/security decisions, conflict-prone branch work, or tasks that need fresh deterministic tool evidence.

Defer Gateway when Codex or another primary tool must first gather deterministic repo/tool evidence, but a useful checkpoint should still happen before closeout. Skip Gateway when the work is trivial/deterministic, unmapped/non-BDA, explicitly Codex-only, unsafe to share, Gateway is unavailable, or a call would be artificial. If skipped or failed, keep `used_bda_gateway=false` and put the reason in `outcome`, `blocker`, or the final stop summary.

Successful Gateway work must be logged as its own event with truthful runtime metadata:

```json
{
  "tool": "hermes-cli",
  "ai_provider": "bda-gateway",
  "ai_model": "bda/deepseek-paid-cloud",
  "used_bda_gateway": true
}
```

Gateway-first does not mean every event uses Gateway, and it does not permit empty prompts or duplicate calls just to create usage. A successful Gateway event requires a real Gateway model response whose output was used in the work. Trivial deterministic checks include `bda current`, `bda help`, exact `git status`, simple command output, targeted `rg`/`curl` observations, and syntax-only questions where model reasoning adds no value.

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
bda current --all
bda start --project "Project Name" --task "short useful task" --command bda-dev-debug
bda help
bda event --session-id "<session_id>" --command bda-dev-review --task "review result" --status done
bda stop --session-id "<session_id>" --status done --outcome "what changed" --next-step "what happens next"
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

Concurrent session behavior:

- Run `bda current --all` before start/stop.
- Keep the `session_id` returned by `bda start` in the AI thread context.
- Use `--session-id` for every `bda event` and `bda stop` when there is any chance of multiple sessions.
- Same-project concurrent sessions are allowed as long as each event targets the correct `session_id`.

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
npm run bda -- current --all
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
