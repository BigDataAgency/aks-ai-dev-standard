# /test-report

Claude Code slash alias for user-facing Test Report.

ใช้ command หลัก `core/commands/test-report.md` ร่วมกับ QA/product evidence standard `core/commands/test-scenario-report.md`, `core/workflows/test-scenario-report.md`, และ `core/templates/test-scenario-report.md`.

ข้อสำคัญ: workflow นี้ไม่ใช่ performance review, score, KPI, daily performance หรือการประเมินบุคคล ให้ใช้เพื่อเก็บ evidence ของ product/scenario เท่านั้น.

สำหรับ InnoHub หรือ user-facing checks ต้องใช้ visible-menu navigation เป็น default ห้ามใช้ hidden route/direct URL เพื่อ claim user journey เว้นแต่ label ชัดว่าเป็น technical verification only พร้อม route source trace.

ถ้าเป็น production ต้องทำ read-only guardrail ก่อน execute: ห้าม create/edit/delete/approve/reject/upload/import/export/download sensitive docs หรือ action ที่ mutate production เว้นแต่มี explicit scope และ approval ชัดเจน; ถ้าต้อง mutate ให้ mark blocked เช่น `BLOCKED_PRODUCTION_WRITE_RISK` หรือ `BLOCKED_NO_MUTATION`.

ควรสร้างรายงานที่มี test matrix, Auth/RBAC matrix, status Pass / Fail / Info / Limited / Blocked / Not run, blocked reason taxonomy, screenshot paths หรือ MEDIA paths, evidence manifest, URL/environment, route source trace, route drift/SPA 404 checks, role/account type และ test account classification แบบไม่มี credentials, browser/device/viewport, steps, expected/actual, console errors/network failures, PII masking verification, no-mutation/network-write verification, severity, recommendations, limitations และ next steps.

ติดตั้ง slash command โดย copy ไฟล์นี้ไปไว้ที่ `.claude/commands/test-report.md` ของ target repo แล้วเรียก `/test-report` ใน Claude Code แบบ interactive เท่านั้น.

หมายเหตุ: ใน print mode (`claude -p`) slash command แบบ interactive จะไม่ถูกรันโดยตรง ให้ reference ไฟล์ `core/commands/test-report.md` หรือ paste prompt จาก command แทน.

ต้องรายงานหัวข้อบังคับ: BDA Standard files used, Pipeline trace, Production Read-only Guardrail, Auth/RBAC Matrix, Route Source Trace, Evidence Manifest, Commands run, Verification / Evidence, Limitations / Risks / Next steps
