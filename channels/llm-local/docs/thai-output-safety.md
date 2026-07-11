# Thai output safety — self-review rule + `bda thai-check`

## ปัญหา

โมเดล local (Qwen3.6) มีจุดอ่อนตอน **generate** ภาษาไทย: สระ/วรรณยุกต์เพี้ยนเป็นรายครั้ง เช่น "สั้่น" (วรรณยุกต์ซ้อน), "น้ี" (วรรณยุกต์นำหน้าสระบน) — คาดเดาไม่ได้ว่าเกิดครั้งไหน แต่เทสยืนยันแล้วว่าโมเดล **อ่าน/ตรวจ/แก้** ภาษาไทยได้แม่น <!-- thai-check:ignore -->

แนวทาง 2 ชั้น:

1. **Self-review rule** — สั่งให้ agent อ่านทวนข้อความไทยที่ตัวเองเพิ่งเขียนก่อนปิดงาน (ครอบทั้งตัวอักษรเพี้ยนและคำสะกดถูกแต่ผิดความหมาย เช่น "หน่า" แทน "น่า")
2. **`bda thai-check`** — ตัวตรวจ deterministic เป็น safety net สุดท้าย (จับเฉพาะ sequence ที่ผิดโครงสร้างภาษาไทยแน่นอน — จับคำผิดความหมายไม่ได้)

## ชั้นที่ 1: Self-review rule — ติดตั้งที่ไหน

กติกาเดียวกันถูกวางไว้ในทุก surface ที่เครื่องมือโหลดจริง:

| เครื่องมือ | ไฟล์ | วิธีติดตั้ง |
|---|---|---|
| Claude Code | `channels/llm-local/claude/CLAUDE.md` หัวข้อ "Thai output self-review" | copy เป็น `CLAUDE.md` ที่ root ของ target repo (ตามขั้นตอนติดตั้งเดิม) |
| Codex | `channels/llm-local/codex-local/AGENTS.md` หัวข้อ "Thai output self-review" | copy เป็น `AGENTS.md` ที่ root ของ target repo |
| Cline (Hermes/Windsurf/VS Code) | `core/templates/clinerules-thai-review.md` | **อัตโนมัติ**: `bda update` / `bda setup` ติดตั้งเป็น global rule ที่ `~/Documents/Cline/Rules/bda-thai-review.md`; หรือ copy เป็น `.clinerules` per-repo |

เนื้อกติกา:

> งานที่สร้างหรือแก้ข้อความภาษาไทย (string ใน code, comment, เอกสาร, commit message): ก่อนปิดงาน ให้อ่านทวนข้อความไทยทั้งหมดที่เพิ่งเขียน ตรวจสระ/วรรณยุกต์เพี้ยน ลำดับผิด หรือคำสะกดผิด แล้วแก้ให้ถูกต้องก่อนส่งมอบ — โมเดลที่ใช้มีจุดอ่อนตอน generate ภาษาไทยแต่ตรวจแก้ได้แม่น ห้ามข้ามแม้งานเล็ก

## ชั้นที่ 2: `bda thai-check`

ตรวจไฟล์ / stdin / staged git diff — เจอปัญหา = exit 1 พร้อมรายงาน `file:line:col`:

```bash
bda thai-check docs/report.md src/messages.ts   # ตรวจไฟล์
bda thai-check --diff                           # ตรวจเฉพาะบรรทัดที่ staged (ก่อน commit)
echo "ข้อความ" | bda thai-check                  # ตรวจจาก stdin
```

สิ่งที่จับ (deterministic, ทดสอบกับเอกสารไทยทั้ง repo นี้ ~225KB แล้ว 0 false positive):

- `double-tone` — วรรณยุกต์ซ้อน เช่น "สั้่น", "่่่่่" <!-- thai-check:ignore -->
- `stacked-vowel` — สระบน/ล่างซ้อนกัน
- `tone-before-vowel` — วรรณยุกต์นำหน้าสระบน/ล่าง เช่น "น้ี" (ที่ถูกคือ "นี้") <!-- thai-check:ignore -->
- `orphan-mark` — สระ/วรรณยุกต์ลอยไม่มีพยัญชนะนำ
- `repeated-char` — อักษรไทยตัวเดียวกันซ้ำติดกันเกิน 4 ตัว

คำไทยปกติไม่โดน: "เนี้ยบ", "โน้ต", "ก็", "น้ำ" (สระอำหลังวรรณยุกต์เป็นลำดับที่ถูกต้อง), "กุ้ง", "ปั้น"

บรรทัดที่ตั้งใจมีตัวอย่างข้อความเพี้ยน (docs/สอน/test fixture) ให้ใส่ `thai-check:ignore` ไว้ในบรรทัดเดียวกัน (เช่นใน comment) เพื่อข้ามการตรวจบรรทัดนั้น

ข้อจำกัด: คำที่สะกดถูกโครงสร้างแต่ผิดความหมาย (เช่น "หน่า" แทน "น่า") regex ตรวจไม่ได้ — ชั้นที่ 1 (self-review) เป็นตัวครอบ

## ติดเป็น pre-commit hook (optional ไม่บังคับ)

ใน target repo ที่มีข้อความไทยเยอะ:

```bash
cat > .git/hooks/pre-commit <<'EOF'
#!/bin/sh
exec node "$HOME/.bda-ai-dev-standard/scripts/aks.mjs" thai-check --diff
EOF
chmod +x .git/hooks/pre-commit
```

ถ้ามี hook เดิมอยู่แล้ว ให้เพิ่มบรรทัด `node "$HOME/.bda-ai-dev-standard/scripts/aks.mjs" thai-check --diff || exit 1` เข้าไปแทน (`scripts/bda.mjs` ยังเป็น shim alias ถาวร) ข้าม hook ชั่วคราวได้ด้วย `git commit --no-verify` (ใช้เมื่อจำเป็นจริงเท่านั้น)
