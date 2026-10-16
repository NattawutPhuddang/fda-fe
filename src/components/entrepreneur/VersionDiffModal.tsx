import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { DigitalLabel, DigitalLabelVersionRecord } from '../../services/types';
import { GitCompare, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface VersionDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLabel: DigitalLabel;
  versions: DigitalLabelVersionRecord[];
}

export const VersionDiffModal: React.FC<VersionDiffModalProps> = ({
  isOpen,
  onClose,
  currentLabel,
  versions
}) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    versions[0]?.id || ''
  );

  const selectedRecord = versions.find(v => v.id === selectedVersionId);
  const oldLabel = selectedRecord?.snapshot || null;

  const compareField = (label: string, oldVal?: string, newVal?: string) => {
    const isDifferent = (oldVal || '').trim() !== (newVal || '').trim();

    return (
      <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
        isDifferent ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800">{label}</span>
          {isDifferent ? (
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              มีการแก้ไข
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">คงเดิม</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 block mb-1">
              เวอร์ชันเดิม (v{selectedRecord?.version ?? 'เก่า'}):
            </span>
            <p className="text-slate-700 font-mono text-[11px] whitespace-pre-wrap">
              {oldVal || <span className="text-slate-300 italic">(ไม่มีข้อมูล)</span>}
            </p>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-blue-600 block mb-1 font-semibold">
              ฉบับปัจจุบัน (v{currentLabel.version}):
            </span>
            <p className={`font-mono text-[11px] whitespace-pre-wrap ${
              isDifferent ? 'text-blue-900 font-medium' : 'text-slate-700'
            }`}>
              {newVal || <span className="text-slate-300 italic">(ไม่มีข้อมูล)</span>}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="เปรียบเทียบความแตกต่างระหว่างเวอร์ชัน (Version Comparison)"
      subtitle={`เปรียบเทียบฉลาก "${currentLabel.titleTh}"`}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Version Selector */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-blue-900" />
            <span className="font-semibold text-slate-700">เลือกเวอร์ชันในประวัติเพื่อเปรียบเทียบ:</span>
          </div>

          <select
            value={selectedVersionId}
            onChange={e => setSelectedVersionId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {versions.map(v => (
              <option key={v.id} value={v.id}>
                v{v.version}.0 ({v.status}) - {new Date(v.createdAt).toLocaleDateString('th-TH')}
              </option>
            ))}
          </select>
        </div>

        {/* Diff Content */}
        {oldLabel ? (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {compareField('ชื่อฉลากภาษาไทย (Title TH)', oldLabel.titleTh, currentLabel.titleTh)}
            {compareField('ชื่อฉลากภาษาอังกฤษ (Title EN)', oldLabel.titleEn, currentLabel.titleEn)}
            {compareField('คำบรรยายและสรรพคุณ (Description TH)', oldLabel.descriptionTh, currentLabel.descriptionTh)}
            {compareField('คำเตือนและข้อควรระวัง (General Warning TH)', oldLabel.generalWarningTh, currentLabel.generalWarningTh)}
            {compareField('วิธีเก็บรักษา (Storage Conditions)', oldLabel.storageWarningTh, currentLabel.storageWarningTh)}

            {/* Category details if present */}
            {currentLabel.drugDetails && (
              <>
                {compareField(
                  'ข้อบ่งใช้ยา (Indications)',
                  oldLabel.drugDetails?.indications,
                  currentLabel.drugDetails.indications
                )}
                {compareField(
                  'ขนาดและวิธีใช้ยา (Dosage)',
                  oldLabel.drugDetails?.dosageAndAdministration,
                  currentLabel.drugDetails.dosageAndAdministration
                )}
                {compareField(
                  'ข้อห้ามใช้ยา (Contraindications)',
                  oldLabel.drugDetails?.contraindications,
                  currentLabel.drugDetails.contraindications
                )}
              </>
            )}

            {currentLabel.cosmeticDetails && (
              <>
                {compareField(
                  'ส่วนประกอบเครื่องสำอาง (INCI Ingredients)',
                  oldLabel.cosmeticDetails?.ingredients.join(', '),
                  currentLabel.cosmeticDetails.ingredients.join(', ')
                )}
                {compareField(
                  'วิธีใช้เครื่องสำอาง (Usage)',
                  oldLabel.cosmeticDetails?.usageInstructions,
                  currentLabel.cosmeticDetails.usageInstructions
                )}
              </>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            <p>ไม่พบข้อมูลเวอร์ชันก่อนหน้าเพื่อเปรียบเทียบ</p>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </Modal>
  );
};
