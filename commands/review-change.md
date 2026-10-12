# Command: Review Change / CR

## ใช้เมื่อ
ต้องการ review change / cr ตามมาตรฐาน BDA

## Copy this into AI

```text
ทำงาน: Review Change / CR
Context: <วาง task/ไฟล์/ลิงก์/ข้อจำกัด>
โปรดทำตามขั้นตอนนี้:
0. รัน `git diff` เทียบ ref/ช่วงไฟล์ที่โจทย์ระบุ และบันทึก command/ref ที่ใช้จริง; ใช้เครื่องมือรีวิวเดิมเพิ่มเติมได้เมื่อมีอยู่ ไม่อ้างว่าได้รันถ้ายังไม่ได้รัน
1. อ่าน diff, requirement, และ success criteria
2. ตรวจว่าทุก changed line trace กลับไปยัง request, bug, success criteria, หรือ verification ได้
3. หา bug, security, data loss, compatibility, missing test
4. หา speculative abstraction/config/dependency/feature, unrelated refactor, หรือ format churn ที่ไม่จำเป็น
5. แยก findings ด้วย enum [BLOCKING] / [SUGGESTION] ตาม Severity rubric ด้านล่าง
6. อย่าติ style ถ้าไม่กระทบ correctness, maintainability, security, หรือ pattern เดิม

Output ที่ต้องส่ง: ใช้ `templates/review-report.md`; findings ระบุ [BLOCKING] / [SUGGESTION], file/line, หลักฐานและลิงก์ติดตาม PR/issue พร้อมตาราง changed file/lines → request/bug/criterion → evidence → status; ช่องที่ยังไม่ตรวจเป็น Not verified

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Severity rubric

- `[BLOCKING]`: มีหลักฐานว่ากระทบ correctness, data loss, security หรือ compatibility/contract เดิมที่ต้องแก้ก่อนรวมงาน. ระบุผลกระทบ, file/line, หลักฐาน และ follow-up PR/issue
- `[SUGGESTION]`: ข้อเสนอที่ไม่เข้าเกณฑ์ blocking; การปรับ style หรือ maintainability อย่างเดียวไม่เป็น blockerโดยอัตโนมัติ
- ถ้ายังไม่มีหลักฐาน ให้ระบุ Not verified และสิ่งที่ต้องตรวจต่อ ไม่แปลงความสงสัยเป็นข้อสรุปว่าพบบั๊ก
- ใช้สอง enum นี้ในรายงานทุกจุด; อย่าเพิ่มระดับ severity เอง. เก็บ findings และสถานะติดตามใน PR/issue เดิมพร้อมหลักฐาน ไม่ถือคำแนะนำว่าแก้เสร็จ

## Checklist
- [ ] อ่าน diff, requirement, และ success criteria
- [ ] ตรวจ traceability ของ changed lines
- [ ] หา bug, security, data loss, compatibility, missing test
- [ ] หา speculative abstraction/config/dependency/feature หรือ unrelated refactor/format churn
- [ ] ตรวจว่า verification map กลับไปยัง success criteria
- [ ] แยก [BLOCKING] / [SUGGESTION] ตาม rubric และระบุ file/line + evidence + PR/issue ที่ติดตาม
- [ ] อย่าติ style ถ้าไม่กระทบ

## Required report sections

ทุกครั้งที่ใช้ command นี้ ต้องส่งรายงานท้ายงานเป็นภาษาไทยและมีหัวข้อเหล่านี้ครบถ้วน:

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `STANDARD.md`, `commands/<name>.md`, `workflows/<name>.md`, `policies/<name>.md`, `checklists/<name>.md`, `templates/<name>.md`
2. **Pipeline trace** — ลำดับขั้นตอนที่ทำจริงตั้งแต่ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้ในแต่ละช่วง
3. **Commands run** — คำสั่ง shell/tool/test/lint/build/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันคำสั่ง ให้ระบุ `ไม่ได้รัน` และเหตุผล
4. **Verification / Evidence** — หลักฐานผลตรวจจริง เช่น test result, lint/build output, diff, screenshot, link, manual check
5. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง สิ่งที่ยังไม่ได้ตรวจ หรือขั้นตอนถัดไป

---
ใช้เอกสารนี้เป็นมาตรฐานกลางของ AKS AI Dev Standard (เดิม BDA AI Dev Standard) ปรับใช้ได้กับมนุษย์และ AI โดยต้องยึดหลัก: เข้าใจงานก่อนทำ, มีแผนสั้น, ทำจริง, ตรวจจริง, ส่งมอบพร้อมหลักฐาน, ไม่อ้างผลลัพธ์ปลอม.
