import React from "react";
import { Droplets, CloudRain, Info } from "lucide-react";
import VideoMapComponent from "./VideoMapComponent";

const WaterReportMap = ({ markers = [], rainMarkers = [], selectedDate }) => {
  
  // Helper แปลงวันที่ (แก้ Timezone Delay)
  const formatThaiDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("th-TH", {
      year: "numeric", month: "long", day: "numeric", weekday: "long",
    });
  };

  // Helper Legend
  const MapLegend = () => (
    <div className="flex gap-3 text-[10px] text-gray-600 border px-2 py-1 rounded bg-white">
      <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-600 mr-1"></span>น้ำมาก (&gt;80%)</div>
      <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>ปกติ (50-79%)</div>
      <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></span>น้อย (30-49%)</div>
      <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-400 mr-1"></span>วิกฤต (&lt;30%)</div>
    </div>
  );

  return (
    // 🟢 ใช้โครงสร้างเดิมที่สเกลไม่เพี้ยน (w-full flex justify-center bg-gray-100 p-2 print:block)
    // ตัด flex-col ที่อาจทำให้ map ขยับออก แล้วใช้ display: block ตอนปริ้นแทน
    <div className="w-full flex justify-center bg-gray-100 p-2 print:block print:bg-white print:p-0">
      
      {/* 🟢 Print Header: ซ่อนปกติ / แสดงตอนปริ้น (แยกส่วนไม่กวน Flex เดิม) */}
      <div className="hidden print:flex w-full max-w-5xl mx-auto justify-between items-end mb-2 border-b pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">แผนที่รายงานสถานการณ์น้ำ</h1>
          <p className="text-sm text-gray-500">ข้อมูล ณ วันที่ {formatThaiDate(selectedDate)}</p>
        </div>
        <MapLegend />
      </div>

      {/* 🟢 Map Container: คง Class เดิมของน้องไว้เป๊ะๆ เพื่อรักษาสเกล */}
      <div
        className="w-full max-w-5xl shadow-inner border rounded-lg overflow-hidden bg-white mx-auto print:shadow-none print:border-2 print:border-gray-300"
        style={{ aspectRatio: "16/9" }}
      >
        <VideoMapComponent
          mode="report"
          markers={markers}
          rainMarkers={rainMarkers}
        />
      </div>

      {/* 🟢 Print Footer: ซ่อนปกติ / แสดงตอนปริ้น */}
      <div className="hidden print:grid grid-cols-2 gap-4 w-full max-w-5xl mx-auto mt-4">
        <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Droplets className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">สถานีน้ำ/เขื่อน</p>
            <p className="text-xl font-bold text-gray-800">
              {markers.length} <span className="text-xs font-normal">แห่ง</span>
            </p>
          </div>
        </div>
        <div className="flex items-center p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
          <CloudRain className="w-8 h-8 text-cyan-600 mr-3" />
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">สถานีน้ำฝน</p>
            <p className="text-xl font-bold text-gray-800">
              {rainMarkers.length} <span className="text-xs font-normal">แห่ง</span>
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default WaterReportMap;