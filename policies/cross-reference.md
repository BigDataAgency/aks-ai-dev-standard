# Policy: cross-reference

ใช้เมื่อการตัดสินใจ (เช่น แก้ conflict ใน [workflows/merge-branches.md](../workflows/merge-branches.md)) อาจกระทบหรือมีแบบอย่างใน project/repo อื่น มาตรฐานกลางไม่กำหนดรายชื่อ project ที่เป็น authoritative; **แต่ละโครงการเป็นเจ้าของ registry ของตัวเอง**

## Project-owned registry
ตารางนี้เป็น template ว่าง ไม่ใช่รายชื่อ project จริง
โครงการเก็บ registry ไว้ในเอกสารของโครงการ (เช่น README/AGENTS/docs ของ repo) ไม่ใช่ใน repo มาตรฐานนี้ ต่อหนึ่งรายการ:

| Project/repo | Location (remote/path) | Ref + SHA ที่ตรวจ | Relationship / ใช้อ้างอิงเรื่องอะไร | Owner | Last verified |
| --- | --- | --- | --- | --- | --- |
| [name] | [path/URL] | [ref@sha] | [scope ที่เทียบได้] | [คน/ทีม] | [date] |

- ชื่อ project ในรายงาน/feedback เป็นตัวอย่างที่ต้องตรวจเองกับ registry เท่านั้น ไม่ถือเป็น canonical
- ไม่มี registry หรือรายการที่ revision/feature/dependency ไม่ตรงกับสิ่งที่จะเทียบหรือไม่ครอบคลุม scope = ไม่มี cross-reference ให้ถามเจ้าของโครงการ ไม่เดาชื่อ project

## Decision steps
1. หา registry ของโครงการและเลือกเฉพาะรายการที่ scope ตรงกับ feature/ไฟล์ที่ตัดสิน
2. เข้าถึง project นั้นแบบอ่านอย่างเดียวตามสิทธิ์ที่มี; เข้าไม่ได้ = Not verified
3. ตรวจว่ามี feature/ไฟล์เดียวกันหรือไม่ และอ่านโค้ด/ทดสอบที่ revision ที่ระบุ ไม่ใช่แค่ชื่อ commit
4. เทียบ revision/behavior กับ target ปัจจุบัน (รุ่น dependency, feature ที่มี/ไม่มี) ถ้าบริบทต่างกันถือว่าอ้างอิงไม่ได้
5. ใช้ผลเป็นหลักฐานประกอบการตัดสินใจ รักษา intent ของทั้งสองฝั่งเป็น default; ห้ามคัดลอก/เลือกฝั่ง project อื่นอัตโนมัติ
6. หลาย project ให้ผลขัดกัน หรือหาแบบอย่างไม่เจอ/ไม่แน่ใจ = หยุด คง conflict ไว้ และถามเจ้าของงาน
7. บันทึกในรายงาน: project/ref/SHA ที่ตรวจ, สิ่งที่พบ, การตัดสินใจ, สิ่งที่ยังไม่ได้ตรวจ

## Boundaries
- การอ่านข้าม project ไม่ให้สิทธิ์แก้ push หรือ merge ใน project นั้น
- ห้ามนำข้อมูลลับ/ข้อมูลลูกค้าจาก project อื่นมาใส่ในรายงานหรือ repo นี้
