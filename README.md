# BDA AI Dev Standard

มาตรฐานกลางสำหรับการทำงานร่วมกับ AI ในงานพัฒนา ซ่อมบั๊ก ตรวจโค้ด เขียนเอกสาร งาน Obsidian งาน Performance และงานติดตามทีมของ BDA

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
- เขียนเอกสาร: `commands/write-document.md`
- อัปเดต Obsidian: `commands/update-obsidian.md`
- Performance: `commands/performance-review.md`
- Employee Daily Log v5: `commands/employee-daily-log-v5.md`
- PM Weekly Focus v2: `commands/pm-weekly-focus-v2.md`

## ใช้กับ AI ตัวไหนได้บ้าง

- General AI: ใช้ `AI-README.md` และ `prompts/general-ai/`
- Codex: ใช้ `codex/AGENTS.md`
- Claude: ใช้ `claude/CLAUDE.md` และ `claude/commands/`

## หลักการสำคัญ

- ห้ามส่งงานโดยไม่มี evidence
- ห้ามบอกว่า test ผ่านถ้าไม่ได้รันจริง
- ห้ามแก้ shared repo หรือ production โดยไม่ยืนยัน scope
- ทุก update ของมาตรฐานนี้ต้องทำใน repo นี้ก่อน แล้วค่อย rollout
