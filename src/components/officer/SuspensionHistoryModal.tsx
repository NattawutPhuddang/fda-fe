import React from 'react';
import { SuspensionRecord, Product, DigitalLabel } from '../../services/types';
import { storage } from '../../services/storage';
import { Modal } from '../common/Modal';
import { History, ShieldAlert, RotateCcw, Calendar, FileText, User } from 'lucide-react';

interface SuspensionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  label?: DigitalLabel;
}

export const SuspensionHistoryModal: React.FC<SuspensionHistoryModalProps> = ({
  isOpen,
  onClose,
  product,
  label
}) => {
  if (!isOpen) return null;

  const records = storage.getSuspensions().filter(
    s => s.productId === product.id || (label && s.labelId === label.id)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ประวัติคำสั่งระงับและการปลดล็อกฉลาก (Suspension History)"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Product Summary Header */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">{product.productNameTh}</span>
            <span className="font-mono text-[11px] text-blue-900 font-semibold">{product.regNumber}</span>
          </div>
          <p className="text-slate-500 text-[11px] mt-0.5">ผู้ประกอบการ: {product.entrepreneurName}</p>
        </div>

        {/* Records List */}
        {records.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
            <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">ไม่มีประวัติคำสั่งระงับฉลาก</p>
            <p className="text-[11px] text-slate-400 mt-0.5">ผลิตภัณฑ์นี้ยังไม่เคยมีคำสั่งระงับการเผยแพร่ฉลากตามมาตรา อย.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {records.map((rec, idx) => (
              <div
                key={rec.id || idx}
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  rec.action === 'SUSPEND'
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-emerald-50/50 border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {rec.action === 'SUSPEND' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>คำสั่งระงับฉลาก (Suspended)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>ยกเลิกคำสั่งระงับ (Unsuspend)</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(rec.timestamp).toLocaleString('th-TH')}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700 space-y-1">
                  <div>
                    <strong className="text-slate-800">เหตุผลคำสั่ง: </strong>
                    <span>{rec.reason}</span>
                  </div>
                  {rec.orderNumber && (
                    <div className="text-[11px] text-slate-600">
                      <strong>เลขที่คำสั่งอ้างอิง: </strong>
                      <span className="font-mono">{rec.orderNumber}</span>
                    </div>
                  )}
                  {rec.effectiveDate && (
                    <div className="text-[11px] text-slate-600">
                      <strong>วันที่มีผลบังคับใช้: </strong>
                      <span>{new Date(rec.effectiveDate).toLocaleDateString('th-TH')}</span>
                    </div>
                  )}
                  {rec.authorizedSignatory && (
                    <div className="text-[11px] text-slate-600">
                      <strong>ผู้มีอำนาจสั่งการ/ลงนาม: </strong>
                      <span>{rec.authorizedSignatory}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>เจ้าหน้าที่ผู้บันทึก: {rec.officerName}</span>
                  <span className="font-mono">Log ID: {rec.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
          >
            ปิด
          </button>
        </div>
      </div>
    </Modal>
  );
};
