# Command: PM Standup

## ใช้เมื่อ
ต้องการเตรียม daily standup หรือ team checkpoint จาก work events

## Copy this into AI

```text
ทำงาน: PM Standup
Context: <วาง project/date/team/scope>
โปรดทำตามขั้นตอนนี้:
1. อ่าน `channels/llm-local/docs/ai-work-event-logging.md`
2. อ่าน PM log หรือ work events ล่าสุด
3. สรุปสิ่งที่แต่ละ project ทำเสร็จ กำลังทำ และติด blocker
4. สร้าง follow-up list พร้อม owner และ due date
5. ส่ง work event ของ command นี้ด้วย `work_type=pm-standup`

Output ที่ต้องส่ง: standup brief พร้อม done/in-progress/blocked/follow-up

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Checklist
- [ ] สรุป done/in-progress/blocked
- [ ] มี follow-up owner
- [ ] มี due date ถ้าเกี่ยวข้อง
- [ ] ส่ง work event หรือระบุเหตุผลที่ส่งไม่ได้

