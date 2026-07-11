# Workflow: Test Scenario Report

## ใช้เมื่อ

ใช้ workflow นี้เมื่อต้องการทำ test case / scenario แบบ QA หรือ product evidence, capture screenshot, ตรวจ console/log, แล้วสรุปเป็นรายงาน Markdown ที่ตรวจสอบย้อนหลังได้

## ขอบเขต

- ใช้สำหรับ QA/product evidence ของระบบ หน้า UI, user journey, acceptance scenario, regression scenario, UAT support หรือ demo readiness
- ไม่ใช่ performance review, score, KPI, daily performance หรือการประเมินบุคคล
- รายงานนี้วัดคุณภาพของ product/scenario ตาม evidence ที่ตรวจจริง ไม่ใช้ประเมินผลงานรายบุคคล

## Input ที่ต้องมี

- Project/repo หรือ environment ที่จะทดสอบ
- URL/base URL และ environment เช่น local, staging, production-read-only
- Role/account/test data ที่ใช้ โดย mask secret/token/password เสมอ และ classify account เป็น real / synthetic test / impersonation / limited-role / no credentials
- Scenario list หรือ acceptance criteria
- Screenshot output directory เช่น `reports/test-scenario-report/<date>-<slug>/screenshots/`
- ข้อจำกัด เช่น ห้ามเขียนข้อมูลจริง, ห้ามเรียก payment จริง, production read-only เท่านั้น, ห้าม export/download sensitive docs


## Production read-only guardrail checklist

ใช้ checklist นี้ก่อน execute ทุกครั้งเมื่อ environment เป็น production หรือมีข้อมูลจริง:

- [ ] ยืนยัน environment และ base URL ว่าเป็น production / staging / local
- [ ] ระบุ allowed actions ชัดเจน เช่น view-only, navigation-only, no submit, no mutation, no network write
- [ ] ห้าม create / edit / delete / approve / reject / upload / import / export / download sensitive documents บน production เว้นแต่มี explicit scope และ approval
- [ ] ห้าม bypass auth/session, seed session เอง, ใช้ credential ที่ไม่ได้รับอนุญาต หรือ impersonate โดยไม่มี scope
- [ ] หากพบ form/action ที่อาจ mutate production ให้หยุดก่อน submit และ mark เป็น `BLOCKED_PRODUCTION_WRITE_RISK` หรือ `PASS_NO_MUTATION` ตาม evidence
- [ ] หาก screenshot มี PII/secret/customer/payment data ให้ mask ก่อนแชร์ หรือ mark เป็น `BLOCKED_PII_MASKING_REQUIRED`

## Navigation rule สำหรับ user-facing checks

สำหรับ InnoHub หรือระบบ user-facing ให้ใช้ visible-menu navigation เป็น default:

1. เริ่มจาก URL/entry point ที่ผู้ใช้จริงเข้าถึงได้
2. เดินผ่านเมนู ปุ่ม ลิงก์ breadcrumb หรือ search ที่มองเห็นได้บนหน้าจอ
3. ห้ามเปิด hidden route/direct URL เพื่อ claim ว่า user journey ผ่าน เว้นแต่ระบุชัดว่าเป็น **technical verification only**
4. ถ้าจำเป็นต้องใช้ direct URL ให้บันทึกเหตุผล, route, และ label ภาพ/ผลลัพธ์ว่า technical verification ไม่ใช่ user-facing journey evidence

ใช้ wording มาตรฐานสำหรับ direct URL:

> Technical verification only: this direct URL/hidden route check verifies observed routing/auth behavior under the stated session and permissions. It must not be claimed as a completed user-facing journey unless the same path is reachable via visible navigation.

ภาษาไทย:

> ตรวจเชิงเทคนิคเท่านั้น: การเปิด direct URL/hidden route นี้ใช้ยืนยันพฤติกรรม routing/auth ตาม session และสิทธิ์ที่ระบุ ห้ามนับเป็น user journey ที่ผ่านแล้ว เว้นแต่ผู้ใช้เข้าถึง path เดียวกันได้ผ่านเมนู/ลิงก์ที่มองเห็นจริง

## Route source trace และ route drift checks

ทุก scenario ที่อ้าง URL ต้องระบุ route source อย่างน้อยหนึ่งรายการ:

- `VISIBLE_MENU` — เดินจากเมนู/ปุ่ม/ลิงก์ที่ผู้ใช้เห็น
- `DIRECT_URL_USER` — URL ที่ผู้ใช้ให้มาโดยตรง
- `DIRECT_URL_TECHNICAL` — direct URL เพื่อ technical verification only
- `SOURCE_CODE_ROUTE` — route จาก source code เช่น router/App.tsx
- `OLD_DOCS_ROUTE` — route จากเอกสารเก่า/route map ที่อาจ stale
- `BROWSER_REDIRECT` — route ที่เกิดจาก redirect จริงใน browser
- `DEPLOYED_BUNDLE_OBSERVED` — route/asset ที่เห็นจาก deployed app/bundle

สำหรับ SPA/React/Vue/Next user-facing app ให้ตรวจ route drift เมื่อพบ 404, redirect, blank page หรือ route mismatch:

- เทียบ visible menu links กับ source route definitions และเอกสาร route map
- บันทึก HTTP status, final URL, redirect chain เท่าที่ตรวจได้
- แยก app-level/SPA 404 ออกจาก HTTP 404 ของ server
- บันทึกผลเป็น `ROUTE_OK`, `ROUTE_MISSING`, `MENU_DRIFT`, `DOC_DRIFT`, `DEPLOY_DRIFT`, `APP_LEVEL_404`, `HTTP_404`, `BLANK_OR_CRASH`

## Auth/RBAC matrix

เมื่อระบบมี authentication หรือ role-based access control ต้องเพิ่ม matrix อย่างน้อย:

- Role/account class: unauthenticated / real user / synthetic test / impersonation / limited-role / admin / no credentials
- Route/module/action
- Expected access: allow / deny / redirect / read-only / no-mutation
- Actual access: observed behavior, final URL, deny message
- Evidence: screenshot label/path, console/network summary
- Status และ blocked reason ถ้ามี

## Steps

1. **Understand** — อ่าน task, scenario, acceptance criteria, role, URL, environment, data constraints, privacy/security constraints และ explicit production scope
2. **Guardrail** — ถ้าเป็น production ให้ทำ read-only/no-mutation checklist และกำหนด forbidden actions ก่อนเข้า browser/API
3. **Plan** — สร้าง test matrix: scenario ID, priority, role/account class, route source trace, entry point, steps, expected result, screenshot checkpoints, data needed, no-mutation criteria
4. **Prepare evidence folder** — สร้างโฟลเดอร์รายงานและ screenshot ตามชื่อที่สื่อความหมาย เช่น `reports/test-scenario-report/2026-05-17-checkout/`
5. **Execute scenario** — รัน scenario ทีละข้อ โดยใช้ visible-menu navigation สำหรับ user-facing checks และจด actual result ทุกขั้น
6. **Capture screenshot** — capture ภาพที่ checkpoint สำคัญ: start state, key action, validation/error state, success/final state; ตั้งชื่อไฟล์ด้วย scenario ID และ step เช่น `TC-001-03-submit-success.png`; ตรวจ PII masking ก่อนแนบ
7. **Collect diagnostics** — เก็บ console errors, network/API failures ที่เกี่ยวข้อง, HTTP status/final URL/app-level 404, server log snippet ถ้ามี, browser/device/viewport
8. **Assess result** — กำหนด pass/fail/info/limited/blocked/not run ต่อ scenario พร้อม severity, blocked reason และ recommendation; ห้ามอ้างว่าผ่านถ้าไม่ได้ตรวจจริง
9. **Generate report** — ใช้ `core/templates/test-scenario-report.md` เพื่อสรุป test matrix, Auth/RBAC matrix, route source trace, evidence manifest, issues, recommendations และ limitations
10. **Verify report quality** — ตรวจว่าทุก screenshot path/link เปิดได้, PII ถูก mask, expected/actual ครบ, console/network ไม่ถูกละเลย, และมี BDA required sections
11. **Handoff** — ส่งรายงานพร้อม path/link ของไฟล์ Markdown และ screenshot evidence

## Screenshot evidence rules

- ใช้ path หรือ link ที่ตรวจเปิดได้จริง; ถ้าเป็น local media สำหรับ Telegram/handoff ให้ใช้ `MEDIA:/absolute/path/to/file` เมื่อเหมาะสม
- ห้าม crop/แก้ภาพจนทำให้ evidence misleading
- Mask PII, secret, token, password, payment data และข้อมูลลูกค้าจริง
- ภาพทุกภาพควรมี caption/label: scenario ID, step, URL/page, expected/actual, timestamp โดยประมาณ
- ภาพทุกภาพต้องมี PII masking verification: contains PII yes/no/unknown, masking applied yes/no/not needed, safe to share yes/no


## Status, no-mutation criteria, and blocked reason taxonomy

ใช้ status และ reason ให้สม่ำเสมอ:

- `PASS` — ตรวจตาม expected ได้จริงและไม่มี unexpected error
- `FAIL` — actual ไม่ตรง expected หรือพบ defect ที่ยืนยันได้
- `INFO` — ข้อมูลประกอบ เช่น route drift suspicion, bundle hash, behavior ที่ต้องบันทึกแต่ไม่ใช่ defect ที่ยืนยันแล้ว
- `LIMITED` — ตรวจได้บางส่วนเพราะข้อจำกัดของ environment/tool/network
- `PASS_NO_MUTATION` — ตรวจได้แบบไม่ submit/write เช่น page/form/validation/read-only behavior ผ่าน
- `BLOCKED_NO_MUTATION` — scenario ต้อง submit/create/update/delete จึงหยุดตาม no-mutation guardrail
- `BLOCKED_NO_CREDENTIALS` — ไม่มี account/session ที่ได้รับอนุญาต
- `BLOCKED_NO_ROLE` — account ที่มีไม่มี role/permission ที่ต้องใช้
- `BLOCKED_PRODUCTION_WRITE_RISK` — action เสี่ยงเขียน/เปลี่ยน production
- `BLOCKED_PII_MASKING_REQUIRED` — หลักฐานมี PII/secret และยังไม่ mask พอที่จะแชร์
- `BLOCKED_ROUTE_DRIFT` — route/source/menu/doc drift ทำให้ยืนยัน path ไม่ได้
- `NOT_RUN_RISK` — ความเสี่ยงสูงหรือ out of scope จึงไม่ execute

Pass/fail criteria สำหรับ no mutation/network write:

- PASS ได้เฉพาะเมื่อไม่มีการ submit/write และ network summary ไม่พบ request ที่ mutate state โดยไม่ตั้งใจ
- ถ้าจำเป็นต้องกด submit/approve/delete/upload/import/export/download เพื่อยืนยัน expected ให้ mark blocked เว้นแต่ scope อนุญาตชัดเจน
- ต้องบันทึก console/network summary ว่าไม่มี mutation/network write ที่เกี่ยวข้อง หรือระบุสิ่งที่ตรวจไม่ได้

## Report minimum fields

รายงานต้องมีอย่างน้อย:

- Environment, URL, build/version/commit ถ้ามี
- Tester/agent/tool และวันที่เวลา
- Role/account type โดยไม่เปิดเผย secret
- Browser/device/viewport
- Test matrix พร้อม status: Pass / Fail / Info / Limited / Blocked / Not run และ blocked reason ถ้ามี
- Production read-only guardrail checklist ถ้าเกี่ยวข้อง
- Auth/RBAC matrix ถ้าระบบมี login/role
- Route source trace และ route drift/SPA 404 result ถ้าใช้ URL/direct route
- Evidence manifest พร้อม screenshot labels, PII masking status, console/network summary
- Scenario detail: steps, expected, actual, screenshot evidence
- Console errors/network failures
- Severity: Critical / High / Medium / Low / Info
- Recommendations และ next steps
- Limitations และสิ่งที่ยังไม่ได้ verify

## Verification

อย่างน้อยควรตรวจ:

- เปิด report Markdown แล้วเห็นภาพ/link ครบ
- Screenshot files มีอยู่จริงใน path ที่อ้างอิง
- Scenario ที่ fail มี actual result, severity, และ recommendation
- Console errors/network failures ถูกบันทึกหรือระบุว่าไม่พบหลังตรวจจริง
- User-facing scenarios ใช้ visible-menu navigation หรือ label technical verification only อย่างชัดเจน

## Required report sections

ทุกครั้งที่ใช้ workflow นี้ ต้องส่งรายงานท้ายงานเป็นภาษาไทยและมีหัวข้อเหล่านี้ครบถ้วน:

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `core/commands/test-scenario-report.md`, `core/workflows/test-scenario-report.md`, `core/templates/test-scenario-report.md`, `core/policies/evidence-verification.md`
2. **Pipeline trace** — ลำดับขั้นตอนที่ทำจริงตั้งแต่ Understand → Guardrail → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้ในแต่ละช่วง
3. **Production Read-only Guardrail** — checklist/ข้อจำกัด no-mutation/no-network-write และ forbidden actions ถ้า environment มี production หรือ real data
4. **Auth/RBAC Matrix** — role/account class, expected access, actual access, final URL/deny behavior, evidence และ blocked reason ถ้ามี
5. **Route Source Trace** — แหล่งที่มาของ route/URL, visible-menu vs direct URL, route drift และ SPA/HTTP 404 detection
6. **Evidence Manifest** — screenshot labels/paths, PII masking status, console summary, network summary และ no-mutation evidence
7. **Commands run** — คำสั่ง shell/tool/browser automation/test/lint/build/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันคำสั่ง ให้ระบุ `ไม่ได้รัน` และเหตุผล
8. **Verification / Evidence** — หลักฐานผลตรวจจริง เช่น report path, screenshot paths, console log, test output, manual check, link
9. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง สิ่งที่ยังไม่ได้ตรวจ หรือขั้นตอนถัดไป

---
ใช้ workflow นี้เป็น QA/product evidence workflow ที่แยกจาก performance evaluation โดยยึดหลัก: ตรวจจริง, capture จริง, รายงานจริง, ไม่อ้าง evidence ปลอม.
