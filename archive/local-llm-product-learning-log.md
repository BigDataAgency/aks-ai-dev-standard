> Archive note: เอกสารนี้เป็นบันทึกประวัติศาสตร์ก่อน rebrand เป็น AKS AI Dev Standard; ชื่อ BDA ในเนื้อหาถูกคงไว้ตามยุคของเหตุการณ์

# Local LLM Product Learning Log

เอกสารนี้เก็บบทเรียนจากการใช้ BDA AI Dev Standard + Hermes + BDA Gateway + Local A40 + Paid Cloud ตั้งแต่ช่วงเริ่มต้นจนถึง version ปัจจุบัน เพื่อใช้ต่อยอดเป็น product สำหรับองค์กรที่อยากใช้ Local LLM จริงในงานประจำวัน

จุดประสงค์ไม่ใช่ changelog เชิงเทคนิค แต่เป็น product evidence ว่าเวลาองค์กรใช้ Local LLM จะเจออะไรบ้าง, งาน dev หนักต่างจาก non-dev อย่างไร, guardrail แบบไหนจำเป็น, และ feature ใดควรเป็นส่วนหนึ่งของ product ตั้งแต่วันแรก

## Product Thesis

Local LLM ไม่ใช่แค่ “มี GPU แล้วเร็ว/ถูกกว่า” แต่เป็นระบบ queue, session, context, policy, cost routing, user behavior, และ observability รวมกัน

องค์กรที่มี dev team จะหนักกว่าองค์กร non-dev มาก เพราะงาน dev มักมี:

- context ใหญ่จาก codebase, error log, diff, stack trace, dependency, และไฟล์หลายจุด
- long-running agent/tool call ที่กิน GPU slot นาน
- repeated scan/search/build/test ที่ทำให้ PF + KV cache โตเร็ว
- ความต้องการ audit ว่าใครใช้ local, ใครถูกปัดไป paid, และเพราะอะไร
- ความเสี่ยง session ซ้ำ, agent ซ้ำ, repo เดียวหลายคนยิงพร้อมกัน

องค์กร non-dev ยังต้องมี guardrail แต่ pattern มักเบากว่า:

- งานสรุปเอกสาร, meeting, requirement, status, risk
- context ใหญ่เป็นไฟล์/ข้อความมากกว่า codebase ทั้ง repo
- ต้องการ template และ workflow ชัด มากกว่า deep tool execution
- local model อาจพอได้ถ้ามี context discipline และไม่มี concurrent สูง

## Version Learning Timeline

### 0.0.x - 0.7.x: Prompt/Workflow Standard ก่อนมี session จริง

สิ่งที่เจอ:

- ผู้ใช้เรียก AI แบบกว้าง เช่น “ดูให้หน่อย”, “ทำต่อ”, “แก้ให้หมด”
- AI scan codebase ซ้ำหรืออ่านไฟล์กว้างเกินงาน
- ไม่มีข้อมูลกลางว่า AI ทำงานอะไรให้ใคร เมื่อไหร่
- repo public ยังเป็น standard/prompt มากกว่า product runtime

บทเรียน:

- ต้องมี command/workflow ที่บังคับให้ task ชัดก่อนใช้ compute
- ต้องแยก public standard ออกจาก private key/config/runtime
- Local LLM product ต้องมี usage discipline ตั้งแต่แรก ไม่ใช่รอ GPU เต็มแล้วค่อยสอน

Product requirement:

- command catalog
- task sizing
- minimum context discipline
- public/private boundary
- docs สำหรับ contributor และ external organization

### 0.8.x: Public Standard และ Security Boundary

สิ่งที่เจอ:

- ต้องเปิด public repo เพื่อให้ contribute/fork ได้ แต่ห้ามหลุด key, endpoint, customer data
- คนสับสนว่า public repo คือ runtime จริงหรือแค่ standard

บทเรียน:

- Public repo ควรเป็น source of truth ของ standard, docs, command, และ CLI client
- Private installer/config ต้องเป็นคนใส่ gateway URL, key, employee config, model route
- ไม่มี key ก็เข้า A40/gateway ไม่ได้ จึงไม่จำเป็นต้องทิ้ง public repo

Product requirement:

- public repo security notice
- private installer layer
- config-clean/update ที่ไม่ hardcode secret
- docs สำหรับ external fork ว่าต้องมี local model/gateway/hybrid paid ของตัวเอง

### 0.9.x: Work Event Logging และ PM/Non-dev Workflow

สิ่งที่เจอ:

- อยากลด manual daily log ด้วยหลักฐานจากงาน AI จริง
- PM/non-dev ต้องการ command คนละแบบกับ dev
- ถ้าทุกงานกลายเป็น dev workflow จะหนักเกินและเสียเวลา

บทเรียน:

- Product ต้องรองรับหลาย role ไม่ใช่มีแค่ coder mode
- work event ต้องเก็บ employee, project, command, task, status, token, duration
- PM/non-dev ควรมี command เบากว่า dev และเน้น outcome

Product requirement:

- work-event API
- role-based command
- employee/project attribution
- report/dashboard จาก event จริง

### 0.10.0: Session CLI เริ่มจริง

สิ่งที่เจอ:

- ต้องมี `bda start`, `bda event`, `bda stop`, `bda current`
- ถ้าไม่มี session จะรู้ไม่ได้ว่าใครเริ่มงานอะไร และปิดงานหรือยัง
- ถ้า server ไม่รับ event แล้ว client ยังเขียน local session จะเกิดข้อมูลหลอก

บทเรียน:

- start/stop จำเป็นสำหรับ accountability และ cost attribution
- แต่ session ต้องไม่กลายเป็นภาระหรือทำให้จอง GPU ค้าง
- local state ต้องเปลี่ยนหลัง server accept เท่านั้น

Product requirement:

- server-accepted session write
- retryable stop
- local outbox หรือ error handling ที่ไม่ทำ session หาย
- current session visibility

### 0.10.1: Context/Prompt ใหญ่ทำให้ Local ช้า

สิ่งที่เจอ:

- คำถามสั้นไม่ได้แปลว่าเบา ถ้า chat เก่ามี context ใหญ่มาก
- PF/KV cache ทำให้ GPU memory และ latency โต
- long chat history ทำให้ local queue ช้า แม้ user พิมพ์แค่ “สวัสดี”

บทเรียน:

- Local LLM ต้องสอนเรื่อง “fresh context” กับ “relevant context only”
- Dev workload ต้องแบ่ง phase และสรุปก่อนต่อ
- Product ต้องบอกผู้ใช้ว่าถ้า context ใหญ่ จะถูก route หรือแนะนำให้ลด context

Product requirement:

- context pressure detection
- prompt/token estimate
- user-facing explanation ว่าทำไมงานช้า
- docs/infographic เรื่อง PF + KV cache

### 0.10.2: เพิ่ม A40 เครื่องที่ 2 ไม่ได้แปลว่าจบ

สิ่งที่เจอ:

- เพิ่ม A40 แล้ว capacity ดีขึ้น แต่ถ้าเป็น LiteLLM pool อย่างเดียว request อาจกองเครื่องเดียว
- GPU 2 เครื่องเต็มพร้อมกันได้ถ้า context ใหญ่/queue ยาว
- ต้องมี admin view รวม GPU/VRAM/active requests รายเครื่อง

บทเรียน:

- Product ต้องมี gateway-controlled routing ไม่ใช่เชื่อ pool อย่างเดียว
- ต้องเห็น concurrent ต่อ node ไม่ใช่เห็นแค่ paid/local รวม
- “2 servers” ต้องแปลเป็น scheduling policy ที่ควบคุมได้

Product requirement:

- per-node routing telemetry
- active request samples
- GPU/VRAM timeline
- local/paid timeline แยก Gateway 1 / Gateway 2
- routing strategy setting

### 0.10.3: Server Accept / Stop Retry / Config Stability

สิ่งที่เจอ:

- 400/500/502 ทำให้คน retry ซ้ำและสร้าง load เพิ่ม
- ถ้า stop fail แล้วลบ session local จะปิดงานซ้ำไม่ได้
- Windows/Mac config path ต่างกันและ Hermes มี config/env ได้หลายที่

บทเรียน:

- Product ต้อง tolerate config path หลายแบบ
- คำสั่ง update/config-clean ต้องปลอดภัยและ idempotent
- error ต้องบอก action ถัดไป ไม่ใช่ให้ retry หลายรอบ

Product requirement:

- config-status/config-clean
- env fingerprint
- cache cleanup
- stop retry without losing session
- clear 400/502 guidance

### 0.10.17 - 0.10.18: Version/Update Confusion

สิ่งที่เจอ:

- บางเครื่องมี `bda update` แต่ PATH/installer มาคนละทาง
- `where bda` กับ `Get-Command bda` ให้ผลคนละแบบ
- Windows บางเคส `bda update` clone path เป็น `C:\C:\...`
- คนเริ่มสงสัยว่าต้อง clone repo หรือแค่ update

บทเรียน:

- ห้ามให้พนักงาน install ใหม่มั่วเมื่อเคยมี bda update แล้ว
- `bda update` ต้องเป็น path หลักของพนักงาน
- public repo สำหรับ maintainer/contributor; staff ใช้ updater

Product requirement:

- update diagnostics
- Windows updater fallback
- help/update notice
- Obsidian/admin note สำหรับ policy rollout

### 0.10.18 - 0.10.20: 400 จาก Missing Metadata และ Session Path Split

สิ่งที่เจอ:

- ผู้ใช้ `bda start` แล้วหน้า admin เห็น session แต่ Hermes ยังส่ง request โดยไม่มี metadata
- บางเครื่อง local session อยู่คนละ path เช่น project `.bda-skills` vs user `~/.bda-skills`
- user เปิด session ซ้ำเพราะ `bda current` ไม่เห็น session ที่เพิ่ง start
- 1 คนกลายเป็นหลาย session ทำให้ token/spend/admin rows แตก

บทเรียน:

- start/stop ต้องอยู่บน canonical session path เดียว
- server ต้อง dedupe repeated start
- client ต้องรับ server session id กลับมา sync local
- admin ต้องจับ duplicate owner/session ได้

Product requirement:

- canonical session file
- legacy session migration
- server-side start dedupe
- admin duplicate-session warning
- current/session health command

### 0.11.0: Public CLI + Help/Update Discipline

สิ่งที่เจอ:

- CLI, docs, command และ standard ควรรวมเป็น source เดียว
- พนักงานต้องอ่านข้อห้ามหลัง update และกลับมาอ่านได้ใน help
- External user ที่ clone public repo ต้องเข้าใจว่าไม่มี gateway/key/A40 ของ BDA

บทเรียน:

- Product ต้องมี docs ในตัว ไม่ใช่อาศัย Slack อย่างเดียว
- Public repo ควรช่วยขายแนวคิดและ contribution ได้ โดยไม่เปิด secret

Product requirement:

- `bda help` usage rules
- `bda update` reminder
- external deployment guide
- subscription AI phase planning prompt

### 0.11.1: Session Deduplication และ Active Request TTL

สิ่งที่เจอ:

- ผู้ใช้บางคนเปิด session ซ้ำเพราะ AI บอกเปิดแล้วแต่ `bda current` ไม่ขึ้น
- duplicate session ทำให้ GPU/paid usage แยกเป็นหลาย row
- active request ที่ stream ค้างทำให้ admin เห็น local pressure ไม่ตรง
- ถ้าใส่ limit ตอน production ยังไม่นิ่ง พนักงานติดคอขวดทันที

บทเรียน:

- Guardrail ต้องเปิดแบบ reversible และ monitor สด
- ก่อนบังคับ limit ต้องมี smooth fallback และ dedupe ที่พิสูจน์แล้ว
- ระหว่าง incident ควรปล่อย request ไหลก่อน แล้วค่อยกลับมา tighten policy

Product requirement:

- active request TTL
- dedupe start window
- safe rollout flag
- admin live active owner
- route comment ที่อ่านรู้เรื่อง
- incident mode: force-paid, unlimit, local-only ต้อง switch ได้เร็ว

## Dev vs Non-dev Product Segmentation

### บริษัทมี Dev Team

ต้องถือว่า workload หนักและ bursty:

- ต้องมี local GPU มากกว่า 1 node หรือมี paid fallback จริง
- ต้องมี admin dashboard ระดับ owner/session/request
- ต้องมี context guardrail, route reason, duplicate session detector
- ต้องมี coding behavior training: scan ครั้งเดียว, phase plan, stop session, avoid long context
- ต้องมี paid spend attribution ตาม employee/project

เหมาะกับ product tier:

- Local LLM Gateway Pro
- Hybrid Dev Team
- Admin A40 Dashboard
- Paid Fallback + Spend Control
- Work Event / Session Audit

### บริษัทไม่มี Dev Team หรือใช้ Non-dev เป็นหลัก

workload เบากว่า แต่ต้องคุม context:

- ใช้ local model เดี่ยวหรือ GPU เล็กกว่าได้
- เน้น document/chat/workflow templates
- paid fallback ใช้เฉพาะเอกสารยาวหรือ final quality
- admin dashboard อาจไม่ต้องละเอียดเท่า dev แต่ต้องเห็น spend และ active sessions

เหมาะกับ product tier:

- Local Knowledge Assistant
- Non-dev Workflow Pack
- Document Summary / Requirement / PM Report
- Simple Hybrid Fallback

## Product Features We Should Keep

