import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((message: string, title = 'สำเร็จ') => showToast('success', message, title), [showToast]);
  const error = useCallback((message: string, title = 'ข้อผิดพลาด') => showToast('error', message, title), [showToast]);
  const warning = useCallback((message: string, title = 'แจ้งเตือน') => showToast('warning', message, title), [showToast]);
  const info = useCallback((message: string, title = 'ข้อมูล') => showToast('info', message, title), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast container floating on top right */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map(toast => {
          let bg = 'bg-white border-slate-200 text-slate-800';
          let icon = <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />;

          if (toast.type === 'success') {
            bg = 'bg-white border-slate-200 text-slate-800 shadow-lg';
            icon = <CheckCircle2 className="w-5 h-5 text-[#002B49] flex-shrink-0" />;
          } else if (toast.type === 'error') {
            bg = 'bg-white border-rose-200 text-slate-800 shadow-lg';
            icon = <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
          } else if (toast.type === 'warning') {
            bg = 'bg-white border-slate-200 text-slate-800 shadow-lg';
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start gap-3 transition-all duration-300 transform translate-y-0 ${bg}`}
            >
              {icon}
              <div className="flex-1 text-sm">
                {toast.title && <p className="font-semibold">{toast.title}</p>}
                <p className="mt-0.5 leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
