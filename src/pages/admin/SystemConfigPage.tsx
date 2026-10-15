import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { SystemConfig } from '../../services/types';
import { useToast } from '../../context/ToastContext';
import { 
  Settings, 
  Clock, 
  Globe, 
  ShieldCheck, 
  QrCode, 
  Save, 
  Sliders, 
  AlertTriangle 
} from 'lucide-react';

export const SystemConfigPage: React.FC = () => {
  const { success } = useToast();
  const [config, setConfig] = useState<SystemConfig>(() => storage.getSystemConfig());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSystemConfig(config);
    success('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
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
                value={config.idleTimeoutMinutes}
                onChange={e => setConfig({ ...config, idleTimeoutMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value={15}>15 นาที</option>
                <option value={30}>30 นาที (มาตรฐาน อย.)</option>
                <option value={60}>60 นาที</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                ระยะเวลาจัดเก็บประวัติ Audit Log (Retention Policy):
              </label>
              <select
                value={config.logRetentionDays}
                onChange={e => setConfig({ ...config, logRetentionDays: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value={365}>1 ปี (365 วัน)</option>
                <option value={1095}>3 ปี (1,095 วัน)</option>
                <option value={3650}>10 ปี (ตามระเบียบสารบรรณราชการ)</option>
              </select>
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
                value={config.qrCodeDefaultCorrectionLevel}
                onChange={e => setConfig({ ...config, qrCodeDefaultCorrectionLevel: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                value={config.defaultLanguage}
                onChange={e => setConfig({ ...config, defaultLanguage: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="th">ภาษาไทย (TH)</option>
                <option value="en">English (EN)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.requireOfficerChecklistComplete}
                onChange={e => setConfig({ ...config, requireOfficerChecklistComplete: e.target.checked })}
                className="rounded text-blue-900 focus:ring-blue-800 w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-800 font-medium">
                บังคับให้เจ้าหน้าที่ต้องตรวจ Checklist ผ่านครบทุกข้อก่อนกดอนุมัติ (Checklist Complete Guard)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.allowEntrepreneurSelfPublish}
                onChange={e => setConfig({ ...config, allowEntrepreneurSelfPublish: e.target.checked })}
                className="rounded text-blue-900 focus:ring-blue-800 w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-800 font-medium">
                อนุญาตให้ผู้ประกอบการเป็นผู้กด "เผยแพร่ฉลาก (Publish)" เมื่อได้รับอนุมัติจาก อย. แล้ว
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableAuditLogging}
                onChange={e => setConfig({ ...config, enableAuditLogging: e.target.checked })}
                className="rounded text-blue-900 focus:ring-blue-800 w-4 h-4 cursor-pointer"
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
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่าระบบ</span>
          </button>
        </div>
      </form>
    </div>
  );
};
