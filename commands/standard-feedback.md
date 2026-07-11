# Command: Standard Feedback

## ใช้เมื่อ

ต้องการส่ง feedback เพื่อปรับปรุง/แก้ไข/เพิ่มความสามารถของ AKS AI Dev Standard (เดิม BDA AI Dev Standard) เช่น command, workflow, template, policy, Claude/Codex support หรือคำอธิบายที่ทำให้ใช้งานง่ายขึ้น

## สำคัญ: ไม่ใช่ performance

Feedback นี้เป็น product-improvement loop สำหรับมาตรฐานเท่านั้น:

- ไม่ใช่ performance review, score, KPI, หรือการประเมินบุคคล
- ไม่ต้องนำไปคิด daily performance หรือรายงานผลงานรายบุคคล
- role/team เป็นข้อมูล optional เพื่อเข้าใจ context ของการใช้งาน ไม่ใช่เพื่อประเมินคน

## Copy this into AI

```text
ทำงาน: Standard Feedback สำหรับ AKS AI Dev Standard
Context: <วาง feedback, scenario, command/workflow/template ที่เกี่ยวข้อง, expected/actual, evidence เท่าที่ปลอดภัย>
โปรดทำตามขั้นตอนนี้:
1. แยก feedback นี้ออกจาก performance evaluation อย่างชัดเจน
2. จัดประเภท feedback: bug report, confusion, missing command, feature request, scenario request, adoption friction, AI output issue, หรืออื่น ๆ
3. ระบุ standard file ที่เกี่ยวข้อง เช่น commands/..., workflows/..., templates/..., policies/..., claude/...
4. สรุป expected vs actual และ evidence ที่มี
5. เสนอ improvement ที่ actionable และ impact โดยไม่ประเมินผลงานบุคคล
6. ถ้าจะสร้าง issue/PR ให้ใช้ templates/standard-feedback.md

Output ที่ต้องส่ง: standard feedback summary หรือ issue/PR draft

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Checklist

- [ ] ยืนยันว่า feedback นี้เกี่ยวกับ AKS AI Dev Standard ไม่ใช่ performance
- [ ] ระบุประเภท feedback
- [ ] ระบุ command/workflow/template/policy/tool support ที่เกี่ยวข้อง
- [ ] ระบุ expected behavior
- [ ] ระบุ actual behavior/problem
- [ ] แนบ evidence ที่ไม่เปิดเผยข้อมูลลับ
- [ ] เสนอ improvement หรือ acceptance criteria
- [ ] ระบุ urgency/impact ต่อการใช้ standard

## Required report sections

ทุกครั้งที่ใช้ command นี้ ต้องส่งรายงานท้ายงานเป็นภาษาไทยและมีหัวข้อเหล่านี้ครบถ้วน:

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `FEEDBACK.md`, `commands/standard-feedback.md`, `workflows/standard-improvement.md`, `templates/standard-feedback.md`, `STANDARD.md`, `UPDATE-POLICY.md`
2. **Pipeline trace** — ลำดับขั้นตอนที่ทำจริงตั้งแต่ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้ในแต่ละช่วง
3. **Commands run** — คำสั่ง shell/tool/test/lint/build/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันคำสั่ง ให้ระบุ `ไม่ได้รัน` และเหตุผล
4. **Verification / Evidence** — หลักฐานผลตรวจจริง เช่น feedback text, issue/PR draft, diff, link, manual check
5. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง สิ่งที่ยังไม่ได้ตรวจ หรือขั้นตอนถัดไป

---
ใช้เอกสารนี้เป็นช่องทาง feedback สำหรับปรับปรุง AKS AI Dev Standard เท่านั้น ไม่ใช้เป็นหลักฐานประเมินผลงานรายบุคคล.
