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
- PM / PM lead commands → `commands/pm-log.md`, `commands/pm-standup.md`, `commands/pm-status.md`, `commands/pm-risk.md`, `commands/pm-followup.md`, and `commands/pm-requirement.md`.
- Work event logging → `docs/ai-work-event-logging.md`, `docs/bda-session-cli.md`, `scripts/bda.mjs`, and `scripts/bda-work-event.mjs`.
- Hermes / Windsurf / IDE setup → `docs/tool-setup-hermes-windsurf-ide.md`.
- Keep command names stable. Improve the workflow behind existing commands instead of inventing new names unless the user explicitly requests a new command or the standard is being versioned with a migration note.

## Work event logging

- งาน BDA จริงที่ใช้ command/workflow ของ standard ต้องบันทึก work event เพื่อใช้แทน daily log/manual PM log
- การคุยเล่น ทดลอง tool ครั้งแรก หรือคำถามทั่วไปไม่ต้องบังคับ metadata
- ถ้าผู้ใช้พิมพ์ `bda start` ให้ draft metadata ก่อนแล้วถามให้ผู้ใช้ตรวจ/แก้ ได้แก่ `project`, `task_summary`, `command`, `work_type`, `employee_code`, `employee_group`, `ai_provider`, `ai_model`, และ `used_bda_gateway`; อย่าเริ่มงานจริงจนกว่าจะยืนยัน metadata สำคัญ
- สำหรับ Hermes/local model ให้ใช้ metadata confirmation แบบสั้นเท่านั้น; อย่า paste standard ยาวหรือ JSON ก้อนใหญ่ถ้าไม่จำเป็น
- ระหว่าง active session ให้รับคำสั่งรูปแบบ `bda-dev-debug: <prompt>`, `bda-nondev-explore: <prompt>`, `bda-pm-status: <prompt>` แล้ว map เป็น work event ของ command นั้น
- ถ้าผู้ใช้พิมพ์ `bda help` ให้สรุป command catalog จาก `docs/bda-session-cli.md`
- ถ้าผู้ใช้พิมพ์ `bda stop` ให้สรุป outcome/status/blocker/next step แล้วส่งหรือเตรียม stop event โดยต้องใช้ session_id/project/task เดิมจาก active `bda start`; ห้ามเดา session ใหม่
- เมื่อมีการใช้ command เช่น `fix-bug`, `review-change`, `build-feature`, `write-document`, `test-report`, หรือ PM command ให้เก็บอย่างน้อย: `employee_code`, `employee_group`, `command`, `task_summary`, `work_type`, `project`, `tool`, `ai_model`, `status`, `outcome`, `tokens` ถ้ามี, และ `duration_ms` ถ้ามี
- ส่ง event ผ่าน `scripts/bda.mjs`, `scripts/bda-work-event.mjs`, หรือ integration ที่ compatible กับ contract ใน `docs/ai-work-event-logging.md`
- ห้าม hardcode production endpoint, API key, employee key, หรือ private IP ใน public repo; ใช้ env/config ของเครื่องผู้ใช้หรือ private rollout package เท่านั้น
- ถ้า endpoint ใช้งานไม่ได้ ให้บันทึก local fallback/outbox แล้วระบุ limitation ใน handoff

## Model/context/vision routing

- Local/Qwen coding model: ใช้กับ text/code แบบ targeted เท่านั้น อ่านเฉพาะไฟล์/ช่วงที่เกี่ยวข้อง
- Context ใกล้เต็ม: สรุปสิ่งที่รู้ 5-8 bullet แล้วเปิด session ใหม่หรือ route ไป model context ใหญ่
- งานภาพ/screenshot/จุดที่วง/doc image: ให้ใช้ Gemini/NotebookLM/vision model อ่านภาพก่อน แล้วเอาสรุปกลับมาทำงานต่อใน Hermes; ห้ามฝืนเดาภาพด้วย text-only/local coder

## Working rules

- สำรวจก่อนแก้เสมอ: files, tests, scripts, git status
- สรุปความเข้าใจ ความเสี่ยง และ success criteria ก่อนลงมือ; เมื่อ scope ไม่ชัดให้ระบุ assumption
- ใช้ patch/edit แบบ targeted และเลือก minimum correct change
- ทำตาม existing patterns ก่อนสร้าง pattern ใหม่
- หลีกเลี่ยง speculative abstraction/config/dependency/feature และ unrelated refactor/format churn
- ทุก changed line ต้อง trace กลับไปยัง request, bug, success criteria, หรือ verification ได้
- ถาม clarification เฉพาะ ambiguity ที่กระทบ scope, data safety, security, หรือ correctness
- สำหรับงานเล็ก ให้ workflow เบา: success criteria, minimum correct change, verification, risk; อย่าเพิ่มรายงานยาวถ้าไม่ช่วยตรวจงาน
- งาน bug fix ต้อง reproduce หรืออธิบายให้ชัดว่าทำไม reproduce ไม่ได้, หา root cause, แก้แบบ minimal, และทำ regression check
- รัน verification ที่เกี่ยวข้องก่อนสรุป และ map ผลตรวจกลับไปยัง success criteria
- ห้าม claim ว่ารัน test หรือใช้งานได้ ถ้าไม่ได้รัน/ตรวจจริง

## Final response

ตอบภาษาไทยแบบกระชับ พร้อมหัวข้อ:

- Summary
- Files changed
- Tests / Evidence
- Risks / Limitations
- Next steps
