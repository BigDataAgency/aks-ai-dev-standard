# BDA AI Dev Standard

Version: `0.2.0`
License: MIT

มาตรฐานกลางสำหรับการทำงานร่วมกับ AI ในงานพัฒนา ซ่อมบั๊ก ตรวจโค้ด เขียนเอกสาร งาน Obsidian งาน Performance และงานติดตามทีมของ BDA

แนวคิดหลัก: ผู้ใช้ไม่ต้องไล่ตามเครื่องมือ/เทคนิคใหม่ตลอดเวลา — ใช้ command และ workflow เดิมได้ แต่ไส้ในของ standard จะถูกปรับปรุงเป็น version ใหม่เมื่อมีวิธีที่ดีกว่า ปลอดภัยกว่า หรือใช้งานจริงได้ดีกว่า

## Versioning

BDA AI Dev Standard ใช้ Semantic Versioning: `MAJOR.MINOR.PATCH`

- Current version: `0.3.0`
- ดูประวัติการเปลี่ยนแปลงที่ `CHANGELOG.md`
- เลข version หลักอยู่ใน `VERSION`
- ทุก update สำคัญต้องเปลี่ยน version ใน repo นี้ก่อน rollout

## Quickstart สำหรับคนใช้งาน

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
- รายงาน test scenario พร้อม screenshot: `commands/test-scenario-report.md`
- เขียนเอกสาร: `commands/write-document.md`
- อัปเดต Obsidian: `commands/update-obsidian.md`
- Feedback เพื่อปรับปรุงมาตรฐาน: `commands/standard-feedback.md`
- Test Scenario Report (QA/product evidence): `commands/test-scenario-report.md`
- Performance: `commands/performance-review.md`
- Employee Daily Log v5: `commands/employee-daily-log-v5.md`
- PM Weekly Focus v2: `commands/pm-weekly-focus-v2.md`

## ใช้กับ AI ตัวไหนได้บ้าง

- General AI: ใช้ `AI-README.md` และ `prompts/general-ai/`
- Codex: ใช้ `codex/AGENTS.md`
- Claude: ใช้ `claude/CLAUDE.md` และ `claude/commands/`

### Claude slash commands

ใช้ `/` command ใน Claude Code ได้เมื่อ copy/ติดตั้งไฟล์จาก `claude/commands/*.md` ไปไว้ใน `.claude/commands/` ของ target repo และ copy `claude/CLAUDE.md` ไปเป็น `CLAUDE.md` ที่ root ของ target repo แล้ว

- Interactive Claude Code: เรียกได้ เช่น `/fix-bug`, `/review-change`, `/build-feature`, `/write-document`, `/standard-feedback`, `/test-scenario-report`
- Print mode (`claude -p`): slash command แบบ interactive จะไม่ถูกรันโดยตรง ให้ reference ไฟล์ command (`commands/fix-bug.md`) หรือ paste prompt จาก command แทน

## QA/Product evidence workflow

เมื่อต้องการทำ test case/scenario พร้อม capture screenshot และสร้างรายงาน ให้ใช้ชุดนี้:

- Command: `commands/test-scenario-report.md`
- Workflow: `workflows/test-scenario-report.md`
- Template: `templates/test-scenario-report.md`
- Claude slash command: `/test-scenario-report` จาก `claude/commands/test-scenario-report.md`

Workflow นี้เป็น QA/product evidence workflow เท่านั้น **ไม่ใช่** Employee Daily Log v5, performance review, score, KPI, daily performance หรือการประเมินบุคคล

สำหรับ InnoHub หรือ user-facing checks ให้ใช้ visible-menu navigation เป็น default และห้ามใช้ hidden route/direct URL เพื่อ claim user journey เว้นแต่ label ชัดว่าเป็น technical verification only

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
