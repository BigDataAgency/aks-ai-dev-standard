# Workflow: task-size-small

งานเล็ก: แก้ไฟล์น้อย, risk ต่ำ, verify ได้เร็ว ใช้ understand -> implement -> verify -> handoff

## Steps
1. ใช้ `commands/understand-task.md`
2. ใช้ `commands/plan-work.md` ถ้างานไม่เล็กมาก
3. ทำงานด้วย command ที่ใกล้ที่สุด
4. ใช้ `commands/verify-work.md`
5. ส่ง `commands/handoff-report.md`

## Evidence
- command ที่รัน
- result/log/screenshot/link
- files changed
- known limitations


## Required report sections

ทุก workflow ต้องส่ง handoff/report ที่มีหัวข้อเหล่านี้ครบถ้วน:

- **BDA Standard files used**: path ของไฟล์มาตรฐาน BDA ที่ใช้จริง
- **Pipeline trace**: ขั้นตอน Understand → Plan → Execute → Verify → Handoff ที่ทำจริง และ command/workflow ที่ใช้
- **Commands run**: คำสั่งหรือ tool ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันให้บอกเหตุผล
- **Verification / Evidence**: หลักฐานตรวจจริง ไม่ใช้ claim ลอย ๆ
- **Limitations / Risks / Next steps**: ข้อจำกัด ความเสี่ยง และงานต่อ

---
ใช้เอกสารนี้เป็นมาตรฐานกลางของ AKS AI Dev Standard (เดิม BDA AI Dev Standard) ปรับใช้ได้กับมนุษย์และ AI โดยต้องยึดหลัก: เข้าใจงานก่อนทำ, มีแผนสั้น, ทำจริง, ตรวจจริง, ส่งมอบพร้อมหลักฐาน, ไม่อ้างผลลัพธ์ปลอม.
