# Command: PM Status

## ใช้เมื่อ
ต้องการสร้าง project status update สำหรับผู้บริหาร ลูกค้า หรือ stakeholder

## Copy this into AI

```text
ทำงาน: PM Status
Context: <วาง project/date/audience/scope>
โปรดทำตามขั้นตอนนี้:
1. อ่าน `channels/llm-local/docs/ai-work-event-logging.md`
2. อ่าน work events และ PM log ที่เกี่ยวข้อง
3. สรุป progress, blocker, risk, next step
4. แยก internal note กับ stakeholder-safe summary
5. ระบุข้อมูลที่ยังขาดหรือ coverage gap
6. ส่ง work event ของ command นี้ด้วย `work_type=pm-status`

Output ที่ต้องส่ง: project status update พร้อม progress/blocker/risk/next step

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Checklist
- [ ] มี progress summary
- [ ] มี blocker/risk ถ้ามี
- [ ] มี next step
- [ ] แยก stakeholder-safe wording ถ้าต้องส่งออกนอกทีม
- [ ] ส่ง work event หรือระบุเหตุผลที่ส่งไม่ได้

