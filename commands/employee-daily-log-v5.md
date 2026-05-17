# Command: Employee Daily Log v5

## ใช้เมื่อ
ต้องการ employee daily log v5 ตามมาตรฐาน BDA

## Copy this into AI

```text
ทำงาน: Employee Daily Log v5
Context: <วาง task/ไฟล์/ลิงก์/ข้อจำกัด>
โปรดทำตามขั้นตอนนี้:
1. รวบรวมงานวันนี้
2. แยก output/result/blocker
3. ให้คะแนน confidence
4. ระบุ tomorrow focus
5. ระบุ AI usage ทุกวัน: ถ้าใช้ AI ต้องใส่ tool/model และ token/cost ถ้ามี; ถ้าไม่ได้ใช้ AI ต้องยืนยัน "No AI used / ไม่ได้ใช้ AI"
6. ไม่ใส่ claim ที่ไม่มีหลักฐาน

Output ที่ต้องส่ง: daily log v5 ตาม template

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Checklist
- [ ] รวบรวมงานวันนี้
- [ ] แยก output/result/blocker
- [ ] ให้คะแนน confidence
- [ ] ระบุ tomorrow focus
- [ ] ระบุ AI usage fields ครบ หรือยืนยัน no-AI อย่างชัดเจน
- [ ] ไม่ใส่ claim ที่ไม่มีหลักฐาน

## Required report sections

ทุกครั้งที่ใช้ command นี้ ต้องส่งรายงานท้ายงานเป็นภาษาไทยและมีหัวข้อเหล่านี้ครบถ้วน:

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `STANDARD.md`, `commands/<name>.md`, `workflows/<name>.md`, `policies/<name>.md`, `checklists/<name>.md`, `templates/<name>.md`
2. **Pipeline trace** — ลำดับขั้นตอนที่ทำจริงตั้งแต่ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้ในแต่ละช่วง
3. **Commands run** — คำสั่ง shell/tool/test/lint/build/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันคำสั่ง ให้ระบุ `ไม่ได้รัน` และเหตุผล
4. **Verification / Evidence** — หลักฐานผลตรวจจริง เช่น test result, lint/build output, diff, screenshot, link, manual check
5. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง สิ่งที่ยังไม่ได้ตรวจ หรือขั้นตอนถัดไป

---
ใช้เอกสารนี้เป็นมาตรฐานกลางของ BDA AI Dev Standard ปรับใช้ได้กับมนุษย์และ AI โดยต้องยึดหลัก: เข้าใจงานก่อนทำ, มีแผนสั้น, ทำจริง, ตรวจจริง, ส่งมอบพร้อมหลักฐาน, ไม่อ้างผลลัพธ์ปลอม.
