# CLAUDE.md — BDA AI Dev Standard

ใช้เอกสารนี้เมื่อทำงานในโปรเจกต์ BDA

1. อ่าน `AI-README.md`
2. เลือก command ใน `commands/`
3. ทำงานตาม `STANDARD.md`
4. ตรวจด้วย policies และ checklists
5. สรุปภาษาไทยพร้อม evidence

## Coding discipline

- ก่อนแก้ ให้ระบุ success criteria ที่ตรวจได้
- ทำ minimum correct change ตาม pattern เดิมของ repo
- ห้ามเพิ่ม speculative abstraction/config/dependency/feature หรือ unrelated refactor/format churn
- ทุก changed line ต้อง trace กลับไปยัง request, bug, success criteria, หรือ verification ได้
- ถาม assumption/ambiguity เฉพาะเมื่อกระทบ scope, data safety, security, หรือ correctness
- Verification / Evidence ต้อง map กลับไปยัง success criteria และบอกข้อที่ยังไม่มีหลักฐานจริง

## Thai output self-review (บังคับ)

โมเดล local (Qwen3.6) มีจุดอ่อนตอน generate ภาษาไทย: สระ/วรรณยุกต์อาจเพี้ยนเป็นรายครั้ง (เช่น "สั้่น", "น้ี") แต่โมเดลอ่าน/ตรวจ/แก้ภาษาไทยได้แม่น ดังนั้น: <!-- thai-check:ignore -->

- งานที่สร้างหรือแก้ข้อความภาษาไทย (string ใน code, comment, เอกสาร, commit message): **ก่อนปิดงาน ให้อ่านทวนข้อความไทยทั้งหมดที่เพิ่งเขียน** ตรวจสระ/วรรณยุกต์เพี้ยน ลำดับผิด หรือคำสะกดผิด แล้วแก้ให้ถูกต้องก่อนส่งมอบ
- ถ้ามี BDA CLI ให้รัน `bda thai-check <ไฟล์ที่แก้>` หรือ `bda thai-check --diff` เป็น safety net สุดท้ายก่อน commit (ดู `docs/thai-output-safety.md`)
- ห้ามข้ามขั้นตอนนี้แม้งานเล็ก — ความเพี้ยนเกิดเป็นรายครั้งจึงคาดเดาไม่ได้

## ติดตั้งใน target repo

1. Copy ไฟล์นี้ไปเป็น `CLAUDE.md` ที่ root ของ target repo
2. Copy `claude/commands/*.md` ไปไว้ที่ `.claude/commands/` ของ target repo
3. เปิด Claude Code แบบ interactive ใน target repo แล้วใช้ slash commands ได้ เช่น `/init`, `/fix-bug`, `/review-change`, `/build-feature`, `/write-document`, `/verify-work`, `/standard-feedback`, `/test-report`
4. สำหรับ PM / PM lead ให้ copy slash commands เพิ่ม: `/pm-log`, `/pm-standup`, `/pm-status`, `/pm-risk`, `/pm-followup`, `/pm-requirement`

หมายเหตุ: slash commands ใช้กับ interactive Claude Code เท่านั้น; ใน print mode (`claude -p`) ให้ reference path ของ command หรือ paste เนื้อหา command แทน เพราะ `/command` จะไม่ทำงานแบบ interactive

## Command aliases

ใช้ชื่อปกติใน Claude Code interactive เท่านั้น:

- `/test-report` → `commands/test-report.md` และ `commands/test-scenario-report.md`
- `/pm-log` → `commands/pm-log.md`
- `/pm-standup` → `commands/pm-standup.md`
- `/pm-status` → `commands/pm-status.md`
- `/pm-risk` → `commands/pm-risk.md`
- `/pm-followup` → `commands/pm-followup.md`
- `/pm-requirement` → `commands/pm-requirement.md`

หมายเหตุ: slash commands ใช้กับ Claude Code interactive เท่านั้น; Gemini/Claude coworker ใช้ prompt commands และ Codex ใช้ agent instruction.

## Slash command UX

ใช้ slash command ชุดเดิมเป็น default เช่น `/fix-bug`, `/build-feature`, `/review-change`, `/plan-work`, `/test-report`, และ `/standard-feedback`. เมื่อมาตรฐานเพิ่ม discipline ให้เพิ่มใน workflow ภายใน command ไม่ใช่เปลี่ยนชื่อ command หรือบังคับขั้นตอนยาวเกินงาน.

- งานเล็ก: ถาม/รายงานเฉพาะ success criteria, minimum correct change, verification, risk
- งานกลาง/ใหญ่: เพิ่มแผน phase, rollout, และ evidence mapping ตามความเสี่ยง
- ถาม clarification เฉพาะเมื่อ ambiguity กระทบ scope, data safety, security, หรือ correctness
- ถ้าไม่กระทบ ให้ระบุ assumption แล้วทำต่อแบบเล็กที่สุด

## Obsidian init context

ใช้ `/init` หรือ `commands/init.md` เมื่อ project ต้องให้ Claude รู้จักโครงสร้าง Obsidian ก่อนทำงาน. Init ต้องสร้าง/อัปเดต `00-Agent-Context.md` ตาม `templates/obsidian-context.md` และ session/evidence notes ตาม `templates/obsidian-work-note.md`.

หลังมี context แล้ว `/plan-work`, `/fix-bug`, `/build-feature`, `/write-document`, `/test-report`, และ `/update-obsidian` ต้องอ่าน manifest ก่อนทำงาน และอัปเดต session/evidence note เป็น default โดยไม่สร้างหลักฐานปลอม.

## Test Scenario Report สำหรับ QA/product evidence

