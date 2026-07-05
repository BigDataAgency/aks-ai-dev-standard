# งาน (1 slice ชัดเจน): Order Service ของ Restaurant POS

สร้าง **Order Service** เดี่ยวๆ ให้เสร็จและรัน test ผ่านจริงในวันนี้ (ไม่ต้องทำระบบอื่น):
- REST API (เลือกภาษาเองได้: Python/FastAPI หรือ Node/Express) มี endpoint:
  1. POST /orders — สร้างออเดอร์ (items, table_no) คืน order_id + status="pending"
  2. GET /orders — list ออเดอร์ทั้งหมด
  3. GET /orders/{id} — ดูออเดอร์เดียว
  4. PATCH /orders/{id}/status — เปลี่ยนสถานะ ต้องบังคับ flow: pending→cooking→ready→served (ห้ามข้ามขั้น เช่น pending→ready ต้อง reject 400)
- เขียน **unit test** ครอบ: สร้างออเดอร์, เปลี่ยนสถานะถูกลำดับผ่าน, เปลี่ยนข้ามขั้นถูก reject
- ต้อง **รัน test เห็นผ่านจริง** ก่อนบอกเสร็จ, ประกาศ dependency (requirements.txt / package.json) ให้ครบเพื่อให้คนอื่นรันได้
- git commit
- รายงานสั้นๆ: ทำอะไร, test ผ่านกี่เคส (แปะผลจริง)

กติกา: ใช้ tool เขียนไฟล์/รันจริง, ห้ามบอกผ่านถ้าไม่ได้รันเห็นผ่าน, ทำใน directory ปัจจุบัน
