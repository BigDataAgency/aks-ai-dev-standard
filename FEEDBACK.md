# Feedback Loop: AKS AI Dev Standard (เดิม BDA AI Dev Standard)

ช่องทางนี้มีไว้สำหรับ feedback เพื่อปรับปรุง/แก้ไข/เพิ่มความสามารถของ **AKS AI Dev Standard** เท่านั้น เช่น command, workflow, template, policy, Claude/Codex support หรือคำอธิบายที่ทำให้ใช้งานง่ายขึ้น

## ขอบเขต

ใช้เมื่อผู้ใช้งานมาตรฐานพบว่า standard ควรปรับปรุง เช่น:

- Bug report: command/workflow ทำตามแล้วติดขัดหรือขัดกันเอง
- Confusion: อ่านแล้วไม่ชัดว่าต้องทำอะไรต่อ
- Missing command: ยังไม่มี command สำหรับ scenario ที่เจอบ่อย
- Feature request: อยากเพิ่ม capability ให้ standard
- Scenario request: อยากมีตัวอย่าง/flow สำหรับงานประเภทใหม่
- Adoption friction: ขั้นตอนเยอะเกินไป ติดตั้งยาก หรือ rollout ยาก
- AI output issue: AI ทำตาม standard แล้ว output ยังไม่ครบ/ไม่ตรง

## ไม่ใช่ performance

- Feedback นี้ **ไม่ใช่** performance review, score, KPI, หรือการประเมินคน
- ไม่ต้องผูกกับ operational reporting, attendance, productivity, หรือรายงานผลงานรายบุคคล
- ใช้เพื่อปรับปรุง product/process ของ AKS AI Dev Standard เพราะไม่ใช่ทุกทีม/ทุก role ใช้มาตรฐานนี้ และ non-dev ทีม อาจไม่เกี่ยวข้อง
- หากต้องระบุ role/team ให้ระบุแบบ optional เพื่อเข้าใจ context ของการใช้งาน ไม่ใช่เพื่อประเมินบุคคล

## วิธีส่ง feedback

1. ใช้ `commands/standard-feedback.md`
2. กรอก `templates/standard-feedback.md`
3. แนบ evidence เท่าที่ปลอดภัย เช่น snippet, command ที่ใช้, expected/actual, screenshot/link ที่ไม่เปิดเผยข้อมูลลับ
4. ส่งเป็น issue/PR/comment ในช่องทางที่ทีมกำหนด โดยอ้างว่าเป็น feedback ต่อ AKS AI Dev Standard

## Triage เบื้องต้น

- P0: standard ทำให้เกิดความเสี่ยงสูง เช่น fake evidence, destructive instruction, data leakage
- P1: command/workflow สำคัญใช้งานไม่ได้หรือทำให้ output ผิดซ้ำ
- P2: documentation สับสน มี missing scenario หรือ adoption friction
- P3: improvement/nice-to-have/template polish

## Output บังคับเมื่อปิด feedback

เมื่อ feedback ถูกนำไปแก้ใน repo นี้ ให้สรุปด้วยหัวข้อ:

- BDA Standard files used
- Pipeline trace
- Commands run
- Verification / Evidence
- Limitations / Risks / Next steps
