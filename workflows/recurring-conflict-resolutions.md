# Workflow: recurring-conflict-resolutions

ใช้เมื่อ merge/cherry-pick พบไฟล์หรือ behavior ที่เคย conflict ซ้ำ ทำต่อจาก [merge-branches](merge-branches.md) และ [cross-reference policy](../policies/cross-reference.md); ไม่ข้าม scope, release หรือ owner approval gates ของโครงการ

## Reported patterns — ยังไม่ใช่ canonical source

ที่มา: issue #3 feedback #4 ใน `BigDataAgency/aks-ai-dev-standard` รายงานการรวม `android-update-16kb` กับ `JO-FastPay` ใน native projects และอ้าง release `release-26052026` ตารางนี้เป็นรายงานเดิม ไม่ได้ตรวจโค้ด/ref/SHA ปัจจุบันของโครงการเหล่านั้น ใช้หาไฟล์เสี่ยงเท่านั้น

| ไฟล์ | Pattern ที่รายงาน | สิ่งที่ต้องรักษาจากทั้งสองฝั่ง | Reference ที่รายงาน (Not verified) |
| --- | --- | --- | --- |
| `App.js` | SafeAreaProvider กับ Floating Debug Logger | provider tree/context, safe-area layout และ debug behavior ตาม environment เดิม | hybrid ใน rbru |
| `src/utils/LocationUtils.js` | try-catch กับ error callback | success path, exception handling, error callback และ cleanup ตาม contract เดิม | hybrid ใน bsru |
| `src/scenes/home/NewsAndEventScreen.js` | duplicate `handleService` | `checkURL`, `message != null`, navigation/service behavior ทุก path; รวม handler โดยไม่ทิ้ง guard | รายงาน take-theirs ใน bsru แล้ว behavior หาย; เป็น failure example ไม่ใช่คำแนะนำ |

Canonical choice ต้องมีหลักฐาน target/source และ cross-reference จาก project-owned registry ที่ revision/feature/dependency เทียบกันได้ ห้าม unconditional take-theirs/take-ours หรือเลือกจากชื่อโครงการในตาราง

## Checklist / decision tree

- [ ] **1. ก่อนถามเจ้าของงาน:** อ่าน diff และ intent ของ target/source ที่ SHA ตรึงไว้ หา pattern ในตารางนี้ แล้วค้น registry ของโครงการตาม policy ก่อน prompt; ไม่มี registry/สิทธิ์/หลักฐานเพียงพอ = Not verified และคง conflict เปิด ถามพร้อมสิ่งที่ตรวจแล้ว ไม่เดาชื่อ repo เพิ่ม
- [ ] **2. ตรวจ feature:** ถ้าเกี่ยวกับ transit v2 ให้ยืนยันจาก code/config/tests ที่ SHA นั้นว่ามี/ไม่มี/ยังไม่ทราบ ทั้ง target/source และ registry reference; เลือกอ้างอิงเฉพาะ feature ที่เทียบกันได้ ไม่ทราบหรือบริบทต่างกัน = กลับข้อ 1 และคง conflict เปิด
- [ ] **3. ทำ behavior inventory:** ระบุ behavior ของแต่ละฝั่งที่ต้องคง/ตัด พร้อม criterion และ test/manual evidence; feature ที่ไม่มีใน target แต่เป็น intent ของ source ยังต้องรักษาเมื่ออยู่ใน scope การตัดต้องมี scoped decision ของเจ้าของงานตามกติกาโครงการ
- [ ] **4. เลือกต่อไฟล์:** ถ้า behavior ทั้งสองต้องคง ใช้ hybrid ที่รักษา guards/error handling; เลือกฝั่งเดียวได้เมื่อ inventory ยืนยันว่าไม่สูญเสีย behavior ที่ต้องคงและรายการตัดได้รับสิทธิ์แล้ว ข้อมูลขัดกัน = กลับข้อ 1–3; ไม่ resolve เพื่อให้ merge ผ่าน
- [ ] **5. ตรวจผล:** เทียบ resolved diff กับ inventory และรัน regression mapping ด้านล่างบน revision นั้นพร้อม project gates; fail/missing evidence = กลับข้อ 3–4 ไม่เริ่ม ref ถัดไป จำกัดแก้–ตรวจไม่เกิน 3 รอบต่อสาเหตุหรือเพดานโครงการที่เข้มกว่า ครบแล้วยังไม่ผ่าน = ส่ง blocker พร้อมหลักฐาน
- [ ] **6. บันทึก:** target/source/reference SHA, registry entry, feature/dependency match, decision, behavior retained/removed, criterion, command/manual steps และผลใน [QA report](../templates/test-scenario-report.md) แล้วกลับ per-ref verify ใน merge workflow; build ผ่านอย่างเดียวไม่แทน behavior evidence

## Regression mapping

ทดสอบเฉพาะ behavior ที่เกี่ยวข้องบน environment/สิทธิ์ที่ได้รับอนุญาต Expected ต้องอิง contract ของโครงการและทั้งสองฝั่งก่อน merge; ไม่ใช้ชื่อ pattern เป็นผลผ่านล่วงหน้า

| Scenario | Expected ที่ต้องยืนยัน | หลักฐาน |
| --- | --- | --- |
| App/provider + debug | safe-area/context และ navigation ยังทำงาน; logger behavior คงตาม environment เดิม รวมเปิด/ปิดถ้ามี | component test และ runtime screenshot/interaction ของ viewport ที่รองรับ |
| Location/success + failure | success contract คงเดิม; exception และ error callback ไม่หาย/ไม่ซ้ำเกิน contract; cleanup และ permission-denied path ถ้าเกี่ยวข้อง | targeted test ของ success/throw/callback/permission inputs พร้อม expected/actual |
| NewsAndEvent/service + guards | handler ไม่ซ้ำ; `checkURL` ทำงานกับ valid/invalid URL ตาม contract; `message != null` ป้องกัน null/undefined ก่อนใช้งาน; navigation/service action คงเดิม | targeted test และ runtime evidence สำหรับ valid/invalid URL, null/undefined และ normal message |
| Transit v2 feature branch (ถ้าเกี่ยวข้อง) | behavior ที่เลือกตรง feature/config ปัจจุบัน; path ของ feature ที่ไม่มีเป็น N/A พร้อมเหตุผล | feature/config source ที่ SHA และ scenario ต่อ path |

สำหรับ UI ให้เก็บจอคอม/มือถือและ theme ตาม project gates; runtime/device เข้าไม่ได้ = Not verified ไม่แทนด้วยผล unit/build การใช้ synthetic fixture ต้อง label และไม่อ้างเป็น customer acceptance

## Resolution record example (ข้อมูลสมมติ)

| File / target + source SHA | Registry / reference SHA | Decision | Retained behavior → scenario | Removed behavior / scoped decision | Result |
| --- | --- | --- | --- | --- | --- |
| NewsAndEvent / `<target>` + `<source>` | `<project registry entry>@<ref-sha>` (ยังไม่ตรวจ) | Pending; keep conflict open | checkURL → valid/invalid; null guard → null/undefined; service → normal message | none authorized | Not verified |

ไม่ให้ implementation snippet ที่คัดลอกไปใช้ข้าม revision เพราะ signatures/behavior ของ customer source ยังไม่ถูกตรวจ ใช้ inventory และ tests ระบุการแก้ที่เล็กที่สุดในโครงการจริง

## Required report sections

- **BDA Standard files used**: workflow/policy/template และ registry ที่อ่านจริง
- **Pipeline trace**: Understand → Plan → Execute → Verify → Handoff พร้อมขั้นที่หยุด
- **Commands run**: คำสั่ง/manual steps และผล; ไม่ได้รันให้ระบุเหตุผล
- **Verification / Evidence**: SHA/behavior/scenario/expected/actual/evidence mapping
- **Limitations / Risks / Next steps**: conflict ที่เปิด, feature ที่ยังไม่ทราบ และการตรวจที่ขาด

เอกสารนี้ตอบ feedback #4 ระดับ workflow/template เท่านั้น ไม่ยืนยันการแก้ customer project, deploy, native device acceptance หรือการปิด issue #3 ทั้งชุด
