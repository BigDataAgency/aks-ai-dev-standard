# Command: Review Change / CR

## ใช้เมื่อ
ต้องการ review change / cr ตามมาตรฐาน BDA

## Copy this into AI

```text
ทำงาน: Review Change / CR
Context: <วาง task/ไฟล์/ลิงก์/ข้อจำกัด>
โปรดทำตามขั้นตอนนี้:
1. อ่าน diff และ requirement
2. หา bug, security, data loss, compatibility, missing test
3. แยก blocking vs suggestion
4. อย่าติ style ถ้าไม่กระทบ

Output ที่ต้องส่ง: รายการ findings พร้อม severity และ file/line ถ้ามี
```

## Checklist
- [ ] อ่าน diff และ requirement
- [ ] หา bug, security, data loss, compatibility, missing test
- [ ] แยก blocking vs suggestion
- [ ] อย่าติ style ถ้าไม่กระทบ

---
ใช้เอกสารนี้เป็นมาตรฐานกลางของ BDA AI Dev Standard ปรับใช้ได้กับมนุษย์และ AI โดยต้องยึดหลัก: เข้าใจงานก่อนทำ, มีแผนสั้น, ทำจริง, ตรวจจริง, ส่งมอบพร้อมหลักฐาน, ไม่อ้างผลลัพธ์ปลอม.
