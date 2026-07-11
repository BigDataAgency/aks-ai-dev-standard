# /init

ใช้ command หลักจาก `commands/init.md` เพื่อให้ Claude Code รู้จักโครงสร้าง Obsidian/project ก่อนใช้ `/plan-work`, `/fix-bug`, `/build-feature`, `/write-document`, `/test-report`, หรือ `/update-obsidian`

ต้องอ่าน/สร้าง Obsidian context manifest เช่น `00-Agent-Context.md` ตาม `templates/obsidian-context.md` และ work/evidence note ตาม `templates/obsidian-work-note.md` โดยยืนยัน vault/project/repo path ก่อนเขียนไฟล์เสมอ.

ติดตั้ง slash command โดย copy ไฟล์นี้ไปไว้ที่ `.claude/commands/init.md` ของ target repo แล้วเรียก `/init` ใน Claude Code แบบ interactive เท่านั้น.

หมายเหตุ: ใน print mode (`claude -p`) slash command แบบ interactive จะไม่ถูกรันโดยตรง ให้ reference ไฟล์ `commands/init.md` หรือ paste prompt จาก command แทน.

ต้องรายงานหัวข้อบังคับ: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps
