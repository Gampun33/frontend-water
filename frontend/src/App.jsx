import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, CloudRain, Info, LogIn, LogOut, 
  Database, FileSpreadsheet, CheckCircle, 
  Users, FileText, Printer, Save, Trash2, 
  Edit, Upload, Shield, Menu, X, Download,
  Move, Crosshair, MapPin, Navigation,
  ChevronDown, ChevronRight, Filter, UserPlus,
  Key, User, Building, ArrowLeft, UserCog,
  FileEdit, AlertTriangle, History, Home, 
  Image as ImageIcon, FileCheck, Loader, Server,
  Globe, Activity, FileUp, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';

// --- API CONFIG ---
const API_URL = 'http://localhost:3001/api';

// --- MysqlService (Hybrid: Real API + Mock Fallback) ---
const MysqlService = {
  // Helper: ลองยิง API ถ้าพังให้ใช้ Mock
  async request(endpoint, options = {}) {
    try {
      // ตั้ง Timeout ไว้สั้นๆ (1 วินาที) ถ้า Server ไม่ตอบให้ข้ามไปใช้ Mock เลย
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1000);

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        ...options,
      });
      clearTimeout(id);

      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      // console.warn(`API Connection Failed (${endpoint}). Switching to Mock Mode.`);
      return null; // คืนค่า null เพื่อบอกให้ใช้ Fallback
    }
  },

  // --- Helpers for LocalStorage (Mock Data) ---
  _get: (key) => JSON.parse(localStorage.getItem(key) || 'null'),
  _set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
  
  // ข้อมูลเริ่มต้น (Seed Data for Mock)
  defaultUsers: [
    { id: 1, username: 'admin', password: 'password', role: 'admin', fullName: 'Administrator (Mock)', organization: 'กรมชลประทาน' },
    { id: 2, username: 'op', password: 'password', role: 'operator', fullName: 'Operator 01 (Mock)', organization: 'กรมชลประทาน' }
  ],

  // --- Auth API ---
  login: async (username, password) => {
    // 1. ลอง API จริง
    const realUser = await MysqlService.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (realUser) return realUser;

    // 2. Fallback: Mock Login
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = MysqlService._get('mysql_users') || MysqlService.defaultUsers;
        const user = users.find(u => u.username === username && u.password === password);
        if (user) resolve(user);
        else reject('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (Mock Mode)');
      }, 600);
    });
  },

  // --- Water Reports API ---
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

  createReport: async (payload) => {
    const result = await MysqlService.request('/reports', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (result) return result;

    return new Promise((resolve) => {
      setTimeout(() => {
        const currentData = MysqlService._get('mysql_water_reports') || [];
        const newReport = {
          id: Date.now(),
          ...payload,
          capacity: 100, // Mock fixed
          min_cap: 10,
          current: parseFloat(payload.waterLevel) || 0,
          percent: (parseFloat(payload.waterLevel) / 100) * 100,
          status: 'pending', // Default status
          created_at: new Date().toISOString()
        };
        MysqlService._set('mysql_water_reports', [...currentData, newReport]);
        resolve(newReport);
      }, 600);
    });
  },

  updateReport: async (id, payload) => {
    const result = await MysqlService.request(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    if (result) return result;

    return new Promise((resolve) => {
      setTimeout(() => {
        const currentData = MysqlService._get('mysql_water_reports') || [];
        const updatedData = currentData.map(item => 
          item.id === id ? { ...item, ...payload } : item
        );
        MysqlService._set('mysql_water_reports', updatedData);
        resolve({ success: true });
      }, 500);
    });
  },

  // --- User Management API ---
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

  saveUser: async (userData) => { // Create or Update
    if (userData.id) {
       const result = await MysqlService.request(`/users/${userData.id}`, { method: 'PUT', body: JSON.stringify(userData) });
       if (result) return result;
    } else {
       const result = await MysqlService.request('/users', { method: 'POST', body: JSON.stringify(userData) });
       if (result) return result;
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        let users = MysqlService._get('mysql_users') || MysqlService.defaultUsers;
        if (userData.id) {
          // Update existing
          users = users.map(u => {
            if (u.id === userData.id) {
               return {
                 ...u,
                 ...userData,
                 password: userData.password ? userData.password : u.password 
               };
            }
            return u;
          });
        } else {
          // Create new
          users.push({ ...userData, id: Date.now() });
        }
        MysqlService._set('mysql_users', users);
        resolve({ success: true });
      }, 500);
    });
  },

  deleteUser: async (id) => {
    const result = await MysqlService.request(`/users/${id}`, { method: 'DELETE' });
    if (result) return result;

    return new Promise((resolve) => {
      setTimeout(() => {
        let users = MysqlService._get('mysql_users') || MysqlService.defaultUsers;
        users = users.filter(u => u.id !== id);
        MysqlService._set('mysql_users', users);
        resolve({ success: true });
      }, 400);
    });
  }
};

// --- Mock Data Constants ---
const MOCK_RAIN_DATA = [
  { region: 'เหนือ', mm: 45, status: 'ปกติ' },
  { region: 'กลาง', mm: 120, status: 'ฝนตกหนัก' },
  { region: 'อีสาน', mm: 30, status: 'แล้ง' },
  { region: 'ใต้', mm: 150, status: 'เสี่ยงน้ำท่วม' },
];

const MOCK_DETAILED_REPORT_DATA = [
  {
    id: 'group-large',
    type: 'group_header',
    name: 'อ่างเก็บน้ำขนาดใหญ่ (Large Reservoirs)',
    count: 2,
    capacity: 276.508,
    min_cap: 10.000,
    current: 302.056,
    percent: 109.24,
    inflow: 1.630,
    outflow: 1.322,
    usable: 292.056,
    bg: 'bg-blue-900',
    text: 'text-white'
  },
  { id: 1, type: 'item', name: 'เขื่อนกิ่วคอหมา', tambon: 'ปงดอน', amphoe: 'แจ้ห่ม', province: 'ลำปาง', capacity: 170.288, min_cap: 6.000, current: 198.490, percent: 116.56, inflow: 0.620, outflow: 0.000, usable: 192.490, status: 'crit_high' },
  { id: 2, type: 'item', name: 'เขื่อนกิ่วลม', tambon: 'บ้านแลง', amphoe: 'เมือง', province: 'ลำปาง', capacity: 106.220, min_cap: 4.000, current: 103.566, percent: 97.50, inflow: 1.010, outflow: 1.322, usable: 99.566, status: 'normal' },
  { id: 'group-medium', type: 'group_header', name: 'อ่างเก็บน้ำขนาดกลาง', count: 48, capacity: 410.101, min_cap: 33.724, current: 386.788, percent: 94.32, inflow: 2.657, outflow: 2.817, usable: 353.064, bg: 'bg-teal-800', text: 'text-white' },
];

// --- Map Carousel Data (6 Pages) ---
const MAP_CAROUSEL_DATA = [
  {
    id: 1,
    region: 'ภาพรวมประเทศ (Overview)',
    video: 'https://cdn.pixabay.com/video/2023/10/26/186606-878455284_large.mp4', // แม่น้ำใหญ่
    markers: [
      { id: 'c1', top: '40%', left: '50%', label: 'เขื่อนเจ้าพระยา', status: 'normal' },
      { id: 'c2', top: '30%', left: '40%', label: 'เขื่อนภูมิพล', status: 'crit' }
    ]
  },
  {
    id: 2,
    region: 'ภาคเหนือ (North)',
    video: 'https://cdn.pixabay.com/video/2022/10/05/133690-757657935_large.mp4', // น้ำตก/ภูเขา
    markers: [
      { id: 'n1', top: '20%', left: '30%', label: 'เขื่อนสิริกิติ์', status: 'normal' },
      { id: 'n2', top: '40%', left: '60%', label: 'กว๊านพะเยา', status: 'normal' }
    ]
  },
  {
    id: 3,
    region: 'ภาคตะวันออกเฉียงเหนือ (Northeast)',
    video: 'https://cdn.pixabay.com/video/2020/06/17/42221-432247076_large.mp4', // ทุ่งนา/ฝน
    markers: [
      { id: 'ne1', top: '30%', left: '70%', label: 'เขื่อนอุบลรัตน์', status: 'crit' },
      { id: 'ne2', top: '60%', left: '80%', label: 'แม่น้ำมูล', status: 'watch' }
    ]
  },
  {
    id: 4,
    region: 'ภาคกลาง (Central)',
    video: 'https://cdn.pixabay.com/video/2024/02/09/199958-911693639_large.mp4', // เขื่อน/ประตูน้ำ
    markers: [
      { id: 'ct1', top: '50%', left: '50%', label: 'เขื่อนป่าสักฯ', status: 'normal' },
      { id: 'ct2', top: '70%', left: '45%', label: 'กรุงเทพฯ', status: 'watch' }
    ]
  },
  {
    id: 5,
    region: 'ภาคตะวันออก (East)',
    video: 'https://cdn.pixabay.com/video/2019/06/25/24855-344933999_large.mp4', // ทะเล/อ่างเก็บน้ำ
    markers: [
      { id: 'e1', top: '60%', left: '70%', label: 'อ่างฯ บางพระ', status: 'normal' },
      { id: 'e2', top: '70%', left: '80%', label: 'เขื่อนขุนด่านฯ', status: 'normal' }
    ]
  },
  {
    id: 6,
    region: 'ภาคใต้ (South)',
    video: 'https://cdn.pixabay.com/video/2020/05/25/40133-424072619_large.mp4', // ทะเล/คลื่น
    markers: [
      { id: 's1', top: '50%', left: '30%', label: 'เขื่อนรัชชประภา', status: 'normal' },
      { id: 's2', top: '80%', left: '40%', label: 'ลุ่มน้ำตาปี', status: 'crit' }
    ]
  }
];

// --- Components ---

