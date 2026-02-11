import React, { useState } from 'react';
import { History, Calendar, Clock, Check, X, FileText, Droplets, CloudRain, Building2, Edit } from 'lucide-react'; 

const OperatorStatusPage = ({ user, waterData = [], rainData = [], damData = [], onEdit }) => { 
  
  // 1. Helper: ดึงวันที่ปัจจุบัน (Local Time)
  const getLocalTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 2. Helper Date Parser (สำหรับกรองข้อมูล)
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

  const [selectedDate, setSelectedDate] = useState(getLocalTodayStr());
  const [activeTab, setActiveTab] = useState('water'); 

  // 3. Logic กรองข้อมูล
  const filterMyReports = (data) => {
    return data.filter(item => {
      const isOwner = (item.createdBy === user.username || item.created_by === user.username || 
                       item.createdBy === user.fullName || item.created_by === user.fullName);
      const itemDate = getItemDateStr(item);
      return isOwner && itemDate === selectedDate;
    }).sort((a, b) => new Date(b.updated_at || b.date) - new Date(a.updated_at || a.date));
  };

  const myWaterReports = filterMyReports(waterData);
  const myRainReports = filterMyReports(rainData);
  const myDamReports = filterMyReports(damData);

  const currentList = activeTab === 'water' ? myWaterReports 
                    : activeTab === 'rain' ? myRainReports 
                    : myDamReports;

  const handleEditClick = (item) => {
      if (onEdit) {
          onEdit(item, activeTab); 
      }
  };

  const StatusBadge = ({ status }) => {
    switch(status) {
      case 'approved': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1"/>อนุมัติแล้ว</span>;
      case 'rejected': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><X className="w-3 h-3 mr-1"/>ถูกตีกลับ</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1"/>รอตรวจสอบ</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in border border-gray-100">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <History className="w-6 h-6 mr-3 text-indigo-600" /> ติดตามสถานะ
            </h2>
            <p className="text-xs text-gray-400 mt-1 ml-9 font-medium">แสดงข้อมูลการส่งรายงานของคุณ</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button onClick={() => setActiveTab('water')} className={`flex items-center px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'water' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-blue-500'}`}>
                <Droplets className="w-3 h-3 mr-1" /> น้ำทั่วไป
              </button>
              <button onClick={() => setActiveTab('rain')} className={`flex items-center px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'rain' ? 'bg-white text-cyan-600 shadow-sm' : 'text-gray-500 hover:text-cyan-500'}`}>
                <CloudRain className="w-3 h-3 mr-1" /> ฝน
              </button>
              <button onClick={() => setActiveTab('dam')} className={`flex items-center px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'dam' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-indigo-500'}`}>
                <Building2 className="w-3 h-3 mr-1" /> เขื่อน
              </button>
            </div>

            <div className="flex items-center bg-white border rounded-lg p-1.5 shadow-sm">
              <Calendar className="w-4 h-4 text-indigo-600 mx-1.5"/>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="outline-none text-sm p-0.5 cursor-pointer bg-transparent" />
            </div>
          </div>
        </div>

        {/* ตารางแสดงผล */}
        <div className="overflow-x-auto border rounded-xl shadow-inner">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={activeTab === 'water' ? "bg-blue-50" : activeTab === 'rain' ? "bg-cyan-50" : "bg-indigo-50"}>
              <tr>
                {/* 🟢 แยกคอลัมน์ วันที่ และ เวลา */}
                <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">วันที่</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">เวลา</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">สถานี / พื้นที่</th>
                
                {activeTab === 'water' && (
                  <>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">ระดับน้ำ (ม.)</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Inflow</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Outflow</th>
                  </>
                )}
                {activeTab === 'rain' && (
                  <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">ปริมาณฝน (มม.)</th>
                )}
                {activeTab === 'dam' && (
                  <>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">น้ำปัจจุบัน (ล้าน ลบ.ม.)</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">น้ำใช้การ (ล้าน ลบ.ม.)</th>
                  </>
                )}

                <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentList.length > 0 ? (
                currentList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                  
                  {/* 🟢 คอลัมน์ 1: วันที่ */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 font-mono font-bold">
                      {getDateDisplay(item.date || item.updated_at || item.created_at)}
                  </td>

                  {/* 🟢 คอลัมน์ 2: เวลา */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-mono">
                      <span className="bg-gray-100 px-2 py-1 rounded-md flex items-center justify-center w-fit mx-auto">
                          <Clock className="w-3 h-3 mr-1 text-gray-400"/>
                          {getTimeDisplay(item.created_at || item.updated_at || item.date)}
                      </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                      {item.stationName || item.station_name}
                  </td>
                  
                  {activeTab === 'water' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-blue-600 font-bold">{item.waterLevel}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-green-600">{item.inflow || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-orange-600">{item.outflow || '-'}</td>
                    </>
                  )}
                  {activeTab === 'rain' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-cyan-600 font-bold">{item.rainAmount || '0.0'}</td>
                  )}
                  {activeTab === 'dam' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-indigo-600 font-bold">
                          {item.currentStorage || item.current_storage || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-green-600 font-bold">
                          {item.usableStorage || item.usable_storage || '-'}
                      </td>
                    </>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap text-center"><StatusBadge status={item.status || 'pending'} /></td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {item.status === 'rejected' && (
                        <button 
                            onClick={() => handleEditClick(item)}
                            className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-full transition-colors flex items-center justify-center mx-auto"
                            title="แก้ไขและส่งใหม่"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan={activeTab === 'water' ? 8 : 6} className="px-6 py-16 text-center text-gray-400">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium">
                      ไม่พบประวัติการส่งข้อมูล
                      {activeTab === 'water' ? 'น้ำทั่วไป' : activeTab === 'rain' ? 'ฝน' : 'เขื่อน'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">วันที่ {selectedDate}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default OperatorStatusPage;