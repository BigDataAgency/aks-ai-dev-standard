# Command: PM Log

## ใช้เมื่อ
ต้องการรวม daily project log จาก AI work events เพื่อให้ PM lead ใช้ project management ต่อได้ โดยไม่ต้องไล่ขอ daily log จากพนักงาน

## Copy this into AI

```text
ทำงาน: PM Log
Context: <วาง project/date/team/scope>
โปรดทำตามขั้นตอนนี้:
1. อ่าน `docs/ai-work-event-logging.md`
2. ดึงหรืออ่าน daily work events ของวันที่ต้องการ
3. สรุป project activity ตาม project และ owner
4. แยก done, in-progress, blocked, failed
5. สรุป blocker, risk, next step, due date
6. รายงาน coverage gap ถ้ามี employee/project ที่ไม่มี work event
7. ส่ง work event ของ command นี้ด้วย `work_type=pm-log`

Output ที่ต้องส่ง: PM daily project log พร้อม project activity, blocker, next step, due date, coverage gap

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Checklist
- [ ] อ่าน work event source ของวันที่ต้องการ
- [ ] สรุป project activity ตาม project และ owner
- [ ] แยก blocker/risk/next step
- [ ] ระบุ coverage gap
- [ ] ส่ง work event หรือระบุเหตุผลที่ส่งไม่ได้

