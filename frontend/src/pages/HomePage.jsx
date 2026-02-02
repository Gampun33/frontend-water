import React from 'react';
import { Map, CloudRain, Droplets, Info, TrendingUp, AlertCircle, Building2, Activity } from 'lucide-react';
import VideoMapComponent from '../components/VideoMapComponent';

const HomePage = ({ waterData, rainData = [], damData = [] }) => { 

  // --- Helper: Logic ดึงข้อมูลล่าสุด (Generic Use) ---
  const getLatestApprovedData = (data) => {
    if (!data) return [];
    const approved = data.filter(d => d.status === 'approved');
    const latestMap = {};
    approved.forEach(item => {
      const currentDate = new Date(item.updated_at || item.date).getTime();
      const name = item.stationName || item.station_name; 
      
      if (!latestMap[name] || currentDate > new Date(latestMap[name].updated_at || latestMap[name].date).getTime()) {
        latestMap[name] = { ...item, stationName: name }; 
      }
    });
    return Object.values(latestMap);
  };

  // 1. ดึงข้อมูลน้ำทั่วไป
  const latestWater = getLatestApprovedData(waterData);

  // 2. ดึงข้อมูลฝน (เรียงตามปริมาณมากสุด)
  const latestRain = getLatestApprovedData(rainData).sort((a, b) => b.rainAmount - a.rainAmount);

  // 3. ดึงข้อมูลเขื่อน
  const latestDam = getLatestApprovedData(damData);

  // กรองเฉพาะคนที่ฝนเกิน 50 มม.
  const heavyRainList = latestRain.filter(item => parseFloat(item.rainAmount) > 50);

  // --- คำนวณ Stats ---
  const totalRainToday = latestRain.reduce((sum, item) => sum + parseFloat(item.rainAmount || 0), 0);
  const totalDamStorage = latestDam.reduce((sum, item) => sum + parseFloat(item.currentStorage || item.current_storage || 0), 0);

  // 🟢 Helper Function: เลือกสีสำหรับระดับน้ำ (Water Level)
  const getWaterLevelColor = (level) => {
      const val = parseFloat(level);
      if (val > 100) return "text-red-600 font-black animate-pulse"; // วิกฤต
      if (val > 80) return "text-orange-500 font-bold";              // เฝ้าระวัง
      return "text-blue-600 font-bold";                              // ปกติ
  };

  // 🟢 Helper Function: เลือกสีสำหรับปริมาณฝน (Rain)
  const getRainColor = (amount) => {
      const val = parseFloat(amount);
      if (val > 90) return "text-red-600 font-black animate-pulse";  // หนักมาก
      if (val > 35) return "text-orange-500 font-bold";              // หนัก
      if (val > 10) return "text-green-600 font-bold";               // ปานกลาง
      return "text-cyan-600 font-bold";                              // เล็กน้อย
  };

  return (
    <div className="container mx-auto p-4 space-y-6 animate-fade-in">
      
      {/* ส่วนแสดงแผนที่ */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gray-100 p-4 border-b flex flex-wrap justify-between items-center z-10 relative gap-2">
          <h2 className="font-bold text-gray-700 flex items-center">
            <Map className="w-5 h-5 mr-2 text-blue-600" /> แผนที่สถานการณ์น้ำรวม
          </h2>
          <div className="flex items-center space-x-2 text-xs font-semibold overflow-x-auto">
            <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded whitespace-nowrap">น้ำ: {latestWater.length} จุด</span>
            <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-1 rounded whitespace-nowrap">เขื่อน: {latestDam.length} แห่ง</span>
            <span className="flex items-center text-cyan-600 bg-cyan-50 px-2 py-1 rounded whitespace-nowrap">ฝน: {latestRain.length} จุด</span>
          </div>
        </div>
        
        <VideoMapComponent 
            mode="interactive" 
            markers={[...latestWater, ...latestDam]} 
            rainMarkers={latestRain}
        />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 💧 1. รายการน้ำทั่วไป */}
        <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-blue-500">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center">
            <Droplets className="w-5 h-5 mr-2 text-blue-500" /> ระดับน้ำแม่น้ำ
          </h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {latestWater.length > 0 ? latestWater.slice(0, 8).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg text-sm hover:bg-blue-50 transition">
                <span className="font-medium text-gray-700 truncate mr-2 w-2/3">{item.stationName}</span>
                {/* 🟢 ใช้ getWaterLevelColor เลือกสี */}
                <span className={`${getWaterLevelColor(item.waterLevel)} shrink-0`}>
                    {Number(item.waterLevel).toFixed(2)} ม.
                </span>
              </div>
            )) : <p className="text-center text-gray-400 py-10 text-sm">ไม่พบข้อมูลน้ำ</p>}
          </div>
        </div>

        {/* 🏭 2. รายการน้ำในเขื่อน */}
        <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-indigo-600">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-indigo-600" /> ปริมาณน้ำเขื่อน
          </h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {latestDam.length > 0 ? latestDam.slice(0, 8).map((item, idx) => {
                const current = parseFloat(item.currentStorage || item.current_storage || 0);
                const capacity = parseFloat(item.capacity || 100);
                const percent = (current / capacity) * 100;
                
                return (
                  <div key={idx} className="p-2.5 bg-gray-50 rounded-lg text-sm hover:bg-indigo-50 transition">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700 truncate w-2/3">{item.stationName}</span>
                        {/* ถ้าเกิน 80% ให้เป็นสีแดง */}
                        <span className={`font-bold text-xs ${percent > 80 ? 'text-red-600' : 'text-indigo-600'}`}>
                            {percent.toFixed(1)}%
                        </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${percent > 80 ? 'bg-red-500 animate-pulse' : 'bg-indigo-500'}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                    </div>
                    <div className="text-[10px] text-gray-400 text-right mt-1">
                        {current.toFixed(2)} / {capacity.toFixed(0)} ล้าน ลบ.ม.
                    </div>
                  </div>
                );
            }) : <p className="text-center text-gray-400 py-10 text-sm">ไม่พบข้อมูลเขื่อน</p>}
          </div>
        </div>

        {/* 🌧️ 3. รายการฝน */}
        <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-cyan-500">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center">
            <CloudRain className="w-5 h-5 mr-2 text-cyan-500" /> ปริมาณฝนวันนี้
          </h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {latestRain.length > 0 ? latestRain.slice(0, 8).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg text-sm hover:bg-cyan-50 transition">
                <span className="font-medium text-gray-700 truncate mr-2 w-2/3">{item.stationName}</span>
                <div className="flex items-center shrink-0">
                  {/* 🟢 ใช้ getRainColor เลือกสี */}
                  <span className={`${getRainColor(item.rainAmount)} mr-1`}>
                    {Number(item.rainAmount).toFixed(1)}
                  </span>
                  <span className="text-[10px] text-gray-400">mm.</span>
                </div>
              </div>
            )) : <p className="text-center text-gray-400 py-10 text-sm">ไม่พบข้อมูลฝน</p>}
          </div>
        </div>

        {/* 📊 4. Dashboard Stats (สรุปภาพรวม) */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-700 to-blue-800 rounded-xl shadow-md p-5 text-white">
            <h3 className="text-sm font-semibold opacity-80 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" /> สรุปสถานการณ์รวม
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center border-r border-white/20">
                <p className="text-xl font-bold">{totalDamStorage.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-[10px] opacity-70">น้ำในเขื่อน (ล้าน ลบ.ม.)</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{totalRainToday.toFixed(1)}</p>
                <p className="text-[10px] opacity-70">ฝนรวมวันนี้ (มม.)</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-center">
                 <div className="text-xs opacity-70 mb-1">เขื่อนน้ำมาก (80%)</div>
                 <div className="text-lg font-bold text-red-200">
                    {latestDam.filter(d => {
                        const cap = parseFloat(d.capacity || 1);
                        const curr = parseFloat(d.currentStorage || d.current_storage || 0);
                        return (curr/cap)*100 > 80;
                    }).length} แห่ง
                 </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 mr-3 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">ประกาศเฝ้าระวัง ฝนตกหนัก มากกว่า 50mm.</p>
              
              {heavyRainList.length > 0 ? (
                <div className="mt-1">
                   <p className="text-xs font-bold text-amber-900 mb-1">
                      พบฝนตกหนัก {heavyRainList.length} พื้นที่:
                   </p>
                   <ul className="text-xs text-amber-800 space-y-1 max-h-[100px] overflow-y-auto">
                      {heavyRainList.map((item, index) => (
                        <li key={index} className="flex justify-between items-center bg-white/50 px-2 py-1 rounded">
                           <span>- {item.stationName}</span>
                           <span className="font-bold text-red-600">{Number(item.rainAmount).toFixed(1)} มม.</span>
                        </li>
                      ))}
                   </ul>
                </div>
              ) : (
                <p className="text-xs text-amber-700 mt-1">สถานการณ์ทั่วไปยังปกติ</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;