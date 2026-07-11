# AKS AI Dev Standard (เดิม BDA AI Dev Standard)

Version: `1.1.0`
License: MIT

มาตรฐานกลางสำหรับการทำงานร่วมกับ AI ในงานพัฒนา ซ่อมบั๊ก ตรวจโค้ด เขียนเอกสาร งาน Obsidian งาน Performance และงานติดตามทีมของ AKS

แนวคิดหลัก: ผู้ใช้ไม่ต้องไล่ตามเครื่องมือ/เทคนิคใหม่ตลอดเวลา — ใช้ command และ workflow เดิมได้ แต่ไส้ในของ standard จะถูกปรับปรุงเป็น version ใหม่เมื่อมีวิธีที่ดีกว่า ปลอดภัยกว่า หรือใช้งานจริงได้ดีกว่า

> **Public repo security notice:** repo นี้เป็น standards/templates/prompts/schemas แบบ public เท่านั้น ห้าม hardcode BDA/InnoHub production endpoints, credentials, tokens, tenant secrets, privileged database keys, หรือข้อมูลลูกค้าใน repo นี้ ค่า default ต้องเป็น local-output mode (`BDA_STANDARD_MODE=local`) และห้าม auto-ingest เข้า InnoHub โดย default ให้ใช้ `localhost` หรือ `example.com` เป็น placeholder เท่านั้น Production ingest ต้องผ่าน private connector พร้อม auth/tenant validation ตาม `SECURITY.md` และ `docs/public-ingest-guardrails.md`

## คุณใช้ช่องทางไหน

เลือกคู่มือตามช่องทางที่คุณใช้งานจริง:

- **llm-local** — ทำงานบนเครื่องตัวเองด้วย Hermes / Claude Code / Cline / IDE ผ่าน LiteLLM gateway และมี `aks`/`bda` CLI → [`channels/llm-local/README.md`](channels/llm-local/README.md)
- **thClaws** — ทำงานในกล่องส่วนตัวบน GX10 ผ่าน web UI (มี AI agent, Shell จริง, docker, Preview port 3000, Whisper) → [`channels/thclaws/README.md`](channels/thclaws/README.md)

เนื้อหากลางที่ใช้ได้**ทุกช่องทาง**อยู่ใน [`core/`](core/): `core/commands/`, `core/workflows/`, `core/policies/`, `core/checklists/`, `core/templates/`, `core/roles/`, `core/prompts/`

โฟลเดอร์อื่น: `docs/` = SOP กลาง, `admin/` = runbook ฝั่ง server (พนักงานทั่วไปไม่ต้องใช้), `archive/` = เอกสารเก่าเก็บอ้างอิง, `scripts/` = CLI และเครื่องมือ (ตำแหน่งเดิม)

## เริ่มงานยังไง

1. เปิดงานด้วย `core/commands/understand-task.md` แล้วเลือก workflow ตามขนาดงานใน `core/workflows/` (task-size-small / medium / large)
2. ถ้างานผูกกับ Obsidian ใช้ `core/commands/init.md` หนึ่งครั้งเพื่อสร้าง context manifest `00-Agent-Context.md`
3. วางแผนด้วย `core/commands/plan-work.md` แล้วทำงานด้วย command เฉพาะ เช่น `core/commands/build-feature.md`, `core/commands/fix-bug.md`, `core/commands/review-change.md`, `core/commands/write-document.md`
4. ตรวจหลักฐานด้วย `core/commands/verify-work.md` และ policy ใน `core/policies/` แล้วส่งมอบด้วย `core/commands/handoff-report.md`

คำสั่งสำคัญอื่น:

