// 📂 src/components/mapConfig.js

// Import รูปและวิดีโอมาไว้ที่นี่เลยจ้ะ หน้าหลักจะได้โล่งๆ
import waveVideo from "../assets/mapwater_7.mp4"; 
import waveimage from "../assets/3.png";
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


// ตำแหน่งและขนาดของตารางปริมาณฝน
export const MAP_OVERLAY_CONFIG = {
  desktop: { top: "14.2%", left: "1.5%", width: "30%", height: "33%" }, 
  report:  { top: "21%", left: "3%", width: "26%", height: "26%" } 
};


// ตำแหน่งและขนาดของ Overlay แผนที่ขนาดเล็ก
export const DATE_TIME_CONFIG = {
  desktop: { top: "3.5%", right: "33.5%", scale: 1 },
  report:  { top: "13.5%", right: "35%", scale: 0.8 }
};
// --- 🟢 3. CONFIGURATION สำหรับ Overlay สถานีต่างๆ ---


export const STATION_OVERLAYS = {
  ขนาดใหญ่: {
    desktop: { top: "64.1%", left: "9%", w: 70, h: 50 },
    report:  { top: "61.1%",   left: "9%",   w: 50,  h: 37 },
  },
  ขนาดกลาง: {
    desktop: { top: "78.8%", left: "9%", w: 70, h: 50 },
    report:  { top: "72.8%", left: "9%", w: 45, h: 33 },
  },
  ขนาดเล็ก: {
    desktop: { top: "93.3%", left: "9%", w: 70, h: 50 },
    report:  { top: "84.3%", left: "9%", w: 45, h: 37 },
  },
  อ่างเก็บน้ำชลประทาน: {
    desktop: { top: "94.7%", left: "20.5%", w:55, h: 40 },
    report:  { top: "85.5%", left: "20.5%", w: 37, h: 27 },
  },
};
// ตำแหน่งและขนาดของ Overlay สถานีต่างๆ

// --- 🟢 4. CONFIGURATION สำหรับ Overlay เขื่อนรวม ---


export const COMBINED_DAM_CONFIG = {
  desktop: { top: "21.5%", left: "35%", scale: 1.1 },
  report:  { top: "27.3%", left: "35%", scale: 0.8 } // ปรับค่าตามความสวยงามของหน้ารายงาน
};



// --- 🟢 5. CONFIGURATION สำหรับตำแหน่งชื่อสถานีบนแผนที่ ---
export const STATION_LOCATIONS = {
  // เขื่อนภูมิพล: {
  //   desktop: { 
  //     set1: { top: "35%", left: "15%", fontSize: 24 }, 
  //     set2: { top: "40%", left: "15%", fontSize: 16 },
     
  //   },
  //   report: { 
  //     set1: { top: "36%", left: "15%", fontSize: 12 }, 
  //     set2: { top: "40%", left: "15%", fontSize: 8 },
    
  //   },
  // },
  เขื่อนกิ่วลม: {
    desktop: { 
      set1: { top: "35.5%", left: "78.7%", fontSize: 12 }, 
      set2: { top: "37.5%", left: "78.7%", fontSize: 12 },
      dot: { top: "32.5%", left: "80.5%", size: "14px" }
    },
    report: { 
      set1: { top: "38.4%", left: "78.2%", fontSize: 9 }, 
      set2: { top: "40%", left: "78.4%", fontSize: 8 },
      dot: { top: "42.5%", left: "70.5%", size: "14px" }
    },
  },
    เขื่อนกิ่วคอหมา: {
    desktop: {
      set1: { top: '22.5%', left: '80%', fontSize: 12 }, 
      set2: { top: '24.5%', left: '80%', fontSize: 12 },
      dot: { top: "19.8%", left: "70.5%", size: "14px" } 
    },
    report: {
      set1: { top: '28%', left: '79.5%', fontSize: 9 }, 
      set2: { top: '29.5%', left: '79.5%', fontSize: 8 },
      dot: { top: "26.2%", left: "70.5%", size: "14px" } 
    },
  },
  อ่างเก็บน้ำแม่ฟ้า: {
    desktop: {
      set1: { top: '30.7%', left: '75.3%', fontSize: 9 },
      set2: { top: '31.2%', left: '79%', fontSize: 9 },
      dot: { top: "25.8%", left: "70.5%", size: "14px" } 
    },
    report: {
      set1: { top: '33.7%', left: '80.5%', fontSize: 8 },
      set2: { top: '34%', left: '84%', fontSize: 8 },
      dot: { top: "31%", left: "70.5%", size: "14px" } 
    },
  },
  อ่างเก็บน้ำแม่อาง: {
    desktop: {
      set1: { top: '37%', left: '88%', fontSize: 9 },
      set2: { top: '37.5%', left: '91.5%', fontSize: 9 },
      dot: { top: "31%", left: "67.4%", size: "14px" } 
    },
    report: {
      set1: { top: '39.7%', left: '88.5%', fontSize: 8 },
      set2: { top: '41.2%', left: '87.5%', fontSize: 8 },
    },
  },
  เขื่อนแม่ขาม: {
    desktop: {
      set1: { top: '49%', left: '87%', fontSize: 10 },
      set2: { top: '51%', left: '87%', fontSize: 10 },
      dot: { top: "58.3%", left: "73%", size: "14px" } 
    },
    report: {
      set1: { top: "49.5%", left: "86.5%", fontSize: 9 },
      set2: { top: '50.8%', left: '86.5%', fontSize: 8 },
    },
  },
    เขื่อนแม่จาง: {
    desktop: {
      set1: { top: '50%', left: '94%', fontSize: 10 },
      set2: { top: '52%', left: '94%', fontSize: 10 },
      dot: { top: "58.3%", left: "82.4%", size: "14px" }  
    },
    report: {
      set1: { top: '50.5%', left: '93.8%', fontSize: 9 },
      set2: { top: '51.8%', left: '93.8%', fontSize: 8 },
    },
  },
    อ่างเก็บน้ำห้วยทราย: { 
    desktop: {
      set1: { top: "53.6%", left: "86%", fontSize: 8 },
      set2: { top: '54.8%', left: '88%', fontSize: 7 },
       dot: { top: "55.4%", left: "70.5%", size: "14px" } 
    },
    report: {
      set1: { top: "53%", left: "86.2%", fontSize: 8 },
      set2: { top: '53.5%', left: '89%', fontSize: 7 }
    },
  },
  อ่างเก็บน้ำแม่ทะ: {
    desktop: {
      set1: { top: '54%', left: '74.8%', fontSize: 9 },
      set2: { top: '54.5%', left: '78.3%', fontSize: 9 }
    },
    report: {
      set1: { top: '53.2%', left: '74.9%', fontSize: 9 },
      set2: { top: '53.6%', left: '79%', fontSize: 8 },
      dot: { top: "55.8%", left: "81.5%", size: "10px" }
    },
  },
  อ่างเก็บน้ำแม่ไฮ: {
    desktop: {
      set1: { top: '60.7%', left: '75.7%', fontSize: 8 },
      set2: { top: '62.4%', left: '75%', fontSize: 8 }
    },
    report: {
      set1: { top: '58.6%', left: '75.7%', fontSize: 6 },
      set2: { top: '60%', left: '75.2%', fontSize: 7 }
    },
  },
  อ่างเก็บน้ำแม่ธิ: {
    desktop: {
      set1: { top: '64.5%', left: '74%', fontSize: 9 },
      set2: { top: '64.8%', left: '77.8%', fontSize: 9 }
    },
    report: {
      set1: { top: '61.3%', left: '77%', fontSize: 8 },
      set2: { top: '62.5%', left: '77%', fontSize: 8 }
    },
  },
    อ่างเก็บน้ำแม่วะ: {
    desktop: {
      set1: { top: '64.5%', left: '84%', fontSize: 9 },
      set2: { top: '65%', left: '87.5%', fontSize: 9 }
    },
    report: {  
      set1: { top: '61.6%', left: '84%', fontSize: 9 },
      set2: { top: '63%', left: '83.5%', fontSize: 8 }
      },
    },
     อ่างเก็บน้ำแม่ทาน: {
     desktop: {
       set1: { top: '70.8%', left: '74%', fontSize: 9 },
       set2: { top: '71.3%', left: '77.5%', fontSize: 9 }
     },
     report: {
       set1: { top: '66.5%', left: '76%', fontSize: 9  },
       set2: { top: '68.1%', left: '77.5%', fontSize: 8 }
     },
    },
      อ่างเก็บน้ำห้วยหลวง: {
     desktop: {
       set1: { top: '70.9%', left: '84.1%', fontSize: 8 },
       set2: { top: '71.4%', left: '87.3%', fontSize: 8.5 }
     },
     report: {
       set1: { top: '66.3%', left: '81.5%', fontSize: 9 },
       set2: { top: '66.8%', left: '85.1%', fontSize: 8 }
     },
    },
    อ่างเก็บน้ำแม่เรียง: {
     desktop: {
       set1: { top: '78.6%', left: '84%', fontSize: 9 },
       set2: { top: '79%', left: '87.4%', fontSize: 8 }
     },
     report: {
       set1: { top: '73.5%', left: '82.1%', fontSize: 8 },
       set2: { top: '74%', left: '85.3%', fontSize: 8 }
     },
   },
   อ่างเก็บน้ำแม่ทก: {
     desktop: {
       set1: { top: '77.3%', left: '86.1%', fontSize: 8 },
       set2: { top: '77.8%', left: '89.3%', fontSize: 8 }
     },
     report: {
       set1: { top: '71.7%', left: '86.5%', fontSize: 8 },
       set2: { top: '72.2%', left: '89.7%', fontSize: 8 }
     },
   },
   อ่างเก็บน้ำห้วยสมัย: {
     desktop: {
       set1: { top: '75.9%', left: '88.9%', fontSize: 8 },
       set2: { top: '76.4%', left: '92%', fontSize: 8 }
     },
     report: {
       set1: { top: '70.8%', left: '88.8%', fontSize: 8 },
       set2: { top: '71.1%', left: '91.5%', fontSize: 8 }
     },
    },
     อ่างเก็บน้ำแม่นึง: {
     desktop: {
       set1: { top: '35%', left: '55.5%', fontSize: 8 },
       set2: { top: '35.5%', left: '58.7%', fontSize: 8 }
     },
     report: {
       set1: { top: '37.8%', left: '55.8%', fontSize: 8 },
       set2: { top: '38.2%', left: '59%', fontSize: 8 }
     },
    },
     อ่างเก็บน้ำแม่ค่อม: {
     desktop: {
       set1: { top: '37.4%', left: '55.5%', fontSize: 8 },
       set2: { top: '37.8%', left: '58.7%', fontSize: 8 }
     },
     report: {
       set1: {top: "39.8%", left: "55.5%", fontSize: 9 },
       set2: { top: '40.3%', left: '59%', fontSize: 8 }
     },
    },  
    อ่างเก็บน้ำแม่เฟือง: {
     desktop: {
       set1: { top: '40%', left: '54.8%', fontSize: 8 },
       set2: { top: '40.5%', left: '58%', fontSize: 8 }
     },
     report: {
       set1: { top: '41.8%', left: '55.4%', fontSize: 9 },
       set2: { top: '42.2%', left: '59%', fontSize: 8 }
     },
    },
   อ่างเก็บน้ำแม่ต๋ำน้อย: {
     desktop: {
       set1: { top: '42.7%', left: '54.8%', fontSize: 8 },
       set2: { top: '43%', left: '58%', fontSize: 8 }
     },
     report: {
       set1: { top: '42.5%', left: '55.4%', fontSize: 9 },
       set2: { top: '42.9%', left: '59%', fontSize: 8 }
     },
    },
    อ่างเก็บน้ำแม่ไพร: {
     desktop: {
       set1: { top: '45.2%', left: '53.6%', fontSize: 9 },
       set2: { top: '45.6%', left: '57.3%', fontSize: 9 },
       dot: { top: "47.5%", left: "48%", size: "14px" } 
     },
    report: {
       set1: { top: '45%', left: '55.4%', fontSize: 9 },
       set2: { top: '45.3%', left: '59%', fontSize: 8 }
     },
   },
   อ่างเก็บน้ำห้วยหลวงวังวัว: {
     desktop: {
      set1: { top: "42.5%", left: "63%", fontSize: 9 },
      set2: { top: '44%', left: '63%', fontSize: 8 },
      dot: { top: "40.5%", left: "70.4%", size: "14px" }
     },
     report: {
       set1: { top: '42.3%', left: '63.8%', fontSize: 9 },
       set2: { top: '43.5%', left: '63.5%', fontSize: 8 }
     },
   },
   อ่างเก็บน้ำแม่ทรายทายคำ: {
     desktop: {
       set1: { top: '47.5%', left: '63.5%', fontSize: 10 },
       set2: { top: '47.8%', left: '67.5%', fontSize: 10 },
       dot: { top: "48%", left: "70.4%", size: "14px" },
        
     },
     report: {
       set1: { top: '47.5%', left: '54%', fontSize: 9 },
       set2: { top: '47.9%', left: '67.8%', fontSize: 8 }
    },
   },
   อ่างเก็บน้ำแม่สัน: {
     desktop: {
       set1: { top: '49.8%', left: '58%', fontSize: 8 },
       set2: { top: '52.3%', left: '58.2%', fontSize: 7 }
     },
     report: {
       set1: { top: '49.8%', left: '46%', fontSize: 9 },
       set2: { top: '50.5%', left: '50%', fontSize: 8 }
     },
   },
   อ่างเก็บน้ำแม่ปอน: {
     desktop: {
       set1: { top: '50.5%', left: '44.5%', fontSize: 8 },
       set2: { top: '52%', left: '44.2%', fontSize: 8 }
     },
     report: {
       set1: { top: '51.7%', left: '40.5%', fontSize: 9 },
       set2: { top: '52.2%', left: '44.5%', fontSize: 8 }
     },
   },
   อ่างเก็บน้ำแม่ยาว: {
     desktop: {
       set1: { top: '53.5%', left: '45%', fontSize: 8 },
       set2: { top: '55%', left: '45.8%', fontSize: 8 },
       dot: { top: "54.7%", left: "57%", size: "14px" } 
     },
     report: {
       set1: { top: '53.5%', left: '42%', fontSize: 9 },
       set2: { top: '54%', left: '45.6%', fontSize: 8 }
     },
  },
  อ่างเก็บน้ำห้วยเกี๋ยง: {
    desktop: {
      set1: { top: '58.2%', left: '54.7%', fontSize: 9 },
      set2: { top: '59.8%', left: '54.7%', fontSize: 8 }
    },
    report: {
      set1: { top: '58.2%', left: '55%', fontSize: 9 },
      set2: { top: '59.8%', left: '55%', fontSize: 8 }
    },
  },
  อ่างเก็บน้ำแม่กึ๊ด: {
    desktop: {
      set1: { top: '61.8%', left: '52.5%', fontSize: 10 },
      set2: { top: '63.4%', left: '53.5%', fontSize: 9 }
    },
    report: {
      set1: { top: '62.5%', left: '52.5%', fontSize: 9 },
      set2: { top: '63%', left: '56.5%', fontSize: 8 }
    },
  },
  อ่างเก็บน้ำแม่เลียงพัฒนา: {
    desktop: {
      set1: { top: '66.7%', left: '45.5%', fontSize: 9},
      set2: { top: '67.1%', left: '49%', fontSize: 8 }
    },
    report: {
      set1: { top: '62.5%', left: '52.5%', fontSize: 9},
      set2: { top: '63%', left: '56.5%', fontSize: 8 }
    },
 },
  อ่างเก็บน้ำแม่ต๋ำตอนล่าง: {
    desktop: {
      set1: { top: '72.2%', left: '60.8%', fontSize: 9},
      set2: { top: '72.6%', left: '63.5%', fontSize: 9 }
    },
    report: {
      set1: { top: '72%', left: '61%', fontSize: 9},
      set2: { top: '73.3%', left: '61%', fontSize: 8 }
    },
  },
  อ่างเก็บน้ำแม่อาบ: {
    desktop: {
      set1: { top: '80.2%', left: '62.5%', fontSize: 9},
      set2: { top: '80.7%', left: '66%', fontSize: 8 }
    },
    report: {
      set1: { top: '80.2%', left: '63%', fontSize: 9 },
      set2: { top: '80.6%', left: '66.5%', fontSize: 8 }
    },
  },
  อ่างเก็บน้ำแม่พริก: {
    desktop: {
      set1: { top: '85.2%', left: '48%', fontSize: 9 },
      set2: { top: '85.7%', left: '51.5%', fontSize: 8.5 }
    },
    report: {
      set1: { top: '83.8%', left: '45%', fontSize: 9 },
      set2: { top: '85.4%', left: '45%', fontSize: 8 }
    },
  },
  // อ่างเก็บน้ำแม่พริกผาวิ่งชู้: {
  //   desktop: {
  //     set1: { top: '41%', left: '45%', fontSize: 10 },
  //     set2: { top: '46%', left: '45%', fontSize: 10 }
  //   },
  //   report: {
  //     set1: { top: '85.1%', left: '58%', fontSize: 9 },
  //     set2: { top: '86.5%', left: '58%', fontSize: 8 }
  //   },
  // },
  อ่างเก็บน้ำแม่ล้อหัก: {
    desktop: {
      set1: { top: '88.9%', left: '61%', fontSize: 9},
      set2: { top: '89.3%', left: '64.5%', fontSize: 8.5 }
    },
    report: {
      set1: { top: '87.5%', left: '67.5%', fontSize: 9 },
      set2: { top: '89%', left: '67.5%', fontSize: 8 }
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

export const STATION_STORAGE_OVERLAYS = {
  ขนาดใหญ่: {
    desktop: {
      current: { top: "62%", left: "1.5%", fontSize: 18, color: "#3b82f6" },
      usable:  { top: "66.7%", left: "4.8%", fontSize: 13, color: "#10b981" }
    },
    report: {
      current: { top: "62%", left: "1.5%", fontSize: 10 },
      usable:  { top: "66.7%", left: "4.8%", fontSize: 8 }
    }
  },
  ขนาดกลาง: {
    desktop: {
      current: { top: "77%", left: "1.2%", fontSize: 18, color: "#3b82f6" },
      usable:  { top: "81.1%", left: "5.2%", fontSize: 13, color: "#10b981" }
    },
    report: {
      current: { top: "25%", left: "30%", fontSize: 10 },
      usable:  { top: "27%", left: "30%", fontSize: 8 }
    }
  },
  ขนาดเล็ก: {
    desktop: {
      current: { top: "92%", left: "1%", fontSize: 18, color: "#3b82f6" },
      usable:  { top: "95.5%", left: "5.5%", fontSize: 13, color: "#10b981" }
    },
    report: {
      current: { top: "25%", left: "30%", fontSize: 10 },
      usable:  { top: "27%", left: "30%", fontSize: 8 }
    }
  },อ่างเก็บน้ำชลประทาน: {
    desktop: {
      current: { top: "94%", left: "13.5%", fontSize: 18, color: "#3b82f6" },
      usable:  { top: "94.5%", left: "23%", fontSize: 12, color: "#10b981" }
    },
    report: {
      current: { top: "25%", left: "30%", fontSize: 10 },
      usable:  { top: "27%", left: "30%", fontSize: 8 }
    }
  },
  Combined: { // 🟢 อันนี้สำหรับเขื่อนรวม (ใหญ่+กลาง)
    desktop: {
      current: { top: "15%", left: "39%", fontSize: 18, color: "#60a5fa" }, // ปรับตำแหน่งตามชอบ
      usable:  { top: "20.5%", left: "39%", fontSize: 16, color: "#34d399" }
    },
    report: {
      current: { top: "22%", left: "18%", fontSize: 12 },
      usable:  { top: "24%", left: "18%", fontSize: 10 }
    }
  }
};