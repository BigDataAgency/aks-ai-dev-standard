# Tool Setup: Hermes, Windsurf, IDE

This public document describes the generic setup. Real BDA endpoint and user keys must be provided through private rollout docs or local config.

## What Staff Need

Each staff member needs:

- personal API key
- `employee_code`
- `employee_group`
- router base URL
- work event URL

Do not share API keys between employees.

## Endpoint Variables

```text
BDA_AI_ROUTER_BASE_URL=https://example.com/v1
BDA_WORK_LOG_URL=https://example.com/bda/work-events
```

## Model Names

Use these model IDs unless private rollout docs say otherwise:

```text
bda/fast   # fast Q&A, no URL prefetch
bda/med    # reads public URLs through gateway prefetch
bda/coder  # coding/review/debug/planning, use carefully because prompts can be heavier
bda/glm    # GLM-5.1 cloud trial, reads URLs through gateway prefetch, 10 concurrent limit
```

Hermes Desktop Agent should use the personal installer package. The installer sets a BDA local compatibility profile that disables heavy Hermes local tool schemas for `cli` and `desktop`, so the A40 Qwen3 Coder route fits the current context window.

## Do I Need an Extension?

| Tool | Extension needed? | Recommended setup |
| --- | --- | --- |
| Hermes Desktop Agent | No | Use the private per-employee `install_hermes_bda_config.sh`; current Hermes Desktop Accounts UI does not expose BDA custom gateway fields |
| Windsurf | Maybe | Use native OpenAI-compatible provider if available; otherwise install Roo Code or Continue extension |
| Cursor | No | Use Cursor Models settings with OpenAI key and Override OpenAI Base URL |
| VS Code | Yes | Install Continue, Roo Code, or Cline |
| JetBrains IDE | Yes | Use Continue, Continue JetBrains plugin, or another OpenAI-compatible plugin |
| Claude Code Developer Mode | No, if the installed Claude Code build supports gateway/base-url configuration | Use BDA commands and point Claude Code to the BDA gateway with the employee personal key |

## Non-dev

Use Hermes Desktop Agent as the primary tool.

Hermes Desktop currently needs config-file setup for BDA. Do not put `${BDA_AI_ROUTER_BASE_URL}` in the Hermes `Gateway` tab; that tab is for a Hermes backend, not the OpenAI-compatible LiteLLM gateway.

Use the private per-employee installer:

```bash
chmod +x install_hermes_bda_config.sh
./install_hermes_bda_config.sh
```

Real BDA work should use standard commands such as:

```text
/nondev-explore
/write-document
/update-obsidian
```

If Hermes cannot send custom headers, put metadata on the first line of the first prompt:

```text
BDA_META: {"project":"Project Name","tool":"hermes-desktop-agent","task_summary":"short task","session_id":"YYYY-MM-DD-EMPLOYEE-PROJECT-001","client":"hermes"}
<actual work prompt>
```

## Dev

Use Hermes for discussion/analysis and IDE tools such as Windsurf, Cursor, Continue, or any OpenAI-compatible client for coding.

Generic IDE settings:

```text
Provider: OpenAI Compatible
Base URL: ${BDA_AI_ROUTER_BASE_URL}
API Key: personal employee key
Model:
  bda/fast
  bda/med
  bda/coder
```

Real BDA work should use commands such as:

```text
/understand-task
/plan-work
/build-feature
/fix-bug
/review-change
/verify-work
/handoff-report
```

If the IDE cannot send custom headers, put metadata on the first line:

```text
BDA_META: {"project":"Project Name","tool":"windsurf","task_summary":"fix login bug","session_id":"YYYY-MM-DD-EMPLOYEE-PROJECT-001","client":"windsurf"}
/fix-bug ...
```

## Hermes Desktop Agent

Use this for nondev, PM lead, and dev discussion/planning.

Hermes Desktop setup:

