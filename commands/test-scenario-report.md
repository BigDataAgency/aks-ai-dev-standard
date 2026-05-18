# Command: Test Scenario Report

## ใช้เมื่อ

ต้องการให้ AI/ผู้ช่วย QA ทำ test case / scenario, capture screenshot, ตรวจ console/log, และสร้างรายงาน Markdown พร้อม evidence สำหรับ product/QA decision

## สำคัญ: QA/product evidence ไม่ใช่ performance

Command นี้ใช้ตรวจคุณภาพ product/scenario เท่านั้น:

- ไม่ใช่ Employee Daily Log v5
- ไม่ใช่ performance review, score, KPI, daily performance หรือการประเมินบุคคล
- ห้ามใช้ผลรายงานนี้เป็นหลักฐานประเมินรายบุคคลโดยตรง
- ถ้าระบุ role/team ให้ใช้เพื่อเข้าใจ testing context เท่านั้น

## Copy this into AI

```text
ทำงาน: Test Scenario Report สำหรับ QA/product evidence
Context: <วาง URL/environment, role/account type, scenario list หรือ acceptance criteria, constraints, output folder ที่ต้องการ>
โปรดทำตามขั้นตอนนี้:
1. อ่าน `workflows/test-scenario-report.md` และ `templates/test-scenario-report.md`
2. ยืนยัน scope ว่าเป็น QA/product evidence ไม่ใช่ Employee Daily Log v5 หรือ performance evaluation
3. ถ้าเป็น production ให้ทำ Production Read-only Guardrail Checklist ก่อน execute: ห้าม create/edit/delete/approve/reject/upload/import/export/download sensitive docs เว้นแต่ระบุใน scope และได้รับอนุญาตชัดเจน
4. ระบุ test account classification โดยไม่ใส่ credentials: real user / synthetic test account / impersonation / limited-role / no credentials และระบุ role/permission เท่าที่ใช้ตรวจ
5. สร้าง test matrix: scenario ID, priority, role/account class, route source trace, entry point, steps, expected result, screenshot checkpoints, no-mutation criteria
6. สำหรับ InnoHub/user-facing checks ให้ใช้ visible-menu navigation เป็น default; ห้ามใช้ hidden route/direct URL เพื่อ claim user journey เว้นแต่ label เป็น technical verification only
7. รัน scenario ทีละข้อใน environment ที่ระบุ โดยเคารพ data/privacy/production constraints และหยุดเมื่อมี production write risk หรือ PII masking risk
8. Capture screenshot ที่ checkpoint สำคัญ ตั้งชื่อไฟล์ให้ trace กลับไปยัง scenario/step ได้ และ verify PII masking ก่อนแชร์/แนบ
9. ตรวจ console errors, network/API failures, HTTP status, final URL, app-level 404/SPA 404, browser/device/viewport และบันทึก actual result
10. สร้างรายงาน Markdown จาก `templates/test-scenario-report.md` พร้อม test matrix, Auth/RBAC matrix, route source trace, route drift/SPA 404 check, pass/fail/blocked/not run, blocked reason taxonomy, evidence manifest, severity, recommendations, limitations
11. Verify ว่า screenshot paths/links เปิดได้จริง, report ไม่มี secret/PII ที่ไม่ mask, และ report มีหัวข้อ BDA required sections ครบ

Output ที่ต้องส่ง: path/link ของรายงาน Markdown, screenshot evidence paths หรือ MEDIA paths, summary ของ scenario status และ next steps

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Production Read-only Guardrail, Auth/RBAC Matrix, Route Source Trace, Evidence Manifest, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Suggested output paths

- Report: `reports/test-scenario-report/<YYYY-MM-DD>-<slug>/report.md`
- Screenshots: `reports/test-scenario-report/<YYYY-MM-DD>-<slug>/screenshots/`
- Screenshot name: `<SCENARIO-ID>-<STEP-NO>-<short-state>.png`, เช่น `TC-001-03-submit-success.png`

## Checklist

- [ ] Scope เป็น QA/product evidence ไม่ใช่ Employee v5/performance
- [ ] ระบุ URL/environment/build/version/commit ถ้ามี
- [ ] ถ้าเป็น production ให้ยืนยัน read-only/no-mutation guardrail ก่อน execute
- [ ] ห้าม create/edit/delete/approve/reject/upload/import/export/download sensitive docs บน production เว้นแต่มี explicit scope
- [ ] ระบุ role/account type และ test account classification โดยไม่เปิดเผย secret/credential
- [ ] ระบุ browser/device/viewport
- [ ] สร้าง test matrix ก่อน execute
- [ ] เพิ่ม Auth/RBAC matrix สำหรับ unauthenticated/authenticated/role ที่เกี่ยวข้อง
- [ ] ใช้ visible-menu navigation สำหรับ user-facing checks
- [ ] Label direct URL/hidden route เป็น technical verification only ถ้ามี
- [ ] ระบุ route source trace: visible menu / direct URL / source code route / old docs / browser redirect / deployed bundle
- [ ] ตรวจ route drift และ SPA 404: HTTP status, final URL, app-level 404/blank/crash
- [ ] Capture screenshot ตาม checkpoints
- [ ] Verify screenshot PII masking ก่อนแนบหรือแชร์
- [ ] ตรวจ console errors/network failures
- [ ] บันทึก expected vs actual ทุก scenario
- [ ] ระบุ status: Pass / Fail / Info / Limited / Blocked / Not run และ pass/fail criteria สำหรับ no mutation/network write
- [ ] ใช้ blocked reason taxonomy เช่น `BLOCKED_NO_CREDENTIALS`, `BLOCKED_NO_ROLE`, `BLOCKED_PRODUCTION_WRITE_RISK`, `BLOCKED_PII_MASKING_REQUIRED`, `BLOCKED_ROUTE_DRIFT`
- [ ] ระบุ severity และ recommendations สำหรับ issue
- [ ] ทำ evidence manifest พร้อม screenshot labels, console summary, network summary
- [ ] Verify screenshot paths/links เปิดได้จริง
- [ ] Mask PII/secret/token/password/payment data

## Required report sections

ทุกครั้งที่ใช้ command นี้ ต้องส่งรายงานท้ายงานเป็นภาษาไทยและมีหัวข้อเหล่านี้ครบถ้วน:

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `commands/test-scenario-report.md`, `workflows/test-scenario-report.md`, `templates/test-scenario-report.md`, `policies/evidence-verification.md`
2. **Pipeline trace** — ลำดับขั้นตอนที่ทำจริงตั้งแต่ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้ในแต่ละช่วง
3. **Commands run** — คำสั่ง shell/tool/browser automation/test/lint/build/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันคำสั่ง ให้ระบุ `ไม่ได้รัน` และเหตุผล
4. **Verification / Evidence** — หลักฐานผลตรวจจริง เช่น report path, screenshot paths, MEDIA paths, console log, test output, manual check, link
5. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง สิ่งที่ยังไม่ได้ตรวจ หรือขั้นตอนถัดไป

## Standard wording สำหรับ direct URL / technical verification only

เมื่อเปิด route โดยตรงหรือ route ที่ไม่มาจาก visible menu ให้ใช้ wording นี้หรือเทียบเท่า:

> Technical verification only: this direct URL/hidden route check verifies observed routing/auth behavior under the stated session and permissions. It must not be claimed as a completed user-facing journey unless the same path is reachable via visible navigation.

ภาษาไทย:

> ตรวจเชิงเทคนิคเท่านั้น: การเปิด direct URL/hidden route นี้ใช้ยืนยันพฤติกรรม routing/auth ตาม session และสิทธิ์ที่ระบุ ห้ามนับเป็น user journey ที่ผ่านแล้ว เว้นแต่ผู้ใช้เข้าถึง path เดียวกันได้ผ่านเมนู/ลิงก์ที่มองเห็นจริง

---
ใช้เอกสารนี้เพื่อสร้างรายงาน test scenario พร้อม screenshot evidence สำหรับ QA/product decision เท่านั้น ไม่ใช้ประเมินผลงานรายบุคคล.
