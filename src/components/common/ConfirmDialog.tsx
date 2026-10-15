import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  variant = 'primary'
}) => {
  let icon = <AlertCircle className="w-6 h-6 text-blue-600" />;
  let btnClass = 'bg-blue-600 hover:bg-blue-700 text-white';

  if (variant === 'danger') {
    icon = <AlertTriangle className="w-6 h-6 text-rose-600" />;
    btnClass = 'bg-rose-600 hover:bg-rose-700 text-white';
  } else if (variant === 'warning') {
    icon = <AlertTriangle className="w-6 h-6 text-amber-600" />;
    btnClass = 'bg-amber-600 hover:bg-amber-700 text-white';
  } else if (variant === 'success') {
    icon = <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
    btnClass = 'bg-emerald-600 hover:bg-emerald-700 text-white';
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-slate-100 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-sm font-medium rounded-xl shadow-sm transition ${btnClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
