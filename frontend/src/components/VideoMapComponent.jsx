import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import waveVideo from '../assets/mapwater.mp4';
import waveimage from '../assets/mapwater.png';
import damimage from '../assets/dams.png';

// --- 1. Component สำหรับ Overlay ---
const WaterLevelOverlay = ({ percent, imageFrame }) => {
  return (
    <div className="relative w-[77px] h-[55px] pointer-events-auto group">
      
      {/* 🟦 ชั้นที่ 1 (ตัวน้ำ): ขยับขึ้นตามสั่ง! */}
      <div 
        className="absolute overflow-hidden bg-gray-900/20 rounded-b-md"
        style={{ 
          width: '64px',      // กำหนดความกว้างกล่องน้ำ
          height: '36px',     // กำหนดความสูงรวมของกล่องน้ำ
          left: '50%',        // จัดกลางแนวนอน
          bottom: '13px',     // 👈 น้องปรับตัวเลขนี้เพื่อ "ดัน" กล่องน้ำขึ้น-ลง (A56 -> A50)
          transform: 'translateX(-50%)', // ช่วยให้ left: 50% อยู่กลางเป๊ะ
          zIndex: 0           // อยู่หลังรูป
        }}
      >
        {/* ตัวน้ำข้างในที่สูงขึ้นตาม % */}
        <div 
          className="absolute bottom-0 w-full bg-blue-500/80 transition-all duration-1000"
          style={{ height: `${percent}%` }}
        />
      </div>

      {/* 🖼️ ชั้นที่ 2 (รูปขอบอ่าง): ล็อคอยู่ที่เดิมเป๊ะ! */}
      <img 
        src={imageFrame} 
        className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
        alt="Dam Frame"
      />

      {/* 📝 ชั้นที่ 3 (ตัวเลข): ขยับตามกล่องน้ำหรืออยู่ที่เดิมก็ได้ */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <span className="text-[10px] font-black text-white drop-shadow-md">
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  );
};

// --- 2. พิกัดสำหรับตัว Overlay ---
const STATION_OVERLAYS = {
  // 'เขื่อนภูมิพล': { top: '22%', left: '18%' },
  // 'เขื่อนสิริกิติ์': { top: '32%', left: '62%' },
  // 'เขื่อนป่าสักฯ': { top: '57%', left: '38%' },
  // 'เขื่อนอุบลรัตน์': { top: '37%', left: '82%' }
};

const STATION_LOCATIONS = {
   'เขื่อนภูมิพล': { set1: { top: '35%', left: '45%' }, set2: { top: '40%', left: '45%' } ,color: '#fff700' },
   'เขื่อนสิริกิติ์': { set1: { top: '30%', left: '55%' }, set2: { top: '35%', left: '55%' } ,color: '#ef4444' },
  'เขื่อนป่าสักฯ': { set1: { top: '65%', left: '60%' }, set2: { top: '70%', left: '60%' } ,color: '#ef4444' },
  'เขื่อนอุบลรัตน์': { set1: { top: '37%', left: '75%' }, set2: { top: '43%', left: '75%' },color: '#ef4444'  },
  'เขื่อนกิ่วลม': { set1: { top: '35%', left: '79%' }, set2: { top: '70%', left: '90%' } ,color: '#1500ff' },
   'เขื่อนกิ่วคอหมา': { set1: { top: '22%', left: '50%' }, set2: { top: '27%', left: '50%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่ฟ้า': { set1: { top: '23%', left: '52%' }, set2: { top: '28%', left: '52%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่อาง': { set1: { top: '26%', left: '49%' }, set2: { top: '31%', left: '49%' },color: '#ef4444'  },
   'อ่างเก็บน้ำห้วยทราย': { set1: { top: '27%', left: '47%' }, set2: { top: '32%', left: '47%' } ,color: '#ef4444' },
   'เขื่อนแม่ขาม': { set1: { top: '28%', left: '51%' }, set2: { top: '33%', left: '51%' } ,color: '#ef4444' },
   'เขื่อนแม่จาง': { set1: { top: '30%', left: '49%' }, set2: { top: '35%', left: '49%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่ทะ': { set1: { top: '31%', left: '50%' }, set2: { top: '36%', left: '50%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่ไฮ': { set1: { top: '29%', left: '46%' }, set2: { top: '34%', left: '46%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่ธิ': { set1: { top: '32%', left: '48%' }, set2: { top: '37%', left: '48%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่วะ': { set1: { top: '38%', left: '46%' }, set2: { top: '43%', left: '46%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่ทาน': { set1: { top: '35%', left: '47%' }, set2: { top: '40%', left: '47%' },color: '#ef4444'  },
   'อ่างเก็บน้ำห้วยหลวง': { set1: { top: '34%', left: '47%' }, set2: { top: '39%', left: '47%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่เรียง': { set1: { top: '31%', left: '45%' }, set2: { top: '36%', left: '45%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่ทก': { set1: { top: '36%', left: '48%' }, set2: { top: '41%', left: '48%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำห้วยสมัย': { set1: { top: '37%', left: '48%' }, set2: { top: '42%', left: '48%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่นึง': { set1: { top: '24%', left: '45%' }, set2: { top: '29%', left: '45%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่ค่อม': { set1: { top: '26%', left: '46%' }, set2: { top: '31%', left: '46%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่เฟือง': { set1: { top: '25%', left: '46%' }, set2: { top: '30%', left: '46%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่ต๋ำน้อย': { set1: { top: '27%', left: '46%' }, set2: { top: '32%', left: '46%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่ไพร': { set1: { top: '28%', left: '47%' }, set2: { top: '33%', left: '47%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำห้วยหลวงวังวัว': { set1: { top: '24%', left: '48%' }, set2: { top: '29%', left: '48%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่ทรายทายคำ': { set1: { top: '25%', left: '47%' }, set2: { top: '30%', left: '47%' },color: '#ef4444'  },
   'อ่างเก็บน้ำแม่สัน': { set1: { top: '32%', left: '50%' }, set2: { top: '37%', left: '50%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่ปอน': { set1: { top: '30%', left: '45%' }, set2: { top: '35%', left: '45%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่ยาว': { set1: { top: '31%', left: '46%' }, set2: { top: '36%', left: '46%' },color: '#ef4444'  },
   'อ่างเก็บน้ำห้วยเกี๋ยง': { set1: { top: '29%', left: '45%' }, set2: { top: '34%', left: '45%' },color: '#ef4444'  },
   'อ่างเก็บน้ำแม่กึ๊ด': { set1: { top: '32%', left: '45%' }, set2: { top: '37%', left: '45%' },color: '#ef4444'  },
   'อ่างเก็บน้ำแม่เลียงพัฒนา': { set1: { top: '33%', left: '45%' }, set2: { top: '38%', left: '45%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่ต๋ำตอนล่าง': { set1: { top: '34%', left: '45%' }, set2: { top: '39%', left: '45%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่อาบ': { set1: { top: '31%', left: '49%' }, set2: { top: '36%', left: '49%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่พริก': { set1: { top: '40%', left: '45%' }, set2: { top: '45%', left: '45%' } ,color: '#ef4444' },
   'อ่างเก็บน้ำแม่พริก(ผาวิ่งชู้)': { set1: { top: '41%', left: '45%' }, set2: { top: '46%', left: '45%' },color: '#ef4444'  },
   'อ่างเก็บน้ำแม่ล้อหัก': { set1: { top: '42%', left: '45%' }, set2: { top: '47%', left: '45%' },color: '#1900ff'  }
};

// ... MAP_CAROUSEL_DATA คงเดิม ...
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
      // 🟢 พี่สาวเปลี่ยน bg-gray-900 เป็น bg-white ให้แล้วนะจ๊ะ
      className={`relative overflow-hidden bg-white ${mode === 'report' ? 'w-full aspect-video rounded-lg border-2 border-gray-300 print:border-0 print:fixed print:top-0 print:left-0 print:w-screen print:h-screen print:z-[9999] print:m-0 print:rounded-none' : 'w-full mx-auto'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} group touch-none`}
      style={mode === 'interactive' ? { aspectRatio: '1842 / 1036', maxWidth: '100%' } : {}}
      onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
    >
      <div className="w-full h-full relative origin-center transition-transform duration-300 ease-out will-change-transform" style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
        {mode === 'report' ? (
           <img src={activeSlideData.image} alt={activeSlideData.region} className="absolute inset-0 w-full h-full object-cover object-center print:object-fill" />
        ) : (
           <video key={activeSlideData.id} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-100 transition-opacity duration-500 animate-fade-in">
             <source src={activeSlideData.video} type="video/mp4" />
           </video>
        )}

        {/* Marker ข้อมูลน้ำ */}
       <div className="absolute inset-0 pointer-events-none">
  {currentSlide === 0 && markers.map((item, idx) => {
      // 1. ดึง Config
      const locConfig = STATION_LOCATIONS[item.stationName];
      const overlayPos = STATION_OVERLAYS[item.stationName];

      // 🟢 ตัดระบบสำรองออก: ถ้าไม่มีพิกัด ไม่ต้องแสดงผล
      if (!locConfig) return null;

      // 🟢 ดึงสีจาก Config (ถ้าไม่มีใช้สีขาว)
      const customColor = locConfig.color || 'white';
      
      const calcPercent = (item.current && item.capacity) 
          ? ((item.current / item.capacity) * 100).toFixed(2) 
          : (item.percent || 0).toFixed(2);
      
      return (
        <React.Fragment key={`dyn-${item.id}`}>
           {/* 🌊 กล่อง Overlay ระดับน้ำ (ใช้ตำแหน่งจาก STATION_OVERLAYS หรือถ้าไม่มีก็อิงจาก set1) */}
           {overlayPos && (
             <div 
               className="absolute pointer-events-auto"
               style={{ top: overlayPos.top, left: overlayPos.left, transform: 'translate(-50%, -50%)' }}
             >
               <WaterLevelOverlay percent={calcPercent} imageFrame={damimage} />
             </div>
           )}

           {/* 📝 ตัวเลขชุดที่ 1: ความจุ (เปลี่ยนสีตาม Tag) */}
           <div className="absolute whitespace-nowrap text-center pointer-events-auto hover:scale-110 transition-all" 
                style={{ top: locConfig.set1.top, left: locConfig.set1.left, transform: 'translate(-50%, -50%)' }}>
               <span className="font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]" 
                     style={{ fontSize: '14px', color: customColor }}> {/* 👈 ใส่สีตรงนี้ */}
                   {item.capacity ? parseFloat(item.capacity).toLocaleString() : '-'} 
                   <span className="ml-1 opacity-80" style={{ fontSize: '12px' }}>({calcPercent}%)</span>
               </span>
           </div>

           {/* 📝 ตัวเลขชุดที่ 2: Inflow/Outflow */}
           <div className="absolute whitespace-nowrap text-center pointer-events-auto hover:scale-110 transition-all"
                style={{ top: locConfig.set2.top, left: locConfig.set2.left, transform: 'translate(-50%, -50%)' }}>
               <div className="font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]" 
                    style={{ fontSize: '12px', color: customColor }}> {/* 👈 ใส่สีตรงนี้ด้วย */}
                   <span style={{ filter: 'brightness(1.5)' }}>{item.inflow || '-'}</span>
                   <span className="mx-1 text-white">/</span>
                   <span style={{ filter: 'brightness(0.8)' }}>{item.outflow || '-'}</span>
               </div>
           </div>
        </React.Fragment>
      );
  })}
</div>
      </div>
      
      {/* ส่วนควบคุม UI ด้านล่างคงเดิม */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <button onClick={handlePrev} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full pointer-events-auto print:hidden shadow-lg"><ChevronLeft className="w-8 h-8" /></button>
        <button onClick={handleNext} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full pointer-events-auto print:hidden shadow-lg"><ChevronRight className="w-8 h-8" /></button>
        <div className="absolute bottom-6 left-0 w-full px-6 flex justify-between items-center print:hidden">
          <div className="w-10"></div> 
          <div className="flex space-x-2 bg-black/30 p-2.5 rounded-full backdrop-blur-md border border-white/10 pointer-events-auto">
            {MAP_CAROUSEL_DATA.map((_, idx) => (
              <button key={idx} onClick={() => { setCurrentSlide(idx); setTransform({ x: 0, y: 0, scale: 1 }); }}
                className={`h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-blue-400 w-6 shadow-[0_0_10px_rgba(96,165,250,0.8)]' : 'bg-white/40 w-2 hover:bg-white/70'}`}
              />
            ))}
          </div>
          <div className="flex flex-col space-y-2 pointer-events-auto">
            <button onClick={() => handleZoom(0.5)} className="bg-white/90 p-2 rounded-lg shadow-lg"><Plus className="w-5 h-5"/></button>
            <button onClick={() => handleZoom(-0.5)} className="bg-white/90 p-2 rounded-lg shadow-lg"><Minus className="w-5 h-5"/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoMapComponent;