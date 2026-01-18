import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Minus, RefreshCw } from "lucide-react";
import waveVideo from "../assets/mapwater.mp4";
import waveimage from "../assets/mapwater.png";
import damimage from "../assets/dams.png";

// --- 1. Component สำหรับ Overlay ---
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

// --- 2. พิกัด (Responsive) ---
const STATION_OVERLAYS = {
  'เขื่อนภูมิพล': { desktop: { top: "25%", left: "15%", w: 110, h: 78 }, mobile: { top: "28%", left: "15%", w: 75, h: 54 } },
  'เขื่อนกิ่วลม': { desktop: { top: "25%", left: "79%", w: 77, h: 55 }, mobile: { top: "28%", left: "79%", w: 55, h: 40 } },
  'อ่างเก็บน้ำห้วยสมัย': { desktop: { top: "29%", left: "52%", w: 55, h: 40 }, mobile: { top: "32%", left: "52%", w: 45, h: 32 } }
};

const STATION_LOCATIONS = {
  'เขื่อนภูมิพล': { desktop: { set1: { top: '35%', left: '15%' }, set2: { top: '40%', left: '15%' } }, mobile: { set1: { top: '38%', left: '15%' }, set2: { top: '43%', left: '15%' } }, color: '#fff700' },
  'เขื่อนกิ่วลม': { desktop: { set1: { top: '35%', left: '79%' }, set2: { top: '40%', left: '79%' } }, mobile: { set1: { top: '38%', left: '79%' }, set2: { top: '43%', left: '79%' } }, color: '#38bdf8' },
};

const MAP_CAROUSEL_DATA = [
  { id: 1, region: "ภาพรวมประเทศ", video: waveVideo, image: waveimage, markers: [] }
];

