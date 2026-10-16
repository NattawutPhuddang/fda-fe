import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, Check, X, ShieldAlert, Info } from 'lucide-react';
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
    { 
      resource: 'ดูฉลากสาธารณะ (Public Label View)', 
      description: 'สแกน QR Code หรือค้นหาเพื่อดูฉลากและข้อมูลความปลอดภัย', 
      public: true, 
      entrepreneur: true, 
      officer: true, 
      admin: true, 
      auditor: true 
    },
    { 
      resource: 'เปิดดูเอกสารกำกับยาและแล็บ (PDF Viewer)', 
      description: 'เปิดอ่านเอกสาร PDF ทางการในหน้าเว็บแบบอินไลน์', 
      public: true, 
      entrepreneur: true, 
      officer: true, 
      admin: true, 
      auditor: true 
    },
    { 
      resource: 'ยื่นคำขอฉลากดิจิทัล (Create & Submit Label)', 
      description: 'สร้างร่างฉลาก กรอกสูตร แนบเอกสาร และส่งตรวจประเมิน', 
      public: false, 
      entrepreneur: true, 
      officer: false, 
      admin: true, 
      auditor: false 
    },
    { 
      resource: 'ดาวน์โหลด QR Code สำหรับพิมพ์ (Download QR)', 
      description: 'ดาวน์โหลด SVG/PNG ความละเอียดสูงสำหรับพิมพ์บนกล่องบรรจุภัณฑ์', 
      public: false, 
      entrepreneur: true, 
      officer: true, 
      admin: true, 
      auditor: false 
    },
    { 
      resource: 'เผยแพร่ฉลากสาธารณะ (Publish Label)', 
      description: 'กดเผยแพร่ฉลาก (เฉพาะเมื่อผ่านการอนุมัติจาก อย. แล้วเท่านั้น)', 
      public: false, 
      entrepreneur: true, 
      officer: true, 
      admin: true, 
      auditor: false 
    },
    { 
      resource: 'รับเรื่องและมอบหมายงาน (Claim & Assign)', 
      description: 'กดรับเรื่องคำขอฉลากเข้าคิวตนเอง หรือมอบหมายให้เจ้าหน้าที่คนอื่น', 
      public: false, 
      entrepreneur: false, 
      officer: true, 
      admin: true, 
      auditor: false 
    },
    { 
      resource: 'ตรวจประเมิน Checklist 3 สถานะ', 
      description: 'บันทึกสถานะ ผ่าน / ไม่ผ่าน / ต้องแก้ไข รายข้อพร้อมหมายเหตุ', 
      public: false, 
      entrepreneur: false, 
      officer: true, 
      admin: true, 
      auditor: false 
    },
    { 
      resource: 'เปรียบเทียบความแตกต่างฉลาก (Diff Modal)', 
      description: 'ดูการเปลี่ยนแปลง Side-by-Side ระหว่างเวอร์ชันแก้ไขกับเวอร์ชันเดิม', 
      public: false, 
      entrepreneur: false, 
      officer: true, 
      admin: true, 
      auditor: true 
    },
    { 
      resource: 'ส่งกลับแก้ไขคำขอ (Request Revision)', 
      description: 'แจ้งข้อบกพร่องตาม Checklist พร้อมแนบเอกสารหลักฐานของ อย.', 
      public: false, 
      entrepreneur: false, 
      officer: true, 
      admin: true, 
      auditor: false 
    },
    { 
      resource: 'อนุมัติ / ไม่อนุมัติคำขอฉลาก (Approve / Reject)', 
      description: 'พิจารณาอนุมัติให้ใช้ฉลากดิจิทัล หรือปฏิเสธคำขอตามเกณฑ์', 
      public: false, 
      entrepreneur: false, 
      officer: true, 
      admin: true, 
      auditor: false 
    },
    { 
      resource: 'ออกคำสั่งระงับ / ปลดระงับฉลาก (Suspension Order)', 
      description: 'สั่งระงับฉลากชั่วคราวพร้อมระบุเลขที่คำสั่ง อย. และวันที่มีผล', 
      public: false, 
      entrepreneur: false, 
      officer: true, 
      admin: true, 
      auditor: false 
    },
    { 
      resource: 'เรียกดูและส่งออกรายงานสถิติ (Regulatory Reports)', 
      description: 'รายงานคำขอค้าง SLA, Turnaround Time และประสิทธิภาพเจ้าหน้าที่', 
      public: false, 
      entrepreneur: false, 
      officer: true, 
      admin: true, 
      auditor: true 
    },
    { 
      resource: 'จัดการผู้ใช้งานและสิทธิ์ (User & RBAC)', 
      description: 'สร้าง แก้ไข ระงับบัญชี และกำหนดสิทธิ์การเข้าถึง', 
      public: false, 
      entrepreneur: false, 
      officer: false, 
      admin: true, 
      auditor: false 
    },
    { 
      resource: 'จัดการข้อมูลหลัก (Master Data & Checklist Templates)', 
      description: 'เพิ่ม/แก้ไขหมวดหมู่ผลิตภัณฑ์ ประเภทเอกสาร และแม่แบบ Checklist', 
      public: false, 
      entrepreneur: false, 
      officer: false, 
      admin: true, 
      auditor: false 
    },
    { 
      resource: 'ตรวจสอบบันทึกความมั่นคงปลอดภัย (Audit Logs Trail)', 
      description: 'ดูประวัติการเข้าใช้งานและกิจกรรมสำคัญแบบ Append-Only และ Export', 
      public: false, 
      entrepreneur: false, 
      officer: false, 
      admin: true, 
      auditor: true 
    }
  ]);

  const handleToggle = (rowIndex: number, roleKey: keyof PermissionRow) => {
    // Business logic guards
    if (roleKey === 'public') {
      const restrictedForPublic = [
        'ยื่นคำขอฉลากดิจิทัล', 
        'อนุมัติ / ไม่อนุมัติ', 
        'ออกคำสั่งระงับ', 
        'จัดการผู้ใช้งาน',
        'จัดการข้อมูลหลัก',
        'ตรวจสอบบันทึก'
      ];
      if (restrictedForPublic.some(r => permissions[rowIndex].resource.includes(r))) {
        warning('ไม่สามารถเปิดสิทธิ์นี้ให้ประชาชนทั่วไปได้เนื่องจากขัดต่อมาตรการรักษาความมั่นคงปลอดภัย');
        return;
      }
    }

    if (roleKey === 'entrepreneur' && permissions[rowIndex].resource.includes('อนุมัติ / ไม่อนุมัติ')) {
      warning('ผู้ประกอบการไม่สามารถมีสิทธิ์อนุมัติคำขอฉลากของตนเองได้ (Segregation of Duties)');
      return;
    }

    setPermissions(prev => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [roleKey]: !updated[rowIndex][roleKey]
      };
      return updated;
    });

    success('อัปเดตผังเมทริกซ์สิทธิ์ (RBAC Matrix) เรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          ผังกำหนดสิทธิ์การใช้งาน (Role-Based Access Control Matrix)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          ตารางควบคุมสิทธิ์ระดับฟังก์ชันงาน (Functional Permissions) ตามบทบาทหลักในระบบของ อย.
        </p>
      </div>

      {/* Compliance / Segregation of Duties Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs space-y-1.5 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-sm text-blue-950">
          <Info className="w-4 h-4 text-blue-800" />
          <span>หลักการแบ่งแยกหน้าที่ตามมาตรฐานความมั่นคงปลอดภัย (Segregation of Duties):</span>
        </div>
        <p className="leading-relaxed">
          ระบบแยกสิทธิ์ <strong>"การเผยแพร่ฉลาก (Publish)"</strong> และ <strong>"การอนุมัติคำขอ (Approve)"</strong> ออกจากกัน โดยผู้ประกอบการมีสิทธิ์กดเผยแพร่ฉลากได้เฉพาะเมื่อคำขอผ่านการอนุมัติจาก <strong>เจ้าหน้าที่ อย. (Officer)</strong> แล้วเท่านั้น และไม่มีสิทธิ์อนุมัติคำขอตนเอง
        </p>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 min-w-[240px]">ทรัพยากร / ฟังก์ชันงาน</th>
                <th className="py-3.5 px-3 text-center">ประชาชนทั่วไป</th>
                <th className="py-3.5 px-3 text-center">ผู้ประกอบการ</th>
                <th className="py-3.5 px-3 text-center bg-blue-50/70 text-blue-950 font-bold">
                  เจ้าหน้าที่ อย.
                </th>
                <th className="py-3.5 px-3 text-center">ผู้ดูแลระบบ (Admin)</th>
                <th className="py-3.5 px-3 text-center">ผู้ตรวจสอบระบบ (Auditor)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {permissions.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <strong className="text-slate-900 block font-semibold">{row.resource}</strong>
                    <span className="text-[11px] text-slate-500 leading-snug block">{row.description}</span>
                  </td>

                  {/* Public */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleToggle(idx, 'public')}
                      className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition ${
                        row.public ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-300'
                      }`}
                    >
                      {row.public ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </td>

                  {/* Entrepreneur */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleToggle(idx, 'entrepreneur')}
                      className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition ${
                        row.entrepreneur ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-300'
                      }`}
                    >
                      {row.entrepreneur ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </td>

                  {/* Officer */}
                  <td className="py-3 px-3 text-center bg-blue-50/30">
                    <button
                      onClick={() => handleToggle(idx, 'officer')}
                      className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition ${
                        row.officer ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-300'
                      }`}
                    >
                      {row.officer ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </td>

                  {/* Admin */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleToggle(idx, 'admin')}
                      className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition ${
                        row.admin ? 'bg-purple-900 text-white shadow-xs' : 'bg-slate-100 text-slate-300'
                      }`}
                    >
                      {row.admin ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </td>

                  {/* Auditor */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleToggle(idx, 'auditor')}
                      className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition ${
                        row.auditor ? 'bg-[#002B49] text-white shadow-xs' : 'bg-slate-100 text-slate-300'
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
