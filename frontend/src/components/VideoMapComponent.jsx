import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Calendar
} from "lucide-react";
import waveVideo from "../assets/mapwater_3.mp4"; 
import waveimage from "../assets/mapwater.png";
import damimage from "../assets/dams.png";

import InteractiveMapOverlay from "./InteractiveMapOverlay"; 

// --- 🟢 1. รายชื่อ 13 อำเภอ ---
const LAMPANG_DISTRICTS = [
  "เมืองลำปาง", "แม่เมาะ", "เกาะคา", "เสริมงาม", "งาว", "แจ้ห่ม",
  "วังเหนือ", "เถิน", "แม่พริก", "แม่ทะ", "สบปราบ", "ห้างฉัตร", "เมืองปาน",
];

// --- 🟢 2. CONFIGURATION (ตั้งค่าตำแหน่ง) ---

const RAIN_TABLE_CONFIG = {
  desktop: { top: "13.5%", left: "0.5%", width: "100px", scale: 1.6 },
  report:  { top: "14.4%", left: "0.7%", width: "85px", scale: 1.4 }
};

const MAP_OVERLAY_CONFIG = {
  desktop: { top: "13%", left: "1.3%", width: "30%", height: "33%" }, 
  report:  { top: "17.5%", left: "2.6%", width: "28%", height: "28%" } 
};

// ✅ ตั้งค่า วันที่/เวลา (ตำแหน่งนี้อิงตามขนาดวิดีโอ)
const DATE_TIME_CONFIG = {
  desktop: { top: "1%", right: "33.5%", scale: 1.1 }, // ขยับให้ใหญ่หน่อยเพราะอยู่ใน map
  report:  { top: "5%", right: "5%", scale: 1.0 }
};

const STATION_OVERLAYS = {
  เขื่อนภูมิพล: {
    desktop: { top: "21.1%", left: "35.2%", w: 100, h: 73 },
    report:  { top: "28%",   left: "15%",   w: 60,  h: 45 },
  },
  เขื่อนกิ่วลม: {
    desktop: { top: "25%", left: "79%", w: 77, h: 55 },
    report:  { top: "28%", left: "79%", w: 45, h: 32 },
  },
  เขื่อนสิริกิติ์: {
    desktop: { top: "29%", left: "72%", w: 55, h: 40 },
    report:  { top: "32%", left: "52%", w: 35, h: 25 },
  },
};

const STATION_LOCATIONS = {
  เขื่อนภูมิพล: {
    desktop: { 
      set1: { top: "35%", left: "15%", fontSize: 24 }, 
      set2: { top: "40%", left: "15%", fontSize: 16 }  
    },
    report: { 
      set1: { top: "36%", left: "15%", fontSize: 12 }, 
      set2: { top: "40%", left: "15%", fontSize: 8 }
    },
    color: "#fff700",
  },
  เขื่อนกิ่วลม: {
    desktop: { 
      set1: { top: "35%", left: "79%", fontSize: 18 }, 
      set2: { top: "40%", left: "79%", fontSize: 14 }
    },
    report: { 
      set1: { top: "36%", left: "79%", fontSize: 10 }, 
      set2: { top: "40%", left: "79%", fontSize: 8 }
    },
    color: "#38bdf8",
  },
};

const MAP_CAROUSEL_DATA = [{ id: 1, region: "ภาพรวมประเทศ", video: waveVideo, image: waveimage }];

// --- 🟢 Helper: ฟังก์ชันแปลงวันที่เป็นไทย ---
const formatThaiDateTime = (date) => {
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear() + 543;
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `วันที่ ${day} ${month} ${year} เวลา ${hours}.${minutes} น.`;
};

// --- 🟢 Component: วันที่เวลา Overlay ---
const DateTimeOverlay = ({ config }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="absolute z-[60] pointer-events-auto transition-all duration-300 ease-out origin-top-right"
      style={{
        top: config.top,
        left: config.left,
        right: config.right,
        bottom: config.bottom,
        transform: `scale(${config.scale})`,
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact"
      }}
    >
      <div className="border border-white/20 px-2 py-1 rounded-xl flex items-center space-x-2 print:bg-transparent print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col items-end print:items-end">
            <span 
                className="text-blue font-[sans-serif] font-bold tracking-wide font-mono print:text-gray-800 print:font-bold whitespace-nowrap"
                // 🟢 เพิ่มบรรทัดนี้: รับค่า px จาก config โดยตรง
                style={{ fontSize: config.fontSize || "13px" }} 
            >
               {formatThaiDateTime(currentTime)}
            </span>
        </div>
      </div>
    </div>
  );
};

// --- 🟢 Component ตารางฝน ---
const RainTableOverlay = ({ data, top, left, width, height = "auto", scale = 1 }) => {
  const fullDistrictData = LAMPANG_DISTRICTS.map((district) => {
    const foundData = (data || []).find((item) => {
      const name = (item.stationName || item.station_name || "").trim();
      return name === district || name.includes(district);
    });
    const rawAmount = foundData ? foundData.rainAmount || "0" : "0";
    const amount = parseFloat(rawAmount);
    return {
      stationName: district.replace("ลำปาง", ""),
      rainAmount: isNaN(amount) ? 0.0 : amount,
      hasData: !!foundData,
    };
  });

  return (
    <div
      className="absolute z-[50] bg-slate-900/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
      style={{ 
        top, left, width, height, maxHeight: "90%",
        transform: `scale(${scale})`, 
        transformOrigin: "top left",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact"
      }}
    >
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 bg-slate-800 text-[9px] text-cyan-400 font-bold uppercase shadow-sm z-10">
            <tr>
              <th className="py-0.5 pl-2 border-b border-white/10 bg-slate-800 w-[55%] text-left">อ.</th>
              <th className="py-0.5 pr-2 border-b border-white/10 text-right bg-slate-800 w-[45%]">มม.</th>
            </tr>
          </thead>
          <tbody className="text-white text-[10px] leading-none">
            {fullDistrictData.map((item, idx) => (
              <tr key={idx} className="border-white/5 hover:bg-white/10 transition-colors group">
                <td className="py-[1px] pl-2 font-medium opacity-90 group-hover:opacity-100 group-hover:text-cyan-200 whitespace-nowrap truncate tracking-tighter border-white/20" title={item.stationName}>
                   {item.stationName}
                </td>
                <td className="py-[1px] pr-2 text-right font-mono font-bold tracking-tight">
                  <span className={`${item.rainAmount > 50 ? "text-red-400" : item.rainAmount > 0 ? "text-cyan-300" : "text-gray-500 opacity-40"}`}>
                    {item.rainAmount.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 🟢 Component กราฟิกน้ำ ---
const WaterLevelOverlay = ({ percent, imageFrame, w = 77, h = 55 }) => {
  const innerW = w * 0.83;
  const innerH = h * 0.65;
  const bottomDist = h * 0.23;
  return (
    <div className="relative pointer-events-auto group" style={{ width: `${w}px`, height: `${h}px` }}>
      <div className="absolute overflow-hidden bg-gray-900/20 rounded-b-md" style={{ width: `${innerW}px`, height: `${innerH}px`, left: "50%", bottom: `${bottomDist}px`, transform: "translateX(-50%)", zIndex: 0 }}>
        <div className="absolute bottom-0 w-full bg-blue-500/80 transition-all duration-1000" style={{ height: `${percent}%` }} />
      </div>
      <img src={imageFrame} className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none" alt="Dam Frame" />
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <span className="font-black text-white drop-shadow-md" style={{ fontSize: `${w * 0.13}px` }}>{Math.round(percent)}%</span>
      </div>
    </div>
  );
};

// --- 🟢 MAIN COMPONENT ---
const VideoMapComponent = ({
  mode = "interactive",
  markers = [],
  rainMarkers = [],
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  
  const [initialDistance, setInitialDistance] = useState(null);
  const containerRef = useRef(null);
  const activeSlideData = MAP_CAROUSEL_DATA[currentSlide];

  const getConfig = (configObj) => {
    if (mode === "report") return configObj.report || configObj.desktop;
    return configObj.desktop;
  };

  const rainConfig = getConfig(RAIN_TABLE_CONFIG);
  const mapOverlayConfig = getConfig(MAP_OVERLAY_CONFIG);
  const dateTimeConfig = getConfig(DATE_TIME_CONFIG); // 👈 ดึง Config

  const handleStart = (clientX, clientY) => { setIsDragging(true); setStartPan({ x: clientX - transform.x, y: clientY - transform.y }); };
  const handleMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const handleMove = (clientX, clientY) => { if (!isDragging) return; setTransform((prev) => ({ ...prev, x: clientX - startPan.x, y: clientY - startPan.y })); };
  const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const handleEnd = () => { setIsDragging(false); setInitialDistance(null); };
  const handleMouseUp = () => handleEnd();
  const handleWheel = (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); handleZoom(e.deltaY > 0 ? -0.2 : 0.2); } };
  const handleTouchStart = (e) => { if (e.touches.length === 1) handleStart(e.touches[0].clientX, e.touches[0].clientY); };
  const handleTouchMove = (e) => {
    if (e.touches.length === 1) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    else if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (initialDistance === null) setInitialDistance(dist);
      else {
        const zoomFactor = dist / initialDistance;
        setTransform((prev) => ({ ...prev, scale: Math.min(Math.max(prev.scale * zoomFactor, 0.8), 5) }));
        setInitialDistance(dist);
      }
    }
  };
  const handleTouchEnd = () => handleEnd();
  const handleZoom = (delta) => setTransform((prev) => ({ ...prev, scale: Math.min(Math.max(prev.scale + delta, 0.8), 5) }));
  const handlePrev = () => { setCurrentSlide((prev) => (prev - 1 + MAP_CAROUSEL_DATA.length) % MAP_CAROUSEL_DATA.length); setTransform({ x: 0, y: 0, scale: 1 }); };
  const handleNext = () => { setCurrentSlide((prev) => (prev + 1) % MAP_CAROUSEL_DATA.length); setTransform({ x: 0, y: 0, scale: 1 }); };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-white ${mode === "report" ? "w-full aspect-video rounded-lg border-2 border-gray-300 print:border-0 print:fixed print:top-0 print:left-0 print:w-[297mm] print:h-[210mm] print:z-[9999] print:m-0 print:rounded-none" : "w-full mx-auto"} ${isDragging ? "cursor-grabbing" : "cursor-grab"} group touch-none`}
      style={mode === "interactive" ? { aspectRatio: "1842 / 1036", maxWidth: "100%" } : {}}
      onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
    >
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { margin: 0; padding: 0; }
          .print-full-page { transform: none !important; width: 100vw !important; height: 100vh !important; position: fixed !important; top: 0 !important; left: 0 !important; display: block !important; }
          video, img { width: 100% !important; height: 100% !important; object-fit: fill !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      {/* 🔴 MOVABLE CONTAINER: ทุกอย่างในนี้จะขยับตามการลาก/ซูม */}
      <div className="w-full h-full relative origin-center transition-transform duration-75 ease-out will-change-transform print-full-page" style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
        {mode === "report" ? (
          <img src={activeSlideData.image} alt={activeSlideData.region} className="absolute inset-0 w-full h-full object-cover object-center print:object-fill" />
        ) : (
          <video key={activeSlideData.id} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-100 transition-opacity duration-500 animate-fade-in print:object-fill">
            <source src={activeSlideData.video} type="video/mp4" />
          </video>
        )}

        {/* แผนที่อำเภอ */}
        <div 
          className="absolute z-10 pointer-events-none"
          style={{
            top: mapOverlayConfig.top,
            left: mapOverlayConfig.left,
            width: mapOverlayConfig.width,
            height: mapOverlayConfig.height,
            transition: 'all 0.3s ease'
          }}
        >
           <InteractiveMapOverlay 
              rainData={rainMarkers} 
              width="100%" 
              height="100%" 
           />
        </div>

        {/* ตารางฝน */}
        <RainTableOverlay
          data={rainMarkers}
          top={rainConfig.top}
          left={rainConfig.left}
          width={rainConfig.width}
          scale={rainConfig.scale} 
          height="auto" 
        />

        {/* ✅ 🟢 DateTime Overlay: อยู่ใน Container ที่ขยับได้แล้ว (Gecko Mode) */}
        <DateTimeOverlay config={dateTimeConfig} />

        {/* Markers จุดตรวจวัดน้ำ */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {markers.map((item) => {
            const fullLocConfig = STATION_LOCATIONS[item.stationName];
            const fullOverConfig = STATION_OVERLAYS[item.stationName];
            if (!fullLocConfig) return null;

            const pos = getConfig(fullLocConfig);
            const over = fullOverConfig ? getConfig(fullOverConfig) : null;
            
            const customColor = fullLocConfig.color || "white";
            const calcPercent = item.current && item.capacity ? ((item.current / item.capacity) * 100).toFixed(2) : (item.percent || 0).toFixed(2);
            
            const defaultFontSize = mode === "report" ? 10 : 18;
            const fontSize1 = pos.set1?.fontSize || defaultFontSize; 
            const fontSize2 = pos.set2?.fontSize || defaultFontSize;

            return (
              <React.Fragment key={`dyn-${item.id}`}>
                {over && (
                  <div className="absolute pointer-events-auto" style={{ top: over.top, left: over.left, transform: "translate(-50%, -50%)" }}>
                    <WaterLevelOverlay percent={calcPercent} imageFrame={damimage} w={over.w} h={over.h} />
                  </div>
                )}
                
                {/* Set 1: ความจุ */}
                <div className="absolute whitespace-nowrap text-center pointer-events-auto" style={{ top: pos.set1.top, left: pos.set1.left, transform: "translate(-50%, -50%)" }}>
                  <span className="font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]" style={{ fontSize: `${fontSize1}px`, color: customColor }}>
                    {item.capacity ? parseFloat(item.capacity).toLocaleString() : "-"} <span className="ml-1 opacity-80" style={{ fontSize: `${fontSize1 * 0.8}px` }}>({calcPercent}%)</span>
                  </span>
                </div>

                {/* Set 2: Inflow/Outflow */}
                <div className="absolute whitespace-nowrap text-center pointer-events-auto" style={{ top: pos.set2.top, left: pos.set2.left, transform: "translate(-50%, -50%)" }}>
                  <div className="font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]" style={{ fontSize: `${fontSize2}px`, color: customColor }}>
                    <span style={{ filter: "brightness(1.5)" }}>{item.inflow || "-"}</span> / <span style={{ filter: "brightness(0.8)" }}>{item.outflow || "-"}</span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      {/* 🔴 END MOVABLE CONTAINER */}

      {/* Control UI (Fixed position, does not move with map) */}
      <div className="absolute inset-0 pointer-events-none z-10 print:hidden">
        <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full pointer-events-auto shadow-lg"><ChevronLeft className="w-8 h-8" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full pointer-events-auto shadow-lg"><ChevronRight className="w-8 h-8" /></button>
        <div className="absolute bottom-6 left-0 w-full px-6 flex justify-between items-center">
            <div className="w-10"></div>
            <div className="flex space-x-2 bg-black/30 p-2.5 rounded-full backdrop-blur-md border border-white/10 pointer-events-auto">
                {MAP_CAROUSEL_DATA.map((_, idx) => (
                    <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); setTransform({ x: 0, y: 0, scale: 1 }); }} className={`h-2 rounded-full transition-all ${currentSlide === idx ? "bg-blue-400 w-6 shadow-[0_0_10px_rgba(96,165,250,0.8)]" : "bg-white/40 w-2 hover:bg-white/70"}`} />
                ))}
            </div>
            <div className="flex flex-col space-y-2 pointer-events-auto">
                <button onClick={(e) => { e.stopPropagation(); handleZoom(0.5); }} className="bg-white/90 p-2 rounded-lg shadow-lg hover:bg-white active:scale-90 transition-all"><Plus className="w-5 h-5" /></button>
                <button onClick={(e) => { e.stopPropagation(); handleZoom(-0.5); }} className="bg-white/90 p-2 rounded-lg shadow-lg hover:bg-white active:scale-90 transition-all"><Minus className="w-5 h-5" /></button>
            </div>
        </div>
      </div>

    </div>
  );
};

export default VideoMapComponent;