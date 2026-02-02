// 📂 src/components/mapConfig.js

// Import รูปและวิดีโอมาไว้ที่นี่เลยจ้ะ หน้าหลักจะได้โล่งๆ
import waveVideo from "../assets/mapwater_3.mp4"; 
import waveimage from "../assets/mapwater.png";
import damimage from "../assets/dams.png";

// ส่งออกรูปภาพไปให้หน้าหลักใช้
export { damimage };

// --- 🟢 1. รายชื่อ 13 อำเภอ ---
export const LAMPANG_DISTRICTS = [
  "เมืองลำปาง", "แม่เมาะ", "เกาะคา", "เสริมงาม", "งาว", "แจ้ห่ม",
  "วังเหนือ", "เถิน", "แม่พริก", "แม่ทะ", "สบปราบ", "ห้างฉัตร", "เมืองปาน",
];

// --- 🟢 2. CONFIGURATION (ตั้งค่าตำแหน่ง) ---

export const RAIN_TABLE_CONFIG = {
  desktop: { top: "13.5%", left: "0.5%", width: "100px", scale: 1.6 },
  report:  { top: "21%", left: "1.3%", width: "87px", scale: 1.2 }
};

export const MAP_OVERLAY_CONFIG = {
  desktop: { top: "13%", left: "1.3%", width: "30%", height: "33%" }, 
  report:  { top: "21%", left: "3%", width: "26%", height: "26%" } 
};

export const DATE_TIME_CONFIG = {
  desktop: { top: "1%", right: "33.5%", scale: 1.1 },
  report:  { top: "13.5%", right: "35%", scale: 0.8 }
};

export const STATION_OVERLAYS = {
  เขื่อนภูมิพล: {
    desktop: { top: "21.1%", left: "35.2%", w: 105, h: 78 },
    report:  { top: "28%",   left: "15%",   w: 70,  h: 52 },
  },
  เขื่อนกิ่วลม: {
    desktop: { top: "25%", left: "79%", w: 77, h: 57 },
    report:  { top: "28%", left: "79%", w: 45, h: 33 },
  },
  เขื่อนสิริกิติ์: {
    desktop: { top: "29%", left: "72%", w: 55, h: 40 },
    report:  { top: "32%", left: "52%", w: 35, h: 25 },
  },
};

export const STATION_LOCATIONS = {
  เขื่อนภูมิพล: {
    desktop: { 
      set1: { top: "35%", left: "15%", fontSize: 24 }, 
      set2: { top: "40%", left: "15%", fontSize: 16 },
      dot: { top: "42%", left: "48%", size: "15px" }  
    },
    report: { 
      set1: { top: "36%", left: "15%", fontSize: 12 }, 
      set2: { top: "40%", left: "15%", fontSize: 8 },
      dot: { top: "42%", left: "48%", size: "15px" }
    },
  },
  เขื่อนกิ่วลม: {
    desktop: { 
      set1: { top: "35%", left: "79%", fontSize: 18 }, 
      set2: { top: "40%", left: "79%", fontSize: 14 },
      dot: { top: "42%", left: "48%", size: "15px" }
    },
    report: { 
      set1: { top: "36%", left: "79%", fontSize: 10 }, 
      set2: { top: "40%", left: "79%", fontSize: 8 },
      dot: { top: "42%", left: "48%", size: "15px" }
    },
  },
};

export const MAP_CAROUSEL_DATA = [
    { id: 1, region: "ภาพรวมประเทศ", video: waveVideo, image: waveimage }
];

// --- 🟢 เพิ่ม Config สำหรับตารางสรุปสถานะน้ำ ---
export const WATER_SUMMARY_CONFIG = {
  desktop: { top: "15%", left: "45.5%", width: "180px", scale: 0.83 },
  report:  { top: "22%", left: "45.5%", width: "180px", scale: 0.63 }
};