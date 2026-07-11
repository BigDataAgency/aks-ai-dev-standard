# Hybrid AI Usage Discipline

เอกสารนี้ใช้เป็นกติกาหน้างานหลังเปิด hybrid routing ระหว่าง local GPU และ paid cloud เพื่อให้ทีมใช้ BDA AI Dev ได้เร็วขึ้น ลด queue, ลด token ที่ไม่จำเป็น, และลด error จาก session/config เก่า

## ปัญหาที่พบจาก log

- prompt ใหญ่ 15k-55k tokens ทำให้รอ prefill/queue นาน แม้ model ยังทำงานได้
- มีการสั่ง scan codebase หรืออ่าน repo ซ้ำหลายรอบใน session เดิม
- มี task กว้าง เช่น "ดู repo ให้หน่อย", "ทำต่อ", "เช็ก error" โดยไม่มีไฟล์ คำสั่ง error หรือ success criteria
- มี session เก่าหลายวันค้างอยู่ แล้วใช้ต่อจน context/config/model stale
- มีคนยิงงานซ้ำหรือเปิดหลาย agent ใน repo/task เดียวกัน ทำให้แย่ง local GPU และดัน paid overflow เร็วขึ้น
- error 400 ที่พบจำนวนหนึ่งเกิดจาก metadata/session ไม่ครบหรือ client เก่า ส่วน error 500/502 มักสัมพันธ์กับ upstream/fallback/queue/timeout ต้องแยกจาก bug ใน codebase
- มี request ที่ context ใหญ่มากถูกส่งซ้ำ ทำให้ A40 ต้อง prefill/KV cache นาน และสุดท้ายถูก route ไป paid โดยที่พนักงานยังไม่รู้ว่าพฤติกรรมนี้ทำให้คนอื่นรอ

## ข้อห้าม

1. ห้ามสั่ง `scan codebase ทั้งหมด` ซ้ำใน session เดิม  
   ให้ scan ครั้งเดียวตอนเริ่มงาน แล้วบังคับ AI สรุป code map, ไฟล์สำคัญ, และ open questions ไว้ใช้ต่อ

2. ห้ามถามงานกว้างโดยไม่มีขอบเขต  
   ตัวอย่างที่ควรเลิกใช้: "ดูให้หน่อย", "ทำต่อ", "แก้ให้หมด", "เช็กระบบ", "อ่านทุกไฟล์ก่อน", "ทำให้ production พร้อม"

3. ห้ามส่ง repo/log/chat history ทั้งก้อนซ้ำ  
   ให้ส่งเฉพาะ path, command ที่รัน, error บรรทัดสำคัญ, timestamp, expected/actual result

4. ห้ามเปิดหลาย agent ทำงาน task เดียวกันพร้อมกัน  
   หนึ่ง repo + หนึ่ง task ควรมี active agent เดียว ถ้าต้องแยกงานให้แยกไฟล์หรือ module ชัดเจน

5. ห้ามใช้ session เก่าข้ามวันสำหรับงานจริง  
   ถ้างานค้าง ให้ทำ handoff สั้น ปิด session แล้วเปิด session ใหม่พร้อม context summary

6. ห้าม retry error เดิมเกิน 2 รอบโดยไม่เปลี่ยนข้อมูล  
   ถ้าเจอ 400/500/502 ให้เก็บ error, model, เวลา, request summary แล้วแก้ config/session หรือ fallback ตาม SOP ก่อนยิงซ้ำ

7. ห้ามใช้ paid เป็น default สำหรับงานเล็ก  
   paid ใช้เมื่อ local queue สูง, งานซับซ้อน, context ต้อง reasoning หนัก, หรือ verification สำคัญ ไม่ใช่สำหรับถาม casual/setup

8. ห้ามส่ง context ใหญ่ซ้ำเพื่อให้ระบบ paid รับแทน  
   ถ้า request ถูกปัดออกจาก A40 เพราะ prompt/context ใหญ่หรือ queue นาน ระบบจะบันทึก employee, session, task และ reason comment ไว้เพื่อ feedback ให้ปรับวิธีใช้ ไม่ใช่ช่องทางให้ส่งของใหญ่ได้เรื่อย ๆ

