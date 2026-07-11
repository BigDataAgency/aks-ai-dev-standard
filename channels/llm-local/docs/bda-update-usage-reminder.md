# BDA Update Usage Reminder

ใช้ข้อความนี้เป็น reminder หลัง `bda update` และใช้อ้างอิงใน `bda help` แบบสั้น จุดประสงค์คือให้พนักงานรู้กติกาหลังใช้ hybrid local GPU + paid cloud โดยไม่ต้อง clone หรือ pull repo เอง

## สำหรับพนักงาน

- ใช้ `bda update` ก็พอ ไม่ต้อง clone/pull repo เอง
- คนที่เคยติดตั้งแล้ว ห้าม install ใหม่เอง ให้ใช้ `bda update` หรือ updater เดิมเท่านั้น เพื่อไม่ให้ key/config/PATH ซ้อนกัน
- ใช้ `bda help` เพื่อกลับมาอ่าน command และกติกาสั้น ๆ ได้เสมอ
- ถ้างานต้องอ่านเยอะ ให้เริ่มจาก `bda start` แล้วเลือก command ให้ชัด
- Maintainer/contributor เท่านั้นที่ต้อง clone repo เพื่อแก้ standard/CLI/docs

## ข้อห้าม / กติกาสั้น

1. ห้าม install ใหม่เองถ้าเคยติดตั้งแล้ว  
   ให้ใช้ `bda update` หรือ updater เดิม ถ้า update มีปัญหาให้ส่ง `where.exe bda` หรือ `Get-Command bda` + error ให้ lead

2. ห้าม scan codebase ทั้งหมดซ้ำใน task เดิม  
   ให้ scan ครั้งเดียวต่อ task หลังจากนั้นใช้ targeted search ตาม path/module/error

3. ห้ามเปิดหลาย agent ใน repo/task เดียวกัน  
   หนึ่งงานควรมี active agent เดียว ถ้าต้องแยกงานให้แยก module ชัดเจน

4. ห้ามใช้ session เก่าข้ามวันสำหรับงานจริง  
   จบวันหรือจบงานให้ handoff แล้ว `bda stop`

5. ห้าม retry 400/500/502 ซ้ำหลายรอบโดยไม่เปลี่ยนข้อมูล  
   ให้ส่ง error text + เวลา + employee code + command ที่ทำให้เกิด error

6. ห้ามส่ง repo/log/chat history ทั้งก้อน  
   ส่งเฉพาะ path, command, error, expected result, actual result

7. ห้ามส่ง context ใหญ่ซ้ำเพื่อให้ระบบ paid รับแทน  
   ถ้า context/prompt ใหญ่เกินประมาณ 25K tokens หรือ local queue เกิน 20s ระบบจะย้ายออกจาก A40 ไป paid และบันทึก employee/session/task/reason comment ไว้เพื่อ feedback ให้ปรับวิธีทำงาน

8. ห้ามใช้ paid เป็น default สำหรับงานเล็ก  
   งานเล็กเริ่ม local/auto ก่อน paid ใช้เมื่อ queue สูง งานยาก หรือ final review สำคัญ

9. ห้ามให้ AI claim ว่า build/lint/test ผ่าน ถ้าไม่ได้รันจริง  
   ต้องมี command output หรือ manual evidence

10. ห้ามถามงานกว้าง เช่น "ดูให้หน่อย", "ทำต่อ", "แก้ให้หมด"  
   ต้องระบุ project, task, path/error, success criteria, และ command ที่ใช้

## ข้อความสำหรับแสดงหลัง `bda update`

```text
BDA AI Dev updated / usage reminder

สำหรับพนักงาน:
  - ใช้ bda update ก็พอ ไม่ต้อง clone/pull repo เอง
  - คนที่เคยติดตั้งแล้ว ห้าม install ใหม่เอง; ถ้า update มีปัญหาให้ส่ง where.exe bda หรือ Get-Command bda + error ให้ lead
  - ใช้ bda help เพื่อกลับมาอ่าน command และกติกาสั้น ๆ ได้เสมอ
  - ถ้างานต้องอ่านเยอะ ให้เริ่มจาก bda start แล้วเลือก command ให้ชัด

กติกาหลังใช้ hybrid local GPU + paid cloud:
  - คนที่เคยติดตั้งแล้ว ห้าม install ใหม่เอง; ใช้ updater เดิมเพื่อรักษา key/config/PATH
  - scan codebase ครั้งเดียวต่อ task; หลังจากนั้นใช้ targeted search
  - อย่าเปิดหลาย agent ใน repo/task เดียวกัน
  - อย่าใช้ session เก่าข้ามวัน; จบวันให้ handoff แล้ว bda stop
  - เจอ 400/500/502 อย่า retry ซ้ำหลายรอบ; ส่ง error text + เวลา + employee code
  - อย่าส่ง repo/log/chat history ทั้งก้อน; ส่งเฉพาะ path/command/error/expected/actual
  - ถ้า context/prompt ใหญ่เกินประมาณ 25K tokens หรือ local queue เกิน 20s ระบบจะย้ายออกจาก A40 ไป paid และบันทึก employee/session/task/reason ไว้เพื่อ feedback
  - อย่าส่ง context ใหญ่ซ้ำเพื่อให้ระบบ paid รับแทน; ให้สรุป/แบ่ง phase/ใช้ subscription AI วางแผนก่อน
  - งานเล็กเริ่ม local/auto ก่อน; paid ใช้เมื่อ queue สูง งานยาก หรือ final review สำคัญ

สำหรับ maintainer/contributor:
  - public repo คือ source of truth ของ standard + CLI client
  - private installer เก็บเฉพาะ key, gateway URL, employee config, และ model route
  - ไม่มี key/config ก็เข้า BDA gateway/A40 ไม่ได้

อ่านละเอียด:
  - docs/bda-update-usage-reminder.md
  - docs/hybrid-ai-usage-discipline.md
  - docs/open-source-ai-dev-deployment-guide.md
  - docs/bda-session-cli.md
```

## Slack แบบสั้น

```text
หลัง bda update:
- พนักงานไม่ต้อง clone/pull repo ใช้ bda update พอ
- คนที่เคยติดตั้งแล้วไม่ต้อง install ใหม่ ถ้ามีปัญหาให้ส่ง where.exe bda หรือ Get-Command bda + error
- กลับมาอ่านกติกาได้ที่ bda help
- scan codebase ครั้งเดียวต่อ task
- ไม่เปิดหลาย agent ใน repo/task เดียวกัน
- ไม่ใช้ session เก่าข้ามวัน จบงานให้ handoff + bda stop
- เจอ 400/500/502 ส่ง error text + เวลา + employee code ไม่ retry ซ้ำ
- ไม่ส่ง repo/log/chat history ทั้งก้อน
- context/prompt ใหญ่เกิน ~25K หรือ local queue เกิน ~20s จะถูกย้ายไป paid พร้อมบันทึก employee/session/task/reason comment เพื่อ feedback
- ไม่ส่ง context ใหญ่ซ้ำเพื่อให้ระบบ paid รับแทน ให้สรุป/แบ่ง phase/ใช้ subscription AI วางแผนก่อน
- งานเล็กใช้ local/auto ก่อน paid ใช้เมื่อ queue สูง งานยาก หรือ final review
```
