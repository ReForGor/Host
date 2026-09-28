# 📁 Frontend: Price Chart Modal & Price Alert
* **Git Branch:** `feature/frontend-chart-modal`
* **หน้าที่ความรับผิดชอบ:** หน้าต่างดูราคาเปรียบเทียบ + กราฟประวัติราคา Chart.js + กล่องตั้งแจ้งเตือนราคาลด (2-Column Modal ตามแบบสเก็ตช์)
* **ไฟล์โค้ดหลักในโปรเจกต์:** 
  - `frontend/src/components/PriceChartModal.jsx` (มีสำเนาโค้ดอัปเดตล่าสุดอยู่ในโฟลเดอร์นี้ด้วย: `PriceChartModal.jsx`)

---

## 🎨 โครงสร้างหน้าต่าง Modal (ตามแบบสเก็ตช์ลายมือ):
```text
┌──────────────────────────────────────┬──────────────────────────────────────┐
│  [ รูปสินค้า ]                       │  [ กราฟประวัติราคา Chart.js ]        │
│                                      │                                      │
│  ชื่อ :                              │                                      │
│  สเปค :                              ├──────────────────────────────────────┤
│                                      │  [ กล่องเตือนลดราคา ]                │
│  [ ตารางเปรียบเทียบราคา 4 ร้านค้า ]  │  - ช่องกรอกราคาเป้าหมาย              │
│  - Advice, JIB, BaNANA, iHaveCPU     │  - ช่องกรอกอีเมล                     │
│  - ราคา, ส่วนต่าง, ลิงก์ตรงไปซื้อ   │  - ปุ่มกดบันทึกการแจ้งเตือน          │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 💻 วิธีการทำงานและการ Commit กิ่งนี้:
```bash
# 1. สลับมาที่ Branch นี้
git checkout feature/frontend-chart-modal

# 2. ทำการแก้ไขหรือทดสอบโค้ด
# 3. บันทึกและ Commit
git add .
git commit -m "feat(modal): implement 2-column layout with specs, comparison table, chart and price alert box"
```