```bash
chmod +x install_hermes_bda_config.sh
./install_hermes_bda_config.sh
```

Then quit Hermes Desktop completely and open it again. The installer writes `~/.hermes/config.yaml` and `~/.hermes/.env`.

Recommended first message for real BDA work:

```text
BDA_META: {"project":"Project Name","tool":"hermes-desktop-agent","task_summary":"short task","session_id":"YYYY-MM-DD-EMPLOYEE-PROJECT-001","client":"hermes"}
/write-document ...
```

For casual chat or first-time setup tests, metadata is optional.

## Windsurf

Windsurf setup depends on the installed version and organization policy.

### Option A: Native OpenAI-Compatible Provider

Use this if Windsurf settings show an OpenAI-compatible/custom provider.

Steps:

1. Open Windsurf Settings.
2. Go to AI / Models / Provider settings.
3. Select `OpenAI Compatible` or custom OpenAI provider.
4. Set Base URL to `${BDA_AI_ROUTER_BASE_URL}`.
5. Set API key to the employee personal API key.
6. Add model IDs:
   - `bda/fast`
   - `bda/med`
   - `bda/coder`
   - `bda/glm`
7. Use `bda/coder` for coding, review, bug fixing, and planning. Use `bda/glm` only when testing GLM-5.1 cloud behavior or when the local route is not enough.

### Option B: Windsurf With Roo Code Or Continue

Use this if Windsurf does not expose a custom OpenAI-compatible provider.

Steps:

1. Open Windsurf extensions.
2. Install `Roo Code` or `Continue`.
3. Configure the extension as OpenAI-compatible.
4. Use Base URL `${BDA_AI_ROUTER_BASE_URL}`.
5. Use the employee personal API key.
6. Add model IDs `bda/fast`, `bda/med`, and `bda/coder`.

Metadata first line for real BDA work:

```text
BDA_META: {"project":"Project Name","tool":"windsurf","task_summary":"fix login bug","session_id":"YYYY-MM-DD-EMPLOYEE-PROJECT-001","client":"windsurf"}
/fix-bug ...
```

## Cursor

Cursor usually does not need an extension for OpenAI-compatible gateways.

Steps:

1. Open Cursor Settings.
2. Open Models.
3. Add or set OpenAI API key to the employee personal API key.
4. Enable Override OpenAI Base URL.
5. Set Base URL to `${BDA_AI_ROUTER_BASE_URL}`.
6. Add custom model names if Cursor asks:
   - `bda/fast`
   - `bda/med`
   - `bda/coder`
7. Save and test with a small prompt.

If Cursor sends a request to an endpoint not supported by the router, switch that workflow to Continue/Roo Code or ask the platform owner to add compatibility.

Metadata first line:

```text
BDA_META: {"project":"Project Name","tool":"cursor","task_summary":"review payment code","session_id":"YYYY-MM-DD-EMPLOYEE-PROJECT-001","client":"cursor"}
/review-change ...
```

## VS Code With Continue

Use this when staff use normal VS Code.

Install:

1. Open VS Code Extensions.
2. Install `Continue`.
3. Open Continue config.
4. Add OpenAI-compatible models.

Example `config.yaml`:

```yaml
name: BDA AI
version: 0.0.1
schema: v1
models:
  - name: BDA Auto
    provider: openai
    model: bda/auto
    apiBase: ${{ env.BDA_AI_ROUTER_BASE_URL }}
    apiKey: ${{ env.BDA_AI_ROUTER_API_KEY }}
    roles:
      - chat
      - edit
      - apply
  - name: BDA Code Fast
    provider: openai
    model: bda/qwen3-coder
    apiBase: ${{ env.BDA_AI_ROUTER_BASE_URL }}
    apiKey: ${{ env.BDA_AI_ROUTER_API_KEY }}
    roles:
      - autocomplete
      - edit
  - name: BDA Code Good
    provider: openai
    model: bda/qwen3-coder
    apiBase: ${{ env.BDA_AI_ROUTER_BASE_URL }}
    apiKey: ${{ env.BDA_AI_ROUTER_API_KEY }}
    roles:
      - chat
      - edit
      - apply
```

