# BDA AI Dev Standard

Version: `0.10.2`
License: MIT

มาตรฐานกลางสำหรับการทำงานร่วมกับ AI ในงานพัฒนา ซ่อมบั๊ก ตรวจโค้ด เขียนเอกสาร งาน Obsidian งาน Performance และงานติดตามทีมของ BDA

แนวคิดหลัก: ผู้ใช้ไม่ต้องไล่ตามเครื่องมือ/เทคนิคใหม่ตลอดเวลา — ใช้ command และ workflow เดิมได้ แต่ไส้ในของ standard จะถูกปรับปรุงเป็น version ใหม่เมื่อมีวิธีที่ดีกว่า ปลอดภัยกว่า หรือใช้งานจริงได้ดีกว่า

## Versioning

BDA AI Dev Standard ใช้ Semantic Versioning: `MAJOR.MINOR.PATCH`

- Current version: `0.10.2`
- ดูประวัติการเปลี่ยนแปลงที่ `CHANGELOG.md`
- เลข version หลักอยู่ใน `VERSION`
- ทุก update สำคัญต้องเปลี่ยน version ใน repo นี้ก่อน rollout

## Quickstart สำหรับคนใช้งาน

> **Public repo security notice:** repo นี้เป็น standards/templates/prompts/schemas แบบ public เท่านั้น ห้าม hardcode BDA/InnoHub production endpoints, credentials, tokens, tenant secrets, privileged database keys, หรือข้อมูลลูกค้าใน repo นี้ ค่า default ต้องเป็น local-output mode (`BDA_STANDARD_MODE=local`) และห้าม auto-ingest เข้า InnoHub โดย default ให้ใช้ `localhost` หรือ `example.com` เป็น placeholder เท่านั้น Production ingest ต้องผ่าน private connector พร้อม auth/tenant validation ตาม `SECURITY.md` และ `docs/public-ingest-guardrails.md`

1. เปิดงานด้วย `commands/understand-task.md`
2. ถ้างานต้องทำร่วมกับ Obsidian ให้ใช้ `commands/init.md` หนึ่งครั้งเพื่อสร้าง context manifest
3. เลือก workflow ตามประเภทงานใน `workflows/`
4. ให้ AI วางแผนด้วย `commands/plan-work.md`
5. ให้ AI ทำงานตาม command เฉพาะ เช่น `build-feature`, `fix-bug`, `write-document`
6. ตรวจหลักฐานด้วย `commands/verify-work.md` และ policy ใน `policies/`
7. ส่ง handoff ด้วย `commands/handoff-report.md`

## เลือกตามขนาดงาน

- งานเล็ก: `workflows/task-size-small.md`
- งานกลาง: `workflows/task-size-medium.md`
- งานใหญ่: `workflows/task-size-large.md`

## คำสั่งสำคัญ

- งานค้างเดิม: `commands/resume-pending-work.md`
- งานใหม่: `commands/build-feature.md`
- แก้บั๊ก: `commands/fix-bug.md`
- Code Review: `commands/review-change.md`
- เช็กแอปจริง: `commands/check-real-app.md`
- Init Obsidian/project context: `commands/init.md`
- รายงาน test scenario พร้อม screenshot: `commands/test-report.md` (alias ของ `commands/test-scenario-report.md`)
- ส่งรายงานเข้า InnoHub แบบปลอดภัย: `commands/send-report.md` และ `docs/staff-report-sender-sop.md`
- Sync รายงานจาก GitHub/KitHub เข้า InnoHub แบบ transition-safe: `docs/github-to-innohub-sync-sop.md`
- เขียนเอกสาร: `commands/write-document.md`
- อัปเดต Obsidian: `commands/update-obsidian.md`
- Feedback เพื่อปรับปรุงมาตรฐาน: `commands/standard-feedback.md`
- Test Report (QA/product evidence): `commands/test-report.md` (source: `commands/test-scenario-report.md`)
- Performance: `commands/performance-review.md`
- PM / PM lead: `commands/pm-log.md`, `commands/pm-standup.md`, `commands/pm-status.md`, `commands/pm-risk.md`, `commands/pm-followup.md`, `commands/pm-requirement.md`
- Automatic work event logging: `docs/ai-work-event-logging.md` and `scripts/bda-work-event.mjs`
- BDA session CLI: `docs/bda-session-cli.md` and `scripts/bda.mjs`
- Hermes / Windsurf / IDE setup: `docs/tool-setup-hermes-windsurf-ide.md`

