> Archive note: เอกสารนี้เป็นบันทึกประวัติศาสตร์ก่อน rebrand เป็น AKS AI Dev Standard; ชื่อ BDA ในเนื้อหาถูกคงไว้ตามยุคของเหตุการณ์

# Nightly A40 Hybrid Guardrails - 2026-06-25

## สรุปที่แก้คืนนี้

- ตั้ง A40 worker ทั้ง 2 เครื่องให้รับทีละ 1 request ต่อ model instance (`--parallel 1`) เพื่อลดการจอง KV cache พร้อมกันหลาย slot
- คง local-first routing แต่เพิ่ม guardrail ให้ย้าย request ออกจาก A40 เมื่อ prompt/context ใหญ่หรือ queue นาน
- เพิ่ม route comment/feedback metadata เพื่อบอกได้ว่า request ใดถูกย้ายเพราะอะไร และควรแจ้งพนักงานอย่างไร
- ปรับ Admin A40 ให้เห็น paid route ที่เกิดจาก GPU full, prompt/context ใหญ่, หรือ queue นาน ไม่ใช่ดูแค่ paid spend รวม
- อัปเดต `bda help`, `bda update`, และ docs ให้สื่อสารกติกาเดียวกัน

## Threshold ปัจจุบัน

| เงื่อนไข | Action | เหตุผล |
| --- | --- | --- |
| GPU ทั้ง 2 เครื่องเกิน threshold | route ไป paid | ลดคิวของ Local A40 |
| prompt/context เกินประมาณ 25K tokens | route ไป paid | กัน prefill/KV cache ใหญ่ไปจอง A40 นาน |
| local queue เกินประมาณ 20s | route ไป paid | ลดการรอของคนถัดไป |

## Metadata ที่ต้องเก็บเมื่อถูกย้ายจาก A40

ทุกขั้นที่ request ถูกปัดออกจาก A40 ต้องมีข้อมูลพอสำหรับ feedback:

- `employee_code`
- `employee_group`
- `display_name`
- `project`
- `task_summary`
- `session_id`
- `prompt_tokens` หรือ prompt estimate
- `route_reason`
- `route_comment`

ตัวอย่าง route comment:

- `Prompt/context is large for Local A40. Summarize first, split into phases, and send only relevant files/errors.`
- `Local A40 queue is above threshold. This request was routed to paid to avoid blocking other users.`
- `Local GPUs are above threshold. Paid fallback was used to keep work moving.`

## วิธีใช้ feedback กับพนักงาน

เป้าหมายไม่ใช่จับผิด แต่ทำให้ทุกคนเห็นว่าพฤติกรรมไหนทำให้ A40 ช้าและ paid cost เพิ่ม

- ถ้าคนเดิมมี route comment เรื่อง context ใหญ่ซ้ำ ให้แนะนำให้ใช้ subscription AI วาง plan/phase ก่อน
- ถ้าส่ง repo/log/chat history ทั้งก้อน ให้ขอให้ส่งเฉพาะ path, error, command, expected/actual
- ถ้า scan codebase ซ้ำ ให้ให้ scan ครั้งเดียวแล้วใช้ targeted search
- ถ้างานยาว ให้ทำ summary/handoff แล้วเปิด phase ใหม่ แทนการลาก context เก่าไปเรื่อย ๆ

## Rollback snapshot

- Gateway server snapshot: `/home/maripae/bda-ai-router/night-snapshots/20260625-005419`
- Worker 2 snapshot: `/home/maripae/night-snapshots/20260625-005412`

## Verification ที่ทำแล้ว

- Worker 1 health OK และ logs แสดง `n_slots = 1`
- Worker 2 container healthy และ logs แสดง `n_slots = 1`
- Metadata gateway health OK หลัง rebuild
- Admin hybrid summary/query function import ผ่าน ไม่มี SQL error

