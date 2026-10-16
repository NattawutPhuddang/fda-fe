import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { Modal } from './Modal';
import { Clock, AlertTriangle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SessionTimeoutEnforcer: React.FC = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isTimedOut, setIsTimedOut] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // User activity listeners
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    // Interval checker every 10 seconds
    const interval = setInterval(() => {
      const config = storage.getSystemConfig();
      const timeoutMs = (config.idleTimeoutMinutes || 30) * 60 * 1000;
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed > timeoutMs && !isTimedOut) {
        setIsTimedOut(true);
        const user = currentUser;
        logout();

        if (user) {
          storage.addAuditLog({
            userId: user.id,
            userName: user.fullName,
            userRole: user.role,
            action: 'SESSION_TIMEOUT',
            resourceType: 'AUTH_SESSION',
            resourceId: `session-timeout-${Date.now()}`,
            result: 'WARNING',
            details: `เซสชันหมดอายุเนื่องจากไม่มีกิจกรรมต่อเนื่องเกิน ${config.idleTimeoutMinutes} นาที ระบบบังคับออกจากระบบอัตโนมัติ`
          });
        }
      }
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      clearInterval(interval);
    };
  }, [isAuthenticated, currentUser, isTimedOut, logout]);

  if (!isTimedOut) return null;

  const handleReturnToLogin = () => {
    setIsTimedOut(false);
    navigate('/login');
  };

  return (
    <Modal
      isOpen={isTimedOut}
      onClose={handleReturnToLogin}
      title="เซสชันหมดอายุเนื่องจากไม่มีการใช้งาน (Session Timeout)"
      maxWidth="md"
    >
      <div className="text-center space-y-4 py-2">
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
          <Clock className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">การเชื่อมต่อหมดเวลา (Idle Timeout)</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            ระบบความมั่นคงปลอดภัยสารสนเทศของ อย. กำหนดให้ตัดการเชื่อมต่ออัตโนมัติเมื่อไม่มีกิจกรรมในระบบตามเวลาที่กำหนด เพื่อปกป้องข้อมูลของท่าน
          </p>
        </div>

        <div className="pt-3">
          <button
            onClick={handleReturnToLogin}
            className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>เข้าสู่ระบบใหม่อีกครั้ง</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
