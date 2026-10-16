import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Tag,
  QrCode,
  BarChart3,
  Users,
  ClipboardCheck,
  ShieldCheck,
  FileSpreadsheet,
  Settings,
  Server,
  ShieldAlert,
  Database,
  UserCog,
  FileSearch,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, currentUser } = useAuth();

  // Navigation Items per role according to TOR
  const entrepreneurNav = [
    { to: '/entrepreneur/dashboard', label: 'แดชบอร์ดภาพรวม', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/entrepreneur/products', label: 'ทะเบียนผลิตภัณฑ์', icon: <Package className="w-4 h-4" /> },
    { to: '/entrepreneur/labels', label: 'จัดการฉลากดิจิทัล', icon: <Tag className="w-4 h-4" /> },
    { to: '/entrepreneur/qrcodes', label: 'จัดการ QR Code', icon: <QrCode className="w-4 h-4" /> },
    { to: '/entrepreneur/analytics', label: 'สถิติการสแกนฉลาก', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/entrepreneur/representatives', label: 'ตัวแทนผู้รับมอบอำนาจ', icon: <Users className="w-4 h-4" /> },
  ];

  const officerNav = [
    { to: '/officer/dashboard', label: 'แดชบอร์ดเจ้าหน้าที่', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/officer/queue', label: 'คิวงานพิจารณาคำขอ', icon: <ClipboardCheck className="w-4 h-4" /> },
    { to: '/officer/oversight', label: 'กำกับดูแลและระงับฉลาก', icon: <ShieldAlert className="w-4 h-4" /> },
    { to: '/officer/reports', label: 'รายงานสถิติและส่งออก', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  const adminNav = [
    { to: '/admin/dashboard', label: 'แดชบอร์ดผู้ดูแลระบบ', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/users', label: 'จัดการผู้ใช้งาน', icon: <UserCog className="w-4 h-4" /> },
    { to: '/admin/roles', label: 'บทบาทและสิทธิ์ (RBAC)', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/admin/master-data', label: 'ข้อมูลหลัก (Master Data)', icon: <Database className="w-4 h-4" /> },
    { to: '/admin/integrations', label: 'สถานะการเชื่อมต่อ API', icon: <Server className="w-4 h-4" /> },
    { to: '/admin/system-config', label: 'ตั้งค่าระบบ', icon: <Settings className="w-4 h-4" /> },
    { to: '/auditor/logs', label: 'ประวัติและ Log ระบบ', icon: <FileSearch className="w-4 h-4" /> },
  ];

  const auditorNav = [
    { to: '/auditor/logs', label: 'ตรวจสอบประวัติ Audit Log', icon: <FileSearch className="w-4 h-4" /> },
    { to: '/officer/oversight', label: 'ตรวจสอบประวัติฉลาก (Read)', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/officer/reports', label: 'รายงานตรวจสอบ', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  let currentNav = entrepreneurNav;
  let roleTitle = 'พอร์ทัลผู้ประกอบการ';

  if (role === 'officer') {
    currentNav = officerNav;
    roleTitle = 'พอร์ทัลเจ้าหน้าที่ อย.';
  } else if (role === 'admin') {
    currentNav = adminNav;
    roleTitle = 'พอร์ทัลผู้ดูแลระบบ';
  } else if (role === 'auditor') {
    currentNav = auditorNav;
    roleTitle = 'พอร์ทัลผู้ตรวจสอบ (Auditor)';
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="p-4 overflow-y-auto">
          {/* Section Header */}
          <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {roleTitle}
          </div>

          {/* Nav Items */}
          <nav className="mt-2 space-y-1">
            {currentNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${isActive
                    ? 'bg-[#002B49] text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </NavLink>
            ))}
          </nav>

          {/* Quick links section */}
          <div className="mt-8 pt-4 border-t border-slate-800">
            <div className="px-3 text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-2">
              บริการฉลากสาธารณะ
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <span>หน้าค้นหาฉลากประชาชน</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
            <a
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <span>นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>

        {/* System Footer info */}
        {/* <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <span>สภาพแวดล้อม:</span>
            <span className="text-slate-300 font-medium font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded">DEMO</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>ผู้ใช้งานปัจจุบัน:</span>
            <span className="text-slate-300 truncate max-w-[110px]">{currentUser?.fullName || 'ผู้เยี่ยมชม'}</span>
          </div>
        </div> */}
      </aside>
    </>
  );
};
