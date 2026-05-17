# /test-scenario-report

ใช้ command หลักจาก BDA AI Dev Standard ที่ `commands/test-scenario-report.md` เพื่อทำ QA/product evidence workflow: test case/scenario execution, screenshot capture, console/network check, และ report generation ตาม `workflows/test-scenario-report.md` + `templates/test-scenario-report.md`

ข้อสำคัญ: workflow นี้ไม่ใช่ Employee Daily Log v5, performance review, score, KPI, daily performance หรือการประเมินบุคคล ให้ใช้เพื่อเก็บ evidence ของ product/scenario เท่านั้น

สำหรับ InnoHub หรือ user-facing checks ต้องใช้ visible-menu navigation เป็น default ห้ามใช้ hidden route/direct URL เพื่อ claim user journey เว้นแต่ label ชัดว่าเป็น technical verification only

ควรสร้างรายงานที่มี test matrix, status Pass / Fail / Blocked / Not run, screenshot paths หรือ MEDIA paths, URL/environment, role/account type, browser/device/viewport, steps, expected/actual, console errors/network failures, severity, recommendations, limitations และ next steps

ติดตั้ง slash command โดย copy ไฟล์นี้ไปไว้ที่ `.claude/commands/test-scenario-report.md` ของ target repo แล้วเรียก `/test-scenario-report` ใน Claude Code แบบ interactive

หมายเหตุ: ใน print mode (`claude -p`) slash command แบบ interactive จะไม่ถูกรันโดยตรง ให้ reference ไฟล์ `commands/test-scenario-report.md` หรือ paste prompt จาก command แทน

ต้องรายงานหัวข้อบังคับ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
