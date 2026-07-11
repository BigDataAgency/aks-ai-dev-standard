# Command: Send Report

Command for safely converting or sending a BDA AI Dev Test Report / test-scenario-report to InnoHub using the SOP `docs/staff-report-sender-sop.md`.

## ใช้เมื่อ

ต้องการให้ Staff AI ช่วยทำ dry-run หรือ remote send ของ BDA AI Dev report summary ไปยัง InnoHub โดยไม่เปิดเผย token, production endpoint, raw payload secrets, หรือ PII.

## Mapping

- Staff command name: `send-report`
- SOP/source of truth: `docs/staff-report-sender-sop.md`
- Connector script: `scripts/send-ingest-report.mjs`
- Test Report command: `commands/test-report.md`
- Internal report workflow: `commands/test-scenario-report.md`, `workflows/test-scenario-report.md`, `templates/test-scenario-report.md`

## Evidence guardrail

ห้าม paste raw token, Authorization header, production endpoint, customer PII, raw payload secret, หรือ private dashboard data ลงใน public repo/chat/Obsidian. ถ้าหลักฐานยังไม่มี ให้ mark เป็น `pending evidence`; ห้ามเดา `event_id`, endpoint, dashboard status, token/cost หรือผลตรวจ.

## Copy this into AI

```text
ทำงาน: Send Report
Context: <วาง path report ที่ต้องส่ง, project, endpoint/token source แบบ placeholder หรือบอกว่ามี private env แล้ว, tenant ถ้ามี>
โปรดทำตามขั้นตอนนี้:
1. อ่านและใช้ SOP `docs/staff-report-sender-sop.md`
2. ตรวจ report ว่าไม่มี raw token, secret, PII/customer/payment data หรือ production endpoint ที่ไม่ควรเผยแพร่
3. รัน dry-run ก่อนเสมอ: npm run ingest:report -- --file <report path>
4. ถ้าจะส่งจริง ต้องมี explicit --send และ endpoint/token source จาก private env หรือ token-file เท่านั้น; ห้ามขอ/พิมพ์ raw token ใน chat
5. หลังส่งจริง ให้รายงานเฉพาะ mode/status/event_id แบบ redacted และให้ InnoHub owner/admin verify ที่ /admin/bda-standard-ingest
6. ถ้าไม่มีสิทธิ์หรือไม่มี private config ให้หยุดที่ dry-run แล้วระบุ next step ให้ owner/admin

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Checklist

- [ ] อ่าน `docs/staff-report-sender-sop.md`
- [ ] Dry-run ก่อนส่งจริง
- [ ] ไม่เปิดเผย raw token/Authorization header
- [ ] ไม่ commit production endpoint; ใช้ `example.com` หรือ `localhost` ใน public examples
- [ ] ไม่ส่ง raw payload secrets หรือ unredacted PII
- [ ] Remote send ใช้ explicit `--send` เท่านั้น
- [ ] บันทึก `event_id` เฉพาะเมื่อ endpoint ส่งกลับจริง
- [ ] Owner/admin verify ที่ `/admin/bda-standard-ingest`

## Required report sections

ทุกครั้งที่ใช้ command นี้ ต้องส่งรายงานท้ายงานเป็นภาษาไทยและมีหัวข้อเหล่านี้ครบถ้วน:

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `commands/send-report.md`, `docs/staff-report-sender-sop.md`, `commands/test-report.md`
2. **Pipeline trace** — Understand → Plan → Execute → Verify → Handoff พร้อม command/workflow ที่ใช้จริง
3. **Commands run** — คำสั่ง/tool/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รัน remote send ให้ระบุเหตุผล
4. **Verification / Evidence** — หลักฐานจริง เช่น dry-run output shape, redacted send status/event_id, owner dashboard verification หรือ `pending evidence`
5. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง และสิ่งที่ต้องตามต่อ เช่น owner verification หรือ credential setup

---
ใช้ `send-report` เป็นชื่อปกติสำหรับทีม; รายละเอียดการใช้งานและ troubleshooting อยู่ใน `docs/staff-report-sender-sop.md`.
