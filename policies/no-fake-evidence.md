# Policy: no-fake-evidence

ห้ามสร้างหลักฐานปลอม ห้ามบอกว่ารัน test/build/manual check ถ้าไม่ได้รันจริง ถ้าตรวจไม่ได้ให้ระบุ blocker ตรงๆ

## Required behavior
- ระบุสิ่งที่ตรวจจริง
- ระบุสิ่งที่ยังไม่ได้ตรวจ
- อย่าขยาย scope โดยไม่จำเป็น
- ถ้าเสี่ยง ให้หยุดและขอ confirmation
