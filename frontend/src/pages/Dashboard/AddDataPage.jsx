import React, { useState, useRef } from 'react';
import { Database, Save, Loader, FileText, User, MapPin } from 'lucide-react';
import { MysqlService } from '../../services/mysqlService';
import { getBangkokDate } from '../../utils/helpers';

// --- อัปเกรดข้อมูลสถานี: เพิ่มที่ตั้งเพื่อให้ดึงไปใช้งานอัตโนมัติ ---
const STATION_DATA = [
  { name: "เขื่อนภูมิพล", capacity: 13462, tambon:"สามเงา", amphoe:"สาามเงา", province:"ตาก", groupId: "group-large" },
  { name: "เขื่อนสิริกิติ์", capacity: 9510, tambon: "ผาเลือด", amphoe: "ท่าปลา", province: "อุตรดิตถ์", groupId: "group-large" },
  { name: "เขื่อนป่าสักฯ", capacity: 960, tambon: "หนองบัว", amphoe: "พัฒนานิคม", province: "ลพบุรี", groupId: "group-large" },
  { name: "เขื่อนอุบลรัตน์", capacity: 2431, tambon: "เขื่อนอุบลรัตน์", amphoe: "อุบลรัตน์", province: "ขอนแก่น", groupId: "group-large" },
  { name: "เขื่อนกิ่วลม", capacity: 106.22, tambon: "บ้านแลง", amphoe: "เมือง", province: "ลำปาง", groupId: "group-large" },
  { name: "เขื่อนกิ่วคอหมา", capacity: 170.29, tambon: "ปงดอน", amphoe: "แจ้ห่ม", province: "ลำปาง", groupId: "group-large" },
  { name: "อ่างแม่วะ", capacity: 100, tambon: "แม่วะ", amphoe: "เถิน", province: "ลำปาง", groupId: "group-medium" }
];

const AddDataPage = ({ user, refreshData }) => {
  const [formData, setFormData] = useState({ 
    stationName: '', 
    date: getBangkokDate(), 
    waterLevel: '', 
    inflow: '', 
    outflow: '',
    capacity: '',
    tambon: '',    // เพิ่มฟิลด์ที่ตั้ง
    amphoe: '',
    province: '',
    groupId: ''    // เพิ่มกลุ่มอ่างเก็บน้ำ
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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
    
    // 🔍 ส่องข้อมูลก่อนส่ง: ถ้าน้องกด F12 จะต้องเห็น tambon (ไม่มี n เกิน)
    console.log("Payload to send:", formData);

    setIsSaving(true);
    try {
      const creatorName = user.fullName || user.username;
      
      // ส่งข้อมูลก้อน formData ที่สะอาดแล้ว
      const result = await MysqlService.createReport({ 
        ...formData, 
        createdBy: creatorName 
      });

      if (result) {
        alert('✅ บันทึกข้อมูลสำเร็จ!');
        // รีเซ็ตฟอร์ม (ล้างที่ตั้งด้วย)
        setFormData({ 
            stationName: '', date: getBangkokDate(), waterLevel: '', 
            inflow: '', outflow: '', capacity: '', tambon: '', amphoe: '', province: '', groupId: '' 
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Database className="w-6 h-6 mr-3 text-blue-600" /> บันทึกรายงานสถานการณ์น้ำ
      </h2>
      
      {/* ส่วนแสดงชื่อผู้ล็อกอิน */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
         <div className="flex items-center text-blue-800">
            <div className="bg-blue-200 p-2 rounded-full mr-3">
              <User className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">ผู้บันทึกข้อมูล</p>
              <p className="text-lg font-bold">{user.fullName || user.username}</p>
            </div>
         </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
        <div className="md:col-span-2 border-b pb-2 mb-2">
           <h3 className="text-sm font-bold text-gray-500 flex items-center">
             <MapPin className="w-4 h-4 mr-1" /> ข้อมูลพื้นฐานสถานี
           </h3>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อสถานี/อ่างเก็บน้ำ</label>
          <select 
            name="stationName" 
            value={formData.stationName} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-blue-900"
            required
          >
            <option value="">-- เลือกสถานี --</option>
            {STATION_DATA.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">วันที่ตรวจวัด</label>
          <input 
            type="date" name="date" value={formData.date} onChange={handleChange} 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required
          />
        </div>

        {/* --- ส่วนแสดงที่ตั้ง (Read-only เพื่อยืนยันข้อมูล) --- */}
        {formData.stationName && (
          <div className="md:col-span-2 grid grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
             <div>
               <p className="text-[10px] text-gray-400 uppercase font-bold">ตำบล</p>
               <p className="text-sm font-medium text-gray-700">{formData.tambon}</p>
             </div>
             <div>
               <p className="text-[10px] text-gray-400 uppercase font-bold">อำเภอ</p>
               <p className="text-sm font-medium text-gray-700">{formData.amphoe}</p>
             </div>
             <div>
               <p className="text-[10px] text-gray-400 uppercase font-bold">จังหวัด</p>
               <p className="text-sm font-medium text-gray-700">{formData.province}</p>
             </div>
          </div>
        )}

        <div className="md:col-span-2 border-b pb-2 mt-2">
           <h3 className="text-sm font-bold text-gray-500">ข้อมูลปริมาณน้ำ</h3>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">ระดับน้ำ (Water Level)</label>
          <div className="relative">
            <input 
              type="number" step="0.01" name="waterLevel" value={formData.waterLevel} onChange={handleChange} 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" required
            />
            <span className="absolute right-3 top-2 text-gray-400 text-xs">ม.รทก.</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">น้ำเข้า (Inflow)</label>
          <div className="relative">
            <input 
              type="number" step="0.01" name="inflow" value={formData.inflow} onChange={handleChange} 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" 
            />
            <span className="absolute right-3 top-2 text-gray-400 text-xs">ล้าน ลบ.ม.</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">ระบายออก (Outflow)</label>
          <div className="relative">
            <input 
              type="number" step="0.01" name="outflow" value={formData.outflow} onChange={handleChange} 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" 
            />
            <span className="absolute right-3 top-2 text-gray-400 text-xs">ล้าน ลบ.ม.</span>
          </div>
        </div>

        <div className="md:col-span-2 mt-4 pt-4 border-t">
          <button 
            type="submit" disabled={isSaving} 
            className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center disabled:bg-gray-400 font-bold shadow-lg"
          >
            {isSaving ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />} 
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกรายงานข้อมูลน้ำ'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDataPage;