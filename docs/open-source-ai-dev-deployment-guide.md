# Open Source AI Dev Deployment Guide

เอกสารนี้อธิบายวิธีนำ AKS AI Dev Standard (เดิม BDA AI Dev Standard) ไปใช้ในองค์กรอื่นภายใต้ MIT License โดยไม่ต้องใช้ infrastructure, key, หรือ GPU ของ BDA

## Public vs Private Boundary

Public repository นี้ควรมีเฉพาะสิ่งที่แชร์ได้:

- workflow, command, prompt, template, checklist, และ policy
- CLI/client ที่ทำงานแบบ local หรือ authenticated remote เท่านั้น
- ตัวอย่าง config ที่ไม่มี secret
- smoke tests และ security checks

สิ่งที่แต่ละองค์กรต้องเก็บเองใน private deployment:

- API keys, employee keys, user tokens
- production gateway URL
- model provider keys เช่น OpenAI-compatible provider, OpenRouter, cloud GPU, internal LiteLLM
- GPU hostnames, VPN/Tailscale IP, private model routes
- customer data, logs, screenshots, และ environment จริง

ถ้าไม่มี key/config ส่วน private นี้ public repo จะใช้งานได้แค่ local/dry-run หรือยิง gateway แล้วถูกปฏิเสธตาม auth policy

## Recommended Architecture

เริ่มจาก local-first แล้วค่อยเพิ่ม hybrid paid เมื่อทีมใช้จริงมากขึ้น

```text
Developer / Staff
  |
  | bda CLI / AI tool command pack
  v
Local config and session files
  |
  | optional authenticated request
  v
Private AI gateway / LiteLLM / OpenAI-compatible proxy
  |
  +--> Local GPU model pool
  +--> Paid cloud model fallback
  +--> Audit / usage / cost logs
```

## Stage 1: Local-Only

เหมาะสำหรับทีมเริ่มต้นหรือ contributor ภายนอกที่ต้องการใช้ standard โดยไม่ตั้ง gateway

ควรมี:

- local AI tool หรือ model provider ที่ user ใส่ key เอง
- command pack จาก repo นี้
- no remote ingest by default
- session/work log เป็น local file หรือ outbox เท่านั้น

ตัวอย่าง `.env`:

```env
BDA_STANDARD_MODE=local
BDA_AI_WORK_EVENT_URL=
BDA_WORK_EVENT_API_KEY=
```

หลักการ:

- อย่าใส่ production endpoint ใน public repo
- อย่า commit `.env`
- ใช้ `commands/understand-task.md`, `commands/plan-work.md`, `commands/fix-bug.md`, `commands/verify-work.md` ได้ทันทีใน AI tool ที่รองรับ markdown prompt

## Stage 2: Local Gateway

เหมาะสำหรับทีมที่ต้องการควบคุม model, logs, และ routing เอง

ควรมี:

- private gateway หรือ LiteLLM ที่รับ OpenAI-compatible API
- API key ต่อ user หรือทีม
- rate limit และ audit log
- model alias ที่ stable เช่น `dev/local`, `dev/paid`, `review/paid`

Public repo ทำหน้าที่เป็น client/standard เท่านั้น ส่วน gateway config อยู่ private

## Stage 3: Hybrid Local GPU + Paid Cloud

เหมาะสำหรับทีมที่มี local GPU และต้องการ fallback ไป paid model เมื่อ queue สูงหรือ context ยาก

แนวทาง routing:

- งานเล็ก, targeted edit, review diff: ใช้ local GPU ก่อน
- งาน context ใหญ่, reasoning ยาก, final verification สำคัญ: ใช้ paid cloud ได้
- ถ้า local GPU utilization/queue เกิน threshold ให้ fallback ไป paid cloud
- เก็บ usage/cost ต่อ user, model, project, command
- อย่า fallback ไป free cloud ที่ rate limit หนักสำหรับงาน production team

ตัวอย่าง policy:

```text
local-first: true
paid-fallback: true
queue-threshold: organization-defined
require-auth: true
log-usage: true
```

ทีมควรอ่านคู่กับ `docs/hybrid-ai-usage-discipline.md` เพื่อป้องกัน prompt ใหญ่, scan ซ้ำ, session ค้าง, และงานซ้ำหลาย agent

## BDA Deployment Pattern

BDA ใช้แนวทางเดียวกันนี้:

- public repo เก็บ standard, command, policy, CLI/client, และ docs ที่เปิดได้
- private deployment เก็บ gateway URL, employee key, model route, LiteLLM/GPU config, และ monitoring
- พนักงานใช้ command เดิมผ่าน `bda`/AI tool
- gateway เป็นคนตัดสิน local GPU หรือ paid fallback ตาม config และ load
- ไม่มี key ก็เข้า BDA gateway/A40 ไม่ได้

ข้อมูลเฉพาะของ BDA เช่น IP, key, paid provider key, Tailscale host, GPU node, และ production route ไม่อยู่ใน public repo

## External Organization Setup Checklist

1. Clone repo นี้ตาม MIT License
2. เลือกว่าจะเริ่มแบบ local-only หรือมี private gateway
3. สร้าง private config repo หรือ secret manager ขององค์กร
4. ตั้ง API key และ auth policy ของตัวเอง
5. ตั้ง model alias ที่ stable ให้ทีมใช้ ไม่ผูกกับ provider ตรง ๆ
6. เริ่มด้วย local-first ก่อนเพิ่ม paid fallback
7. เปิด usage/cost logs ก่อน rollout ให้ทีมใหญ่
8. เขียน team policy เรื่อง scan codebase, session, retry, paid model
9. รัน smoke/security checks ก่อน release ภายใน

## What Not To Copy Publicly

อย่า copy สิ่งเหล่านี้ลง public fork:

- `.env` จริง
- employee config จริง
- gateway URL ภายในองค์กร ถ้าถือเป็นข้อมูล private
- provider keys หรือ LiteLLM master key
- logs ที่มี customer data หรือ prompt ส่วนตัว
- screenshots ที่มีข้อมูลส่วนบุคคล

## Versioning Recommendation

ถ้าองค์กร fork ไปใช้เอง:

- keep upstream version ของ AKS AI Dev Standard ไว้ใน changelog
- เพิ่ม suffix หรือ internal release note ขององค์กรเอง เช่น `0.11.0-org.1`
- อย่าเปลี่ยน command name ถ้าไม่จำเป็น เพราะทำให้ training และ prompt reuse ยาก
- private config version ควรแยกจาก standard version

