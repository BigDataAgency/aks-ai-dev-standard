# BDA rule: Thai output self-review (บังคับ)

<!--
template นี้ใช้ 2 แบบ:
1. Cline global rule: bda update / bda setup / scripts/setup-cline-bda.sh ติดตั้งให้อัตโนมัติที่
   ~/Documents/Cline/Rules/bda-thai-review.md (มีผลทุก workspace)
2. per-repo: copy ไฟล์นี้ไปเป็น .clinerules ที่ root ของ target repo (หรือ .clinerules/thai-review.md)
รายละเอียด: docs/thai-output-safety.md
-->

โมเดล local (Qwen3.6) มีจุดอ่อนตอน generate ภาษาไทย: สระ/วรรณยุกต์อาจเพี้ยนเป็นรายครั้ง (เช่น "สั้่น", "น้ี") แต่โมเดลอ่าน/ตรวจ/แก้ภาษาไทยได้แม่น ดังนั้น: <!-- thai-check:ignore -->

- งานที่สร้างหรือแก้ข้อความภาษาไทย (string ใน code, comment, เอกสาร, commit message): **ก่อนปิดงาน ให้อ่านทวนข้อความไทยทั้งหมดที่เพิ่งเขียน** ตรวจสระ/วรรณยุกต์เพี้ยน ลำดับผิด หรือคำสะกดผิด แล้วแก้ให้ถูกต้องก่อนส่งมอบ
- ถ้ามี BDA CLI ให้รัน `bda thai-check <ไฟล์ที่แก้>` หรือ `bda thai-check --diff` เป็น safety net สุดท้ายก่อน commit
- ห้ามข้ามขั้นตอนนี้แม้งานเล็ก — ความเพี้ยนเกิดเป็นรายครั้งจึงคาดเดาไม่ได้
