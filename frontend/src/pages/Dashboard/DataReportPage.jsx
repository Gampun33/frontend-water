import React, { useState, useMemo } from "react";
import { Database, Map, Printer, Droplets, Building2, CloudRain, ArrowUp, ArrowDown, Minus, Info, Calendar } from "lucide-react"; // 🟢 เพิ่ม Calendar
import VideoMapComponent from "../../components/VideoMapComponent";

const DataReportPage = ({ waterData = [], rainData = [], damData = [] }) => {
  const [reportMode, setReportMode] = useState("table");
  const [fitToPage, setFitToPage] = useState(false);
  
  // 🟢 1. State สำหรับเลือกวันที่ (Default คือวันนี้)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // ฟังก์ชันเลือกสีตามช่วงเปอร์เซ็นต์
  const getPercentColor = (percent) => {
    const val = parseFloat(percent || 0);
    if (val > 100) return "bg-red-600 text-white shadow-md ";
    if (val >= 80) return "bg-blue-600 text-white";
    if (val >= 50) return "bg-green-100 text-green-700";
    if (val >= 30) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  // Component แสดงไอคอน Trend
  const TrendIcon = ({ diff }) => {
    const val = parseFloat(diff);
    if (isNaN(val) || val === 0) return <Minus className="w-3 h-3 text-gray-300 inline ml-1" />;
    
    if (val > 0) return (
      <span className="inline-flex items-center ml-1 text-[10px] text-green-600 font-bold bg-green-50 px-1 rounded-full" title={`เพิ่มขึ้น ${val.toFixed(2)}`}>
        <ArrowUp className="w-3 h-3 mr-0.5" />{Math.abs(val).toFixed(1)}
      </span>
    );

    return (
      <span className="inline-flex items-center ml-1 text-[10px] text-orange-600 font-bold bg-orange-50 px-1 rounded-full" title={`ลดลง ${val.toFixed(2)}`}>
        <ArrowDown className="w-3 h-3 mr-0.5" />{Math.abs(val).toFixed(1)}
      </span>
    );
  };

  // Component คำอธิบายสี (Legend)
  const LegendBar = () => (
    <div className="flex flex-wrap gap-2 items-center justify-end mb-4 text-xs text-gray-600 print:mb-2 print:text-[10px]">
      <span className="font-bold mr-2 flex items-center"><Info className="w-3 h-3 mr-1" /> เกณฑ์ปริมาณน้ำ:</span>
      <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-red-600 "></span><span>&gt;100% (ล้น)</span></div>
      <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-blue-600"></span><span>80-100% (มาก)</span></div>
      <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-green-500"></span><span>50-79% (ปกติ)</span></div>
      <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-yellow-400"></span><span>30-49% (น้อย)</span></div>
      <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-red-400"></span><span>&lt;30% (วิกฤต)</span></div>
    </div>
  );

  // --- Logic การคำนวณข้อมูล ---
  const { FINAL_DISPLAY_DATA, allMarkers } = useMemo(() => {
    
    const processDataGroup = (data, title, headerBgColor, type = 'general') => {
      const approved = data.filter((d) => d.status === "approved");

      // Group by station name
      const stationGroups = {};
      approved.forEach(item => {
        const name = item.stationName || item.station_name;
        if (!stationGroups[name]) stationGroups[name] = [];
        stationGroups[name].push(item);
      });

      // 🟢 Logic ใหม่: หาข้อมูลตามวันที่เลือก (selectedDate)
      const list = Object.values(stationGroups).map(group => {
        // เรียงวันที่ล่าสุดมาก่อน
        group.sort((a, b) => new Date(b.date || b.updated_at) - new Date(a.date || a.updated_at));
        
        // หา Index ของข้อมูลที่ตรงกับวันที่เลือก
        const targetIndex = group.findIndex(item => {
            // ตัดเวลาออกเทียบเฉพาะ YYYY-MM-DD
            const itemDate = (item.date || item.updated_at || "").split('T')[0];
            return itemDate === selectedDate;
        });

        // ถ้าไม่เจอข้อมูลของวันนั้น ให้ข้าม (return null)
        if (targetIndex === -1) return null;

        const latest = group[targetIndex];
        // ข้อมูลก่อนหน้า คือตัวถัดไปใน Array (index + 1)
        const previous = group[targetIndex + 1] || null; 

        return { latest, previous };
      }).filter(item => item !== null); // กรองเอาเฉพาะที่มีข้อมูล

      const items = list.map(({ latest, previous }) => {
        const item = latest;
        let diff = 0;
        if (type === 'rain') {
            const curVal = parseFloat(item.rainAmount || 0);
            const prevVal = parseFloat(previous?.rainAmount || 0);
            diff = curVal - prevVal;
        } else {
            const curVal = parseFloat(item.currentStorage || item.current_volume || item.waterLevel || 0);
            const prevVal = parseFloat(previous?.currentStorage || previous?.current_volume || previous?.waterLevel || curVal);
            diff = curVal - prevVal;
        }

        if (type === 'rain') {
            return {
                ...item,
                id: item.id,
                type: "item",
                groupType: 'rain',
                name: item.stationName,
                rainAmount: parseFloat(item.rainAmount || 0),
                diff: diff
            };
        }

        const cap = parseFloat(item.capacity || 0);
        const minCap = parseFloat(item.min_capacity || 0);
        const current = parseFloat(item.currentStorage || item.current_volume || item.waterLevel || 0);
        let usable = parseFloat(item.usableStorage || item.usable_storage || 0);
        if (usable === 0 && current > 0) usable = current - minCap;

        return {
          ...item,
          id: item.id,
          type: "item",
          groupType: 'general',
          name: item.stationName,
          capacity: cap,
          min_cap: minCap,
          current: current,
          percent: cap > 0 ? (current / cap) * 100 : 0,
          inflow: parseFloat(item.inflow || 0),
          outflow: parseFloat(item.outflow || 0),
          usable: usable,
          diff: diff
        };
      });

      // Calculate Totals (เฉพาะรายการที่แสดงผล)
      let totals = {};
      if (type === 'rain') {
          totals = items.reduce((acc, curr) => ({
            rainAmount: acc.rainAmount + curr.rainAmount
          }), { rainAmount: 0 });
      } else {
          totals = items.reduce((acc, curr) => ({
            capacity: acc.capacity + curr.capacity,
            min_cap: acc.min_cap + curr.min_cap,
            current: acc.current + curr.current,
            inflow: acc.inflow + curr.inflow,
            outflow: acc.outflow + curr.outflow,
            usable: acc.usable + curr.usable,
          }), { capacity: 0, min_cap: 0, current: 0, inflow: 0, outflow: 0, usable: 0 });
      }

      const headerRow = {
        id: `group-${title}`,
        type: "group_header",
        groupType: type,
        name: title,
        ...totals,
        percent: (type !== 'rain' && totals.capacity > 0) ? (totals.current / totals.capacity) * 100 : 0,
        bg: headerBgColor,
        text: "text-white",
      };

      return { header: headerRow, items: items };
    };

    const damGroup = processDataGroup(damData, "1. ข้อมูลอ่างเก็บน้ำ/เขื่อน (Dam Storage)", "bg-indigo-900");
    const waterGroup = processDataGroup(waterData, "2. ข้อมูลน้ำท่า (River Stations)", "bg-teal-700");
    const rainGroup = processDataGroup(rainData, "3. ข้อมูลปริมาณน้ำฝน (Rain Stations)", "bg-cyan-700", "rain");

    const displayList = [];
    if (damGroup.items.length > 0) displayList.push(damGroup.header, ...damGroup.items);
    if (waterGroup.items.length > 0) displayList.push(waterGroup.header, ...waterGroup.items);
    if (rainGroup.items.length > 0) displayList.push(rainGroup.header, ...rainGroup.items);

    return {
      FINAL_DISPLAY_DATA: displayList,
      allMarkers: [...damGroup.items, ...waterGroup.items],
      rainMarkers: rainGroup.items
    };
  }, [waterData, damData, rainData, selectedDate]); // 🟢 เพิ่ม selectedDate ใน dependency

  const handlePrint = () => window.print();

  // Helper แปลงวันที่เป็นไทย
  const formatThaiDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', { 
          year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' 
      });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 animate-fade-in flex flex-col h-[calc(100vh-100px)] print:h-auto print:shadow-none print:p-0 print:m-0 print:overflow-visible">
      
      {/* CSS Print Fix */}
      <style>{`
        @media print {
          *, *::before, *::after { animation: none !important; transition: none !important; transform: none !important; opacity: 1 !important; }
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; background: white; z-index: 9999; }
          .print-bg-teal-700 { background-color: #0f766e !important; -webkit-print-color-adjust: exact; }
          .print-bg-indigo-900 { background-color: #312e81 !important; -webkit-print-color-adjust: exact; }
          .print-bg-cyan-700 { background-color: #0e7490 !important; -webkit-print-color-adjust: exact; }
          .print-text-white { color: white !important; }
          ::-webkit-scrollbar { display: none; }
          @page { size: auto; margin: 10mm; }
          ${fitToPage ? `#printable-area { transform: scale(0.7) !important; transform-origin: top left !important; width: 142% !important; }` : ''}
        }
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">รายงานสถานการณ์น้ำ</h2>
          {/* แสดงวันที่ที่เลือก */}
          <p className="text-sm text-gray-500 font-medium">
             ประจำ{formatThaiDate(selectedDate)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          
          {/* 🟢 Date Picker */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1.5 shadow-sm hover:border-teal-500 transition-colors">
             <Calendar className="w-4 h-4 text-teal-600 mr-2" />
             <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="text-sm text-gray-700 outline-none bg-transparent font-medium cursor-pointer"
             />
          </div>

          <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
            <button onClick={() => setReportMode("table")} className={`px-3 py-1.5 rounded-md text-sm transition ${reportMode === "table" ? "bg-white shadow text-teal-700 font-bold" : "text-gray-500"}`}>
              <Database className="w-4 h-4 mr-2 inline" /> ตาราง
            </button>
            <button onClick={() => setReportMode("map")} className={`px-3 py-1.5 rounded-md text-sm transition ${reportMode === "map" ? "bg-white shadow text-indigo-700 font-bold" : "text-gray-500"}`}>
              <Map className="w-4 h-4 mr-2 inline" /> แผนที่
            </button>
          </div>
          
          <label className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100">
            <input type="checkbox" checked={fitToPage} onChange={(e) => setFitToPage(e.target.checked)} className="rounded text-teal-600 cursor-pointer" />
            <span>Fit Page</span>
          </label>
          
          <button onClick={handlePrint} className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm flex items-center shadow transition font-bold">
            <Printer className="w-4 h-4 mr-2" /> Print
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto border rounded-lg shadow-inner relative bg-gray-50 print:overflow-visible print:border-none print:shadow-none print:bg-white print:h-auto print:m-0">
        <div id="printable-area" className="bg-white min-w-fit h-full print:w-full print:h-auto">
          
          {reportMode === "table" && (
            <div className="p-4 bg-white print:p-0">
              
              {/* Header สำหรับตอนปริ้น */}
              <div className="hidden print:block mb-4 text-center border-b pb-4">
                  <h1 className="text-2xl font-bold text-gray-800">รายงานสถานการณ์น้ำและเขื่อน</h1>
                  <p className="text-sm text-gray-500">
                    ข้อมูลประจำ{formatThaiDate(selectedDate)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 text-right">พิมพ์เมื่อ: {new Date().toLocaleString('th-TH')}</p>
              </div>

              <LegendBar />

              <table className="w-full min-w-[1200px] print:min-w-0 border-collapse text-sm">
                <thead className="sticky top-0 z-20 shadow-md print:static print:shadow-none">
                  <tr className="bg-gray-800 text-white text-center">
                    <th rowSpan="2" className="p-3 border-r border-gray-600 w-48 sticky left-0 bg-gray-800 z-30 print:static">สถานี / อ่างเก็บน้ำ</th>
                    <th colSpan="3" className="p-2 border-r border-gray-600 border-b">ที่ตั้ง</th>
                    <th rowSpan="2" className="p-2 border-r border-gray-600 w-24">ความจุ<br />(ล้าน ลบ.ม.)</th>
                    <th rowSpan="2" className="p-2 border-r border-gray-600 w-24">รนก.ต่ำสุด<br />(ล้าน ลบ.ม.)</th>
                    <th colSpan="2" className="p-2 border-r border-gray-600 border-b">ปริมาณน้ำปัจจุบัน</th>
                    <th colSpan="2" className="p-2 border-r border-gray-600 border-b">การบริหารจัดการน้ำ (ล้าน ลบ.ม.)</th>
                    <th rowSpan="2" className="p-2 w-24">ปริมาณน้ำ<br />ใช้การได้</th>
                  </tr>
                  <tr className="bg-gray-700 text-white text-xs text-center">
                    <th className="p-2 w-24 border-r border-gray-600">ตำบล</th>
                    <th className="p-2 w-24 border-r border-gray-600">อำเภอ</th>
                    <th className="p-2 w-24 border-r border-gray-600">จังหวัด</th>
                    <th className="p-2 w-24 border-r border-gray-600">จำนวน / ฝน(มม.)</th>
                    <th className="p-2 w-20 border-r border-gray-600">% ความจุ</th>
                    <th className="p-2 w-24 border-r border-gray-600">น้ำไหลเข้า</th>
                    <th className="p-2 w-24 border-r border-gray-600">ระบายออก</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {FINAL_DISPLAY_DATA.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="p-16 text-center text-gray-400">
                            <div className="flex flex-col items-center">
                                <Database className="w-10 h-10 mb-2 opacity-50"/>
                                <span className="font-bold">ไม่พบข้อมูลรายงานในวันที่เลือก</span>
                                <span className="text-xs mt-1">({formatThaiDate(selectedDate)})</span>
                            </div>
                        </td>
                      </tr>
                  ) : (
                    FINAL_DISPLAY_DATA.map((row) => {
                      
                      // 1. กรณีเป็น Header กลุ่ม
                      if (row.type === "group_header") {
                        let bgClass = 'print-bg-teal-700'; 
                        if (row.bg === 'bg-indigo-900') bgClass = 'print-bg-indigo-900';
                        if (row.bg === 'bg-cyan-700') bgClass = 'print-bg-cyan-700';

                        return (
                          <tr key={row.id} className={`${row.bg} ${bgClass} ${row.text} print-text-white font-bold`}>
                            <td colSpan="4" className="p-3 text-left sticky left-0 z-10 bg-inherit border-r border-white/20 print:static">{row.name}</td>
                            
                            {row.groupType === 'rain' ? (
                                <>
                                    <td className="p-3 text-right">-</td>
                                    <td className="p-3 text-right">-</td>
                                    <td className="p-3 text-right bg-white/20 text-white font-extrabold">{Number(row.rainAmount || 0).toFixed(2)}</td>
                                    <td className="p-3 text-center">-</td>
                                    <td className="p-3 text-right">-</td>
                                    <td className="p-3 text-right">-</td>
                                    <td className="p-3 text-right">-</td>
                                </>
                            ) : (
                                <>
                                    <td className="p-3 text-right">{Number(row.capacity || 0).toFixed(3)}</td>
                                    <td className="p-3 text-right">{Number(row.min_cap || 0).toFixed(3)}</td>
                                    <td className="p-3 text-right">{Number(row.current || 0).toFixed(3)}</td>
                                    <td className={`p-3 text-center ${row.percent > 100 ? "bg-red-500/20 text-red-200" : ""}`}>{Number(row.percent || 0).toFixed(2)}%</td>
                                    <td className="p-3 text-right">{Number(row.inflow || 0).toFixed(3)}</td>
                                    <td className="p-3 text-right">{Number(row.outflow || 0).toFixed(3)}</td>
                                    <td className="p-3 text-right">{Number(row.usable || 0).toFixed(3)}</td>
                                </>
                            )}
                          </tr>
                        );
                      }
                      
                      // 2. กรณีเป็น Item ย่อย
                      return (
                        <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                          <td className="p-3 font-medium text-gray-900 border-r sticky left-0 bg-white hover:bg-blue-50 z-10 drop-shadow-sm whitespace-nowrap print:static print:shadow-none">{row.name}</td>
                          <td className="p-2 text-gray-500 text-center text-xs">{row.tambon || '-'}</td>
                          <td className="p-2 text-gray-500 text-center text-xs">{row.amphoe || '-'}</td>
                          <td className="p-2 text-gray-500 text-center text-xs">{row.province || '-'}</td>
                          
                          {row.groupType === 'rain' ? (
                              <>
                                <td className="p-2 text-center border-l font-mono text-gray-400">-</td>
                                <td className="p-2 text-center font-mono text-gray-400 text-xs">-</td>
                                {/* ช่องปริมาณฝน */}
                                <td className="p-2 text-right font-mono font-bold text-cyan-600 border-l whitespace-nowrap">
                                    {Number(row.rainAmount || 0).toFixed(2)}
                                    <TrendIcon diff={row.diff} />
                                </td>
                                <td className="p-2 text-center border-r font-mono text-gray-400 text-xs">-</td>
                                <td className="p-2 text-center font-mono border-r text-gray-400">-</td>
                                <td className="p-2 text-center font-mono border-r text-gray-400">-</td>
                                <td className="p-2 text-center font-mono text-gray-400">-</td>
                              </>
                          ) : (
                              <>
                                <td className="p-2 text-right border-l font-mono text-gray-700">{Number(row.capacity || 0).toFixed(3)}</td>
                                <td className="p-2 text-right font-mono text-gray-400 text-xs">{Number(row.min_cap || 0).toFixed(3)}</td>
                                
                                {/* ปริมาณน้ำปัจจุบัน */}
                                <td className="p-2 text-right font-mono font-medium text-blue-700 border-l whitespace-nowrap">
                                    {Number(row.current || 0).toFixed(3)}
                                    <TrendIcon diff={row.diff} />
                                </td>
                                
                                <td className="p-2 text-center border-r">
                                    <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold w-16 ${getPercentColor(row.percent)}`}>
                                    {Number(row.percent || 0).toFixed(2)}%
                                    </div>
                                </td>
                                <td className="p-2 text-right font-mono border-r">{Number(row.inflow || 0).toFixed(3)}</td>
                                <td className="p-2 text-right font-mono border-r">{Number(row.outflow || 0).toFixed(3)}</td>
                                <td className="p-2 text-right font-mono font-semibold text-gray-800">{Number(row.usable || 0).toFixed(3)}</td>
                              </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {reportMode === "map" && (
            <div className="w-full flex justify-center bg-gray-100 p-2 print:block">
              <div className="w-full max-w-5xl shadow-inner border rounded-lg overflow-hidden bg-white" style={{ aspectRatio: "16/9" }}>
                <VideoMapComponent 
                  mode="report" 
                  markers={allMarkers} 
                  rainMarkers={rainData.filter(d => (d.date || d.updated_at || "").startsWith(selectedDate))} // กรองฝนในแผนที่ด้วย
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataReportPage;
