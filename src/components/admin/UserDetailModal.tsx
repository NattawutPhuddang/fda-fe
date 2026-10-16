import React from 'react';
import { User, UserHistoryRecord } from '../../services/types';
import { storage } from '../../services/storage';
import { Modal } from '../common/Modal';
import { User as UserIcon, Shield, Mail, Phone, Building2, Calendar, History, CheckCircle2, UserX, Clock } from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  if (!isOpen) return null;

  const history = storage.getUserHistory(user.id);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[11px] font-semibold">ผู้ดูแลระบบ (Admin)</span>;
      case 'officer':
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] font-semibold">เจ้าหน้าที่ อย.</span>;
      case 'auditor':
        return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px] font-semibold">ผู้ตรวจสอบระบบ (Auditor)</span>;
      case 'entrepreneur':
        return <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">ผู้ประกอบการ</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">{role}</span>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="รายละเอียดบัญชีและประวัติผู้ใช้งาน (User Profile & Audit Trail)"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Profile Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{user.fullName}</h3>
                {getRoleBadge(user.role)}
              </div>
              <p className="font-mono text-xs text-slate-500 mt-0.5">Username: {user.username}</p>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-semibold border ${
            user.isActive 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {user.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
            <span>{user.isActive ? 'เปิดใช้งานปกติ (Active)' : 'ถูกระงับการใช้งาน (Suspended)'}</span>
          </span>
        </div>

        {/* Detailed Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <span className="text-slate-400 block mb-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              อีเมลทางการ:
            </span>
            <span className="font-semibold text-slate-800">{user.email}</span>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <span className="text-slate-400 block mb-0.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              เบอร์โทรศัพท์:
            </span>
            <span className="font-semibold text-slate-800">{user.phoneNumber || '-'}</span>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <span className="text-slate-400 block mb-0.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              สังกัด / หน่วยงาน:
            </span>
            <span className="font-semibold text-slate-800">{user.department || '-'}</span>
            <p className="text-[11px] text-slate-500">{user.organization || ''}</p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <span className="text-slate-400 block mb-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              เข้าสู่ระบบล่าสุด:
            </span>
            <span className="font-semibold text-slate-800">
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('th-TH') : '-'}
            </span>
          </div>
        </div>

        {/* User History / Audit Trail */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <History className="w-4 h-4 text-blue-900" />
            <span>ประวัติการเปลี่ยน Role และสถานะบัญชี (Audit Trail)</span>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 max-h-52 overflow-y-auto space-y-2">
            {history.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                ไม่มีประวัติการเปลี่ยนแปลงสิทธิ์หรือสถานะบัญชี
              </div>
            ) : (
              history.map((h, i) => (
                <div key={h.id || i} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800">{h.details}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      ดำเนินการโดย: {h.changedBy}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                    {new Date(h.timestamp).toLocaleDateString('th-TH')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
          >
            ปิด
          </button>
        </div>
      </div>
    </Modal>
  );
};
