# Update Policy

Repo นี้คือ source of truth สำหรับ BDA AI Dev Standard

## กติกา
- Future updates ต้องเริ่มจาก repo นี้ก่อน
- ห้ามแก้สำเนาในเครื่องมืออื่นแล้วถือเป็น canonical โดยไม่ sync กลับ repo นี้
- ทุก change ควรมีเหตุผล, วันที่, ผู้แก้ และผลกระทบ
- Employee-facing files ต้องใช้ถ้อยคำ neutral และไม่อ้างแหล่งภายนอก
- ถ้ามีการ adapt แนวคิดหรือไฟล์ที่มี license ให้ใส่ใน `THIRD_PARTY_NOTICES.md`

## Release flow
1. แก้ใน branch หรือ commit ที่ชัดเจน
2. Review ด้วย `commands/review-change.md`
3. Verify ด้วย `commands/verify-work.md`
4. Tag หรือประกาศ version ถ้าเป็น update ใหญ่
5. Rollout ไปยัง AI tools / team docs จาก repo นี้เท่านั้น
