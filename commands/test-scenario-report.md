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
3. สร้าง test matrix: scenario ID, priority, role, entry point, steps, expected result, screenshot checkpoints
4. สำหรับ InnoHub/user-facing checks ให้ใช้ visible-menu navigation เป็น default; ห้ามใช้ hidden route/direct URL เว้นแต่ label เป็น technical verification only
5. รัน scenario ทีละข้อใน environment ที่ระบุ โดยเคารพ data/privacy/production constraints
6. Capture screenshot ที่ checkpoint สำคัญและตั้งชื่อไฟล์ให้ trace กลับไปยัง scenario/step ได้
7. ตรวจ console errors, network/API failures, URL, browser/device/viewport และบันทึก actual result
8. สร้างรายงาน Markdown จาก `templates/test-scenario-report.md` พร้อม test matrix, pass/fail/blocked/not run, expected/actual, screenshot evidence, severity, recommendations, limitations
9. Verify ว่า screenshot paths/links เปิดได้จริงและ report มีหัวข้อ BDA required sections ครบ

Output ที่ต้องส่ง: path/link ของรายงาน Markdown, screenshot evidence paths หรือ MEDIA paths, summary ของ scenario status และ next steps

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Suggested output paths

- Report: `reports/test-scenario-report/<YYYY-MM-DD>-<slug>/report.md`
- Screenshots: `reports/test-scenario-report/<YYYY-MM-DD>-<slug>/screenshots/`
- Screenshot name: `<SCENARIO-ID>-<STEP-NO>-<short-state>.png`, เช่น `TC-001-03-submit-success.png`

## Checklist

- [ ] Scope เป็น QA/product evidence ไม่ใช่ Employee v5/performance
- [ ] ระบุ URL/environment/build/version/commit ถ้ามี
- [ ] ระบุ role/account type โดยไม่เปิดเผย secret
- [ ] ระบุ browser/device/viewport
- [ ] สร้าง test matrix ก่อน execute
- [ ] ใช้ visible-menu navigation สำหรับ user-facing checks
- [ ] Label direct URL/hidden route เป็น technical verification only ถ้ามี
- [ ] Capture screenshot ตาม checkpoints
- [ ] ตรวจ console errors/network failures
- [ ] บันทึก expected vs actual ทุก scenario
- [ ] ระบุ status: Pass / Fail / Blocked / Not run
- [ ] ระบุ severity และ recommendations สำหรับ issue
- [ ] Verify screenshot paths/links เปิดได้จริง
- [ ] Mask PII/secret/token/password/payment data

## Required report sections

ทุกครั้งที่ใช้ command นี้ ต้องส่งรายงานท้ายงานเป็นภาษาไทยและมีหัวข้อเหล่านี้ครบถ้วน:

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `commands/test-scenario-report.md`, `workflows/test-scenario-report.md`, `templates/test-scenario-report.md`, `policies/evidence-verification.md`
2. **Pipeline trace** — ลำดับขั้นตอนที่ทำจริงตั้งแต่ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้ในแต่ละช่วง
3. **Commands run** — คำสั่ง shell/tool/browser automation/test/lint/build/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันคำสั่ง ให้ระบุ `ไม่ได้รัน` และเหตุผล
4. **Verification / Evidence** — หลักฐานผลตรวจจริง เช่น report path, screenshot paths, MEDIA paths, console log, test output, manual check, link
5. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง สิ่งที่ยังไม่ได้ตรวจ หรือขั้นตอนถัดไป

---
ใช้เอกสารนี้เพื่อสร้างรายงาน test scenario พร้อม screenshot evidence สำหรับ QA/product decision เท่านั้น ไม่ใช้ประเมินผลงานรายบุคคล.
