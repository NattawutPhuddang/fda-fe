import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { role, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">ไม่มีสิทธิ์เข้าถึงหน้านี้ (403 Access Denied)</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          บทบาทปัจจุบันของคุณ (<strong>{role}</strong>) ไม่มีสิทธิ์ในการเข้าถึงทรัพยากรหรือฟังก์ชันงานนี้ ตามนโยบายการควบคุมการเข้าถึง (RBAC) ของระบบฉลากดิจิทัล อย.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/login"
            onClick={logout}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold rounded-xl shadow transition"
          >
            ออกจากระบบเพื่อเปลี่ยนบทบาทผู้ใช้
          </Link>
          <Link
            to="/"
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition inline-flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>กลับสู่หน้าหลักสาธารณะ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
