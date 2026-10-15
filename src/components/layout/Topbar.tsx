import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, RotateCcw, User, Shield, Bell, Menu, ExternalLink } from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { currentUser, role, logout, resetDemoData } = useAuth();
  const { info, success } = useToast();
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const getRoleBadge = () => {
    switch (role) {
      case 'entrepreneur':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">ผู้ประกอบการ (Entrepreneur)</span>;
      case 'officer':
        return <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">เจ้าหน้าที่ อย. (FDA Officer)</span>;
      case 'admin':
        return <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">ผู้ดูแลระบบ (Admin)</span>;
      case 'auditor':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">ผู้ตรวจสอบ (Auditor)</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">ประชาชนทั่วไป (Public)</span>;
    }
  };

  const handleLogout = () => {
    logout();
    success('ออกจากระบบเรียบร้อยแล้ว');
    navigate('/login');
  };

  const handleResetData = () => {
    resetDemoData();
    success('รีเซ็ตข้อมูลตัวอย่างกลับสู่ค่าเริ่มต้นจากโรงงานแล้ว');
    window.location.reload();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm flex items-center justify-between px-4 sm:px-6">
      {/* Left: Hamburger + Logo & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#002B49] to-[#005A9C] text-amber-400 flex items-center justify-center font-bold text-xs shadow-sm border border-amber-400/30">
            อย.
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base leading-tight group-hover:text-blue-900 transition">
                ระบบฉลากดิจิทัล อย.
              </span>
              <span className="hidden lg:inline-block text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-mono">
                Gov Enterprise v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block leading-none mt-0.5">
              Thai FDA Digital Labeling Platform — สำนักงานคณะกรรมการอาหารและยา
            </p>
          </div>
        </Link>
      </div>

      {/* Right: Role indicator, Reset Data, Citizen portal link, User info & Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Role Badge */}
        <div className="hidden sm:block">
          {getRoleBadge()}
        </div>

        {/* Public Label link */}
        <Link
          to="/"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition border border-slate-200"
          title="เปิดหน้าฉลากสำหรับประชาชน"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
          <span>หน้าฉลากประชาชน</span>
        </Link>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 sm:px-2.5 sm:py-1.5 rounded-lg transition border border-slate-200 flex items-center gap-1"
          title="รีเซ็ตข้อมูลตัวอย่างทั้งหมดกลับเป็นค่าเริ่มต้น"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">รีเซ็ตข้อมูลตัวอย่าง</span>
        </button>

        {/* Notification Mock */}
        <button
          onClick={() => info('ระบบจำลองการแจ้งเตือน: ไม่มีรายการแจ้งเตือนใหม่')}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition relative"
          title="การแจ้งเตือน"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Info & Logout Button */}
        {currentUser ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="hidden xl:block text-left text-xs">
                <p className="font-semibold text-slate-800 leading-tight truncate max-w-[150px]">
                  {currentUser.fullName}
                </p>
                <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
                  {currentUser.organization || currentUser.department}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1.5 text-xs font-medium"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            เข้าสู่ระบบ
          </Link>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="ยืนยันการรีเซ็ตข้อมูลตัวอย่าง?"
        message="การดำเนินการนี้จะล้างข้อมูลจำลองทั้งหมดในเบราว์เซอร์ของคุณ และรีโหลดชุดข้อมูลตัวอย่างเริ่มต้น 4 รายการ (อาหาร, ยา, เครื่องสำอาง, เสริมอาหาร) ข้อมูลที่ท่านแก้ไขระหว่างทดสอบจะถูกล้างออก"
        confirmText="ยืนยันรีเซ็ต"
        variant="warning"
      />

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="ยืนยันการออกจากระบบ?"
        message="ท่านต้องการออกจากระบบฉลากดิจิทัล อย. ใช่หรือไม่? หากต้องการสลับบทบาทผู้ใช้ จะต้องเข้าสู่ระบบใหม่ที่หน้า Login"
        confirmText="ออกจากระบบ"
        variant="danger"
      />
    </header>
  );
};
