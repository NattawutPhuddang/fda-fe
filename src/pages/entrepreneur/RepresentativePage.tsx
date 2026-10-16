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
  Trash2,
  ShieldAlert,
  RotateCcw,
  Clock,
  Ban,
  Check
} from 'lucide-react';

const AVAILABLE_SCOPES = [
  'ยื่นคำขอฉลากดิจิทัล (Submit Digital Label)',
  'แก้ไขข้อมูลฉลาก (Edit Digital Label)',
  'เผยแพร่ฉลากดิจิทัล (Publish Label)',
  'จัดการ QR Code (Manage & Download QR)'
];

export const RepresentativePage: React.FC = () => {
  const { success, warning, info } = useToast();
  const [representatives, setRepresentatives] = useState<Representative[]>(() => storage.getRepresentatives());
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'ยื่นคำขอฉลากดิจิทัล (Submit Digital Label)',
    'แก้ไขข้อมูลฉลาก (Edit Digital Label)',
    'เผยแพร่ฉลากดิจิทัล (Publish Label)',
    'จัดการ QR Code (Manage & Download QR)'
  ]);
  const [endDate, setEndDate] = useState('2027-12-31');

  const handleToggleScope = (scope: string) => {
    setSelectedScopes(prev => 
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  };

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
      scopeOfAuthority: selectedScopes,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: endDate || '2027-12-31',
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
      details: `เพิ่มตัวแทนผู้รับมอบอำนาจใหม่: ${fullName} (สิทธิ์: ${selectedScopes.join(', ')})`
    });

    setIsAddOpen(false);
    setFullName('');
    setIdCardNumber('');
    setEmail('');
    setPhoneNumber('');
    success('เพิ่มตัวแทนผู้รับมอบอำนาจและตรวจสอบฐานข้อมูล DBD เรียบร้อยแล้ว');
  };

  const handleSetStatus = (id: string, status: 'ACTIVE' | 'EXPIRED' | 'REVOKED') => {
    const today = new Date().toISOString().slice(0, 10);
    const updated = representatives.map(r => {
      if (r.id !== id) return r;
      let newEndDate = r.endDate;
      if (status === 'EXPIRED') {
        newEndDate = '2025-12-31'; // In the past
      } else if (status === 'ACTIVE' && r.endDate < today) {
        newEndDate = '2027-12-31'; // Extend
      }
      return { ...r, status, endDate: newEndDate };
    });

    storage.saveRepresentatives(updated);
    setRepresentatives(updated);

    const actionText = status === 'ACTIVE' 
      ? 'เปิดใช้งานสิทธิ์มอบอำนาจอีกครั้ง' 
      : status === 'REVOKED' 
      ? 'เพิกถอนหนังสือมอบอำนาจ' 
      : 'จำลองสิทธิ์หมดอายุ (Expired)';

    success(`${actionText} สำเร็จ (ระบบคำนวณและบังคับใช้สิทธิ์ทางกฎหมายทันที)`);
  };

  const handleToggleRepScope = (repId: string, scopeName: string) => {
    const updated = representatives.map(r => {
      if (r.id !== repId) return r;
      const has = r.scopeOfAuthority.includes(scopeName);
      const nextScopes = has ? r.scopeOfAuthority.filter(s => s !== scopeName) : [...r.scopeOfAuthority, scopeName];
      return { ...r, scopeOfAuthority: nextScopes };
    });
    storage.saveRepresentatives(updated);
    setRepresentatives(updated);
    info('อัปเดตขอบเขตอำนาจหน้าที่ของตัวแทนเรียบร้อยแล้ว');
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">ตัวแทนผู้รับมอบอำนาจ (Authorized Representatives)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            จัดการหนังสือมอบอำนาจอิเล็กทรอนิกส์ ตรวจสอบสถานะการบังคับใช้ และควบคุมสิทธิ์ดำเนินการในระบบฉลากดิจิทัล
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

      {/* DBD Integration & Legal Enforcement Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 text-xs flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed space-y-1">
          <strong className="text-blue-950 font-bold block">
            การควบคุมสิทธิ์ตามกฎหมายและเชื่อมโยง DBD (Legal Authority Control):
          </strong>
          <p className="text-slate-700">
            ระบบตรวจสอบความถูกต้องของหนังสือมอบอำนาจอิเล็กทรอนิกส์ วันหมดอายุ และการเพิกถอนสิทธิ์ หากตัวแทนมีสถานะ <span className="font-bold text-rose-700">REVOKED</span> หรือ <span className="font-bold text-amber-700">EXPIRED</span> ระบบจะบล็อกการยื่นคำขอฉลาก การแก้ไขข้อมูล และการเผยแพร่ฉลากโดยอัตโนมัติ
          </p>
        </div>
      </div>

      {/* List of Representatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {representatives.map(rep => {
          const isExpired = rep.status === 'EXPIRED' || (rep.endDate && rep.endDate < todayStr);
          const isRevoked = rep.status === 'REVOKED';
          const isActive = rep.status === 'ACTIVE' && !isExpired;

          return (
            <div
              key={rep.id}
              className={`bg-white rounded-2xl border p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between ${
                isRevoked
                  ? 'border-red-300 bg-red-50/20'
                  : isExpired
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-sm">
                      {rep.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{rep.fullName}</h3>
                      <span className="font-mono text-slate-400 text-[11px]">{rep.idCardNumber}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : isRevoked
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {isActive ? 'มีผลบังคับใช้ (ACTIVE)' : isRevoked ? 'ถูกเพิกถอนสิทธิ์ (REVOKED)' : 'หมดอายุ (EXPIRED)'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
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
                    <span>
                      ระยะเวลามอบอำนาจ: <strong>{rep.startDate}</strong> ถึง <strong>{rep.endDate}</strong>
                    </span>
                  </div>
                </div>

                {/* Scope of Authority with Clickable Toggles */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-800 block mb-2">
                    ขอบเขตอำนาจที่ได้รับอนุญาต (คลิกเพื่อเปิด/ปิดสิทธิ์ทดสอบ):
                  </span>
                  <div className="space-y-1.5">
                    {AVAILABLE_SCOPES.map(sc => {
                      const has = rep.scopeOfAuthority.some(s => s.toLowerCase().includes(sc.split(' ')[0].toLowerCase()));
                      return (
                        <button
                          key={sc}
                          type="button"
                          onClick={() => handleToggleRepScope(rep.id, sc)}
                          className={`w-full text-left p-2 rounded-xl border text-xs flex items-center justify-between transition ${
                            has 
                              ? 'bg-blue-50 border-blue-200 text-blue-950 font-semibold' 
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <span className="text-[11px]">{sc}</span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            has ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {has ? <Check className="w-2.5 h-2.5" /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Status Simulation Controller Toolbar */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> เชื่อมโยง e-Certificate DBD
                </span>

                <div className="flex items-center gap-1.5">
                  {isActive ? (
                    <>
                      <button
                        onClick={() => handleSetStatus(rep.id, 'REVOKED')}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition flex items-center gap-1"
                        title="ทดสอบจำลองเพิกถอนสิทธิ์"
                      >
                        <Ban className="w-3 h-3" />
                        <span>เพิกถอนสิทธิ์</span>
                      </button>
                      <button
                        onClick={() => handleSetStatus(rep.id, 'EXPIRED')}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium transition flex items-center gap-1"
                        title="ทดสอบจำลองให้สิทธิ์หมดอายุ"
                      >
                        <Clock className="w-3 h-3" />
                        <span>ทำให้หมดอายุ</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleSetStatus(rep.id, 'ACTIVE')}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium shadow-xs transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>เปิดใช้งานสิทธิ์อีกครั้ง</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
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
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
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
            <label className="font-semibold text-slate-700 block mb-1">
              วันหมดอายุหนังสือมอบอำนาจ (*):
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">
              ขอบเขตอำนาจหน้าที่ที่มอบหมาย (*):
            </label>
            <div className="space-y-1.5">
              {AVAILABLE_SCOPES.map(sc => (
                <label key={sc} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(sc)}
                    onChange={() => handleToggleScope(sc)}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                  <span className="text-slate-800 text-xs">{sc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-semibold shadow-xs"
            >
              บันทึกตัวแทนและตรวจสอบ DBD
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
