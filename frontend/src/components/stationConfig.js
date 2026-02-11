// src/utils/stationConfig.js

// --- 1. ข้อมูลสถานีสำหรับโหมดน้ำ (Rivers) ---
export const STATION_DATA = [
  // { name: "เขื่อนภูมิพล", capacity: 13462, tambon: "สามเงา", amphoe: "สามเงา", province: "ตาก", groupId: "group-large" },
  // { name: "เขื่อนสิริกิติ์", capacity: 9510, tambon: "ผาเลือด", amphoe: "ท่าปลา", province: "อุตรดิตถ์", groupId: "group-large" },
  // { name: "เขื่อนป่าสักฯ", capacity: 960, tambon: "หนองบัว", amphoe: "พัฒนานิคม", province: "ลพบุรี", groupId: "group-large" },
  // { name: "เขื่อนอุบลรัตน์", capacity: 2431, tambon: "เขื่อนอุบลรัตน์", amphoe: "อุบลรัตน์", province: "ขอนแก่น", groupId: "group-large" },
  { name: "เขื่อนกิ่วลม", capacity: 106.22, tambon: "บ้านแลง", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-large" },
  { name: "เขื่อนกิ่วคอหมา", capacity: 170.29, tambon: "ปงดอน", amphoe: "แจ้ห่ม", province: "ลำปาง", groupId: "group-large" },
  { name: "อ่างเก็บน้ำแม่ฟ้า", capacity: 90, tambon: "แจ้ห่ม", amphoe: "แจ้ห่ม", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่อาง", capacity: 90, tambon: "บ้านแลง", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำห้วยทราย", capacity: 90, tambon: "ต้นธงชัย", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-medium" },
  { name: "เขื่อนแม่ขาม", capacity: 90, tambon: "แม่เมาะ", amphoe: "แม่เมาะ", province: "ลำปาง", groupId: "group-medium" },
  { name: "เขื่อนแม่จาง", capacity: 90, tambon: "นาส่ง", amphoe: "เกาะคา", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ทะ", capacity: 90, tambon: "แม่ทะ", amphoe: "แม่ทะ", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ไฮ", capacity: 90, tambon: "ปงยางคก", amphoe: "ห้างฉัตร", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ธิ", capacity: 90, tambon: "วังพร้าว", amphoe: "เกาะคา", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่วะ", capacity: 100, tambon: "แม่วะ", amphoe: "เถิน", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ทาน", capacity: 90, tambon: "แม่กัวะ", amphoe: "สบปราบ", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำห้วยหลวง", capacity: 90, tambon: "แม่กัวะ", amphoe: "สบปราบ", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่เรียง", capacity: 90, tambon: "เสริมขวา", amphoe: "เสริมงาม", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ทก", capacity: 90, tambon: "สบปราบ", amphoe: "สบปราบ", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำห้วยสมัย", capacity: 90, tambon: "สมัย", amphoe: "สบปราบ", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่นึง", capacity: 90, tambon: "เมืองปาน", amphoe: "เมืองปาน", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ค่อม", capacity: 90, tambon: "บ้านเอื้อม", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่เฟือง", capacity: 90, tambon: "บ้านเอื้อม", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ต๋ำน้อย", capacity: 90, tambon: "บ้านเอื้อม", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ไพร", capacity: 90, tambon: "วอแก้ว", amphoe: "ห้างฉัตร", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำห้วยหลวงวังวัว", capacity: 90, tambon: "ทุ่งฝาย", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ทรายทายคำ", capacity: 90, tambon: "นิคมพัฒนา", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่สัน", capacity: 90, tambon: "แม่ทะ", amphoe: "แม่ทะ", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ปอน", capacity: 90, tambon: "เมืองยาว", amphoe: "ห้างฉัตร", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ยาว", capacity: 90, tambon: "แม่สัน", amphoe: "ห้างฉัตร", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำห้วยเกี๋ยง", capacity: 90, tambon: "เมืองยาว", amphoe: "ห้างฉัตร", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่กึ๊ด", capacity: 90, tambon: "ทุ่งงาม", amphoe: "เสริมงาม", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่เลียงพัฒนา", capacity: 90, tambon: "เสริมขวา", amphoe: "เสริมงาม", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ต๋ำตอนล่าง", capacity: 90, tambon: "เสริมซ้าย", amphoe: "เสริมงาม", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่อาบ", capacity: 90, tambon: "นาแก้ว", amphoe: "เกาะคา", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่พริก", capacity: 90, tambon: "แม่พริก", amphoe: "แม่พริก", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่พริก(ผาวิ่งชู้)", capacity: 90, tambon: "แม่พริก", amphoe: "แม่พริก", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ล้อหัก", capacity: 90, tambon: "แม่พริก", amphoe: "แม่พริก", province: "ลำปาง", groupId: "group-medium" }
];

// --- 2. ข้อมูลจุดวัดน้ำฝน (Rain) ---
export const RAIN_STATION_DATA = [
  { name: "เมืองลำปาง", tambon: "หัวเวียง", amphoe: "เมืองลำปาง", province: "ลำปาง" },
  { name: "แม่เมาะ", tambon: "แม่เมาะ", amphoe: "แม่เมาะ", province: "ลำปาง" },
  { name: "เกาะคา", tambon: "เกาะคา", amphoe: "เกาะคา", province: "ลำปาง" },
  { name: "เสริมงาม", tambon: "ทุ่งงาม", amphoe: "เสริมงาม", province: "ลำปาง" },
  { name: "งาว", tambon: "หลวงเหนือ", amphoe: "งาว", province: "ลำปาง" },
  { name: "แจ้ห่ม", tambon: "แจ้ห่ม", amphoe: "แจ้ห่ม", province: "ลำปาง" },
  { name: "วังเหนือ", tambon: "วังเหนือ", amphoe: "วังเหนือ", province: "ลำปาง" },
  { name: "เถิน", tambon: "ล้อมแรด", amphoe: "เถิน", province: "ลำปาง" },
  { name: "แม่พริก", tambon: "แม่พริก", amphoe: "แม่พริก", province: "ลำปาง" },
  { name: "แม่ทะ", tambon: "นาครัว", amphoe: "แม่ทะ", province: "ลำปาง" },
  { name: "ห้างฉัตร", tambon: "ห้างฉัตร", amphoe: "ห้างฉัตร", province: "ลำปาง" },
  { name: "เมืองปาน", tambon: "เมืองปาน", amphoe: "เมืองปาน", province: "ลำปาง" },
  { name: "สบปราบ", tambon: "สบปราบ", amphoe: "สบปราบ", province: "ลำปาง" }
];

// --- 3. ข้อมูลสำหรับโหมด "น้ำในเขื่อน" (Dams) ---
export const DAM_STATION_DATA = [
  { name: "ขนาดใหญ่", capacity: 277 },
  { name: "ขนาดกลาง", capacity: 173 },
  { name: "ขนาดเล็ก", capacity: 33 },
  { name: "อ่างเก็บน้ำชลประทาน", capacity: 483 },
];