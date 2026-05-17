# Workflow: Test Scenario Report

## ใช้เมื่อ

ใช้ workflow นี้เมื่อต้องการทำ test case / scenario แบบ QA หรือ product evidence, capture screenshot, ตรวจ console/log, แล้วสรุปเป็นรายงาน Markdown ที่ตรวจสอบย้อนหลังได้

## ขอบเขต

- ใช้สำหรับ QA/product evidence ของระบบ หน้า UI, user journey, acceptance scenario, regression scenario, UAT support หรือ demo readiness
- ไม่ใช่ Employee Daily Log v5
- ไม่ใช่ performance review, score, KPI, daily performance หรือการประเมินบุคคล
- รายงานนี้วัดคุณภาพของ product/scenario ตาม evidence ที่ตรวจจริง ไม่ใช้ประเมินผลงานรายบุคคล

## Input ที่ต้องมี

- Project/repo หรือ environment ที่จะทดสอบ
- URL/base URL และ environment เช่น local, staging, production-read-only
- Role/account/test data ที่ใช้ โดย mask secret/token/password เสมอ
- Scenario list หรือ acceptance criteria
- Screenshot output directory เช่น `reports/test-scenario-report/<date>-<slug>/screenshots/`
- ข้อจำกัด เช่น ห้ามเขียนข้อมูลจริง, ห้ามเรียก payment จริง, production read-only เท่านั้น

## Navigation rule สำหรับ user-facing checks

สำหรับ InnoHub หรือระบบ user-facing ให้ใช้ visible-menu navigation เป็น default:

1. เริ่มจาก URL/entry point ที่ผู้ใช้จริงเข้าถึงได้
2. เดินผ่านเมนู ปุ่ม ลิงก์ breadcrumb หรือ search ที่มองเห็นได้บนหน้าจอ
3. ห้ามเปิด hidden route/direct URL เพื่อ claim ว่า user journey ผ่าน เว้นแต่ระบุชัดว่าเป็น **technical verification only**
4. ถ้าจำเป็นต้องใช้ direct URL ให้บันทึกเหตุผล, route, และ label ภาพ/ผลลัพธ์ว่า technical verification ไม่ใช่ user-facing journey evidence

## Steps

1. **Understand** — อ่าน task, scenario, acceptance criteria, role, URL, environment, data constraints และ privacy/security constraints
2. **Plan** — สร้าง test matrix: scenario ID, priority, role, entry point, steps, expected result, screenshot checkpoints, data needed
3. **Prepare evidence folder** — สร้างโฟลเดอร์รายงานและ screenshot ตามชื่อที่สื่อความหมาย เช่น `reports/test-scenario-report/2026-05-17-checkout/`
4. **Execute scenario** — รัน scenario ทีละข้อ โดยใช้ visible-menu navigation สำหรับ user-facing checks และจด actual result ทุกขั้น
5. **Capture screenshot** — capture ภาพที่ checkpoint สำคัญ: start state, key action, validation/error state, success/final state; ตั้งชื่อไฟล์ด้วย scenario ID และ step เช่น `TC-001-03-submit-success.png`
6. **Collect diagnostics** — เก็บ console errors, network/API failures ที่เกี่ยวข้อง, server log snippet ถ้ามี, browser/device/viewport
7. **Assess result** — กำหนด pass/fail/blocked/not run ต่อ scenario พร้อม severity และ recommendation; ห้ามอ้างว่าผ่านถ้าไม่ได้ตรวจจริง
8. **Generate report** — ใช้ `templates/test-scenario-report.md` เพื่อสรุป test matrix, screenshot evidence, issues, recommendations และ limitations
9. **Verify report quality** — ตรวจว่าทุก screenshot path/link เปิดได้, expected/actual ครบ, console errors ไม่ถูกละเลย, และมี BDA required sections
10. **Handoff** — ส่งรายงานพร้อม path/link ของไฟล์ Markdown และ screenshot evidence

## Screenshot evidence rules

- ใช้ path หรือ link ที่ตรวจเปิดได้จริง; ถ้าเป็น local media สำหรับ Telegram/handoff ให้ใช้ `MEDIA:/absolute/path/to/file` เมื่อเหมาะสม
- ห้าม crop/แก้ภาพจนทำให้ evidence misleading
- Mask PII, secret, token, password, payment data และข้อมูลลูกค้าจริง
- ภาพทุกภาพควรมี caption: scenario ID, step, URL/page, expected/actual, timestamp โดยประมาณ

## Report minimum fields

รายงานต้องมีอย่างน้อย:

- Environment, URL, build/version/commit ถ้ามี
- Tester/agent/tool และวันที่เวลา
- Role/account type โดยไม่เปิดเผย secret
- Browser/device/viewport
- Test matrix พร้อม status: Pass / Fail / Blocked / Not run
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

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `commands/test-scenario-report.md`, `workflows/test-scenario-report.md`, `templates/test-scenario-report.md`, `policies/evidence-verification.md`
2. **Pipeline trace** — ลำดับขั้นตอนที่ทำจริงตั้งแต่ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้ในแต่ละช่วง
3. **Commands run** — คำสั่ง shell/tool/browser automation/test/lint/build/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันคำสั่ง ให้ระบุ `ไม่ได้รัน` และเหตุผล
4. **Verification / Evidence** — หลักฐานผลตรวจจริง เช่น report path, screenshot paths, console log, test output, manual check, link
5. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง สิ่งที่ยังไม่ได้ตรวจ หรือขั้นตอนถัดไป

---
ใช้ workflow นี้เป็น QA/product evidence workflow ที่แยกจาก Employee Daily Log v5 และ performance evaluation โดยยึดหลัก: ตรวจจริง, capture จริง, รายงานจริง, ไม่อ้าง evidence ปลอม.
