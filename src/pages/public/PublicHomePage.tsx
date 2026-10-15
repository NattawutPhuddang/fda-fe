import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { storage } from '../../services/storage';
import { 
  Search, 
  QrCode, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  ChevronRight,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const PublicHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [lang, setLang] = useState<'th' | 'en'>('th');

  const products = storage.getProducts();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/verify/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar lang={lang} onToggleLang={() => setLang(l => l === 'th' ? 'en' : 'th')} />

      {/* Hero Section */}
      <section className="bg-[#002B49] text-white py-14 sm:py-18 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
            <span>ระบบตรวจสอบฉลากดิจิทัล สำนักงานคณะกรรมการอาหารและยา</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            ตรวจสอบข้อมูลฉลากผลิตภัณฑ์สุขภาพ อย.
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            ค้นหาและตรวจสอบข้อมูลที่ได้รับอนุญาตถูกต้องจากสำนักงานคณะกรรมการอาหารและยา ทั้งอาหาร ยา และเครื่องสำอาง
          </p>

          {/* Verification Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto pt-2">
            <div className="bg-white p-1.5 rounded-xl shadow-sm flex flex-col sm:flex-row items-center gap-2 border border-slate-200">
              <div className="flex items-center gap-2 px-3 flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="กรอกเลขสารบบ (13 หลัก), ทะเบียนยา, หรือ Newcode..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#002B49] hover:bg-[#001D33] text-white text-xs sm:text-sm font-semibold rounded-lg transition flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                <span>ตรวจสอบฉลาก</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-left sm:text-center">
              * ตัวอย่าง: 10-1-04760-5-0012 หรือ 1A 45/65 หรือคลิกเลือกตัวอย่างด้านล่าง
            </p>
          </form>
        </div>
      </section>

      {/* Demo Scenarios Quick Selector */}
      <section className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 w-full">
        <div className="bg-white rounded-xl shadow-card border border-slate-200 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">ทดลองเปิดฉลากดิจิทัลตัวอย่าง (Demo Scenarios)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เลือกดูตัวอย่างการแสดงผลฉลากดิจิทัลในแต่ละสถานะของ อย.
              </p>
            </div>
            <Link
              to="/search"
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1"
            >
              <span>ดูผลิตภัณฑ์ทั้งหมด ({products.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Scenario 1: Food Published */}
            <Link
              to="/verify/U1FD0001012345678901234567C"
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50/50 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    เคส 1: อาหาร
                  </span>
                  <StatusBadge status="published" size="sm" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#002B49] line-clamp-1">
                  เครื่องดื่มรังนกแท้สำเร็จรูป ตรา เฮลท์โกลด์
                </h4>
                <p className="text-xs font-mono text-slate-600 mt-1">เลขสารบบ: 10-1-04760-5-0012</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  ตารางโภชนาการ, QR Code สแกนได้จริง, สลับภาษา TH/EN
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700 font-medium">
                <span>เปิดดูฉลากสาธารณะ</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* Scenario 2: Drug Active / Leaflet PDF */}
            <Link
              to="/verify/U1DR0002012345678901234567C"
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50/50 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    เคส 2: ยาแผนปัจจุบัน
                  </span>
                  <StatusBadge status="pending_review" size="sm" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#002B49] line-clamp-1">
                  ยาเม็ดพาราเซตามอล 500 มิลลิกรัม
                </h4>
                <p className="text-xs font-mono text-slate-600 mt-1">ทะเบียนยา: 1A 45/65</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  ข้อบ่งใช้, ข้อห้ามใช้, เอกสารกำกับยา PDF ในหน้าเว็บ
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700 font-medium">
                <span>เปิดดูฉลากและ PDF</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* Scenario 3: Cosmetic Suspended */}
            <Link
              to="/verify/U1CM0003012345678901234567C"
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50/50 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    เคส 3: เครื่องสำอาง
                  </span>
                  <StatusBadge status="suspended" size="sm" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-rose-900 line-clamp-1">
                  ครีมบำรุงผิวหน้า ไวท์เทนนิ่ง ออร่า โกลว์
                </h4>
                <p className="text-xs font-mono text-slate-600 mt-1">เลขที่จดแจ้ง: 10-1-6600123</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  แสดงหน้าแจ้งเตือนคำสั่งระงับ ไม่แสดงฉลาก พร้อมช่องทางโทร 1556
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-700 font-medium">
                <span>ทดสอบดูหน้าแจ้งเตือน</span>
                <ArrowRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h3 className="text-xl font-bold text-slate-900">
            ระบบบริการฉลากดิจิทัลแห่งชาติ
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            ยกระดับความโปร่งใสและการเข้าถึงข้อมูลผลิตภัณฑ์สุขภาพที่ถูกต้องตามมาตรฐาน อย.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#002B49] flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">QR Code ประจำผลิตภัณฑ์</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              เชื่อมโยงข้อมูลสู่ฐานข้อมูล อย. โดยตรง ป้องกันการปลอมแปลงฉลาก และดาวน์โหลดไฟล์มาตรฐานสำหรับพิมพ์บนบรรจุภัณฑ์
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#002B49] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">ตรวจสอบสถานะแบบเรียลไทม์</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              เมื่อมีการสั่งระงับหรือเพิกถอน ระบบจะปรับเปลี่ยนการแสดงผลทันที เพื่อแจ้งเตือนผู้บริโภคไม่ให้บริโภคผลิตภัณฑ์ที่ไม่ปลอดภัย
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#002B49] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">เอกสารกำกับและข้อมูลสองภาษา</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              เปิดอ่านเอกสารกำกับยาและผลแล็บทางการของ อย. ได้ทันที พร้อมระบบสลับอ่านฉลากภาษาไทยและภาษาอังกฤษ
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