Set env vars before opening VS Code:

```bash
export BDA_AI_ROUTER_BASE_URL="https://example.com/v1"
export BDA_AI_ROUTER_API_KEY="personal employee key"
```

## VS Code With Roo Code Or Cline

Use this if the team prefers agent-style coding inside VS Code.

Steps:

1. Install `Roo Code` or `Cline`.
2. Choose OpenAI-compatible provider.
3. Base URL: `${BDA_AI_ROUTER_BASE_URL}`.
4. API key: personal employee key.
5. Model: `bda/auto` or `bda/qwen3-coder`.
6. Put BDA command and metadata in the first prompt for real work.

Example prompt:

```text
BDA_META: {"project":"Project Name","tool":"roo-code","task_summary":"implement dashboard filter","session_id":"YYYY-MM-DD-EMPLOYEE-PROJECT-001","client":"vscode"}
/build-feature ...
```

## Claude Code Developer Mode

Use this when the installed Claude Code build supports developer/local gateway settings.

Install BDA slash commands in each target repo:

```bash
mkdir -p .claude/commands
cp /path/to/bda-ai-dev-standard/claude/CLAUDE.md ./CLAUDE.md
cp /path/to/bda-ai-dev-standard/claude/commands/*.md ./.claude/commands/
```

Configure the gateway using the mechanism supported by the installed Claude Code build or organization wrapper. The private rollout docs should provide the real variable names if they differ.

Generic gateway settings:

```text
Gateway/Base URL: ${BDA_AI_ROUTER_BASE_URL}
API Key/Auth Token: personal employee key
Model: bda/fast or bda/qwen3-coder
```

Common environment template:

```bash
export BDA_AI_ROUTER_BASE_URL="https://example.com/v1"
export BDA_AI_ROUTER_API_KEY="personal employee key"
export BDA_EMPLOYEE_CODE="EMPLOYEE_CODE"
export BDA_EMPLOYEE_GROUP="dev"
export BDA_WORK_LOG_URL="https://example.com/bda/work-events"
```

Real BDA work should start with metadata when the client cannot attach request metadata:

```text
BDA_META: {"project":"Project Name","tool":"claude-code","task_summary":"fix login bug","session_id":"YYYY-MM-DD-EMPLOYEE-PROJECT-001","client":"claude-code"}
/fix-bug ...
```

Recommended commands:

```text
/init
/plan-work
/fix-bug
/review-change
/build-feature
/write-document
/verify-work
/handoff-report
/pm-log
/pm-status
```

If Claude Code is routed through the BDA gateway, its usage should be counted by the employee key like other gateway clients. If it is not routed through the gateway, still send work events through `scripts/bda-work-event.mjs`.

## Local Config File

Each employee may keep private config outside the repo:

```json
{
  "employee_code": "EMPLOYEE_CODE",
  "employee_group": "dev",
  "work_log_url": "https://example.com/bda/work-events",
  "api_key": "personal employee key",
  "project_name": "Project Name"
}
```

Recommended location:

```text
~/.bda-skills/config.json
```

## PM / PM Lead

Use Hermes as the primary tool.

Commands:

```text
/pm-log
/pm-standup
/pm-status
/pm-risk
/pm-followup
/pm-requirement
```

PM fields that improve project logs:

```text
project
task_summary
pm_status
priority
due_date
blocker
next_step
```

## Metadata Rule

Casual/setup chat does not need metadata.

Real BDA work must include at least:

```json
{
  "project": "Project Name",
  "tool": "hermes-desktop-agent or windsurf",
  "task_summary": "short task",
  "session_id": "YYYY-MM-DD-EMPLOYEE-PROJECT-001"
}
```
