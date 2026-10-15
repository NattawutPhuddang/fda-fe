import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../services/types';
import { 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Building2, 
  Briefcase, 
  ShieldAlert, 
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAsDemo, isAuthenticated, role } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'demo' | 'official'>('demo');
  const [thaIdPin, setThaIdPin] = useState('');
  const [isSimulatingThaId, setIsSimulatingThaId] = useState(false);

  // If already logged in, show redirect helper
  const handleRedirectCurrent = () => {
    if (role === 'entrepreneur') navigate('/entrepreneur/dashboard');
    else if (role === 'officer') navigate('/officer/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'auditor') navigate('/auditor/logs');
    else navigate('/');
  };

  const handleSelectDemoRole = (targetRole: UserRole) => {
    const ok = loginAsDemo(targetRole);
    if (ok) {
      success(`เข้าสู่ระบบสำเร็จในบทบาท: ${targetRole}`);
      if (targetRole === 'entrepreneur') navigate('/entrepreneur/dashboard');
      else if (targetRole === 'officer') navigate('/officer/dashboard');
      else if (targetRole === 'admin') navigate('/admin/dashboard');
      else if (targetRole === 'auditor') navigate('/auditor/logs');
    } else {
      error('ไม่พบข้อมูลบัญชีผู้ใช้ในบทบาทนี้');
    }
  };

  const handleSimulateThaID = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatingThaId(true);
    setTimeout(() => {
      setIsSimulatingThaId(false);
      info(
        'Integration Placeholder: ระบบเชื่อมต่อ ThaID API จำเป็นต้องใช้ Client ID & Secret จริงจากกรมการปกครอง (DOPA) ในโหมดทดสอบกรุณาเลือก Demo Persona แทน',
        'แจ้งสถานะการเชื่อมต่อ'
      );
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-between p-4 sm:p-6 text-slate-100">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-400/40 shadow-lg">
            อย.
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">ระบบฉลากดิจิทัล อย.</h1>
            <p className="text-xs text-blue-200">สำนักงานคณะกรรมการอาหารและยา กระทรวงสาธารณสุข</p>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs text-blue-200 hover:text-white px-3 py-1.5 rounded-lg border border-blue-800 hover:bg-blue-900/50 transition flex items-center gap-1.5"
        >
          <span>มุมมองประชาชน</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-xl w-full mx-auto my-8 bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Banner */}
        <div className="bg-[#002B49] text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center border border-white/20 mb-3 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">เข้าสู่ระบบบริการฉลากดิจิทัล</h2>
            <p className="text-xs sm:text-sm text-blue-200 mt-1">
              Thai FDA Digital Labeling Enterprise Authentication
            </p>
          </div>
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl" />
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'demo'
                ? 'border-blue-900 text-blue-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>ทดสอบระบบ (Demo Personas)</span>
          </button>
          <button
            onClick={() => setActiveTab('official')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'official'
                ? 'border-blue-900 text-blue-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4 text-blue-600" />
            <span>เข้าสู่ระบบทางการ (ThaID / SKYNET)</span>
          </button>
        </div>

        {/* Tab 1: Demo Personas */}
        {activeTab === 'demo' && (
          <div className="p-6 sm:p-8 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong>คำแนะนำการทดสอบ (Evaluation Mode):</strong> เลือกล็อกอินด้วยบัญชีจำลองด้านล่างตามบทบาทที่ต้องการ เพื่อทดสอบ Flow การทำงานแบบ Interactive เสมือนจริง
              </div>
            </div>

            <div className="space-y-3">
              {/* Persona 1: Entrepreneur */}
              <button
                onClick={() => handleSelectDemoRole('entrepreneur')}
                className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 hover:shadow-md transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    <Building2 className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 group-hover:text-blue-900">
                        นายสมศักดิ์ วัฒนกิจโกศล
                      </span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-amber-300">
                        ผู้ประกอบการ
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">บริษัท สยามไบโอเทค เฮลท์แคร์ จำกัด (นิติบุคคล)</p>
                    <p className="text-[11px] text-slate-400">สิทธิ์: จัดการผลิตภัณฑ์, ยื่นร่างฉลาก, ขอรับ QR Code, ดูสถิติสแกน</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
              </button>

              {/* Persona 2: Officer */}
              <button
                onClick={() => handleSelectDemoRole('officer')}
                className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 hover:shadow-md transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 group-hover:text-blue-900">
                        ภญ. วรรณภา สิริกุล
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-blue-300">
                        เจ้าหน้าที่ อย.
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">กองกำกับและตรวจสอบผลิตภัณฑ์ สำนักงานคณะกรรมการอาหารและยา</p>
                    <p className="text-[11px] text-slate-400">สิทธิ์: รับเรื่อง, ตรวจ Checklist, อนุมัติ/ส่งกลับแก้ไข, ระงับฉลาก, รายงาน</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
              </button>

              {/* Persona 3: Admin */}
              <button
                onClick={() => handleSelectDemoRole('admin')}
                className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 hover:shadow-md transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-purple-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 group-hover:text-blue-900">
                        นายธนกร รัตนชัย
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-purple-300">
                        ผู้ดูแลระบบ
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร (ศทส. อย.)</p>
                    <p className="text-[11px] text-slate-400">สิทธิ์: จัดการผู้ใช้, Matrix สิทธิ์, Master Data, Integration API, System Config</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
              </button>

              {/* Persona 4: Auditor */}
              <button
                onClick={() => handleSelectDemoRole('auditor')}
                className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 hover:shadow-md transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    <ShieldAlert className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 group-hover:text-blue-900">
                        นางสาวกุลธิดา ประเสริฐสุข
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-300">
                        ผู้ตรวจสอบ (Auditor)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">สำนักงานการตรวจเงินแผ่นดิน (สตง.) / ผู้ตรวจอิสระ</p>
                    <p className="text-[11px] text-slate-400">สิทธิ์: ดู Audit Log ระบบแบบอ่านอย่างเดียว, กรองเหตุการณ์, Export Excel/CSV</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Official ThaID / SKYNET (Integration Placeholder) */}
        {activeTab === 'official' && (
          <form onSubmit={handleSimulateThaID} className="p-6 sm:p-8 space-y-5">
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Integration Placeholder (รอเชื่อมต่อ API ทางการ)</span>
              </div>
              <p className="leading-relaxed">
                ตามข้อกำหนด TOR หน้าจอนี้ออกแบบเป็น Adapter รองรับระบบยืนยันตัวตนดิจิทัลภาครัฐ <strong>Digital ID / ThaID (DOPA)</strong> และ <strong>อย. SKYNET SSO</strong> โดยระบบไม่จำลองว่าเชื่อมต่อสำเร็จจริงหากยังไม่มี Credentials หรือ API จากหน่วยงาน
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เลขประจำตัวประชาชน 13 หลัก / รหัสผู้ประกอบการ SKYNET:
              </label>
              <input
                type="text"
                placeholder="1-XXXX-XXXXX-XX-X"
                value={thaIdPin}
                onChange={e => setThaIdPin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSimulatingThaId}
              className="w-full py-3 bg-blue-900 hover:bg-blue-950 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center justify-center gap-2"
            >
              {isSimulatingThaId ? 'กำลังส่งคำขอไปยัง ThaID Gateway...' : 'เข้าสู่ระบบด้วย ThaID / Digital ID'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('demo')}
                className="text-xs text-blue-700 hover:underline font-medium"
              >
                ← สลับไปใช้ Demo Personas เพื่อทดลองระบบทันที
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-blue-300 py-2">
        <p>© 2026 สำนักงานคณะกรรมการอาหารและยา กระทรวงสาธารณสุข</p>
        <p className="text-[11px] text-blue-400 mt-0.5">
          ความปลอดภัยระดับ Enterprise ด้วย TLS 1.3, PDPA Compliance & Role-Based Access Control
        </p>
      </div>
    </div>
  );
};
