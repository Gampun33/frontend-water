import React from 'react';
import { Map, CloudRain, Droplets, Info, TrendingUp, AlertCircle } from 'lucide-react';
import VideoMapComponent from '../components/VideoMapComponent';

const HomePage = ({ waterData, rainData = [] }) => { // 🟢 รับ rainData เพิ่มเข้ามา

  // --- 💧 Logic ดึงข้อมูลน้ำล่าสุด (Approved) ---
  const getLatestApprovedData = (data) => {
    const approved = data.filter(d => d.status === 'approved');
    const latestMap = {};
    approved.forEach(item => {
      const currentDate = new Date(item.updated_at || item.date).getTime();
      if (!latestMap[item.stationName] || currentDate > new Date(latestMap[item.stationName].updated_at || latestMap[item.stationName].date).getTime()) {
        latestMap[item.stationName] = item;
      }
    });
    return Object.values(latestMap);
  };

  // --- 🌧️ Logic ดึงข้อมูลฝนล่าสุด (Approved) ---
  const getLatestRainData = (data) => {
    const approved = data.filter(d => d.status === 'approved');
    const latestMap = {};
    approved.forEach(item => {
      const currentDate = new Date(item.updated_at || item.date).getTime();
      if (!latestMap[item.stationName] || currentDate > new Date(latestMap[item.stationName].updated_at || latestMap[item.stationName].date).getTime()) {
        latestMap[item.stationName] = item;
      }
    });
    return Object.values(latestMap).sort((a, b) => b.rainAmount - a.rainAmount); // เรียงจากฝนตกหนักสุด
  };

  const latestWater = getLatestApprovedData(waterData);
  const latestRain = getLatestRainData(rainData);
  const totalRainToday = latestRain.reduce((sum, item) => sum + parseFloat(item.rainAmount || 0), 0);

  return (
    <div className="container mx-auto p-4 space-y-6 animate-fade-in">
      
      {/* 🟢 ส่วนแสดงแผนที่ (Interactive Carousel) */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gray-100 p-4 border-b flex justify-between items-center z-10 relative">
          <h2 className="font-bold text-gray-700 flex items-center">
            <Map className="w-5 h-5 mr-2 text-blue-600" /> แผนที่สถานการณ์น้ำและปริมาณฝน (Interactive)
          </h2>
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded">น้ำ: {latestWater.length} จุด</span>
            <span className="flex items-center text-cyan-600 bg-cyan-50 px-2 py-1 rounded">ฝน: {latestRain.length} จุด</span>
          </div>
        </div>
        <VideoMapComponent mode="interactive" markers={latestWater} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* 💧 1. รายการข้อมูลน้ำล่าสุด */}
        <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-blue-500">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center">
            <Droplets className="w-5 h-5 mr-2 text-blue-500" /> ระดับน้ำล่าสุด
          </h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {latestWater.length > 0 ? latestWater.slice(0, 10).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg text-sm">
                <span className="font-medium text-gray-700 truncate mr-2">{item.stationName}</span>
                <span className="text-blue-600 font-bold shrink-0">{item.waterLevel} ม.</span>
              </div>
            )) : <p className="text-center text-gray-400 py-10">ไม่พบข้อมูลน้ำ</p>}
          </div>
        </div>

        {/* 🌧️ 2. รายการข้อมูลฝนล่าสุด (Top Rain) */}
        <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-cyan-500">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center">
            <CloudRain className="w-5 h-5 mr-2 text-cyan-500" /> ปริมาณฝนวันนี้
          </h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {latestRain.length > 0 ? latestRain.slice(0, 10).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg text-sm">
                <span className="font-medium text-gray-700 truncate mr-2">{item.stationName}</span>
                <div className="flex items-center">
                  <span className="text-cyan-600 font-bold mr-1">{item.rainAmount}</span>
                  <span className="text-[10px] text-gray-400">mm.</span>
                </div>
              </div>
            )) : <p className="text-center text-gray-400 py-10">ไม่พบข้อมูลฝน</p>}
          </div>
        </div>

        {/* 📊 3. การ์ดสรุปภาพรวม (Dashboard Stats) */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md p-5 text-white">
            <h3 className="text-sm font-semibold opacity-80 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" /> สรุปสถานการณ์วันนี้
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center border-r border-white/20">
                <p className="text-2xl font-bold">{latestWater.filter(d => parseFloat(d.percent) > 80).length}</p>
                <p className="text-[10px] opacity-70">เขื่อนน้ำวิกฤต</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{totalRainToday.toFixed(1)}</p>
                <p className="text-[10px] opacity-70">ฝนรวม (มม.)</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 mr-3 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">ประกาศเฝ้าระวัง</p>
              <p className="text-xs text-amber-700 mt-1">
                {latestRain.length > 0 && latestRain[0].rainAmount > 50 
                  ? `พบฝนตกหนักบริเวณ ${latestRain[0].stationName} ควรเฝ้าระวังน้ำหลาก`
                  : 'สถานการณ์ทั่วไปยังปกติ ติดตามรายงานอย่างใกล้ชิด'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;