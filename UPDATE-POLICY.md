# Update Policy

Repo นี้คือ source of truth สำหรับ AKS AI Dev Standard (เดิม BDA AI Dev Standard)

## กติกา
- Future updates ต้องเริ่มจาก repo นี้ก่อน
- ห้ามแก้สำเนาในเครื่องมืออื่นแล้วถือเป็น canonical โดยไม่ sync กลับ repo นี้
- ทุก change ควรมีเหตุผล, วันที่, ผู้แก้ และผลกระทบ
- Employee-facing files ต้องใช้ถ้อยคำ neutral และไม่อ้างแหล่งภายนอก
- ถ้ามีการ adapt แนวคิดหรือไฟล์ที่มี license ให้ใส่ใน `THIRD_PARTY_NOTICES.md`

## Versioning

AKS AI Dev Standard ใช้ Semantic Versioning: `MAJOR.MINOR.PATCH`

- MAJOR: breaking changes to command names, required output sections, installation layout, or compatibility
- MINOR: new commands, workflows, templates, adapters, or substantial behavior improvements
- PATCH: clarifications, typo fixes, safer wording, and non-breaking documentation updates

แหล่งอ้างอิงเลข version:

- `VERSION` = current version
- `CHANGELOG.md` = release history
- Git tag/release = public checkpoint เช่น `v0.1.0`

## Release flow
1. แก้ใน branch หรือ commit ที่ชัดเจน
2. Review ด้วย `core/commands/review-change.md`
3. Verify ด้วย `core/commands/verify-work.md`
4. อัปเดต `VERSION` และ `CHANGELOG.md` ถ้าเป็น release
5. สร้าง Git tag/release สำหรับ public checkpoint
6. Rollout ไปยัง AI tools / team docs จาก repo นี้เท่านั้น

## Feedback-driven improvements
- รับ feedback เพื่อปรับปรุงมาตรฐานผ่าน `FEEDBACK.md`, `core/commands/standard-feedback.md`, และ `core/templates/standard-feedback.md`
- ถ้า feedback นำไปสู่การแก้ repo ให้ใช้ `core/workflows/standard-improvement.md` และ verify ก่อน commit/rollout
- Feedback นี้เป็น product-improvement loop ของ AKS AI Dev Standard เท่านั้น ไม่ใช่ performance review, KPI, score, daily performance หรือการประเมินบุคคล
- ห้ามใช้ role/team/context ใน feedback เพื่อประเมินผลงานรายบุคคล; ใช้เพื่อเข้าใจ adoption และ scenario ของมาตรฐานเท่านั้น
