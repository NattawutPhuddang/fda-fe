import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  allowedRoles?: string[];
}

export const AppLayout: React.FC<AppLayoutProps> = ({ allowedRoles }) => {
  const { currentUser, role, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role is not allowed for this route, redirect to unauthorized
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Topbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />

          {/* Legal / Prototype notice banner */}
          <footer className="mt-16 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
            <p>
              ระบบสารสนเทศฉลากดิจิทัล สำนักงานคณะกรรมการอาหารและยา (อย.) กระทรวงสาธารณสุข
            </p>
            <p className="text-[11px] text-slate-400">
              * ข้อมูลที่แสดงในระบบเป็นข้อมูลจำลองเพื่อการทดสอบต้นแบบฟังก์ชันงาน (Interactive Functional Prototype) ไม่ใช่ข้อมูลจริงของ อย.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};
