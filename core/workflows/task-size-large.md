# Workflow: task-size-large

งานใหญ่: ต้อง discovery, design note, phased implementation, migration/rollback, verification matrix

## Steps
1. ใช้ `commands/understand-task.md`
2. ใช้ `commands/plan-work.md` ถ้างานไม่เล็กมาก
3. ทำงานด้วย command ที่ใกล้ที่สุด
4. ใช้ `commands/verify-work.md`
5. ส่ง `commands/handoff-report.md`

## AI session/model guardrails
- แบ่งงานเป็น phase สั้น และ checkpoint หลังแต่ละ phase ด้วย diff/build/test หรือ manual evidence
- งาน cross-repo, data model ใหม่, หรือ logic ซับซ้อน ใช้ paid model ได้ แต่ต้องระบุเหตุผลและ success criteria ก่อน
- งาน implementation ยาวให้หลีกเลี่ยงการส่ง context ทั้ง repo ให้แนบเฉพาะไฟล์/patch/log ที่เกี่ยวข้องต่อ phase
- ก่อน compact หรือ switch model ต้องสร้าง current-state note: goal, files touched, decisions, failing tests, next step
- ห้าม AI/tool `bda start` หรือ `bda stop` เองนอก flow ที่ผู้ใช้ยืนยัน; step done ไม่เท่ากับ session stop
- Verification ต้องดู code/diff/test จริง ห้ามใช้ self-report ของ model เป็นหลักฐาน

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
