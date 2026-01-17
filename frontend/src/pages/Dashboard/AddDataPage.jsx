import React, { useState, useRef } from 'react';
import { Database, Save, Loader, FileText, User, MapPin, CloudRain, Droplets } from 'lucide-react';
import { MysqlService } from '../../services/mysqlService';
import { getBangkokDate } from '../../utils/helpers';

// --- อัปเกรดข้อมูลสถานี: เพิ่มที่ตั้งเพื่อให้ดึงไปใช้งานอัตโนมัติ ---
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

const AddDataPage = ({ user, refreshData }) => {
  // 🟢 1. เพิ่ม State สลับโหมด (water หรือ rain)
  const [reportMode, setReportMode] = useState('water');
  
  const [formData, setFormData] = useState({ 
    stationName: '', 
    date: getBangkokDate(), 
    waterLevel: '', 
    inflow: '', 
    outflow: '',
    rainAmount: '', // 🟢 เพิ่มฟิลด์ฝน
    capacity: '',
    tambon: '',
    amphoe: '',
    province: '',
    groupId: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'stationName') {
      const s = STATION_DATA.find(item => item.name === value);
      setFormData(prev => ({
        ...prev,
        stationName: value,
        capacity: s ? s.capacity : '',
        tambon: s ? s.tambon : '',
        amphoe: s ? s.amphoe : '',
        province: s ? s.province : '',
        groupId: s ? s.groupId : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const creatorName = user.fullName || user.username;
      
      // 🟢 2. เช็คโหมดก่อนส่งไป API
      const result = reportMode === 'water' 
        ? await MysqlService.createReport({ ...formData, createdBy: creatorName })
        : await MysqlService.createRainReport({ ...formData, createdBy: creatorName }); // น้องต้องไปเพิ่มฟังก์ชันนี้ใน MysqlService นะจ๊ะ

      if (result) {
        alert(`✅ บันทึกข้อมูล${reportMode === 'water' ? 'น้ำ' : 'ฝน'}สำเร็จ!`);
        setFormData({ 
          stationName: '', date: getBangkokDate(), waterLevel: '', 
          inflow: '', outflow: '', rainAmount: '', capacity: '', tambon: '', amphoe: '', province: '', groupId: '' 
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Database className="w-6 h-6 mr-3 text-blue-600" /> 
          บันทึกรายงาน{reportMode === 'water' ? 'สถานการณ์น้ำ' : 'ปริมาณน้ำฝน'}
        </h2>

        {/* 🟢 3. ปุ่มสลับโหมด (Mode Switcher) */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
          <button 
            onClick={() => setReportMode('water')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${reportMode === 'water' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-blue-600'}`}
          >
            <Droplets className="w-4 h-4 mr-2" /> ข้อมูลน้ำ
          </button>
          <button 
            onClick={() => setReportMode('rain')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${reportMode === 'rain' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-500 hover:text-cyan-600'}`}
          >
            <CloudRain className="w-4 h-4 mr-2" /> ข้อมูลฝน
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className={`border rounded-lg p-4 mb-6 flex items-center justify-between ${reportMode === 'water' ? 'bg-blue-50 border-blue-200' : 'bg-cyan-50 border-cyan-200'}`}>
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

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
        {/* ส่วนสถานี */}
        <div className="md:col-span-2 border-b pb-2 mb-2 flex items-center justify-between">
           <h3 className="text-sm font-bold text-gray-500 flex items-center">
             <MapPin className="w-4 h-4 mr-1" /> ข้อมูลสถานี
           </h3>
           <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${reportMode === 'water' ? 'bg-blue-100 text-blue-700' : 'bg-cyan-100 text-cyan-700'}`}>
             {reportMode} MODE
           </span>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อสถานี/อ่างเก็บน้ำ</label>
          <select name="stationName" value={formData.stationName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold" required>
            <option value="">-- เลือกสถานี --</option>
            {STATION_DATA.map((s) => (<option key={s.name} value={s.name}>{s.name}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">วันที่ตรวจวัด</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>

        {/* 🟢 4. ส่วนแสดงฟิลด์ตามโหมด */}
        <div className="md:col-span-2 mt-2 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportMode === 'water' ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ระดับน้ำ (Water Level)</label>
                <div className="relative">
                  <input type="number" step="0.01" name="waterLevel" value={formData.waterLevel} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" required />
                  <span className="absolute right-3 top-2 text-gray-400 text-xs">ม.รทก.</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">น้ำเข้า (Inflow)</label>
                  <input type="number" step="0.01" name="inflow" value={formData.inflow} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ระบายออก (Outflow)</label>
                  <input type="number" step="0.01" name="outflow" value={formData.outflow} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
                </div>
              </div>
            </>
          ) : (
            <div className="md:col-span-2 bg-cyan-50 p-6 rounded-xl border border-cyan-100">
               <label className="block text-lg font-bold text-cyan-800 mb-2 flex items-center">
                 <CloudRain className="w-5 h-5 mr-2" /> ปริมาณน้ำฝนที่วัดได้
               </label>
               <div className="relative">
                 <input 
                   type="number" step="0.1" name="rainAmount" value={formData.rainAmount} onChange={handleChange} 
                   className="w-full px-6 py-4 text-3xl font-mono text-cyan-900 border-2 border-cyan-200 rounded-2xl focus:ring-4 focus:ring-cyan-500 outline-none shadow-inner" 
                   placeholder="0.0" required 
                 />
                 <span className="absolute right-6 top-5 text-cyan-500 font-bold text-xl uppercase tracking-widest">mm.</span>
               </div>
               <p className="mt-2 text-sm text-cyan-600 font-medium">* บันทึกปริมาณฝนสะสมในรอบ 24 ชั่วโมง</p>
            </div>
          )}
        </div>

        <div className="md:col-span-2 mt-4 pt-4 border-t">
          <button 
            type="submit" disabled={isSaving} 
            className={`w-full text-white px-8 py-4 rounded-xl transition flex items-center justify-center disabled:bg-gray-400 font-bold shadow-lg transform active:scale-95 ${reportMode === 'water' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
          >
            {isSaving ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />} 
            {isSaving ? 'กำลังบันทึก...' : `บันทึกข้อมูล${reportMode === 'water' ? 'น้ำ' : 'ฝน'}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDataPage;