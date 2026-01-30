import React, { useState } from 'react';
import { 
  LogOut, Database, CheckCircle, Users, 
  FileText, History, Home, Settings,
  LayoutDashboard // 🟢 1. เพิ่มไอคอน Dashboard
} from 'lucide-react';

// --- Import หน้าจอย่อยๆ ---
import AddDataPage from './AddDataPage';
import OperatorStatusPage from './OperatorStatusPage';
import VerifyDataPage from './VerifyDataPage';
import UserManagementPage from './UserManagementPage';
import DataReportPage from './DataReportPage';
import ProfilePage from './ProfilePage';
import DashboardChartPage from './DashboardChartPage'; // 🟢 2. Import หน้ากราฟที่เพิ่งสร้าง

// 🟢 เพิ่ม rainData เข้ามาใน Props ของคอมโพเนนต์
const DashboardLayout = ({ user, onLogout, onGoHome, waterData, rainData = [], refreshData, onUpdateUser }) => {
  
  // 🟢 3. ปรับให้เปิดมาเจอหน้า Dashboard เป็นหน้าแรก (หรือจะแก้กลับเป็น logic เดิมก็ได้จ้ะ)
  const [activeTab, setActiveTab] = useState('dashboard');

  const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center space-x-3 px-6 py-3 transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row print:bg-white print:block">
      <style>{`
        @media print { 
          .print\\:hidden { display: none !important; } 
          aside { display: none; } 
          main { margin: 0; padding: 0; } 
        }
      `}</style>

      {/* --- Sidebar --- */}
      <aside className="w-full md:w-64 bg-white shadow-lg z-10 flex-shrink-0 flex flex-col h-screen sticky top-0 print:hidden">
        <div className="p-6 border-b bg-blue-50/50">
          <h2 className="font-bold text-gray-800 uppercase">
            {user.role === 'admin' ? 'Administrator' : 'Operator'}
          </h2>
          <p className="text-sm font-medium text-gray-600 truncate">{user.fullName}</p>
          <p className="text-xs text-green-500 mt-1">● Database Connected</p>
        </div>

        <div className="px-4 pt-4 pb-2">
          <button 
            onClick={onGoHome} 
            className="w-full bg-white border px-4 py-2.5 rounded-xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition"
          >
            <Home className="w-4 h-4 mr-2" /> กลับหน้าเว็บไซต์
          </button>
        </div>

        <nav className="py-2 space-y-1 flex-1 overflow-y-auto">
          
          {/* 🟢 4. เพิ่มเมนู Dashboard ไว้บนสุด */}
          <SidebarItem 
            icon={LayoutDashboard} 
            label="ภาพรวม (Dashboard)" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />

          <SidebarItem 
            icon={Database} 
            label="เพิ่มข้อมูล" 
            active={activeTab === 'add'} 
            onClick={() => setActiveTab('add')} 
          />
          <SidebarItem 
            icon={History} 
            label="ติดตามสถานะ" 
            active={activeTab === 'status'} 
            onClick={() => setActiveTab('status')} 
          />
          
          {user.role === 'admin' && (
            <>
              <SidebarItem 
                icon={CheckCircle} 
                label="ตรวจข้อมูล" 
                active={activeTab === 'verify'} 
                onClick={() => setActiveTab('verify')} 
              />
              <SidebarItem 
                icon={Users} 
                label="จัดการผู้ใช้" 
                active={activeTab === 'users'} 
                onClick={() => setActiveTab('users')} 
              />
              <SidebarItem 
                icon={FileText} 
                label="รายงานผล" 
                active={activeTab === 'report'} 
                onClick={() => setActiveTab('report')} 
              />
            </>
          )}

          <div className="pt-4 mt-2 border-t mx-4 mb-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">บัญชีของฉัน</span>
          </div>
          
          <SidebarItem 
            icon={Settings} 
            label="ข้อมูลส่วนตัว" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
        </nav>

        <div className="p-4 border-t">
          <button 
            onClick={onLogout} 
            className="flex items-center justify-center text-red-600 w-full px-4 py-2.5 rounded-xl hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4 mr-2" /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 p-6 overflow-y-auto h-screen bg-slate-50 print:bg-white print:p-0 print:h-auto print:overflow-visible">
        <div className="max-w-[1600px] mx-auto w-full print:max-w-none">
            
            {/* 🟢 5. เพิ่มส่วนแสดงผลกราฟ Dashboard */}
            {activeTab === 'dashboard' && (
              <DashboardChartPage 
                waterData={waterData} 
                rainData={rainData} 
              />
            )}

            {/* 🟢 หน้าเพิ่มข้อมูล (รองรับทั้งน้ำและฝนในตัว) */}
            {activeTab === 'add' && <AddDataPage user={user} refreshData={refreshData} />}
            
            {/* 🟢 หน้าติดตามสถานะ (ส่ง rainData ไปเพิ่ม) */}
            {activeTab === 'status' && (
              <OperatorStatusPage 
                user={user} 
                waterData={waterData} 
                rainData={rainData} 
                refreshData={refreshData} 
              />
            )}

            {/* 🟢 หน้าตรวจข้อมูล Admin (ส่ง rainData ไปเพิ่มเพื่อให้ Admin ตรวจฝนได้) */}
            {activeTab === 'verify' && (
              <VerifyDataPage 
                waterData={waterData} 
                rainData={rainData} 
                refreshData={refreshData} 
              />
            )}

            {activeTab === 'users' && <UserManagementPage />}
            
            {/* 🟢 หน้ารายงานผล (ส่ง rainData ไปเพิ่มเพื่อออกรายงานฝน) */}
            {activeTab === 'report' && (
              <DataReportPage 
                waterData={waterData} 
                rainData={rainData} 
              />
            )}

            {activeTab === 'profile' && <ProfilePage user={user} onUpdateUser={onUpdateUser} />}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;