# Troubleshooting: อาการ AI ใช้ไม่ได้ + วิธีแก้ (อิงเหตุการณ์จริง)

> who/when/why: กลั่นจากการทดสอบระบบจริงคืน 2026-07-05 (eval + endurance test ทั้งคืน) — ทุกอาการในตารางนี้**เกิดขึ้นจริงและวินิจฉัยแล้ว** ไม่ใช่ทฤษฎี
> endpoint จริงและ key ดูจาก rollout ส่วนตัว/ทีม infra (ในนี้ใช้ `<ROUTER_URL>` แทน)

## ตารางอาการ → สาเหตุ → วิธีแก้ (เรียงตามที่เจอบ่อย)

| อาการ | สาเหตุที่พิสูจน์แล้ว | วิธีแก้ |
|---|---|---|
| **เข้าไม่ได้เลย / connection error / SSL fail** | config ชี้ endpoint เก่า (`ai.bda.co.th` — ปิดแล้ว) | เปลี่ยน base URL เป็น `<ROUTER_URL>` ปัจจุบันใน `~/.hermes/config.yaml` + `~/.hermes/.env` แล้วรัน `bda config-status` เช็ค |
| **401 Unauthorized ทั้งที่ key ถูก** (Claude Code) | key เก่าจาก onboarding ค้างใน config เดิม override key ใหม่ | `export CLAUDE_CONFIG_DIR=/tmp/claude-bda` (โฟลเดอร์ใหม่) + `ANTHROPIC_BASE_URL=<ROUTER_URL>` + `ANTHROPIC_API_KEY=<key ตัวเอง>` และ `unset ANTHROPIC_AUTH_TOKEN` |
| **401 เฉพาะบาง model** | key ไม่ได้ allow model นั้น (สิทธิ์ต่อ key) | แจ้ง admin เช็ค scope ใน litellm (`LiteLLM_VerificationToken.models`) |
| **ส่งไปแล้ว "หายไป" / ไม่ตอบ / error สักพักแล้วตาย** | **429 TPM limit ต่อ key** — Claude Code ส่ง context ทั้งก้อนซ้ำทุก turn (session ยาว 100k+ = โควตาหมดเร็วมาก) | รอ ~1 นาทีแล้วลองใหม่; ปิด session Claude Code ที่ไม่ใช้ (ทุก session กินโควตาเดียวกัน); ถ้าเจอบ่อยแจ้ง admin ปรับ tpm_limit |
| **คำตอบว่างเปล่า** | `max_tokens` ตั้งต่ำ (<2000) + backend สาย thinking คิดจนหมด budget ก่อนตอบ | อย่า hardcode max_tokens ต่ำ — ปล่อย default หรือ ≥4000 |
| **คำตอบแปลกๆ มี `<function=...>` โผล่เป็นข้อความ / tool ไม่ทำงาน** (Claude Code) | request ใหญ่ของ Claude Code + backend A40 (parser `qwen3_coder`) แปลง tool call ไม่ได้ — แก้ที่ระบบแล้ว (2026-07-05: route `claude-sonnet-4-5` → GX10 เท่านั้น) | ถ้ายังเจอ = แจ้ง admin ทันที (แปลว่า route เพี้ยน); CLI ใช้ `--model claude-code-local` ได้เสมอ |
| **AI ตอบเฉยๆ ไม่ลงมือทำ (งานเล็กมาก)** | โมเดลคิดว่าง่ายพอ "ทำในหัว" ไม่เรียก tool | สั่งชัดในโจทย์: "ใช้ tool เขียนไฟล์/รันคำสั่งจริง" |
| **AI บอกเสร็จแต่ไม่มีของ** | 2 แบบ: โม้จริง (test 0 ตัวแต่บอก complete) หรือ **ทำจริงแต่ผิดโฟลเดอร์** (cwd drift — เจอจริง: งานครบ 10/10 อยู่คนละ dir) | `find` หาผลงานทั่วก่อน แล้วเช็ค test ผ่าน + `git log` ด้วยตาตัวเอง — ดู `docs/ai-employee-manual.md` |
| **Desktop "เงียบ" ไม่ตอบนาน / เหมือนหาย** | ส่วนใหญ่**ไม่ใช่พัง** — มี background task (install/build) วิ่งอยู่ แต่ agent มักไม่บอกว่ากำลังรออะไร | เปิด **Background tasks panel** (มุมขวาบน) ดูก่อน: task วิ่งอยู่ = แค่รอ; แต่ถ้า install/build เกิน ~10 นาที หรือมีหลายตัวซ้อน = ค้าง/ชนกัน → กด ⏹ หยุดทั้งหมด แล้วสั่งรันใหม่ทีละตัวแบบรอจนจบ |
| **ช้าผิดปกติช่วง context ยาว** | prefill ก้อนใหญ่ + คิวแน่น (ระบบมี divert ไป paid model อัตโนมัติเมื่อคิวยาว) | ปกติของงาน context ยาว; ถ้าค้าง >5 นาทีแจ้ง admin |

## เช็คเร็ว 3 ขั้น (ก่อนแจ้ง admin)
1. `bda config-status` — endpoint ถูกไหม
2. `curl -sS <ROUTER_URL>/v1/models -H "Authorization: Bearer <key>"` — key ใช้ได้ไหม (ได้ list = ใช้ได้)
3. ลองใหม่หลังรอ 1 นาที — แยก "429 ชั่วคราว" ออกจาก "พังจริง"

## สำหรับ admin: บทเรียนจากคืน 2026-07-05
- อาการฝูง ("ทุกอย่างล้มพร้อมกัน") ให้สงสัย **rate limit / โควตากลาง** ก่อนสงสัยระบบพัง
- `claude-sonnet-4-5` ต้องอยู่ GX10 เท่านั้น (A40 leak tool format กับ request ใหญ่) — ตอนนี้คุมโดย litellm alias (gate anthropic lane rewrite ปิดด้วย `BDA_ANTHROPIC_LANE_REWRITE_MODELS=disabled`)
- ก่อนโทษ AI/ระบบ ให้ตรวจเครื่องวัด/วิธีเทสก่อน (คืนนั้น harness เราเองผิด 6 จุด)
