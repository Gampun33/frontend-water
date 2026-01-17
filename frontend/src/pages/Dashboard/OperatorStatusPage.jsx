import React, { useState } from 'react';
import { History, Calendar, Clock, Check, X, FileText } from 'lucide-react';
import { MysqlService } from '../../services/mysqlService';
import { getBangkokDate } from '../../utils/helpers';

const OperatorStatusPage = ({ user, waterData, refreshData }) => {
  const [selectedDate, setSelectedDate] = useState(getBangkokDate());

  const myReports = waterData.filter(item => 
    (item.createdBy === user.username || item.createdBy === user.fullName) &&
    getBangkokDate(item.updated_at || item.date) === selectedDate
  ).sort((a, b) => new Date(b.updated_at || b.date) - new Date(a.updated_at || a.date));

  const StatusBadge = ({ status }) => {
    switch(status) {
      case 'approved': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1"/>อนุมัติแล้ว</span>;
      case 'rejected': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><X className="w-3 h-3 mr-1"/>ถูกตีกลับ</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1"/>รอตรวจสอบ</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center"><History className="w-6 h-6 mr-3 text-indigo-600" /> ติดตามสถานะ</h2>
          <div className="flex items-center bg-white border rounded-lg p-1 shadow-sm mt-2 md:mt-0">
            <Calendar className="w-4 h-4 text-indigo-600 mx-2"/>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="outline-none text-sm p-1 cursor-pointer" />
          </div>
        </div>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">วัน-เวลา</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานี</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ระดับน้ำ (ม.)</th>
                {/* 🟢 เพิ่ม Header Inflow/Outflow */}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Inflow</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Outflow</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myReports.length > 0 ? myReports.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{new Date(item.updated_at || item.created_at).toLocaleTimeString('th-TH')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900">{item.stationName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono">{item.waterLevel}</td>
                  
                  {/* 🟢 แสดงค่า Inflow และ Outflow จากฐานข้อมูล */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-900">
                    {item.inflow ? parseFloat(item.inflow).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-900">
                    {item.outflow ? parseFloat(item.outflow).toLocaleString() : '-'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center"><StatusBadge status={item.status} /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    <FileText className="w-12 h-12 mb-3 mx-auto text-gray-300" />
                    <p>ไม่พบประวัติการส่งข้อมูล</p>
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