// Reusable Video Map Component (Now supports Carousel!)
const VideoMapComponent = ({ mode = 'interactive', markers = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0); // 0 to 5
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: mode === 'report' ? 1 : 1.2 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // If external markers are provided (e.g. from approvedData in Home), we might want to override or overlay.
  // But for the carousel request, we will prioritize the carousel data.
  // However, for compatibility with "Approved Data" view, if markers prop is passed and has items, we might use a specific single-slide mode.
  // Let's make it so: If markers prop is provided, show single generic slide. If not (or specialized mode), show carousel.
  
  // Actually, let's keep it simple: The carousel features predefined regions.
  // The dynamic markers from props (e.g. Approved Data) can be mapped to the "Overview" slide (index 0) or just overlay on top.
  // For this request, I will make the carousel the main feature.

  const activeSlideData = MAP_CAROUSEL_DATA[currentSlide];

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % MAP_CAROUSEL_DATA.length);
    setTransform({ x: 0, y: 0, scale: mode === 'report' ? 1 : 1.2 }); // Reset zoom on slide change
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + MAP_CAROUSEL_DATA.length) % MAP_CAROUSEL_DATA.length);
    setTransform({ x: 0, y: 0, scale: mode === 'report' ? 1 : 1.2 });
  };

  const handleZoom = (delta) => setTransform(prev => ({ ...prev, scale: Math.min(Math.max(prev.scale + delta, 0.8), 5) }));
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); handleZoom(e.deltaY > 0 ? -0.2 : 0.2); }
  };
  const handleMouseDown = (e) => { e.preventDefault(); setIsDragging(true); setStartPan({ x: e.clientX - transform.x, y: e.clientY - transform.y }); };
  const handleMouseMove = (e) => { if (!isDragging) return; e.preventDefault(); setTransform(prev => ({ ...prev, x: e.clientX - startPan.x, y: e.clientY - startPan.y })); };
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-900 ${mode === 'report' ? 'h-[500px] rounded-lg border-2 border-gray-300 print:border-0 print:h-[400px]' : 'h-96'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} group`}
      onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
    >
      {/* 1. Transforming Layer (Video & Markers) */}
      <div className="w-full h-full relative origin-center transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
        
        {/* Background Video with Key for Transition */}
        <video 
          key={activeSlideData.id} // Key forces reload on slide change
          autoPlay loop muted playsInline 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80 transition-opacity duration-500 animate-fade-in"
        >
          <source src={activeSlideData.video} type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-blue-900/30 pointer-events-none"></div>
        
        {/* Markers for this slide */}
        <div className="absolute inset-0 pointer-events-none">
          {activeSlideData.markers.map((item) => (
            <div key={item.id} className="absolute flex flex-col items-center group/marker" style={{ top: item.top, left: item.left }}>
               <div className="relative cursor-pointer pointer-events-auto hover:scale-110 transition-transform">
                 {item.status === 'crit' && <div className="absolute -inset-2 bg-red-500/30 rounded-full animate-ping"></div>}
                 <MapPin className={`w-8 h-8 drop-shadow-lg relative z-10 ${item.status === 'crit' ? 'text-red-500' : item.status === 'watch' ? 'text-orange-400' : 'text-green-400'}`} />
               </div>
               <div className="bg-black/70 text-white text-[10px] px-2 py-1 rounded mt-1 backdrop-blur-sm whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity z-20">
                 {item.label}
               </div>
            </div>
          ))}
          
          {/* Also render dynamic markers from props if on Overview (Slide 0) */}
          {currentSlide === 0 && markers.map((item, idx) => {
             // Mock positions based on ID
             const val = typeof item.id === 'number' ? item.id : (item.id || '0').toString().charCodeAt(0);
             const top = `${(val * 13) % 60 + 20}%`;
             const left = `${(val * 7) % 80 + 10}%`;
             return (
               <div key={`dyn-${item.id}`} className="absolute flex flex-col items-center group/marker" style={{ top, left }}>
                  <div className="relative pointer-events-auto hover:scale-110 transition-transform">
                    {item.percent > 80 && <div className="absolute -inset-2 bg-red-500/30 rounded-full animate-ping"></div>}
                    <MapPin className={`w-6 h-6 drop-shadow-md relative z-10 ${item.percent > 80 ? 'text-red-500' : 'text-blue-300'}`} />
                  </div>
               </div>
             );
          })}
        </div>
      </div>

      {/* 2. HUD Overlay & Carousel Controls */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Top Bar Info */}
        <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-start">
           <div className="flex items-center space-x-2 text-white">
             {mode === 'interactive' && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
             <div>
               <h3 className="font-bold text-lg text-white shadow-black drop-shadow-md">{activeSlideData.region}</h3>
               <p className="text-xs opacity-80 font-mono">LIVE MONITORING SYSTEM</p>
             </div>
           </div>
           {mode === 'report' && (
             <div className="text-right text-white">
               <p className="text-xs font-mono">ID: RPT-DB-LIVE</p>
               <p className="text-xs font-mono text-yellow-400">PAGE {currentSlide + 1}/6</p>
             </div>
           )}
        </div>

        {/* Carousel Navigation Buttons (Left/Right) - Visible on Hover or Always on Touch */}
        <button 
          onClick={handlePrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm pointer-events-auto transition-all hover:scale-110 group-hover:opacity-100 opacity-0 sm:opacity-100 print:hidden"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm pointer-events-auto transition-all hover:scale-110 group-hover:opacity-100 opacity-0 sm:opacity-100 print:hidden"
        >
          <ChevronRightIcon className="w-8 h-8" />
        </button>

        {/* Bottom Controls: Zoom & Indicators */}
        <div className="absolute bottom-4 left-0 w-full px-4 flex justify-between items-end print:hidden">
           {/* Dots Indicator */}
           <div className="flex space-x-2 mb-2 pointer-events-auto bg-black/20 p-2 rounded-full backdrop-blur-sm">
             {MAP_CAROUSEL_DATA.map((_, idx) => (
               <button 
                 key={idx}
                 onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); setTransform({x:0, y:0, scale: mode==='report'?1:1.2}); }}
                 className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
               />
             ))}
           </div>

           {/* Zoom Buttons */}
           <div className="flex flex-col space-y-2 pointer-events-auto">
             <button onClick={() => handleZoom(0.5)} className="bg-white/90 p-2 rounded-lg shadow-lg hover:bg-white text-gray-700 transition active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
             <button onClick={() => handleZoom(-0.5)} className="bg-white/90 p-2 rounded-lg shadow-lg hover:bg-white text-gray-700 transition active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Page Components ---

const PublicHeader = ({ setCurrentPage, user }) => (
  <header className="bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-50 print:hidden">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
        <div className="bg-white p-1 rounded-full"><Map className="w-6 h-6 text-blue-600" /></div>
        <h1 className="text-xl font-bold">HydroMonitor System (MySQL)</h1>
      </div>
      <nav className="hidden md:flex space-x-6">
        <button onClick={() => setCurrentPage('home')} className="hover:text-blue-300 transition">หน้าหลัก</button>
        <button onClick={() => setCurrentPage('about')} className="hover:text-blue-300 transition">เกี่ยวกับ</button>
        {user ? (
          <button onClick={() => setCurrentPage('dashboard')} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition shadow-md font-medium"><Shield className="w-4 h-4 mr-2" /> แดชบอร์ด ({user.role})</button>
        ) : (
          <button onClick={() => setCurrentPage('login')} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg flex items-center transition shadow-md"><LogIn className="w-4 h-4 mr-2" /> เข้าสู่ระบบ</button>
        )}
      </nav>
    </div>
  </header>
);

const HomePage = ({ waterData }) => {
  const approvedData = waterData.filter(d => d.status === 'approved');

  return (
    <div className="container mx-auto p-4 space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gray-100 p-4 border-b flex justify-between items-center z-10 relative">
          <h2 className="font-bold text-gray-700 flex items-center"><Map className="w-5 h-5 mr-2 text-blue-600" /> แผนที่สถานการณ์น้ำ (Interactive Carousel)</h2>
          <div className="flex items-center space-x-2"><span className="text-xs text-gray-500 hidden sm:inline">Active Stations: {approvedData.length}</span></div>
        </div>
        <VideoMapComponent mode="interactive" markers={approvedData} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <h2 className="font-bold text-lg mb-4 flex items-center text-gray-800"><CloudRain className="w-6 h-6 mr-2 text-blue-500" /> ข้อมูลปริมาณน้ำล่าสุด</h2>
          <div className="space-y-3">
            {approvedData.length > 0 ? approvedData.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition">
                <span className="font-medium text-gray-700">{item.stationName}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-blue-600 font-bold">{item.waterLevel} ม.</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${item.percent > 80 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {item.percent > 80 ? 'วิกฤต' : 'ปกติ'}
                  </span>
                </div>
              </div>
            )) : <p className="text-center text-gray-400 py-4">ยังไม่มีข้อมูลที่อนุมัติ</p>}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-md p-6 text-white">
          <h2 className="font-bold text-lg mb-4">สรุปภาพรวมวันนี้</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm"><p className="text-3xl font-bold">{approvedData.length}</p><p className="text-sm opacity-80">สถานีที่ออนไลน์</p></div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm"><p className="text-3xl font-bold">{approvedData.filter(d => d.percent > 80).length}</p><p className="text-sm opacity-80">จุดเฝ้าระวัง</p></div>
          </div>
          <p className="mt-4 text-sm opacity-75 text-center">ระบบฐานข้อมูล MySQL</p>
        </div>
      </div>
    </div>
  );
};

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await MysqlService.login(username, password);
      onLogin(user);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Server className="w-8 h-8 text-blue-600" /></div>
          <h2 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบ (MySQL)</h2>
          <p className="text-gray-500 text-sm">Demo Users: admin/password, op/password</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Username" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" /></div>
          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-md hover:shadow-lg flex justify-center items-center">
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AddDataPage = ({ user, refreshData }) => {
  const [formData, setFormData] = useState({ stationName: '', date: '', waterLevel: '', inflow: '', outflow: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await MysqlService.createReport({ ...formData, createdBy: user.username });
      alert('บันทึกข้อมูลสำเร็จ! (รอ Admin อนุมัติ)');
      setFormData({ stationName: '', date: '', waterLevel: '', inflow: '', outflow: '' });
      refreshData();
    } catch (e) {
      alert('Error saving data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      // Simulate Excel parsing
      setTimeout(() => {
        setUploading(false);
        alert(`นำเข้าข้อมูลจากไฟล์ ${file.name} สำเร็จ! (Simulated)\nเพิ่มข้อมูลตัวอย่าง 5 รายการเรียบร้อยแล้ว`);
        refreshData(); 
      }, 1500);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><Database className="w-6 h-6 mr-3 text-blue-600" /> เพิ่มข้อมูล (INSERT to MySQL)</h2>
      
      {/* File Upload Section */}
      <div 
        onClick={handleFileClick}
        className={`mb-8 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        />
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-700">กำลังประมวลผลไฟล์...</h3>
            <p className="text-sm text-gray-500">กรุณารอสักครู่ ระบบกำลังอ่านข้อมูลจาก Excel</p>
          </div>
        ) : (
          <>
            <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700">อัปโหลดไฟล์ Excel (.xlsx, .csv)</h3>
            <p className="text-gray-500 text-sm mb-4">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์เพื่อนำเข้าข้อมูลแบบ Bulk</p>
            <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 pointer-events-none text-gray-600">
              Browse Files
            </button>
          </>
        )}
      </div>

      <div className="relative flex py-2 items-center mb-8">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink-0 mx-4 text-gray-400 text-sm bg-white px-2">หรือ กรอกข้อมูลด้วยตนเอง</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสถานี/อ่างเก็บน้ำ</label>
          <input type="text" name="stationName" value={formData.stationName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="เช่น เขื่อนภูมิพล" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ตรวจวัด</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ระดับน้ำ (Water Level)</label>
          <div className="relative">
            <input type="number" name="waterLevel" value={formData.waterLevel} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
            <span className="absolute right-3 top-2 text-gray-400 text-xs">ม.รทก.</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">น้ำเข้า (Inflow)</label>
          <div className="relative">
            <input type="number" name="inflow" value={formData.inflow} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
            <span className="absolute right-3 top-2 text-gray-400 text-xs">ลบ.ม.</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ระบายออก (Outflow)</label>
          <div className="relative">
            <input type="number" name="outflow" value={formData.outflow} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
            <span className="absolute right-3 top-2 text-gray-400 text-xs">ลบ.ม.</span>
          </div>
        </div>
        <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
          <button type="button" onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center w-full md:w-auto disabled:bg-gray-400 font-medium shadow-sm hover:shadow">
            {isSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลเข้าสู่ระบบ'}
          </button>
        </div>
      </form>
    </div>
  );
};

