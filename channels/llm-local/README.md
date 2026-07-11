# ช่องทาง llm-local — Hermes / Claude Code / IDE ผ่าน LiteLLM Gateway

คู่มือช่องทางบนเครื่องพนักงาน: Hermes, Claude Code, Cline/IDE และ `aks`/`bda` CLI ทั้งหมดวิ่งผ่าน LiteLLM gateway (เดิมคือ `docs/tool-setup-hermes-windsurf-ide.md`)

ถ้าคุณทำงานในกล่อง thClaws (web UI บน GX10) ให้ใช้ `../thclaws/README.md` แทน — เครื่องมือในหน้านี้ไม่มีในกล่อง

This public document describes the generic setup. Real BDA endpoint and user keys must be provided through private rollout docs or local config.

> **Updated 2026-07-05**: model IDs ปรับเป็นชุดปัจจุบัน (bda/dev, bda/nondev), Hermes เป็นเครื่องมือหลักแบบ agentic (ไม่ใช่แค่ discussion), เพิ่ม Claude Code setup จริง. เมื่อใช้ไม่ได้ให้ดู `channels/llm-local/docs/troubleshooting-ai-access.md` ก่อน. วิธีทำงานกับ AI ให้เสร็จจริง: `channels/llm-local/docs/ai-employee-manual.md`

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
bda/dev      # งานโค้ด/แก้บั๊ก/planning — route อัตโนมัติเข้า node local (A40/GX10)
bda/nondev   # ถาม-ตอบทั่วไป/เอกสาร (มี URL prefetch ผ่าน gateway)
# งานใหญ่/ประวัติยาว/หลายไฟล์ → paid: bda/deepseek-v4-pro-paid-cloud, bda/qwen3.7-plus-paid-cloud ฯลฯ
# สำหรับ Claude Code เท่านั้น: claude-code-local (ชื่อเดียว ทั้ง Desktop และ CLI — claude-sonnet-4-5 ปลดแล้ว 2026-07-06)
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

**Hermes คือเครื่องมือหลัก** — เป็น agentic CLI เต็มตัว (เขียนไฟล์/รันคำสั่ง/ทำงานจบ loop ได้ ไม่ใช่แค่คุย): `hermes -z "<งาน>" --cli` ใช้คู่กับ bda commands เสมอ. Claude Code เป็นทางเลือกที่ทดสอบแล้วสำหรับงานโค้ด scope ชัด. IDE (Windsurf/Cursor/Continue) เป็นทางเสริมสำหรับคนที่ถนัด IDE.

Generic IDE settings:

