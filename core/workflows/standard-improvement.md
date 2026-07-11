# Workflow: Standard Improvement

## ใช้เมื่อ

ใช้เมื่อมี feedback จากผู้ใช้งาน AKS AI Dev Standard (เดิม BDA AI Dev Standard) และต้องการ triage, ออกแบบ, แก้ไข, verify, และ rollout การปรับปรุงมาตรฐาน

## ขอบเขต

- ปรับปรุง standard repo นี้ เช่น `core/commands/`, `core/workflows/`, `core/templates/`, `core/policies/`, `channels/llm-local/claude/`, `channels/llm-local/codex-local/`, `AI-README.md`, `STANDARD.md`
- แก้ bug/confusion/missing command/feature request/scenario/adoption friction/AI output issue ของมาตรฐาน
- ไม่แตะ performance process เว้นแต่มี requirement ชัดเจนและแยก scope ต่างหาก

## สำคัญ: แยกจาก performance

- workflow นี้ไม่ใช่ performance review, score, KPI, หรือการประเมินบุคคล
- ห้ามใช้ feedback นี้เป็น daily performance หรือหลักฐานประเมินรายบุคคล
- ใช้เพื่อปรับปรุง AKS AI Dev Standard เพราะผู้ใช้งานอาจเป็นเฉพาะทีมที่ใช้ standard และ non-dev ทีม อาจไม่เกี่ยวข้อง

## Steps

1. **Intake** — รับ feedback ผ่าน `core/commands/standard-feedback.md` และ `core/templates/standard-feedback.md`
2. **Triage** — จัดประเภทและ priority ตาม `FEEDBACK.md`
3. **Scope** — ระบุไฟล์มาตรฐานที่ต้องแก้และ non-goals
4. **Design** — เขียน expected behavior/acceptance criteria สำหรับ standard change
5. **Implement** — แก้ไฟล์ใน repo นี้เท่านั้นก่อน rollout
6. **Verify** — รัน smoke validation และตรวจว่าไม่มี linkage ไป performance โดยไม่จำเป็น
7. **Handoff/Rollout** — สรุป change, evidence, limitation และวิธีนำไปใช้ใน AI tools

## Verification

อย่างน้อยควรตรวจ:

- `python3 scripts/smoke-standard-scenarios.py`
- `git diff --check`
- manual check ว่าถ้อยคำบอกชัดว่า feedback loop นี้ไม่ใช่ performance
- manual check ว่า Claude support/command/template ถูกอ้างอิงครบถ้วนถ้ามีการแก้ที่เกี่ยวข้อง

## Required report sections

ทุกครั้งที่ใช้ workflow นี้ ต้องส่งรายงานท้ายงานเป็นภาษาไทยและมีหัวข้อเหล่านี้ครบถ้วน:

1. **BDA Standard files used** — ระบุ path ของไฟล์มาตรฐาน BDA ที่เปิด/อ้างอิงจริง เช่น `FEEDBACK.md`, `core/commands/standard-feedback.md`, `core/workflows/standard-improvement.md`, `core/templates/standard-feedback.md`, `UPDATE-POLICY.md`
2. **Pipeline trace** — ลำดับขั้นตอนที่ทำจริงตั้งแต่ Understand → Plan → Execute → Verify → Handoff พร้อม workflow/command ที่ใช้ในแต่ละช่วง
3. **Commands run** — คำสั่ง shell/tool/test/lint/build/search ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันคำสั่ง ให้ระบุ `ไม่ได้รัน` และเหตุผล
4. **Verification / Evidence** — หลักฐานผลตรวจจริง เช่น smoke validation, diff, manual wording check, issue/PR link
5. **Limitations / Risks / Next steps** — ข้อจำกัด ความเสี่ยง สิ่งที่ยังไม่ได้ตรวจ หรือขั้นตอนถัดไป

---
ใช้ workflow นี้เพื่อทำให้ AKS AI Dev Standard ดีขึ้นอย่างต่อเนื่อง โดยไม่ผูกกับการประเมินผลงานรายบุคคล.
