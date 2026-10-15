import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, PhoneCall, LogIn, Globe } from 'lucide-react';

interface PublicNavbarProps {
  lang?: 'th' | 'en';
  onToggleLang?: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ lang = 'th', onToggleLang }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Agency Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#002B49] to-[#005A9C] text-amber-400 flex items-center justify-center font-bold text-sm shadow-sm border border-amber-400/40">
            อย.
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm sm:text-base leading-tight group-hover:text-blue-900 transition">
              ฉลากดิจิทัล อย.
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 leading-none mt-0.5">
              Thai FDA Digital Labeling Verification
            </p>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hotline 1556 badge */}
          <a
            href="tel:1556"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-full hover:bg-rose-100 transition font-medium"
            title="โทรสายด่วน อย. 1556"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>สายด่วน 1556</span>
          </a>

          {/* Search link */}
          <Link
            to="/search"
            className="p-2 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 text-xs"
            title="ค้นหาข้อมูลฉลาก"
          >
            <Search className="w-4 h-4 text-blue-900" />
            <span className="hidden md:inline font-medium">ค้นหาฉลาก</span>
          </Link>

          {/* Language Switcher TH/EN */}
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'th' ? 'EN' : 'TH'}</span>
            </button>
          )}

          {/* Portal Login */}
          <Link
            to="/login"
            className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">เข้าระบบเจ้าหน้าที่ / ผู้ประกอบการ</span>
            <span className="sm:hidden">เข้าสู่ระบบ</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