const VideoMapComponent = ({ mode = "interactive", markers = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [initialDistance, setInitialDistance] = useState(null);

  const containerRef = useRef(null);
  const activeSlideData = MAP_CAROUSEL_DATA[currentSlide];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 🖱️ Event Handlers (แก้ Error ทั้งหมดให้แล้วจ้า) ---
  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    setStartPan({ x: clientX - transform.x, y: clientY - transform.y });
  };

  const handleMouseDown = (e) => handleStart(e.clientX, e.clientY);

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    setTransform(prev => ({ ...prev, x: clientX - startPan.x, y: clientY - startPan.y }));
  };

  const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);

  const handleEnd = () => {
    setIsDragging(false);
    setInitialDistance(null);
  };

  const handleMouseUp = () => handleEnd();

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      handleZoom(e.deltaY > 0 ? -0.2 : 0.2);
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (initialDistance === null) {
        setInitialDistance(dist);
      } else {
        const zoomFactor = dist / initialDistance;
        setTransform(prev => ({ ...prev, scale: Math.min(Math.max(prev.scale * zoomFactor, 0.8), 5) }));
        setInitialDistance(dist);
      }
    }
  };

  const handleTouchEnd = () => handleEnd();

  const handleZoom = (delta) => setTransform(prev => ({ ...prev, scale: Math.min(Math.max(prev.scale + delta, 0.8), 5) }));
  
  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + MAP_CAROUSEL_DATA.length) % MAP_CAROUSEL_DATA.length);
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % MAP_CAROUSEL_DATA.length);
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div
      ref={containerRef}
      // 🟢 เพิ่ม print:fixed และ print:inset-0 เพื่อให้ Container หลักกินพื้นที่เต็มแผ่นกระดาษ
      className={`relative overflow-hidden bg-white ${mode === "report" ? "w-full aspect-video rounded-lg border-2 border-gray-300 print:border-0 print:fixed print:top-0 print:left-0 print:w-[297mm] print:h-[210mm] print:z-[9999] print:m-0 print:rounded-none" : "w-full mx-auto"} ${isDragging ? "cursor-grabbing" : "cursor-grab"} group touch-none`}
      style={
        mode === "interactive"
          ? { aspectRatio: "1842 / 1036", maxWidth: "100%" }
          : {}
      }
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        @media print {
          @page { 
            size: A4 landscape; /* 🟢 บังคับกระดาษแนวนอน */
            margin: 0; 
          }
          body { margin: 0; padding: 0; }
          
          /* 🟢 บังคับให้แผนที่ขยายเต็มกระดาษแบบไม่สนสัดส่วนหน้าจอเว็บ */
          .print-full-page { 
            transform: none !important; /* ล้างค่าการซูม/แพนทิ้งตอนพิมพ์ */
            width: 100vw !important; 
            height: 100vh !important; 
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            display: block !important;
          }

          /* 🟢 จัดการพื้นหลังให้เต็มแผ่น */
          video, img { 
            width: 100% !important; 
            height: 100% !important; 
            object-fit: fill !important; /* ยืดให้เต็มขอบกระดาษ */
          }

          /* 🟢 ซ่อนปุ่มควบคุมไม่ให้ติดไปในรูป */
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      <div
        // 🟢 เพิ่มคลาส print-full-page เพื่อใช้กับสไตล์ด้านบน
        className="w-full h-full relative origin-center transition-transform duration-75 ease-out will-change-transform print-full-page"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
      >
        {mode === "report" ? (
          <img
            src={activeSlideData.image}
            alt={activeSlideData.region}
            className="absolute inset-0 w-full h-full object-cover object-center print:object-fill"
          />
        ) : (
          <video
            key={activeSlideData.id}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-100 transition-opacity duration-500 animate-fade-in print:object-fill"
          >
            <source src={activeSlideData.video} type="video/mp4" />
          </video>
        )}

        {/* Marker ข้อมูลน้ำ */}
        <div className="absolute inset-0 pointer-events-none">
          {currentSlide === 0 &&
            markers.map((item, idx) => {
              const fullLocConfig = STATION_LOCATIONS[item.stationName];
              const fullOverConfig = STATION_OVERLAYS[item.stationName];
              if (!fullLocConfig) return null;

              const isPrinting = window.matchMedia("print").matches;
              
              // 🟢 ตอนพริ้นต์ ให้บังคับใช้พิกัด Desktop เสมอเพื่อให้ตรงกับกระดาษ A4
              const pos = (isMobile && !isPrinting)
                  ? fullLocConfig.mobile || fullLocConfig.desktop
                  : fullLocConfig.desktop;
              const over = (isMobile && !isPrinting)
                  ? fullOverConfig?.mobile || fullOverConfig?.desktop
                  : fullOverConfig?.desktop;

              const customColor = fullLocConfig.color || "white";
              const calcPercent =
                item.current && item.capacity
                  ? ((item.current / item.capacity) * 100).toFixed(2)
                  : (item.percent || 0).toFixed(2);

              return (
                <React.Fragment key={`dyn-${item.id}`}>
                  {over && (
                    <div
                      className="absolute pointer-events-auto"
                      style={{
                        top: over.top,
                        left: over.left,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <WaterLevelOverlay
                        percent={calcPercent}
                        imageFrame={damimage}
                        w={over.w}
                        h={over.h}
                      />
                    </div>
                  )}
                  <div
                    className="absolute whitespace-nowrap text-center pointer-events-auto"
                    style={{
                      top: pos.set1.top,
                      left: pos.set1.left,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <span
                      className="font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
                      style={{
                        fontSize: (isMobile && !isPrinting) ? "10px" : "14px",
                        color: customColor,
                      }}
                    >
                      {item.capacity
                        ? parseFloat(item.capacity).toLocaleString()
                        : "-"}{" "}
                      <span
                        className="ml-1 opacity-80"
                        style={{ fontSize: (isMobile && !isPrinting) ? "8px" : "11px" }}
                      >
                        ({calcPercent}%)
                      </span>
                    </span>
                  </div>
                  <div
                    className="absolute whitespace-nowrap text-center pointer-events-auto"
                    style={{
                      top: pos.set2.top,
                      left: pos.set2.left,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      className="font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
                      style={{
                        fontSize: (isMobile && !isPrinting) ? "8px" : "12px",
                        color: customColor,
                      }}
                    >
                      <span style={{ filter: "brightness(1.5)" }}>
                        {item.inflow || "-"}
                      </span>{" "}
                      /{" "}
                      <span style={{ filter: "brightness(0.8)" }}>
                        {item.outflow || "-"}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-10 print:hidden">
        <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full pointer-events-auto print:hidden shadow-lg">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full pointer-events-auto print:hidden shadow-lg">
          <ChevronRight className="w-8 h-8" />
        </button>
        <div className="absolute bottom-6 left-0 w-full px-6 flex justify-between items-center print:hidden">
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