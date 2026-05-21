# AGENTS.md — BDA AI Dev Standard for Codex

ใช้ไฟล์นี้เป็น project instruction สำหรับ Codex โดย copy ไปไว้ที่ root ของ repo เป้าหมายเป็น `AGENTS.md`.

## Entry point

- ถ้า repo เป้าหมายมี `AI-README.md` ให้ใช้ไฟล์นั้นเป็น entrypoint เพิ่มเติม
- ถ้าไม่มี `AI-README.md` ให้ทำตามกติกาในไฟล์นี้ได้ทันที ห้ามหยุดงานเพราะหา entrypoint ไม่เจอ
- ถ้างานผูกกับ Obsidian ให้หา `00-Agent-Context.md` หรือ `.bda/obsidian-context.md`; ถ้าไม่มีและต้องใช้ context ให้ทำตาม `commands/init.md`

## Obsidian context

- ใช้ `commands/init.md` เพื่อสำรวจ vault/project และสร้าง `00-Agent-Context.md` จาก `templates/obsidian-context.md`
- หลังมี context แล้ว `plan-work`, `fix-bug`, `build-feature`, `write-document`, `test-report`, และ `update-obsidian` ต้องอ่าน manifest ก่อนทำงาน
- เมื่อทำงานเสร็จให้อัปเดต session/evidence note ตาม `templates/obsidian-work-note.md` ถ้า write scope อนุญาต
- ห้ามสร้าง testcase/evidence ปลอม; ถ้าไม่ได้ตรวจจริงให้เขียน `pending evidence` หรือ `not available`

## Command Pack

Codex uses this file as agent instruction; it does not use Claude Code slash commands. When asked for commands, reference normal command names:

- `test-report` → `commands/test-report.md` and `commands/test-scenario-report.md`; QA/product evidence only, not individual evaluation.

## Working rules

- สำรวจก่อนแก้เสมอ: files, tests, scripts, git status
- สรุปความเข้าใจและความเสี่ยงก่อนลงมือ เมื่อ scope ไม่ชัดให้ระบุ assumption
- ใช้ patch/edit แบบ targeted หลีกเลี่ยง refactor นอก scope
- งาน bug fix ต้อง reproduce หรืออธิบายให้ชัดว่าทำไม reproduce ไม่ได้, หา root cause, แก้แบบ minimal, และทำ regression check
- รัน verification ที่เกี่ยวข้องก่อนสรุป
- ห้าม claim ว่ารัน test หรือใช้งานได้ ถ้าไม่ได้รัน/ตรวจจริง

## Final response

ตอบภาษาไทยแบบกระชับ พร้อมหัวข้อ:

- Summary
- Files changed
- Tests / Evidence
- Risks / Limitations
- Next steps
