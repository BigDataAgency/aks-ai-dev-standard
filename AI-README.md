# AI Entry Point: BDA AI Dev Standard

คุณคือผู้ช่วยทำงานของ BDA ให้ทำงานแบบมืออาชีพ กระชับ ตรวจสอบได้ และไม่สร้างหลักฐานปลอม

## Copy this into AI

```text
ใช้ BDA AI Dev Standard เป็นมาตรฐานการทำงาน:
1) อ่าน task brief และ context ก่อน
2) ถ้าเป็น repo ให้สำรวจไฟล์/โครงสร้างก่อนแก้
3) ถ้างานผูกกับ Obsidian ให้หา `00-Agent-Context.md` หรือ `.bda/obsidian-context.md`; ถ้ายังไม่มีให้ใช้ `commands/init.md`
4) สรุปความเข้าใจและความเสี่ยง
5) ทำแผนสั้นตามขนาดงาน
6) ลงมือทำด้วย tool ที่เหมาะสม
7) verify ด้วยคำสั่งจริงหรือหลักฐานจริง
8) อัปเดต Obsidian session/evidence note ถ้ามี context manifest
9) ส่ง handoff เป็นภาษาไทย พร้อมไฟล์ที่แก้, ผลทดสอบ, ข้อจำกัด, next step
10) ทุก output ต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
ห้ามอ้างว่าเสร็จหรือผ่าน test ถ้าไม่ได้ตรวจจริง
```

## Routing

- ไม่รู้ requirement: `commands/understand-task.md`
- ต้องวางแผน: `commands/plan-work.md`
- init Obsidian/project context: `commands/init.md`
- feature: `commands/build-feature.md`
- bug: `commands/fix-bug.md`
- review: `commands/review-change.md`
- docs/writing: `commands/write-document.md`
- Obsidian: `commands/update-obsidian.md`
- QA/product evidence พร้อม screenshot report: `commands/test-report.md`, `commands/test-scenario-report.md`, `workflows/test-scenario-report.md`, `templates/test-scenario-report.md`
- feedback เพื่อปรับปรุง BDA AI Dev Standard: `commands/standard-feedback.md`, `FEEDBACK.md`, `templates/standard-feedback.md`
- performance: `commands/performance-review.md`
- ส่งงาน: `commands/handoff-report.md`

## Command Pack

ใช้เฉพาะ command ที่ยังอยู่ใน repo ปัจจุบัน เช่น `build-feature`, `fix-bug`, `write-document`, `init`, `test-report`, `standard-feedback`.

Adapter notes: Claude Code ใช้ slash commands เฉพาะ interactive mode; Gemini/Claude coworker ใช้ prompt commands; Codex ใช้ agent instruction ใน `codex/AGENTS.md`.

## Test scenario report workflow

ใช้เมื่อต้องการทำ test case/scenario, capture screenshot, ตรวจ console/network และสร้าง report สำหรับ QA/product evidence โดยแยกจาก performance evaluation

- ใช้ `commands/test-scenario-report.md`
- ทำตาม `workflows/test-scenario-report.md`
- กรอก/สร้างรายงานจาก `templates/test-scenario-report.md`
- สำหรับ InnoHub/user-facing checks ใช้ visible-menu navigation เป็น default; direct URL/hidden route ต้อง label เป็น technical verification only

## Obsidian context workflow

ใช้ `commands/init.md` เพื่อสำรวจ vault/project และสร้าง `00-Agent-Context.md` จาก `templates/obsidian-context.md` พร้อม session/evidence index จาก `templates/obsidian-work-note.md`.

หลังมี context แล้ว command หลัก เช่น `plan-work`, `fix-bug`, `build-feature`, `write-document`, `test-report`, และ `update-obsidian` ต้องอ่าน manifest ก่อนทำงาน และอัปเดต session/evidence note โดยไม่ต้องรอให้ user สั่งเก็บเพิ่มอีกครั้ง. ถ้าไม่มีหลักฐานจริงให้ระบุ `pending evidence` หรือ `not available`.

## Standard feedback loop

ใช้เมื่อต้องการปรับปรุง/แก้ไข/เพิ่ม feature ให้ BDA AI Dev Standard เอง เช่น bug/confusion/missing command/feature request/scenario/adoption friction/AI output issue

- ใช้ `commands/standard-feedback.md`
- กรอก `templates/standard-feedback.md`
- ถ้าต้องแก้มาตรฐาน ให้ใช้ `workflows/standard-improvement.md`
- ห้ามผูก feedback นี้กับ performance review, score, KPI, daily performance หรือการประเมินบุคคล

## Output มาตรฐาน

- BDA Standard files used: path ของไฟล์มาตรฐาน BDA ที่ใช้จริง เช่น `STANDARD.md`, `commands/...`, `workflows/...`, `policies/...`, `checklists/...`, `templates/...`
- Pipeline trace: Understand → Plan → Execute → Verify → Handoff พร้อม command/workflow ที่ใช้จริง
- Commands run: คำสั่งหรือ tool ที่รันจริงและผลสรุป; ถ้าไม่ได้รันให้บอกเหตุผล
- Verification / Evidence: หลักฐานตรวจจริง เช่น test/lint/build/manual check/diff/link
- ทำอะไรไป
- ไฟล์ที่แก้/สร้าง
- วิธี verify และผลลัพธ์
- ความเสี่ยง/ข้อจำกัด
- ขั้นตอน rollout/next step
