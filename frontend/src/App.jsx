import React, { useState, useEffect } from 'react';
import { MysqlService } from './services/mysqlService';
import PublicHeader from './components/PublicHeader';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/Dashboard/DashboardLayout';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('hydro_user') || 'null'));
  
  // 🟢 1. เพิ่ม State เก็บข้อมูลฝน
  const [waterData, setWaterData] = useState([]);
  const [rainData, setRainData] = useState([]); 

  // 🟢 2. แก้ไขการดึงข้อมูลให้ดึงทั้ง 2 อย่าง
  const fetchData = async () => {
    try {
      const [wData, rData] = await Promise.all([
        MysqlService.getAllReports(),
        MysqlService.getRainReports() // 👈 ต้องมั่นใจว่าใน mysqlService มีฟังก์ชันนี้แล้วนะ
      ]);
      setWaterData(wData || []);
      setRainData(rData || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('hydro_user', JSON.stringify(newUser));
  };

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

  // 🟢 3. ส่ง rainData เข้าไปใน DashboardLayout
  if (currentPage === 'dashboard' && user) {
    return (
      <DashboardLayout 
        user={user} 
        onLogout={handleLogout} 
        onGoHome={() => setCurrentPage('home')} 
        waterData={waterData} 
        rainData={rainData} // 👈 ส่งข้อมูลฝนไปให้ Dashboard
        refreshData={fetchData}
        onUpdateUser={handleUpdateUser} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans print:bg-white">
      <PublicHeader setCurrentPage={setCurrentPage} user={user} />
      <main className="pt-6 pb-12 print:hidden">
        {/* 🟢 4. ส่ง rainData ไปโชว์ที่หน้าแรก (HomePage) */}
        {currentPage === 'home' && <HomePage waterData={waterData} rainData={rainData} />}
        
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
      </main>
      <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm print:hidden">
        {/* เปลี่ยนปีให้เป็นปัจจุบันด้วยนะจ๊ะ */}
        <p>&copy; 2026 HydroMonitor System. All rights reserved.</p>
      </footer>
    </div>
  );
}