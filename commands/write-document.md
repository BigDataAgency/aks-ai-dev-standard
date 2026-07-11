# Command: Write Document

## ใช้เมื่อ
ต้องการ write document ตามมาตรฐาน BDA

## Copy this into AI

```text
ทำงาน: Write Document
Context: <วาง task/ไฟล์/ลิงก์/ข้อจำกัด>
โปรดทำตามขั้นตอนนี้:
1. ถ้ามี Obsidian context manifest (`00-Agent-Context.md` หรือ `.bda/obsidian-context.md`) ให้อ่านก่อนเลือกที่เก็บเอกสาร; ถ้าไม่มีและงานต้องผูกกับ Obsidian ให้ใช้ `commands/init.md`
2. กำหนด audience
3. เลือกโครงสร้างและ target note/folder โดยรักษา naming, link, tag, frontmatter เดิม
4. เขียนให้ทำตามได้จริง
5. ใส่ตัวอย่าง
6. ตรวจความถูกต้องและลิงก์
7. อัปเดต index/session note ถ้าเอกสารอยู่ใน Obsidian context

Output ที่ต้องส่ง: เอกสารพร้อมใช้งาน พร้อม path/link และ Obsidian update summary ถ้ามี context

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Checklist
- [ ] อ่าน Obsidian context manifest ถ้ามี หรือระบุว่าไม่มี context
- [ ] กำหนด audience
- [ ] เลือกโครงสร้าง
- [ ] เขียนให้ทำตามได้จริง
- [ ] ใส่ตัวอย่าง
- [ ] ตรวจความถูกต้องและลิงก์
- [ ] อัปเดต index/session note ถ้าใช้ Obsidian

## Required report sections

ทุกครั้งที่ใช้ command นี้ ต้องส่งรายงานท้ายงานเป็นภาษาไทยและมีหัวข้อเหล่านี้ครบถ้วน:

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `STANDARD.md`, `commands/<name>.md`, `workflows/<name>.md`, `policies/<name>.md`, `checklists/<name>.md`, `templates/<name>.md`
2. **Pipeline trace** — ลำดับขั้นตอนที่ทำจริงตั้งแต่ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้ในแต่ละช่วง
3. **Commands run** — คำสั่ง shell/tool/test/lint/build/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันคำสั่ง ให้ระบุ `ไม่ได้รัน` และเหตุผล
4. **Verification / Evidence** — หลักฐานผลตรวจจริง เช่น test result, lint/build output, diff, screenshot, link, manual check
5. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง สิ่งที่ยังไม่ได้ตรวจ หรือขั้นตอนถัดไป

---
ใช้เอกสารนี้เป็นมาตรฐานกลางของ AKS AI Dev Standard (เดิม BDA AI Dev Standard) ปรับใช้ได้กับมนุษย์และ AI โดยต้องยึดหลัก: เข้าใจงานก่อนทำ, มีแผนสั้น, ทำจริง, ตรวจจริง, ส่งมอบพร้อมหลักฐาน, ไม่อ้างผลลัพธ์ปลอม.
