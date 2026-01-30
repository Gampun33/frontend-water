import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ReferenceLine
} from 'recharts';
import { CloudRain, Droplets, AlertTriangle, Activity, MapPin, CalendarClock } from 'lucide-react';

// --- Configuration ---
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const RADIAN = Math.PI / 180;

// Component Tooltip สวยๆ (Custom Tooltip)
const CustomTooltip = ({ active, payload, label, unit = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-sm">
        <p className="font-bold text-slate-700 mb-1">{label}</p>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill || payload[0].color }}></span>
            <span className="text-slate-500">{payload[0].name}:</span>
            <span className="font-mono font-bold text-slate-800">
                {Number(payload[0].value).toFixed(2)} {unit}
            </span>
        </div>
        {payload[0].payload.fullStationName && (
            <p className="text-[10px] text-slate-400 mt-2 border-t pt-1">
                📍 {payload[0].payload.fullStationName}
            </p>
        )}
      </div>
    );
  }
  return null;
};

const DashboardChartPage = ({ waterData = [], rainData = [] }) => {

  // --- 1. Data Processing for Rain Chart (Dynamic Colors) ---
  const rainChartData = useMemo(() => {
    return rainData
      .map(item => {
        const rawName = item.stationName || "";
        const shortName = rawName.replace('อำเภอ', '').replace('ลำปาง', '').replace('ต.', '').trim();
        const amount = parseFloat(item.rainAmount || 0);
        
        // กำหนดสีตามความรุนแรง
        let barColor = "#10b981"; // ปกติ (เขียว)
        if (amount > 35 && amount <= 90) barColor = "#f59e0b"; // ปานกลาง (ส้ม)
        if (amount > 90) barColor = "#ef4444"; // หนัก (แดง)

        return {
          name: shortName,
          rain: amount,
          fullStationName: rawName,
          color: barColor
        };
      })
      .sort((a, b) => b.rain - a.rain)
      .slice(0, 10);
  }, [rainData]);

  // --- 2. Data Processing for Dam Chart ---
  const damChartData = useMemo(() => {
    return waterData.map(item => {
      const rawName = item.stationName || "ไม่ระบุ";
      const shortName = rawName.replace('เขื่อน', '').replace('อ่างเก็บน้ำ', '').trim();
      return {
        name: shortName,
        value: parseFloat(item.percent || 0),
        capacity: parseFloat(item.capacity || 0),
        current: parseFloat(item.current || 0)
      };
    }).sort((a, b) => b.value - a.value); // เรียงจากเปอร์เซ็นต์เยอะสุด
  }, [waterData]);

  // --- 3. Stat Calculations ---
  const heavyRainCount = rainData.filter(d => parseFloat(d.rainAmount) > 35).length;
  const criticalRainCount = rainData.filter(d => parseFloat(d.rainAmount) > 90).length;
  
  const avgDamLevel = waterData.length > 0 
    ? (waterData.reduce((acc, curr) => acc + (parseFloat(curr.percent) || 0), 0) / waterData.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* 🟢 Header Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-600 w-6 h-6" /> 
            Dashboard สรุปสถานการณ์น้ำ
          </h2>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
            <MapPin size={14} /> จังหวัดลำปาง (Lampang Province)
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right">
             <p className="text-[10px] text-slate-400 uppercase font-bold">Last Update</p>
             <p className="text-xs font-medium text-slate-600 flex items-center gap-1 justify-end">
                <CalendarClock size={12} /> {new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit'})}
             </p>
           </div>
           <span className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></span>
           <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 animate-pulse">
             <span className="w-2 h-2 bg-green-500 rounded-full"></span> Live
           </span>
        </div>
      </div>

      {/* 🟢 Section 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: จุดตรวจฝน */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CloudRain size={80} className="text-blue-600" />
          </div>
          <div className="flex items-start justify-between relative z-10">
             <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">จุดตรวจวัดฝน (Stations)</p>
                <h3 className="text-3xl font-extrabold text-slate-800">{rainData.length}</h3>
                <p className="text-xs text-slate-400 mt-1">ครอบคลุมทั้งจังหวัด</p>
             </div>
          </div>
        </div>

        {/* Card 2: พื้นที่เตือนภัย */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle size={80} className={heavyRainCount > 0 ? "text-orange-500" : "text-green-500"} />
          </div>
          <div className="flex items-start justify-between relative z-10">
             <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">จุดเฝ้าระวังน้ำหลาก</p>
                <div className="flex items-baseline gap-2">
                    <h3 className={`text-3xl font-extrabold ${heavyRainCount > 0 ? "text-orange-500" : "text-green-600"}`}>
                        {heavyRainCount}
                    </h3>
                    {criticalRainCount > 0 && (
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                           วิกฤต {criticalRainCount}
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                    {heavyRainCount > 0 ? "พบปริมาณฝนสะสมสูง > 35มม." : "สถานการณ์ปกติ"}
                </p>
             </div>
          </div>
        </div>

        {/* Card 3: ปริมาณน้ำรวม */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Droplets size={80} className="text-cyan-600" />
          </div>
          <div className="flex items-start justify-between relative z-10">
             <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">ปริมาณน้ำในเขื่อนเฉลี่ย</p>
                <h3 className="text-3xl font-extrabold text-cyan-700">{avgDamLevel}%</h3>
                <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(avgDamLevel, 100)}%` }}></div>
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* 🟢 Section 2: Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 📊 Graph 1: Bar Chart (Rain) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <CloudRain size={20} className="text-blue-500" /> 
              10 อันดับปริมาณฝนสูงสุด
            </h3>
            <p className="text-xs text-slate-500">หน่วย: มิลลิเมตร (mm.) | สีแท่งกราฟบ่งบอกระดับความรุนแรง</p>
          </div>
          
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rainChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip unit="mm." />} cursor={{ fill: '#f8fafc' }} />
                
                {/* เส้นเตือนภัย */}
                <ReferenceLine y={35} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'right', value: 'เฝ้าระวัง (35)', fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'วิกฤต (90)', fill: '#ef4444', fontSize: 10 }} />

                <Bar dataKey="rain" radius={[6, 6, 0, 0]} animationDuration={1000}>
                    {rainChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🍰 Graph 2: Donut Chart (Dam) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Droplets size={20} className="text-cyan-500" /> 
              สัดส่วนน้ำในอ่างเก็บน้ำ (%)
            </h3>
            <p className="text-xs text-slate-500">เทียบปริมาณน้ำปัจจุบันกับความจุอ่าง</p>
          </div>

          <div className="flex-1 min-h-[350px] relative">
            {/* ตัวเลขตรงกลางโดนัท */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-sm text-slate-400 font-medium">เฉลี่ยรวม</p>
                <p className="text-4xl font-extrabold text-slate-800">{avgDamLevel}%</p>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={damChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80} // รูกว้างขึ้นให้ดูโมเดิร์น
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {damChartData.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={entry.value > 80 ? '#3b82f6' : entry.value > 50 ? '#10b981' : '#f59e0b'} 
                        stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardChartPage;