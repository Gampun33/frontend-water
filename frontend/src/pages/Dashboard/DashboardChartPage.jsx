import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ReferenceLine, AreaChart, Area
} from 'recharts';
import { CloudRain, Droplets, Activity, MapPin, CalendarClock, Building2 } from 'lucide-react';

// --- Helper: Logic ดึงข้อมูลล่าสุด (เหมือนหน้า Home) ---
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

// Component Tooltip สวยๆ
const CustomTooltip = ({ active, payload, label, unit = "" }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-xs z-50">
        <p className="font-bold text-slate-700 mb-1">{data.fullStationName || data.name}</p>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill || payload[0].stroke }}></span>
            <span className="text-slate-500">{payload[0].name}:</span>
            <span className="font-mono font-bold text-slate-800">
                {Number(payload[0].value).toFixed(2)} {unit}
            </span>
        </div>
        {/* แสดงรายละเอียดเพิ่มเติมถ้ามี */}
        {data.capacity && (
            <p className="text-[10px] text-slate-400 mt-1">
                ความจุ: {Number(data.capacity).toLocaleString()} ล้าน ลบ.ม.
            </p>
        )}
      </div>
    );
  }
  return null;
};

const DashboardChartPage = ({ waterData = [], rainData = [], damData = [] }) => {

  // 1. เตรียมข้อมูล: กรองเอาเฉพาะล่าสุด
  const latestRain = useMemo(() => getLatestApprovedData(rainData), [rainData]);
  const latestDam = useMemo(() => getLatestApprovedData(damData), [damData]);
  const latestWater = useMemo(() => getLatestApprovedData(waterData), [waterData]);

  // --- 2. Data for Rain Chart (Bar) ---
  const rainChartData = useMemo(() => {
    return latestRain
      .map(item => {
        const rawName = item.stationName || "";
        const shortName = rawName.replace('อำเภอ', '').replace('ลำปาง', '').replace('ต.', '').trim();
        const amount = parseFloat(item.rainAmount || 0);
        
        // สีตามเกณฑ์ฝน
        let barColor = "#3b82f6"; // ฟ้า (เล็กน้อย)
        if (amount > 10) barColor = "#10b981"; // เขียว (ปานกลาง)
        if (amount > 35) barColor = "#f59e0b"; // ส้ม (หนัก)
        if (amount > 90) barColor = "#ef4444"; // แดง (หนักมาก)

        return {
          name: shortName,
          rain: amount,
          fullStationName: rawName,
          color: barColor
        };
      })
      .sort((a, b) => b.rain - a.rain) // เรียงมากไปน้อย
      .slice(0, 10); // เอาแค่ Top 10
  }, [latestRain]);

  // --- 3. Data for Dam Chart (Pie) ---
  const damChartData = useMemo(() => {
    return latestDam.map(item => {
      const rawName = item.stationName || "ไม่ระบุ";
      const shortName = rawName.replace('เขื่อน', '').replace('อ่างเก็บน้ำ', '').trim();
      const current = parseFloat(item.currentStorage || item.current_storage || 0);
      const capacity = parseFloat(item.capacity || 100);
      const percent = (current / capacity) * 100;

      // สีตามเกณฑ์เขื่อน
      let cellColor = "#f59e0b"; // ส้ม (<30% น้อย)
      if (percent >= 30) cellColor = "#10b981"; // เขียว (ปกติ)
      if (percent >= 50) cellColor = "#3b82f6"; // ฟ้า (ดี)
      if (percent >= 80) cellColor = "#ef4444"; // แดง (วิกฤต/ล้น)

      return {
        name: shortName,
        fullStationName: rawName,
        value: percent,
        capacity: capacity,
        current: current,
        color: cellColor
      };
    }).sort((a, b) => b.value - a.value); // เรียง % เยอะสุดขึ้นก่อน
  }, [latestDam]);

  // --- 4. Data for Water Level (Area) ---
  const waterLevelData = useMemo(() => {
      return latestWater.map(item => ({
          name: item.stationName.replace("สถานี", "").trim(),
          fullStationName: item.stationName,
          level: parseFloat(item.waterLevel || 0)
      })).slice(0, 10);
  }, [latestWater]);

  // --- Stat Calculations ---
  const avgDamLevel = latestDam.length > 0 
    ? (latestDam.reduce((acc, curr) => {
        const cap = parseFloat(curr.capacity || 1);
        const cur = parseFloat(curr.currentStorage || curr.current_storage || 0);
        return acc + ((cur/cap)*100);
      }, 0) / latestDam.length).toFixed(1)
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
           <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 animate-pulse">
             <span className="w-2 h-2 bg-green-500 rounded-full"></span> Live
           </span>
        </div>
      </div>

      {/* 🟢 Section 2: Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 📊 Graph 1: Bar Chart (Rain) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="mb-6 flex justify-between items-start">
            <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <CloudRain size={20} className="text-cyan-500" /> 
                10 อันดับปริมาณฝนสูงสุด
                </h3>
                <p className="text-xs text-slate-500">หน่วย: มิลลิเมตร (mm.) | สีแดง = วิกฤต (&gt;90 มม.)</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rainChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip unit="mm." />} cursor={{ fill: '#f8fafc' }} />
                
                <ReferenceLine y={35} stroke="#f59e0b" strokeDasharray="3 3" />
                <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" />

                <Bar dataKey="rain" name="ปริมาณฝน" radius={[6, 6, 0, 0]} animationDuration={1000}>
                    {rainChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🍰 Graph 2: Pie Chart (Dam) - ใช้ damData */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Building2 size={20} className="text-indigo-500" /> 
              สัดส่วนน้ำในเขื่อน (% ความจุ)
            </h3>
            <p className="text-xs text-slate-500">สีแดง = น้ำมาก (&gt;80%) | สีส้ม = น้ำน้อย (&lt;30%)</p>
          </div>

          <div className="flex-1 min-h-[300px] relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-sm text-slate-400 font-medium">เฉลี่ยรวม</p>
                <p className={`text-4xl font-extrabold ${avgDamLevel > 80 ? 'text-red-500' : 'text-slate-800'}`}>{avgDamLevel}%</p>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={damChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {damChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
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

        {/* 🌊 Graph 3: Area Chart (Water Level) - เพิ่มใหม่สำหรับแม่น้ำ */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:col-span-2">
            <div className="mb-6">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Droplets size={20} className="text-blue-500" /> 
                ระดับน้ำท่า (River Levels)
                </h3>
                <p className="text-xs text-slate-500">เปรียบเทียบระดับน้ำในแม่น้ำสายหลัก (เมตร รทก.)</p>
            </div>
            <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={waterLevelData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <Tooltip content={<CustomTooltip unit="ม." />} />
                        <Area type="monotone" dataKey="level" name="ระดับน้ำ" stroke="#2563eb" fillOpacity={1} fill="url(#colorLevel)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardChartPage;
