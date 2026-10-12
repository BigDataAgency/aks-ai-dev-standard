# Multi-repo and branching

Baseline นี้ใช้เมื่อมี child repo/submodule หรือหลาย release branches; project-specific rules กำหนด topology และ gates จริง แต่ไม่ยกเว้น pointer integrity หรือสิทธิ์ปล่อยระบบ

## Before changes

ระบุทุก repo/path, remote, source branch/revision, target branch และ verification/build command ต่อ repo ที่แตะ รวม nested submodules หากมี; ถ้าไม่เกี่ยวให้ N/A พร้อมเหตุ อย่าเปลี่ยน pointer ของงานคนอื่นหรือ reset/clean เพื่อทำให้ checkout ดูสะอาด

## Child before parent

1. ตรวจ diff และ verify/build ทุก repo ที่แตะตาม project gates แล้ว commit เฉพาะไฟล์งานใน child
2. Push child commit ไป intended remote/ref ให้สำเร็จก่อน stage/update parent pointer; ถ้า push ล้มเหลวให้หยุด parent ห้าม `git add -A` ใน parent ก่อน child push สำเร็จ
3. Fetch intended child remote/ref แล้วตรวจ exact child commit ที่ parent จะชี้ว่า reachable จาก ref นั้น เช่น `git -C <child> merge-base --is-ancestor <child-sha> <fetched-ref>` ต้อง exit 0; shallow history/permission ที่พิสูจน์ไม่ได้ = Not verified ห้ามเดาว่าผ่าน ตรวจ remote URL กับ .gitmodules และสิทธิ์ของผู้รับงานด้วย
4. Stage เฉพาะ submodule path และไฟล์ parent ที่เกี่ยวข้อง ตรวจ `git diff --cached --submodule=log` และ gitlink SHA ด้วย `git ls-files --stage -- <child>` ว่าตรง exact verified child commit ก่อน commit/push parent
5. Verify parent integration/build และ push ไป target ที่ยืนยันแล้ว; nested topology ทำจาก child ชั้นในออกมาจนถึง parent เก็บ child push receipt, remote/ref/SHA และ parent gitlink เป็นหลักฐาน

Pointer ต้องตรง verified child SHA และ reachable บน intended remote ไม่จำเป็นต้องเท่ากับ remote branch tip (submodule อาจ pin commit เก่า/detached HEAD ที่ถูกต้อง). `git push --recurse-submodules=check <parent-remote> <parent-refspec>` เป็น guard เพิ่มเติม: ไม่แทนการตรวจ intended child remote/ref เพราะ Git ตรวจ availability บนอย่างน้อยหนึ่ง remote

## Branch to environment and promotion

กรอก mapping ก่อน merge/push ทุกขั้น; ชื่อ branch ไม่ยืนยัน environment และอย่าสมมติว่า dev ไม่มี auto-deploy

| Repo | Source branch/SHA | Target branch | Environment | Push/merge deploy trigger | Promotion direction | Approval / rollback | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [repo] | [source + SHA] | [target] | [environment] | [none/manual/CI event + workflow] | [project rule] | [scope + rollback revision] | [command/evidence or Not verified] |

- ตัวอย่างเท่านั้น: dev → staging → main; บางโครงการใช้ dev → main. ยึด project rules ไม่บังคับจำนวนหรือชื่อ branches
- ถ้ากติกาต้อง sync ทางลง เช่น main → dev ให้ทำก่อน promotion แล้ว verify หลัง sync; ไม่ merge กลับทางโดยอัตโนมัติ ไม่ cherry-pick/force-push เพื่อข้าม gates
- ก่อนแต่ละ merge/promote ยืนยัน source SHA, target branch, environment และ deploy trigger อีกครั้ง ตรวจ diff/review/tests ของ revision นั้น รวม pointer integration; หลัง merge ตรวจ merge SHA และผล verify/CI ของ target แต่ละขั้น
- Push/merge ที่ trigger production deploy เป็น production action ต้องมี scoped owner approval ของรุ่นนี้และ rollback พร้อมก่อนลงมือ; environment อื่นใช้ gates ของโครงการ ถ้า mapping/trigger/approval ไม่ทราบให้หยุดขั้นที่เกี่ยวข้องและรายงาน blocker ไม่ถือ dev merge เป็น production approval
- Handoff บันทึก repo/branches touched, child push/pointer evidence, mapping, promotion ที่ทำจริงและผลแต่ละขั้น แยก merged / deployed / accepted

## References

- [Git push: recurse-submodules checks](https://git-scm.com/docs/git-push) — availability guard and explicit refspec
- [Git book: submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) — child before parent and pinned commits
