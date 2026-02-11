import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus
} from "lucide-react";

import InteractiveMapOverlay from "./InteractiveMapOverlay"; 

// Import Config
import { 
  LAMPANG_DISTRICTS,
  RAIN_TABLE_CONFIG,
  MAP_OVERLAY_CONFIG,
  DATE_TIME_CONFIG,
  WATER_SUMMARY_CONFIG,
  STATION_OVERLAYS,
  STATION_LOCATIONS,
  MAP_CAROUSEL_DATA,
  damimage ,
  STATION_STORAGE_OVERLAYS,
  COMBINED_DAM_CONFIG
} from "./mapConfig"; 

// --- Helper Functions ---
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

// --- Sub-Components ---

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
                style={{ fontSize: config.fontSize || "13px" }} 
            >
               {formatThaiDateTime(currentTime)}
            </span>
        </div>
      </div>
    </div>
  );
};

const WaterSummaryOverlay = ({ markers, config }) => {
  const stats = markers.reduce((acc, item) => {
    const capacity = parseFloat(item.capacity || 0);
    const current = parseFloat(item.current || item.currentStorage || item.current_storage || 0);
    
    if (capacity <= 0) return acc;

    const percent = (current / capacity) * 100;

    if (percent >= 80) acc.critical++;      
    else if (percent >= 50) acc.normal++;   
    else if (percent >= 30) acc.low++;      
    else acc.veryLow++;                     

    return acc;
  }, { critical: 0, normal: 0, low: 0, veryLow: 0 });

  return (
    <div
      className="absolute z-[50] bg-slate-900/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
      style={{ 
        top: config.top, 
        left: config.left, 
        width: config.width,
        transform: `scale(${config.scale})`, 
        transformOrigin: "top left",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact"
      }}
    >
      <div className="bg-slate-800 p-0.5 border-b border-white/10">
        <h3 className="text-white text-[10px] font-bold text-center">สรุปปริมาณน้ำในอ่างฯ</h3>
      </div>
      <div className="p-1 space-y-1">
        <div className="flex justify-between items-center text-[10px] text-white">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            <span>80-100%</span>
          </div>
          <span className="font-mono font-bold text-red-400">จำนวน {stats.critical} แห่ง</span>
        </div>
        <div className="flex justify-between items-center text-[10px] text-white">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            <span>50-79%</span>
          </div>
          <span className="font-mono font-bold text-green-400">จำนวน {stats.normal} แห่ง</span>
        </div>
        <div className="flex justify-between items-center text-[10px] text-white">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
            <span>30-49%</span>
          </div>
          <span className="font-mono font-bold text-yellow-400">จำนวน {stats.low} แห่ง</span>
        </div>
        <div className="flex justify-between items-center text-[10px] text-white">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-orange-600 mr-2"></span>
            <span>น้อยกว่า 30%</span>
          </div>
          <span className="font-mono font-bold text-orange-400">จำนวน {stats.veryLow} แห่ง</span>
        </div>
      </div>
    </div>
  );
};

const RainTableOverlay = ({ data, top, left, width, height = "auto", scale = 1 }) => {
  const getRainColor = (amount) => {
    if (amount <= 0) return "text-gray-500 opacity-40";
    if (amount <= 10) return "text-cyan-300";
    if (amount <= 35) return "text-green-400";
    if (amount <= 90) return "text-orange-400 font-bold";
    return "text-red-500 font-black animate-pulse";
  };

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
                  <span className={`${getRainColor(item.rainAmount)} drop-shadow-sm transition-colors duration-300`}>
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

const WaterLevelOverlay = ({ percent, imageFrame, w = 77, h = 55, overflowHeight = 40 }) => {
  const innerW = w * 1;
  const innerH = h * 0.65;
  const bottomDist = h * 0.23;
  const isOverflow = percent > 100;
  const displayHeight = Math.min(percent, 100);
  const damTopEdge = h - (bottomDist + innerH);

  return (
    <div className="relative pointer-events-auto group" style={{ width: `${w}px`, height: `${h}px` }}>
      {isOverflow && (
        <div 
          className="absolute bg-gradient-to-b from-red-600/90 to-red-500/0 w-full animate-pulse"
          style={{ 
            width: `${innerW}px`, height: `${overflowHeight}px`, top: `${damTopEdge - 2}px`, 
            left: "50%", transform: "translateX(-50%)", zIndex: 20, borderRadius: "4px 4px 8px 8px"
          }}
        />
      )}
      <div 
        className="absolute overflow-hidden bg-gray-900/20 rounded-b-md" 
        style={{ 
          width: `${innerW}px`, height: `${innerH}px`, left: "50%", bottom: `${bottomDist}px`, 
          transform: "translateX(-50%)", zIndex: 5 
        }}
      >
        <div 
          className={`absolute bottom-0 w-full transition-all duration-1000 ${
            isOverflow ? "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]" : "bg-blue-500/80"
          }`} 
          style={{ height: `${displayHeight}%` }} 
        />
      </div>
      <img src={imageFrame} className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none" alt="Dam Frame" />
      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
        <span 
          className={`font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
            isOverflow ? "text-red-100 animate-bounce scale-110" : "text-white"
          }`} 
          style={{ fontSize: `${w * 0.13}px` }}
        >
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  );
};

const CombinedDamOverlay = ({ markers, top = "18%", left = "20%", scale = 1.2 }) => {
  const largeDam = markers.find(m => (m.stationName || m.name || "").includes('ขนาดใหญ่'));
  const mediumDam = markers.find(m => (m.stationName || m.name || "").includes('ขนาดกลาง'));

  const getVal = (dam) => parseFloat(
    dam?.current ?? dam?.currentStorage ?? dam?.current_storage ?? dam?.waterLevel ?? 0
  );

  const currentTotal = getVal(largeDam) + getVal(mediumDam);
  const capacityTotal = 277 + 173; 
  const percent = capacityTotal > 0 ? (currentTotal / capacityTotal) * 100 : 0;

  return (
    <div 
      className="absolute z-50 flex flex-col items-center pointer-events-auto"
      style={{ 
        top: top, left: left, 
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
    >
      <div className="relative filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]">
        <WaterLevelOverlay 
            percent={percent} 
            imageFrame={damimage} 
            w={100} 
            h={72} 
        />
      </div>
    </div>
  );
};

const StorageValueOverlay = ({ data, config }) => {
  if (!data || !config) return null;

  // Helper ดึงค่า
  const currentVal = data.currentStorage ?? data.current_storage ?? data.current ?? 0;
  const usableVal = data.usableStorage ?? data.usable_storage ?? data.usable ?? 0;

  return (
    <>
      {/* แสดงปริมาณน้ำปัจจุบัน */}
      {config.current && (
        <div 
          className="absolute whitespace-nowrap font-bold drop-shadow-md pointer-events-none transition-all"
          style={{ 
            top: config.current.top, 
            left: config.current.left, 
            fontSize: `${config.current.fontSize}px`,
            color: config.current.color || "#fff"
          }}
        >
          {Number(currentVal).toLocaleString()}
        </div>
      )}
      
      {/* แสดงน้ำใช้การได้ */}
      {config.usable && (
        <div 
          className="absolute whitespace-nowrap font-bold drop-shadow-md pointer-events-none transition-all"
          style={{ 
            top: config.usable.top, 
            left: config.usable.left, 
            fontSize: `${config.usable.fontSize}px`,
            color: config.usable.color || "#fff"
          }}
        >
          ({Number(usableVal).toLocaleString()})
        </div>
      )}
    </>
  );
};

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
  

  const getStationColor = (percent) => {
    const val = parseFloat(percent);
    if (val >= 80) return "#ef4444"; 
    if (val >= 50) return "#3b82f6"; 
    if (val >= 30) return "#22c55e"; 
    return "#f59e0b";                
  };

  const getConfig = (configObj) => {
    if (mode === "report") return configObj.report || configObj.desktop;
    return configObj.desktop;
  };

  const rainConfig = getConfig(RAIN_TABLE_CONFIG);
  const mapOverlayConfig = getConfig(MAP_OVERLAY_CONFIG);
  const dateTimeConfig = getConfig(DATE_TIME_CONFIG);
  const summaryConfig = getConfig(WATER_SUMMARY_CONFIG);
  const combinedDamConfig = getConfig(COMBINED_DAM_CONFIG);

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
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          .print-full-page { 
             width: 100vw !important; height: 100vh !important; position: fixed !important; 
             top: 0 !important; left: 0 !important; display: flex !important;
             align-items: center; justify-content: center; background: white !important;
          }
          video, img.object-cover { width: 100% !important; height: 100% !important; object-fit: contain !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      <div className="w-full h-full relative origin-center transition-transform duration-75 ease-out will-change-transform print-full-page" style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
        {mode === "report" ? (
          <img src={activeSlideData.image} alt={activeSlideData.region} className="absolute inset-0 w-full h-full object-cover object-center print:object-fill" />
        ) : (
          <video key={activeSlideData.id} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-100 transition-opacity duration-500 animate-fade-in print:object-fill">
            <source src={activeSlideData.video} type="video/mp4" />
          </video>
        )}

        <div className="absolute z-10 pointer-events-none" style={{ top: mapOverlayConfig.top, left: mapOverlayConfig.left, width: mapOverlayConfig.width, height: mapOverlayConfig.height, transition: 'all 0.3s ease' }}>
           <InteractiveMapOverlay rainData={rainMarkers} width="100%" height="100%" />
        </div>

        <CombinedDamOverlay 
    markers={markers} 
    top={combinedDamConfig.top} 
    left={combinedDamConfig.left} 
    scale={combinedDamConfig.scale} 
/>

        <WaterSummaryOverlay markers={markers} config={summaryConfig} />
        
        <RainTableOverlay data={rainMarkers} top={rainConfig.top} left={rainConfig.left} width={rainConfig.width} scale={rainConfig.scale} height="auto" />
        <DateTimeOverlay config={dateTimeConfig} />

        <div className="absolute inset-0 pointer-events-none z-20">
          {Object.entries(STATION_OVERLAYS).map(([stationName, configObj]) => {
            const itemData = markers.find(m => (m.stationName || m.name || "").trim() === stationName.trim());
            if (!itemData) return null;
            const over = getConfig(configObj);
            if (!over) return null;

            const currentVal = parseFloat(itemData.current ?? itemData.currentStorage ?? itemData.current_storage ?? itemData.waterLevel ?? 0);
            const capacityVal = parseFloat(itemData.capacity || 0);
            const calcPercent = capacityVal > 0 ? (currentVal / capacityVal) * 100 : (itemData.percent || 0);

            return (
              <div key={`overlay-${stationName}`} className="absolute pointer-events-auto" style={{ top: over.top, left: over.left, transform: "translate(-50%, -50%)", zIndex: 40 }}>
                <WaterLevelOverlay percent={calcPercent} imageFrame={damimage} w={over.w} h={over.h} />
              </div>
            );
          })}

          {Object.entries(STATION_LOCATIONS).map(([stationName, configObj]) => {
            const itemData = markers.find(m => (m.stationName || m.name || "").trim() === stationName.trim());
            if (!itemData) return null;
            const pos = getConfig(configObj);
            if (!pos) return null;

            const currentVal = parseFloat(itemData.current ?? itemData.currentStorage ?? itemData.current_storage ?? itemData.waterLevel ?? 0);
            const capacityVal = parseFloat(itemData.capacity || 0);
            const calcPercent = capacityVal > 0 ? (currentVal / capacityVal) * 100 : (itemData.percent || 0);
            
            const customColor = getStationColor(calcPercent);
            const fontSize1 = pos.set1?.fontSize || (mode === "report" ? 10 : 18);
            const fontSize2 = pos.set2?.fontSize || (mode === "report" ? 10 : 18);

            return (
              <React.Fragment key={`loc-${stationName}`}>
                {pos.dot && (
                  <div 
                    className={`absolute rounded-full border-2 border-white/80 shadow-lg ${calcPercent >= 80 ? 'animate-pulse' : ''}`}
                    style={{ 
                      top: pos.dot.top, left: pos.dot.left, 
                      width: pos.dot.size || "12px", height: pos.dot.size || "12px",
                      backgroundColor: customColor, transform: "translate(-50%, -50%)"
                    }}
                  />
                )}
                {pos.set1 && (
                  <div className="absolute whitespace-nowrap text-center" style={{ top: pos.set1.top, left: pos.set1.left, transform: "translate(-50%, -50%)" }}>
                    <span className="font-bold drop-shadow-md" style={{ fontSize: `${fontSize1}px`, color: customColor }}>
                      {itemData.capacity ? parseFloat(itemData.capacity).toLocaleString() : "-"} 
                      <span className="opacity-80" style={{ fontSize: '1em' }}>({Math.round(calcPercent)}%)</span>
                    </span>
                  </div>
                )}
                {pos.set2 && (
                  <div className="absolute whitespace-nowrap text-center" style={{ top: pos.set2.top, left: pos.set2.left, transform: "translate(-50%, -50%)" }}>
                    <div className="font-bold drop-shadow-md" style={{ fontSize: `${fontSize2}px`, color: customColor }}>
                      {itemData.inflow || "-"} / {itemData.outflow || "-"}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* 3. วาดค่า Storage เฉพาะจุดที่กำหนดใน STATION_STORAGE_OVERLAYS */}
{Object.entries(STATION_STORAGE_OVERLAYS || {}).map(([stationName, configObj]) => {
  let displayData = null;

  if (stationName === "Combined") {
    // 🟢 กรณีเป็นเขื่อนรวม: คำนวณค่าบวกกันสดๆ ตรงนี้เลย
    const large = markers.find(m => (m.stationName || m.name || "").includes('ขนาดใหญ่'));
    const medium = markers.find(m => (m.stationName || m.name || "").includes('ขนาดกลาง'));
    
    displayData = {
      current_storage: (parseFloat(large?.currentStorage || large?.current || 0)) + 
                       (parseFloat(medium?.currentStorage || medium?.current || 0)),
      usable_storage:  (parseFloat(large?.usableStorage || large?.usable || 0)) + 
                       (parseFloat(medium?.usableStorage || medium?.usable || 0))
    };
  } else {
    // ⚪️ กรณีสถานีปกติ: หา Data ตามชื่อเหมือนเดิม
    displayData = markers.find(m => (m.stationName || m.name || "").trim() === stationName.trim());
  }

  if (!displayData) return null;
  const storageConfig = getConfig(configObj);
  
  return (
    <StorageValueOverlay 
      key={`storage-${stationName}`}
      data={displayData}
      config={storageConfig}
    />
  );
})}
        </div>
      </div>

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