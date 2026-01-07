import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react'; // เพิ่ม Plus, Minus
import waveVideo from '../assets/mapwater.mp4';
import waveimage from '../assets/mapwater.png';

const STATION_LOCATIONS = {
  'เขื่อนภูมิพล': { set1: { top: '22%', left: '25%' }, set2: { top: '28%', left: '25%' } },
  'เขื่อนสิริกิติ์': { set1: { top: '32%', left: '55%' }, set2: { top: '38%', left: '55%' } },
  'เขื่อนป่าสักฯ': { set1: { top: '57%', left: '45%' }, set2: { top: '63%', left: '45%' } },
  'เขื่อนอุบลรัตน์': { set1: { top: '37%', left: '75%' }, set2: { top: '43%', left: '75%' } }
};

const MAP_CAROUSEL_DATA = [
  { id: 1, region: 'ภาพรวมประเทศ (Overview)', video: waveVideo, image: waveimage, markers: [] },
  { id: 2, region: 'ภาคเหนือ (North)', video: 'https://cdn.pixabay.com/video/2022/10/05/133690-757657935_large.mp4', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000&h=1125', markers: [] },
  { id: 3, region: 'ภาคตะวันออกเฉียงเหนือ (Northeast)', video: 'https://cdn.pixabay.com/video/2020/06/17/42221-432247076_large.mp4', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000&h=1125', markers: [] },
  { id: 4, region: 'ภาคกลาง (Central)', video: 'https://cdn.pixabay.com/video/2024/02/09/199958-911693639_large.mp4', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2000&h=1125', markers: [] },
  { id: 5, region: 'ภาคตะวันออก (East)', video: 'https://cdn.pixabay.com/video/2019/06/25/24855-344933999_large.mp4', image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=2000&h=1125', markers: [] },
  { id: 6, region: 'ภาคใต้ (South)', video: 'https://cdn.pixabay.com/video/2020/05/25/40133-424072619_large.mp4', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000&h=1125', markers: [] }
];

const VideoMapComponent = ({ mode = 'interactive', markers = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0); 
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const activeSlideData = MAP_CAROUSEL_DATA[currentSlide];

  const handleNext = (e) => { e?.stopPropagation(); setCurrentSlide((prev) => (prev + 1) % MAP_CAROUSEL_DATA.length); setTransform({ x: 0, y: 0, scale: 1 }); };
  const handlePrev = (e) => { e?.stopPropagation(); setCurrentSlide((prev) => (prev - 1 + MAP_CAROUSEL_DATA.length) % MAP_CAROUSEL_DATA.length); setTransform({ x: 0, y: 0, scale: 1 }); };
  const handleZoom = (delta) => setTransform(prev => ({ ...prev, scale: Math.min(Math.max(prev.scale + delta, 0.8), 5) }));
  const handleWheel = (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); handleZoom(e.deltaY > 0 ? -0.2 : 0.2); } };
  const handleMouseDown = (e) => { e.preventDefault(); setIsDragging(true); setStartPan({ x: e.clientX - transform.x, y: e.clientY - transform.y }); };
  const handleMouseMove = (e) => { if (!isDragging) return; e.preventDefault(); setTransform(prev => ({ ...prev, x: e.clientX - startPan.x, y: e.clientY - startPan.y })); };
  const handleMouseUp = () => setIsDragging(false);
  const handleTouchStart = (e) => { if (e.touches.length === 1) { setIsDragging(true); setStartPan({ x: e.touches[0].clientX - transform.x, y: e.touches[0].clientY - transform.y }); } };
  const handleTouchMove = (e) => { if (!isDragging || e.touches.length !== 1) return; setTransform(prev => ({ ...prev, x: e.touches[0].clientX - startPan.x, y: e.touches[0].clientY - startPan.y })); };
  const handleTouchEnd = () => setIsDragging(false);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-900 ${mode === 'report' ? 'w-full aspect-video rounded-lg border-2 border-gray-300 print:border-0 print:fixed print:top-0 print:left-0 print:w-screen print:h-screen print:z-[9999] print:m-0 print:rounded-none' : 'w-full mx-auto'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} group touch-none`}
      style={mode === 'interactive' ? { aspectRatio: '1842 / 1036', maxWidth: '100%' } : {}}
      onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
    >
      {/* 🟢 ส่วนแสดงภาพ/วิดีโอ แผนที่ */}
      <div className="w-full h-full relative origin-center transition-transform duration-300 ease-out will-change-transform" style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
        {mode === 'report' ? (
           <img src={activeSlideData.image} alt={activeSlideData.region} className="absolute inset-0 w-full h-full object-contain opacity-90" />
        ) : (
           <video key={activeSlideData.id} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-100 transition-opacity duration-500 animate-fade-in">
             <source src={activeSlideData.video} type="video/mp4" />
           </video>
        )}

        {/* Marker ข้อมูลน้ำ */}
        <div className="absolute inset-0 pointer-events-none">
          {currentSlide === 0 && markers.map((item, idx) => {
              const locConfig = STATION_LOCATIONS[item.stationName] || {};
              const fallbackTop = (idx * 13) % 60 + 20;
              const fallbackLeft = (idx * 7) % 80 + 10;
              const pos1 = locConfig.set1 || { top: `${fallbackTop}%`, left: `${fallbackLeft}%` };
              const pos2 = locConfig.set2 || { top: `${fallbackTop + 6}%`, left: `${fallbackLeft}%` };
              const calcPercent = (item.current && item.capacity) ? ((item.current / item.capacity) * 100).toFixed(2) : (item.percent || 0).toFixed(2);
              
              return (
                <React.Fragment key={`dyn-${item.id}`}>
                   <div className="absolute whitespace-nowrap text-center pointer-events-auto hover:scale-110 transition-transform" 
                        style={{ top: pos1.top, left: pos1.left, transform: 'translate(-50%, -50%)' }}>
                       <span className="font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]" style={{ fontSize: '14px' }}>
                           {item.capacity ? parseFloat(item.capacity).toLocaleString() : '-'} 
                           <span className="ml-1 text-yellow-300" style={{ fontSize: '12px' }}>({calcPercent}%)</span>
                       </span>
                   </div>
                   <div className="absolute whitespace-nowrap text-center pointer-events-auto hover:scale-110 transition-transform"
                        style={{ top: pos2.top, left: pos2.left, transform: 'translate(-50%, -50%)' }}>
                       <div className="font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]" style={{ fontSize: '12px' }}>
                           <span className="text-green-300">{item.inflow || '-'}</span>
                           <span className="mx-1 text-white">/</span>
                           <span className="text-orange-300">{item.outflow || '-'}</span>
                       </div>
                   </div>
                </React.Fragment>
              );
          })}
        </div>
      </div>

      {/* 🔵 ส่วนควบคุม UI (Layer บน) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* หัวข้อด้านบน */}
        <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-start">
           <div className="flex items-center space-x-2 text-white">
             {mode === 'interactive' && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
             <div><h3 className="font-bold text-lg">{activeSlideData.region}</h3><p className="text-xs opacity-80 font-mono">LIVE MONITORING SYSTEM</p></div>
           </div>
        </div>

        {/* ปุ่มลูกศร ซ้าย-ขวา */}
        <button onClick={handlePrev} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full pointer-events-auto transition-all hover:scale-110 print:hidden shadow-lg"><ChevronLeft className="w-8 h-8" /></button>
        <button onClick={handleNext} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full pointer-events-auto transition-all hover:scale-110 print:hidden shadow-lg"><ChevronRight className="w-8 h-8" /></button>

        {/* 🟡 ส่วนควบคุมด้านล่าง (Dots + Zoom) */}
        <div className="absolute bottom-6 left-0 w-full px-6 flex justify-between items-center print:hidden">
          
          {/* เว้นที่ว่างฝั่งซ้ายเพื่อให้จุดอยู่กลาง */}
          <div className="w-10"></div> 

          {/* จุดบอกหน้า (Pagination Dots) - อยู่กึ่งกลาง */}
          <div className="flex space-x-2 bg-black/30 p-2.5 rounded-full backdrop-blur-md border border-white/10 pointer-events-auto shadow-xl">
            {MAP_CAROUSEL_DATA.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(idx);
                  setTransform({ x: 0, y: 0, scale: 1 });
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx 
                    ? 'bg-blue-400 w-6 shadow-[0_0_10px_rgba(96,165,250,0.8)]' 
                    : 'bg-white/40 w-2 hover:bg-white/70'
                }`}
                title={`ไปหน้า ${idx + 1}`}
              />
            ))}
          </div>

          {/* ปุ่ม Zoom - อยู่ฝั่งขวา */}
          <div className="flex flex-col space-y-2 pointer-events-auto">
            <button onClick={() => handleZoom(0.5)} className="bg-white/90 p-2 rounded-lg shadow-lg hover:bg-white text-gray-700 transition active:scale-90" title="ซูมเข้า"><Plus className="w-5 h-5"/></button>
            <button onClick={() => handleZoom(-0.5)} className="bg-white/90 p-2 rounded-lg shadow-lg hover:bg-white text-gray-700 transition active:scale-90" title="ซูมออก"><Minus className="w-5 h-5"/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoMapComponent;