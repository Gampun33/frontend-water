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
  const [waterData, setWaterData] = useState([]);

  const fetchData = async () => {
    const data = await MysqlService.getAllReports();
    setWaterData(data || []);
  };

  useEffect(() => { fetchData(); }, []);

  // --- 1. เพิ่มฟังก์ชันสำหรับอัปเดตข้อมูล User ใน State ---
  const handleUpdateUser = (updatedData) => {
    // รวมข้อมูลเดิม (เช่น id, role) เข้ากับข้อมูลใหม่ที่แก้มา (fullName, organization)
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

  if (currentPage === 'dashboard' && user) {
    return (
      <DashboardLayout 
        user={user} 
        onLogout={handleLogout} 
        onGoHome={() => setCurrentPage('home')} 
        waterData={waterData} 
        refreshData={fetchData}
        // --- 2. ส่งฟังก์ชันนี้เข้าไปใน DashboardLayout ---
        onUpdateUser={handleUpdateUser} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans print:bg-white">
      <PublicHeader setCurrentPage={setCurrentPage} user={user} />
      <main className="pt-6 pb-12 print:hidden">
        {currentPage === 'home' && <HomePage waterData={waterData} />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
      </main>
      <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm print:hidden">
        <p>&copy; 2024 HydroMonitor System. All rights reserved.</p>
      </footer>
    </div>
  );
}