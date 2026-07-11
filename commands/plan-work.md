# Command: Plan Work

## ใช้เมื่อ
ต้องการ plan work ตามมาตรฐาน BDA

## Copy this into AI

```text
ทำงาน: Plan Work
Context: <วาง task/ไฟล์/ลิงก์/ข้อจำกัด>
โปรดทำตามขั้นตอนนี้:
1. ถ้ามี Obsidian context manifest (`00-Agent-Context.md` หรือ `.bda/obsidian-context.md`) ให้อ่านก่อนวางแผน; ถ้าไม่มีและงานต้องผูกกับ Obsidian ให้เสนอใช้ `commands/init.md`
2. ระบุ success criteria ที่ตรวจได้
3. เลือกขนาดงาน small/medium/large
4. แบ่งขั้นตอนที่ verify ได้ และ map verification กลับไปยัง success criteria
5. ระบุไฟล์หลัก, command ตรวจ, และ Obsidian work/evidence note ที่จะอัปเดตเมื่อเกี่ยวข้อง
6. เลือก minimum correct change และตัด speculative abstraction/config/feature หรือ unrelated refactor/format churn ออก
7. ระบุ assumption/ambiguity เฉพาะที่กระทบ scope, data safety, security, หรือ correctness

Output ที่ต้องส่ง: แผน 3-7 bullet พร้อม success criteria, minimum correct change, verification, และ Obsidian update target ถ้ามี context

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Checklist
- [ ] อ่าน Obsidian context manifest ถ้ามี หรือระบุว่าไม่มี context
- [ ] ระบุ success criteria ที่ตรวจได้
- [ ] เลือกขนาดงาน small/medium/large
- [ ] แบ่งขั้นตอนที่ verify ได้และ map กลับไปยัง success criteria
- [ ] ระบุไฟล์หลักและ command ตรวจ
- [ ] ระบุ session/evidence note ที่จะอัปเดตถ้าใช้ Obsidian
- [ ] เลือก minimum correct change
- [ ] ตัด speculative abstraction/config/feature และ unrelated refactor/format churn ออก

## Required report sections

ทุกครั้งที่ใช้ command นี้ ต้องส่งรายงานท้ายงานเป็นภาษาไทยและมีหัวข้อเหล่านี้ครบถ้วน:

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `STANDARD.md`, `commands/<name>.md`, `workflows/<name>.md`, `policies/<name>.md`, `checklists/<name>.md`, `templates/<name>.md`
2. **Pipeline trace** — ลำดับขั้นตอนที่ทำจริงตั้งแต่ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้ในแต่ละช่วง
3. **Commands run** — คำสั่ง shell/tool/test/lint/build/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันคำสั่ง ให้ระบุ `ไม่ได้รัน` และเหตุผล
4. **Verification / Evidence** — หลักฐานผลตรวจจริง เช่น test result, lint/build output, diff, screenshot, link, manual check
5. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง สิ่งที่ยังไม่ได้ตรวจ หรือขั้นตอนถัดไป

---
ใช้เอกสารนี้เป็นมาตรฐานกลางของ AKS AI Dev Standard (เดิม BDA AI Dev Standard) ปรับใช้ได้กับมนุษย์และ AI โดยต้องยึดหลัก: เข้าใจงานก่อนทำ, มีแผนสั้น, ทำจริง, ตรวจจริง, ส่งมอบพร้อมหลักฐาน, ไม่อ้างผลลัพธ์ปลอม.
