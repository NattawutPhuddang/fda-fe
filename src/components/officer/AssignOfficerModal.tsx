import React, { useState } from 'react';
import { User, DigitalLabel } from '../../services/types';
import { storage } from '../../services/storage';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserCheck, ShieldAlert, ArrowRight, UserPlus } from 'lucide-react';

interface AssignOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  label: DigitalLabel;
  onSuccess: () => void;
}

export const AssignOfficerModal: React.FC<AssignOfficerModalProps> = ({
  isOpen,
  onClose,
  label,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { success, warning } = useToast();

  const officers = storage.getUsers().filter(
    u => u.role === 'officer' && u.isActive
  );

  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(label.currentOfficerId || '');
  const [assignNotes, setAssignNotes] = useState('');

  if (!isOpen) return null;

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const officer = officers.find(o => o.id === selectedOfficerId);
    if (!officer) {
      warning('กรุณาเลือกเจ้าหน้าที่ผู้รับผิดชอบ');
      return;
    }

    const isReassign = !!label.currentOfficerId && label.currentOfficerId !== officer.id;
    const isFirstClaim = !label.currentOfficerId;

    const updated: DigitalLabel = {
      ...label,
      currentOfficerId: officer.id,
      currentOfficerName: officer.fullName,
      status: label.status === 'pending_review' ? 'in_review' : label.status,
      claimedAt: label.claimedAt || new Date().toISOString(),
      claimedByName: officer.fullName,
      updatedAt: new Date().toISOString()
    };

    storage.saveLabel(updated, currentUser || undefined);

    // Add Timeline Event
    storage.addTimelineEvent({
      labelId: label.id,
      version: label.version,
      actorName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
      actorRole: currentUser?.role || 'officer',
      action: isFirstClaim ? 'CLAIM_REQUEST' : 'REASSIGN_OFFICER',
      status: updated.status,
      notes: isFirstClaim 
        ? `เจ้าหน้าที่รับเรื่องพิจารณา: ${officer.fullName}` 
        : `เปลี่ยนผู้รับผิดชอบเป็น: ${officer.fullName} (เหตุผล: ${assignNotes || 'ตามภาระงาน'})`
    });

    // Add Audit Log
    storage.addAuditLog({
      userId: currentUser?.id || 'officer',
      userName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
      userRole: currentUser?.role || 'officer',
      action: isFirstClaim ? 'CLAIM_REQUEST' : 'REASSIGN_OFFICER',
      resourceType: 'DIGITAL_LABEL',
      resourceId: label.id,
      result: 'SUCCESS',
      details: `${isFirstClaim ? 'มอบหมาย/รับเรื่อง' : 'เปลี่ยนผู้รับผิดชอบ'} ให้ ${officer.fullName} (${officer.department})`
    });

    // Add notification to assigned officer
    storage.addNotification({
      userId: officer.id,
      title: 'มีคำขอฉลากถูกมอบหมายให้ท่านพิจารณา',
      message: `คำขอเลขที่ ${label.id} (${label.titleTh}) ได้รับการมอบหมายให้ท่านเป็นผู้รับผิดชอบ`,
      type: 'info',
      link: `/officer/review/${label.id}`
    });

    success(`มอบหมายคำขอให้ "${officer.fullName}" เรียบร้อยแล้ว`);
    onSuccess();
    onClose();
  };

  const handleSelfClaim = () => {
    if (!currentUser) return;
    setSelectedOfficerId(currentUser.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="มอบหมาย / เปลี่ยนเจ้าหน้าที่ผู้รับผิดชอบคำขอ"
      maxWidth="lg"
    >
      <form onSubmit={handleAssign} className="space-y-4">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 block">คำขอฉลาก:</span>
          <p className="font-bold text-slate-800 text-sm mt-0.5">{label.titleTh}</p>
          <span className="text-[11px] font-mono text-slate-400">รหัสคำขอ: {label.id}</span>
          <div className="mt-2 text-slate-600">
            ผู้รับผิดชอบปัจจุบัน: <strong className="text-blue-900">{label.currentOfficerName || 'ยังไม่มีผู้รับเรื่อง'}</strong>
          </div>
        </div>

        {/* Self Claim Shortcut */}
        {currentUser && (currentUser.role.startsWith('officer') || currentUser.role === 'admin') && (
          <button
            type="button"
            onClick={handleSelfClaim}
            className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>รับเรื่องด้วยตนเอง ({currentUser.fullName})</span>
          </button>
        )}

        {/* Select Officer Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            เลือกเจ้าหน้าที่ผู้รับผิดชอบ:
          </label>
          <select
            value={selectedOfficerId}
            onChange={e => setSelectedOfficerId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          >
            <option value="">-- กรุณาเลือกเจ้าหน้าที่ --</option>
            {officers.map(off => (
              <option key={off.id} value={off.id}>
                {off.fullName} - {off.department} ({off.role})
              </option>
            ))}
          </select>
        </div>

        {/* Reason / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            บันทึกเหตุผลหรือคำสั่งมอบหมาย (ถ้ามี):
          </label>
          <textarea
            rows={2}
            value={assignNotes}
            onChange={e => setAssignNotes(e.target.value)}
            placeholder="เช่น มอบหมายตามความเชี่ยวชาญด้านอาหารเสริม, มอบหมายแทนเนื่องจากติดราชการ..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>ยืนยันการมอบหมาย</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
