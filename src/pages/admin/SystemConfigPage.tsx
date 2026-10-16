import React, { useState, useMemo } from 'react';
import { storage } from '../../services/storage';
import { SystemConfig, AuditLog } from '../../services/types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Settings, 
  Clock, 
  Globe, 
  ShieldCheck, 
  QrCode, 
  Save, 
  Sliders, 
  AlertTriangle,
  History,
  Lock,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const SystemConfigPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const { currentUser } = useAuth();
  const [config, setConfig] = useState<SystemConfig>(() => storage.getSystemConfig());
  const [originalConfig] = useState<SystemConfig>(() => storage.getSystemConfig());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storage.getAuditLogs());

  const isAdmin = currentUser?.role === 'admin';

  // Filter configuration change logs
  const configLogs = useMemo(() => {
    return auditLogs.filter(
      l => l.resourceType === 'SystemConfig' || l.action === 'CONFIG_UPDATE' || l.details.includes('การตั้งค่าระบบ')
    );
  }, [auditLogs]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      toastError('คุณไม่มีสิทธิ์ในการแก้ไขการตั้งค่าระบบ เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น');
      return;
    }

    // Detect differences
    const changes: string[] = [];
    if (config.idleTimeoutMinutes !== originalConfig.idleTimeoutMinutes) {
      changes.push(`Idle Timeout: ${originalConfig.idleTimeoutMinutes}m -> ${config.idleTimeoutMinutes}m`);
    }
    if (config.logRetentionDays !== originalConfig.logRetentionDays) {
      changes.push(`Log Retention: ${originalConfig.logRetentionDays}d -> ${config.logRetentionDays}d`);
    }
    if (config.qrCodeDefaultCorrectionLevel !== originalConfig.qrCodeDefaultCorrectionLevel) {
      changes.push(`QR Level: ${originalConfig.qrCodeDefaultCorrectionLevel} -> ${config.qrCodeDefaultCorrectionLevel}`);
    }
    if (config.defaultLanguage !== originalConfig.defaultLanguage) {
      changes.push(`Language: ${originalConfig.defaultLanguage} -> ${config.defaultLanguage}`);
    }
    if (config.requireOfficerChecklistComplete !== originalConfig.requireOfficerChecklistComplete) {
      changes.push(`Require Checklist: ${config.requireOfficerChecklistComplete ? 'ENABLED' : 'DISABLED'}`);
    }
    if (config.allowEntrepreneurSelfPublish !== originalConfig.allowEntrepreneurSelfPublish) {
      changes.push(`Self Publish: ${config.allowEntrepreneurSelfPublish ? 'ENABLED' : 'DISABLED'}`);
    }
    if (config.enableAuditLogging !== originalConfig.enableAuditLogging) {
      changes.push(`Audit Logging: ${config.enableAuditLogging ? 'ENABLED' : 'DISABLED'}`);
    }

    storage.saveSystemConfig(config);

    // Save Audit Log
    storage.addAuditLog({
      userId: currentUser?.id || 'admin-1',
      userName: currentUser?.fullName || 'ผู้ดูแลระบบ',
      userRole: currentUser?.role || 'admin',
      action: 'CONFIG_UPDATE',
      resourceType: 'SystemConfig',
      resourceId: 'global',
      result: 'SUCCESS',
      details: changes.length > 0 
        ? `ปรับเปลี่ยนการตั้งค่าระบบ: ${changes.join(', ')}`
        : 'บันทึกการตั้งค่าระบบ (ไม่มีการเปลี่ยนแปลงค่าพารามิเตอร์)',
      ipAddress: '192.168.1.10'
    });

    setAuditLogs(storage.getAuditLogs());
    success('บันทึกการตั้งค่าระบบและจัดเก็บประวัติ Audit Log เรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">การตั้งค่าระบบ (System Configuration)</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          กำหนดค่าพารามิเตอร์ด้านความปลอดภัย นโยบายการจัดเก็บ Log และกฎเกณฑ์ Workflow ของ อย.
        </p>
      </div>

      {/* RBAC Notice if not Admin */}
      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <Lock className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">โหมดดูข้อมูลเท่านั้น (Read-Only):</div>
            <p className="mt-0.5 text-amber-800">
              บทบาทปัจจุบันของคุณคือ <strong>{currentUser?.role || 'Guest'}</strong> เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถบันทึกหรือเปลี่ยนแปลงพารามิเตอร์ของระบบได้
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Security & Session Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-5 h-5 text-blue-900" />
            <h3 className="font-bold text-sm text-slate-800">ความปลอดภัยและอายุเซสชัน (Security & Session)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                ระยะเวลาตัดเซสชันเมื่อไม่มีการใช้งาน (Idle Timeout):
              </label>
              <select
                disabled={!isAdmin}
                value={config.idleTimeoutMinutes}
                onChange={e => setConfig({ ...config, idleTimeoutMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value={15}>15 นาที</option>
                <option value={30}>30 นาที (มาตรฐาน อย.)</option>
                <option value={60}>60 นาที</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                ระบบจะตรวจจับพฤติกรรมผ่าน SessionTimeoutEnforcer และบังคับ Logout ทันที
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                ระยะเวลาจัดเก็บประวัติ Audit Log (Retention Policy):
              </label>
              <select
                disabled={!isAdmin}
                value={config.logRetentionDays}
                onChange={e => setConfig({ ...config, logRetentionDays: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value={365}>1 ปี (365 วัน)</option>
                <option value={1095}>3 ปี (1,095 วัน)</option>
                <option value={3650}>10 ปี (ตามระเบียบสารบรรณราชการ)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                จัดเก็บแบบ Append-Only ห้ามลบก่อนกำหนดเวลาตามระเบียบ
              </span>
            </div>
          </div>
        </div>

        {/* QR Code & Publication Policy */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <QrCode className="w-5 h-5 text-blue-900" />
            <h3 className="font-bold text-sm text-slate-800">นโยบาย QR Code และการเผยแพร่ฉลาก</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                ระดับการกู้คืนข้อผิดพลาด QR Code (Error Correction Level):
              </label>
              <select
                disabled={!isAdmin}
                value={config.qrCodeDefaultCorrectionLevel}
                onChange={e => setConfig({ ...config, qrCodeDefaultCorrectionLevel: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="L">L - กู้คืนได้ 7%</option>
                <option value="M">M - กู้คืนได้ 15% (มาตรฐานพิมพ์กล่อง)</option>
                <option value="Q">Q - กู้คืนได้ 25%</option>
                <option value="H">H - กู้คืนได้ 30% (ความละเอียดสูงสุด)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                ภาษาเริ่มต้นของหน้าฉลากประชาชน:
              </label>
              <select
                disabled={!isAdmin}
                value={config.defaultLanguage}
                onChange={e => setConfig({ ...config, defaultLanguage: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="th">ภาษาไทย (TH)</option>
                <option value="en">English (EN)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                disabled={!isAdmin}
                type="checkbox"
                checked={config.requireOfficerChecklistComplete}
                onChange={e => setConfig({ ...config, requireOfficerChecklistComplete: e.target.checked })}
                className="rounded text-blue-900 focus:ring-blue-800 w-4 h-4 cursor-pointer disabled:opacity-50"
              />
              <span className="text-slate-800 font-medium">
                บังคับให้เจ้าหน้าที่ต้องตรวจ Checklist ผ่านครบทุกข้อก่อนกดอนุมัติ (Checklist Complete Guard)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                disabled={!isAdmin}
                type="checkbox"
                checked={config.allowEntrepreneurSelfPublish}
                onChange={e => setConfig({ ...config, allowEntrepreneurSelfPublish: e.target.checked })}
                className="rounded text-blue-900 focus:ring-blue-800 w-4 h-4 cursor-pointer disabled:opacity-50"
              />
              <span className="text-slate-800 font-medium">
                อนุญาตให้ผู้ประกอบการเป็นผู้กด "เผยแพร่ฉลาก (Publish)" เมื่อได้รับอนุมัติจาก อย. แล้ว
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                disabled={!isAdmin}
                type="checkbox"
                checked={config.enableAuditLogging}
                onChange={e => setConfig({ ...config, enableAuditLogging: e.target.checked })}
                className="rounded text-blue-900 focus:ring-blue-800 w-4 h-4 cursor-pointer disabled:opacity-50"
              />
              <span className="text-slate-800 font-medium">
                เปิดใช้งานการบันทึก Audit Logs ทุกเหตุการณ์สำคัญ (Always-On Security Logging)
              </span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!isAdmin}
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่าระบบ</span>
          </button>
        </div>
      </form>

      {/* Configuration Change Audit Trail Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-900" />
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                ประวัติการปรับเปลี่ยนการตั้งค่าระบบ (Configuration Change History)
              </h3>
              <p className="text-[11px] text-slate-400">
                เก็บบันทึก Audit Log แบบถาวรสำหรับการตรวจสอบย้อนหลัง (Compliance Trail)
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">
            {configLogs.length} รายการ
          </span>
        </div>

        {configLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">วัน-เวลา (Timestamp)</th>
                  <th className="py-2.5 px-3">ผู้ดำเนินการ</th>
                  <th className="py-2.5 px-3">รายละเอียดการแก้ไข</th>
                  <th className="py-2.5 px-3 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {configLogs.slice(0, 5).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('th-TH')}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="font-semibold text-slate-800">{log.userName}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">({log.userRole})</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-sans max-w-md">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            ยังไม่มีประวัติการแก้ไขค่าระบบเพิ่มเติม บันทึกแรกจะปรากฏหลังจากการบันทึกค่า
          </div>
        )}
      </div>
    </div>
  );
};
