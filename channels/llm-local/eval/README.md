# BDA AI Eval Harness v1 — เครื่องวัด agentic tool กลางของทีม

> who/when/why: สร้างคืน 2026-07-05→06 โดย session vLLM-tuner หลังคืนที่ **เครื่องวัดเฉพาะกิจกล่าวหา AI ผิดถึง 7 ครั้งในคืนเดียว** — harness นี้อัดบทเรียนทั้งหมดลงโค้ดเพื่อไม่ให้ใครต้องพลาดซ้ำ
> ใช้เมื่อไหร่: เปลี่ยนโมเดล/quant/parser/gate config, เพิ่ม tool ใหม่, หรือมีข้อสงสัย "AI ตัวนี้เชื่อได้แค่ไหน" — วัดก่อนเถียง

## Quickstart

```bash
cd eval
./bin/run_eval.sh claude s1-fix-test 3     # claude CLI × โจทย์แก้บั๊ก × 3 รอบ
./bin/run_eval.sh hermes s2-build-slice 3  # hermes × โจทย์สร้าง service × 3 รอบ
./bin/run_eval.sh codex s1-fix-test 3      # codex (ต้อง setup ตาม channels/llm-local/README.md ส่วน Codex CLI ก่อน)
python3 bin/scoreboard.py results/results.jsonl   # ตารางรวมทุกผลที่เคยรัน
```

ข้อกำหนดเครื่องที่รัน: มี tool CLI นั้นติดตั้ง + key อยู่ที่ `~/.hermes/.env` (`BDA_AI_ROUTER_API_KEY`) + endpoint ตาม rollout

## หลักการ 7 ข้อ (แต่ละข้อ = แผลจริง)

1. **n ≥ 3 เสมอ** — agentic loop มี variance สูง (เจอจริง: โจทย์เดียวกัน 3 รอบ ได้ เขียว/เขียว/บั๊ก) รอบเดียว = เดา
2. **Verify อิสระ** — harness รัน test เอง เช็ค `git log` เอง ไม่เชื่อรายงาน agent (เจอจริง: อ้าง "complete" ทั้งที่ test รัน 0 ตัว)
3. **Verify-the-verifier** — เครื่องวัดผิดได้พอๆ กับ AI: นับผิดภาษา (นับแค่ .ts ทั้งที่ agent เขียน python), รัน npm test ใส่โปรเจกต์ python, ไม่ลง `pytest-asyncio`, grep เลขดิบ (`401` ไปโดน entry ที่ 401, `429` ไปโดน timestamp) — `verify.sh` แก้ครบแล้ว แต่เมื่อผลแปลกให้เปิดดูของจริงก่อนเชื่อ scoreboard
4. **หา stray ก่อนกล่าวหาว่าโม้** — "อ้าง commit 4 ไฟล์แต่โฟลเดอร์ว่าง" เคยเกือบขึ้นเอกสารว่า AI โกหก ความจริง: **ทำครบจริง 10/10 test แค่ผิดโฟลเดอร์** (cwd drift) → verify.sh หาไฟล์ใหม่เหนือ workdir ให้อัตโนมัติ (field `stray`)
5. **โจทย์ 2 ชนิด** — `s1-fix-test` (deterministic: bug จริง test fail 1 เคส วัด self-verification ตรงๆ) + `s2-build-slice` (bounded build วัดสร้างจริง) — โจทย์เปิดกว้าง "สร้างทั้งระบบ" วัดอะไรไม่ได้ (0/8 ทุกเครื่องมือ)
6. **จับ 3 สัญญาณแยกกัน** — test_pass (ของจริง), overclaim (คำอ้าง vs ของจริง), leak (`<function=` โผล่เป็น text = ปัญหา parser/backend ไม่ใช่ความผิด agent)
7. **Adapter ต่อ tool + env ที่ถูกบังคับในโค้ด** — `</dev/null` เสมอ (claude และ codex เคยค้างรอ stdin เงียบๆ), `CLAUDE_CONFIG_DIR` แยก (กัน 401 key เก่า), path เต็มใน prompt (กัน drift)

## เพิ่ม scenario ใหม่

```
eval/scenarios/<ชื่อ>/
  PROMPT.txt   # ใช้ __WORKDIR__ แทน path (runner จะ substitute)
  ...ไฟล์ seed ทั้งหมด (จะถูก copy + git init เป็น baseline)
```
โจทย์ที่ดี: มีเกณฑ์ผ่านที่ verify ได้ด้วยเครื่อง (test ต้องผ่าน) + ขอบเขตชัด

## เพิ่ม tool ใหม่

สร้าง `bin/adapters/<tool>.sh` (ใน eval/ นี้) รับ 3 args: `PROMPT WORKDIR LOGFILE` — ดูของเดิมเป็นแบบ อย่าลืม `</dev/null`

## ผลอ้างอิง (fleet Qwen3.6 ทั้ง 3 node, 2026-07-06)

| tool | s1-fix-test | s2-build-slice |
|---|---|---|
| hermes | 3/3 (ผ่าน /fix-bug) | 2/2 (ผ่าน /build-feature) |
| claude | 3/3 | 2/2 + slice ก่อนหน้า 2/3 |
| codex | 1/1 | ยังไม่วัด n≥3 |

ประวัติการวัดเต็ม + วิธีอ่านผล: `channels/llm-local/docs/ai-employee-manual.md`, Obsidian `BDA_AI_EMPLOYEE_TEST_HERMES_CLAUDE_2026-07-05`
