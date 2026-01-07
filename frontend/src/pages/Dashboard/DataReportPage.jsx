import React, { useState } from 'react';
import { Database, Map, Printer } from 'lucide-react';
import VideoMapComponent from '../../components/VideoMapComponent';

const DataReportPage = ({ waterData }) => {
  const [reportMode, setReportMode] = useState('table');
  const [fitToPage, setFitToPage] = useState(false);

  // --- 🟢 ส่วนที่เชื่อมข้อมูลจริง (หัวใจสำคัญ) ---
  const approvedData = waterData.filter(d => d.status === 'approved');

  // แปลงข้อมูลจริงให้มีหน้าตาเหมือน MOCK ที่ตารางน้องเรียกใช้
  const DATA_FROM_DATABASE = approvedData.map(item => ({
    id: item.id,
    type: 'item',
    name: item.stationName,
    tambon: item.tambon || '-',
    amphoe: item.amphoe || '-',
    province: item.province || '-',
    capacity: parseFloat(item.capacity || 0),
    min_cap: parseFloat(item.min_capacity || 0),
    current: parseFloat(item.current || 0),
    percent: parseFloat(item.percent || 0),
    inflow: parseFloat(item.inflow || 0),
    outflow: parseFloat(item.outflow || 0),
    usable: parseFloat(item.current || 0) - parseFloat(item.min_capacity || 0)
  }));

  // เพิ่ม Group Header เข้าไปข้างหน้า (เลียนแบบ Mock เดิม)
  const FINAL_DISPLAY_DATA = [
    { 
      id: 'group-real', 
      type: 'group_header', 
      name: 'ข้อมูลอ่างเก็บน้ำจากฐานข้อมูล (Real-time Database)', 
      capacity: DATA_FROM_DATABASE.reduce((acc, curr) => acc + curr.capacity, 0),
      min_cap: DATA_FROM_DATABASE.reduce((acc, curr) => acc + curr.min_cap, 0),
      current: DATA_FROM_DATABASE.reduce((acc, curr) => acc + curr.current, 0),
      percent: DATA_FROM_DATABASE.length > 0 ? (DATA_FROM_DATABASE.reduce((acc, curr) => acc + curr.current, 0) / DATA_FROM_DATABASE.reduce((acc, curr) => acc + curr.capacity, 0)) * 100 : 0,
      inflow: DATA_FROM_DATABASE.reduce((acc, curr) => acc + curr.inflow, 0),
      outflow: DATA_FROM_DATABASE.reduce((acc, curr) => acc + curr.outflow, 0),
      usable: DATA_FROM_DATABASE.reduce((acc, curr) => acc + curr.usable, 0),
      bg: 'bg-blue-900', 
      text: 'text-white' 
    },
    ...DATA_FROM_DATABASE
  ];

  const handlePrint = () => window.print();

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 animate-fade-in flex flex-col h-[calc(100vh-100px)] print:h-auto print:shadow-none print:p-0">
      <style>{`
        @media print {
          body, #root { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-fit-scale { transform: scale(0.5); transform-origin: top left; width: 200%; }
          .print-bg-teal-700 { background-color: #0f766e !important; }
          .print-bg-teal-800 { background-color: #115e59 !important; }
          .print-bg-blue-900 { background-color: #1e3a8a !important; }
          .print-text-white { color: white !important; }
        }
      `}</style>

      {/* --- Toolbar --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">รายงานสถานการณ์น้ำ (Detailed Status)</h2>
          <p className="text-sm text-gray-500">ข้อมูลจริง ณ วันที่ {new Date().toLocaleDateString('th-TH')}</p>
        </div>
        <div className="flex space-x-2 items-center">
          <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
            <button onClick={() => setReportMode('table')} className={`px-3 py-1.5 rounded-md text-sm transition ${reportMode === 'table' ? 'bg-white shadow text-teal-700' : 'text-gray-500'}`}>
              <Database className="w-4 h-4 mr-2 inline" /> ตาราง
            </button>
            <button onClick={() => setReportMode('map')} className={`px-3 py-1.5 rounded-md text-sm transition ${reportMode === 'map' ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}>
              <Map className="w-4 h-4 mr-2 inline" /> แผนที่
            </button>
          </div>
          <label className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <input type="checkbox" checked={fitToPage} onChange={(e) => setFitToPage(e.target.checked)} className="rounded text-teal-600" />
            <span>Fit Page</span>
          </label>
          <button onClick={handlePrint} className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm flex items-center shadow transition">
            <Printer className="w-4 h-4 mr-2" /> Print
          </button>
        </div>
      </div>
      
      {/* --- Print Header --- */}
      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-black">รายงานสถานการณ์น้ำ (HydroMonitor Report)</h1>
        <p className="text-sm text-gray-600">Generated from HydroMonitor System</p>
      </div>

      {/* --- Content Area --- */}
      <div className={`flex-1 overflow-auto border rounded-lg shadow-inner relative bg-gray-50 print:overflow-visible print:border-none print:shadow-none print:bg-white ${fitToPage ? 'print-fit-scale' : ''}`}>
        <div className="bg-white min-w-fit h-full print:w-full">
          {reportMode === 'table' && (
            <div className="p-4 bg-white print:p-0">
              <table className="w-full min-w-[1200px] print:min-w-0 border-collapse text-sm">
                <thead className="sticky top-0 z-20 shadow-md print:static print:shadow-none">
                  <tr className="bg-teal-700 print-bg-teal-700 text-white print-text-white text-center">
                    <th rowSpan="2" className="p-3 border-r border-teal-600 w-48 sticky left-0 bg-teal-700 print-bg-teal-700 z-30 print:static">อ่างเก็บน้ำ</th>
                    <th colSpan="3" className="p-2 border-r border-teal-600 border-b">ที่ตั้ง</th>
                    <th rowSpan="2" className="p-2 border-r border-teal-600 w-24">ความจุ<br/>(ล้าน ลบ.ม.)</th>
                    <th rowSpan="2" className="p-2 border-r border-teal-600 w-24">รนก.ต่ำสุด<br/>(ล้าน ลบ.ม.)</th>
                    <th colSpan="2" className="p-2 border-r border-teal-600 border-b">ปริมาณน้ำปัจจุบัน</th>
                    <th colSpan="2" className="p-2 border-r border-teal-600 border-b">การบริหารจัดการน้ำ (ล้าน ลบ.ม.)</th>
                    <th rowSpan="2" className="p-2 w-24">ปริมาณน้ำ<br/>ใช้การได้</th>
                  </tr>
                  <tr className="bg-teal-800 print-bg-teal-800 text-white print-text-white text-xs text-center">
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
                  {/* เปลี่ยนมาใช้ FINAL_DISPLAY_DATA ที่รวมข้อมูลจริงและ Header แล้ว */}
                  {FINAL_DISPLAY_DATA.map((row) => {
                    if (row.type === 'group_header') {
                      return (
                        <tr key={row.id} className={`${row.bg} print-bg-blue-900 ${row.text} print-text-white font-bold`}>
                          <td colSpan="4" className="p-3 text-left sticky left-0 z-10 bg-inherit border-r border-white/20 print:static">{row.name}</td>
                          <td className="p-3 text-right">{row.capacity.toFixed(3)}</td>
                          <td className="p-3 text-right">{row.min_cap.toFixed(3)}</td>
                          <td className="p-3 text-right">{row.current.toFixed(3)}</td>
                          <td className={`p-3 text-center ${row.percent > 100 ? 'bg-red-500/20 text-red-200' : ''}`}>{row.percent.toFixed(2)}%</td>
                          <td className="p-3 text-right">{row.inflow.toFixed(3)}</td>
                          <td className="p-3 text-right">{row.outflow.toFixed(3)}</td>
                          <td className="p-3 text-right">{row.usable.toFixed(3)}</td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                        <td className="p-3 font-medium text-gray-900 border-r sticky left-0 bg-white hover:bg-blue-50 z-10 drop-shadow-sm whitespace-nowrap print:static print:shadow-none">{row.name}</td>
                        <td className="p-2 text-gray-500 text-center text-xs">{row.tambon}</td>
                        <td className="p-2 text-gray-500 text-center text-xs">{row.amphoe}</td>
                        <td className="p-2 text-gray-500 text-center text-xs">{row.province}</td>
                        <td className="p-2 text-right border-l font-mono text-gray-700">{row.capacity.toFixed(3)}</td>
                        <td className="p-2 text-right font-mono text-gray-400 text-xs">{row.min_cap.toFixed(3)}</td>
                        <td className="p-2 text-right font-mono font-medium text-blue-700 border-l">{row.current.toFixed(3)}</td>
                        <td className="p-2 text-center border-r">
                          <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold w-16 ${row.percent > 100 ? 'bg-blue-600 text-white' : 'bg-green-100 text-green-700'}`}>
                            {row.percent.toFixed(2)}%
                          </div>
                        </td>
                        <td className="p-2 text-right font-mono border-r">{row.inflow.toFixed(3)}</td>
                        <td className="p-2 text-right font-mono border-r">{row.outflow.toFixed(3)}</td>
                        <td className="p-2 text-right font-mono font-semibold text-gray-800">{row.usable.toFixed(3)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {reportMode === 'map' && (
            <div className="flex flex-col items-center justify-center p-8 bg-white print:p-0 print:block">
              <VideoMapComponent mode="report" markers={approvedData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataReportPage;