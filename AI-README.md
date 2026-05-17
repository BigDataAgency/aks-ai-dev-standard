# AI Entry Point: BDA AI Dev Standard

คุณคือผู้ช่วยทำงานของ BDA ให้ทำงานแบบมืออาชีพ กระชับ ตรวจสอบได้ และไม่สร้างหลักฐานปลอม

## Copy this into AI

```text
ใช้ BDA AI Dev Standard เป็นมาตรฐานการทำงาน:
1) อ่าน task brief และ context ก่อน
2) ถ้าเป็น repo ให้สำรวจไฟล์/โครงสร้างก่อนแก้
3) สรุปความเข้าใจและความเสี่ยง
4) ทำแผนสั้นตามขนาดงาน
5) ลงมือทำด้วย tool ที่เหมาะสม
6) verify ด้วยคำสั่งจริงหรือหลักฐานจริง
7) ส่ง handoff เป็นภาษาไทย พร้อมไฟล์ที่แก้, ผลทดสอบ, ข้อจำกัด, next step
8) ทุก output ต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
ห้ามอ้างว่าเสร็จหรือผ่าน test ถ้าไม่ได้ตรวจจริง
```

## Routing

- ไม่รู้ requirement: `commands/understand-task.md`
- ต้องวางแผน: `commands/plan-work.md`
- feature: `commands/build-feature.md`
- bug: `commands/fix-bug.md`
- review: `commands/review-change.md`
- docs/writing: `commands/write-document.md`
- Obsidian: `commands/update-obsidian.md`
- QA/product evidence พร้อม screenshot report: `commands/test-scenario-report.md`, `workflows/test-scenario-report.md`, `templates/test-scenario-report.md`
- feedback เพื่อปรับปรุง BDA AI Dev Standard: `commands/standard-feedback.md`, `FEEDBACK.md`, `templates/standard-feedback.md`
- performance: `commands/performance-review.md`
- ส่งงาน: `commands/handoff-report.md`

## Test scenario report workflow

ใช้เมื่อต้องการทำ test case/scenario, capture screenshot, ตรวจ console/network และสร้าง report สำหรับ QA/product evidence โดยแยกจาก Employee Daily Log v5 และ performance evaluation

- ใช้ `commands/test-scenario-report.md`
- ทำตาม `workflows/test-scenario-report.md`
- กรอก/สร้างรายงานจาก `templates/test-scenario-report.md`
- สำหรับ InnoHub/user-facing checks ใช้ visible-menu navigation เป็น default; direct URL/hidden route ต้อง label เป็น technical verification only

## Standard feedback loop

ใช้เมื่อต้องการปรับปรุง/แก้ไข/เพิ่ม feature ให้ BDA AI Dev Standard เอง เช่น bug/confusion/missing command/feature request/scenario/adoption friction/AI output issue

- ใช้ `commands/standard-feedback.md`
- กรอก `templates/standard-feedback.md`
- ถ้าต้องแก้มาตรฐาน ให้ใช้ `workflows/standard-improvement.md`
- ห้ามผูก feedback นี้กับ Employee Daily Log v5, performance review, score, KPI, daily performance หรือการประเมินบุคคล

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
