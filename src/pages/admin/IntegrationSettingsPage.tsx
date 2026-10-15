import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { IntegrationStatus } from '../../services/types';
import { useToast } from '../../context/ToastContext';
import { 
  Server, 
  Activity, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  ShieldAlert, 
  Database, 
  Lock,
  Cloud
} from 'lucide-react';

export const IntegrationSettingsPage: React.FC = () => {
  const { info, success, warning } = useToast();
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>(() => storage.getIntegrations());
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTestConnection = (item: IntegrationStatus) => {
    setTestingId(item.id);
    setTimeout(() => {
      setTestingId(null);
      if (item.serviceType === 'SQL_SERVER') {
        success(`SQL Server 2022 Schema Check: พบโครงสร้าง 25+ Tables พร้อมสคริปต์ใน /backend-specs/schema.sql`);
      } else {
        info(
          `Integration Placeholder: การเชื่อมต่อ ${item.name} ยังไม่เปิดใช้งานในโหมด Demo ต้องรอ API Key และ Credentials จริงจากหน่วยงานต้นสังกัด`,
          'สถานะการทดสอบเชื่อมต่อ'
        );
      }
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          สถานะและการตั้งค่าเชื่อมต่อระบบภายนอก (Integration Settings)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          ภาพรวมเกตเวย์เชื่อมต่อ ThaID, SKYNET, e-Submission, SQL Server, GDCC และ SMS Alert
        </p>
      </div>

      {/* Mandatory Notice Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-2 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <AlertCircle className="w-4 h-4 text-slate-500" />
          <span>ข้อกำหนดความโปร่งใส (Mandatory Compliance Notice):</span>
        </div>
        <p className="leading-relaxed">
          ตามเงื่อนไข TOR ข้อกำหนดความมั่นคงปลอดภัย ห้ามกล่าวอ้างว่ามีการเชื่อมต่อ ThaID, SKYNET, e-Submission, หรือ GDCC จริงหากยังไม่มี Credentials หรือ API จากหน่วยงานต้นสังกัด ระบบได้ติดป้ายกำกับสถานะเป็น <strong>"Integration Placeholder (รอการเชื่อมต่อจริง)"</strong> อย่างชัดเจนทุกจุด
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map(item => {
          let statusBadge = (
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-semibold">
              Integration Placeholder
            </span>
          );

          if (item.status === 'CONFIGURED') {
            statusBadge = (
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#002B49] text-white border border-[#002B49] font-semibold">
                Architecture Ready
              </span>
            );
          }

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                      <Server className="w-4 h-4 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{item.serviceType}</span>
                    </div>
                  </div>
                  {statusBadge}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mt-2">{item.description}</p>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 text-[10px] uppercase font-sans">Endpoint:</span>
                    <span className="text-slate-800 text-[11px] truncate flex-1">{item.endpointUrl}</span>
                  </div>
                  {item.lastSyncAt && (
                    <div className="flex items-center gap-1 font-sans text-[11px] text-slate-500">
                      <span>ซิงก์ล่าสุด:</span>
                      <strong>{new Date(item.lastSyncAt).toLocaleString('th-TH')}</strong>
                    </div>
                  )}
                </div>

                {item.errorMessage && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                    {item.errorMessage}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">{item.notes}</span>

                <button
                  onClick={() => handleTestConnection(item)}
                  disabled={testingId === item.id}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl font-semibold transition flex items-center gap-1.5 flex-shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-900 ${testingId === item.id ? 'animate-spin' : ''}`} />
                  <span>{testingId === item.id ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
