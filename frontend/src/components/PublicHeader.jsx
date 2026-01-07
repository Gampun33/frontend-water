// src/components/PublicHeader.jsx
import React from 'react';
import { Map, LogIn, Shield } from 'lucide-react';

const PublicHeader = ({ setCurrentPage, user }) => (
  <header className="bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-50 print:hidden">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
        <div className="bg-white p-1 rounded-full">
          <Map className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold">HydroMonitor System (MySQL)</h1>
      </div>
      <nav className="hidden md:flex space-x-6">
        <button onClick={() => setCurrentPage('home')} className="hover:text-blue-300 transition">หน้าหลัก</button>
        <button onClick={() => setCurrentPage('about')} className="hover:text-blue-300 transition">เกี่ยวกับ</button>
        {user ? (
          <button onClick={() => setCurrentPage('dashboard')} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition shadow-md font-medium">
            <Shield className="w-4 h-4 mr-2" /> แดชบอร์ด ({user.role})
          </button>
        ) : (
          <button onClick={() => setCurrentPage('login')} className="bg-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg flex items-center transition shadow-md">
            <LogIn className="w-4 h-4 mr-2" /> เข้าสู่ระบบ
          </button>
        )}
      </nav>
    </div>
  </header>
);

export default PublicHeader;