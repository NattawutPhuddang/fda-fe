import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { Representative } from '../../services/types';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  Mail, 
  Phone, 
  FileCheck,
  Building2,
  Trash2
} from 'lucide-react';

export const RepresentativePage: React.FC = () => {
  const { success, warning } = useToast();
  const [representatives, setRepresentatives] = useState<Representative[]>(() => storage.getRepresentatives());
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [scope, setScope] = useState<string>('ยื่นคำขอฉลากดิจิทัล (Submit Digital Label)');

  const handleAddRepresentative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !idCardNumber.trim()) {
      warning('กรุณากรอกชื่อและเลขบัตรประชาชนตัวแทน');
      return;
    }

    const newRep: Representative = {
      id: `rep-${Date.now()}`,
      entrepreneurId: 'ent-01',
      fullName,
      idCardNumber,
      email,
      phoneNumber,
      scopeOfAuthority: [scope],
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '2027-12-31',
      status: 'ACTIVE',
      verifiedFromDBD: true
    };

    const updated = [newRep, ...representatives];
    storage.saveRepresentatives(updated);
    setRepresentatives(updated);

    storage.addAuditLog({
      userId: 'usr-ent',
      userName: 'ผู้ประกอบการ',
      userRole: 'entrepreneur',
      action: 'ADD_REPRESENTATIVE',
      resourceType: 'REPRESENTATIVE',
      resourceId: newRep.id,
      result: 'SUCCESS',
      details: `เพิ่มตัวแทนผู้รับมอบอำนาจใหม่: ${fullName} (สิทธิ์: ${scope})`
    });

    setIsAddOpen(false);
    setFullName('');
    setIdCardNumber('');
    setEmail('');
    setPhoneNumber('');
    success('เพิ่มตัวแทนผู้รับมอบอำนาจและตรวจสอบฐานข้อมูล DBD เรียบร้อยแล้ว');
  };

  const handleRevoke = (id: string, name: string) => {
    const updated = representatives.map(r => r.id === id ? { ...r, status: 'REVOKED' as const } : r);
    storage.saveRepresentatives(updated);
    setRepresentatives(updated);
    success(`ยกเลิกหนังสือมอบอำนาจของ ${name} สำเร็จ`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">ตัวแทนผู้รับมอบอำนาจ (Representatives)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            จัดการหนังสือมอบอำนาจอิเล็กทรอนิกส์และตรวจสอบสถานะการเป็นตัวแทนทางกฎหมาย
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มตัวแทนผู้รับมอบอำนาจ</span>
        </button>
      </div>

      {/* DBD Integration Status Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900">เชื่อมโยงข้อมูลกรมพัฒนาธุรกิจการค้า (DBD Integration):</strong> ข้อมูลนิติบุคคลและกรรมการผู้มีอำนาจลงนามผูกพันบริษัท ได้รับการตรวจสอบและยืนยันความถูกต้องผ่าน e-Certificate จาก DBD ทุกรายการมอบอำนาจมีผลสมบูรณ์ตามกฎหมาย
        </div>
      </div>

      {/* List of Representatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {representatives.map(rep => (
          <div
            key={rep.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-sm">
                    {rep.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{rep.fullName}</h3>
                    <span className="font-mono text-slate-400 text-[11px]">{rep.idCardNumber}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${
                    rep.status === 'ACTIVE'
                      ? 'bg-slate-100 text-slate-800 border-slate-300'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {rep.status === 'ACTIVE' ? 'มีผลบังคับใช้' : 'ถูกเพิกถอน'}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{rep.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{rep.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>อายุการมอบอำนาจ: {rep.startDate} ถึง {rep.endDate}</span>
                </div>
              </div>

              {/* Scope of Authority */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                  ขอบเขตอำนาจหน้าที่ที่ได้รับอนุญาต:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {rep.scopeOfAuthority.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 text-slate-700 border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> ตรวจสอบ DBD ผ่านแล้ว
              </span>

              {rep.status === 'ACTIVE' && (
                <button
                  onClick={() => handleRevoke(rep.id, rep.fullName)}
                  className="text-xs text-rose-600 hover:text-rose-800 hover:underline font-medium"
                >
                  เพิกถอนอำนาจ
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Representative Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="เพิ่มตัวแทนผู้รับมอบอำนาจใหม่"
        subtitle="บันทึกหนังสือมอบอำนาจอิเล็กทรอนิกส์สำหรับยื่นคำขอฉลาก อย."
      >
        <form onSubmit={handleAddRepresentative} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              ชื่อ-นามสกุล ตัวแทน (*):
            </label>
            <input
              type="text"
              required
              placeholder="เช่น นายเกรียงไกร ชัยชนะ"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              เลขประจำตัวประชาชน 13 หลัก (*):
            </label>
            <input
              type="text"
              required
              placeholder="1-XXXX-XXXXX-XX-X"
              value={idCardNumber}
              onChange={e => setIdCardNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">อีเมล:</label>
              <input
                type="email"
                placeholder="agent@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">หมายเลขโทรศัพท์:</label>
              <input
                type="text"
                placeholder="081-xxx-xxxx"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">ขอบเขตอำนาจหน้าที่ (*):</label>
            <select
              value={scope}
              onChange={e => setScope(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ยื่นคำขอฉลากดิจิทัล (Submit Digital Label)">ยื่นคำขอฉลากดิจิทัล (Submit Digital Label)</option>
              <option value="เตรียมข้อมูลและแนบเอกสารเทคนิค (Draft Only)">เตรียมข้อมูลและแนบเอกสารเทคนิค (Draft Only)</option>
              <option value="ดาวน์โหลดและจัดการ QR Code สำหรับโรงพิมพ์">ดาวน์โหลดและจัดการ QR Code สำหรับโรงพิมพ์</option>
              <option value="มีอำนาจเต็มทุกประการ (Full Regulatory Agent)">มีอำนาจเต็มทุกประการ (Full Regulatory Agent)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-semibold rounded-xl shadow transition"
            >
              บันทึกตัวแทนและยืนยัน DBD
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
