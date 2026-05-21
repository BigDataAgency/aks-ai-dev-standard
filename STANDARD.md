# BDA AI Operating Standard

## 1. Understand
- อ่าน task, issue, PR, branch, docs ที่เกี่ยวข้อง
- แยกเป้าหมาย, non-goals, constraints, deadline
- ระบุ assumption ถ้าข้อมูลไม่ครบ

## 2. Plan
- งานเล็ก: 3-5 bullet
- งานกลาง: แผนเป็น phase และไฟล์หลัก
- งานใหญ่: discovery, design, implementation, verification, rollout

## 3. Execute
- แก้เฉพาะ scope ที่เกี่ยวข้อง
- เก็บ backward compatibility ถ้าเป็นระบบใช้งานจริง
- อย่า format หรือ refactor ใหญ่โดยไม่จำเป็น

## 4. Verify
- ใช้ test/lint/build/manual check จริง
- ถ้ารันไม่ได้ ให้บอก blocker และทางเลือกตรวจ
- เก็บ command และผลลัพธ์ไว้ในรายงาน

## 5. Handoff
- สรุปให้คนรับงานทำต่อได้ทันที
- ระบุไฟล์, behavior ที่เปลี่ยน, verification, risk, next step
- ทุก handoff/report ของ BDA ต้องมีหัวข้อบังคับ: `BDA Standard files used`, `Pipeline trace`, `Commands run`, `Verification / Evidence`, `Limitations / Risks / Next steps`
- `BDA Standard files used` ต้องระบุ path ของไฟล์มาตรฐานที่เปิด/อ้างอิงจริง ไม่ใช่ชื่อกว้าง ๆ
- `Pipeline trace` ต้องตามรอย Understand → Plan → Execute → Verify → Handoff และบอก command/workflow ที่ใช้ในแต่ละช่วง
- `Commands run` ต้องเป็นคำสั่งหรือ tool ที่รันจริงพร้อมผลสรุป ถ้าไม่ได้รันต้องเขียนว่าไม่ได้รันและเหตุผล

## 6. Standard Feedback Loop
- ใช้ `FEEDBACK.md`, `commands/standard-feedback.md`, `templates/standard-feedback.md`, และ `workflows/standard-improvement.md` เมื่อต้องการ feedback เพื่อปรับปรุง BDA AI Dev Standard เอง
- รับ feedback ประเภท bug report, confusion, missing command, feature request, scenario request, adoption friction, AI output issue หรือข้อเสนออื่น ๆ ที่ทำให้ standard ดีขึ้น
- Feedback loop นี้แยกจาก performance process โดยสิ้นเชิง: ไม่ใช่ score, KPI, daily performance, หรือการประเมินบุคคล
- role/team ใน feedback เป็น optional usage context เท่านั้น ไม่ใช้ตัดสินผลงานรายบุคคล
- ทุกการแก้มาตรฐานต้องทำใน repo นี้ก่อน แล้ว verify ตาม `UPDATE-POLICY.md`

## Definition of Done
- Requirement หลักครบ
- ไม่มี fake evidence
- มี verification ที่เหมาะสม
- มี handoff/report
- handoff/report มี BDA files used, pipeline trace, commands run, evidence, limitations ครบถ้วน
- ถ้าเป็น production-facing ต้องมี rollback หรือ mitigation
