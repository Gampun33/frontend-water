import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, CloudRain, Info, LogIn, LogOut, 
  Database, FileSpreadsheet, CheckCircle, 
  Users, FileText, Printer, Save, Trash2, 
  Edit, Upload, Shield, Menu, X, Download,
  Move, Crosshair, MapPin, Navigation,
  ChevronDown, ChevronRight as ChevronRightIcon,
  Filter, UserPlus,
  Key, User, Building, ArrowLeft, UserCog,
  FileEdit, AlertTriangle, History, Home, 
  Image as ImageIcon, FileCheck, Loader, Server,
  Globe, Activity, FileUp, ChevronLeft, ChevronRight,
  Settings, Clock, Check
} from 'lucide-react';

// --- VIDEO ASSET CONFIG ---
// พี่สาวเปลี่ยนตรงนี้ให้เป็น Link Online นะจ๊ะ เพื่อให้ Preview ได้ทันทีโดยไม่ต้องมีไฟล์ Local
import waveVideo from './assets/mapwater.mp4'; 

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
        // ถ้าไม่มีข้อมูลเลย ให้สร้าง mock data เริ่มต้นสักหน่อยเพื่อให้หน้าจอไม่โล่ง
        if (data.length === 0) {
            const initialMock = [
                { id: 101, stationName: 'เขื่อนภูมิพล', date: '2023-10-27', waterLevel: '240.50', inflow: '15.20', outflow: '12.00', status: 'approved', percent: 78, createdBy: 'Administrator (Mock)' },
                { id: 102, stationName: 'เขื่อนสิริกิติ์', date: '2023-10-27', waterLevel: '180.20', inflow: '8.50', outflow: '10.00', status: 'pending', percent: 65, createdBy: 'Operator 01 (Mock)' }
            ];
            MysqlService._set('mysql_water_reports', initialMock);
            resolve(initialMock);
        } else {
            resolve(data.sort((a, b) => b.id - a.id));
        }
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
          percent: (parseFloat(payload.waterLevel) / 300) * 100, // Mock percent calc
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

  // Added deleteReport function
  deleteReport: async (id) => {
    const result = await MysqlService.request(`/reports/${id}`, { method: 'DELETE' });
    if (result) return result;

    return new Promise((resolve) => {
      setTimeout(() => {
        let reports = MysqlService._get('mysql_water_reports') || [];
        reports = reports.filter(r => r.id !== id);
        MysqlService._set('mysql_water_reports', reports);
        resolve({ success: true });
      }, 400);
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
  {
    id: 'group-medium',
    type: 'group_header',
    name: 'อ่างเก็บน้ำขนาดกลาง',
    count: 48, 
    capacity: 410.101, 
    min_cap: 33.724, 
    current: 386.788, 
    percent: 94.32, 
    inflow: 2.657, 
    outflow: 2.817, 
    usable: 353.064,
    bg: 'bg-teal-800',
    text: 'text-white'
  },
];

// --- Map Carousel Data (6 Pages) ---
const MAP_CAROUSEL_DATA = [
  {
    id: 1,
    region: 'ภาพรวมประเทศ (Overview)',
    video: waveVideo, // ใช้ตัวแปร video ที่กำหนดด้านบน (Updated for Web)
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

  // --- Touch Events for Mobile/iPad ---
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setStartPan({ x: e.touches[0].clientX - transform.x, y: e.touches[0].clientY - transform.y });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    // e.preventDefault() here might be ignored by some browsers if non-passive, 
    // but the CSS 'touch-none' on the container handles the scroll blocking.
    setTransform(prev => ({ ...prev, x: e.touches[0].clientX - startPan.x, y: e.touches[0].clientY - startPan.y }));
  };

  const handleTouchEnd = () => setIsDragging(false);

  return (
    <div 
      ref={containerRef}
      // UPDATE: เพิ่ม class 'touch-none' เพื่อป้องกันการเลื่อนหน้าจอ (Page Scroll) เมื่อลากนิ้วบนแผนที่
      className={`relative overflow-hidden bg-gray-900 ${mode === 'report' ? 'h-[500px] rounded-lg border-2 border-gray-300 print:border-0 print:h-[400px]' : 'w-full mx-auto'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} group touch-none`}
      style={mode === 'interactive' ? { aspectRatio: '1842 / 1036', maxWidth: '100%' } : {}}
      onWheel={handleWheel} 
      onMouseDown={handleMouseDown} 
      onMouseMove={handleMouseMove} 
      onMouseUp={handleMouseUp} 
      onMouseLeave={handleMouseUp}
      // Add Touch Listeners
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Transforming Layer (Video & Markers) */}
      <div className="w-full h-full relative origin-center transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
        
        {/* Background Video with Key for Transition */}
        <video 
          key={activeSlideData.id} // Key forces reload on slide change
          autoPlay loop muted playsInline 
          // พี่ปรับ opacity-80 เป็น opacity-100 ให้แล้วนะ สว่างวาบแน่นอน!
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-100 transition-opacity duration-500 animate-fade-in"
        >
          <source src={activeSlideData.video} type="video/mp4" />
        </video>
        
        {/* REMOVED: <div className="absolute inset-0 bg-blue-900/30 pointer-events-none"></div> */}
        
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
        {/* REMOVED: Grid Pattern Div */}
        
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

const AboutPage = () => (
    <div className="container mx-auto p-6 space-y-8 animate-fade-in">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-10 text-white shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="z-10">
                <div className="bg-white/20 p-4 rounded-full inline-block mb-4 backdrop-blur-sm shadow-lg">
                    <Activity className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-4 tracking-tight">HydroMonitor System</h1>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
                    ระบบบริหารจัดการและติดตามสถานการณ์น้ำอัจฉริยะ ยกระดับการทำงานด้วยเทคโนโลยี Modern Web Stack และความปลอดภัยระดับ Enterprise
                </p>
            </div>
        </div>

        {/* Feature Highlights (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                    <Database className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">MySQL Integration</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    ออกแบบโครงสร้างฐานข้อมูลแบบ Relational Database รองรับปริมาณข้อมูลมหาศาล (Scalability) พร้อมระบบ Transaction Management เพื่อความถูกต้องของข้อมูล
                </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
                    <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Role-Based Security</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    ระบบจัดการสิทธิ์ผู้ใช้งาน (RBAC) แยกส่วนระหว่าง Administrator และ Operator อย่างชัดเจน พร้อมเข้ารหัสข้อมูลสำคัญเพื่อความปลอดภัยสูงสุด
                </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 text-teal-600">
                    <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Real-time Visualization</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    แสดงผลข้อมูลผ่าน Dashboard และ Interactive Map ที่ตอบสนองทันที (Reactive UI) ช่วยให้การตัดสินใจของผู้บริหารแม่นยำและรวดเร็ว
                </p>
            </div>
        </div>

        {/* Tech Stack & Team */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Server className="w-5 h-5 mr-2 text-gray-500" /> Technology Stack
                </h3>
                <ul className="space-y-4">
                    <li className="flex items-center text-gray-600 text-sm">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                        <strong className="mr-2">Frontend:</strong> React.js, Tailwind CSS, Lucide Icons
                    </li>
                    <li className="flex items-center text-gray-600 text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                        <strong className="mr-2">Backend (Concept):</strong> Node.js / Express API
                    </li>
                    <li className="flex items-center text-gray-600 text-sm">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
                        <strong className="mr-2">Database:</strong> MySQL (Relational DB)
                    </li>
                    <li className="flex items-center text-gray-600 text-sm">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span>
                        <strong className="mr-2">Infrastructure:</strong> Cloud-Ready Architecture
                    </li>
                </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-sm text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <h3 className="text-2xl font-bold mb-2 z-10">HydroMonitor Dev Team</h3>
                <p className="text-gray-400 text-sm mb-6 z-10">มุ่งมั่นพัฒนานวัตกรรมเพื่อการจัดการน้ำที่ยั่งยืน</p>
                <div className="flex -space-x-3 mb-6 z-10">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-gray-800 flex items-center justify-center text-xs font-bold shadow-lg">Dev</div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-gray-800 flex items-center justify-center text-xs font-bold shadow-lg">Des</div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-gray-800 flex items-center justify-center text-xs font-bold shadow-lg">Sec</div>
                </div>
                <div className="mt-auto pt-6 border-t border-gray-700 w-full z-10">
                    <p className="text-xs text-gray-500">Contact Support: support@hydromonitor.local</p>
                    <p className="text-xs text-gray-500 mt-1">Version 1.0.2 (Beta)</p>
                </div>
            </div>
        </div>
    </div>
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

// --- Profile Page Component ---
const ProfilePage = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    id: user.id,
    username: user.username,
    fullName: user.fullName || '',
    organization: user.organization || '',
    role: user.role,
    password: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('รหัสผ่านยืนยันไม่ตรงกัน');
      return;
    }
    
    setIsSaving(true);
    try {
      const updatePayload = {
        id: user.id,
        fullName: formData.fullName,
        organization: formData.organization,
        username: user.username, // keep original
        role: user.role // keep original
      };
      
      // Only send password if changed
      if (formData.password) {
        updatePayload.password = formData.password;
      }

      await MysqlService.saveUser(updatePayload);
      
      // Update local app state
      onUpdateUser(updatePayload);
      
      alert('บันทึกข้อมูลส่วนตัวสำเร็จ!');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
      <div className="flex items-center mb-6 border-b pb-4">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ข้อมูลส่วนตัว (My Profile)</h2>
          <p className="text-gray-500 text-sm">จัดการข้อมูลบัญชีผู้ใช้ของคุณ</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Public Info */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-500" /> ข้อมูลทั่วไป
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                <input 
                  type="text" 
                  value={formData.username} 
                  disabled 
                  className="w-full px-4 py-2 border rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">*ไม่สามารถแก้ไขชื่อผู้ใช้ได้</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">สิทธิ์การใช้งาน (Role)</label>
                <div className={`px-4 py-2 border rounded-lg bg-white inline-flex items-center ${formData.role === 'admin' ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-purple-600 border-purple-200 bg-purple-50'}`}>
                   {formData.role === 'admin' ? <Shield className="w-4 h-4 mr-2"/> : <User className="w-4 h-4 mr-2"/>}
                   <span className="font-bold uppercase">{formData.role}</span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล (Full Name)</label>
                <input 
                  type="text" 
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="ใส่ชื่อ-นามสกุลของคุณ"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">หน่วยงาน (Organization)</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.organization} 
                    onChange={e => setFormData({...formData, organization: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="เช่น กรมชลประทาน"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Security */}
          <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2 text-orange-500" /> เปลี่ยนรหัสผ่าน (Change Password)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  value={formData.confirmPassword} 
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  disabled={!formData.password}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-md transition flex items-center disabled:opacity-50"
            >
              {isSaving ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Operator Status Page (Updated: Now Interactive!) ---
const OperatorStatusPage = ({ user, waterData, refreshData }) => {
  // Filter only reports created by current user
  // Use loose check for createdBy to match either username or fullName
  const myReports = waterData.filter(item => 
    item.createdBy === user.username || item.createdBy === user.fullName
  );
  
  // Stats
  const pendingCount = myReports.filter(i => i.status === 'pending').length;
  const approvedCount = myReports.filter(i => i.status === 'approved').length;
  const rejectedCount = myReports.filter(i => i.status === 'rejected').length;

  const StatusBadge = ({ status }) => {
    switch(status) {
      case 'approved': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1"/>อนุมัติแล้ว</span>;
      case 'rejected': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><X className="w-3 h-3 mr-1"/>ถูกตีกลับ</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1"/>รอตรวจสอบ</span>;
    }
  };

  const handleDelete = async (id) => {
    if (confirm('ต้องการยกเลิกการส่งข้อมูลรายการนี้ใช่หรือไม่?')) {
        try {
            await MysqlService.deleteReport(id);
            alert('ยกเลิกรายการสำเร็จ');
            refreshData(); // Refresh list via App
        } catch(e) {
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
         <div>
           <h2 className="text-2xl font-bold text-gray-800 flex items-center">
             <History className="w-6 h-6 mr-3 text-indigo-600" /> ติดตามสถานะการส่งข้อมูล (Submission Status)
           </h2>
           <p className="text-gray-500 text-sm mt-1">ประวัติการส่งข้อมูลของคุณทั้งหมด</p>
         </div>
         
         <div className="flex space-x-3 mt-4 md:mt-0">
             <div className="flex items-center px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-sm border border-yellow-100">
                <Clock className="w-4 h-4 mr-2" /> รอ: <strong>{pendingCount}</strong>
             </div>
             <div className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
                <Check className="w-4 h-4 mr-2" /> ผ่าน: <strong>{approvedCount}</strong>
             </div>
             <div className="flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                <X className="w-4 h-4 mr-2" /> ตีกลับ: <strong>{rejectedCount}</strong>
             </div>
         </div>
       </div>

       <div className="overflow-hidden border rounded-lg">
         <table className="min-w-full divide-y divide-gray-200">
           <thead className="bg-gray-50">
             <tr>
               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ส่ง</th>
               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานี</th>
               <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ระดับน้ำ (ม.)</th>
               <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
               <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
             </tr>
           </thead>
           <tbody className="bg-white divide-y divide-gray-200">
             {myReports.length > 0 ? (
               myReports.map((item) => (
                 <tr key={item.id} className="hover:bg-gray-50 transition">
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {new Date(item.created_at || Date.now()).toLocaleDateString('th-TH')}
                     <div className="text-xs text-gray-400">{new Date(item.created_at || Date.now()).toLocaleTimeString('th-TH')}</div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm font-medium text-gray-900">{item.stationName}</div>
                     <div className="text-xs text-gray-500">วันที่วัด: {item.date}</div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                     {item.waterLevel}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-center">
                     <StatusBadge status={item.status} />
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-center">
                     {item.status === 'pending' && (
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded text-xs font-medium border border-red-200 transition"
                        >
                            ยกเลิก (Cancel)
                        </button>
                      )}
                   </td>
                 </tr>
               ))
             ) : (
               <tr>
                 <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 mb-3 text-gray-300" />
                      <p>ยังไม่มีประวัติการส่งข้อมูล</p>
                    </div>
                 </td>
               </tr>
             )}
           </tbody>
         </table>
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
      // Use fullName if available, otherwise username
      const creatorName = user.fullName || user.username;
      await MysqlService.createReport({ ...formData, createdBy: creatorName });
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
      
      {/* Show Current User Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
         <div className="flex items-center text-blue-800">
            <div className="bg-blue-200 p-2 rounded-full mr-3">
              <User className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">ผู้บันทึกข้อมูล (Recorder)</p>
              <p className="text-lg font-bold">{user.fullName || user.username}</p>
              <p className="text-xs text-blue-500">Role: {user.role} | Org: {user.organization || '-'}</p>
            </div>
         </div>
      </div>

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
            <FileText className="w-12 h-12 text-green-600 mx-auto mb-4" />
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
              
              {/* เพิ่มแสดงชื่อผู้ส่งในหน้าแก้ไขด้วย */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">ผู้ส่งข้อมูล (Reporter)</label>
                <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <User className="w-4 h-4 mr-2 text-gray-400"/>
                    {editData.createdBy || 'Unknown User'}
                </div>
              </div>

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
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">วันที่</th>
              <th className="p-4 text-left">สถานี</th>
              <th className="p-4 text-left">ผู้ส่ง</th>
              <th className="p-4 text-left">สถานะ</th>
              <th className="p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {waterData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm">{item.date}</td>
                <td className="p-4 text-sm font-medium">{item.stationName}</td>
                <td className="p-4 text-sm text-gray-600">
                  <span className="flex items-center bg-gray-100 px-2 py-1 rounded-md w-fit text-xs">
                    <User className="w-3 h-3 mr-1 text-gray-400"/> {item.createdBy || 'Unknown'}
                  </span>
                </td>
                <td className="p-4 text-sm"><span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} ${item.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}`}>{item.status}</span></td>
                <td className="p-4 flex justify-center"><button onClick={() => handleEditClick(item)} className="p-1 text-blue-600 rounded"><Edit className="w-5 h-5" /></button></td>
              </tr>
            ))}
            {waterData.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-400">ไม่พบข้อมูล</td></tr>}
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
const DashboardLayout = ({ user, onLogout, onGoHome, waterData, refreshData, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState(user.role === 'admin' ? 'verify' : 'add');
  const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center space-x-3 px-6 py-3 transition-colors ${active ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}><Icon className="w-5 h-5" /><span className="font-medium">{label}</span></button>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row print:bg-white print:block">
      <style>{`@media print { .print\\:hidden { display: none !important; } aside { display: none; } main { margin: 0; padding: 0; } }`}</style>
      <aside className="w-full md:w-64 bg-white shadow-lg z-10 flex-shrink-0 flex flex-col h-screen sticky top-0 print:hidden">
        <div className="p-6 border-b bg-blue-50/50">
          <h2 className="font-bold text-gray-800 uppercase">{user.role === 'admin' ? 'Administrator' : 'Operator'}</h2>
          <p className="text-sm font-medium text-gray-600 truncate">{user.fullName}</p>
          <p className="text-xs text-green-500 mt-1">● Database Connected</p>
        </div>
        <div className="px-4 pt-4 pb-2"><button onClick={onGoHome} className="w-full bg-white border px-4 py-2.5 rounded-xl flex items-center justify-center shadow-sm"><Home className="w-4 h-4 mr-2" /> กลับหน้าเว็บไซต์</button></div>
        <nav className="py-2 space-y-1 flex-1 overflow-y-auto">
          <SidebarItem icon={Database} label="เพิ่มข้อมูล" active={activeTab === 'add'} onClick={() => setActiveTab('add')} />
          {/* เปิดให้ทุกคนเห็นเมนูติดตามสถานะ */}
          <SidebarItem icon={History} label="ติดตามสถานะ" active={activeTab === 'status'} onClick={() => setActiveTab('status')} />
          
          {user.role === 'admin' && (<><SidebarItem icon={CheckCircle} label="ตรวจข้อมูล" active={activeTab === 'verify'} onClick={() => setActiveTab('verify')} /><SidebarItem icon={Users} label="จัดการผู้ใช้" active={activeTab === 'users'} onClick={() => setActiveTab('users')} /><SidebarItem icon={FileText} label="รายงานผล" active={activeTab === 'report'} onClick={() => setActiveTab('report')} /></>)}
          <div className="pt-4 mt-2 border-t mx-4 mb-2"><span className="text-xs text-gray-400 font-bold uppercase tracking-wider">บัญชีของฉัน</span></div>
          <SidebarItem icon={Settings} label="ข้อมูลส่วนตัว" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
        <div className="p-4 border-t"><button onClick={onLogout} className="flex items-center justify-center text-red-600 w-full px-4 py-2.5 rounded-xl"><LogOut className="w-4 h-4 mr-2" /> ออกจากระบบ</button></div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto h-screen bg-slate-50 print:bg-white print:p-0 print:h-auto print:overflow-visible">
        <div className="max-w-[1600px] mx-auto w-full print:max-w-none">
           {activeTab === 'add' && <AddDataPage user={user} refreshData={refreshData} />}
           {activeTab === 'status' && <OperatorStatusPage user={user} waterData={waterData} refreshData={refreshData} />}
           {activeTab === 'verify' && <VerifyDataPage waterData={waterData} refreshData={refreshData} />}
           {activeTab === 'users' && <UserManagementPage />}
           {activeTab === 'report' && <DataReportPage waterData={waterData} />}
           {activeTab === 'profile' && <ProfilePage user={user} onUpdateUser={onUpdateUser} />}
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

  const handleUpdateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('hydro_user', JSON.stringify(newUser));
  };

  if (currentPage === 'dashboard' && user) return <DashboardLayout user={user} onLogout={handleLogout} onGoHome={() => setCurrentPage('home')} waterData={waterData} refreshData={fetchData} onUpdateUser={handleUpdateUser} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 print:bg-white">
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