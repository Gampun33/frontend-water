import { getBangkokDate } from '../utils/helpers';
import { hashPassword } from '../utils/security';

const API_URL = 'http://localhost:3001/api';

export const MysqlService = {
  async request(endpoint, options = {}) {
    try {
      const controller = new AbortController();
      // 🟢 พี่สาวเพิ่มเวลาเป็น 5 วินาที (5000) เพื่อให้มั่นใจว่าข้อมูลจะบันทึกลง MySQL ทัน
      const id = setTimeout(() => controller.abort(), 5000); 
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        ...options,
      });
      
      clearTimeout(id);
      if (!response.ok) throw new Error('Server error');
      return await response.json();
    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error.message);
      return null; // ถ้าคืนค่า null ระบบจะสลับไปใช้ Mock (LocalStorage) อัตโนมัติ
    }
  },

  // ... (ฟังก์ชัน _get, _set, defaultUsers คงเดิม) ...
  _get: (key) => JSON.parse(localStorage.getItem(key) || 'null'),
  _set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
  
  defaultUsers: [
    { id: 1, username: 'admin', password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', role: 'admin', fullName: 'Administrator', organization: 'กรมชลประทาน' }
  ],

  // 🔵 แก้ไข CreateReport ให้ส่งข้อมูล ตำบล/อำเภอ ไปแบบเน้นๆ
  createReport: async (payload) => {
    // 1. ลองส่งไปที่ MySQL จริงก่อน
    const result = await MysqlService.request('/reports', { 
      method: 'POST', 
      body: JSON.stringify(payload) 
    });

    if (result) {
      console.log("✅ บันทึกลง MySQL สำเร็จ!");
      return result;
    }

    // 2. ถ้า MySQL ล่ม หรือ Timeout ถึงจะมาเก็บใน LocalStorage (Mock)
    console.warn("⚠️ บันทึกลง MySQL ไม่ได้ กำลังเก็บใน Mock Mode...");
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentData = MysqlService._get('mysql_water_reports') || [];
        const now = new Date();
        const localTimestamp = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace('T', ' ');
        const newReport = {
          id: Date.now(),
          ...payload,
          updated_at: localTimestamp, 
          status: 'pending', 
          created_at: localTimestamp
        };
        MysqlService._set('mysql_water_reports', [...currentData, newReport]);
        resolve(newReport);
      }, 600);
    });
  },

  // ... (ฟังก์ชันอื่นๆ login, getAllReports, updateReport ฯลฯ ให้คงเดิม) ...
  
  login: async (username, password) => {
    const hashedPassword = await hashPassword(password);
    const realUser = await MysqlService.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password: hashedPassword })
    });
    if (realUser) return realUser;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = MysqlService._get('mysql_users') || MysqlService.defaultUsers;
        const user = users.find(u => u.username === username && u.password === hashedPassword);
        if (user) resolve(user);
        else reject('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }, 600);
    });
  },

  getAllReports: async () => {
    const realData = await MysqlService.request('/reports');
    if (realData) return realData;
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = MysqlService._get('mysql_water_reports') || [];
        resolve(data.sort((a, b) => b.id - a.id));
      }, 500);
    });
  },
  
  updateReport: async (id, payload) => {
    const result = await MysqlService.request(`/reports/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    if (result) return result;
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentData = MysqlService._get('mysql_water_reports') || [];
        const updatedData = currentData.map(item => item.id === id ? { ...item, ...payload } : item);
        MysqlService._set('mysql_water_reports', updatedData);
        resolve({ success: true });
      }, 500);
    });
  },

  getUsers: async () => {
    const users = await MysqlService.request('/users');
    if (users) return users;
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = MysqlService._get('mysql_users') || MysqlService.defaultUsers;
        resolve(users);
      }, 400);
    });
  },

  saveUser: async (userData) => { 
    const payload = { ...userData };
    delete payload.confirmPassword;
    if (payload.password && payload.password.trim() !== '') {
        payload.password = await hashPassword(payload.password);
    } else {
        delete payload.password;
    }
    const result = payload.id 
      ? await MysqlService.request(`/users/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      : await MysqlService.request('/users', { method: 'POST', body: JSON.stringify(payload) });
    
    if (result) return result;
    return new Promise((resolve) => {
      setTimeout(() => {
        let users = MysqlService._get('mysql_users') || MysqlService.defaultUsers;
        if (payload.id) {
          users = users.map(u => u.id === payload.id ? { ...u, ...payload } : u);
        } else {
          users.push({ ...payload, id: Date.now() });
        }
        MysqlService._set('mysql_users', users);
        resolve({ success: true });
      }, 500);
    });
  },
  
// --- 🌧️ ระบบข้อมูลฝน (Rain Reports) เพิ่มใหม่ตรงนี้เลยจ้า ---

  // 1. ดึงข้อมูลฝนทั้งหมด
  getRainReports: async () => {
    const realData = await MysqlService.request('/rain-reports');
    if (realData) return realData;

    // Mock Mode: ถ้า MySQL ล่ม ให้ดึงจาก LocalStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = MysqlService._get('mysql_rain_reports') || [];
        resolve(data.sort((a, b) => b.id - a.id));
      }, 500);
    });
  },

  // 2. บันทึกข้อมูลฝนใหม่ (ตัวที่น้องชายติด Error อยู่!)
  createRainReport: async (payload) => {
    const result = await MysqlService.request('/rain-reports', { 
      method: 'POST', 
      body: JSON.stringify(payload) 
    });

    if (result) {
      console.log("✅ บันทึกข้อมูลฝนลง MySQL สำเร็จ!");
      return result;
    }

    // Mock Mode: เก็บลง LocalStorage ถ้าติดต่อ Server ไม่ได้
    console.warn("⚠️ บันทึกข้อมูลฝนลง MySQL ไม่ได้ กำลังเก็บใน Mock Mode...");
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentData = MysqlService._get('mysql_rain_reports') || [];
        const now = new Date();
        const localTimestamp = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace('T', ' ');
        const newReport = {
          id: Date.now(),
          ...payload,
          updated_at: localTimestamp, 
          status: 'pending', 
          created_at: localTimestamp
        };
        MysqlService._set('mysql_rain_reports', [...currentData, newReport]);
        resolve(newReport);
      }, 600);
    });
  },

  // 3. อัปเดตข้อมูลฝน (สำหรับหน้าตรวจสอบ)
  updateRainReport: async (id, payload) => {
    const result = await MysqlService.request(`/rain-reports/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(payload) 
    });

    if (result) return result;

    // Mock Mode
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentData = MysqlService._get('mysql_rain_reports') || [];
        const updatedData = currentData.map(item => item.id === id ? { ...item, ...payload } : item);
        MysqlService._set('mysql_rain_reports', updatedData);
        resolve({ success: true });
      }, 500);
    });
  },

  // 4. ลบข้อมูลฝน
  deleteRainReport: async (id) => {
    const result = await MysqlService.request(`/rain-reports/${id}`, { method: 'DELETE' });
    if (result) return result;

    // Mock Mode
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentData = MysqlService._get('mysql_rain_reports') || [];
        const filteredData = currentData.filter(item => item.id !== id);
        MysqlService._set('mysql_rain_reports', filteredData);
        resolve({ success: true });
      }, 500);
    });
  }

};