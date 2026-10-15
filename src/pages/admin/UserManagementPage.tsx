import React, { useState, useMemo } from 'react';
import { storage } from '../../services/storage';
import { User, UserRole } from '../../services/types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  UserCog, 
  Search, 
  Plus, 
  FileEdit, 
  ShieldCheck, 
  UserX, 
  CheckCircle2, 
  Mail, 
  Building2, 
  Lock,
  Phone
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { success, warning } = useToast();
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form Fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('officer');
  const [department, setDepartment] = useState('');
  const [organization, setOrganization] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const q = query.trim().toLowerCase();
      const matchQ = !q || u.fullName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchRole && matchQ;
    });
  }, [users, query, roleFilter]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setUsername('');
    setFullName('');
    setEmail('');
    setRole('officer');
    setDepartment('กองกำกับและตรวจสอบผลิตภัณฑ์');
    setOrganization('สำนักงานคณะกรรมการอาหารและยา');
    setPhoneNumber('02-590-7000');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setUsername(user.username);
    setFullName(user.fullName);
    setEmail(user.email);
    setRole(user.role);
    setDepartment(user.department || '');
    setOrganization(user.organization || '');
    setPhoneNumber(user.phoneNumber || '');
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim() || !email.trim()) {
      warning('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
      return;
    }

    if (editingUser) {
      // Update
      const updated = users.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            username,
            fullName,
            email,
            role,
            department,
            organization,
            phoneNumber
          };
        }
        return u;
      });
      storage.saveUsers(updated);
      setUsers(updated);
      success(`แก้ไขข้อมูลผู้ใช้งาน "${fullName}" เรียบร้อยแล้ว`);
    } else {
      // Create new
      const newUser: User = {
        id: `usr-${Date.now()}`,
        username,
        fullName,
        email,
        role,
        department,
        organization,
        phoneNumber,
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        permissions: ['VIEW_DASHBOARD']
      };
      const updated = [newUser, ...users];
      storage.saveUsers(updated);
      setUsers(updated);
      success(`สร้างบัญชีผู้ใช้งานใหม่ "${fullName}" สำเร็จ`);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (targetUser: User) => {
    const newStatus = !targetUser.isActive;
    const updated = users.map(u => (u.id === targetUser.id ? { ...u, isActive: newStatus } : u));
    storage.saveUsers(updated);
    setUsers(updated);
    success(`${newStatus ? 'เปิดใช้งาน' : 'ระงับบัญชี'} "${targetUser.fullName}" สำเร็จ`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">จัดการบัญชีผู้ใช้งาน (User Management)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            กำหนดสิทธิ์การเข้าถึง บัญชีผู้ประกอบการ เจ้าหน้าที่ อย. ผู้ดูแลระบบ และผู้ตรวจสอบ
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มผู้ใช้งานใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ใช้, ชื่อ-นามสกุล หรืออีเมล..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="ALL">ทุกบทบาท (All Roles)</option>
          <option value="entrepreneur">ผู้ประกอบการ (Entrepreneur)</option>
          <option value="officer">เจ้าหน้าที่ อย. (FDA Officer)</option>
          <option value="admin">ผู้ดูแลระบบ (Admin)</option>
          <option value="auditor">ผู้ตรวจสอบ (Auditor)</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ผู้ใช้งาน & Username</th>
                <th className="py-3 px-4">สังกัด / หน่วยงาน</th>
                <th className="py-3 px-4">บทบาท (Role)</th>
                <th className="py-3 px-4">การติดต่อ</th>
                <th className="py-3 px-4">สถานะบัญชี</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <strong className="text-slate-900 block font-semibold">{u.fullName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-medium text-slate-800 truncate">{u.organization || u.department}</p>
                    <span className="text-[10px] text-slate-400 truncate block">{u.department}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider bg-slate-100 text-slate-700 border-slate-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <p className="truncate max-w-[150px]">{u.email}</p>
                    <span className="text-[10px] text-slate-400">{u.phoneNumber || '-'}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {u.isActive ? 'เปิดใช้งาน' : 'ถูกระงับ'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition"
                        title="แก้ไขข้อมูลผู้ใช้"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg transition ${
                          u.isActive
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.isActive ? 'ระงับบัญชี' : 'เปิดใช้งานบัญชี'}
                      >
                        {u.isActive ? <UserX className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'สร้างบัญชีผู้ใช้งานใหม่'}
        subtitle="กำหนดบทบาทและสิทธิ์การเข้าถึงระบบฉลากดิจิทัล อย."
      >
        <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ชื่อผู้ใช้ (Username) (*):</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="เช่น somsak.ent"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">บทบาท (Role) (*):</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="entrepreneur">ผู้ประกอบการ (Entrepreneur)</option>
                <option value="officer">เจ้าหน้าที่ อย. (FDA Officer)</option>
                <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                <option value="auditor">ผู้ตรวจสอบ (Auditor)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">ชื่อ-นามสกุล (พร้อมคำนำหน้า) (*):</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="เช่น นายสมศักดิ์ วัฒนกิจโกศล"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">อีเมลทางการ (*):</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@organization.co.th"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">หมายเลขโทรศัพท์:</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="02-xxx-xxxx หรือ 081-xxx-xxxx"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">สังกัด / บริษัท / นิติบุคคล:</label>
            <input
              type="text"
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              placeholder="เช่น บริษัท สยามไบโอเทค เฮลท์แคร์ จำกัด หรือ สำนักงานคณะกรรมการอาหารและยา"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">ฝ่าย / กอง / แผนก:</label>
            <input
              type="text"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="เช่น กองกำกับและตรวจสอบผลิตภัณฑ์ หรือ ฝ่ายขึ้นทะเบียน"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-semibold rounded-xl shadow transition"
            >
              บันทึกข้อมูลผู้ใช้งาน
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
