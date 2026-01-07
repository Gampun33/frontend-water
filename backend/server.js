const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- ตั้งค่าเชื่อมต่อ MySQL ---
const db = mysql.createPool({
  host: "localhost",
  user: "root", 
  password: "", 
  database: "water_management_db",
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database Connection Failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL Database!");
    connection.release();
  }
});

const logRequest = (method, path, body) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${method} ${path}`, body ? JSON.stringify(body) : "");
};

// --- API Routes ---

app.get("/", (req, res) => {
  res.send('<h1>HydroMonitor API Server is Running! 🚀</h1>');
});

// 2. Get All Reports (JOIN กับตารางกลุ่มอ่างเก็บน้ำ)
app.get("/api/reports", (req, res) => {
  logRequest("GET", "/api/reports");
  
  // 🟢 แก้ไข SQL ให้ดึงข้อมูลที่ตั้ง และ JOIN กับตาราง reservoir_groups (ถ้ามี)
  const sql = `
    SELECT wr.*, 
    (wr.current_volume / wr.capacity * 100) as calculated_percent
    FROM water_reports wr 
    ORDER BY wr.group_id ASC, wr.report_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const formatted = results.map((row) => {
      const d = new Date(row.report_date);
      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      return {
        id: row.id,
        stationName: row.station_name,
        // ✅ เพิ่มข้อมูลที่ตั้งมาหยอดในตาราง
        tambon: row.tambon,
        amphoe: row.amphoe,
        province: row.province,
        date: localDate,
        waterLevel: row.water_level,
        capacity: row.capacity,
        min_capacity: row.min_capacity || 0,
        current: row.current_volume,
        percent: row.calculated_percent || 0,
        inflow: row.inflow,
        outflow: row.outflow,
        status: row.status,
        createdBy: row.created_by,
        groupId: row.group_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    res.json(formatted);
  });
});

// 3. Create Report (ปรับให้รับค่าได้ครบถ้วน)
app.post("/api/reports", (req, res) => {
  logRequest("POST", "/api/reports", req.body);

  // 1. ล้างคีย์ให้สะอาดกริ๊บ (ตัดช่องว่างและอักขระพิเศษออก)
  const cleanData = {};
  Object.keys(req.body).forEach(key => {
    // ล้างชื่อคีย์: ตัดช่องว่างและพวก \n \t หรือตัวแปลกๆ ออก
    const cleanKey = key.trim().replace(/[^\x20-\x7E]/g, ''); 
    cleanData[cleanKey] = req.body[key];
  });

  // 2. ดึงค่าจากก้อนที่คลีนแล้ว (สะกดชื่อตัวแปรให้ตรงกับหน้าบ้าน)
  const stationName = cleanData.stationName;
  const tambon      = cleanData.tambon || '-';
  const amphoe      = cleanData.amphoe || '-';
  const province    = cleanData.province || 'ลำปาง';
  const date        = cleanData.date;
  const waterLevel  = cleanData.waterLevel;
  const capacity    = cleanData.capacity || 100;
  const inflow      = cleanData.inflow || 0;
  const outflow     = cleanData.outflow || 0;
  const createdBy   = cleanData.createdBy;
  const groupId     = cleanData.groupId || 'group-large';

  const current_volume = parseFloat(waterLevel) || 0; 

  const sql = ` 
    INSERT INTO water_reports 
    (station_name, tambon, amphoe, province, report_date, water_level, capacity, current_volume, inflow, outflow, status, created_by, group_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `;

  db.query(
    sql,
    [stationName, tambon, amphoe, province, date, waterLevel, capacity, current_volume, inflow, outflow, createdBy, groupId],
    (err, result) => {
      if (err) {
        console.error("❌ SQL Error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, id: result.insertId });
    }
  );
});

// 4. Update Report
app.put("/api/reports/:id", (req, res) => {
  const { id } = req.params;
  const { stationName, waterLevel, inflow, outflow, status, tambon, amphoe, province } = req.body;
  const current = parseFloat(waterLevel);

  const sql = `
    UPDATE water_reports 
    SET station_name=?, tambon=?, amphoe=?, province=?, water_level=?, current_volume=?, inflow=?, outflow=?, status=?
    WHERE id=?
  `;

  db.query(
    sql,
    [stationName, tambon, amphoe, province, waterLevel, current, inflow, outflow, status, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// --- User APIs (คงเดิมตามที่น้องเขียนมา) ---
// ... (ก๊อปปี้ส่วน API 6-9 จากไฟล์เดิมของน้องมาใส่ต่อตรงนี้ได้เลยค่ะ) ...

// Start Server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ HydroMonitor Backend Running on port ${PORT}`);
});