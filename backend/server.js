const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- ตั้งค่าเชื่อมต่อ MySQL ---
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',      // Username MySQL ของน้อง
  password: '',      // Password MySQL ของน้อง
  database: 'water_management_db'
});

// --- เช็คการเชื่อมต่อ Database ---
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database Connection Failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL Database!');
    connection.release();
  }
});

// --- Helper: Logger ---
const logRequest = (method, path, body) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${method} ${path}`, body ? JSON.stringify(body) : '');
};

// --- API Routes ---

// 0. หน้าแรก (Root) & เช็คสถานะ API
app.get('/', (req, res) => {
  res.send('<h1>HydroMonitor API Server is Running! 🚀</h1><p>Try accessing <a href="/api">/api</a></p>');
});

app.get('/api', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'HydroMonitor API Ready', 
    version: '1.2.0', // Updated version
    endpoints: [
      '/api/login', 
      '/api/reports',
      '/api/users'
    ]
  });
});

// 1. Login
app.post('/api/login', (req, res) => {
  logRequest('POST', '/api/login', { username: req.body.username });
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) {
        const user = results[0];
        res.json({ 
          id: user.id, 
          username: user.username, 
          role: user.role, 
          fullName: user.full_name,
          organization: user.organization 
        });
      } else {
        res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
      }
    }
  );
});

// --- Water Reports APIs ---

// 2. Get All Reports (จุดที่แก้: เพิ่ม createdBy)
app.get('/api/reports', (req, res) => {
  logRequest('GET', '/api/reports');
  db.query('SELECT * FROM water_reports ORDER BY report_date DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // แปลงข้อมูลจาก Database (snake_case) เป็น JSON (camelCase) ให้ Frontend
    const formatted = results.map(row => ({
      id: row.id,
      stationName: row.station_name,
      date: new Date(row.report_date).toISOString().split('T')[0],
      waterLevel: row.water_level,
      capacity: row.capacity,
      current: row.current_volume,
      percent: (row.current_volume / row.capacity) * 100,
      inflow: row.inflow,
      outflow: row.outflow,
      status: row.status,
      
      // ✅ [แก้ตรงนี้] ต้องส่ง createdBy ไปด้วย Frontend ถึงจะเห็นชื่อคนส่ง!
      createdBy: row.created_by 
    }));
    
    res.json(formatted);
  });
});

// 3. Create Report
app.post('/api/reports', (req, res) => {
  logRequest('POST', '/api/reports', req.body);
  
  // รับค่า createdBy (ชื่อคนส่ง) มาด้วย
  const { stationName, date, waterLevel, inflow, outflow, createdBy } = req.body; 
  
  const current = parseFloat(waterLevel); 
  const capacity = 100;

  const sql = ` 
    INSERT INTO water_reports 
    (station_name, report_date, water_level, capacity, current_volume, inflow, outflow, status, created_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `;
  
  // บันทึก createdBy ลง Database
  db.query(sql, [stationName, date, waterLevel, capacity, current, inflow || 0, outflow || 0, createdBy], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

// 4. Update Report
app.put('/api/reports/:id', (req, res) => {
  logRequest('PUT', `/api/reports/${req.params.id}`, req.body);
  const { id } = req.params;
  const { stationName, waterLevel, inflow, outflow, status } = req.body;
  const current = parseFloat(waterLevel);

  const sql = `
    UPDATE water_reports 
    SET station_name=?, water_level=?, current_volume=?, inflow=?, outflow=?, status=?
    WHERE id=?
  `;

  db.query(sql, [stationName, waterLevel, current, inflow, outflow, status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 5. Delete Report (เผื่อไว้ใช้)
app.delete('/api/reports/:id', (req, res) => {
  logRequest('DELETE', `/api/reports/${req.params.id}`);
  const { id } = req.params;
  db.query('DELETE FROM water_reports WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- User Management APIs ---

// 6. Get All Users
app.get('/api/users', (req, res) => {
  logRequest('GET', '/api/users');
  db.query('SELECT id, username, role, full_name, organization FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const formatted = results.map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.full_name,
      organization: user.organization
    }));
    res.json(formatted);
  });
});

// 7. Create User
app.post('/api/users', (req, res) => {
  logRequest('POST', '/api/users', req.body);
  const { username, password, role, fullName, organization } = req.body;
  const sql = 'INSERT INTO users (username, password, role, full_name, organization) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [username, password, role, fullName, organization], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

// 8. Update User
app.put('/api/users/:id', (req, res) => {
  logRequest('PUT', `/api/users/${req.params.id}`, req.body);
  const { id } = req.params;
  const { username, password, role, fullName, organization } = req.body;
  
  let sql = 'UPDATE users SET username=?, role=?, full_name=?, organization=? WHERE id=?';
  let params = [username, role, fullName, organization, id];

  if (password && password.trim() !== '') {
    sql = 'UPDATE users SET username=?, password=?, role=?, full_name=?, organization=? WHERE id=?';
    params = [username, password, role, fullName, organization, id];
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 9. Delete User
app.delete('/api/users/:id', (req, res) => {
  logRequest('DELETE', `/api/users/${req.params.id}`);
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Start Server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test API at: http://localhost:${PORT}/api`);
});