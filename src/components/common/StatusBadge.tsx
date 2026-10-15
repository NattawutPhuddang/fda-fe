import React from 'react';
import { LabelStatus, RegistrationStatus } from '../../services/types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldAlert, FileEdit, Eye } from 'lucide-react';

interface StatusBadgeProps {
  status: LabelStatus | RegistrationStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let label = status;
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon = <Clock className="w-3.5 h-3.5 text-slate-500" />;

  switch (status) {
    case 'published':
      label = 'เผยแพร่สู่สาธารณะแล้ว';
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />;
      break;
    case 'approved':
      label = 'ผ่านการอนุมัติ (รอเผยแพร่)';
      bg = 'bg-slate-100 text-slate-800 border-slate-300';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />;
      break;
    case 'pending_review':
      label = 'ยื่นคำขอแล้ว (รอรับเรื่อง)';
      bg = 'bg-slate-100 text-slate-700 border-slate-200';
      icon = <Clock className="w-3.5 h-3.5 text-slate-500" />;
      break;
    case 'in_review':
      label = 'อยู่ระหว่างตรวจสอบ';
      bg = 'bg-slate-100 text-slate-800 border-slate-300';
      icon = <Eye className="w-3.5 h-3.5 text-slate-600" />;
      break;
    case 'revision_required':
      label = 'ส่งกลับแก้ไข';
      bg = 'bg-amber-50 text-amber-900 border-amber-300';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />;
      break;
    case 'draft':
      label = 'แบบร่าง (Draft)';
      bg = 'bg-slate-100 text-slate-600 border-slate-200';
      icon = <FileEdit className="w-3.5 h-3.5 text-slate-400" />;
      break;
    case 'suspended':
      label = 'ถูกสั่งระงับชั่วคราว';
      bg = 'bg-rose-50 text-rose-800 border-rose-300';
      icon = <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />;
      break;
    case 'rejected':
      label = 'ไม่อนุมัติ';
      bg = 'bg-slate-100 text-slate-700 border-slate-300';
      icon = <XCircle className="w-3.5 h-3.5 text-slate-500" />;
      break;
    case 'active':
      label = 'ทะเบียนมีผลบังคับใช้';
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />;
      break;
    case 'expired':
      label = 'ทะเบียนหมดอายุ';
      bg = 'bg-slate-100 text-slate-600 border-slate-200';
      icon = <XCircle className="w-3.5 h-3.5 text-slate-400" />;
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
    lg: 'text-xs px-3 py-1 gap-1.5 font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center rounded-md border ${bg} ${sizeClasses}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
};
