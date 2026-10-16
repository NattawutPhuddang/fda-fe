import React from 'react';
import { DigitalLabel, Product, DigitalLabelVersionRecord } from '../../services/types';
import { Modal } from '../common/Modal';
import { GitCompare, ArrowRight, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface LabelDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLabel: DigitalLabel;
  previousVersion?: DigitalLabelVersionRecord | null;
  product?: Product;
}

export const LabelDiffModal: React.FC<LabelDiffModalProps> = ({
  isOpen,
  onClose,
  currentLabel,
  previousVersion,
  product
}) => {
  if (!isOpen) return null;

  const prev = previousVersion?.snapshot;

  const compareField = (label: string, oldVal?: string, newVal?: string) => {
    const isDifferent = (oldVal || '').trim() !== (newVal || '').trim();
    return (
      <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
        isDifferent ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">{label}</span>
          {isDifferent ? (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              มีการแก้ไข (Modified)
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">เหมือนเดิม (Unchanged)</span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-2 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-600">
            <span className="text-[10px] font-bold text-rose-700 block mb-0.5">เวอร์ชันก่อนหน้า (v{previousVersion?.version || 1}):</span>
            {oldVal || <span className="text-slate-400 italic">(ไม่มีข้อมูล)</span>}
          </div>
          <div className="p-2 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-900">
            <span className="text-[10px] font-bold text-emerald-700 block mb-0.5">เวอร์ชันปัจจุบัน (v{currentLabel.version}):</span>
            {newVal || <span className="text-slate-400 italic">(ไม่มีข้อมูล)</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="เปรียบเทียบข้อมูลฉลากดิจิทัล (Revision Diff Comparison)"
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Header Info Banner */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs flex items-start gap-3">
          <GitCompare className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-blue-950 text-sm">
              เปรียบเทียบฉลาก: {product?.productNameTh || currentLabel.titleTh}
            </h4>
            <p className="text-blue-800 text-[11px] mt-0.5">
              ระบบแสดงการเปรียบเทียบข้อมูลฉลากระหว่างเวอร์ชันก่อนหน้า (ก่อนส่งกลับแก้ไข) กับฉลากที่ผู้ประกอบการส่งแก้ไขกลับมา เพื่อให้เจ้าหน้าที่ตรวจสอบจุดเปลี่ยนแปลงได้อย่างสะดวกรวดเร็ว
            </p>
          </div>
        </div>

        {/* Change Reason Note */}
        {currentLabel.versionChangeReason && (
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-800">คำชี้แจงการแก้ไขจากผู้ประกอบการ:</span>
            <p className="text-slate-700 mt-1">{currentLabel.versionChangeReason}</p>
          </div>
        )}

        {/* Comparison Fields Container */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {compareField('ชื่อผลิตภัณฑ์ภาษาไทย (Title TH)', prev?.titleTh, currentLabel.titleTh)}
          {compareField('ชื่อผลิตภัณฑ์ภาษาอังกฤษ (Title EN)', prev?.titleEn, currentLabel.titleEn)}
          {compareField('รายละเอียดผลิตภัณฑ์ภาษาไทย', prev?.descriptionTh, currentLabel.descriptionTh)}
          {compareField('ข้อความคำเตือนทั่วไป (General Warning)', prev?.generalWarningTh, currentLabel.generalWarningTh)}
          {compareField('สภาวะการเก็บรักษา (Storage Warning)', prev?.storageWarningTh, currentLabel.storageWarningTh)}

          {/* Specifics comparison for drug if present */}
          {currentLabel.drugDetails && (
            <>
              {compareField('ข้อบ่งใช้ยา (Indications)', prev?.drugDetails?.indications, currentLabel.drugDetails.indications)}
              {compareField('ขนาดและวิธีใช้ยา (Dosage)', prev?.drugDetails?.dosageAndAdministration, currentLabel.drugDetails.dosageAndAdministration)}
              {compareField('ข้อห้ามใช้ (Contraindications)', prev?.drugDetails?.contraindications, currentLabel.drugDetails.contraindications)}
            </>
          )}

          {/* Food Details comparison */}
          {currentLabel.foodDetails && (
            <>
              {compareField('ส่วนประกอบสำคัญและร้อยละ', prev?.foodDetails?.ingredientsWithPercent, currentLabel.foodDetails.ingredientsWithPercent)}
              {compareField('ข้อมูลสำหรับผู้แพ้อาหาร (Allergen Info)', prev?.foodDetails?.allergenInfo, currentLabel.foodDetails.allergenInfo)}
            </>
          )}

          {/* Documents count check */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700">เอกสารแนบประกอบฉลาก</span>
              <span className="text-[10px] text-slate-500">
                เวอร์ชันก่อนหน้า: {prev?.documents?.length || 0} ไฟล์ | เวอร์ชันปัจจุบัน: {currentLabel.documents?.length || 0} ไฟล์
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="p-2 bg-white rounded border border-slate-200 text-[11px] space-y-1">
                <span className="font-semibold text-slate-600 block">เอกสารเดิม:</span>
                {(prev?.documents || []).map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{doc.name}</span>
                  </div>
                ))}
                {(!prev?.documents || prev.documents.length === 0) && (
                  <span className="text-slate-400 italic">ไม่มีเอกสาร</span>
                )}
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 text-[11px] space-y-1">
                <span className="font-semibold text-emerald-800 block">เอกสารปัจจุบัน:</span>
                {(currentLabel.documents || []).map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <FileText className="w-3.5 h-3.5 text-blue-700" />
                    <span className="truncate">{doc.name}</span>
                  </div>
                ))}
                {(!currentLabel.documents || currentLabel.documents.length === 0) && (
                  <span className="text-slate-400 italic">ไม่มีเอกสาร</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
          >
            ปิดหน้าต่างเปรียบเทียบ
          </button>
        </div>
      </div>
    </Modal>
  );
};