- รายงาน test scenario (QA/product evidence): `core/commands/test-report.md` (alias ของ `core/commands/test-scenario-report.md`) ตาม `core/workflows/test-scenario-report.md` และ `core/templates/test-scenario-report.md` — สำหรับ InnoHub/user-facing checks ใช้ visible-menu navigation เป็น default; direct URL/hidden route ต้อง label เป็น technical verification only — workflow นี้ไม่ใช่ performance review หรือการประเมินบุคคล
- PM / PM lead: `core/commands/pm-log.md`, `pm-standup`, `pm-status`, `pm-risk`, `pm-followup`, `pm-requirement`
- Feedback เพื่อปรับปรุงมาตรฐาน: อ่าน `FEEDBACK.md` → ใช้ `core/commands/standard-feedback.md` กรอก `core/templates/standard-feedback.md` และถ้าจะแก้มาตรฐานให้ตาม `core/workflows/standard-improvement.md` — feedback loop นี้ไม่ใช่ performance review, score, KPI หรือการประเมินบุคคล เพราะไม่ใช่ทุกทีม/ทุก role ใช้มาตรฐานนี้

## Slash commands (เฉพาะช่องทาง llm-local)

Slash commands เช่น `/init`, `/fix-bug`, `/review-change`, `/standard-feedback`, `/test-report` ใช้ได้เฉพาะ Claude Code แบบ interactive หลัง copy `channels/llm-local/claude/commands/*.md` (เช่น `channels/llm-local/claude/commands/test-report.md`) ไปไว้ใน `.claude/commands/` ของ target repo และ copy `channels/llm-local/claude/CLAUDE.md` เป็น `CLAUDE.md` ที่ root

- Print mode (`claude -p`): slash command จะไม่ถูกรัน ให้ reference ไฟล์ command (`core/commands/fix-bug.md`) หรือ paste prompt แทน
- ในกล่อง thClaws **ไม่มี slash commands** — พิมพ์สั่ง AI เป็นภาษาคนธรรมดาในแท็บ Terminal แทน (ดู `channels/thclaws/README.md`)

## Session CLI (เฉพาะช่องทาง llm-local)

งานจริงเปิด/ปิด session ด้วย `aks`/`bda` CLI และระหว่าง session สั่งงานแบบ `bda-dev: <prompt>`, `bda-nondev: <prompt>`, `bda-pm: <prompt>` ได้ (ดู `channels/llm-local/docs/bda-session-cli.md` และ `channels/llm-local/docs/ai-work-event-logging.md`):

```bash
aks start --project "Project Name" --task "fix login validation bug" --command bda-dev --work-type debug
bda help
aks update    # ดึง standard ล่าสุด (bda update เป็น alias ถาวรของพนักงานเดิม/สคริปต์/cron)
bda stop --status done --outcome "login validation fixed" --next-step "deploy staging"
```

เมื่อพิมพ์ `bda start` ให้ AI ร่าง metadata ให้ตรวจ/แก้ก่อนเริ่มงานจริง และ `bda stop` ต้องปิด session เดิมเท่านั้น ห้ามเดา session ใหม่

## Output บังคับทุก workflow/command

ทุกงานที่ใช้ AKS AI Dev Standard ต้องรายงานหัวข้อต่อไปนี้ให้ครบ:

- **BDA Standard files used**: path ของไฟล์มาตรฐานที่เปิด/อ้างอิงจริง
- **Pipeline trace**: ลำดับ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้จริง
- **Commands run**: คำสั่งหรือ tool ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันให้ระบุเหตุผล
- **Verification / Evidence**: หลักฐานตรวจจริง เช่น test/lint/build/manual check/diff/link
- **Limitations / Risks / Next steps**: ข้อจำกัด ความเสี่ยง และงานต่อ

หลักการสำคัญ: ห้ามส่งงานโดยไม่มี evidence, ห้ามบอกว่า test ผ่านถ้าไม่ได้รันจริง, ทำ minimum correct change และห้ามเพิ่ม speculative abstraction/config/dependency/feature ที่ผู้ใช้ไม่ได้ขอ (รายละเอียดเต็มดู `STANDARD.md` และ `AI-README.md`)

## Versioning

AKS AI Dev Standard ใช้ Semantic Versioning: `MAJOR.MINOR.PATCH`

- Current version: `1.1.0`
- ดูประวัติการเปลี่ยนแปลงที่ `CHANGELOG.md`
- เลข version หลักอยู่ใน `VERSION`
- ทุก update สำคัญต้องเปลี่ยน version ใน repo นี้ก่อน rollout
