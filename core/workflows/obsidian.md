# Workflow: obsidian

Obsidian: รักษา link graph, tags, frontmatter, naming, ห้ามแตะ shared vault โดยไม่ยืนยัน และใช้ `core/commands/init.md` เพื่อสร้าง context manifest ก่อนให้ command อื่นทำงานร่วมกับ vault

## Steps
1. ใช้ `core/commands/understand-task.md`
2. ถ้ายังไม่มี Obsidian context manifest ให้ใช้ `core/commands/init.md` เพื่อสร้าง/อัปเดต `00-Agent-Context.md`, `sessions/_index.md`, และ `test-evidence/_index.md`
3. ใช้ `core/commands/plan-work.md` ถ้างานไม่เล็กมาก โดยอ้างอิง session/evidence note จาก manifest
4. ทำงานด้วย command ที่ใกล้ที่สุด เช่น `core/commands/fix-bug.md`, `core/commands/build-feature.md`, `core/commands/write-document.md`, หรือ `core/commands/test-report.md`
5. อัปเดต Obsidian session/evidence/index notes ระหว่างหรือท้ายงาน ไม่ต้องรอให้ user สั่งเก็บเพิ่มอีกครั้งถ้ามี context แล้ว
6. ใช้ `core/commands/verify-work.md`
7. ส่ง `core/commands/handoff-report.md`

## Context manifest

ค่า default ใน project folder:

- `00-Agent-Context.md`: แผนที่โครงสร้าง vault/project และกติกา link/tag/frontmatter
- `sessions/_index.md`: index งาน AI และ work notes
- `sessions/YYYY-MM-DD-<slug>.md`: note ต่องาน
- `test-evidence/_index.md`: index testcase/evidence
- `test-evidence/YYYY-MM-DD-<slug>.md`: note ต่อรอบตรวจ

ถ้า source repo แยกจาก Obsidian vault และ user อนุญาต ให้เพิ่ม `.bda/obsidian-context.md` ใน repo เพื่อชี้กลับไปยัง manifest.

## Evidence
- command ที่รัน
- result/log/screenshot/link
- files changed
- session/evidence note ที่สร้างหรืออัปเดต
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