```text
Provider: OpenAI Compatible
Base URL: ${BDA_AI_ROUTER_BASE_URL}
API Key: personal employee key
Model:
  bda/dev
  bda/nondev
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

### Hermes model choice

- Fast/local chat: use for short questions, summaries, and setup checks.
- Qwen3 Coder/local coder: use for targeted text/code work only. Keep prompts small and specify the file/function/error slice.
- Larger-context/paid model: use when the task involves long history, many files, large logs, or repeated context-limit errors.
- Vision/image work: use Gemini, NotebookLM, or a vision-capable model to read screenshots/circled UI/document images first, then paste the extracted facts back into Hermes.
- If a session hits context limit, summarize the current state in 5-8 bullets and start a new session or switch to a larger-context model.
- BDA Gateway local capacity is managed centrally. When BDA adds or removes A40/GX10 worker nodes, staff do not need to reinstall Hermes, change API keys, or rename models; keep using the same Base URL and model names.

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
   - `bda/dev`
   - `bda/nondev`
7. Use `bda/dev` for coding, review, bug fixing, and planning. Use paid models (`bda/deepseek-v4-pro-paid-cloud` etc.) when the local route is not enough.

### Option B: Windsurf With Roo Code Or Continue

Use this if Windsurf does not expose a custom OpenAI-compatible provider.

Steps:

1. Open Windsurf extensions.
2. Install `Roo Code` or `Continue`.
3. Configure the extension as OpenAI-compatible.
4. Use Base URL `${BDA_AI_ROUTER_BASE_URL}`.
5. Use the employee personal API key.
6. Add model IDs `bda/dev` and `bda/nondev`.

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
   - `bda/dev`
   - `bda/nondev`
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
    model: bda/dev
    apiBase: ${{ env.BDA_AI_ROUTER_BASE_URL }}
    apiKey: ${{ env.BDA_AI_ROUTER_API_KEY }}
    roles:
      - chat
      - edit
      - apply
  - name: BDA Code Fast
    provider: openai
    model: bda/dev
    apiBase: ${{ env.BDA_AI_ROUTER_BASE_URL }}
    apiKey: ${{ env.BDA_AI_ROUTER_API_KEY }}
    roles:
      - autocomplete
      - edit
  - name: BDA Code Good
    provider: openai
    model: bda/dev
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

## Cline: ตั้งค่าอัตโนมัติด้วย script เดียว (แนะนำ — ไม่ต้องกดอะไรเอง)

Cline ไม่อ่าน context window จาก gateway (default 128k) — **วิธีง่ายสุด: `bda update` (หรือ `bda setup`) ทำให้อัตโนมัติ** (ปิด editor ทุกตัวก่อน):

```bash
bda update     # ดึง standard ล่าสุด + ตั้งค่า Cline 262k ให้เลย (คำสั่งเดียวจบ)
# หรือถ้าอัปเดตแล้วอยากตั้ง client อย่างเดียว:
bda setup
```
(ทางลับ manual: `./scripts/setup-cline-bda.sh`)

- เขียนที่ `~/.cline/data/globalState.json` (backup อัตโนมัติ), ไม่แตะ API key (ตั้งใน UI ครั้งแรกครั้งเดียว)
- ปิด/เปิด editor แล้ว Start New Task → แถบ context = 256.0k
- ตั้งมือ (fallback): Settings → API Configuration → ADVANCED → Context Window `262144`, Max Output `16384`

## VS Code With Roo Code Or Cline

Use this if the team prefers agent-style coding inside VS Code.

Steps:

1. Install `Roo Code` or `Cline`.
2. Choose OpenAI-compatible provider.
3. Base URL: `${BDA_AI_ROUTER_BASE_URL}`.
4. API key: personal employee key.
5. Model: `bda/dev`.
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
cp /path/to/bda-ai-dev-standard/channels/llm-local/claude/CLAUDE.md ./CLAUDE.md
cp /path/to/bda-ai-dev-standard/channels/llm-local/claude/commands/*.md ./.claude/commands/
```

Configure the gateway (ค่าจริงดู rollout ส่วนตัว):

```bash
# CLI / terminal (ใช้ config dir แยก กัน key เก่าค้าง — สาเหตุ 401 อันดับหนึ่ง)
export CLAUDE_CONFIG_DIR="$HOME/.claude-bda"
export ANTHROPIC_BASE_URL="<ROUTER_URL ไม่มี /v1 ต่อท้าย>"
export ANTHROPIC_API_KEY="<personal employee key>"
unset ANTHROPIC_AUTH_TOKEN
```

Model ที่ใช้ได้ (ทดสอบจริง 2026-07-05):

```text
claude-code-local   # ชื่อเดียวสำหรับ Claude Code ทั้ง Desktop และ CLI (load-balance 3 nodes)
```

ถ้าเจอ `<function=...>` โผล่เป็นข้อความในคำตอบ = route ฝั่ง server เพี้ยน ให้แจ้ง admin ทันที (ดู troubleshooting)

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

## Codex CLI (validated 2026-07-06)

Codex รุ่นใหม่ (≥0.142) ใช้ Responses API เท่านั้น — config `~/.codex/config.toml`:

```toml
# ⚠️ ห้ามใส่ใน ~/.codex/config.toml เป็น default (Codex Desktop อ่านไฟล์เดียวกัน จะพัง)
# ให้สร้างเป็นไฟล์ profile แยก: ~/.codex/bda.config.toml แล้วเรียกด้วย --profile bda
model = "bda/dev-codex"
model_provider = "bda"

[model_providers.bda]
name = "BDA Gateway"
base_url = "${BDA_AI_ROUTER_BASE_URL}"   # ไม่มี /v1 ซ้ำถ้า base มีแล้ว — ใช้ค่าจาก rollout
env_key = "BDA_AI_ROUTER_API_KEY"
wire_api = "responses"
```

- copy `channels/llm-local/codex-local/AGENTS.md` จาก repo นี้ไปเป็น `AGENTS.md` ที่ root ของโปรเจกต์ (codex จะทำตาม BDA standard + รายงานตาราง)
- ใช้ในสคริปต์/CI: `codex exec --profile bda --skip-git-repo-check --sandbox workspace-write "<งาน>" </dev/null` — **ต้องมี `</dev/null`** ไม่งั้นค้างรอ stdin
- model `bda/dev-codex` เท่านั้น (route พิเศษรองรับ Responses API) — `bda/dev` ใช้กับ codex ไม่ได้

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
