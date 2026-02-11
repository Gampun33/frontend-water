import React, { useState, useEffect, useRef } from 'react';
import { Database, Save, Loader, User, CloudRain, Droplets, Building2, Activity, FileSpreadsheet, Upload, Download, Edit } from 'lucide-react'; // 🟢 เพิ่ม Edit Icon
import { MysqlService } from '../../services/mysqlService';
import { getBangkokDate } from '../../utils/helpers';
import * as XLSX from 'xlsx';

// Import Config
import { STATION_DATA, RAIN_STATION_DATA, DAM_STATION_DATA } from '../../components/stationConfig'; 

const AddDataPage = ({ user, refreshData, initialData, onClearEditing }) => {
  const [reportMode, setReportMode] = useState('water');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({ 
    id: null, 
    stationName: '', 
    date: getBangkokDate(), 
    waterLevel: '', inflow: '', outflow: '', 
    rainAmount: '', 
    currentStorage: '', usableStorage: '', 
    capacity: '', tambon: '', amphoe: '', province: 'ลำปาง', groupId: ''
  });

  // 🟢 1. useEffect ดักจับข้อมูลแก้ไข (Auto Fill)
  useEffect(() => {
    if (initialData) {
      setReportMode(initialData.reportType);

      const formattedDate = initialData.date 
        ? (typeof initialData.date === 'string' ? initialData.date.split('T')[0] : getBangkokDate(initialData.date))
        : getBangkokDate();

      setFormData({
        id: initialData.id,
        stationName: initialData.stationName || initialData.station_name || '',
        date: formattedDate,
        waterLevel: initialData.waterLevel || initialData.water_level || '',
        inflow: initialData.inflow || '',
        outflow: initialData.outflow || '',
        rainAmount: initialData.rainAmount || '',
        currentStorage: initialData.currentStorage || initialData.current_storage || '',
        usableStorage: initialData.usableStorage || initialData.usable_storage || '',
        capacity: initialData.capacity || '',
        tambon: initialData.tambon || '',
        amphoe: initialData.amphoe || '',
        province: initialData.province || 'ลำปาง',
        groupId: initialData.groupId || initialData.group_id || ''
      });
    } else {
        setFormData(prev => ({ ...prev, id: null }));
    }
  }, [initialData]);

  // useEffect เคลียร์ค่าเมื่อเปลี่ยน Tab (ทำเฉพาะตอนไม่ได้ Edit)
  useEffect(() => {
    if (!initialData) { 
        setFormData({ 
          id: null,
          stationName: '', date: getBangkokDate(), 
          waterLevel: '', inflow: '', outflow: '', 
          rainAmount: '', 
          currentStorage: '', usableStorage: '', 
          capacity: '', tambon: '', amphoe: '', province: 'ลำปาง', groupId: '' 
        });
    }
  }, [reportMode]); 

  // --- Helper Functions ---
  const excelDateToJSDate = (serial) => {
     if (!serial) return getBangkokDate();
     if (typeof serial === 'string' && serial.includes('-')) return serial;
     const utc_days  = Math.floor(serial - 25569);
     const utc_value = utc_days * 86400;                                      
     const date_info = new Date(utc_value * 1000);
     return date_info.toISOString().split('T')[0];
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length > 0) {
            if(window.confirm(`พบข้อมูล ${data.length} แถว ต้องการนำเข้าหรือไม่?`)) {
                await processExcelData(data);
            }
        } else {
            alert("ไม่พบข้อมูลในไฟล์ Excel");
        }
        e.target.value = null; 
    };
    reader.readAsBinaryString(file);
  };

  const processExcelData = async (data) => {
    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;
    const creatorName = user?.fullName || user?.username || 'System Import';

    try {
        // Validation: ตรวจสอบหัวตาราง
        const firstRow = data[0]; 
        const keys = Object.keys(firstRow);
        
        let requiredColumns = [];
        let modeName = "";

        if (reportMode === 'water') {
            requiredColumns = ['ระดับน้ำ', 'waterLevel'];
            modeName = "ข้อมูลน้ำทั่วไป";
        } else if (reportMode === 'rain') {
            requiredColumns = ['ปริมาณฝน', 'rainAmount'];
            modeName = "ปริมาณน้ำฝน";
        } else if (reportMode === 'dam') {
            requiredColumns = ['ปริมาณน้ำ', 'currentStorage'];
            modeName = "ปริมาณน้ำในเขื่อน";
        }

        const hasValidColumn = requiredColumns.some(col => keys.includes(col));

        if (!hasValidColumn) {
            alert(`❌ ไฟล์ไม่ถูกต้อง!\n\nคุณกำลังอยู่โหมด: "${modeName}"\nแต่ไฟล์ที่อัปโหลดไม่มีคอลัมน์: ${requiredColumns[0]}\n\nกรุณาตรวจสอบไฟล์ หรือโหลด Template ใหม่`);
            setIsSaving(false);
            return;
        }

        for (const row of data) {
            try {
                const commonData = {
                    stationName: row['ชื่อสถานี'] || row['station'] || '',
                    date: excelDateToJSDate(row['วันที่'] || row['date']),
                    createdBy: creatorName,
                    province: 'ลำปาง'
                };

                if (!commonData.stationName) continue;

                let payload = {};
                let result = null;

                if (reportMode === 'water') {
                    const s = STATION_DATA.find(x => x.name === commonData.stationName);
                    payload = {
                        ...commonData,
                        waterLevel: row['ระดับน้ำ'] || row['waterLevel'] || "",
                        inflow: row['น้ำเข้า'] || row['inflow'] || "",
                        outflow: row['ระบายออก'] || row['outflow'] || "",
                        tambon: s?.tambon || "-",
                        amphoe: s?.amphoe || "-",
                        groupId: s?.groupId || ""
                    };
                    result = await MysqlService.createReport(payload);
                } 
                else if (reportMode === 'rain') {
                    const s = RAIN_STATION_DATA.find(x => x.name === commonData.stationName);
                    payload = {
                        ...commonData,
                        rainAmount: row['ปริมาณฝน'] || row['rain'] || "",
                        tambon: s?.tambon || "-",
                        amphoe: s?.amphoe || commonData.stationName,
                    };
                    result = await MysqlService.createRainReport(payload);
                }
                else if (reportMode === 'dam') {
                    const s = DAM_STATION_DATA.find(x => x.name === commonData.stationName);
                    payload = {
                        ...commonData,
                        currentStorage: row['ปริมาณน้ำ'] || row['current'] || "",
                        usableStorage: row['น้ำใช้การ'] || row['usable'] || "",
                        capacity: s?.capacity || ""
                    };
                    result = await MysqlService.createDamReport(payload);
                }

                if (result) successCount++;

            } catch (err) {
                console.error("Error saving row:", row, err);
                errorCount++;
            }
        }

        alert(`✅ นำเข้าเสร็จสิ้น\n- สำเร็จ: ${successCount} รายการ\n- ล้มเหลว: ${errorCount} รายการ`);
        if (refreshData) refreshData();

    } catch (e) {
        alert('Critical Error: ' + e.message);
    } finally {
        setIsSaving(false);
    }
  };

  const downloadTemplate = () => {
      let headers = [];
      let sample = [];

      if (reportMode === 'water') {
          headers = ['ชื่อสถานี', 'วันที่', 'ระดับน้ำ', 'น้ำเข้า', 'ระบายออก'];
          sample = ['เขื่อนกิ่วลม', getBangkokDate(), '103.5', '5.2', '2.1'];
      } else if (reportMode === 'rain') {
          headers = ['ชื่อสถานี', 'วันที่', 'ปริมาณฝน'];
          sample = ['เมืองลำปาง', getBangkokDate(), '15.5'];
      } else {
          headers = ['ชื่อสถานี', 'วันที่', 'ปริมาณน้ำ', 'น้ำใช้การ'];
          sample = ['เขื่อนกิ่วลม', getBangkokDate(), '85.4', '80.1'];
      }

      const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, `Template_${reportMode}.xlsx`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (reportMode === 'water' && name === 'stationName') {
      const s = STATION_DATA.find(item => item.name === value);
      setFormData(prev => ({
        ...prev,
        stationName: value,
        capacity: s ? s.capacity : '',
        tambon: s ? s.tambon : '',
        amphoe: s ? s.amphoe : '',
        province: s ? s.province : 'ลำปาง',
        groupId: s ? s.groupId : ''
      }));
    } 
    else if (reportMode === 'rain' && name === 'stationName') {
      const s = RAIN_STATION_DATA.find(item => item.name === value);
      setFormData(prev => ({
        ...prev,
        stationName: value,
        amphoe: s ? s.amphoe : value,
        tambon: s ? s.tambon : '-',
        province: 'ลำปาง'
      }));
    }
    else if (reportMode === 'dam' && name === 'stationName') {
      const s = DAM_STATION_DATA.find(item => item.name === value);
      setFormData(prev => ({
        ...prev,
        stationName: value,
        capacity: s ? s.capacity : '',
        tambon: '-', amphoe: '-', province: 'ลำปาง'
      }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const creatorName = user.fullName || user.username;
      let result = null;

      // 🟢 เช็คว่าเป็นการ "แก้ไข" (มี ID) หรือ "เพิ่มใหม่"
      const isEditMode = !!formData.id; 

      if (reportMode === 'water') {
        const payload = {
            stationName: formData.stationName,
            date: formData.date,
            waterLevel: formData.waterLevel || "",
            inflow: formData.inflow || "",
            outflow: formData.outflow || "",
            tambon: formData.tambon || "-",
            amphoe: formData.amphoe,
            province: formData.province || "ลำปาง",
            groupId: formData.groupId || "",
            createdBy: creatorName,
            status: 'pending' 
        };
        
        if (isEditMode) {
            result = await MysqlService.updateReport(formData.id, payload);
        } else {
            result = await MysqlService.createReport(payload);
        }
      }
      else if (reportMode === 'rain') {
         const payload = {
            stationName: formData.stationName,
            date: formData.date,
            rainAmount: formData.rainAmount || "",
            tambon: formData.tambon || "-",
            amphoe: formData.amphoe,
            province: formData.province || "ลำปาง",
            createdBy: creatorName,
            status: 'pending'
         };
         if (isEditMode) result = await MysqlService.updateRainReport(formData.id, payload);
         else result = await MysqlService.createRainReport(payload);
      }
      else if (reportMode === 'dam') {
         const payload = {
            stationName: formData.stationName,
            date: formData.date,
            currentStorage: formData.currentStorage || "",
            usableStorage: formData.usableStorage || "",
            capacity: formData.capacity || "",
            createdBy: creatorName,
            status: 'pending'
         };
         if (isEditMode) result = await MysqlService.updateDamReport(formData.id, payload);
         else result = await MysqlService.createDamReport(payload);
      }

      if (result) {
        alert(`✅ ${isEditMode ? 'แก้ไข' : 'บันทึก'}ข้อมูลสำเร็จ!`);
        setFormData({ 
          id: null,
          stationName: '', date: getBangkokDate(), waterLevel: '', 
          inflow: '', outflow: '', rainAmount: '', 
          currentStorage: '', usableStorage: '', 
          capacity: '', tambon: '', amphoe: '', province: 'ลำปาง', groupId: '' 
        });
        
        // 🟢 เรียกเคลียร์ค่า editingData ที่ App.js
        if (onClearEditing) onClearEditing();
        
        if (refreshData) refreshData();
      }
    } catch (e) {
      alert('❌ Error: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          {/* เปลี่ยนไอคอนและข้อความตามสถานะ (Add/Edit) */}
          {initialData ? <Edit className="w-6 h-6 mr-3 text-orange-500" /> : <Database className={`w-6 h-6 mr-3 ${reportMode === 'water' ? 'text-blue-600' : reportMode === 'rain' ? 'text-cyan-600' : 'text-indigo-600'}`} />} 
          
          <span className={initialData ? "text-orange-600" : ""}>
             {initialData ? 'แก้ไขข้อมูล:' : 'บันทึกข้อมูล:'} 
          </span>
          
          <span className="ml-2 underline decoration-2 underline-offset-4 text-gray-800">
            {reportMode === 'water' ? 'สถานการณ์น้ำ (ทั่วไป)' : reportMode === 'rain' ? 'ปริมาณน้ำฝน' : 'ปริมาณน้ำในเขื่อน'}
          </span>
        </h2>

        {!initialData && ( 
            <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
                <button onClick={downloadTemplate} className="flex items-center px-3 py-2 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition" title="ดาวน์โหลดตัวอย่างไฟล์"><Download className="w-4 h-4 mr-1" /> Template</button>
                <button onClick={() => fileInputRef.current.click()} className="flex items-center px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md transition"><FileSpreadsheet className="w-4 h-4 mr-2" /> Import Excel</button>
            </div>
        )}
      </div>

      {!initialData && (
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner mb-6">
            <button onClick={() => setReportMode('water')} className={`flex-1 flex justify-center items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${reportMode === 'water' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-blue-600'}`}>
                <Droplets className="w-4 h-4 mr-2" /> ข้อมูลน้ำ
            </button>
            <button onClick={() => setReportMode('rain')} className={`flex-1 flex justify-center items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${reportMode === 'rain' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-500 hover:text-cyan-600'}`}>
                <CloudRain className="w-4 h-4 mr-2" /> ข้อมูลฝน
            </button>
            <button onClick={() => setReportMode('dam')} className={`flex-1 flex justify-center items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${reportMode === 'dam' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-indigo-600'}`}>
                <Building2 className="w-4 h-4 mr-2" /> น้ำเขื่อน
            </button>
          </div>
      )}

      {/* User Info */}
      <div className={`border rounded-xl p-4 mb-6 flex items-center justify-between ${
          reportMode === 'water' ? 'bg-blue-50 border-blue-200' : 
          reportMode === 'rain' ? 'bg-cyan-50 border-cyan-200' : 
          'bg-indigo-50 border-indigo-200'
      }`}>
        <div className="flex items-center">
          <div className={`p-2 rounded-full mr-3 ${reportMode === 'water' ? 'bg-blue-200' : reportMode === 'rain' ? 'bg-cyan-200' : 'bg-indigo-200'}`}>
            <User className={`w-5 h-5 ${reportMode === 'water' ? 'text-blue-700' : reportMode === 'rain' ? 'text-cyan-700' : 'text-indigo-700'}`} />
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase ${reportMode === 'water' ? 'text-blue-600' : reportMode === 'rain' ? 'text-cyan-600' : 'text-indigo-600'}`}>เจ้าหน้าที่บันทึก</p>
            <p className="text-lg font-bold text-gray-800">{user.fullName || user.username}</p>
          </div>
        </div>
      </div>

      {/* Badge สถานที่ */}
      {(formData.stationName && reportMode !== 'dam') && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <div className="p-4 rounded-xl border-2 flex flex-col shadow-sm bg-gray-50 border-gray-200">
            <span className="text-[10px] font-black uppercase text-gray-400">ตำบล</span>
            <span className="text-lg font-bold text-gray-700">{formData.tambon || '-'}</span>
          </div>
          <div className="p-4 rounded-xl border-2 flex flex-col shadow-sm bg-gray-50 border-gray-200">
            <span className="text-[10px] font-black uppercase text-gray-400">อำเภอ</span>
            <span className="text-lg font-bold text-gray-700">{formData.amphoe || '-'}</span>
          </div>
          <div className="p-4 rounded-xl border-2 flex flex-col shadow-sm bg-gray-50 border-gray-200">
            <span className="text-[10px] font-black uppercase text-gray-400">จังหวัด</span>
            <span className="text-lg font-bold text-gray-700">{formData.province || 'ลำปาง'}</span>
          </div>
        </div>
      )}

      {/* Form Section */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
        
        {/* Row 1: เลือกสถานี + วันที่ */}
        <div>
          <label className={`block text-sm font-bold mb-1 ${
              reportMode === 'water' ? 'text-blue-700' : reportMode === 'rain' ? 'text-cyan-700' : 'text-indigo-700'
          }`}>
            {reportMode === 'water' ? 'ชื่อสถานี/อ่างเก็บน้ำ' : 
             reportMode === 'rain' ? 'พื้นที่/อำเภอที่ตรวจวัด' : 
             'เลือกเขื่อน/อ่างเก็บน้ำ'}
          </label>
          <select 
            name="stationName" 
            value={formData.stationName} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 outline-none bg-white font-bold transition-all focus:ring-blue-500" 
            required
            disabled={!!initialData} // ห้ามเปลี่ยนสถานีตอน Edit
          >
            <option value="">-- กรุณาเลือก --</option>
            {reportMode === 'water' && STATION_DATA.map((s) => (<option key={s.name} value={s.name}>{s.name}</option>))}
            {reportMode === 'rain' && RAIN_STATION_DATA.map((r) => (<option key={r.name} value={r.name}>{r.name}</option>))}
            {reportMode === 'dam' && DAM_STATION_DATA.map((d) => (<option key={d.name} value={d.name}>{d.name}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">วันที่ตรวจวัด</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
        </div>

        {/* Row 2: Input เปลี่ยนตามโหมด */}
        <div className="md:col-span-2 mt-2 pt-4 border-t border-gray-200">
          
          {/* CASE 1: WATER */}
          {reportMode === 'water' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">ระดับน้ำ (Water Level)</label>
                <div className="relative">
                  <input type="number" step="0.01" name="waterLevel" value={formData.waterLevel} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" required />
                  <span className="absolute right-4 top-3.5 text-gray-400 text-xs font-bold">ม.รทก.</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">น้ำเข้า (Inflow)</label>
                  <input type="number" step="0.01" name="inflow" value={formData.inflow} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">ระบายออก (Outflow)</label>
                  <input type="number" step="0.01" name="outflow" value={formData.outflow} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
                </div>
              </div>
            </div>
          )}

          {/* CASE 2: RAIN */}
          {reportMode === 'rain' && (
            <div className="bg-cyan-50 p-8 rounded-2xl border-2 border-cyan-100 shadow-inner animate-fade-in">
               <label className="block text-lg font-bold text-cyan-800 mb-4 flex items-center justify-center">
                 <CloudRain className="w-6 h-6 mr-2" /> ปริมาณน้ำฝน (24 ชั่วโมง)
               </label>
               <div className="relative max-w-sm mx-auto">
                 <input 
                   type="number" step="0.1" name="rainAmount" value={formData.rainAmount} onChange={handleChange} 
                   className="w-full px-8 py-5 text-4xl font-mono text-center text-cyan-900 border-2 border-cyan-200 rounded-2xl focus:ring-4 focus:ring-cyan-500 outline-none shadow-sm" 
                   placeholder="0.0" required 
                 />
                 <span className="absolute right-8 top-7 text-cyan-500 font-black text-xl uppercase">mm.</span>
               </div>
            </div>
          )}

          {/* CASE 3: DAM */}
          {reportMode === 'dam' && (
             <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 animate-fade-in space-y-4">
                <div className="flex items-center mb-2">
                    <Building2 className="w-5 h-5 text-indigo-600 mr-2" />
                    <h3 className="font-bold text-indigo-800">ข้อมูลปริมาณน้ำในอ่าง (Storage)</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                        <Database className="w-4 h-4 mr-2 text-indigo-500"/>
                        ปริมาณน้ำปัจจุบัน
                      </label>
                      <div className="relative">
                         <input type="number" step="0.01" name="currentStorage" value={formData.currentStorage} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 font-bold text-gray-800" placeholder="0.00" required />
                         <span className="absolute right-4 top-3.5 text-xs text-gray-400 font-bold">ล้าน ลบ.ม.</span>
                      </div>
                   </div>
                   
                   <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm">
                      <label className="block text-sm font-bold text-green-700 mb-2 flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-green-500"/>
                        น้ำใช้การได้
                      </label>
                      <div className="relative">
                         <input type="number" step="0.01" name="usableStorage" value={formData.usableStorage} onChange={handleChange} className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 font-bold text-green-800" placeholder="0.00" required />
                         <span className="absolute right-4 top-3.5 text-xs text-green-400 font-bold">ล้าน ลบ.ม.</span>
                      </div>
                   </div>
                </div>
                {formData.capacity && (
                    <div className="text-right text-xs text-gray-500 mt-2">
                        ความจุอ่างเก็บน้ำ: <span className="font-bold">{formData.capacity}</span> ล้าน ลบ.ม.
                    </div>
                )}
             </div>
          )}

        </div>

        {/* ปุ่ม Submit */}
        <div className="md:col-span-2 mt-6 flex gap-3">
          {/* 🟢 ถ้ากำลังแก้ไข มีปุ่มยกเลิกให้ด้วย */}
          {initialData && (
              <button 
                type="button" 
                onClick={() => {
                    setFormData({ id: null, stationName: '', date: getBangkokDate(), waterLevel: '', inflow: '', outflow: '', rainAmount: '', currentStorage: '', usableStorage: '', capacity: '', tambon: '', amphoe: '', province: 'ลำปาง', groupId: '' });
                    if (onClearEditing) onClearEditing();
                }}
                className="w-1/3 bg-gray-200 text-gray-700 px-4 py-5 rounded-2xl font-bold hover:bg-gray-300 transition-all"
              >
                ยกเลิก
              </button>
          )}
          
          <button 
            type="submit" disabled={isSaving} 
            className={`flex-1 text-white px-8 py-5 rounded-2xl transition-all flex items-center justify-center disabled:bg-gray-400 font-black text-lg shadow-xl transform active:scale-95 ${
               initialData 
                 ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' 
                 : reportMode === 'water' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                 : reportMode === 'rain' ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-200' 
                 : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {isSaving ? <Loader className="w-6 h-6 mr-3 animate-spin" /> : <Save className="w-6 h-6 mr-3" />} 
            {isSaving ? 'กำลังบันทึกข้อมูล...' : initialData ? 'ยืนยันแก้ไขข้อมูล' : 'ยืนยันบันทึกข้อมูล'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDataPage;