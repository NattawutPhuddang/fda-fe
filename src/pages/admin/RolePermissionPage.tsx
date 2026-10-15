import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, Check, X, ShieldAlert } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface PermissionRow {
  resource: string;
  description: string;
  public: boolean;
  entrepreneur: boolean;
  officer: boolean;
  admin: boolean;
  auditor: boolean;
}

export const RolePermissionPage: React.FC = () => {
  const { success, warning } = useToast();

  const [permissions, setPermissions] = useState<PermissionRow[]>([
    { resource: 'ดูฉลากสาธารณะ (Public Label View)', description: 'สแกน QR Code หรือค้นหาเพื่อดูฉลาก', public: true, entrepreneur: true, officer: true, admin: true, auditor: true },
    { resource: 'เปิดดูเอกสารกำกับยาและแล็บ (PDF Viewer)', description: 'เปิดอ่านเอกสาร PDF ในหน้าเว็บ', public: true, entrepreneur: true, officer: true, admin: true, auditor: true },
    { resource: 'ยื่นคำขอฉลากดิจิทัล (Create & Submit Label)', description: 'สร้างร่างฉลาก แนบเอกสาร และส่งตรวจ', public: false, entrepreneur: true, officer: false, admin: true, auditor: false },
    { resource: 'ดาวน์โหลด QR Code สำหรับพิมพ์ (Download QR)', description: 'ดาวน์โหลด SVG/PNG ความละเอียดสูง', public: false, entrepreneur: true, officer: true, admin: true, auditor: false },
    { resource: 'ตรวจประเมิน Checklist (Review Checklist)', description: 'ตรวจทีละข้อตามเกณฑ์กฎหมาย อย.', public: false, entrepreneur: false, officer: true, admin: true, auditor: false },
    { resource: 'อนุมัติ / ส่งกลับแก้ไข (Approve / Revision)', description: 'ตัดสินผลการพิจารณาคำขอฉลาก', public: false, entrepreneur: false, officer: true, admin: true, auditor: false },
    { resource: 'เผยแพร่ฉลากสู่สาธารณะ (Publish Label)', description: 'เปิดให้ประชาชนสแกน QR ใช้งานจริง', public: false, entrepreneur: true, officer: true, admin: true, auditor: false },
    { resource: 'สั่งระงับฉลากชั่วคราว (Suspend Label)', description: 'ระงับการเผยแพร่ฉลากเมื่อพบอันตราย', public: false, entrepreneur: false, officer: true, admin: true, auditor: false },
    { resource: 'ตรวจสอบ Audit Log ระบบ (Audit Log Access)', description: 'ดูประวัติเหตุการณ์และ Security Logs', public: false, entrepreneur: false, officer: false, admin: true, auditor: true },
    { resource: 'ส่งออกรายงาน Excel/CSV (Export Reports)', description: 'Export ข้อมูลสถิติและผลการดำเนินงาน', public: false, entrepreneur: true, officer: true, admin: true, auditor: true },
    { resource: 'จัดการผู้ใช้และสิทธิ์ระบบ (Manage Users & RBAC)', description: 'สร้าง แก้ไข ระงับบัญชี และตั้งค่าระบบ', public: false, entrepreneur: false, officer: false, admin: true, auditor: false },
  ]);

  const handleToggle = (rowIndex: number, roleKey: keyof PermissionRow) => {
    // Guardrail: Cannot disable Admin privileges or elevate Public without strict logic
    if (roleKey === 'admin') {
      warning('บทบาทผู้ดูแลระบบ (Admin) ต้องมีสิทธิ์เต็มตามกฎหมาย ไม่สามารถยกเลิกได้');
      return;
    }
    setPermissions(prev => {
      const copy = [...prev];
      copy[rowIndex] = {
        ...copy[rowIndex],
        [roleKey]: !copy[rowIndex][roleKey]
      };
      return copy;
    });
    success('ปรับปรุงผังเมทริกซ์สิทธิ์ (Permission Matrix) เรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          บทบาทและตารางสิทธิ์การเข้าถึง (Role & Permission Matrix)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          ผังกำกับสิทธิ์แบบ Role-Based Access Control (RBAC) ตามมาตรฐานความมั่นคงปลอดภัยสารสนเทศภาครัฐ
        </p>
      </div>

      {/* Security Guardrail Card */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1.5 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>การบังคับใช้สิทธิ์แบบ Dual-Enforcement (Frontend & Target ASP.NET Core API):</span>
        </div>
        <p className="leading-relaxed">
          นอกจากระบบจะซ่อนเมนูและปุ่มบน UI ตามสิทธิ์ของผู้ใช้แล้ว ในระบบจริง API Layer บน ASP.NET Core จะบังคับใช้ <strong>[Authorize(Policy = "...")]</strong> ในทุก Controller Endpoint เพื่อป้องกันการโจมตี Broken Access Control (OWASP Top 10) อย่างเด็ดขาด
        </p>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#002B49] text-white font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">สิทธิ์การดำเนินการ (Operation / Resource)</th>
                <th className="py-3.5 px-4 text-center">ประชาชน (Public)</th>
                <th className="py-3.5 px-4 text-center">ผู้ประกอบการ (Entrepreneur)</th>
                <th className="py-3.5 px-4 text-center">เจ้าหน้าที่ อย. (Officer)</th>
                <th className="py-3.5 px-4 text-center">ผู้ดูแลระบบ (Admin)</th>
                <th className="py-3.5 px-4 text-center">ผู้ตรวจสอบ (Auditor)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {permissions.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <strong className="text-slate-900 block font-semibold">{row.resource}</strong>
                    <span className="text-[11px] text-slate-400">{row.description}</span>
                  </td>

                  {/* Public */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggle(idx, 'public')}
                      className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition ${
                        row.public ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {row.public ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </td>

                  {/* Entrepreneur */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggle(idx, 'entrepreneur')}
                      className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition ${
                        row.entrepreneur ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {row.entrepreneur ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </td>

                  {/* Officer */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggle(idx, 'officer')}
                      className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition ${
                        row.officer ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {row.officer ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </td>

                  {/* Admin */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggle(idx, 'admin')}
                      className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition ${
                        row.admin ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {row.admin ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </td>

                  {/* Auditor */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggle(idx, 'auditor')}
                      className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition ${
                        row.auditor ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {row.auditor ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
