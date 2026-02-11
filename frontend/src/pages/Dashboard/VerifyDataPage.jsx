import React, { useState } from 'react';
import { CheckCircle, Edit, User, Calendar, ArrowLeft, ArrowDownCircle, ArrowUpCircle, Droplets, CloudRain, Building2, Database, Activity, Clock } from 'lucide-react';
import { MysqlService } from '../../services/mysqlService';

const VerifyDataPage = ({ waterData = [], rainData = [], damData = [], refreshData }) => {
  
  // 🟢 1. Helper: ดึงวันที่ปัจจุบัน (Local Time)
  const getLocalTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 🟢 2. Helper (ตัวแก้บั๊ก Timezone): ดึงวันที่จากข้อมูล
  const getItemDateStr = (item) => {
      let rawDate = item.date || item.updated_at || item.created_at;
      if (!rawDate) return "";

      if (typeof rawDate === 'string' && rawDate.length === 10) return rawDate;
      if (typeof rawDate === 'string') rawDate = rawDate.replace(' ', 'T'); 
      
      const d = new Date(rawDate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  // 🟢 3. Helper ใหม่: ดึงเฉพาะ "เวลา" (HH:mm น.)
  const getTimeDisplay = (dateString) => {
      if (!dateString) return '-';
      try {
          let rawDate = dateString;
          // ถ้าเป็นแค่วันที่ (YYYY-MM-DD) ไม่มีเวลา ให้ขีดละไว้
          if (typeof rawDate === 'string' && rawDate.length === 10) return '-'; 
          
          if (typeof rawDate === 'string') rawDate = rawDate.replace(' ', 'T');
          const d = new Date(rawDate);
          
          return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น.";
      } catch (e) {
          return '-';
      }
  };

  // 🟢 4. Helper ใหม่: ดึงเฉพาะ "วันที่" (DD/MM/YYYY)
  const getDateDisplay = (dateString) => {
      if (!dateString) return '-';
      try {
          let rawDate = dateString;
          if (typeof rawDate === 'string') rawDate = rawDate.replace(' ', 'T');
          const d = new Date(rawDate);
          return d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } catch (e) {
          return '-';
      }
  };

  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('water');
  const [editData, setEditData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getLocalTodayStr());

  const displayData = (
      activeTab === 'water' ? waterData : 
      activeTab === 'rain' ? rainData : 
      damData
  ).filter(item => 
    getItemDateStr(item) === selectedDate
  ).sort((a, b) => new Date(b.updated_at || b.date) - new Date(a.updated_at || a.date));

  const handleEditClick = (item) => { setEditData(item); setViewMode('edit'); };

  const handleUpdate = async (status) => {
    try {
      if (activeTab === 'water') {
        await MysqlService.updateReport(editData.id, { ...editData, status, current: parseFloat(editData.waterLevel) });
      } else if (activeTab === 'rain') {
        await MysqlService.updateRainReport(editData.id, { ...editData, status });
      } else if (activeTab === 'dam') {
        await MysqlService.updateDamReport(editData.id, { ...editData, status });
      }
      alert(`อัปเดตสถานะข้อมูลเรียบร้อย (${status})`);
      refreshData();
      setViewMode('list');
    } catch (e) {
      alert('Update failed: ' + e.message);
    }
  };

  // --- 🎨 หน้าจอแก้ไข (Edit Mode) - เหมือนเดิม ---
  if (viewMode === 'edit') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in border border-gray-100">
        <div className="flex items-center mb-6">
          <button onClick={() => setViewMode('list')} className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            ตรวจสอบข้อมูล: {activeTab === 'water' ? 'น้ำทั่วไป' : activeTab === 'rain' ? 'ฝน' : 'เขื่อน'}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
              {/* ... (ส่วน Edit Form เหมือนเดิม ไม่ต้องแก้) ... */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-1 uppercase tracking-wider">สถานี / พื้นที่</label>
                <input type="text" value={editData.stationName || editData.station_name} disabled className="w-full px-4 py-2 border rounded-lg bg-white text-blue-900 font-bold shadow-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-1 uppercase tracking-wider">ผู้ส่งข้อมูล</label>
                <div className="flex items-center text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <User className="w-4 h-4 mr-2 text-gray-400"/>
                    {editData.createdBy || editData.created_by || 'Unknown User'}
                </div>
              </div>
              <div className="md:col-span-2">
                {activeTab === 'water' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ระดับน้ำ (ม.)</label>
                      <input type="number" value={editData.waterLevel} onChange={(e) => setEditData({...editData, waterLevel: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1 flex items-center"><ArrowDownCircle className="w-4 h-4 mr-1"/> Inflow</label>
                      <input type="number" value={editData.inflow} onChange={(e) => setEditData({...editData, inflow: e.target.value})} className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-mono text-green-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1 flex items-center"><ArrowUpCircle className="w-4 h-4 mr-1"/> Outflow</label>
                      <input type="number" value={editData.outflow} onChange={(e) => setEditData({...editData, outflow: e.target.value})} className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-mono text-orange-700" />
                    </div>
                  </div>
                )}
                {activeTab === 'rain' && (
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <label className="block text-sm font-bold text-cyan-800 mb-2 flex items-center"><CloudRain className="w-4 h-4 mr-1"/> ปริมาณฝน (มม.)</label>
                    <input type="number" value={editData.rainAmount} onChange={(e) => setEditData({...editData, rainAmount: e.target.value})} className="w-full px-4 py-3 border-2 border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xl text-cyan-800 font-bold" />
                  </div>
                )}
                {activeTab === 'dam' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div>
                        <label className="block text-sm font-bold text-indigo-800 mb-1 flex items-center"><Database className="w-4 h-4 mr-1"/> ปริมาณน้ำปัจจุบัน</label>
                        <input type="number" value={editData.currentStorage || editData.current_storage} onChange={(e) => setEditData({...editData, currentStorage: e.target.value, current_storage: e.target.value})} className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-bold" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-green-800 mb-1 flex items-center"><Activity className="w-4 h-4 mr-1"/> น้ำใช้การได้</label>
                        <input type="number" value={editData.usableStorage || editData.usable_storage} onChange={(e) => setEditData({...editData, usableStorage: e.target.value, usable_storage: e.target.value})} className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-mono font-bold text-green-700" />
                    </div>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะปัจจุบัน</label>
                <div className={`px-4 py-2 rounded-lg font-bold inline-block shadow-sm ${
                   editData.status === 'approved' ? 'bg-green-100 text-green-700' : 
                   editData.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{editData.status ? editData.status.toUpperCase() : 'PENDING'}</div>
              </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-4">
              <button onClick={() => handleUpdate('approved')} className="flex-1 py-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg transition transform active:scale-95">อนุมัติ (Approve)</button>
              <button onClick={() => handleUpdate('pending')} className="flex-1 py-4 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-700 font-bold hover:bg-yellow-100 transition">พักการตรวจ</button>
              <button onClick={() => handleUpdate('rejected')} className="flex-1 py-4 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold hover:bg-red-100 transition">ตีกลับ (Reject)</button>
          </div>
        </div>
      </div>
    );
  }

  // --- 📋 หน้าจอรายการ (List Mode) ---
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        {/* ... (Header เหมือนเดิม) ... */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-orange-500" /> ตรวจสอบข้อมูล (Verify Data)
          </h2>
          <div className="flex items-center mt-3 gap-3">
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button onClick={() => setActiveTab('water')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'water' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-blue-600'}`}><Droplets className="w-4 h-4 mr-1" /> น้ำ</button>
              <button onClick={() => setActiveTab('rain')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'rain' ? 'bg-white text-cyan-600 shadow-sm' : 'text-gray-500 hover:text-cyan-600'}`}><CloudRain className="w-4 h-4 mr-1" /> ฝน</button>
              <button onClick={() => setActiveTab('dam')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dam' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-indigo-600'}`}><Building2 className="w-4 h-4 mr-1" /> เขื่อน</button>
            </div>
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm h-[42px]">
               <div className="bg-indigo-50 p-2 rounded-lg mr-2"><Calendar className="w-4 h-4 text-indigo-600"/></div>
               <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="outline-none text-sm text-gray-700 bg-transparent cursor-pointer pr-2" />
            </div>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg text-sm font-bold shadow-inner ${
            activeTab === 'water' ? 'bg-blue-50 text-blue-700' : activeTab === 'rain' ? 'bg-cyan-50 text-cyan-700' : 'bg-indigo-50 text-indigo-700'
        }`}>
          รายการวันนี้: {displayData.length} รายการ
        </div>
      </div>

      <div className="overflow-x-auto border rounded-xl shadow-sm">
        <table className="w-full border-collapse">
          <thead className={activeTab === 'water' ? "bg-blue-50" : activeTab === 'rain' ? "bg-cyan-50" : "bg-indigo-50"}>
            <tr className="text-gray-500 text-[11px] uppercase tracking-widest font-bold">
              {/* 🟢 แยกวันที่และเวลาเป็น 2 คอลัมน์ */}
              <th className="p-4 text-center">วันที่</th>
              <th className="p-4 text-center">เวลา</th>
              <th className="p-4 text-center">สถานี</th>
              
              {activeTab === 'water' && (
                <>
                  <th className="p-4 text-center">Inflow</th>
                  <th className="p-4 text-center">Outflow</th>
                </>
              )}
              {activeTab === 'rain' && (
                <th className="p-4 text-center">Rain (mm.)</th>
              )}
              {activeTab === 'dam' && (
                <>
                  <th className="p-4 text-center">Current</th>
                  <th className="p-4 text-center">Usable</th>
                </>
              )}

              <th className="p-4 text-center">สถานะ</th>
              <th className="p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {displayData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                
                {/* 🟢 คอลัมน์ 1: วันที่ (ใช้ helper ใหม่) */}
                <td className="p-4 text-center text-gray-700 font-mono font-bold">
                    {getDateDisplay(item.date || item.updated_at || item.created_at)}
                </td>

                {/* 🟢 คอลัมน์ 2: เวลา (ใช้ helper ใหม่) */}
                <td className="p-4 text-center text-gray-500 font-mono text-xs">
                    <span className="bg-gray-100 px-2 py-1 rounded-md flex items-center justify-center w-fit mx-auto">
                        <Clock className="w-3 h-3 mr-1 text-gray-400"/>
                        {getTimeDisplay(item.created_at || item.updated_at || item.date)}
                    </span>
                </td>

                <td className="p-4 font-bold text-center text-blue-900">
                  {item.stationName || item.station_name}
                  <div className="text-[10px] font-normal text-gray-400 flex items-center justify-center mt-1">
                    <User className="w-3 h-3 mr-1"/> {item.createdBy || item.created_by || 'Unknown'}
                  </div>
                </td>
                
                {activeTab === 'water' && (
                  <>
                    <td className="p-4 text-center font-mono text-green-600 font-bold">{item.inflow || '0'}</td>
                    <td className="p-4 text-center font-mono text-orange-600 font-bold">{item.outflow || '0'}</td>
                  </>
                )}
                {activeTab === 'rain' && (
                  <td className="p-4 text-center font-mono text-cyan-600 font-bold">{item.rainAmount || '0.0'}</td>
                )}
                {activeTab === 'dam' && (
                  <>
                    <td className="p-4 text-center font-mono text-indigo-600 font-bold">{item.currentStorage || item.current_storage || '-'}</td>
                    <td className="p-4 text-center font-mono text-green-600 font-bold">{item.usableStorage || item.usable_storage || '-'}</td>
                  </>
                )}

                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block min-w-[80px] ${
                    item.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' : 
                    item.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  }`}>
                    {item.status ? item.status.toUpperCase() : 'PENDING'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => handleEditClick(item)} className="p-2.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition shadow-sm border border-blue-100">
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {displayData.length === 0 && (
              <tr>
                <td colSpan={activeTab === 'water' ? 7 : 6} className="p-20 text-center text-gray-400">
                   <CloudRain className="w-12 h-12 mx-auto mb-3 opacity-20" />
                   ไม่พบข้อมูล{activeTab === 'water' ? 'น้ำ' : activeTab === 'rain' ? 'ฝน' : 'เขื่อน'}ของวันที่เลือก
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerifyDataPage;