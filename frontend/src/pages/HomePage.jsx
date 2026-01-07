import React from 'react';
import { Map, CloudRain } from 'lucide-react';
import VideoMapComponent from '../components/VideoMapComponent';

const HomePage = ({ waterData }) => {
  // --- Logic เดิม: ดึงข้อมูลล่าสุดที่ได้รับการอนุมัติแล้ว (Approved) ของแต่ละสถานี ---
  const getLatestApprovedData = (data) => {
    const approved = data.filter(d => d.status === 'approved');
    const latestMap = {};
    
    approved.forEach(item => {
      const currentDate = new Date(item.updated_at || item.date).getTime();
      if (!latestMap[item.stationName]) {
        latestMap[item.stationName] = item;
      } else {
        const existingDate = new Date(latestMap[item.stationName].updated_at || latestMap[item.stationName].date).getTime();
        if (currentDate > existingDate) {
          latestMap[item.stationName] = item;
        }
      }
    });
    return Object.values(latestMap);
  };

  const latestData = getLatestApprovedData(waterData);

  return (
    <div className="container mx-auto p-4 space-y-6 animate-fade-in">
      {/* ส่วนแสดงแผนที่ (Interactive Carousel) */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gray-100 p-4 border-b flex justify-between items-center z-10 relative">
          <h2 className="font-bold text-gray-700 flex items-center">
            <Map className="w-5 h-5 mr-2 text-blue-600" /> แผนที่สถานการณ์น้ำ (Interactive Carousel)
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 hidden sm:inline">Active Stations: {latestData.length}</span>
          </div>
        </div>
        
        {/* ส่งข้อมูล latestData ไปแสดงเป็น Marker บนแผนที่ */}
        <VideoMapComponent mode="interactive" markers={latestData} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* รายการข้อมูลน้ำล่าสุด */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <h2 className="font-bold text-lg mb-4 flex items-center text-gray-800">
            <CloudRain className="w-6 h-6 mr-2 text-blue-500" /> ข้อมูลปริมาณน้ำล่าสุด
          </h2>
          <div className="space-y-3">
            {latestData.length > 0 ? (
              latestData.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition">
                  <span className="font-medium text-gray-700">{item.stationName}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-blue-600 font-bold">{item.waterLevel} ม.</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${parseFloat(item.percent) > 80 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {parseFloat(item.percent) > 80 ? 'วิกฤต' : 'ปกติ'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">ยังไม่มีข้อมูลที่อนุมัติในระบบ</p>
            )}
          </div>
        </div>

        {/* การ์ดสรุปภาพรวม */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-md p-6 text-white">
          <h2 className="font-bold text-lg mb-4">สรุปภาพรวมวันนี้</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-3xl font-bold">{latestData.length}</p>
              <p className="text-sm opacity-80">สถานีที่ออนไลน์</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-3xl font-bold">{latestData.filter(d => parseFloat(d.percent) > 80).length}</p>
              <p className="text-sm opacity-80">จุดเฝ้าระวัง</p>
            </div>
          </div>
          <p className="mt-4 text-sm opacity-75 text-center italic">ระบบฐานข้อมูล MySQL Real-time</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;