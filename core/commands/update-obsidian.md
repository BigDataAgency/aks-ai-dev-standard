# Command: Update Obsidian

## ใช้เมื่อ
ต้องการ update obsidian ตามมาตรฐาน BDA

## Copy this into AI

```text
ทำงาน: Update Obsidian
Context: <วาง task/ไฟล์/ลิงก์/ข้อจำกัด>
โปรดทำตามขั้นตอนนี้:
1. ยืนยัน vault/path ก่อน และอ่าน Obsidian context manifest (`00-Agent-Context.md` หรือ `.bda/obsidian-context.md`) ถ้ามี; ถ้าไม่มีให้ใช้ `core/commands/init.md` เพื่อสร้าง context ก่อนอัปเดตแบบต่อเนื่อง
2. ห้ามแตะ shared repo โดยไม่ได้รับอนุญาต
3. รักษา link/tag/frontmatter
4. ไม่สร้าง duplicate note
5. อัปเดต session/evidence/index notes ที่เกี่ยวข้องกับงานล่าสุด
6. เก็บ testcase/evidence ที่ตรวจจริงไว้ใน path ตาม manifest; ถ้าไม่มีหลักฐานให้ใช้ `pending evidence` ไม่สร้างหลักฐานปลอม
7. สรุปไฟล์ที่อัปเดต

Output ที่ต้องส่ง: Obsidian update summary พร้อม session/evidence notes

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Checklist
- [ ] อ่าน Obsidian context manifest ถ้ามี หรือระบุว่าไม่มี context
- [ ] ยืนยัน vault/path ก่อน
- [ ] ห้ามแตะ shared repo โดยไม่ได้รับอนุญาต
- [ ] รักษา link/tag/frontmatter
- [ ] ไม่สร้าง duplicate note
- [ ] อัปเดต session/evidence/index notes ที่เกี่ยวข้อง
- [ ] สรุปไฟล์ที่อัปเดต

## Required report sections

ทุกครั้งที่ใช้ command นี้ ต้องส่งรายงานท้ายงานเป็นภาษาไทยและมีหัวข้อเหล่านี้ครบถ้วน:

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `STANDARD.md`, `core/commands/<name>.md`, `core/workflows/<name>.md`, `core/policies/<name>.md`, `core/checklists/<name>.md`, `core/templates/<name>.md`
2. **Pipeline trace** — ลำดับขั้นตอนที่ทำจริงตั้งแต่ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้ในแต่ละช่วง
3. **Commands run** — คำสั่ง shell/tool/test/lint/build/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันคำสั่ง ให้ระบุ `ไม่ได้รัน` และเหตุผล
4. **Verification / Evidence** — หลักฐานผลตรวจจริง เช่น test result, lint/build output, diff, screenshot, link, manual check
5. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง สิ่งที่ยังไม่ได้ตรวจ หรือขั้นตอนถัดไป

---
ใช้เอกสารนี้เป็นมาตรฐานกลางของ AKS AI Dev Standard (เดิม BDA AI Dev Standard) ปรับใช้ได้กับมนุษย์และ AI โดยต้องยึดหลัก: เข้าใจงานก่อนทำ, มีแผนสั้น, ทำจริง, ตรวจจริง, ส่งมอบพร้อมหลักฐาน, ไม่อ้างผลลัพธ์ปลอม.
