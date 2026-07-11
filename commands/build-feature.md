# Command: Build Feature

## ใช้เมื่อ
ต้องการ build feature ตามมาตรฐาน BDA

## Copy this into AI

```text
ทำงาน: Build Feature
Context: <วาง task/ไฟล์/ลิงก์/ข้อจำกัด>
โปรดทำตามขั้นตอนนี้:
1. ถ้ามี Obsidian context manifest (`00-Agent-Context.md` หรือ `.bda/obsidian-context.md`) ให้อ่านก่อนเริ่ม และเตรียม session/evidence note ตาม context; ถ้าไม่มีและงานต้องผูกกับ Obsidian ให้ใช้ `commands/init.md`
2. ยืนยัน expected behavior และ success criteria
2.5 **ประเมิน scope ก่อนลงมือ (กติกาจากผลวัดจริง 2026-07-05)**: ถ้างานใหญ่กว่า 1 service/module/endpoint ให้แตกเป็นชิ้นเล็กแล้วทำทีละชิ้นให้ test ผ่านก่อนไปต่อ — โจทย์ใหญ่เปิดกว้างมีอัตราจบจริง 0/8; ห้ามพยายามสร้างทั้งระบบในรอบเดียว
3. สำรวจ pattern เดิม
4. implement แบบ minimum correct change ตาม pattern เดิม
5. ห้ามเพิ่ม speculative abstraction/config/dependency/feature หรือ unrelated refactor/format churn
6. ให้ทุก changed line trace กลับไปยัง request, success criteria, หรือ verification ได้
7. เพิ่ม/ปรับ test ถ้าเหมาะสม
8. verify build/test/manual และ map evidence กลับไปยัง success criteria
9. อัปเดต Obsidian session/evidence note ด้วย feature summary, files changed, testcase/evidence, commands run, และข้อจำกัด ถ้ามี context

Output ที่ต้องส่ง: feature summary พร้อม success criteria, files, evidence mapping, และ Obsidian note ที่อัปเดตถ้ามี context

**Verification gate (บังคับ)**: ห้ามใช้คำว่า เสร็จ/complete/production-ready ถ้าไม่ได้แปะผลรัน test จริง (คำสั่ง+ผลลัพธ์) และผล `git log --oneline -3` ในรายงาน — เคยพบ AI รายงานว่า commit แล้วทั้งที่ไม่มีไฟล์จริง

Output ที่ต้องส่งต้องมีหัวข้อ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
```

## Checklist
- [ ] อ่าน Obsidian context manifest ถ้ามี หรือระบุว่าไม่มี context
- [ ] ยืนยัน expected behavior และ success criteria
- [ ] สำรวจ pattern เดิม
- [ ] implement แบบ minimum correct change
- [ ] ไม่มี speculative abstraction/config/dependency/feature
- [ ] ไม่มี unrelated refactor/format churn
- [ ] ทุก changed line trace กลับไปยัง request/success criteria/verification ได้
- [ ] เพิ่ม/ปรับ test ถ้าเหมาะสม
- [ ] verify build/test/manual และ map กลับไปยัง success criteria
- [ ] อัปเดต session/evidence note หรือระบุเหตุผลที่ไม่ได้อัปเดต

## Required report sections

ทุกครั้งที่ใช้ command นี้ ต้องส่งรายงานท้ายงานเป็นภาษาไทยและมีหัวข้อเหล่านี้ครบถ้วน:

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `STANDARD.md`, `commands/<name>.md`, `workflows/<name>.md`, `policies/<name>.md`, `checklists/<name>.md`, `templates/<name>.md`
2. **Pipeline trace** — ลำดับขั้นตอนที่ทำจริงตั้งแต่ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้ในแต่ละช่วง
3. **Commands run** — คำสั่ง shell/tool/test/lint/build/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันคำสั่ง ให้ระบุ `ไม่ได้รัน` และเหตุผล
4. **Verification / Evidence** — หลักฐานผลตรวจจริง เช่น test result, lint/build output, diff, screenshot, link, manual check
5. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง สิ่งที่ยังไม่ได้ตรวจ หรือขั้นตอนถัดไป

---
ใช้เอกสารนี้เป็นมาตรฐานกลางของ AKS AI Dev Standard (เดิม BDA AI Dev Standard) ปรับใช้ได้กับมนุษย์และ AI โดยต้องยึดหลัก: เข้าใจงานก่อนทำ, มีแผนสั้น, ทำจริง, ตรวจจริง, ส่งมอบพร้อมหลักฐาน, ไม่อ้างผลลัพธ์ปลอม.