const VerifyDataPage = ({ waterData, refreshData }) => {
  const [viewMode, setViewMode] = useState('list');
  const [editData, setEditData] = useState(null);

  const handleEditClick = (item) => { setEditData(item); setViewMode('edit'); };

  const handleUpdate = async (status) => {
    try {
      await MysqlService.updateReport(editData.id, { 
        ...editData, 
        status,
        current: parseFloat(editData.waterLevel)
      });
      alert(`อัปเดตสถานะเป็น ${status} เรียบร้อย`);
      refreshData();
      setViewMode('list');
    } catch (e) {
      alert('Update failed');
    }
  };

  if (viewMode === 'edit') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
        <div className="flex items-center mb-6">
          <button onClick={() => setViewMode('list')} className="mr-4 p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-2xl font-bold text-gray-800">แก้ไข/อนุมัติข้อมูล (Update Row)</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border p-6 rounded-xl">
             <div className="md:col-span-2"><label className="block text-sm font-medium">สถานี</label><input type="text" value={editData.stationName} onChange={(e) => setEditData({...editData, stationName: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div>
             <div><label className="block text-sm font-medium">ระดับน้ำ</label><input type="number" value={editData.waterLevel} onChange={(e) => setEditData({...editData, waterLevel: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div>
             <div><label className="block text-sm font-medium">สถานะปัจจุบัน</label><div className="px-4 py-2 bg-gray-100 rounded-lg">{editData.status}</div></div>
          </div>
          <div className="flex space-x-3">
              <button onClick={() => handleUpdate('pending')} className="flex-1 py-2 rounded-lg border hover:bg-yellow-50 text-yellow-700">รอตรวจสอบ</button>
              <button onClick={() => handleUpdate('approved')} className="flex-1 py-2 rounded-lg border bg-green-600 text-white hover:bg-green-700">อนุมัติ (Approve)</button>
              <button onClick={() => handleUpdate('rejected')} className="flex-1 py-2 rounded-lg border hover:bg-red-50 text-red-700">ตีกลับ (Reject)</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><CheckCircle className="w-6 h-6 mr-3 text-orange-500" /> ตรวจสอบข้อมูล (SELECT * FROM reports)</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50"><tr><th className="p-4 text-left">วันที่</th><th className="p-4 text-left">สถานี</th><th className="p-4 text-left">สถานะ</th><th className="p-4 text-center">จัดการ</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {waterData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm">{item.date}</td><td className="p-4 text-sm font-medium">{item.stationName}</td>
                <td className="p-4 text-sm"><span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'approved' ? 'bg-green-100 text-green-700' : item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span></td>
                <td className="p-4 flex justify-center"><button onClick={() => handleEditClick(item)} className="p-1 text-blue-600 rounded"><Edit className="w-5 h-5" /></button></td>
              </tr>
            ))}
            {waterData.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-gray-400">ไม่พบข้อมูล</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'edit'
  const [formData, setFormData] = useState({ username: '', password: '', role: 'operator', fullName: '', organization: 'กรมชลประทาน', confirmPassword: '' });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    const data = await MysqlService.getUsers();
    setUsers(data);
  };

  const handleEdit = (user) => {
    setFormData({ ...user, password: '', confirmPassword: '' }); // Clear password for security on edit
    setViewMode('edit');
  };

  const handleDelete = async (id) => {
    if (confirm('ยืนยันการลบผู้ใช้?')) {
      await MysqlService.deleteUser(id);
      loadUsers();
    }
  };

  const handleSave = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน');
      return;
    }
    await MysqlService.saveUser(formData);
    alert('บันทึกผู้ใช้สำเร็จ');
    loadUsers();
    setViewMode('list');
    setFormData({ username: '', password: '', role: 'operator', fullName: '', organization: 'กรมชลประทาน', confirmPassword: '' });
  };

  if (viewMode === 'add' || viewMode === 'edit') {
    const isEdit = viewMode === 'edit';
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
        <div className="flex items-center mb-6">
          <button onClick={() => setViewMode('list')} className="mr-4 p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            {isEdit ? <UserCog className="w-6 h-6 mr-3 text-orange-600" /> : <UserPlus className="w-6 h-6 mr-3 text-purple-600" />}
            {isEdit ? 'แก้ไขข้อมูลผู้ใช้ (Edit User)' : 'เพิ่มผู้ใช้งานใหม่ (Add New User)'}
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            {/* 1. Account Info */}
            <div className={`bg-gray-50 p-6 rounded-xl border ${isEdit ? 'border-orange-100' : 'border-gray-100'}`}>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <User className={`w-5 h-5 mr-2 ${isEdit ? 'text-orange-500' : 'text-blue-500'}`} /> ข้อมูลบัญชี (Account Info)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล (Full Name)</label>
                  <input 
                    type="text" 
                    value={formData.fullName} 
                    onChange={e => setFormData({...formData, fullName: e.target.value})} 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${isEdit ? 'focus:ring-orange-500' : 'focus:ring-purple-500'}`}
                    placeholder="เช่น นายสมชาย ใจดี"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                  <input 
                    type="text" 
                    value={formData.username} 
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                    disabled={isEdit} 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${isEdit ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'focus:ring-purple-500'}`}
                    placeholder="user.name"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หน่วยงาน (Organization)</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={formData.organization} 
                      onChange={e => setFormData({...formData, organization: e.target.value})} 
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none ${isEdit ? 'focus:ring-orange-500' : 'focus:ring-purple-500'}`}
                      placeholder="เช่น กรมชลประทาน" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Security */}
            <div className={`bg-gray-50 p-6 rounded-xl border ${isEdit ? 'border-orange-100' : 'border-gray-100'}`}>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Key className={`w-5 h-5 mr-2 ${isEdit ? 'text-orange-500' : 'text-green-500'}`} /> ความปลอดภัย (Security)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isEdit ? 'เปลี่ยนรหัสผ่านใหม่ (ว่างไว้ถ้าไม่เปลี่ยน)' : 'รหัสผ่าน (Password)'}</label>
                  <input 
                    type="password" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${isEdit ? 'focus:ring-orange-500' : 'focus:ring-purple-500'}`}
                    placeholder={isEdit ? "เว้นว่างหากไม่เปลี่ยน" : "••••••••"}
                    required={!isEdit} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน (Confirm)</label>
                  <input 
                    type="password" 
                    value={formData.confirmPassword} 
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${isEdit ? 'focus:ring-orange-500' : 'focus:ring-purple-500'}`}
                    placeholder="••••••••"
                    required={!isEdit || formData.password.length > 0} 
                  />
                </div>
              </div>
            </div>

            {/* 3. Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สิทธิ์การใช้งาน (Role)</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setFormData({...formData, role: 'operator'})}
                  className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition 
                    ${formData.role === 'operator' 
                      ? (isEdit ? 'border-orange-600 bg-orange-50' : 'border-purple-600 bg-purple-50') 
                      : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <User className={`w-8 h-8 mb-2 ${formData.role === 'operator' ? (isEdit ? 'text-orange-600' : 'text-purple-600') : 'text-gray-400'}`} />
                  <span className={`font-bold ${formData.role === 'operator' ? (isEdit ? 'text-orange-700' : 'text-purple-700') : 'text-gray-600'}`}>Operator</span>
                  <span className="text-xs text-center text-gray-500 mt-1">เพิ่ม/แก้ไขข้อมูลได้เท่านั้น</span>
                </div>
                <div 
                   onClick={() => setFormData({...formData, role: 'admin'})}
                   className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition 
                    ${formData.role === 'admin' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'}`}
                >
                  <Shield className={`w-8 h-8 mb-2 ${formData.role === 'admin' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`font-bold ${formData.role === 'admin' ? 'text-blue-700' : 'text-gray-600'}`}>Administrator</span>
                  <span className="text-xs text-center text-gray-500 mt-1">จัดการได้ทุกส่วนของระบบ</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-4 border-t">
              <button 
                type="button"
                onClick={() => setViewMode('list')}
                className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
              <button 
                type="submit"
                className={`px-6 py-2 text-white rounded-lg shadow-md transition flex items-center ${isEdit ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                <Save className="w-4 h-4 mr-2" /> {isEdit ? 'บันทึกการแก้ไข' : 'บันทึกผู้ใช้'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center"><Users className="w-6 h-6 mr-3 text-purple-600" /> จัดการผู้ใช้งาน (MySQL Users)</h2>
        <button onClick={() => { setFormData({ username: '', password: '', role: 'operator', fullName: '', organization: 'กรมชลประทาน', confirmPassword: '' }); setViewMode('add'); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center shadow-md transition hover:bg-purple-700"><UserPlus className="w-4 h-4 mr-2" /> เพิ่มผู้ใช้</button>
      </div>
      <div className="grid gap-4 mt-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.role==='admin'?'bg-blue-100 text-blue-600':'bg-purple-100 text-purple-600'}`}>{user.role==='admin'?<Shield className="w-6 h-6"/>:<User className="w-6 h-6"/>}</div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{user.fullName}</p>
                <div className="flex items-center text-sm text-gray-500 space-x-3">
                  <span className="flex items-center"><Building className="w-3 h-3 mr-1" /> {user.organization || '-'}</span>
                  <span className="flex items-center"><span className={`w-2 h-2 rounded-full mr-1 ${user.role==='admin'?'bg-blue-500':'bg-purple-500'}`}></span>{user.username} ({user.role})</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleEdit(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit className="w-5 h-5" /></button>
              <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Report Page with Detailed Status (Reverted Style) ---
const DataReportPage = ({ waterData }) => {
  const [reportMode, setReportMode] = useState('table');
  const [fitToPage, setFitToPage] = useState(false);
  const approvedData = waterData.filter(d => d.status === 'approved');

  const handlePrint = () => window.print();

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 animate-fade-in flex flex-col h-[calc(100vh-100px)] print:h-auto print:shadow-none print:p-0">
      <style>{`
        @media print {
          body, #root { background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-fit-scale { transform: scale(0.5); transform-origin: top left; width: 200%; }
          .bg-teal-700 { background-color: #0f766e !important; }
          .bg-teal-800 { background-color: #115e59 !important; }
          .bg-blue-900 { background-color: #1e3a8a !important; }
          .text-white { color: white !important; }
        }
      `}</style>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 print:hidden">
        <div><h2 className="text-2xl font-bold text-gray-800">รายงานสถานการณ์น้ำ (Detailed Status)</h2><p className="text-sm text-gray-500">ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH')} (Mock Data for Print)</p></div>
        <div className="flex space-x-2 items-center">
          <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
            <button onClick={() => setReportMode('table')} className={`px-3 py-1.5 rounded-md text-sm transition ${reportMode === 'table' ? 'bg-white shadow text-teal-700' : 'text-gray-500'}`}><Database className="w-4 h-4 mr-2 inline" /> ตาราง</button>
            <button onClick={() => setReportMode('map')} className={`px-3 py-1.5 rounded-md text-sm transition ${reportMode === 'map' ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}><Map className="w-4 h-4 mr-2 inline" /> แผนที่</button>
          </div>
          <label className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg"><input type="checkbox" checked={fitToPage} onChange={(e) => setFitToPage(e.target.checked)} className="rounded text-teal-600" /><span>Fit Page</span></label>
          <button onClick={handlePrint} className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm flex items-center shadow transition"><Printer className="w-4 h-4 mr-2" /> Print</button>
        </div>
      </div>
      
      <div className="hidden print:block mb-6 text-center border-b pb-4"><h1 className="text-2xl font-bold text-black">รายงานสถานการณ์น้ำ (HydroMonitor Report)</h1><p className="text-sm text-gray-600">Generated from HydroMonitor System</p></div>

      <div className={`flex-1 overflow-auto border rounded-lg shadow-inner relative bg-gray-50 print:overflow-visible print:border-none print:shadow-none print:bg-white ${fitToPage ? 'print-fit-scale' : ''}`}>
        <div className="bg-white min-w-fit h-full print:w-full">
          {reportMode === 'table' && (
            <div className="p-4 bg-white print:p-0">
              <table className="w-full min-w-[1200px] print:min-w-0 border-collapse text-sm">
                <thead className="sticky top-0 z-20 shadow-md print:static print:shadow-none">
                  <tr className="bg-teal-700 text-white text-center">
                    <th rowSpan="2" className="p-3 border-r border-teal-600 w-48 sticky left-0 bg-teal-700 z-30 print:static">อ่างเก็บน้ำ</th>
                    <th colSpan="3" className="p-2 border-r border-teal-600 border-b">ที่ตั้ง</th>
                    <th rowSpan="2" className="p-2 border-r border-teal-600 w-24">ความจุ<br/>(ล้าน ลบ.ม.)</th>
                    <th rowSpan="2" className="p-2 border-r border-teal-600 w-24">รนก.ต่ำสุด<br/>(ล้าน ลบ.ม.)</th>
                    <th colSpan="2" className="p-2 border-r border-teal-600 border-b">ปริมาณน้ำปัจจุบัน</th>
                    <th colSpan="2" className="p-2 border-r border-teal-600 border-b">การบริหารจัดการน้ำ (ล้าน ลบ.ม.)</th>
                    <th rowSpan="2" className="p-2 w-24">ปริมาณน้ำ<br/>ใช้การได้</th>
                  </tr>
                  <tr className="bg-teal-800 text-white text-xs text-center">
                    <th className="p-2 w-24 border-r border-teal-600">ตำบล</th>
                    <th className="p-2 w-24 border-r border-teal-600">อำเภอ</th>
                    <th className="p-2 w-24 border-r border-teal-600">จังหวัด</th>
                    <th className="p-2 w-24 border-r border-teal-600">จำนวน<br/>(ล้าน ลบ.ม.)</th>
                    <th className="p-2 w-20 border-r border-teal-600">% ความจุ</th>
                    <th className="p-2 w-24 border-r border-teal-600">น้ำไหลเข้า</th>
                    <th className="p-2 w-24 border-r border-teal-600">ระบายออก</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {MOCK_DETAILED_REPORT_DATA.map((row, idx) => {
                    if (row.type === 'group_header') {
                      return (
                        <tr key={row.id} className={`${row.bg} ${row.text} font-bold`}>
                          <td colSpan="4" className="p-3 text-left sticky left-0 z-10 bg-inherit border-r border-white/20 print:static">{row.name}</td>
                          <td className="p-3 text-right">{row.capacity.toFixed(3)}</td><td className="p-3 text-right">{row.min_cap.toFixed(3)}</td><td className="p-3 text-right">{row.current.toFixed(3)}</td>
                          <td className={`p-3 text-center ${row.percent > 100 ? 'bg-red-500/20 text-red-200' : ''}`}>{row.percent.toFixed(2)}%</td>
                          <td className="p-3 text-right">{row.inflow.toFixed(3)}</td><td className="p-3 text-right">{row.outflow.toFixed(3)}</td><td className="p-3 text-right">{row.usable.toFixed(3)}</td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                        <td className="p-3 font-medium text-gray-900 border-r sticky left-0 bg-white hover:bg-blue-50 z-10 drop-shadow-sm whitespace-nowrap print:static print:shadow-none">{row.name}</td>
                        <td className="p-2 text-gray-500 text-center text-xs">{row.tambon}</td><td className="p-2 text-gray-500 text-center text-xs">{row.amphoe}</td><td className="p-2 text-gray-500 text-center text-xs">{row.province}</td>
                        <td className="p-2 text-right border-l font-mono text-gray-700">{row.capacity.toFixed(3)}</td><td className="p-2 text-right font-mono text-gray-400 text-xs">{row.min_cap.toFixed(3)}</td>
                        <td className="p-2 text-right font-mono font-medium text-blue-700 border-l">{row.current.toFixed(3)}</td>
                        <td className="p-2 text-center border-r relative group">
                          <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold w-16 ${row.percent > 100 ? 'bg-blue-600 text-white' : row.percent > 80 ? 'bg-blue-100 text-blue-800' : row.percent < 30 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {row.percent.toFixed(2)}%
                          </div>
                        </td>
                        <td className="p-2 text-right font-mono border-r relative">
                          <div className="absolute bottom-0 left-0 h-1 bg-teal-400/30" style={{width: `${Math.min(row.inflow * 50, 100)}%`}}></div>
                          {row.inflow > 0 ? row.inflow.toFixed(3) : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="p-2 text-right font-mono border-r relative">
                          <div className="absolute bottom-0 left-0 h-1 bg-orange-400/30" style={{width: `${Math.min(row.outflow * 50, 100)}%`}}></div>
                          {row.outflow > 0 ? row.outflow.toFixed(3) : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="p-2 text-right font-mono font-semibold text-gray-800">{row.usable.toFixed(3)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {reportMode === 'map' && <div className="flex flex-col items-center justify-center p-8 bg-white print:p-0 print:block"><VideoMapComponent mode="report" markers={approvedData} /></div>}
        </div>
      </div>
    </div>
  );
};

// --- Main Layout & Logic ---
const DashboardLayout = ({ role, onLogout, onGoHome, waterData, refreshData }) => {
  const [activeTab, setActiveTab] = useState(role === 'admin' ? 'verify' : 'add');
  const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center space-x-3 px-6 py-3 transition-colors ${active ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}><Icon className="w-5 h-5" /><span className="font-medium">{label}</span></button>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row print:bg-white print:block">
      <style>{`@media print { .print\\:hidden { display: none !important; } aside { display: none; } main { margin: 0; padding: 0; } }`}</style>
      <aside className="w-full md:w-64 bg-white shadow-lg z-10 flex-shrink-0 flex flex-col h-screen sticky top-0 print:hidden">
        <div className="p-6 border-b bg-blue-50/50"><h2 className="font-bold text-gray-800 uppercase">{role === 'admin' ? 'Administrator' : 'Operator'}</h2><p className="text-xs text-green-500">● Database Connected</p></div>
        <div className="px-4 pt-4 pb-2"><button onClick={onGoHome} className="w-full bg-white border px-4 py-2.5 rounded-xl flex items-center justify-center shadow-sm"><Home className="w-4 h-4 mr-2" /> กลับหน้าเว็บไซต์</button></div>
        <nav className="py-2 space-y-1 flex-1 overflow-y-auto">
          <SidebarItem icon={Database} label="เพิ่มข้อมูล" active={activeTab === 'add'} onClick={() => setActiveTab('add')} />
          {role === 'admin' && (<><SidebarItem icon={CheckCircle} label="ตรวจข้อมูล" active={activeTab === 'verify'} onClick={() => setActiveTab('verify')} /><SidebarItem icon={Users} label="จัดการผู้ใช้" active={activeTab === 'users'} onClick={() => setActiveTab('users')} /><SidebarItem icon={FileText} label="รายงานผล" active={activeTab === 'report'} onClick={() => setActiveTab('report')} /></>)}
        </nav>
        <div className="p-4 border-t"><button onClick={onLogout} className="flex items-center justify-center text-red-600 w-full px-4 py-2.5 rounded-xl"><LogOut className="w-4 h-4 mr-2" /> ออกจากระบบ</button></div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto h-screen bg-slate-50 print:bg-white print:p-0 print:h-auto print:overflow-visible">
        <div className="max-w-[1600px] mx-auto w-full print:max-w-none">
           {activeTab === 'add' && <AddDataPage user={{role}} refreshData={refreshData} />}
           {activeTab === 'verify' && <VerifyDataPage waterData={waterData} refreshData={refreshData} />}
           {activeTab === 'users' && <UserManagementPage />}
           {activeTab === 'report' && <DataReportPage waterData={waterData} />}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('hydro_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [waterData, setWaterData] = useState([]);

  const fetchData = async () => {
    const data = await MysqlService.getAllReports();
    setWaterData(data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogin = (userData) => { 
    setUser(userData); 
    localStorage.setItem('hydro_user', JSON.stringify(userData));
    setCurrentPage('dashboard'); 
  };

  const handleLogout = () => { 
    setUser(null); 
    localStorage.removeItem('hydro_user');
    setCurrentPage('login'); 
  };

  if (currentPage === 'dashboard' && user) return <DashboardLayout role={user.role} onLogout={handleLogout} onGoHome={() => setCurrentPage('home')} waterData={waterData} refreshData={fetchData} />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 print:bg-white">
      <PublicHeader setCurrentPage={setCurrentPage} user={user} />
      <main className="pt-6 pb-12 print:hidden">
        {currentPage === 'home' && <HomePage waterData={waterData} />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
      </main>
      <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm print:hidden"><p>&copy; 2024 HydroMonitor System. All rights reserved.</p></footer>
    </div>
  );
}