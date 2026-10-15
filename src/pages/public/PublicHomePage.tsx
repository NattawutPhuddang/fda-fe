import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { storage } from '../../services/storage';
import { 
  Search, 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink,
  ChevronRight
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
      <section className="bg-gradient-to-b from-[#002B49] via-[#003861] to-[#002B49] text-white py-14 sm:py-20 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs text-blue-200 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ระบบตรวจสอบฉลากดิจิทัลแห่งชาติ โดย อย. กระทรวงสาธารณสุข</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            สแกนหรือค้นหา <span className="text-amber-400">ฉลากดิจิทัล อย.</span><br />
            มั่นใจ ปลอดภัย ทุกผลิตภัณฑ์
          </h2>

          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            ตรวจสอบข้อมูลผลิตภัณฑ์อาหาร ยา เครื่องสำอาง และผลิตภัณฑ์สุขภาพที่ได้รับอนุญาตถูกต้องจากสำนักงานคณะกรรมการอาหารและยา ตรวจสอบย้อนกลับได้แบบเรียลไทม์
          </p>

          {/* Verification Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto pt-2">
            <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-blue-200">
              <div className="flex items-center gap-2.5 px-3 flex-1 w-full">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="กรอกเลขสารบบ (13 หลัก), เลขทะเบียนยา, หรือ Newcode..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-slate-900 placeholder-slate-400 text-sm focus:outline-none py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-blue-900 hover:bg-blue-950 text-white text-sm font-semibold rounded-xl shadow transition flex items-center justify-center gap-2 flex-shrink-0"
              >
                <span>ตรวจสอบฉลาก</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-blue-200/80 mt-2 text-left sm:text-center">
              * ตัวอย่างการค้นหา: 10-1-04760-5-0012 หรือ 1A 45/65 หรือคลิกเลือกตัวอย่างด้านล่าง
            </p>
          </form>
        </div>

        {/* Subtle Decorative Shapes */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Demo Scenarios Quick Selector */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-20 w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">ทดลองเปิดฉลากดิจิทัลตัวอย่าง (Demo Scenarios)</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                เลือกทดสอบดูผลลัพธ์ของฉลากในแต่ละสถานะ (ผ่านอนุมัติ, รอตรวจ, สั่งระงับ) ได้ทันที
              </p>
            </div>
            <Link
              to="/search"
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1"
            >
              <span>ดูผลิตภัณฑ์ทั้งหมด ({products.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Scenario 1: Food Published */}
            <Link
              to="/verify/U1FD0001012345678901234567C"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    เคส 1: อาหาร (เผยแพร่แล้ว)
                  </span>
                  <StatusBadge status="published" size="sm" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-900 line-clamp-1">
                  เครื่องดื่มรังนกแท้สำเร็จรูป ตรา เฮลท์โกลด์
                </h4>
                <p className="text-xs text-blue-900 font-mono mt-1">เลขสารบบ: 10-1-04760-5-0012</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  มีตารางโภชนาการสมบูรณ์, QR Code สแกนได้จริง, รองรับสลับภาษา TH/EN
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-medium">
                <span>เปิดดูฉลากสาธารณะ</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* Scenario 2: Drug Active / Leaflet PDF */}
            <Link
              to="/verify/U1DR0002012345678901234567C"
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    เคส 2: ยา (เอกสารกำกับ PDF)
                  </span>
                  <StatusBadge status="pending_review" size="sm" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-900 line-clamp-1">
                  ยาเม็ดพาราเซตามอล 500 มิลลิกรัม
                </h4>
                <p className="text-xs text-blue-900 font-mono mt-1">ทะเบียนยา: 1A 45/65</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  มีข้อบ่งใช้, ข้อห้ามใช้, และปุ่มเปิดดูเอกสารกำกับยา PDF ในหน้าเว็บ
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-medium">
                <span>เปิดดูฉลากและ PDF</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* Scenario 3: Cosmetic Suspended */}
            <Link
              to="/verify/U1CM0003012345678901234567C"
              className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 hover:border-rose-400 hover:bg-rose-50/60 hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                    เคส 3: เครื่องสำอาง (สั่งระงับ)
                  </span>
                  <StatusBadge status="suspended" size="sm" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 group-hover:text-rose-900 line-clamp-1">
                  ครีมบำรุงผิวหน้า ไวท์เทนนิ่ง ออร่า โกลว์
                </h4>
                <p className="text-xs text-blue-900 font-mono mt-1">เลขที่จดแจ้ง: 10-1-6600123</p>
                <p className="text-xs text-rose-700 mt-1 line-clamp-2">
                  แสดงแบนเนอร์แจ้งเตือนอันตรายสีแดง ไม่แสดงฉลาก พร้อมปุ่มแจ้งสายด่วน อย. 1556
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-rose-200 flex items-center justify-between text-xs text-rose-700 font-medium">
                <span>ทดสอบดูหน้าแจ้งเตือน</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-slate-900">
            มาตรฐานฉลากดิจิทัลแห่งชาติ (Thai FDA Digital Labeling)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            ยกระดับการคุ้มครองผู้บริโภคด้วยเทคโนโลยีสแกนตรวจสอบข้อมูลผลิตภัณฑ์สุขภาพแบบครบวงจร
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-800">QR Code มาตรฐานความปลอดภัย</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              สร้าง QR Code ประจำผลิตภัณฑ์ที่เชื่อมโยงกับฐานข้อมูล อย. ป้องกันการปลอมแปลงฉลาก และดาวน์โหลดเป็นไฟล์ Vector คุณภาพสูงสำหรับพิมพ์บรรจุภัณฑ์
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-800">ตรวจสอบสถานะแบบเรียลไทม์</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              เมื่อมีการสั่งระงับหรือเพิกถอนผลิตภัณฑ์ ระบบจะปรับเปลี่ยนการแสดงผลทันที เพื่อเตือนภัยผู้บริโภคไม่ให้บริโภคผลิตภัณฑ์ที่ไม่ปลอดภัย
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-800">เอกสารกำกับและข้อมูลสองภาษา</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              ประชาชนสามารถดูเอกสารกำกับยา ผลแล็บ และสลับอ่านฉลากได้ทั้งภาษาไทยและอังกฤษ เพื่อรองรับนักท่องเที่ยวและผู้บริโภคทุกกลุ่ม
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
