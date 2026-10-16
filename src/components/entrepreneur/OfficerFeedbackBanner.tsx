import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, FileText, ArrowRight } from 'lucide-react';
import { ReviewChecklistItem } from '../../services/types';

interface OfficerFeedbackBannerProps {
  revisionNotes?: string;
  checklist?: ReviewChecklistItem[];
  officerName?: string;
  onFocusRevisionField?: () => void;
}

export const OfficerFeedbackBanner: React.FC<OfficerFeedbackBannerProps> = ({
  revisionNotes,
  checklist = [],
  officerName,
  onFocusRevisionField
}) => {
  if (!revisionNotes && checklist.length === 0) return null;

  const failedItems = checklist.filter(c => !c.passed);

  return (
    <div className="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-200/70 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-950">
              ข้อสังเกตและประเด็นที่ส่งกลับแก้ไขจากเจ้าหน้าที่ อย. (Revision Required)
            </h3>
            {officerName && (
              <p className="text-xs text-amber-800 mt-0.5">
                ผู้ตรวจพิจารณา: <strong>{officerName}</strong> (กองกำกับและตรวจสอบผลิตภัณฑ์ อย.)
              </p>
            )}
          </div>
        </div>

        {onFocusRevisionField && (
          <button
            type="button"
            onClick={onFocusRevisionField}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <span>ไปยังจุดที่ต้องแก้ไข</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Comment */}
      {revisionNotes && (
        <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200 text-xs leading-relaxed space-y-1">
          <span className="font-bold text-amber-900 block">ข้อความระบุจากเจ้าหน้าที่:</span>
          <p className="text-slate-800 font-medium">"{revisionNotes}"</p>
        </div>
      )}

      {/* Failed Checklist Items */}
      {failedItems.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-900 block">
            รายการตรวจสอบที่ไม่ผ่านเกณฑ์มาตรฐาน ({failedItems.length} รายการ):
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {failedItems.map(item => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-white/70 border border-amber-200 text-xs flex items-start gap-2"
              >
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">{item.title}</strong>
                  <span className="text-[11px] text-slate-600 block">{item.description}</span>
                  {item.notes && (
                    <span className="text-[11px] text-red-700 font-medium block mt-1">
                      หมายเหตุ: {item.notes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-[11px] text-amber-800 pt-1 border-t border-amber-200/80 flex items-center justify-between">
        <span>* กรุณาปรับปรุงข้อมูลตามประเด็นข้างต้น แล้วกดยืนยันส่งคำขอพิจารณาใหม่ในขั้นตอนที่ 4</span>
      </div>
    </div>
  );
};
