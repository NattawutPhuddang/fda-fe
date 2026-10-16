import React, { useState, useMemo } from 'react';
import { storage } from '../../services/storage';
import { User, UserRole } from '../../services/types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { UserDetailModal } from '../../components/admin/UserDetailModal';
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
  Phone,
  History,
  AlertCircle,
  Eye,
  RotateCcw
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { success, warning } = useToast();
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State for Create / Edit
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

  // Status Action Modal State (Suspend / Unsuspend with Reason)
  const [targetStatusUser, setTargetStatusUser] = useState<User | null>(null);
  const [statusReason, setStatusReason] = useState('');

  // Details Modal State
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null);

  const reloadUsers = () => {
    setUsers(storage.getUsers());
  };

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const q = query.trim().toLowerCase();
      const matchQ = !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q));
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

    // 1. Mandatory Fields Validation
    if (!username.trim() || !fullName.trim() || !email.trim()) {
      warning('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (Username, ชื่อ-นามสกุล, อีเมล)');
      return;
    }

    // 2. Email Regex Format Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      warning('รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง (เช่น user@fda.moph.go.th)');
      return;
    }

    // 3. Username Uniqueness Check
    const dupUsername = users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.id !== editingUser?.id
    );
    if (dupUsername) {
      warning(`Username "${username}" ถูกใช้งานแล้วในระบบ กรุณาใช้ชื่ออื่น`);
      return;
    }

    // 4. Email Uniqueness Check
    const dupEmail = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.id !== editingUser?.id
    );
    if (dupEmail) {
      warning(`อีเมล "${email}" ถูกลงทะเบียนแล้วในระบบ`);
      return;
    }

    if (editingUser) {
      // Check if Role Changed
      const isRoleChanged = editingUser.role !== role;

      const updated = users.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            username: username.trim(),
            fullName: fullName.trim(),
            email: email.trim(),
            role,
            department: department.trim(),
            organization: organization.trim(),
            phoneNumber: phoneNumber.trim()
          };
        }
        return u;
      });

      storage.saveUsers(updated);
      setUsers(updated);

      // Record History if Role Changed
      if (isRoleChanged) {
        storage.addUserHistory({
          userId: editingUser.id,
          action: 'ROLE_CHANGE',
          details: `เปลี่ยนบทบาทจาก "${editingUser.role}" เป็น "${role}"`,
          changedBy: currentUser?.fullName || 'ผู้ดูแลระบบ',
          previousValue: editingUser.role,
          newValue: role
        });
      }

      storage.addAuditLog({
        userId: currentUser?.id || 'admin',
        userName: currentUser?.fullName || 'ผู้ดูแลระบบ',
        userRole: 'admin',
        action: 'UPDATE_USER',
        resourceType: 'USER_ACCOUNT',
        resourceId: editingUser.id,
        result: 'SUCCESS',
        details: `แก้ไขข้อมูลผู้ใช้งาน: ${fullName} (${username})`
      });

      success(`แก้ไขข้อมูลผู้ใช้งาน "${fullName}" เรียบร้อยแล้ว`);
    } else {
      // Create new user
      const newUserId = `usr-${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        username: username.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        role,
        department: department.trim(),
        organization: organization.trim(),
        phoneNumber: phoneNumber.trim(),
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        permissions: ['VIEW_DASHBOARD']
      };

      const updated = [newUser, ...users];
      storage.saveUsers(updated);
      setUsers(updated);

      storage.addUserHistory({
        userId: newUserId,
        action: 'CREATE',
        details: `สร้างบัญชีผู้ใช้งานใหม่ในบทบาท "${role}"`,
        changedBy: currentUser?.fullName || 'ผู้ดูแลระบบ',
        newValue: role
      });

      storage.addAuditLog({
        userId: currentUser?.id || 'admin',
        userName: currentUser?.fullName || 'ผู้ดูแลระบบ',
        userRole: 'admin',
        action: 'CREATE_USER',
        resourceType: 'USER_ACCOUNT',
        resourceId: newUserId,
        result: 'SUCCESS',
        details: `สร้างบัญชีผู้ใช้ใหม่: ${fullName} (${username}) บทบาท: ${role}`
      });

      success(`สร้างบัญชีผู้ใช้งานใหม่ "${fullName}" สำเร็จ`);
    }

    setIsModalOpen(false);
  };

  // Open Status Change Modal (Suspend / Activate)
  const handleOpenStatusModal = (targetUser: User) => {
    setStatusReason('');
    setTargetStatusUser(targetUser);
  };

  // Execute Status Change
  const handleExecuteStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStatusUser) return;

    if (!targetStatusUser.isActive && !statusReason.trim()) {
      warning('กรุณาระบุเหตุผลการดำเนินการ');
    }

    const newStatus = !targetStatusUser.isActive;
    const actionName = newStatus ? 'ACTIVATE' : 'SUSPEND';

    const updated = users.map(u => (u.id === targetStatusUser.id ? { ...u, isActive: newStatus } : u));
    storage.saveUsers(updated);
    setUsers(updated);

    // Save User History
    storage.addUserHistory({
      userId: targetStatusUser.id,
      action: 'STATUS_CHANGE',
      details: `${newStatus ? 'ปลดระงับและเปิดใช้งานบัญชี' : 'ระงับการใช้งานบัญชี'} (เหตุผล: ${statusReason || 'ตามคำสั่งผู้ดูแลระบบ'})`,
      changedBy: currentUser?.fullName || 'ผู้ดูแลระบบ',
      previousValue: targetStatusUser.isActive ? 'ACTIVE' : 'SUSPENDED',
      newValue: newStatus ? 'ACTIVE' : 'SUSPENDED'
    });

    // Save Audit Log
    storage.addAuditLog({
      userId: currentUser?.id || 'admin',
      userName: currentUser?.fullName || 'ผู้ดูแลระบบ',
      userRole: 'admin',
      action: newStatus ? 'ACTIVATE_USER' : 'SUSPEND_USER',
      resourceType: 'USER_ACCOUNT',
      resourceId: targetStatusUser.id,
      result: 'SUCCESS',
      details: `${newStatus ? 'เปิดใช้งานบัญชี' : 'ระงับบัญชี'}: ${targetStatusUser.fullName} (${targetStatusUser.username}) เหตุผล: ${statusReason || '-'}`
    });

    success(`${newStatus ? 'เปิดใช้งานบัญชี' : 'ระงับบัญชี'} "${targetStatusUser.fullName}" เรียบร้อยแล้ว`);
    setTargetStatusUser(null);
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[11px] font-semibold">ผู้ดูแลระบบ</span>;
      case 'officer':
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] font-semibold">เจ้าหน้าที่ อย.</span>;
      case 'auditor':
        return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px] font-semibold">ผู้ตรวจสอบระบบ (Auditor)</span>;
      case 'entrepreneur':
        return <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">ผู้ประกอบการ</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">{r}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">จัดการบัญชีผู้ใช้งาน (User Management)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            กำหนดสิทธิ์การเข้าถึง บัญชีผู้ประกอบการ เจ้าหน้าที่ อย. 3 ระดับ ผู้ดูแลระบบ และผู้ตรวจสอบ
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
            placeholder="ค้นหาชื่อผู้ใช้, Username หรืออีเมล..."
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
          <option value="auditor">ผู้ตรวจสอบระบบ (Auditor)</option>
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
                    <p className="truncate font-medium text-slate-800">{u.department || '-'}</p>
                    <span className="text-[10px] text-slate-400 truncate block">{u.organization}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    {getRoleLabel(u.role)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="text-slate-700 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {u.email}
                      </span>
                      {u.phoneNumber && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Phone className="w-2.5 h-2.5" />
                          {u.phoneNumber}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {u.isActive ? <CheckCircle2 className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      <span>{u.isActive ? 'เปิดใช้งาน' : 'ถูกระงับ'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* View Profile / History */}
                      <button
                        onClick={() => setSelectedUserForDetail(u)}
                        className="p-1.5 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition"
                        title="ดูรายละเอียดและประวัติบัญชี"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit User */}
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition"
                        title="แก้ไขข้อมูลผู้ใช้"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>

                      {/* Suspend / Unsuspend with Reason */}
                      <button
                        onClick={() => handleOpenStatusModal(u)}
                        className={`p-1.5 rounded-lg transition ${
                          u.isActive
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.isActive ? 'สั่งระงับบัญชี' : 'ปลดระงับและเปิดใช้งาน'}
                      >
                        {u.isActive ? <UserX className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `แก้ไขข้อมูลผู้ใช้: ${editingUser.fullName}` : 'เพิ่มผู้ใช้งานใหม่เข้าสู่ระบบ'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Username (สำหรับเข้าสู่ระบบ) *:
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="เช่น somchai.fda"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อ - นามสกุล *:
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="เช่น ภก. สมชาย ใจดี"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                อีเมลทางการ *:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="เช่น somchai@fda.moph.go.th"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์:
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="02-590-7000"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                บทบาทและระดับสิทธิ์ (Role) *:
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="officer">เจ้าหน้าที่ อย. (FDA Officer: รับเรื่อง ตรวจสอบ Checklist ส่งกลับแก้ไข อนุมัติ/สั่งระงับ)</option>
                <option value="entrepreneur">ผู้ประกอบการ (Entrepreneur: ยื่นคำขอ/จัดการฉลาก)</option>
                <option value="admin">ผู้ดูแลระบบ (Admin: สิทธิ์เต็มในการตั้งค่าและจัดการผู้ใช้)</option>
                <option value="auditor">ผู้ตรวจสอบระบบ (Auditor: ตรวจสอบ Audit Log และรายงาน)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ฝ่าย / กอง / กลุ่มงาน:
              </label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="เช่น กลุ่มงานตรวจสอบและประเมินฉลาก"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                สังกัด / หน่วยงานหลัก:
              </label>
              <input
                type="text"
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                placeholder="เช่น สำนักงานคณะกรรมการอาหารและยา"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              บันทึกข้อมูลผู้ใช้งาน
            </button>
          </div>
        </form>
      </Modal>

      {/* Status Modal (Suspend / Activate with Reason) */}
      {targetStatusUser && (
        <Modal
          isOpen={!!targetStatusUser}
          onClose={() => setTargetStatusUser(null)}
          title={targetStatusUser.isActive ? 'ยืนยันการระงับบัญชีผู้ใช้งาน' : 'ยืนยันการปลดระงับและเปิดใช้งานบัญชี'}
          maxWidth="md"
        >
          <form onSubmit={handleExecuteStatusChange} className="space-y-4">
            <div className={`p-3 rounded-xl border text-xs space-y-1 ${
              targetStatusUser.isActive
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <strong className="block font-semibold">
                ผู้ใช้งาน: {targetStatusUser.fullName} (@{targetStatusUser.username})
              </strong>
              <p>
                {targetStatusUser.isActive
                  ? 'เมื่อระงับบัญชี ผู้ใช้งานจะไม่สามารถเข้าสู่ระบบและปฏิบัติงานใดๆ ในระบบฉลากดิจิทัลได้จนกว่าจะได้รับการปลดระงับ'
                  : 'เมื่อเปิดใช้งาน ผู้ใช้งานจะสามารถเข้าสู่ระบบและปฏิบัติงานตามสิทธิ์บทบาทได้ตามปกติ'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เหตุผลการดำเนินการ *:
              </label>
              <textarea
                rows={3}
                required
                value={statusReason}
                onChange={e => setStatusReason(e.target.value)}
                placeholder={targetStatusUser.isActive ? 'เช่น ย้ายกลุ่มงาน, พ้นสภาพการปฏิบัติราชการ, ล็อกอินผิดพลาดเกินเกณฑ์...' : 'เช่น อนุมัติการคืนสิทธิ์ตามคำสั่งต้นสังกัด...'}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setTargetStatusUser(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition ${
                  targetStatusUser.isActive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {targetStatusUser.isActive ? 'ยืนยันระงับบัญชี' : 'ยืนยันเปิดใช้งาน'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* User Detail & Audit Trail Modal */}
      {selectedUserForDetail && (
        <UserDetailModal
          isOpen={!!selectedUserForDetail}
          onClose={() => setSelectedUserForDetail(null)}
          user={selectedUserForDetail}
        />
      )}
    </div>
  );
};
