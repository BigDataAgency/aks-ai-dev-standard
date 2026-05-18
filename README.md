# BDA AI Dev Standard

Version: `0.4.1`
License: MIT

มาตรฐานกลางสำหรับการทำงานร่วมกับ AI ในงานพัฒนา ซ่อมบั๊ก ตรวจโค้ด เขียนเอกสาร งาน Obsidian งาน Performance และงานติดตามทีมของ BDA

แนวคิดหลัก: ผู้ใช้ไม่ต้องไล่ตามเครื่องมือ/เทคนิคใหม่ตลอดเวลา — ใช้ command และ workflow เดิมได้ แต่ไส้ในของ standard จะถูกปรับปรุงเป็น version ใหม่เมื่อมีวิธีที่ดีกว่า ปลอดภัยกว่า หรือใช้งานจริงได้ดีกว่า

## Versioning

BDA AI Dev Standard ใช้ Semantic Versioning: `MAJOR.MINOR.PATCH`

- Current version: `0.4.1`
- ดูประวัติการเปลี่ยนแปลงที่ `CHANGELOG.md`
- เลข version หลักอยู่ใน `VERSION`
- ทุก update สำคัญต้องเปลี่ยน version ใน repo นี้ก่อน rollout

## Quickstart สำหรับคนใช้งาน

> **Public repo security notice:** repo นี้เป็น standards/templates/prompts/schemas แบบ public เท่านั้น ห้าม hardcode BDA/InnoHub production endpoints, credentials, tokens, tenant secrets, privileged database keys, หรือข้อมูลลูกค้าใน repo นี้ ค่า default ต้องเป็น local-output mode (`BDA_STANDARD_MODE=local`) และห้าม auto-ingest เข้า InnoHub โดย default ให้ใช้ `localhost` หรือ `example.com` เป็น placeholder เท่านั้น Production ingest ต้องผ่าน private connector พร้อม auth/tenant validation ตาม `SECURITY.md` และ `docs/public-ingest-guardrails.md`

1. เปิดงานด้วย `commands/understand-task.md`
2. เลือก workflow ตามประเภทงานใน `workflows/`
3. ให้ AI วางแผนด้วย `commands/plan-work.md`
4. ให้ AI ทำงานตาม command เฉพาะ เช่น `build-feature`, `fix-bug`, `write-document`
5. ตรวจหลักฐานด้วย `commands/verify-work.md` และ policy ใน `policies/`
6. ส่ง handoff ด้วย `commands/handoff-report.md`

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
- รายงาน test scenario พร้อม screenshot: `commands/test-report.md` (alias ของ `commands/test-scenario-report.md`)
- ส่งรายงานเข้า InnoHub แบบปลอดภัย: `commands/send-report.md` และ `docs/staff-report-sender-sop.md`
- Sync รายงานจาก GitHub/KitHub เข้า InnoHub แบบ transition-safe: `docs/github-to-innohub-sync-sop.md`
- เขียนเอกสาร: `commands/write-document.md`
- อัปเดต Obsidian: `commands/update-obsidian.md`
- Feedback เพื่อปรับปรุงมาตรฐาน: `commands/standard-feedback.md`
- Test Report (QA/product evidence): `commands/test-report.md` (internal source: `commands/test-scenario-report.md`)
- Performance: `commands/performance-review.md`
- Daily Log: `commands/daily-log.md` (internal source: `commands/employee-daily-log-v5.md`)
- Weekly Focus: `commands/weekly-focus.md` (internal source: `commands/pm-weekly-focus-v2.md`)

## ใช้กับ AI ตัวไหนได้บ้าง

- General AI: ใช้ `AI-README.md` และ `prompts/general-ai/`
- Codex: ใช้ `codex/AGENTS.md`
- Claude: ใช้ `claude/CLAUDE.md` และ `claude/commands/`

### Claude slash commands

ใช้ `/` command ใน Claude Code ได้เมื่อ copy/ติดตั้งไฟล์จาก `claude/commands/*.md` ไปไว้ใน `.claude/commands/` ของ target repo และ copy `claude/CLAUDE.md` ไปเป็น `CLAUDE.md` ที่ root ของ target repo แล้ว

- Interactive Claude Code: เรียกได้ เช่น `/fix-bug`, `/review-change`, `/build-feature`, `/write-document`, `/standard-feedback`, `/daily-log`, `/weekly-focus`, `/test-report`
- Print mode (`claude -p`): slash command แบบ interactive จะไม่ถูกรันโดยตรง ให้ reference ไฟล์ command (`commands/fix-bug.md`) หรือ paste prompt จาก command แทน


