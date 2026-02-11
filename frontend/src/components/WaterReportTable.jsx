import React from "react";
import { Database, Info, ArrowUp, ArrowDown, Minus } from "lucide-react";

const WaterReportTable = ({ data = [], selectedDate }) => {
  
  // 🟢 แก้ไข: แปลงวันที่แบบไม่อิง Timezone (Fix Date Delay)
  const formatThaiDate = (dateString) => {
    if (!dateString) return "";
    // แยกปี-เดือน-วัน จาก String โดยตรง เพื่อไม่ให้ Browser ปรับ Timezone เอง
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const getPercentColor = (percent) => {
    const val = parseFloat(percent || 0);
    if (val > 100) return "bg-red-600 text-white shadow-md";
    if (val >= 80) return "bg-blue-600 text-white";
    if (val >= 50) return "bg-green-100 text-green-700";
    if (val >= 30) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const TrendIcon = ({ diff }) => {
    const val = parseFloat(diff);
    if (isNaN(val) || val === 0)
      return <Minus className="w-3 h-3 text-gray-300 inline ml-1" />;

    if (val > 0)
      return (
        <span
          className="inline-flex items-center ml-1 text-[10px] text-green-600 font-bold bg-green-50 px-1 rounded-full"
          title={`เพิ่มขึ้น ${val.toFixed(2)}`}
        >
          <ArrowUp className="w-3 h-3 mr-0.5" />
          {Math.abs(val).toFixed(1)}
        </span>
      );

    return (
      <span
        className="inline-flex items-center ml-1 text-[10px] text-orange-600 font-bold bg-orange-50 px-1 rounded-full"
        title={`ลดลง ${val.toFixed(2)}`}
      >
        <ArrowDown className="w-3 h-3 mr-0.5" />
        {Math.abs(val).toFixed(1)}
      </span>
    );
  };

  const LegendBar = () => (
    <div className="flex flex-wrap gap-2 items-center justify-end mb-4 text-xs text-gray-600 print:mb-2 print:text-[10px]">
      <span className="font-bold mr-2 flex items-center">
        <Info className="w-3 h-3 mr-1" /> เกณฑ์ปริมาณน้ำ:
      </span>
      <div className="flex items-center space-x-1">
        <span className="w-3 h-3 rounded-full bg-red-600 "></span>
        <span>&gt;100% (ล้น)</span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="w-3 h-3 rounded-full bg-blue-600"></span>
        <span>80-100% (มาก)</span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="w-3 h-3 rounded-full bg-green-500"></span>
        <span>50-79% (ปกติ)</span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
        <span>30-49% (น้อย)</span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="w-3 h-3 rounded-full bg-red-400"></span>
        <span>&lt;30% (วิกฤต)</span>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-white print:p-0">
      {/* Header สำหรับตอนปริ้น */}
      <div className="hidden print:block mb-4 text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          รายงานสถานการณ์น้ำและเขื่อน
        </h1>
        <p className="text-sm text-gray-500">
          ข้อมูลประจำ{formatThaiDate(selectedDate)}
        </p>
        <p className="text-[10px] text-gray-400 mt-1 text-right">
          พิมพ์เมื่อ: {new Date().toLocaleString("th-TH")}
        </p>
      </div>

      <LegendBar />

      <table className="w-full min-w-[1200px] print:min-w-0 border-collapse text-sm">
        <thead className="sticky top-0 z-20 shadow-md print:static print:shadow-none">
          <tr className="bg-gray-800 text-white text-center">
            <th
              rowSpan="2"
              className="p-3 border-r border-gray-600 w-48 sticky left-0 bg-gray-800 z-30 print:static"
            >
              สถานี / อ่างเก็บน้ำ
            </th>
            <th colSpan="3" className="p-2 border-r border-gray-600 border-b">
              ที่ตั้ง
            </th>
            <th rowSpan="2" className="p-2 border-r border-gray-600 w-24">
              ความจุ
              <br />
              (ล้าน ลบ.ม.)
            </th>
            <th rowSpan="2" className="p-2 border-r border-gray-600 w-24">
              รนก.ต่ำสุด
              <br />
              (ล้าน ลบ.ม.)
            </th>
            <th colSpan="2" className="p-2 border-r border-gray-600 border-b">
              ปริมาณน้ำปัจจุบัน
            </th>
            <th colSpan="2" className="p-2 border-r border-gray-600 border-b">
              การบริหารจัดการน้ำ (ล้าน ลบ.ม.)
            </th>
            <th rowSpan="2" className="p-2 w-24">
              ปริมาณน้ำ
              <br />
              ใช้การได้
            </th>
          </tr>
          <tr className="bg-gray-700 text-white text-xs text-center">
            <th className="p-2 w-24 border-r border-gray-600">ตำบล</th>
            <th className="p-2 w-24 border-r border-gray-600">อำเภอ</th>
            <th className="p-2 w-24 border-r border-gray-600">จังหวัด</th>
            <th className="p-2 w-24 border-r border-gray-600">
              จำนวน / ฝน(มม.)
            </th>
            <th className="p-2 w-20 border-r border-gray-600">% ความจุ</th>
            <th className="p-2 w-24 border-r border-gray-600">น้ำไหลเข้า</th>
            <th className="p-2 w-24 border-r border-gray-600">ระบายออก</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan="11" className="p-16 text-center text-gray-400">
                <div className="flex flex-col items-center">
                  <Database className="w-10 h-10 mb-2 opacity-50" />
                  <span className="font-bold">
                    ไม่พบข้อมูลรายงานในวันที่เลือก
                  </span>
                  <span className="text-xs mt-1">
                    ({formatThaiDate(selectedDate)})
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row) => {
              if (row.type === "group_header") {
                let bgClass = "print-bg-teal-700";
                if (row.bg === "bg-indigo-900")
                  bgClass = "print-bg-indigo-900";
                if (row.bg === "bg-cyan-700") bgClass = "print-bg-cyan-700";

                return (
                  <tr
                    key={row.id}
                    className={`${row.bg} ${bgClass} ${row.text} print-text-white font-bold`}
                  >
                    <td
                      colSpan="4"
                      className="p-3 text-left sticky left-0 z-10 bg-inherit border-r border-white/20 print:static"
                    >
                      {row.name}
                    </td>

                    {row.groupType === "rain" ? (
                      <>
                        <td className="p-3 text-right">-</td>
                        <td className="p-3 text-right">-</td>
                        <td className="p-3 text-right bg-white/20 text-white font-extrabold">
                          {Number(row.rainAmount || 0).toFixed(2)}
                        </td>
                        <td className="p-3 text-center">-</td>
                        <td className="p-3 text-right">-</td>
                        <td className="p-3 text-right">-</td>
                        <td className="p-3 text-right">-</td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 text-right">
                          {Number(row.capacity || 0).toFixed(3)}
                        </td>
                        <td className="p-3 text-right">
                          {Number(row.min_cap || 0).toFixed(3)}
                        </td>
                        <td className="p-3 text-right">
                          {Number(row.current || 0).toFixed(3)}
                        </td>
                        <td
                          className={`p-3 text-center ${
                            row.percent > 100
                              ? "bg-red-500/20 text-red-200"
                              : ""
                          }`}
                        >
                          {Number(row.percent || 0).toFixed(2)}%
                        </td>
                        <td className="p-3 text-right">
                          {Number(row.inflow || 0).toFixed(3)}
                        </td>
                        <td className="p-3 text-right">
                          {Number(row.outflow || 0).toFixed(3)}
                        </td>
                        <td className="p-3 text-right">
                          {Number(row.usable || 0).toFixed(3)}
                        </td>
                      </>
                    )}
                  </tr>
                );
              }

              return (
                <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                  <td className="p-3 font-medium text-gray-900 border-r sticky left-0 bg-white hover:bg-blue-50 z-10 drop-shadow-sm whitespace-nowrap print:static print:shadow-none">
                    {row.name}
                  </td>
                  <td className="p-2 text-gray-500 text-center text-xs">
                    {row.tambon || "-"}
                  </td>
                  <td className="p-2 text-gray-500 text-center text-xs">
                    {row.amphoe || "-"}
                  </td>
                  <td className="p-2 text-gray-500 text-center text-xs">
                    {row.province || "-"}
                  </td>

                  {row.groupType === "rain" ? (
                    <>
                      <td className="p-2 text-center border-l font-mono text-gray-400">
                        -
                      </td>
                      <td className="p-2 text-center font-mono text-gray-400 text-xs">
                        -
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-cyan-600 border-l whitespace-nowrap">
                        {Number(row.rainAmount || 0).toFixed(2)}
                        <TrendIcon diff={row.diff} />
                      </td>
                      <td className="p-2 text-center border-r font-mono text-gray-400 text-xs">
                        -
                      </td>
                      <td className="p-2 text-center font-mono border-r text-gray-400">
                        -
                      </td>
                      <td className="p-2 text-center font-mono border-r text-gray-400">
                        -
                      </td>
                      <td className="p-2 text-center font-mono text-gray-400">
                        -
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2 text-right border-l font-mono text-gray-700">
                        {Number(row.capacity || 0).toFixed(3)}
                      </td>
                      <td className="p-2 text-right font-mono text-gray-400 text-xs">
                        {Number(row.min_cap || 0).toFixed(3)}
                      </td>
                      <td className="p-2 text-right font-mono font-medium text-blue-700 border-l whitespace-nowrap">
                        {Number(row.current || 0).toFixed(3)}
                        <TrendIcon diff={row.diff} />
                      </td>
                      <td className="p-2 text-center border-r">
                        <div
                          className={`inline-block px-2 py-0.5 rounded text-xs font-bold w-16 ${getPercentColor(
                            row.percent
                          )}`}
                        >
                          {Number(row.percent || 0).toFixed(2)}%
                        </div>
                      </td>
                      <td className="p-2 text-right font-mono border-r">
                        {Number(row.inflow || 0).toFixed(3)}
                      </td>
                      <td className="p-2 text-right font-mono border-r">
                        {Number(row.outflow || 0).toFixed(3)}
                      </td>
                      <td className="p-2 text-right font-mono font-semibold text-gray-800">
                        {Number(row.usable || 0).toFixed(3)}
                      </td>
                    </>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WaterReportTable;