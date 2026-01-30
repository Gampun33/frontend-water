import React, { useState, useEffect } from 'react';
import { Database, Save, Loader, User, MapPin, CloudRain, Droplets } from 'lucide-react';
import { MysqlService } from '../../services/mysqlService';
import { getBangkokDate } from '../../utils/helpers';

// --- 1. ข้อมูลสถานีสำหรับโหมดน้ำ ---
const STATION_DATA = [
  { name: "เขื่อนภูมิพล", capacity: 13462, tambon: "สามเงา", amphoe: "สามเงา", province: "ตาก", groupId: "group-large" },
  { name: "เขื่อนสิริกิติ์", capacity: 9510, tambon: "ผาเลือด", amphoe: "ท่าปลา", province: "อุตรดิตถ์", groupId: "group-large" },
  { name: "เขื่อนป่าสักฯ", capacity: 960, tambon: "หนองบัว", amphoe: "พัฒนานิคม", province: "ลพบุรี", groupId: "group-large" },
  { name: "เขื่อนอุบลรัตน์", capacity: 2431, tambon: "เขื่อนอุบลรัตน์", amphoe: "อุบลรัตน์", province: "ขอนแก่น", groupId: "group-large" },
  { name: "เขื่อนกิ่วลม", capacity: 106.22, tambon: "บ้านแลง", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-large" },
  { name: "เขื่อนกิ่วคอหมา", capacity: 170.29, tambon: "ปงดอน", amphoe: "แจ้ห่ม", province: "ลำปาง", groupId: "group-large" },
  { name: "อ่างเก็บน้ำแม่ฟ้า", capacity: 90, tambon: "แจ้ห่ม", amphoe: "แจ้ห่ม", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่อาง", capacity: 90, tambon: "บ้านแลง", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำห้วยทราย", capacity: 90, tambon: "ต้นธงชัย", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-medium" },
  { name: "เขื่อนแม่ขาม", capacity: 90, tambon: "แม่เมาะ", amphoe: "แม่เมาะ", province: "ลำปาง", groupId: "group-medium" },
  { name: "เขื่อนแม่จาง", capacity: 90, tambon: "นาส่ง", amphoe: "เกาะคา", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ทะ", capacity: 90, tambon: "แม่ทะ", amphoe: "แม่ทะ", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ไฮ", capacity: 90, tambon: "ปงยางคก", amphoe: "ห้างฉัตร", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ธิ", capacity: 90, tambon: "วังพร้าว", amphoe: "เกาะคา", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่วะ", capacity: 100, tambon: "แม่วะ", amphoe: "เถิน", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ทาน", capacity: 90, tambon: "แม่กัวะ", amphoe: "สบปราบ", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำห้วยหลวง", capacity: 90, tambon: "แม่กัวะ", amphoe: "สบปราบ", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่เรียง", capacity: 90, tambon: "เสริมขวา", amphoe: "เสริมงาม", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ทก", capacity: 90, tambon: "สบปราบ", amphoe: "สบปราบ", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำห้วยสมัย", capacity: 90, tambon: "สมัย", amphoe: "สบปราบ", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่นึง", capacity: 90, tambon: "เมืองปาน", amphoe: "เมืองปาน", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ค่อม", capacity: 90, tambon: "บ้านเอื้อม", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่เฟือง", capacity: 90, tambon: "บ้านเอื้อม", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ต๋ำน้อย", capacity: 90, tambon: "บ้านเอื้อม", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ไพร", capacity: 90, tambon: "วอแก้ว", amphoe: "ห้างฉัตร", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำห้วยหลวงวังวัว", capacity: 90, tambon: "ทุ่งฝาย", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ทรายทายคำ", capacity: 90, tambon: "นิคมพัฒนา", amphoe: "เมืองลำปาง", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่สัน", capacity: 90, tambon: "แม่ทะ", amphoe: "แม่ทะ", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ปอน", capacity: 90, tambon: "เมืองยาว", amphoe: "ห้างฉัตร", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ยาว", capacity: 90, tambon: "แม่สัน", amphoe: "ห้างฉัตร", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำห้วยเกี๋ยง", capacity: 90, tambon: "เมืองยาว", amphoe: "ห้างฉัตร", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่กึ๊ด", capacity: 90, tambon: "ทุ่งงาม", amphoe: "เสริมงาม", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่เลียงพัฒนา", capacity: 90, tambon: "เสริมขวา", amphoe: "เสริมงาม", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ต๋ำตอนล่าง", capacity: 90, tambon: "เสริมซ้าย", amphoe: "เสริมงาม", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่อาบ", capacity: 90, tambon: "นาแก้ว", amphoe: "เกาะคา", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่พริก", capacity: 90, tambon: "แม่พริก", amphoe: "แม่พริก", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่พริก(ผาวิ่งชู้)", capacity: 90, tambon: "แม่พริก", amphoe: "แม่พริก", province: "ลำปาง", groupId: "group-medium" },
  { name: "อ่างเก็บน้ำแม่ล้อหัก", capacity: 90, tambon: "แม่พริก", amphoe: "แม่พริก", province: "ลำปาง", groupId: "group-medium" }
];

// --- 2. ข้อมูลจุดวัดน้ำฝน (ตำบลหลักรายอำเภอ) ---
const RAIN_STATION_DATA = [
  { name: "เมืองลำปาง", tambon: "หัวเวียง", amphoe: "เมืองลำปาง", province: "ลำปาง" },
  { name: "แม่เมาะ", tambon: "แม่เมาะ", amphoe: "แม่เมาะ", province: "ลำปาง" },
  { name: "เกาะคา", tambon: "เกาะคา", amphoe: "เกาะคา", province: "ลำปาง" },
  { name: "เสริมงาม", tambon: "ทุ่งงาม", amphoe: "เสริมงาม", province: "ลำปาง" },
  { name: "งาว", tambon: "หลวงเหนือ", amphoe: "งาว", province: "ลำปาง" },
  { name: "แจ้ห่ม", tambon: "แจ้ห่ม", amphoe: "แจ้ห่ม", province: "ลำปาง" },
  { name: "วังเหนือ", tambon: "วังเหนือ", amphoe: "วังเหนือ", province: "ลำปาง" },
  { name: "เถิน", tambon: "ล้อมแรด", amphoe: "เถิน", province: "ลำปาง" },
  { name: "แม่พริก", tambon: "แม่พริก", amphoe: "แม่พริก", province: "ลำปาง" },
  { name: "แม่ทะ", tambon: "นาครัว", amphoe: "แม่ทะ", province: "ลำปาง" },
  { name: "ห้างฉัตร", tambon: "ห้างฉัตร", amphoe: "ห้างฉัตร", province: "ลำปาง" },
  { name: "เมืองปาน", tambon: "เมืองปาน", amphoe: "เมืองปาน", province: "ลำปาง" },
  { name: "สบปราบ", tambon: "สบปราบ", amphoe: "สบปราบ", province: "ลำปาง" }
];

const AddDataPage = ({ user, refreshData }) => {
  const [reportMode, setReportMode] = useState('water');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({ 
    stationName: '', 
    date: getBangkokDate(), 
    waterLevel: '', 
    inflow: '', 
    outflow: '',
    rainAmount: '', 
    capacity: '',
    tambon: '',
    amphoe: '',
    province: 'ลำปาง',
    groupId: ''
  });

  useEffect(() => {
    setFormData({ 
      stationName: '', date: getBangkokDate(), waterLevel: '', 
      inflow: '', outflow: '', rainAmount: '', capacity: '', tambon: '', amphoe: '', province: 'ลำปาง', groupId: '' 
    });
  }, [reportMode]);

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
      const payload = {
        stationName: formData.stationName,
        date: formData.date,
        waterLevel: formData.waterLevel || "",
        inflow: formData.inflow || "",
        outflow: formData.outflow || "",
        rainAmount: formData.rainAmount || "",
        capacity: formData.capacity || "",
        tambon: formData.tambon || "-",
        amphoe: formData.amphoe,
        province: formData.province || "ลำปาง",
        groupId: formData.groupId || "",
        createdBy: creatorName
      };

      const result = reportMode === 'water' 
        ? await MysqlService.createReport(payload)
        : await MysqlService.createRainReport(payload);

      if (result) {
        alert(`✅ บันทึกข้อมูล${reportMode === 'water' ? 'น้ำ' : 'ฝน'}สำเร็จ!`);
        setFormData({ 
          stationName: '', date: getBangkokDate(), waterLevel: '', 
          inflow: '', outflow: '', rainAmount: '', capacity: '', tambon: '', amphoe: '', province: 'ลำปาง', groupId: '' 
        });
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Database className={`w-6 h-6 mr-3 ${reportMode === 'water' ? 'text-blue-600' : 'text-cyan-600'}`} /> 
          บันทึกรายงาน{reportMode === 'water' ? 'สถานการณ์น้ำ' : 'ปริมาณน้ำฝนรายพื้นที่'}
        </h2>

        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
          <button onClick={() => setReportMode('water')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${reportMode === 'water' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-blue-600'}`}><Droplets className="w-4 h-4 mr-2" /> ข้อมูลน้ำ</button>
          <button onClick={() => setReportMode('rain')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${reportMode === 'rain' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-500 hover:text-cyan-600'}`}><CloudRain className="w-4 h-4 mr-2" /> ข้อมูลฝน</button>
        </div>
      </div>

      {/* User Info */}
      <div className={`border rounded-xl p-4 mb-6 flex items-center justify-between ${reportMode === 'water' ? 'bg-blue-50 border-blue-200' : 'bg-cyan-50 border-cyan-200'}`}>
        <div className="flex items-center">
          <div className={`p-2 rounded-full mr-3 ${reportMode === 'water' ? 'bg-blue-200' : 'bg-cyan-200'}`}>
            <User className={`w-5 h-5 ${reportMode === 'water' ? 'text-blue-700' : 'text-cyan-700'}`} />
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase ${reportMode === 'water' ? 'text-blue-600' : 'text-cyan-600'}`}>เจ้าหน้าที่บันทึก</p>
            <p className="text-lg font-bold text-gray-800">{user.fullName || user.username}</p>
          </div>
        </div>
      </div>

      {/* 🟢 ส่วนแสดงที่ตั้งแยกแถว (Badge Section) */}
      {(formData.stationName) && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <div className={`p-4 rounded-xl border-2 flex flex-col shadow-sm ${reportMode === 'water' ? 'bg-blue-50/50 border-blue-100' : 'bg-cyan-50/50 border-cyan-100'}`}>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">ตำบล / Sub-district</span>
            <span className={`text-lg font-bold ${reportMode === 'water' ? 'text-blue-700' : 'text-cyan-700'}`}>{formData.tambon || '-'}</span>
          </div>
          <div className={`p-4 rounded-xl border-2 flex flex-col shadow-sm ${reportMode === 'water' ? 'bg-blue-50/50 border-blue-100' : 'bg-cyan-50/50 border-cyan-100'}`}>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">อำเภอ / District</span>
            <span className={`text-lg font-bold ${reportMode === 'water' ? 'text-blue-700' : 'text-cyan-700'}`}>{formData.amphoe || '-'}</span>
          </div>
          <div className={`p-4 rounded-xl border-2 flex flex-col shadow-sm ${reportMode === 'water' ? 'bg-blue-50/50 border-blue-100' : 'bg-cyan-50/50 border-cyan-100'}`}>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">จังหวัด / Province</span>
            <span className={`text-lg font-bold ${reportMode === 'water' ? 'text-blue-700' : 'text-cyan-700'}`}>{formData.province || 'ลำปาง'}</span>
          </div>
        </div>
      )}

      {/* Form Section */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <label className={`block text-sm font-bold mb-1 ${reportMode === 'water' ? 'text-blue-700' : 'text-cyan-700'}`}>
            {reportMode === 'water' ? 'ชื่อสถานี/อ่างเก็บน้ำ' : 'พื้นที่/อำเภอที่ตรวจวัด'}
          </label>
          <select 
            name="stationName" 
            value={formData.stationName} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold transition-all" 
            required
          >
            <option value="">{reportMode === 'water' ? '-- เลือกสถานี --' : '-- เลือกอำเภอ --'}</option>
            {reportMode === 'water' 
              ? STATION_DATA.map((s) => (<option key={s.name} value={s.name}>{s.name}</option>))
              : RAIN_STATION_DATA.map((r) => (<option key={r.name} value={r.name}>{r.name}</option>))
            }
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">วันที่ตรวจวัด</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
        </div>

        <div className="md:col-span-2 mt-2 pt-4 border-t border-gray-200">
          {reportMode === 'water' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          ) : (
            <div className="bg-cyan-50 p-8 rounded-2xl border-2 border-cyan-100 shadow-inner">
               <label className="block text-lg font-bold text-cyan-800 mb-4 flex items-center">
                 <CloudRain className="w-6 h-6 mr-2" /> ปริมาณน้ำฝน (24 ชั่วโมง)
               </label>
               <div className="relative">
                 <input 
                   type="number" step="0.1" name="rainAmount" value={formData.rainAmount} onChange={handleChange} 
                   className="w-full px-8 py-5 text-4xl font-mono text-cyan-900 border-2 border-cyan-200 rounded-2xl focus:ring-4 focus:ring-cyan-500 outline-none shadow-sm" 
                   placeholder="0.0" required 
                 />
                 <span className="absolute right-8 top-7 text-cyan-500 font-black text-2xl uppercase">mm.</span>
               </div>
               <p className="mt-4 text-sm text-cyan-600 italic font-medium">* บันทึกค่าปริมาณฝนสะสม ณ จุดวัดหลักของพื้นที่</p>
            </div>
          )}
        </div>

        <div className="md:col-span-2 mt-6">
          <button 
            type="submit" disabled={isSaving} 
            className={`w-full text-white px-8 py-5 rounded-2xl transition-all flex items-center justify-center disabled:bg-gray-400 font-black text-lg shadow-xl transform active:scale-95 ${reportMode === 'water' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-200'}`}
          >
            {isSaving ? <Loader className="w-6 h-6 mr-3 animate-spin" /> : <Save className="w-6 h-6 mr-3" />} 
            {isSaving ? 'กำลังบันทึกข้อมูล...' : `ยืนยันบันทึกข้อมูล${reportMode === 'water' ? 'น้ำ' : 'ฝน'}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDataPage;