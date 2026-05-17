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

## Definition of Done
- Requirement หลักครบ
- ไม่มี fake evidence
- มี verification ที่เหมาะสม
- มี handoff/report
- ถ้าเป็น production-facing ต้องมี rollback หรือ mitigation
