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
    let roleText = 'ประชาชนทั่วไป';
    if (role === 'entrepreneur') roleText = 'ผู้ประกอบการ';
    else if (role === 'officer') roleText = 'เจ้าหน้าที่ อย.';
    else if (role === 'admin') roleText = 'ผู้ดูแลระบบ';
    else if (role === 'auditor') roleText = 'ผู้ตรวจสอบ (Auditor)';

    return (
      <span className="bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-0.5 rounded text-xs font-medium">
        บทบาท: {roleText}
      </span>
    );
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
    <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Hamburger + Logo & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/Logo_of_the_Food_and_Drug_Administration.svg"
            alt="โลโก้ อย. สำนักงานคณะกรรมการอาหารและยา"
            className="w-8 h-8 object-contain"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm leading-tight">
                ระบบฉลากดิจิทัล อย.
              </span>
              <span className="hidden lg:inline-block text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded font-mono">
                Gov Enterprise
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block leading-none mt-0.5">
              Thai FDA Digital Labeling Platform
            </p>
          </div>
        </Link>
      </div>

      {/* Right: Role indicator, Reset Data, Citizen portal link, User info & Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Badge */}
        <div className="hidden sm:block">
          {getRoleBadge()}
        </div>

        {/* Public Label link */}
        <Link
          to="/"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition border border-slate-200"
          title="เปิดหน้าฉลากสำหรับประชาชน"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>หน้าฉลากประชาชน</span>
        </Link>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition border border-slate-200 flex items-center gap-1"
          title="รีเซ็ตข้อมูลตัวอย่างทั้งหมดกลับเป็นค่าเริ่มต้น"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span className="hidden sm:inline text-xs">รีเซ็ตข้อมูลตัวอย่าง</span>
        </button>

        <div className="h-5 w-px bg-slate-200" />

        {/* User Info & Logout Button */}
        {currentUser ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="hidden xl:block text-left text-xs">
                <p className="font-semibold text-slate-800 leading-tight truncate max-w-[140px]">
                  {currentUser.fullName}
                </p>
                <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                  {currentUser.organization || currentUser.department}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 text-xs font-medium"
              title="ออกจากระบบ"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-3.5 py-1.5 bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-semibold rounded-lg transition"
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
