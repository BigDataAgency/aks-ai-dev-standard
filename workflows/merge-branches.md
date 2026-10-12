# Workflow: merge-branches

รวมหลาย branch/ref เข้า target เดียวแบบเรียงลำดับ ทีละขั้น หยุดเมื่อไม่แน่ใจ ใช้ร่วมกับ [Git topology baseline](../policies/multi-repo-and-branching.md) ซึ่งยังเป็น gate หลัก (child before parent, branch→environment mapping, deploy/approval/rollback) workflow นี้ไม่ยกเว้นข้อใดของ baseline และไม่อนุญาต push/merge/deploy เอง

## Pre-flight
1. ระบุ target branch, base SHA, รายการ source ref + SHA, environment และ deploy trigger ตามตาราง mapping ใน baseline; ไม่ทราบ = หยุดและรายงาน blocker
2. Worktree ต้องสะอาดหรือเข้าใจทุกไฟล์ที่ค้าง ห้าม reset/clean เพื่อให้ดูสะอาด
3. ทำ inventory ต่อ ref: `git log --oneline <target>..<ref>` และ `git cherry -v <target> <ref>` (`-` = patch เทียบเท่ามีอยู่แล้ว, `+` = ยังไม่มี)
4. จัดแต่ละ ref เป็น in-scope / off-scope / already-applied พร้อมเหตุผล; off-scope ไม่ merge โดยไม่ถามเจ้าของงาน
5. Ref ที่มี off-scope commits ห้าม merge ทั้ง ref; เลือกเฉพาะ in-scope SHA ด้วย cherry-pick ตามกติกาโครงการ และบันทึกต้นทาง (เช่น -x). Ref ที่เคย cherry-pick บางส่วนต้องตรวจ patch equivalence/diff และเลือกเฉพาะส่วนที่ยังขาด ไม่เดาว่า merge ทั้ง branch ปลอดภัย
5.1 เลือกวิธีต่อ ref (merge หรือ cherry-pick) และเรียงลำดับ เล็ก/เสี่ยงต่ำ → ใหญ่/เสี่ยงสูง (ดูจำนวน commit, ไฟล์ที่แตะ, ไฟล์ที่ซ้อนกับ ref อื่น); บันทึกลำดับก่อนเริ่ม
6. ใช้ workflow เดิมตามขนาด/ชนิดของแต่ละ ref (`workflows/task-size-*.md`, `workflows/bug-fix.md`) สำหรับ verify ของ ref นั้น

## Per-ref loop
ทำทีละ ref ตามลำดับ ห้ามเริ่ม ref ถัดไปจนกว่า ref ปัจจุบัน verify แล้วหรือถูกหยุดอย่างเปิดเผย

1. บันทึก target HEAD ก่อน merge (จุด rollback ในเครื่อง)
2. Merge/cherry-pick ref นั้น; ถ้าไม่มี conflict ข้ามไปข้อ 5
3. **Conflict = หยุด ref loop** แก้ไฟล์ต่อได้เฉพาะเมื่อมีหลักฐาน intent และ behavior/test ของทั้งสองฝั่ง; ถ้ายังไม่รู้ให้คง conflict ไม่ข้ามไป ref ถัดไป
3.1 ระบุไฟล์ที่ conflict และ intent ของแต่ละฝั่ง (อ่าน commit/PR/issue ที่เกี่ยวข้อง)
4. ตัดสินใจต่อไฟล์ ตาม decision steps:
   1. เทียบ revision/behavior ปัจจุบันของ target กับ ref: ฝั่งไหนมี behavior ที่อีกฝั่งไม่มี (ดูโค้ดจริงและ test ไม่ใช่ชื่อ commit)
   2. ถ้ามี cross-reference ใน [policies/cross-reference.md](../policies/cross-reference.md) ให้ตรวจตามนั้นเป็นหลักฐานประกอบ ไม่ใช่คำตอบอัตโนมัติ
   3. รักษา intent ของทั้งสองฝั่ง (hybrid) เป็น default; เลือกฝั่งเดียวได้เมื่อยืนยันแล้วว่าอีกฝั่งไม่เสีย behavior ที่ต้องการ และบันทึกว่า behavior ใดถูกทิ้ง; behavior ที่ต้องคงไว้ทุกข้อมี regression test/manual evidence ที่ผ่าน ส่วนการตัดออกตามขอบเขตต้องมี decision/criterion ที่ยืนยัน ไม่เช่นนั้นคง conflict เปิด
   4. ไม่แน่ใจเรื่อง intent, behavior หรือผลกระทบ = **conflict ยังเปิดอยู่**: ไม่ resolve ไม่เดา, abort/ค้างขั้นนั้นไว้ตามที่ปลอดภัย แล้วถามเจ้าของงานพร้อมตัวเลือกและหลักฐาน
