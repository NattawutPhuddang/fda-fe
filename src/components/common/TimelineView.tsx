import React from 'react';
import { 
  Send, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Globe, 
  ShieldAlert, 
  Clock, 
  FileEdit,
  Tag
} from 'lucide-react';
import { LabelTimelineEvent } from '../../services/types';
import { StatusBadge } from './StatusBadge';

interface TimelineViewProps {
  events: LabelTimelineEvent[];
  currentVersion?: number;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ events, currentVersion }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p>ยังไม่มีบันทึกประวัติการดำเนินงานสำหรับคำขอนี้</p>
      </div>
    );
  }

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'SUBMIT_REQUEST':
        return {
          icon: <Send className="w-4 h-4 text-blue-600" />,
          bgColor: 'bg-blue-50 border-blue-200',
          title: 'ยื่นคำขอฉลากดิจิทัล (Submitted)'
        };
      case 'CLAIM_REQUEST':
        return {
          icon: <UserCheck className="w-4 h-4 text-indigo-600" />,
          bgColor: 'bg-indigo-50 border-indigo-200',
          title: 'เจ้าหน้าที่ อย. รับเรื่องพิจารณา (Claimed)'
        };
      case 'REQUEST_REVISION':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          bgColor: 'bg-amber-50 border-amber-300',
          title: 'ส่งกลับแก้ไขคำขอ (Revision Required)'
        };
      case 'APPROVE':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          bgColor: 'bg-emerald-50 border-emerald-200',
          title: 'ผ่านการอนุมัติเนื้อหาฉลาก (Approved)'
        };
      case 'PUBLISH':
        return {
          icon: <Globe className="w-4 h-4 text-[#002B49]" />,
          bgColor: 'bg-sky-50 border-sky-300',
          title: 'เผยแพร่ฉลากสู่สาธารณะ (Published)'
        };
      case 'SUSPEND':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-red-600" />,
          bgColor: 'bg-red-50 border-red-300',
          title: 'คำสั่งระงับฉลากชั่วคราว (Suspended)'
        };
      default:
        return {
          icon: <FileEdit className="w-4 h-4 text-slate-600" />,
          bgColor: 'bg-slate-50 border-slate-200',
          title: 'บันทึกแก้ไขข้อมูลฉลาก (Updated)'
        };
    }
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {events.map((evt, idx) => {
        const config = getActionConfig(evt.action);
        const isCurrentVer = currentVersion ? evt.version === currentVersion : false;

        return (
          <div key={evt.id || idx} className="relative group">
            {/* Dot Icon */}
            <div
              className={`absolute -left-6 top-0 w-5.5 h-5.5 rounded-full border flex items-center justify-center bg-white shadow-xs ${config.bgColor}`}
            >
              {config.icon}
            </div>

            {/* Event Content Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{config.title}</span>
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                    v{evt.version}.0
                  </span>
                  {isCurrentVer && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-medium px-1.5 py-0.5 rounded">
                      เวอร์ชันปัจจุบัน
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{formatDateTime(evt.timestamp)}</span>
                </div>
              </div>

              {/* Actor & Role */}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-medium text-slate-800">{evt.actorName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {evt.actorRole === 'officer' ? 'เจ้าหน้าที่ อย.' : evt.actorRole === 'entrepreneur' ? 'ผู้ประกอบการ' : evt.actorRole}
                </span>
                <StatusBadge status={evt.status} size="sm" />
              </div>

              {/* Notes / Reason */}
              {evt.notes && (
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    evt.action === 'REQUEST_REVISION'
                      ? 'bg-amber-50/80 border border-amber-200 text-amber-950 font-medium'
                      : evt.action === 'SUSPEND'
                      ? 'bg-red-50/80 border border-red-200 text-red-950 font-medium'
                      : 'bg-slate-50 text-slate-700 border border-slate-100'
                  }`}
                >
                  {evt.action === 'REQUEST_REVISION' && (
                    <strong className="block text-amber-900 mb-0.5">ข้อสังเกตและประเด็นที่ส่งกลับ:</strong>
                  )}
                  {evt.notes}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
