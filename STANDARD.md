# BDA AI Operating Standard

## 1. Understand
- อ่าน task, issue, PR, branch, docs ที่เกี่ยวข้อง
- แยกเป้าหมาย, non-goals, constraints, deadline
- ระบุ assumption ถ้าข้อมูลไม่ครบ

## 2. Plan
- งานเล็ก: 3-5 bullet
- งานกลาง: แผนเป็น phase และไฟล์หลัก
- งานใหญ่: discovery, design, implementation, verification, rollout
- ระบุ success criteria ก่อนแก้ เพื่อให้ทุกขั้นตอนตรวจกลับได้
- วางแผน minimum correct change: ทำสิ่งที่จำเป็นให้ถูกต้องก่อน ไม่เพิ่ม abstraction/config/feature เผื่ออนาคต
- รักษา command/slash command เดิมเป็น default; เพิ่ม discipline ใน workflow ภายในแทนการเปลี่ยน UX โดยไม่จำเป็น

## 3. Execute
- แก้เฉพาะ scope ที่เกี่ยวข้อง
- เก็บ backward compatibility ถ้าเป็นระบบใช้งานจริง
- อย่า format หรือ refactor ใหญ่โดยไม่จำเป็น
- ทำตาม pattern เดิมของ repo ก่อนสร้าง pattern ใหม่
- ทุกบรรทัดที่แก้ต้อง trace กลับไปยัง request, bug, success criteria, หรือ verification ได้
- ห้ามเพิ่ม speculative abstraction, configuration, dependency, หรือ feature ที่ผู้ใช้ไม่ได้ขอ
- ถ้ามี assumption/ambiguity ให้หยุดถามเฉพาะเมื่อมีผลต่อ scope, data safety, security, หรือ correctness; ถ้าไม่กระทบให้ระบุ assumption แล้วทำต่อแบบเล็กที่สุด

## 3.1 BDA AI Session and Model Use
- ห้าม AI/tool เรียก `bda start` หรือ `bda stop` เองโดยไม่อยู่ในคำสั่งหรือ flow ที่ผู้ใช้ยืนยันแล้ว
- `bda start` ต้องมี project, task_summary, command/tool, employee_code และ session_id ที่ trace กลับไปยังงานจริงได้
- `bda stop` ต้องปิด session เดิมเท่านั้น ห้ามสร้าง session ใหม่ตอน stop และห้าม stop อัตโนมัติแค่เพราะทำ step หนึ่งเสร็จ
- หลังเปิด hybrid local GPU + paid cloud ให้ยึด `docs/hybrid-ai-usage-discipline.md` เป็นกติกาใช้งานประจำวัน
- ห้าม scan codebase ทั้งหมดซ้ำใน session เดิม; ให้ scan จำกัดครั้งเดียวต่อ task แล้วใช้ targeted search ตาม path/module/error string
- ห้ามถามงานกว้าง เช่น "ดูให้หน่อย", "ทำต่อ", "แก้ให้หมด" โดยไม่มี path/error/success criteria/command ที่ต้องใช้
- ห้ามเปิดหลาย agent สำหรับ repo/task เดียวกันพร้อมกัน เพราะทำให้ queue และ paid overflow สูงขึ้น
- ห้ามใช้ session เก่าข้ามวันสำหรับงานจริง ถ้าต้องทำต่อให้เริ่มจาก handoff/session note/diff แล้วเปิด session ใหม่
- งานเล็ก งานกลไก หรืองานแก้เฉพาะจุด ให้เริ่มที่ local/auto/free-fast ก่อน
- paid model ใช้ได้เมื่อ task ซับซ้อน, ต้องอ่านหลายไฟล์, ต้องวิเคราะห์ root cause ยาก, เกี่ยวกับ security/data model หรือใช้เป็น final review แต่ต้องระบุเหตุผลและ success criteria
- paid model ไม่ใช่ default ถ้า switch เป็น paid ต้องบันทึกเหตุผลใน handoff หรือ work event
- AI subscription ภายนอกที่ไม่ได้ผ่าน BDA Gateway ไม่ใช่ path หลักของบริษัท เพราะวัด usage/cost/value ไม่ครบและมีปัญหาด้านการจ่ายเงิน/ภาษี ให้ใช้เฉพาะกรณี legacy/emergency และต้องบันทึกใน `bda start` ว่า `used_bda_gateway=false`
- ห้ามเชื่อ self-report ของ AI ว่า “แก้แล้ว/ทดสอบแล้ว” โดยไม่มีหลักฐานจากไฟล์จริง, diff, build, lint, test หรือ manual check
- เมื่อ context ใกล้เต็ม ให้สรุปสถานะปัจจุบันเป็นไฟล์/ประเด็น/ข้อเท็จจริงที่ตรวจแล้ว และไปต่อจากไฟล์จริง ไม่ paste repo/log/chat history ทั้งก้อน
- ก่อน switch model หรือหลัง compact context ต้อง reconstruct จากไฟล์จริง, diff และผลทดสอบ ไม่เดาจากความจำของโมเดล
- เมื่อเจอ timeout/connection/model error ให้บันทึก model เวลา error และ fallback ไป model ที่เสถียรกว่าแทนการ retry ยาวโดยไม่มีประโยชน์

## 4. Verify
- ใช้ test/lint/build/manual check จริง
- ถ้ารันไม่ได้ ให้บอก blocker และทางเลือกตรวจ
- เก็บ command และผลลัพธ์ไว้ในรายงาน
- map verification กลับไปยัง success criteria ทีละข้อ และระบุส่วนที่ยังไม่มี evidence

## 5. Handoff
- สรุปให้คนรับงานทำต่อได้ทันที
- ระบุไฟล์, behavior ที่เปลี่ยน, verification, risk, next step
- งานเล็กใช้ handoff สั้นได้ แต่ต้องยังมี success criteria/evidence/risk ที่ตรวจกลับได้
- ทุก handoff/report ของ BDA ต้องมีหัวข้อบังคับ: `BDA Standard files used`, `Pipeline trace`, `Commands run`, `Verification / Evidence`, `Limitations / Risks / Next steps`
- `BDA Standard files used` ต้องระบุ path ของไฟล์มาตรฐานที่เปิด/อ้างอิงจริง ไม่ใช่ชื่อกว้าง ๆ
- `Pipeline trace` ต้องตามรอย Understand → Plan → Execute → Verify → Handoff และบอก command/workflow ที่ใช้ในแต่ละช่วง
- `Commands run` ต้องเป็นคำสั่งหรือ tool ที่รันจริงพร้อมผลสรุป ถ้าไม่ได้รันต้องเขียนว่าไม่ได้รันและเหตุผล

## 6. Standard Feedback Loop
- ใช้ `FEEDBACK.md`, `commands/standard-feedback.md`, `templates/standard-feedback.md`, และ `workflows/standard-improvement.md` เมื่อต้องการ feedback เพื่อปรับปรุง AKS AI Dev Standard (เดิม BDA AI Dev Standard) เอง
- รับ feedback ประเภท bug report, confusion, missing command, feature request, scenario request, adoption friction, AI output issue หรือข้อเสนออื่น ๆ ที่ทำให้ standard ดีขึ้น
- Feedback loop นี้แยกจาก performance process โดยสิ้นเชิง: ไม่ใช่ score, KPI, daily performance, หรือการประเมินบุคคล
- role/team ใน feedback เป็น optional usage context เท่านั้น ไม่ใช้ตัดสินผลงานรายบุคคล
- ทุกการแก้มาตรฐานต้องทำใน repo นี้ก่อน แล้ว verify ตาม `UPDATE-POLICY.md`

## Definition of Done
- Requirement หลักครบ
- Success criteria ทุกข้อมีผลลัพธ์หรือข้อจำกัดที่ระบุชัด
- Change เป็น minimum correct change และไม่มี speculative abstraction/config/feature
- ทุก changed line trace กลับไปยัง request หรือ verification ได้
- ไม่มี unrelated refactor, format churn, หรือ style-only change นอก scope
- ไม่มี fake evidence
- มี verification ที่เหมาะสมและ map กลับไปยัง success criteria
- มี handoff/report
- handoff/report มี BDA files used, pipeline trace, commands run, evidence, limitations ครบถ้วน
- ถ้าเป็น production-facing ต้องมี rollback หรือ mitigation
