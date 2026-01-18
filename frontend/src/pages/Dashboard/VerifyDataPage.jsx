import React, { useState } from 'react';
import { CheckCircle, Edit, User, Calendar, ArrowLeft, ArrowDownCircle, ArrowUpCircle, Droplets, CloudRain } from 'lucide-react';
import { MysqlService } from '../../services/mysqlService';
import { getBangkokDate } from '../../utils/helpers';

const VerifyDataPage = ({ waterData = [], rainData = [], refreshData }) => {
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('water'); // 🟢 'water' หรือ 'rain'
  const [editData, setEditData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getBangkokDate());

  // 🔍 กรองข้อมูลตาม Tab และ วันที่เลือก
  const displayData = (activeTab === 'water' ? waterData : rainData).filter(item => 
    getBangkokDate(item.updated_at || item.date) === selectedDate
  );

  const handleEditClick = (item) => { 
    setEditData(item); 
    setViewMode('edit'); 
  };

  const handleUpdate = async (status) => {
    try {
      if (activeTab === 'water') {
        // อัปเดตข้อมูลน้ำ
        await MysqlService.updateReport(editData.id, { 
          ...editData, 
          status,
          current: parseFloat(editData.waterLevel)
        });
      } else {
        // 🌧️ อัปเดตข้อมูลฝน
        await MysqlService.updateRainReport(editData.id, { 
          ...editData, 
          status 
        });
      }
      
      alert(`อัปเดตสถานะข้อมูล${activeTab === 'water' ? 'น้ำ' : 'ฝน'}เป็น ${status} เรียบร้อย`);
      refreshData();
      setViewMode('list');
    } catch (e) {
      alert('Update failed: ' + e.message);
    }
  };

  // --- 🎨 หน้าจอแก้ไข (Edit Mode) ---
  if (viewMode === 'edit') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in border border-gray-100">
        <div className="flex items-center mb-6">
          <button onClick={() => setViewMode('list')} className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            แก้ไขและอนุมัติข้อมูล{activeTab === 'water' ? 'น้ำ' : 'ฝน'}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-1 uppercase tracking-wider">สถานี</label>
                <input type="text" value={editData.stationName} disabled className="w-full px-4 py-2 border rounded-lg bg-white text-blue-900 font-bold shadow-sm" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-1 uppercase tracking-wider">ผู้ส่งข้อมูล</label>
                <div className="flex items-center text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <User className="w-4 h-4 mr-2 text-gray-400"/>
                    {editData.createdBy || 'Unknown User'}
                </div>
              </div>

              {/* 🟢 ส่วนแก้ไขข้อมูลแยกตามประเภท */}
              <div className="md:col-span-2">
                {activeTab === 'water' ? (
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
                ) : (
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <label className="block text-sm font-bold text-cyan-800 mb-2 flex items-center"><CloudRain className="w-4 h-4 mr-1"/> ปริมาณฝน (มม.)</label>
                    <input type="number" value={editData.rainAmount} onChange={(e) => setEditData({...editData, rainAmount: e.target.value})} className="w-full px-4 py-3 border-2 border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xl text-cyan-800 font-bold" />
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะปัจจุบัน</label>
                <div className={`px-4 py-2 rounded-lg font-bold inline-block shadow-sm ${
                   editData.status === 'approved' ? 'bg-green-100 text-green-700' : 
                   editData.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{editData.status.toUpperCase()}</div>
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
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-orange-500" /> ตรวจสอบข้อมูล (Verify Data)
          </h2>
          
          <div className="flex items-center mt-3 gap-3">
            {/* 🟢 ปุ่มสลับ Tab น้ำ/ฝน */}
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button onClick={() => setActiveTab('water')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'water' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-blue-600'}`}>
                <Droplets className="w-4 h-4 mr-1" /> น้ำ
              </button>
              <button onClick={() => setActiveTab('rain')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'rain' ? 'bg-white text-cyan-600 shadow-sm' : 'text-gray-500 hover:text-cyan-600'}`}>
                <CloudRain className="w-4 h-4 mr-1" /> ฝน
              </button>
            </div>

            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm h-[42px]">
               <div className="bg-indigo-50 p-2 rounded-lg mr-2"><Calendar className="w-4 h-4 text-indigo-600"/></div>
               <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="outline-none text-sm text-gray-700 bg-transparent cursor-pointer pr-2" />
            </div>
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-lg text-sm font-bold shadow-inner ${activeTab === 'water' ? 'bg-blue-50 text-blue-700' : 'bg-cyan-50 text-cyan-700'}`}>
          รายการวันนี้: {displayData.length} รายการ
        </div>
      </div>

      <div className="overflow-x-auto border rounded-xl shadow-sm">
        <table className="w-full border-collapse">
          <thead className={activeTab === 'water' ? "bg-blue-50" : "bg-cyan-50"}>
            <tr className="text-gray-500 text-[11px] uppercase tracking-widest font-bold">
              <th className="p-4 text-center">วันที่</th>
              <th className="p-4 text-center">สถานี</th>
              {activeTab === 'water' ? (
                <>
                  <th className="p-4 text-center">Inflow</th>
                  <th className="p-4 text-center">Outflow</th>
                </>
              ) : (
                <th className="p-4 text-center">Rain (mm.)</th>
              )}
              <th className="p-4 text-center">สถานะ</th>
              <th className="p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {displayData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="p-4 text-center text-gray-400">{item.date}</td>
                <td className="p-4 font-bold text-center text-blue-900">
                  {item.stationName}
                  <div className="text-[10px] font-normal text-gray-400 flex items-center justify-center mt-1">
                    <User className="w-3 h-3 mr-1"/> {item.createdBy || 'Unknown'}
                  </div>
                </td>
                
                {activeTab === 'water' ? (
                  <>
                    <td className="p-4 text-center font-mono text-green-600 font-bold">{item.inflow || '0'}</td>
                    <td className="p-4 text-center font-mono text-orange-600 font-bold">{item.outflow || '0'}</td>
                  </>
                ) : (
                  <td className="p-4 text-center font-mono text-cyan-600 font-bold">{item.rainAmount || '0.0'}</td>
                )}

                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block min-w-[80px] ${
                    item.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' : 
                    item.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  }`}>
                    {item.status.toUpperCase()}
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
                <td colSpan={activeTab === 'water' ? 6 : 5} className="p-20 text-center text-gray-400">
                   <CloudRain className="w-12 h-12 mx-auto mb-3 opacity-20" />
                   ไม่พบข้อมูล{activeTab === 'water' ? 'น้ำ' : 'ฝน'}ของวันที่เลือก
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