## ใช้กับ AI ตัวไหนได้บ้าง

- General AI: ใช้ `AI-README.md` และ `prompts/general-ai/`
- Codex: ใช้ `codex/AGENTS.md`
- Claude: ใช้ `claude/CLAUDE.md` และ `claude/commands/`

### Claude slash commands

ใช้ `/` command ใน Claude Code ได้เมื่อ copy/ติดตั้งไฟล์จาก `claude/commands/*.md` ไปไว้ใน `.claude/commands/` ของ target repo และ copy `claude/CLAUDE.md` ไปเป็น `CLAUDE.md` ที่ root ของ target repo แล้ว

- Interactive Claude Code: เรียกได้ เช่น `/init`, `/fix-bug`, `/review-change`, `/build-feature`, `/write-document`, `/standard-feedback`, `/test-report`
- Print mode (`claude -p`): slash command แบบ interactive จะไม่ถูกรันโดยตรง ให้ reference ไฟล์ command (`commands/fix-bug.md`) หรือ paste prompt จาก command แทน


## Command Pack

Command names are limited to supported developer, Obsidian, QA, reporting, and feedback workflows:

- Test Report: `commands/test-report.md`, `commands/test-scenario-report.md`, `workflows/test-scenario-report.md`, `templates/test-scenario-report.md`
- PM Lead: `commands/pm-log.md`, `commands/pm-standup.md`, `commands/pm-status.md`, `commands/pm-risk.md`, `commands/pm-followup.md`, `commands/pm-requirement.md`

Adapter usage:

- Claude Code: copy `claude/commands/*.md` to `.claude/commands/` and use slash commands such as `/init`, `/fix-bug`, `/build-feature`, `/write-document`, `/standard-feedback`, `/test-report` in interactive Claude Code only. If the installed Claude Code build supports Developer Mode gateway/base-url configuration, route it through the BDA gateway with the employee personal key.
- PM lead Claude commands include `/pm-log`, `/pm-standup`, `/pm-status`, `/pm-risk`, `/pm-followup`, and `/pm-requirement`.
- Gemini: use prompt commands in `gemini/prompts/`; Gemini does not use Claude Code slash commands.
- Claude coworker: use prompt commands in `claude-coworker/prompts/`; these are paste/reference prompts, not Claude Code slash commands.
- Codex: use `codex/AGENTS.md` as agent instruction and reference the command files by path.

## AI work event logging

For real BDA work, staff should use one personal API key and send a work event tied to the command/task. This replaces manual daily log collection and lets PM lead logs be generated from actual useful AI-assisted work.

Public repo rule: do not commit production endpoints or API keys to this repo. Configure private values through `~/.bda-skills/config.json`, `.bda-skills/config.json`, or environment variables.

See:

- `docs/ai-work-event-logging.md`
- `docs/tool-setup-hermes-windsurf-ide.md`
- `scripts/bda-work-event.mjs`

Recommended session flow:

```bash
bda start --project "Project Name" --task "fix login validation bug" --command bda-dev-debug
bda help
bda event --command bda-dev-review --task "review login fix" --status done
bda stop --status done --outcome "login validation fixed" --next-step "deploy staging"
```

When a staff member types `bda start` in AI chat, the AI should draft the metadata first, ask the staff member to confirm or edit it, and only then continue the work. During an active session, staff can write commands as `bda-dev-debug: <prompt>`, `bda-nondev-explore: <prompt>`, or `bda-pm-status: <prompt>`.

See `docs/bda-session-cli.md`.

One-off event example:

```bash
npm run work:event -- \
  --employee-code EMPLOYEE_CODE \
  --employee-group dev \
  --command "/fix-bug" \
  --work-type debug \
  --status done \
  --project "Project Name" \
  --task "fix login validation bug" \
  --dry-run
```

### Command UX and workflow discipline

ผู้ใช้ยังใช้ command/slash command ชุดเดิมได้ เช่น `/fix-bug`, `/build-feature`, `/review-change`, `/plan-work`, `/test-report`, และ `/standard-feedback`. การปรับปรุงมาตรฐานควรอยู่ที่ workflow ภายใน ไม่ใช่เปลี่ยนชื่อ command หรือเพิ่มภาระให้ผู้ใช้โดยไม่จำเป็น.

