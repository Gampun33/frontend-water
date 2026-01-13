import React, { useState, useMemo } from "react";
import { Database, Map, Printer } from "lucide-react";
import VideoMapComponent from "../../components/VideoMapComponent";

const DataReportPage = ({ waterData }) => {
  const [reportMode, setReportMode] = useState("table");
  const [fitToPage, setFitToPage] = useState(false);

  // --- 🟢 แก้ไขตรงนี้: ดึงค่าออกมาเป็น Object ที่มีทั้งข้อมูลตารางและข้อมูลแผนที่ ---
  const { FINAL_DISPLAY_DATA, reportItemsOnly } = useMemo(() => {
    // 1. กรองเฉพาะที่ได้รับการ "อนุมัติ" แล้ว
    const approved = waterData.filter((d) => d.status === "approved");

    // 2. ดึงข้อมูล "ล่าสุด" ของแต่ละสถานี (เหมือนหน้า Home)
    const latestMap = {};
    approved.forEach((item) => {
      const currentDate = new Date(item.updated_at || item.date).getTime();
      if (
        !latestMap[item.stationName] ||
        currentDate >
          new Date(
            latestMap[item.stationName].updated_at ||
              latestMap[item.stationName].date
          ).getTime()
      ) {
        latestMap[item.stationName] = item;
      }
    });

    const latestList = Object.values(latestMap);

    // 3. แปลงข้อมูลรายอ่างเก็บน้ำ
    const items = latestList.map((item) => {
      const cap = parseFloat(item.capacity || 0);
      const curr = parseFloat(item.waterLevel || item.current || 0);
      const minCap = parseFloat(item.min_capacity || 0);
      return {
        ...item, // 🟢 เก็บข้อมูลเดิมไว้ด้วย (เช่น lat, lng สำหรับแผนที่)
        id: item.id,
        type: "item",
        name: item.stationName,
        capacity: cap,
        min_cap: minCap,
        current: curr,
        percent: cap > 0 ? (curr / cap) * 100 : 0,
        inflow: parseFloat(item.inflow || 0),
        outflow: parseFloat(item.outflow || 0),
        usable: curr - minCap,
      };
    });

    // 4. คำนวณค่ารวมทั้งหมด (Overlay Header)
    const totals = items.reduce(
      (acc, curr) => ({
        capacity: acc.capacity + curr.capacity,
        min_cap: acc.min_cap + curr.min_cap,
        current: acc.current + curr.current,
        inflow: acc.inflow + curr.inflow,
        outflow: acc.outflow + curr.outflow,
        usable: acc.usable + curr.usable,
      }),
      { capacity: 0, min_cap: 0, current: 0, inflow: 0, outflow: 0, usable: 0 }
    );

    // 5. คืนค่าออกมาเป็นก้อน Object เพื่อให้ข้างนอก (JSX) เรียกใช้ได้
    return {
      FINAL_DISPLAY_DATA: [
        {
          id: "group-real",
          type: "group_header",
          name: `ข้อมูลรวมล่าสุดจาก ${items.length} สถานี (Real-time Database)`,
          ...totals,
          percent:
            totals.capacity > 0 ? (totals.current / totals.capacity) * 100 : 0,
          bg: "bg-blue-900",
          text: "text-white",
        },
        ...items,
      ],
      reportItemsOnly: items, // 👈 ส่งตัวนี้ออกไปให้แผนที่ใช้
    };
  }, [waterData]);

  const handlePrint = () => window.print();

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 animate-fade-in flex flex-col h-[calc(100vh-100px)] print:h-auto print:shadow-none print:p-0">
      <style>{`
        @media print {
          body, #root { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-fit-scale { transform: scale(0.5); transform-origin: top left; width: 200%; }
          .print-bg-teal-700 { background-color: #0f766e !important; }
          .print-bg-teal-800 { background-color: #115e59 !important; }
          .print-bg-blue-900 { background-color: #1e3a8a !important; }
          .print-text-white { color: white !important; }
        }
      `}</style>

      {/* --- Toolbar (เหมือนเดิม) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            รายงานสถานการณ์น้ำ (Detailed Status)
          </h2>
          <p className="text-sm text-gray-500">
            ข้อมูลจริง ณ วันที่ {new Date().toLocaleDateString("th-TH")}
          </p>
        </div>
        <div className="flex space-x-2 items-center">
          <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
            <button
              onClick={() => setReportMode("table")}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                reportMode === "table"
                  ? "bg-white shadow text-teal-700"
                  : "text-gray-500"
              }`}
            >
              <Database className="w-4 h-4 mr-2 inline" /> ตาราง
            </button>
            <button
              onClick={() => setReportMode("map")}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                reportMode === "map"
                  ? "bg-white shadow text-indigo-700"
                  : "text-gray-500"
              }`}
            >
              <Map className="w-4 h-4 mr-2 inline" /> แผนที่
            </button>
          </div>
          {/* ... ส่วนปุ่ม Print เหมือนเดิม ... */}
          <label className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <input
              type="checkbox"
              checked={fitToPage}
              onChange={(e) => setFitToPage(e.target.checked)}
              className="rounded text-teal-600"
            />
            <span>Fit Page</span>
          </label>
          <button
            onClick={handlePrint}
            className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm flex items-center shadow transition"
          >
            <Printer className="w-4 h-4 mr-2" /> Print
          </button>
        </div>
      </div>

      {/* --- Content Area --- */}
      <div
        className={`flex-1 overflow-auto border rounded-lg shadow-inner relative bg-gray-50 print:overflow-visible print:border-none print:shadow-none print:bg-white ${
          fitToPage ? "print-fit-scale" : ""
        }`}
      >
        <div className="bg-white min-w-fit h-full print:w-full">
          {reportMode === "table" && (
            <div className="p-4 bg-white print:p-0">
              <table className="w-full min-w-[1200px] print:min-w-0 border-collapse text-sm">
                <thead className="sticky top-0 z-20 shadow-md print:static print:shadow-none">
                  <tr className="bg-teal-700 print-bg-teal-700 text-white print-text-white text-center">
                    <th
                      rowSpan="2"
                      className="p-3 border-r border-teal-600 w-48 sticky left-0 bg-teal-700 print-bg-teal-700 z-30 print:static"
                    >
                      อ่างเก็บน้ำ
                    </th>
                    <th
                      colSpan="3"
                      className="p-2 border-r border-teal-600 border-b"
                    >
                      ที่ตั้ง
                    </th>
                    <th
                      rowSpan="2"
                      className="p-2 border-r border-teal-600 w-24"
                    >
                      ความจุ
                      <br />
                      (ล้าน ลบ.ม.)
                    </th>
                    <th
                      rowSpan="2"
                      className="p-2 border-r border-teal-600 w-24"
                    >
                      รนก.ต่ำสุด
                      <br />
                      (ล้าน ลบ.ม.)
                    </th>
                    <th
                      colSpan="2"
                      className="p-2 border-r border-teal-600 border-b"
                    >
                      ปริมาณน้ำปัจจุบัน
                    </th>
                    <th
                      colSpan="2"
                      className="p-2 border-r border-teal-600 border-b"
                    >
                      การบริหารจัดการน้ำ (ล้าน ลบ.ม.)
                    </th>
                    <th rowSpan="2" className="p-2 w-24">
                      ปริมาณน้ำ
                      <br />
                      ใช้การได้
                    </th>
                  </tr>
                  <tr className="bg-teal-800 print-bg-teal-800 text-white print-text-white text-xs text-center">
                    <th className="p-2 w-24 border-r border-teal-600">ตำบล</th>
                    <th className="p-2 w-24 border-r border-teal-600">อำเภอ</th>
                    <th className="p-2 w-24 border-r border-teal-600">
                      จังหวัด
                    </th>
                    <th className="p-2 w-24 border-r border-teal-600">
                      จำนวน
                      <br />
                      (ล้าน ลบ.ม.)
                    </th>
                    <th className="p-2 w-20 border-r border-teal-600">
                      % ความจุ
                    </th>
                    <th className="p-2 w-24 border-r border-teal-600">
                      น้ำไหลเข้า
                    </th>
                    <th className="p-2 w-24 border-r border-teal-600">
                      ระบายออก
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {FINAL_DISPLAY_DATA.map((row) => {
                    if (row.type === "group_header") {
                      return (
                        <tr
                          key={row.id}
                          className={`${row.bg} print-bg-blue-900 ${row.text} print-text-white font-bold`}
                        >
                          <td
                            colSpan="4"
                            className="p-3 text-left sticky left-0 z-10 bg-inherit border-r border-white/20 print:static"
                          >
                            {row.name}
                          </td>
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
                        </tr>
                      );
                    }
                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="p-3 font-medium text-gray-900 border-r sticky left-0 bg-white hover:bg-blue-50 z-10 drop-shadow-sm whitespace-nowrap print:static print:shadow-none">
                          {row.name}
                        </td>
                        <td className="p-2 text-gray-500 text-center text-xs">
                          {row.tambon}
                        </td>
                        <td className="p-2 text-gray-500 text-center text-xs">
                          {row.amphoe}
                        </td>
                        <td className="p-2 text-gray-500 text-center text-xs">
                          {row.province}
                        </td>
                        <td className="p-2 text-right border-l font-mono text-gray-700">
                          {Number(row.capacity || 0).toFixed(3)}
                        </td>
                        <td className="p-2 text-right font-mono text-gray-400 text-xs">
                          {Number(row.min_cap || 0).toFixed(3)}
                        </td>
                        <td className="p-2 text-right font-mono font-medium text-blue-700 border-l">
                          {Number(row.current || 0).toFixed(3)}
                        </td>
                        <td className="p-2 text-center border-r">
                          <div
                            className={`inline-block px-2 py-0.5 rounded text-xs font-bold w-16 ${
                              row.percent > 100
                                ? "bg-blue-600 text-white"
                                : "bg-green-100 text-green-700"
                            }`}
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {reportMode === "map" && (
            <div className="w-full flex justify-center bg-gray-100 p-2 print:block">
              <div
                className="w-full max-w-5xl shadow-inner border rounded-lg overflow-hidden bg-white"
                style={{ aspectRatio: "16/9" }}
              >
                {" "}
                {/* 👈 ลองปรับค่า aspect ratio ให้ตรงกับรูปแผนที่ของน้อง */}
                <VideoMapComponent mode="report" markers={reportItemsOnly} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataReportPage;
