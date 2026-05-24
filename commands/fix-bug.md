# Command: Fix Bug

## ใช้เมื่อ
ต้องการ fix bug ตามมาตรฐาน BDA

## Copy this into AI

```text
ทำงาน: Fix Bug
Context: <วาง task/ไฟล์/ลิงก์/ข้อจำกัด>
โปรดทำตามขั้นตอนนี้:
1. ถ้ามี Obsidian context manifest (`00-Agent-Context.md` หรือ `.bda/obsidian-context.md`) ให้อ่านก่อนเริ่ม และเตรียม session/evidence note ตาม context; ถ้าไม่มีและงานต้องผูกกับ Obsidian ให้ใช้ `commands/init.md`
2. ระบุ bug success criteria: อะไรต้องกลับมาถูก และอะไรต้องไม่พัง
3. reproduce หรืออธิบายเหตุที่ reproduce ไม่ได้
4. หา root cause
5. แก้จุดเล็กที่สุดที่ถูกต้องตาม pattern เดิม
6. ห้าม speculative abstraction/config/dependency/feature และ unrelated refactor/format churn
7. ให้ทุก changed line trace กลับไปยัง bug, root cause, success criteria, หรือ regression check ได้
8. เพิ่ม regression check
9. verify path ที่เสียและ path ปกติ โดย map evidence กลับไปยัง success criteria
10. อัปเดต Obsidian session/evidence note ด้วย root cause, fix, testcase/regression evidence, commands run, และข้อจำกัด ถ้ามี context

Output ที่ต้องส่ง: root cause, minimum correct fix, regression evidence mapping, และ Obsidian note ที่อัปเดตถ้ามี context

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Checklist
- [ ] อ่าน Obsidian context manifest ถ้ามี หรือระบุว่าไม่มี context
- [ ] ระบุ bug success criteria
- [ ] reproduce หรืออธิบายเหตุที่ reproduce ไม่ได้
- [ ] หา root cause
- [ ] แก้จุดเล็กที่สุดที่ถูกต้องตาม pattern เดิม
- [ ] ไม่มี speculative abstraction/config/dependency/feature
- [ ] ไม่มี unrelated refactor/format churn
- [ ] ทุก changed line trace กลับไปยัง bug/root cause/success criteria/regression check ได้
- [ ] เพิ่ม regression check
- [ ] verify path ที่เสียและ path ปกติ และ map กลับไปยัง success criteria
- [ ] อัปเดต session/evidence note หรือระบุเหตุผลที่ไม่ได้อัปเดต

## Required report sections

ทุกครั้งที่ใช้ command นี้ ต้องส่งรายงานท้ายงานเป็นภาษาไทยและมีหัวข้อเหล่านี้ครบถ้วน:

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `STANDARD.md`, `commands/<name>.md`, `workflows/<name>.md`, `policies/<name>.md`, `checklists/<name>.md`, `templates/<name>.md`
2. **Pipeline trace** — ลำดับขั้นตอนที่ทำจริงตั้งแต่ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้ในแต่ละช่วง
3. **Commands run** — คำสั่ง shell/tool/test/lint/build/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันคำสั่ง ให้ระบุ `ไม่ได้รัน` และเหตุผล
4. **Verification / Evidence** — หลักฐานผลตรวจจริง เช่น test result, lint/build output, diff, screenshot, link, manual check
5. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง สิ่งที่ยังไม่ได้ตรวจ หรือขั้นตอนถัดไป

---
ใช้เอกสารนี้เป็นมาตรฐานกลางของ BDA AI Dev Standard ปรับใช้ได้กับมนุษย์และ AI โดยต้องยึดหลัก: เข้าใจงานก่อนทำ, มีแผนสั้น, ทำจริง, ตรวจจริง, ส่งมอบพร้อมหลักฐาน, ไม่อ้างผลลัพธ์ปลอม.
