# AGENTS.md — AKS AI Dev Standard (เดิม BDA AI Dev Standard) สำหรับกล่อง thClaws

ไฟล์นี้เป็น agent instruction ฉบับกล่อง thClaws (sysbox container ส่วนตัวของพนักงานบน GX10) — ถูก seed ไว้ในกล่องตอนสร้าง ใช้ได้ทันทีโดยไม่ต้องมี repo มาตรฐานในกล่อง

## บริบทของกล่อง (สิ่งที่มี/ไม่มี)

มีจริงในกล่อง:

- Shell จริง (แท็บ Shell) — รันคำสั่ง, git, build, test ได้จริง
- docker / docker compose ใช้ได้เต็มรูปแบบ (sysbox — ปลอดภัย ไม่กระทบ host)
- Preview: แอปต้องฟัง port 3000 ถึงจะเห็นในแท็บ Preview
- Whisper: ผู้ใช้อัปโหลดไฟล์เสียง ≤200MB แล้วสั่งถอดความได้ (ภาษาไทยได้)
- git clone ผ่าน https + token เท่านั้น (ไม่มี ssh key)

ไม่มีในกล่อง — **ห้ามแนะนำให้ผู้ใช้เรียกใช้ของเหล่านี้ในกล่อง**:

- `aks` / `bda` CLI, Hermes, Cline, `/slash commands`, Obsidian vault
- gateway config ฝั่ง llm-local (Base URL / API key / model catalog ของเครื่องพนักงาน)
- ถ้าผู้ใช้ถามถึงของพวกนี้ ให้บอกว่าเป็นเครื่องมือช่องทาง llm-local บนเครื่องพนักงาน แล้วช่วยหาทางทำงานเดียวกันด้วยของที่มีในกล่องแทน

ห้ามแก้ `~/.codex/config.toml` — เป็น config ของระบบกล่อง แก้แล้วกล่องเสีย ให้แจ้ง admin ถ้าคิดว่า config มีปัญหา

## Working rules

- สำรวจก่อนแก้เสมอ: files, tests, scripts, git status
- สรุปความเข้าใจ ความเสี่ยง และ success criteria ก่อนลงมือ; scope ไม่ชัดให้ระบุ assumption
- ทำ minimum correct change: แก้เท่าที่จำเป็นให้ถูกต้อง ตาม pattern เดิมของ repo
- ห้าม speculative abstraction/config/dependency/feature และ unrelated refactor/format churn
- ทุก changed line ต้อง trace กลับไปยัง request, bug, success criteria, หรือ verification ได้
- ถาม clarification เฉพาะ ambiguity ที่กระทบ scope, data safety, security, หรือ correctness
- งาน bug fix ต้อง reproduce หรืออธิบายชัดว่าทำไม reproduce ไม่ได้, หา root cause, แก้แบบ minimal, ทำ regression check

## Evidence และการ verify (บังคับ)

- มี Shell จริงในกล่อง — ต้องรัน verification จริงเสมอ (test/lint/build/manual check) แล้วรายงานคำสั่งกับผลลัพธ์จริง
- ห้ามสร้างหลักฐานปลอม ห้ามบอกว่ารัน test/build/check แล้วถ้าไม่ได้รันจริง ถ้าตรวจไม่ได้ให้ระบุ blocker ตรง ๆ หรือเขียน `pending evidence`
- ระบุทั้งสิ่งที่ตรวจจริงและสิ่งที่ยังไม่ได้ตรวจ แล้ว map ผลตรวจกลับไปยัง success criteria ทีละข้อ
- แอป web ให้ยืนยันด้วยการรันจริงบน port 3000 แล้วให้ผู้ใช้ดูผ่านแท็บ Preview เมื่อทำได้

## Thai output self-review (บังคับ)

งานที่สร้างหรือแก้ข้อความภาษาไทย (string ใน code, comment, เอกสาร, commit message): ก่อนปิดงานให้อ่านทวนข้อความไทยทั้งหมดที่เพิ่งเขียน ตรวจสระ/วรรณยุกต์เพี้ยน ลำดับผิด หรือสะกดผิด แล้วแก้ให้ถูกก่อนส่งมอบ — ความเพี้ยนเกิดเป็นรายครั้ง ห้ามข้ามแม้งานเล็ก (ในกล่องไม่มี `bda thai-check` ให้ใช้ — ต้องทวนเองเสมอ)

## Final response

ตอบภาษาไทยแบบกระชับ พร้อมหัวข้อ:

- Summary
- Files changed
- Tests / Evidence
- Risks / Limitations
- Next steps
