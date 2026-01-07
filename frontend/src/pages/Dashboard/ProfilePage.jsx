import React, { useState } from 'react';
import { User, Shield, Key, Save, Loader, Building } from 'lucide-react';
import { MysqlService } from '../../services/mysqlService';

const ProfilePage = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    id: user.id,
    username: user.username,
    fullName: user.fullName || '',
    organization: user.organization || '',
    role: user.role,
    password: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('รหัสผ่านยืนยันไม่ตรงกัน');
      return;
    }
    
    setIsSaving(true);
    try {
      // โครงสร้าง Payload แบบเดิมที่น้องเคยเขียน
      const updatePayload = {
        id: user.id,
        fullName: formData.fullName,
        organization: formData.organization,
        username: user.username, 
        role: user.role 
      };
      
      if (formData.password) {
        updatePayload.password = formData.password;
      }

      // บันทึกลง MySQL
      await MysqlService.saveUser(updatePayload);
      
      // อัปเดต State ใน App.jsx
      onUpdateUser(updatePayload);
      
      alert('บันทึกข้อมูลส่วนตัวสำเร็จ!');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
      <div className="flex items-center mb-6 border-b pb-4">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ข้อมูลส่วนตัว (My Profile)</h2>
          <p className="text-gray-500 text-sm">จัดการข้อมูลบัญชีผู้ใช้ของคุณ</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSave} className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-500" /> ข้อมูลทั่วไป
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                <input 
                  type="text" 
                  value={formData.username} 
                  disabled 
                  className="w-full px-4 py-2 border rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">สิทธิ์การใช้งาน (Role)</label>
                <div className={`px-4 py-2 border rounded-lg bg-white inline-flex items-center ${formData.role === 'admin' ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-purple-600 border-purple-200 bg-purple-50'}`}>
                   {formData.role === 'admin' ? <Shield className="w-4 h-4 mr-2"/> : <User className="w-4 h-4 mr-2"/>}
                   <span className="font-bold uppercase">{formData.role}</span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล (Full Name)</label>
                <input 
                  type="text" 
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">หน่วยงาน (Organization)</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.organization} 
                    onChange={e => setFormData({...formData, organization: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2 text-orange-500" /> เปลี่ยนรหัสผ่าน (Change Password)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  value={formData.confirmPassword} 
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  disabled={!formData.password}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-md transition flex items-center disabled:opacity-50">
              {isSaving ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;