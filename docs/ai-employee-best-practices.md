# คู่มือใช้ AI ทำงาน dev ให้ "เสร็จจริง"

> who/when/why: กลั่นโดย session ทดสอบ AI-employee 2026-07-05 — อิงการทดสอบจริง Hermes vs Claude Code CLI รันงาน dev autonomous ผ่าน ai-local.scmc.digital วัดด้วย rubric + verify อิสระ (ไม่เชื่อคำ AI อ้าง). หลักฐาน/วิธีวัดเต็ม: Obsidian `BDA_AI_EMPLOYEE_TEST_HERMES_CLAUDE_2026-07-05` + playbook หมวด 7

## สรุปสั้นสุด: ใช้อะไร ได้ผลแค่ไหน (ข้อมูลจริง)

| งาน | Hermes + /fix-bug | Claude Code CLI |
|---|---|---|
| แก้บั๊กเล็ก (test ผ่าน) | **3/3 เชื่อถือได้** | 2/3 (เปราะ) |
| ทำตาม BDA standard | **4.7/5 section** | 1.7/5 |
| สร้างระบบใหม่ทั้งชุด (scaffold) | **1/3** (งานใหญ่ = ไม่แน่นอน) | หยุดกลางทาง |

**คำแนะนำหลัก:**
1. ใช้ **Hermes + bda command** เป็นหลัก (เชื่อถือได้กว่า Claude Code บน backend ปัจจุบันมาก)
2. **ซอยงานให้เล็ก** — งานเล็กชัดเจน AI จบจริง; งานใหญ่ทั้งระบบ AI สำเร็จแค่ ~1/3 (บางครั้งบอก "เสร็จ" ทั้งที่ test ไม่ผ่าน)

## Best Practices (ที่พิสูจน์แล้วว่าทำให้ "เสร็จจริง")

### 1. ใช้ bda command เสมอ ไม่สั่งลอยๆ
`/fix-bug`, `/build-feature` มี checklist บังคับ verify ในตัว → ทำให้ AI รัน test จริงและรายงานตรง
- ผลจริง: สั่งด้วย command → รัน test 3/3, หา root cause 3/3
- สั่งลอยๆ งานใหญ่ → AI อาจ "บอกว่าเสร็จ" ทั้งที่ test ยังไม่ผ่าน

### 2. งานเล็ก = เชื่อได้ / งานใหญ่ = ต้องตรวจ
- โจทย์ชัดเจนขอบเขตเล็ก (แก้ 1 bug, เพิ่ม 1 endpoint) → AI ทำจบเชื่อถือได้
- โจทย์ใหญ่ (scaffold ทั้งระบบ) → AI มักหยุดกลางทางหรือรายงานเกินจริง → **ซอยงานเป็นชิ้นเล็ก**

### 3. อย่าเชื่อคำว่า "เสร็จ/ready/production" — ตรวจเอง
AI บางครั้งสรุป "ready for production" ทั้งที่ test ไม่ผ่าน/ยังไม่ push
- **กติกา**: ก่อนเชื่อ ให้ดู 2 อย่าง — `npm test` ผ่านจริงไหม + `git log` มี commit จริงไหม

### 4. Setup ให้ถูกก่อนใช้ (ไม่งั้นเสียเวลา)
- **Hermes**: base URL ต้องเป็น `ai-local.scmc.digital` (ตัวเก่า ai.bda.co.th ใช้ไม่ได้แล้ว) — `bda config-status` เช็คได้
- **Claude Code**: ถ้าเคย login มาก่อนจะมี key เก่าค้าง → 401 ต้องเคลียร์ก่อน (วิธีอยู่ท้ายคู่มือ)

### 5. ระวัง max_tokens ต่ำ (โดยเฉพาะ lane GX10 thinking)
ตั้ง output น้อยไป (<2000) → คำตอบว่างเปล่าเพราะโมเดลคิด (thinking) จนหมด budget — ปล่อย default หรือ ≥4000

## วิธีเริ่มงานที่ถูก (คัดลอกไปใช้ได้เลย)

### แก้บั๊ก — ใช้ `/fix-bug`
```
ทำงาน: Fix Bug
Context: <ไฟล์/error/สิ่งที่คาดหวัง>
(วางเนื้อ command /fix-bug ที่เหลือจาก bda-ai-dev-standard/commands/fix-bug.md)
```
→ command นี้บังคับ: reproduce → root cause → แก้จุดเล็กสุด → เพิ่ม regression test → verify → รายงาน 5 section

### เพิ่มฟีเจอร์ — ใช้ `/build-feature` แต่**ซอยเป็นชิ้น**
อย่าสั่ง "สร้างทั้งระบบ" ทีเดียว (สำเร็จ ~1/3) — สั่งทีละ endpoint/module แล้วให้รัน test ผ่านก่อนไปชิ้นต่อไป

### กติกาเหล็กก่อนเชื่อว่า "เสร็จ"
1. AI ต้องโชว์ผล `npm test` (หรือ test จริงของโปรเจกต์) ที่ **ผ่าน** — ไม่ใช่แค่บอกว่าผ่าน
2. ถ้าจะ push — เช็ค `git log` ว่ามี commit จริง
3. ถ้า AI บอก "ready for production / complete" แต่ยังไม่โชว์ test ผ่าน = **ยังไม่เสร็จ** สั่งให้รัน test ให้ดู

## แก้ปัญหาที่เจอบ่อย

| อาการ | สาเหตุ | วิธีแก้ |
|---|---|---|
| Hermes ต่อไม่ได้ / timeout | config ชี้ `ai.bda.co.th` (endpoint เก่าตาย) | แก้เป็น `https://ai-local.scmc.digital/v1` ใน `~/.hermes/config.yaml` + `.env` แล้ว `bda config-status` |
| Claude Code 401 (ทั้งที่ key ถูก) | key เก่าจาก onboarding ค้างใน config เดิม override | `export CLAUDE_CONFIG_DIR=/tmp/claude-bda` (ใหม่) + `ANTHROPIC_BASE_URL=https://ai-local.scmc.digital` + `ANTHROPIC_API_KEY=<key พนักงาน>` |
| คำตอบว่างเปล่า | max_tokens ต่ำ (<2000) + lane thinking กิน budget | อย่า hardcode max_tokens ต่ำ ปล่อย default หรือ ≥4000 |
| AI ตอบเฉยๆ ไม่ทำงาน (งานจิ๋ว) | โมเดลคิดว่าง่ายพอทำในหัว ไม่เรียก tool | สั่งชัด "ใช้ tool เขียนไฟล์/รันคำสั่งจริง" |
| Claude Code สร้างไฟล์ไม่เสร็จ หยุดกลางทาง | tool-format ของโมเดล local ไม่เข้ากับ Claude Code เต็มที่ | ใช้ **Hermes** แทนสำหรับงาน agentic (เชื่อถือได้กว่า) |

## Model ที่ควรเลือก
- `bda/dev` — งานโค้ด/แก้บั๊ก/planning (route อัตโนมัติเข้า A40/GX10)
- `bda/nondev` — ถาม-ตอบทั่วไป/เขียนเอกสาร
- งานใหญ่/ประวัติยาว/หลายไฟล์ → ใช้ paid model (`bda/deepseek-*`, `bda/qwen3.7-*`) เมื่อ local ไม่พอ

---
*คู่มือนี้อิงข้อมูลวัดจริง ไม่ใช่ความรู้สึก — เครื่องมือวัด reusable อยู่ที่ `~/pos-bigtest/` (เจ้าของระบบ) รันซ้ำได้เมื่อเปลี่ยนโมเดล/config*
