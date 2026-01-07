import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, User, Edit, Trash2, 
  ArrowLeft, Save, Building, Key, UserCog 
} from 'lucide-react';
import { MysqlService } from '../../services/mysqlService';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [viewMode, setViewMode] = useState('list'); 
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    role: 'operator', 
    fullName: '', 
    organization: 'กรมชลประทาน', 
    confirmPassword: '' 
  });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    const data = await MysqlService.getUsers();
    setUsers(data || []);
  };

  const handleEdit = (user) => {
    setFormData({ ...user, password: '', confirmPassword: '' }); 
    setViewMode('edit');
  };

  const handleDelete = async (id) => {
    if (confirm('ยืนยันการลบผู้ใช้?')) {
      await MysqlService.deleteUser(id);
      loadUsers();
    }
  };

  const handleSave = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน');
      return;
    }
    await MysqlService.saveUser(formData);
    alert('บันทึกผู้ใช้สำเร็จ');
    loadUsers();
    setViewMode('list');
    setFormData({ 
      username: '', 
      password: '', 
      role: 'operator', 
      fullName: '', 
      organization: 'กรมชลประทาน', 
      confirmPassword: '' 
    });
  };

  if (viewMode === 'add' || viewMode === 'edit') {
    const isEdit = viewMode === 'edit';
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
        <div className="flex items-center mb-6">
          <button onClick={() => setViewMode('list')} className="mr-4 p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            {isEdit ? <UserCog className="w-6 h-6 mr-3 text-orange-600" /> : <UserPlus className="w-6 h-6 mr-3 text-purple-600" />}
            {isEdit ? 'แก้ไขข้อมูลผู้ใช้ (Edit User)' : 'เพิ่มผู้ใช้งานใหม่ (Add New User)'}
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className={`bg-gray-50 p-6 rounded-xl border ${isEdit ? 'border-orange-100' : 'border-gray-100'}`}>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <User className={`w-5 h-5 mr-2 ${isEdit ? 'text-orange-500' : 'text-blue-500'}`} /> ข้อมูลบัญชี (Account Info)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล (Full Name)</label>
                  <input 
                    type="text" 
                    value={formData.fullName} 
                    onChange={e => setFormData({...formData, fullName: e.target.value})} 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${isEdit ? 'focus:ring-orange-500' : 'focus:ring-purple-500'}`}
                    placeholder="เช่น นายสมชาย ใจดี"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                  <input 
                    type="text" 
                    value={formData.username} 
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                    disabled={isEdit} 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${isEdit ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'focus:ring-purple-500'}`}
                    placeholder="user.name"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หน่วยงาน (Organization)</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={formData.organization} 
                      onChange={e => setFormData({...formData, organization: e.target.value})} 
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none ${isEdit ? 'focus:ring-orange-500' : 'focus:ring-purple-500'}`}
                      placeholder="เช่น กรมชลประทาน" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`bg-gray-50 p-6 rounded-xl border ${isEdit ? 'border-orange-100' : 'border-gray-100'}`}>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Key className={`w-5 h-5 mr-2 ${isEdit ? 'text-orange-500' : 'text-green-500'}`} /> ความปลอดภัย (Security)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isEdit ? 'เปลี่ยนรหัสผ่านใหม่ (ว่างไว้ถ้าไม่เปลี่ยน)' : 'รหัสผ่าน (Password)'}</label>
                  <input 
                    type="password" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${isEdit ? 'focus:ring-orange-500' : 'focus:ring-purple-500'}`}
                    placeholder={isEdit ? "เว้นว่างหากไม่ต้องการเปลี่ยน" : "••••••••"}
                    required={!isEdit} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน (Confirm)</label>
                  <input 
                    type="password" 
                    value={formData.confirmPassword} 
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${isEdit ? 'focus:ring-orange-500' : 'focus:ring-purple-500'}`}
                    placeholder="••••••••"
                    required={!isEdit || formData.password.length > 0} 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สิทธิ์การใช้งาน (Role)</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setFormData({...formData, role: 'operator'})}
                  className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition 
                    ${formData.role === 'operator' 
                      ? (isEdit ? 'border-orange-600 bg-orange-50' : 'border-purple-600 bg-purple-50') 
                      : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <User className={`w-8 h-8 mb-2 ${formData.role === 'operator' ? (isEdit ? 'text-orange-600' : 'text-purple-600') : 'text-gray-400'}`} />
                  <span className={`font-bold ${formData.role === 'operator' ? (isEdit ? 'text-orange-700' : 'text-purple-700') : 'text-gray-600'}`}>Operator</span>
                </div>
                <div 
                   onClick={() => setFormData({...formData, role: 'admin'})}
                   className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition 
                    ${formData.role === 'admin' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'}`}
                >
                  <Shield className={`w-8 h-8 mb-2 ${formData.role === 'admin' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`font-bold ${formData.role === 'admin' ? 'text-blue-700' : 'text-gray-600'}`}>Administrator</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-4 border-t">
              <button 
                type="button"
                onClick={() => setViewMode('list')}
                className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
              <button 
                type="submit"
                className={`px-6 py-2 text-white rounded-lg shadow-md transition flex items-center ${isEdit ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                <Save className="w-4 h-4 mr-2" /> {isEdit ? 'บันทึกการแก้ไข' : 'บันทึกผู้ใช้'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center"><Users className="w-6 h-6 mr-3 text-purple-600" /> จัดการผู้ใช้งาน (MySQL Users)</h2>
        <button onClick={() => { setFormData({ username: '', password: '', role: 'operator', fullName: '', organization: 'กรมชลประทาน', confirmPassword: '' }); setViewMode('add'); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center shadow-md transition hover:bg-purple-700">
          <UserPlus className="w-4 h-4 mr-2" /> เพิ่มผู้ใช้
        </button>
      </div>
      <div className="grid gap-4 mt-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.role==='admin'?'bg-blue-100 text-blue-600':'bg-purple-100 text-purple-600'}`}>
                {user.role==='admin'?<Shield className="w-6 h-6"/>:<User className="w-6 h-6"/>}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{user.fullName}</p>
                <div className="flex items-center text-sm text-gray-500 space-x-3">
                  <span className="flex items-center"><Building className="w-3 h-3 mr-1" /> {user.organization || '-'}</span>
                  <span className="flex items-center"><span className={`w-2 h-2 rounded-full mr-1 ${user.role==='admin'?'bg-blue-500':'bg-purple-500'}`}></span>{user.username} ({user.role})</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleEdit(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit className="w-5 h-5" /></button>
              <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagementPage;