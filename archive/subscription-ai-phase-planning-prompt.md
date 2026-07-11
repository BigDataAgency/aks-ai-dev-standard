# Subscription AI Phase Planning Prompt

ใช้ไฟล์นี้ตอนคุยกับ subscription AI ภายนอกเพื่อ “วางแผนและแตก phase” ก่อนนำงานไปทำจริงบน BDA local LLM / A40 ผ่าน `bda/dev`

เป้าหมายคือให้ AI ช่วยลด context, ลด PF/KV cache, ลดการจับ GPU ค้าง และทำให้พนักงานไม่ต้องอธิบายข้อจำกัดซ้ำทุกครั้ง

## Copy Prompt

```text
คุณคือ AI planning assistant ที่ช่วยเตรียมแผนงานให้ทีม BDA ก่อนนำไปทำจริงบน local LLM/A40 ผ่าน BDA AI Gateway model `bda/dev`

บริบทสำคัญ:
- งานจริงจะไปทำต่อบน local LLM/A40 ไม่ใช่ทำทั้งหมดใน subscription chat นี้
- local LLM/A40 ต้องใช้ context ให้เล็กและตรงประเด็นที่สุด
- context ยิ่งเยอะ = Prefill (PF) ยิ่งหนัก + KV Cache ยิ่งใหญ่ + GPU ถูกจับนาน + คนอื่นรอ
- ห้ามออกแบบแผนที่ต้อง paste repo/log/chat history ทั้งก้อน
- ห้ามแนะนำให้ scan ทั้ง repo ซ้ำหลายรอบ
- ห้ามให้ทำงานหลาย agent พร้อมกันใน repo/task เดียวกัน
- ให้แบ่งงานเป็น phase เล็ก ๆ ที่ทำต่อใน `bda/dev` ได้ทีละช่วง
- แต่ละ phase ต้องมี input เฉพาะที่จำเป็น เช่น path, file, error, expected/actual, command
- ถ้า context ยาว ให้สรุปก่อน แล้วส่งต่อเฉพาะ summary + file/path ที่เกี่ยวข้อง
- เมื่อจบงานจริงใน local LLM ต้องให้พนักงานปิด session ด้วย `bda stop`

กรุณาช่วยวางแผนงานจากข้อมูลด้านล่าง โดยตอบเป็นภาษาไทย กระชับ และพร้อมให้เอาไปใช้กับ local LLM/A40

ข้อมูลงาน:
Project:
<ใส่ชื่อ project>

Goal / Task:
<ใส่งานที่ต้องการทำ>

Current problem / error:
<ใส่ error หรือปัญหา ถ้ามี>

Relevant files / paths:
<ใส่ path เท่าที่รู้ ถ้ายังไม่รู้ให้บอกว่ายังไม่รู้>

Constraints:
<ใส่ข้อจำกัด เช่น ห้ามแก้ schema, ห้ามกระทบ API เก่า, ต้อง deploy วันนี้>

Expected result:
<ใส่ผลลัพธ์ที่ต้องการ>

กรุณาตอบตาม format นี้:

1. สรุปโจทย์สั้น ๆ
   - สรุปว่าเรากำลังจะทำอะไร
   - ระบุสิ่งที่ไม่ควรทำหรือไม่ควรแตะ

2. ข้อมูลที่ควรส่งเข้า `bda/dev`
   - project:
   - task_summary:
   - command ที่ควรใช้: bda-dev / bda-nondev / bda-pm
   - work_type ที่เหมาะ: debug / implementation / review / test / plan / documentation / pm
   - context ที่จำเป็นจริง ๆ:
   - context ที่ไม่ควรส่ง:

3. แผน phase สำหรับทำบน local LLM/A40
   แบ่งเป็น phase เล็ก ๆ โดยแต่ละ phase ต้องมี:
   - เป้าหมาย
   - input/context ที่ต้องใช้เท่านั้น
   - path/file ที่เกี่ยวข้อง
   - command/test ที่ควรรัน
   - expected output
   - stop condition ว่าควรหยุด phase นี้เมื่อไร

4. Prompt สำหรับเริ่มใน `bda/dev`
   เขียน prompt สั้น ๆ ที่พนักงาน copy ไปใช้กับ local LLM ได้ทันที
   ต้องไม่ยาวเกินจำเป็น
   ต้องไม่บอกให้ scan repo ทั้งก้อน ถ้าไม่มีเหตุผล

5. Risk / Watch out
   - ความเสี่ยงทาง code/product/data
   - จุดที่อาจทำให้ context บวม
   - จุดที่ควรถาม user เพิ่มก่อนลงมือ

6. Handoff summary template
   ทำ template สั้น ๆ สำหรับสรุปหลังจบ phase เพื่อเอาไปต่อ phase ถัดไปโดยไม่ต้องลาก context เก่าทั้งหมด
```

## Short Version

ใช้เมื่ออยากถามเร็ว ๆ แต่ยังอยากให้ AI คุม context ให้เหมาะกับ A40

```text
ช่วยแตกงานนี้เป็น phase เพื่อเอาไปทำต่อบน BDA local LLM/A40 ผ่าน `bda/dev`

ข้อจำกัด:
- local LLM ต้องใช้ context เล็ก
- context ใหญ่ทำให้ PF/KV cache ใหญ่และกิน GPU
- อย่าให้ paste repo/log/chat history ทั้งก้อน
- อย่าให้ scan repo ซ้ำถ้าไม่จำเป็น
- แต่ละ phase ต้องมี input/path/test/expected output ชัดเจน
- จบงานจริงต้อง `bda stop`

งาน:
<ใส่งาน>

ตอบเป็น:
1. task_summary สำหรับ `bda start`
2. phase plan 3-6 phase
3. context ที่ต้องส่งให้ local LLM
4. context ที่ห้าม/ไม่ควรส่ง
5. prompt สั้นสำหรับเริ่ม phase แรกใน `bda/dev`
6. handoff summary template สำหรับต่อ phase ถัดไป
```

## How To Use

1. คุยกับ subscription AI ด้วย prompt ด้านบน
2. เอาเฉพาะ plan, phase แรก, path/file/error ที่เกี่ยวข้อง ไปใช้กับ `bda/dev`
3. เปิดงานจริง:

```bash
bda start --project "<project>" --task "<task_summary>" --command bda-dev --work-type plan
```

4. ทำทีละ phase อย่าลาก context เก่าทั้งหมด
5. ถ้าต้องต่อ phase ให้ใช้ handoff summary ไม่ใช่ paste chat ทั้งก้อน
6. จบงาน:

```bash
bda stop --status done --outcome "<สรุปผลลัพธ์>" --next-step "<ถ้ามี>"
```

## Good Output Checklist

ก่อนเอาแผนจาก subscription AI ไปใช้กับ local LLM ให้เช็กว่า:

- [ ] มี phase เล็กพอทำทีละช่วง
- [ ] ระบุ path/file/input ที่จำเป็น
- [ ] ไม่มีคำสั่งให้ paste ทั้ง repo
- [ ] ไม่มีคำสั่งให้ scan repo ซ้ำโดยไม่จำเป็น
- [ ] มี command/test ที่ควรรัน
- [ ] มี expected output ของแต่ละ phase
- [ ] มี stop condition ของแต่ละ phase
- [ ] มี handoff summary สำหรับต่อ phase ถัดไป
- [ ] prompt สำหรับ local LLM สั้นและตรงงาน

## Bad Patterns

หลีกเลี่ยง prompt หรือแผนแบบนี้:

- “อ่านทั้ง repo แล้วแก้ให้หน่อย”
- “นี่คือ log ทั้งหมดของวันนี้ ช่วยดูทุกอย่าง”
- “ทำทุก feature ในครั้งเดียว”
- “เปิด agent หลายตัวให้ช่วยกันแก้ repo เดียวกัน”
- “ถามซ้ำใน chat เดิมพร้อม context เดิมทุกครั้ง”
- “ให้ local LLM สรุป history ยาว ๆ ที่ไม่เกี่ยวกับ phase ปัจจุบัน”

## Recommended Local Prompt Shape

หลังจากได้ plan แล้ว prompt ที่เอาไปใช้กับ `bda/dev` ควรหน้าตาประมาณนี้:

```text
Project: <project>
Task: <phase เฉพาะช่วงนี้>

Goal:
<เป้าหมาย phase นี้>

Relevant context only:
- <path/file 1>
- <path/file 2>
- Error: <error ที่เกี่ยวข้อง>
- Expected: <ผลลัพธ์ที่ต้องการ>

Do not scan the whole repo unless these paths are insufficient.
Work only on this phase.
Run/describe verification:
- <command/test>

Stop when:
<เงื่อนไขจบ phase>
```