## Staff command pack v0.4.0

Staff-facing command names use normal names without internal version suffixes:

- Daily Log: `commands/daily-log.md` → internal source of truth `commands/employee-daily-log-v5.md` and template `templates/daily-log-v5.md`
- Weekly Focus: `commands/weekly-focus.md` → internal source of truth `commands/pm-weekly-focus-v2.md` and template `templates/pm-weekly-focus-v2.md`
- Test Report: `commands/test-report.md` → internal QA/product evidence standard `commands/test-scenario-report.md`, `workflows/test-scenario-report.md`, `templates/test-scenario-report.md`

Adapter usage:

- Claude Code: copy `claude/commands/*.md` to `.claude/commands/` and use slash commands `/daily-log`, `/weekly-focus`, `/test-report` in interactive Claude Code only.
- Gemini: use prompt commands in `gemini/prompts/`; Gemini does not use Claude Code slash commands.
- Claude coworker: use prompt commands in `claude-coworker/prompts/`; these are paste/reference prompts, not Claude Code slash commands.
- Codex: use `codex/AGENTS.md` as agent instruction and reference the staff command files by path.

These aliases keep canonical/versioned standards internal so staff do not need to remember `v5` or `v2` names.

## QA/Product evidence workflow

เมื่อต้องการทำ test case/scenario พร้อม capture screenshot และสร้างรายงาน ให้ใช้ชื่อ staff-facing ปกติ `test-report` (alias ของ internal `test-scenario-report`):

- Staff command: `commands/test-report.md`
- Internal command/source of truth: `commands/test-scenario-report.md`
- Workflow: `workflows/test-scenario-report.md`
- Template: `templates/test-scenario-report.md`
- Claude Code slash command: `/test-report` จาก `claude/commands/test-report.md` (slash command ใช้กับ Claude Code interactive เท่านั้น)

Workflow นี้เป็น QA/product evidence workflow เท่านั้น **ไม่ใช่** Employee Daily Log v5, performance review, score, KPI, daily performance หรือการประเมินบุคคล

สำหรับ InnoHub หรือ user-facing checks ให้ใช้ visible-menu navigation เป็น default และห้ามใช้ hidden route/direct URL เพื่อ claim user journey เว้นแต่ label ชัดว่าเป็น technical verification only

## Private report ingest connector and GitHub/KitHub sync (dry-run default)

`scripts/send-ingest-report.mjs` converts a Test Report / test-scenario-report markdown or JSON file into a minimal `bda-standard-ingest/0.4.1` `report_summary` payload. `scripts/sync-github-reports.mjs` scans an existing GitHub/KitHub/local checkout for report files, validates them through the same connector, and optionally sends only new/changed reports from a private runner.

Security defaults:

- Dry-run/local JSON output is the default; no network request is made unless `--send` is provided.
- Remote send requires explicit `--send` plus an endpoint and a private token source (`--token-file`, `--token-env`, or private env).
- Staff SOP: `docs/staff-report-sender-sop.md`; staff command: `commands/send-report.md`.
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

Feedback loop นี้เป็น product-improvement process สำหรับมาตรฐานเท่านั้น **ไม่ใช่** Employee Daily Log v5, performance review, score, KPI, daily performance หรือการประเมินบุคคล เพราะไม่ใช่ทุกทีม/ทุก role ใช้มาตรฐานนี้ และ non-dev staff อาจไม่เกี่ยวข้อง

## Output บังคับทุก workflow/command

ทุกงานที่ใช้ BDA AI Dev Standard ต้องรายงานหัวข้อต่อไปนี้ให้ครบ:

- **BDA Standard files used**: path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง
- **Pipeline trace**: ลำดับ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้จริง
- **Commands run**: คำสั่งหรือ tool ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันให้ระบุเหตุผล
- **Verification / Evidence**: หลักฐานตรวจจริง เช่น test/lint/build/manual check/diff/link
- **Limitations / Risks / Next steps**: ข้อจำกัด ความเสี่ยง และงานต่อ

## หลักการสำคัญ

- ห้ามส่งงานโดยไม่มี evidence
- ห้ามบอกว่า test ผ่านถ้าไม่ได้รันจริง
- ห้ามแก้ shared repo หรือ production โดยไม่ยืนยัน scope
- ห้ามส่งงานโดยไม่ระบุไฟล์มาตรฐาน BDA ที่ใช้, pipeline trace, และ commands run
- ทุก update ของมาตรฐานนี้ต้องทำใน repo นี้ก่อน แล้วค่อย rollout