9. ห้ามให้ AI claim ว่า test/build/lint ผ่านโดยไม่ได้รันจริง  
   ต้องมี command output หรือ manual evidence ที่ map กลับไปยัง success criteria

10. ห้ามถามให้ AI เดาจาก screenshot ถ้ามี text log อยู่แล้ว  
   screenshot ใช้เสริมได้ แต่ error หลักต้อง paste เป็น text เพื่อไม่เสีย token และลดการอ่านผิด

11. ห้ามเริ่มงานโดยไม่เลือก command/workflow  
    ก่อนคุยกับ AI ต้องรู้ว่าเป็น `understand-task`, `plan-work`, `fix-bug`, `build-feature`, `review-change`, `verify-work`, หรือ `handoff-report`

## กฎการ scan codebase

- Scan ครั้งแรกของงาน: อนุญาตให้ AI ทำ repo map แบบจำกัด เช่น tree, package files, routing, config, tests, และไฟล์ที่ match keyword
- หลัง scan ครั้งแรก: ห้ามสั่ง full scan ซ้ำ ให้ใช้ targeted search เท่านั้น เช่น path/module/function/error string
- ถ้าเปลี่ยน scope: ให้บอก scope ใหม่และให้ scan เฉพาะ module ใหม่
- ถ้ารับงานต่อ: ให้เริ่มจาก handoff/session note/diff ก่อน ไม่เริ่มจาก full repo scan

ตัวอย่าง prompt ที่ควรใช้:

```text
ใช้ commands/understand-task.md สแกน repo map ครั้งเดียว เฉพาะ routing, package config, module payment และ test ที่เกี่ยวข้อง
จากนั้นสรุปไฟล์สำคัญไม่เกิน 10 ไฟล์ และรอ plan-work ก่อนแก้
```

## คำถามที่ควรถามให้ชัด

แทนที่จะถาม:

```text
ช่วยดู error ให้หน่อย
```

ให้ถาม:

```text
ใช้ commands/fix-bug.md
project: <ชื่อโปรเจกต์>
error: <paste error text>
command: <คำสั่งที่ทำให้ error>
path ที่สงสัย: <ไฟล์/โมดูล>
expected: <ควรเกิดอะไร>
actual: <เกิดอะไร>
ให้ค้นเฉพาะ path/module ที่เกี่ยวข้องก่อน ถ้าไม่เจอค่อยขอขยาย scope
```

แทนที่จะถาม:

```text
ทำต่อจากเมื่อวาน
```

ให้ถาม:

```text
ใช้ commands/resume-pending-work.md
อ่าน handoff ล่าสุด/session note/diff ก่อน
สรุป current state, remaining tasks, และคำสั่ง verify ที่ต้องรัน
ห้าม scan ทั้ง repo ซ้ำ เว้นแต่ handoff ระบุว่า context ขาด
```

แทนที่จะถาม:

```text
เช็กว่า build/lint/test ผ่านไหม
```

ให้ถาม:

```text
ใช้ commands/verify-work.md
success criteria: <รายการ>
รันคำสั่ง verify ที่ repo รองรับจริง
สรุป pass/fail พร้อม command output ที่สำคัญ และระบุส่วนที่ไม่ได้ตรวจ
```

## แผนการใช้ command

| สถานการณ์ | Command ที่ใช้ | เป้าหมาย |
| --- | --- | --- |
| เข้า repo/project ครั้งแรก | `commands/init.md` | สร้าง Obsidian/project context manifest หนึ่งครั้ง |
| เริ่มเข้าใจงาน | `commands/understand-task.md` | จำกัด scope, scan ครั้งเดียว, ระบุไฟล์สำคัญ |
| วางแผนก่อนแก้ | `commands/plan-work.md` | success criteria, plan, risks, verification |
| ทำ feature ใหม่ | `commands/build-feature.md` | ลงมือทำตาม plan โดยไม่ขยาย scope |
| แก้ bug | `commands/fix-bug.md` | reproduce, root cause, minimal fix, verify |
| รับงานค้าง | `commands/resume-pending-work.md` | อ่าน handoff/diff/session note ก่อน ไม่ scan ใหม่ทั้ง repo |
| review โค้ด | `commands/review-change.md` | หา bug/regression/missing test จาก diff |
| ตรวจของจริง | `commands/verify-work.md` | build/lint/test/manual evidence |
| เช็ก app จริง | `commands/check-real-app.md` | visible user journey และ evidence |
| เขียนเอกสาร | `commands/write-document.md` | docs ที่มี source/evidence ชัด |
| อัปเดต Obsidian | `commands/update-obsidian.md` | บันทึก context/session/evidence |
| ส่งงาน | `commands/handoff-report.md` | handoff สั้น มี commands/evidence/risk |
| ปรับ standard | `commands/standard-feedback.md` | feedback เพื่อแก้มาตรฐาน ไม่ใช่ประเมินคน |

## Flow มาตรฐานต่อหนึ่งงาน

1. เปิด session ใหม่ด้วย metadata ครบ: project, task_summary, command, work_type, employee code
2. ใช้ `understand-task` เพื่อ scan จำกัดครั้งเดียว
3. ใช้ `plan-work` เพื่อกำหนด success criteria และ verification
4. ใช้ command เฉพาะงาน เช่น `fix-bug` หรือ `build-feature`
5. ใช้ `verify-work` ก่อนสรุปผล
6. ใช้ `handoff-report` แล้วปิด session เมื่อจบงานหรือจบวัน

## แนวทางใช้ hybrid/paid

- local GPU เหมาะกับงานเล็กถึงกลาง, targeted edit, review diff, สรุปไฟล์เฉพาะจุด
- paid cloud เหมาะกับงานที่ queue local สูง, context จำเป็นจริง, reasoning ยาก, หรือ final verification สำคัญ
- ถ้า queue ยาว ให้ลด context ก่อน ไม่ใช่เพิ่ม retry
- ถ้าเจอ 400 เรื่อง metadata/session ให้แก้ session/client ก่อน เพราะ retry ไม่ช่วย
- ถ้าเจอ 500/502 ให้เช็ก upstream/fallback/queue และเก็บ timestamp เพื่อให้ monitor ฝั่ง gateway ตรวจต่อ

## Gateway guardrail ปัจจุบัน

ระบบจะพยายามใช้ Local A40 ก่อนเสมอ แต่ถ้า request เริ่มกิน resource จนกระทบคนอื่น gateway จะย้ายออกไป paid พร้อมบันทึกเหตุผลไว้ใน Admin A40 และ spend log

| เงื่อนไข | Action | Metadata ที่เก็บ |
| --- | --- | --- |
| GPU ทั้ง 2 เครื่องเกิน threshold | Route ไป paid fallback | employee, project, session, task, route reason |
| prompt/context เกินประมาณ 25K tokens | Route ไป paid ก่อนจอง A40 นาน | employee, session, task, prompt estimate, route comment |
| local queue รอนานเกินประมาณ 20s | Route ไป paid เพื่อลดคอขวด | employee, session, task, queue wait, route comment |

Route comment มีไว้เพื่อ feedback เช่น "context ใหญ่เกิน", "queue รอนาน", "ควรสรุปก่อนส่ง", "ควรแบ่ง phase" ไม่ใช่เพื่อจับผิดคน แต่เพื่อให้ทีมเห็นว่าพฤติกรรมไหนทำให้ A40 ช้าและ paid cost เพิ่ม

ถ้างานต้องใช้ context ใหญ่จริง ให้ทำแบบนี้ก่อน:

1. ใช้ subscription AI วาง phase/plan ก่อน
2. สรุป repo map, files, error, expected/actual ให้สั้น
3. ส่งเฉพาะ context ที่เกี่ยวกับ phase ปัจจุบันเข้า `bda/dev`
4. จบ phase ให้ handoff สั้น แล้วค่อยเปิด phase ถัดไป

## Checklist สำหรับหัวหน้าทีม

- แต่ละคนมี active session เกิน 1 งานหรือไม่
- มี prompt ที่เกิน 20k tokens โดยไม่จำเป็นหรือไม่
- มี route comment ว่า context ใหญ่/queue นานซ้ำจากคนเดิมหรือไม่
- มีคำว่า "scan all", "อ่านทุกไฟล์", "ทำต่อ" โดยไม่มี handoff หรือไม่
- มี retry error เดิมหลายรอบหรือไม่
- มีงานที่ใช้ paid แต่ไม่มี success criteria หรือ verification หรือไม่
- มี session เก่าข้ามวันโดยไม่มี handoff หรือไม่
