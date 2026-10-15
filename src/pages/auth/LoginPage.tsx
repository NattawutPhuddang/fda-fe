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
  Info
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAsDemo, role } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'demo' | 'official'>('demo');
  const [thaIdPin, setThaIdPin] = useState('');
  const [isSimulatingThaId, setIsSimulatingThaId] = useState(false);

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
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-4 sm:p-6 text-slate-100 font-sans">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/Logo_of_the_Food_and_Drug_Administration.svg"
            alt="โลโก้ อย."
            className="w-10 h-10 object-contain bg-white rounded-full p-0.5"
          />
          <div>
            <h1 className="font-bold text-white text-sm sm:text-base leading-tight">ระบบฉลากดิจิทัล อย.</h1>
            <p className="text-[11px] text-slate-400">สำนักงานคณะกรรมการอาหารและยา กระทรวงสาธารณสุข</p>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition flex items-center gap-1.5"
        >
          <span>มุมมองประชาชน</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-lg w-full mx-auto my-8 bg-white text-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Banner */}
        <div className="bg-[#002B49] text-white p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white mx-auto flex items-center justify-center p-2 mb-2.5 shadow-md">
            <img
              src="/Logo_of_the_Food_and_Drug_Administration.svg"
              alt="อย. FDA Thailand"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-xl font-bold">เข้าสู่ระบบบริการฉลากดิจิทัล</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Thai FDA Digital Labeling Enterprise Authentication
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-3 transition border-b-2 flex items-center justify-center gap-1.5 ${activeTab === 'demo'
              ? 'border-[#002B49] text-[#002B49] bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <UserCheck className="w-4 h-4 text-slate-600" />
            <span>ทดสอบระบบ (Demo Personas)</span>
          </button>
          <button
            onClick={() => setActiveTab('official')}
            className={`flex-1 py-3 transition border-b-2 flex items-center justify-center gap-1.5 ${activeTab === 'official'
              ? 'border-[#002B49] text-[#002B49] bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <Lock className="w-4 h-4 text-slate-600" />
            <span>เข้าสู่ระบบทางการ (ThaID)</span>
          </button>
        </div>

        {/* Tab 1: Demo Personas */}
        {activeTab === 'demo' && (
          <div className="p-5 sm:p-6 space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong>คำแนะนำการประเมิน:</strong> เลือกล็อกอินด้วยบัญชีจำลองด้านล่างตามบทบาท เพื่อทดสอบกระบวนการทำงานได้ทันที
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Persona 1: Entrepreneur */}
              <button
                onClick={() => handleSelectDemoRole('entrepreneur')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-[#002B49] hover:bg-slate-50/70 transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#002B49]">
                        นายสมศักดิ์ วัฒนกิจโกศล
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.2 rounded font-medium border border-slate-300">
                        ผู้ประกอบการ
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">บริษัท สยามไบโอเทค เฮลท์แคร์ จำกัด</p>
                    <p className="text-[10px] text-slate-400">สิทธิ์: จัดการผลิตภัณฑ์, ยื่นร่างฉลาก, ออก QR Code, ดูสถิติ</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition" />
              </button>

              {/* Persona 2: Officer */}
              <button
                onClick={() => handleSelectDemoRole('officer')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-[#002B49] hover:bg-slate-50/70 transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#002B49]">
                        ภญ. วรรณภา สิริกุล
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.2 rounded font-medium border border-slate-300">
                        เจ้าหน้าที่ อย.
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">กองกำกับและตรวจสอบผลิตภัณฑ์ (อย.)</p>
                    <p className="text-[10px] text-slate-400">สิทธิ์: ตรวจ Checklist, อนุมัติ/ส่งกลับแก้ไข, สั่งระงับฉลาก</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition" />
              </button>

              {/* Persona 3: Admin */}
              <button
                onClick={() => handleSelectDemoRole('admin')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-[#002B49] hover:bg-slate-50/70 transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#002B49]">
                        นายธนกร รัตนชัย
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.2 rounded font-medium border border-slate-300">
                        ผู้ดูแลระบบ
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร (อย.)</p>
                    <p className="text-[10px] text-slate-400">สิทธิ์: จัดการผู้ใช้, Matrix สิทธิ์, Master Data, Integration Settings</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition" />
              </button>

              {/* Persona 4: Auditor */}
              <button
                onClick={() => handleSelectDemoRole('auditor')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-[#002B49] hover:bg-slate-50/70 transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#002B49]">
                        นางสาวกุลธิดา ประเสริฐสุข
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.2 rounded font-medium border border-slate-300">
                        ผู้ตรวจสอบ (Auditor)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">สำนักงานการตรวจเงินแผ่นดิน (สตง.)</p>
                    <p className="text-[10px] text-slate-400">สิทธิ์: ดู Audit Log ระบบแบบอ่านอย่างเดียว, กรองเหตุการณ์, Export</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Official ThaID / SKYNET (Integration Placeholder) */}
        {activeTab === 'official' && (
          <form onSubmit={handleSimulateThaID} className="p-5 sm:p-6 space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <AlertCircle className="w-4 h-4 text-slate-600" />
                <span>Integration Placeholder (รอเชื่อมต่อ API ทางการ)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                รองรับการเชื่อมต่อกับ <strong>Digital ID / ThaID (DOPA)</strong> และ <strong>อย. SKYNET SSO</strong> โดยระบบไม่จำลองว่าเชื่อมต่อสำเร็จหากยังไม่มี Credentials ทางการ
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เลขประจำตัวประชาชน 13 หลัก / รหัสผู้ประกอบการ:
              </label>
              <input
                type="text"
                placeholder="1-XXXX-XXXXX-XX-X"
                value={thaIdPin}
                onChange={e => setThaIdPin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={isSimulatingThaId}
              className="w-full py-2.5 bg-[#002B49] hover:bg-[#001D33] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
            >
              {isSimulatingThaId ? 'กำลังส่งคำขอไปยัง ThaID Gateway...' : 'เข้าสู่ระบบด้วย ThaID / Digital ID'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('demo')}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium underline"
              >
                ← สลับไปใช้ Demo Personas เพื่อทดลองระบบทันที
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 py-2">
        <p>© 2026 สำนักงานคณะกรรมการอาหารและยา กระทรวงสาธารณสุข</p>
      </div>
    </div>
  );
};