หลักการ rollout:

- Keep command names stable: เปลี่ยนชื่อ command เฉพาะเมื่อเป็น breaking release และมี migration note
- Lightweight by default: งานเล็กให้ถาม/รายงานเฉพาะ success criteria, minimum correct change, verification, และ risk ที่จำเป็น
- Ask only when it matters: ถาม clarification เฉพาะ ambiguity ที่กระทบ scope, data safety, security, หรือ correctness; ถ้าไม่กระทบให้ระบุ assumption แล้วทำต่อแบบเล็กที่สุด
- Evidence over ceremony: เพิ่มหลักฐานจริงและ evidence mapping แทนการเพิ่มเอกสารยาว ๆ
- Same command, better internals: command เดิมต้องนำผู้ใช้ผ่าน success criteria, pattern check, minimal implementation, verification mapping, และ handoff ที่ตรวจกลับได้

## Obsidian init context workflow

ใช้ `commands/init.md` เมื่ออยากให้ AI รู้จักโครงสร้าง Obsidian/project ก่อนทำงานต่อด้วย `plan-work`, `fix-bug`, `build-feature`, `write-document`, `test-report`, หรือ `update-obsidian`.

สิ่งที่ init สร้าง/อัปเดตใน project folder ที่ยืนยันแล้ว:

- `00-Agent-Context.md` จาก `templates/obsidian-context.md` เป็น canonical context manifest
- `sessions/_index.md` และ `sessions/YYYY-MM-DD-<slug>.md` สำหรับ work notes
- `test-evidence/_index.md` และ `test-evidence/YYYY-MM-DD-<slug>.md` สำหรับ testcase/evidence
- `.bda/obsidian-context.md` ใน source repo เฉพาะเมื่อ user อนุญาต เพื่อชี้กลับไปยัง Obsidian manifest

หลังมี manifest แล้ว command งานหลักจะอ่าน context นี้ก่อนทำงาน และอัปเดต session/evidence note เป็น default โดยยังต้องยึด no fake evidence: ไม่มีผลตรวจจริงให้ระบุ `pending evidence`.

## QA/Product evidence workflow

เมื่อต้องการทำ test case/scenario พร้อม capture screenshot และสร้างรายงาน ให้ใช้ชื่อ user-facing ปกติ `test-report`:

- Command: `commands/test-report.md`
- Detailed command: `commands/test-scenario-report.md`
- Workflow: `workflows/test-scenario-report.md`
- Template: `templates/test-scenario-report.md`
- Claude Code slash command: `/test-report` จาก `claude/commands/test-report.md` (slash command ใช้กับ Claude Code interactive เท่านั้น)

Workflow นี้เป็น QA/product evidence workflow เท่านั้น **ไม่ใช่** performance review, score, KPI, daily performance หรือการประเมินบุคคล

สำหรับ InnoHub หรือ user-facing checks ให้ใช้ visible-menu navigation เป็น default และห้ามใช้ hidden route/direct URL เพื่อ claim user journey เว้นแต่ label ชัดว่าเป็น technical verification only

## Private report ingest connector and GitHub/KitHub sync (dry-run default)

`scripts/send-ingest-report.mjs` converts a Test Report / test-scenario-report markdown or JSON file into a minimal `bda-standard-ingest/0.4.1` `report_summary` payload. `scripts/sync-github-reports.mjs` scans an existing GitHub/KitHub/local checkout for report files, validates them through the same connector, and optionally sends only new/changed reports from a private runner.

Security defaults:

- Dry-run/local JSON output is the default; no network request is made unless `--send` is provided.
- Remote send requires explicit `--send` plus an endpoint and a private token source (`--token-file`, `--token-env`, or private env).
- Staff SOP: `docs/staff-report-sender-sop.md`; command: `commands/send-report.md`.
- Transitional GitHub/KitHub sync SOP: `docs/github-to-innohub-sync-sop.md`; sync script: `scripts/sync-github-reports.mjs`.
- Private env alternatives are supported for authorized staff/CI: `INNOHUB_INGEST_URL`, `INNOHUB_INGEST_TOKEN_FILE`, `INNOHUB_INGEST_TOKEN`, and `INNOHUB_TENANT_ID`.
- No production endpoint or token is committed here; use private deployment configuration outside this public repo.
- The connector rejects high-confidence secret patterns before output/send and redacts likely PII/low-confidence secret-like text from payload fields.

Usage examples:

```bash
npm run ingest:report -- --file reports/test-report.md
npm run ingest:report -- --file reports/test-report.json --project "Example Project"
npm run sync:github-reports -- --repo-dir /path/to/kithub-or-github-checkout
npm run sync:github-reports -- --repo-dir /path/to/kithub-or-github-checkout --pull --send --endpoint https://example.com/ingest --token-file /private/path/ingest-token
npm run ingest:report -- --file reports/test-report.md --send --endpoint https://example.com/ingest --token-file /private/path/ingest-token
INNOHUB_INGEST_URL=https://example.com/ingest INNOHUB_INGEST_TOKEN_FILE=/private/path/ingest-token npm run ingest:report -- --file reports/test-report.md --send
```

Successful remote send returns `mode: sent`, HTTP status, and `event_id` when the private endpoint provides one. InnoHub owner/admin verifies accepted reports in the private dashboard at `/admin/bda-standard-ingest`.

Smoke test:

```bash
npm run test:ingest-report
npm run test:github-sync
```

## Feedback loop สำหรับปรับปรุงมาตรฐาน

ถ้าผู้ใช้งานพบว่า BDA AI Dev Standard ควรแก้ไข/เพิ่ม feature/เพิ่ม command/ทำให้ใช้ง่ายขึ้น ให้ใช้ feedback loop แยกนี้:

- อ่าน `FEEDBACK.md`
- ใช้ `commands/standard-feedback.md`
- กรอก `templates/standard-feedback.md`
- ถ้าจะลงมือแก้มาตรฐาน ให้ตาม `workflows/standard-improvement.md`

Feedback loop นี้เป็น product-improvement process สำหรับมาตรฐานเท่านั้น **ไม่ใช่** performance review, score, KPI, daily performance หรือการประเมินบุคคล เพราะไม่ใช่ทุกทีม/ทุก role ใช้มาตรฐานนี้ และ non-dev ทีม อาจไม่เกี่ยวข้อง

## Coding discipline

ทุก command ต้องใช้หลัก discipline เดียวกัน:

- เขียน success criteria ก่อนแก้ และใช้เป็น checklist ตอน verify
- ทำ minimum correct change: แก้เท่าที่จำเป็นให้ถูกต้องก่อน ไม่เพิ่ม feature/config/abstraction เผื่ออนาคต
- ทำตาม pattern เดิมของ repo และหลีกเลี่ยง unrelated refactor/format churn
- ทุก changed line ต้อง trace กลับไปยัง request, bug, success criteria, หรือ verification ได้
- ถาม assumption/ambiguity เฉพาะเมื่อมีผลต่อ scope, data safety, security, หรือ correctness
- Verification / Evidence ต้อง map กลับไปยัง success criteria และบอกส่วนที่ยังไม่ได้ตรวจจริง

## Output บังคับทุก workflow/command

ทุกงานที่ใช้ BDA AI Dev Standard ต้องรายงานหัวข้อต่อไปนี้ให้ครบ:

- **BDA Standard files used**: path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง
- **Pipeline trace**: ลำดับ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้จริง
- **Commands run**: คำสั่งหรือ tool ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันให้ระบุเหตุผล
- **Verification / Evidence**: หลักฐานตรวจจริง เช่น test/lint/build/manual check/diff/link
- **Limitations / Risks / Next steps**: ข้อจำกัด ความเสี่ยง และงานต่อ

## หลักการสำคัญ

- ห้ามเพิ่ม speculative abstraction, configuration, dependency, หรือ feature ที่ผู้ใช้ไม่ได้ขอ
- ห้ามส่งงานโดยไม่มี evidence
- ห้ามบอกว่า test ผ่านถ้าไม่ได้รันจริง
- ห้ามแก้ shared repo หรือ production โดยไม่ยืนยัน scope
- ห้ามส่งงานโดยไม่ระบุไฟล์มาตรฐาน BDA ที่ใช้, pipeline trace, และ commands run
- ทุก update ของมาตรฐานนี้ต้องทำใน repo นี้ก่อน แล้วค่อย rollout
