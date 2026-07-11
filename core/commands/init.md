# Command: Init

## ใช้เมื่อ
ต้องการให้ AI รู้จักโครงสร้าง Obsidian/project ก่อนใช้ command อื่น เช่น `plan-work`, `fix-bug`, `build-feature`, `write-document`, `test-report`, หรือ `update-obsidian`

## Copy this into AI

```text
ทำงาน: Init
Context:
- Vault path: <path ของ Obsidian vault หรือ project folder>
- Project folder/note: <ชื่อ folder/note หลัก ถ้ามี>
- Source repo path: <path repo ที่เกี่ยวข้อง ถ้ามี>
- Scope: <งาน/ระบบ/ทีมที่ต้องให้ AI รู้จัก>

โปรดทำตามขั้นตอนนี้:
1. ยืนยัน path ที่จะอ่าน/เขียน และห้ามแตะ shared vault/repo นอก scope
2. สำรวจโครงสร้าง Obsidian: folder หลัก, index/home note, architecture/docs, sessions/logs, changelog, evidence/test reports, naming, tags, frontmatter, link pattern
3. สร้างหรืออัปเดต Obsidian context manifest ตาม `core/templates/obsidian-context.md`
4. สร้างหรืออัปเดต session/evidence index ตาม `core/templates/obsidian-work-note.md`
5. สรุปวิธีที่ command อื่นต้องใช้ context นี้ และระบุ path canonical ของ manifest

Output ที่ต้องส่ง: init summary พร้อม Obsidian context path, files created/updated, และ evidence

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Default Obsidian artifacts

ถ้า user ไม่กำหนดชื่อไฟล์ ให้ใช้ค่า default นี้ภายใน project folder ที่ยืนยันแล้ว:

- `00-Agent-Context.md` — canonical Obsidian context manifest
- `sessions/_index.md` — index งานที่ AI ทำ
- `sessions/YYYY-MM-DD-<slug>.md` — work note ต่อหนึ่งงาน
- `test-evidence/_index.md` — index testcase/evidence
- `test-evidence/YYYY-MM-DD-<slug>.md` — test/evidence note ต่อหนึ่งรอบตรวจ

ถ้ามี source repo ที่แยกจาก vault ให้สร้างหรืออัปเดต `.bda/obsidian-context.md` ใน repo เป้าหมายเฉพาะเมื่อ user อนุญาต เพื่อเก็บ pointer ไปยัง manifest ใน Obsidian.

## Checklist

- [ ] ยืนยัน vault/project/repo path และ write scope
- [ ] สำรวจ folder/note/index/link/frontmatter/tag pattern
- [ ] ไม่สร้าง duplicate note ถ้ามี note เดิมที่ใช้ต่อได้
- [ ] สร้างหรืออัปเดต `00-Agent-Context.md`
- [ ] สร้างหรืออัปเดต `sessions/_index.md`
- [ ] สร้างหรืออัปเดต `test-evidence/_index.md`
- [ ] ระบุ path ที่ command อื่นต้องอ่านก่อนทำงาน
- [ ] ระบุหลักฐานที่ตรวจจริง และสิ่งที่ยัง pending evidence

## Required report sections

ทุกครั้งที่ใช้ command นี้ ต้องส่งรายงานท้ายงานเป็นภาษาไทยและมีหัวข้อเหล่านี้ครบถ้วน:

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `STANDARD.md`, `core/commands/init.md`, `core/workflows/obsidian.md`, `core/templates/obsidian-context.md`, `core/templates/obsidian-work-note.md`
2. **Pipeline trace** — ลำดับขั้นตอนที่ทำจริงตั้งแต่ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้ในแต่ละช่วง
3. **Commands run** — คำสั่ง shell/tool/test/lint/build/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันคำสั่ง ให้ระบุ `ไม่ได้รัน` และเหตุผล
4. **Verification / Evidence** — หลักฐานผลตรวจจริง เช่น files discovered, notes created/updated, diff, link check, manual check
5. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง สิ่งที่ยังไม่ได้ตรวจ หรือขั้นตอนถัดไป

---
ใช้เอกสารนี้เป็นมาตรฐานกลางของ AKS AI Dev Standard (เดิม BDA AI Dev Standard) ปรับใช้ได้กับมนุษย์และ AI โดยต้องยึดหลัก: เข้าใจงานก่อนทำ, มีแผนสั้น, ทำจริง, ตรวจจริง, ส่งมอบพร้อมหลักฐาน, ไม่อ้างผลลัพธ์ปลอม.
