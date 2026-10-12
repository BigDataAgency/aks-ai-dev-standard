# Checklist: before-commit

- [ ] git diff สะอาดตาม scope
- [ ] success criteria ครบและตรวจกลับได้
- [ ] change เป็น minimum correct change
- [ ] ทุก changed line trace กลับไปยัง request, bug, success criteria, หรือ verification ได้
- [ ] ไม่มี speculative abstraction/config/dependency/feature
- [ ] ไม่มี unrelated refactor หรือ format churn
- [ ] ไม่มี secret
- [ ] ไม่มี debug log ไม่จำเป็น
- [ ] format/test เท่าที่ควร และ verification map กลับไปยัง success criteria
- [ ] docs updated ถ้าจำเป็น

- [ ] CREATE OR REPLACE FUNCTION / RPC rewrite: ระบุdefinitionล่าสุดและappliedstateที่ทราบ, เทียบsignature/body/settings และทดสอบpriorbehaviorที่ต้องpreserve; ถ้าไม่เกี่ยวให้N/Aพร้อมเหตุ ไม่อ้างcompileผ่านว่าไม่มีclobber
