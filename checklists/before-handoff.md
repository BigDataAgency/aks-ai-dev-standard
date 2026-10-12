# Checklist: before-handoff

- [ ] summary ชัด
- [ ] files listed
- [ ] verification included
- [ ] risks included
- [ ] next step included

- [ ] submodule/child repo: verify/build ทุก repo ที่แตะ; child push สำเร็จก่อน parent pointer, exact SHA reachable บน intended remote/ref และ staged gitlink ตรงหลักฐาน ตาม policies/multi-repo-and-branching.md; ไม่เกี่ยวให้ N/A
- [ ] หลาย branch: ยืนยัน source SHA/target branch, branch↔environment mapping, promotion direction, push/merge deploy trigger, verification แต่ละขั้น และ scoped approval/rollback ก่อน production action; ไม่ทราบให้หยุดขั้นนั้น
