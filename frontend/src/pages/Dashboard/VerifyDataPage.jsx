import React, { useState } from 'react';
import { CheckCircle, Edit, User, Calendar, ArrowLeft } from 'lucide-react';
import { MysqlService } from '../../services/mysqlService';
import { getBangkokDate } from '../../utils/helpers';

const VerifyDataPage = ({ waterData, refreshData }) => {
  const [viewMode, setViewMode] = useState('list');
  const [editData, setEditData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getBangkokDate());

  // กรองข้อมูลตามวันที่เลือก
  const displayData = waterData.filter(item => 
    getBangkokDate(item.updated_at || item.date) === selectedDate
  );

  const handleEditClick = (item) => { 
    setEditData(item); 
    setViewMode('edit'); 
  };

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

  // --- หน้าจอแก้ไข (Edit Mode) ---
  if (viewMode === 'edit') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
        <div className="flex items-center mb-6">
          <button onClick={() => setViewMode('list')} className="mr-4 p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">แก้ไข/อนุมัติข้อมูล (Update Row)</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border p-6 rounded-xl shadow-sm">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">สถานี</label>
                <input type="text" value={editData.stationName} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ผู้ส่งข้อมูล (Reporter)</label>
                <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <User className="w-4 h-4 mr-2 text-gray-400"/>
                    {editData.createdBy || 'Unknown User'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ระดับน้ำ (ม.)</label>
                <input type="number" value={editData.waterLevel} onChange={(e) => setEditData({...editData, waterLevel: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">สถานะปัจจุบัน</label>
                <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 font-bold uppercase">{editData.status}</div>
              </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
              <button onClick={() => handleUpdate('pending')} className="flex-1 py-3 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-700 font-bold hover:bg-yellow-100 transition">รอตรวจสอบ</button>
              <button onClick={() => handleUpdate('approved')} className="flex-1 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 shadow-md transition">อนุมัติ (Approve)</button>
              <button onClick={() => handleUpdate('rejected')} className="flex-1 py-3 rounded-lg border border-red-200 bg-red-50 text-red-700 font-bold hover:bg-red-100 transition">ตีกลับ (Reject)</button>
          </div>
        </div>
      </div>
    );
  }

  // --- หน้าจอรายการ (List Mode) ---
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-orange-500" /> ตรวจสอบข้อมูล (Verify Data)
          </h2>
          <div className="flex items-center mt-2 bg-white border border-gray-200 rounded-lg p-1 w-fit shadow-sm">
             <div className="bg-indigo-50 p-2 rounded-md mr-2"><Calendar className="w-4 h-4 text-indigo-600"/></div>
             <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="outline-none text-sm text-gray-700 bg-transparent cursor-pointer p-1"
             />
          </div>
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-600 font-medium mt-4 md:mt-0">
          รายการวันนี้: {displayData.length} รายการ
        </div>
      </div>
      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr className="text-gray-500 text-sm">
              <th className="p-4 text-left">วันที่</th>
              <th className="p-4 text-left">สถานี</th>
              <th className="p-4 text-left">ผู้ส่ง</th>
              <th className="p-4 text-left">สถานะ</th>
              <th className="p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="p-4 text-sm">{item.date}</td>
                <td className="p-4 text-sm font-bold text-blue-900">{item.stationName}</td>
                <td className="p-4 text-sm text-gray-600">
                  <span className="flex items-center bg-gray-100 px-2 py-1 rounded-md w-fit text-xs font-medium">
                    <User className="w-3 h-3 mr-1 text-gray-400"/> {item.createdBy || 'Unknown'}
                  </span>
                </td>
                <td className="p-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    item.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => handleEditClick(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition">
                    <Edit className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {displayData.length === 0 && (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400">ไม่พบข้อมูลของวันที่เลือก</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- บรรทัดนี้สำคัญที่สุด ห้ามลืมเด็ดขาด! ---
export default VerifyDataPage;