5. Verify ref นี้ก่อนไปต่อ: build/test/lint ตาม project gates; `git merge-base --is-ancestor <ref-sha> HEAD` สำหรับ merge; `git cherry -v <target> <ref>` ต้องไม่เหลือ `+` ที่ไม่ได้ตั้งใจ สำหรับ cherry-pick; ตรวจ diff ว่าไม่มีไฟล์/behavior นอก scope
6. Cherry-pick ที่ว่าง (patch เทียบเท่ามีอยู่แล้ว): ยืนยันด้วย `git cherry` / diff ว่า effect มีอยู่จริง แล้วจึง `git cherry-pick --skip`; ยืนยันไม่ได้ = ถือเป็น conflict เปิด
7. บันทึกผล: ref, SHA, วิธี, ไฟล์ conflict + การตัดสินใจ + เหตุผล, คำสั่งและผล verify (ไม่ได้รัน = Not verified)

## Final gates
- ระบุ verification gates จาก README/AGENTS/plan ของโครงการพร้อม command/revision; ถ้ายังไม่รู้ให้ Not verified
- Rollback ใช้ baseline/ขั้นของโครงการและเก็บหลักฐานก่อนหน้า ไม่ reset shared branch หรือลบงานเพื่อย้อนการ merge
- Verify ผลรวมหลังครบทุก ref (integration build/test) ไม่ใช้ผลรายขั้นแทน
- ทุก ref ใน inventory มีสถานะ: merged / skipped (already-applied) / off-scope / blocked พร้อมหลักฐาน
- Push, promotion และ deploy ทำได้เฉพาะตาม baseline และ approval ของโครงการ; แยก merged / deployed / accepted ใน handoff
- ส่ง handoff ตามหัวข้อบังคับด้านล่าง

## Evidence
- ลำดับ merge ที่วางแผนกับที่ทำจริง
- ผล `git cherry -v` ก่อน/หลัง และ merge SHA ต่อ ref
- ตาราง conflict + decision + behavior ที่ถูกทิ้ง (ถ้ามี)
- command ที่รัน ผล และสิ่งที่ยังไม่ได้ตรวจ

## Required report sections

ทุก workflow ต้องส่ง handoff/report ที่มีหัวข้อเหล่านี้ครบถ้วน:

- **BDA Standard files used**: path ของไฟล์มาตรฐาน BDA ที่ใช้จริง
- **Pipeline trace**: ขั้นตอน Understand → Plan → Execute → Verify → Handoff ที่ทำจริง และ command/workflow ที่ใช้
- **Commands run**: คำสั่งหรือ tool ที่รันจริง พร้อมผลสรุป; ถ้าไม่ได้รันให้บอกเหตุผล
- **Verification / Evidence**: หลักฐานตรวจจริง ไม่ใช้ claim ลอย ๆ
- **Limitations / Risks / Next steps**: ข้อจำกัด ความเสี่ยง และงานต่อ

---
ใช้เอกสารนี้เป็นมาตรฐานกลางของ AKS AI Dev Standard (เดิม BDA AI Dev Standard) ปรับใช้ได้กับมนุษย์และ AI โดยต้องยึดหลัก: เข้าใจงานก่อนทำ, มีแผนสั้น, ทำจริง, ตรวจจริง, ส่งมอบพร้อมหลักฐาน, ไม่อ้างผลลัพธ์ปลอม.
