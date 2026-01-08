const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- 1. ตั้งค่าเชื่อมต่อ MySQL ---
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

// --- 2. API Routes ---

app.get("/", (req, res) => {
  res.send('<h1>HydroMonitor API Server is Running! 🚀</h1>');
});

// --- 🔵 2.1 Login API (เวอร์ชัน Debug รหัสผ่าน) ---
app.post("/api/login", (req, res) => {
  const { username, password } = req.body; 

  // 🔍 DEBUG 1: ส่องรหัสที่ส่งมาจาก React
  console.log("-----------------------------------------");
  console.log(`[LOGIN DEBUG] เวลา: ${new Date().toLocaleTimeString()}`);
  console.log(`[LOGIN DEBUG] ผู้ใช้: ${username}`);
  console.log(`[LOGIN DEBUG] รหัสที่ส่งมา (Hash): ${password}`);

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("❌ SQL Error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      console.log(`[LOGIN DEBUG] ❌ ไม่พบชื่อผู้ใช้: ${username}`);
      return res.status(401).json({ message: "ไม่พบชื่อผู้ใช้นี้ในระบบ" });
    }

    const user = results[0];

    // 🔍 DEBUG 2: ส่องรหัสที่อยู่ใน Database มาเทียบกัน
    console.log(`[LOGIN DEBUG] รหัสใน Database:  ${user.password}`);

    if (user.password === password) {
      console.log("✅ [LOGIN DEBUG] รหัสผ่านตรงกัน! เข้าสู่ระบบสำเร็จ");
      console.log("-----------------------------------------");
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name || user.fullName,
        organization: user.organization,
      });
    } else {
      console.log("❌ [LOGIN DEBUG] รหัสผ่านไม่ตรงกัน!");
      console.log("-----------------------------------------");
      res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }
  });
});

// --- 🔵 2.2 Water Reports APIs (จุดที่ต้องแก้เพื่อให้ชื่อผู้ส่งโชว์) ---
app.get("/api/reports", (req, res) => {
  logRequest("GET", "/api/reports");
  
  const sql = `
    SELECT wr.*, (wr.current_volume / wr.capacity * 100) as calculated_percent
    FROM water_reports wr 
    ORDER BY wr.group_id ASC, wr.report_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // ใน server.js ส่วน app.get("/api/reports", ...)
const formatted = results.map(row => {
  const d = new Date(row.report_date);
  const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return {
    ...row,
    stationName: row.station_name,
    date: localDate,
    // 🟢 จุดสำคัญ: ต้องมั่นใจว่าส่งตัวแปรชื่อ waterLevel (L ตัวใหญ่)
    waterLevel: row.water_level, 
    current: row.current_volume,
    percent: row.calculated_percent || 0,
    createdBy: row.created_by,
    tambon: row.tambon,
    amphoe: row.amphoe,
    province: row.province
  };
});
    res.json(formatted);
  });
});

app.post("/api/reports", (req, res) => {
  logRequest("POST", "/api/reports", req.body);
  
  // ล้างคีย์ให้สะอาด (ป้องกันอักขระพิเศษ)
  const cleanData = {};
  Object.keys(req.body).forEach(key => {
    const cleanKey = key.trim().replace(/[^\x20-\x7E]/g, ''); 
    cleanData[cleanKey] = req.body[key];
  });

  const { stationName, tambon, amphoe, province, date, waterLevel, capacity, inflow, outflow, createdBy, groupId } = cleanData;
  const current_volume = parseFloat(waterLevel) || 0; 

  const sql = `INSERT INTO water_reports 
    (station_name, tambon, amphoe, province, report_date, water_level, capacity, current_volume, inflow, outflow, status, created_by, group_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`;

  db.query(sql, [
    stationName, tambon || '-', amphoe || '-', province || 'ลำปาง', 
    date, waterLevel, capacity || 100, current_volume, 
    inflow || 0, outflow || 0, createdBy, groupId || 'group-large'
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

app.put("/api/reports/:id", (req, res) => {
  const { id } = req.params;
  const { 
    stationName, tambon, amphoe, province, 
    waterLevel, inflow, outflow, status 
  } = req.body; // 🟢 ดึงค่ามาให้ครบ
  
  logRequest("PUT", `/api/reports/${id}`, req.body);

  const current = parseFloat(waterLevel) || 0;

  // 1. ตรวจสอบลำดับ ?: 1.station, 2.tambon, 3.amphoe, 4.province, 5.water_level, 6.current, 7.inflow, 8.outflow, 9.status
  const sql = `
    UPDATE water_reports 
    SET station_name=?, tambon=?, amphoe=?, province=?, water_level=?, current_volume=?, inflow=?, outflow=?, status=? 
    WHERE id=?
  `;
    
  db.query(sql, [
    stationName, 
    tambon || '-', 
    amphoe || '-', 
    province || 'ลำปาง', 
    waterLevel, 
    current, 
    inflow || 0, 
    outflow || 0, 
    status, // 👈 ตัวนี้แหละที่จะเปลี่ยนจาก 'pending' เป็น 'approved'
    id      // 👈 ID ต้องอยู่ตัวสุดท้ายเสมอ
  ], (err, result) => {
    if (err) {
      console.error("❌ UPDATE Error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

app.delete("/api/reports/:id", (req, res) => {
  db.query("DELETE FROM water_reports WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- 🔵 2.3 User Management APIs ---
app.get("/api/users", (req, res) => {
  db.query("SELECT id, username, role, full_name, organization FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/users", (req, res) => {
  const { username, password, role, fullName, organization } = req.body;
  const sql = "INSERT INTO users (username, password, role, full_name, organization) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [username, password, role, fullName, organization], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { username, role, fullName, organization, password } = req.body;
    let sql, params;
    
    if (password) {
        sql = "UPDATE users SET username=?, role=?, full_name=?, organization=?, password=? WHERE id=?";
        params = [username, role, fullName, organization, password, id];
    } else {
        sql = "UPDATE users SET username=?, role=?, full_name=?, organization=? WHERE id=?";
        params = [username, role, fullName, organization, id];
    }
    
    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete("/api/users/:id", (req, res) => {
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- 3. Start Server ---
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ HydroMonitor Backend Running on port ${PORT}`);
});