- Local-first model alias เช่น `bda/dev`
- Hybrid paid fallback ที่มี route comment
- Admin A40 dashboard: GPU/VRAM, active requests, paid spend, pressure owners
- Employee/project/session metadata
- `bda start/current/stop`
- `bda update/config-clean/help`
- Context discipline docs
- Subscription AI planning prompt ก่อนเข้า local LLM
- Incident switches: force paid, unlimit, local threshold

## Product Risks To Design Around

- User opens multiple agents in same repo/task
- User sends huge context repeatedly because paid accepts it
- Session path/config mismatch
- Hermes stream/network stalls
- LiteLLM pool imbalance across local nodes
- Internal node aliases can pass key permissions but fail team permissions if only `LiteLLM_VerificationToken.models` is patched
- GPU appears full but admin cannot identify owner
- 400/502 retry loop
- Free cloud fallback rate limit causing slow/error storm
- DeepSeek/reasoning_content model compatibility issue

## Open Design Questions

- Should gateway split `bda/dev` into explicit node targets internally instead of relying on LiteLLM pool?
- Should local A40 slots be leased per employee/session with TTL instead of counted only by active requests?
- Should paid fallback be quota-based per employee/project/day?
- Should admin suggest behavior feedback automatically every 5 minutes from route logs?
- Should non-dev default to paid/subscription for long writing while dev gets local priority?

## 2026-06-25 Permission Lesson: Key Is Not Enough

When `bda/dev` was split into internal node aliases, the first hotfix patched `LiteLLM_VerificationToken.models` so employee keys could call:

- `bda/dev-a40-1-local`
- `bda/dev-a40-2-local`

The rollout still produced `HTTP 401 team_model_access_denied` because LiteLLM also checks `LiteLLM_TeamTable.models`. The real rule is:

> Any hidden model alias selected by the gateway must be allowed by every active LiteLLM permission layer, not only the API key.

Product implication:

- Public UX can stay simple: employees choose `bda/dev`.
- Internal routing can be explicit: gateway chooses A40 server 1 or server 2.
- Permission provisioning must expand `bda/dev` into its hidden internal aliases for keys and teams.
- Admin diagnostics must distinguish `key_model_access_denied` from `team_model_access_denied`.

Reusable artifact:

- `docs/litellm-dev-node-alias-permissions.md`
- `scripts/litellm-sync-dev-node-alias-permissions.sql`
- `scripts/litellm-sync-staff-model-permissions.sql`

## 2026-06-25 Permission Lesson: Behavior Guidance Is Not A Hard Lock

Non-dev and PM users originally had keys that allowed only:

- `bda/deepseek-fast-paid-cloud`
- `bda/deepseek-paid-cloud`

That matched the old behavioral preference, but failed after hybrid routing because the gateway could route a request to `bda/qwen3.7-plus-paid-cloud` or to local A40 aliases. Staff saw:

```text
HTTP 401 key_model_access_denied
Tried to access bda/qwen3.7-plus-paid-cloud
```

The corrected product rule:

- Internal BDA staff keys should include the full production model set that the gateway may choose.
- Usage discipline should be taught through `bda help`, Admin A40 feedback, and route comments.
- Do not encode behavior guidance as a model permission block unless the gateway is guaranteed never to route that user to the blocked model.

## 2026-06-27 Nondev Lane Lesson: Command Metadata And Model Alias Are Different Things

The team added `bda/nondev` as a real Gateway model alias for document, summary, analysis, and operation work. It is separate from the `bda-nondev` command metadata.

Production intent:

- `bda/dev` remains the main local-first work model for code/debug/review implementation.
- `bda/nondev` is the nondev/document lane backed by OpenRouter DeepSeek v4 Flash.
- Existing DeepSeek API aliases (`bda/deepseek-fast-paid-cloud`, `bda/deepseek-paid-cloud`) can remain available until their direct DeepSeek credit is exhausted, then be retired.
- `bda/nondev` should use OpenRouter reasoning exclusion when possible so clients do not have to replay provider-specific `reasoning_content` on the next turn.

Operational requirements:

- Add `bda/nondev` to public `/v1/models`, Hermes generated config, URL prefetch model allow list, and LiteLLM staff team/key permissions together.
- When adding a new public model alias, update `scripts/litellm-sync-staff-model-permissions.sql` in the same change. Otherwise nondev/PM staff may see `HTTP 401 key_model_access_denied` even though the model appears in the picker.
- Keep behavior guidance separate from permission. Staff may be told to prefer `bda/nondev` for nondev work, but internal staff permissions should still include the production fallback set the gateway can route to.