ใช้ `/test-report` หรือ `commands/test-report.md` เมื่อต้องการทำ test case/scenario, capture screenshot, ตรวจ console/network และสร้างรายงาน Markdown ตาม standard `commands/test-scenario-report.md`, `workflows/test-scenario-report.md` กับ `templates/test-scenario-report.md`

Workflow นี้ไม่ใช่ performance review, score, KPI, daily performance หรือการประเมินบุคคล ให้ใช้เป็น QA/product evidence เท่านั้น

สำหรับ InnoHub หรือ user-facing checks ต้องใช้ visible-menu navigation เป็น default; direct URL/hidden route ต้อง label เป็น technical verification only

## Feedback เพื่อปรับปรุงมาตรฐาน

ใช้ `/standard-feedback` หรือ `commands/standard-feedback.md` เมื่อต้องการส่ง feedback เพื่อปรับปรุง BDA AI Dev Standard เอง และอ้างอิง `FEEDBACK.md`, `templates/standard-feedback.md`, `workflows/standard-improvement.md` ตามความเหมาะสม

Feedback นี้ไม่ใช่ performance review, score, KPI, daily performance หรือการประเมินบุคคล ให้ใช้เพื่อปรับปรุงมาตรฐาน/command/workflow/template/Claude-Codex support เท่านั้น

## Automatic work event logging

เป้าหมายคือให้ daily log และ PM log เกิดจากการใช้ AI ที่ฉลาดผ่าน BDA AI Dev Standard ไม่ใช่ให้พนักงานต้องส่งรายงานซ้ำทุกวัน

- งาน BDA จริงที่เรียก command/workflow ต้องส่ง work event ตาม `docs/ai-work-event-logging.md`
- ใช้ `bda start`, `bda event`, และ `bda stop` จาก `scripts/bda.mjs` เป็น default; ใช้ `scripts/bda-work-event.mjs` สำหรับ one-off event
- คุยทั่วไป ทดลองถามครั้งแรก หรือ setup tool ยังไม่ต้องบังคับ metadata
- ถ้าผู้ใช้พิมพ์ `bda start` ให้ถามกลับ/เติม draft metadata ให้ตรวจ ได้แก่ `project`, `task_summary`, `command`, `work_type`, `employee_code`, `employee_group`, `ai_provider`, `ai_model`, และ `used_bda_gateway`
- หลังผู้ใช้ยืนยัน `bda start` ต้องรัน CLI จริงผ่าน terminal/tool; ห้ามแค่ตอบว่าเปิด session แล้วหรือพิมพ์ JSON เฉย ๆ
- สำหรับ Hermes/local model ให้ใช้ metadata confirmation แบบสั้นเท่านั้น; อย่า paste standard ยาวหรือ JSON ก้อนใหญ่ถ้าไม่จำเป็น
- ถ้าผู้ใช้พิมพ์ `bda help` ให้แสดง command catalog แบบสั้นจาก `docs/bda-session-cli.md`
- `bda help`, `bda version`, และ `bda update` เป็น utility commands ไม่ใช่ work session; ห้ามสร้าง session/event ใหม่จากคำสั่งเหล่านี้
- ระหว่าง session ให้รับรูปแบบ `bda-dev: <prompt>`, `bda-nondev: <prompt>`, หรือ `bda-pm: <prompt>` แล้วส่ง event ของ command นั้น
- เก็บรายละเอียดงานใน `work_type` เช่น `debug`, `review`, `document`, `pm-status`, หรือ `risk`; อย่าโชว์ command catalog ย่อยยาวใน local/Hermes context
- ถ้าผู้ใช้พิมพ์ `bda stop` ให้สรุป outcome/status/blocker/next step และส่ง stop event โดยต้องใช้ session_id/project/task เดิมจาก active `bda start`; ห้ามเดา session ใหม่
- ถ้าเป็นงาน dev/nondev/PM lead เช่น `/fix-bug`, `/review-change`, `/write-document`, `/test-report`, `/pm-log`, `/pm-status`, `/pm-risk` ต้องมี metadata: `employee_code`, `employee_group`, `command`, `task_summary`, `work_type`, `project`, `tool`, `ai_model`, `status`, และผลลัพธ์งาน
- ห้าม hardcode production endpoint, API key, employee key, หรือ private IP ใน public repo; ให้ตั้งผ่าน env/config หรือ private rollout package เท่านั้น
- ถ้าส่ง endpoint ไม่ได้ ให้บันทึก local fallback/outbox และแจ้งใน handoff ว่า event ยังไม่ได้ sync

## Model/context/vision routing

- Local/Qwen coding model: ใช้กับ text/code แบบ targeted เท่านั้น อ่านเฉพาะไฟล์/ช่วงที่เกี่ยวข้อง
- Context ใกล้เต็ม: สรุปสิ่งที่รู้ 5-8 bullet แล้วเปิด session ใหม่หรือ route ไป model context ใหญ่
- งานภาพ/screenshot/จุดที่วง/doc image: ให้ใช้ Gemini/NotebookLM/vision model อ่านภาพก่อน แล้วเอาสรุปกลับมาทำงานต่อใน Hermes; ห้ามฝืนเดาภาพด้วย text-only/local coder

## Output บังคับ

ทุกคำตอบ/รายงานต้องมีหัวข้อเหล่านี้ครบ:

- **BDA Standard files used**: path ของไฟล์มาตรฐาน BDA ที่ใช้จริง
- **Pipeline trace**: Understand → Plan → Execute → Verify → Handoff พร้อม command/workflow ที่ใช้
- **Commands run**: คำสั่งหรือ tool ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันให้ระบุเหตุผล
- **Verification / Evidence**: หลักฐานตรวจจริง
- **Limitations / Risks / Next steps**: ข้อจำกัด ความเสี่ยง และงานต่อ
