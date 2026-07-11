# Command: PM Risk

## ใช้เมื่อ
ต้องการวิเคราะห์ risk, blocker, dependency และ mitigation ของ project

## Copy this into AI

```text
ทำงาน: PM Risk
Context: <วาง project/date/team/scope>
โปรดทำตามขั้นตอนนี้:
1. อ่าน `channels/llm-local/docs/ai-work-event-logging.md`
2. อ่าน events ที่ status เป็น blocked/failed หรือมี blocker
3. จัดกลุ่ม risk ตาม project, owner, dependency
4. เสนอ mitigation, owner, next step, due date
5. ส่ง work event ของ command นี้ด้วย `work_type=pm-risk`

Output ที่ต้องส่ง: risk register สั้น พร้อม mitigation และ owner

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Checklist
- [ ] ระบุ risk/blocker
- [ ] ระบุ owner/dependency
- [ ] ระบุ mitigation
- [ ] ระบุ next step/due date
- [ ] ส่ง work event หรือระบุเหตุผลที่ส่งไม่ได้

