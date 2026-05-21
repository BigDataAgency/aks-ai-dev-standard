# /test-scenario-report

ใช้ command หลักจาก BDA AI Dev Standard ที่ `commands/test-scenario-report.md` เพื่อทำ QA/product evidence workflow: test case/scenario execution, screenshot capture, console/network check, และ report generation ตาม `workflows/test-scenario-report.md` + `templates/test-scenario-report.md`

ข้อสำคัญ: workflow นี้ไม่ใช่ performance review, score, KPI, daily performance หรือการประเมินบุคคล ให้ใช้เพื่อเก็บ evidence ของ product/scenario เท่านั้น

สำหรับ InnoHub หรือ user-facing checks ต้องใช้ visible-menu navigation เป็น default ห้ามใช้ hidden route/direct URL เพื่อ claim user journey เว้นแต่ label ชัดว่าเป็น technical verification only พร้อม route source trace

ถ้าเป็น production ต้องทำ read-only guardrail ก่อน execute: ห้าม create/edit/delete/approve/reject/upload/import/export/download sensitive docs หรือ action ที่ mutate production เว้นแต่มี explicit scope และ approval ชัดเจน; ถ้าต้อง mutate ให้ mark blocked เช่น `BLOCKED_PRODUCTION_WRITE_RISK` หรือ `BLOCKED_NO_MUTATION`

ควรสร้างรายงานที่มี test matrix, Auth/RBAC matrix, status Pass / Fail / Info / Limited / Blocked / Not run, blocked reason taxonomy, screenshot paths หรือ MEDIA paths, evidence manifest, URL/environment, route source trace, route drift/SPA 404 checks, role/account type และ test account classification แบบไม่มี credentials, browser/device/viewport, steps, expected/actual, console errors/network failures, PII masking verification, no-mutation/network-write verification, severity, recommendations, limitations และ next steps

Blocked reason taxonomy ที่ต้องใช้เมื่อเกี่ยวข้อง: `BLOCKED_NO_CREDENTIALS`, `BLOCKED_NO_ROLE`, `BLOCKED_PRODUCTION_WRITE_RISK`, `BLOCKED_PII_MASKING_REQUIRED`, `BLOCKED_ROUTE_DRIFT`

Standard wording สำหรับ direct URL: “Technical verification only: this direct URL/hidden route check verifies observed routing/auth behavior under the stated session and permissions. It must not be claimed as a completed user-facing journey unless the same path is reachable via visible navigation.”

ติดตั้ง slash command โดย copy ไฟล์นี้ไปไว้ที่ `.claude/commands/test-scenario-report.md` ของ target repo แล้วเรียก `/test-scenario-report` ใน Claude Code แบบ interactive

หมายเหตุ: ใน print mode (`claude -p`) slash command แบบ interactive จะไม่ถูกรันโดยตรง ให้ reference ไฟล์ `commands/test-scenario-report.md` หรือ paste prompt จาก command แทน

ต้องรายงานหัวข้อบังคับ: BDA Standard files used, Pipeline trace, Production Read-only Guardrail, Auth/RBAC Matrix, Route Source Trace, Evidence Manifest, Commands run, Verification / Evidence, Limitations / Risks / Next steps
