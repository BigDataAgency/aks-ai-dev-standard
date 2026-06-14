# Command: PM Followup

## ใช้เมื่อ
ต้องการสร้าง follow-up list จาก blocker, next step, priority และ due date

## Copy this into AI

```text
ทำงาน: PM Followup
Context: <วาง project/date/team/scope>
โปรดทำตามขั้นตอนนี้:
1. อ่าน PM log หรือ work events ล่าสุด
2. ดึงรายการที่มี next step, blocker, due date
3. จัด priority และ owner
4. สร้างข้อความ follow-up ที่ส่งได้
5. ส่ง work event ของ command นี้ด้วย `work_type=pm-followup`

Output ที่ต้องส่ง: follow-up list พร้อม owner, priority, due date, message draft

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Checklist
- [ ] มี owner
- [ ] มี priority
- [ ] มี due date ถ้าเกี่ยวข้อง
- [ ] มี message draft ถ้าต้องส่งต่อ
- [ ] ส่ง work event หรือระบุเหตุผลที่ส่งไม่ได้

