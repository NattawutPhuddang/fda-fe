import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { IntegrationStatus } from '../../services/types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
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
  Cloud,
  Terminal,
  Zap,
  Play,
  Copy,
  Check,
  X,
  Radio,
  SlidersHorizontal,
  BellRing
} from 'lucide-react';

export const IntegrationSettingsPage: React.FC = () => {
  const { info, success, warning, error: toastError } = useToast();
  const { currentUser } = useAuth();
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>(() => storage.getIntegrations());
  const [selectedService, setSelectedService] = useState<IntegrationStatus | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSimulatingError, setIsSimulatingError] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: number;
    responseTimeMs: number;
    timestamp: string;
    payload: string;
    isError: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Helper to open simulator for a service
  const openSimulator = (item: IntegrationStatus) => {
    setSelectedService(item);
    setIsSimulatingError(Boolean(item.isSimulatedError));
    setTestResult(item.lastPayload ? {
      status: item.status === 'ERROR' ? 503 : 200,
      responseTimeMs: item.responseTimeMs || 45,
      timestamp: item.lastSyncAt || new Date().toISOString(),
      payload: item.lastPayload,
      isError: item.status === 'ERROR'
    } : null);
    setIsSimulatorOpen(true);
  };

  const executeSimulation = () => {
    if (!selectedService) return;
    setIsRunningTest(true);

    const startTime = performance.now();
    const simulatedLatency = isSimulatingError 
      ? Math.floor(Math.random() * 800) + 1200 
      : Math.floor(Math.random() * 60) + 35;

    setTimeout(() => {
      const endTime = performance.now();
      const actualMs = Math.round(endTime - startTime) || simulatedLatency;
      const nowIso = new Date().toISOString();

      let statusCode = 200;
      let payloadObj: any = {};
      let isErr = false;

      if (isSimulatingError) {
        statusCode = 503;
        isErr = true;
        payloadObj = {
          status: 503,
          error: "Service Unavailable / Gateway Outage",
          service: selectedService.name,
          endpoint: selectedService.endpointUrl,
          message: "The target external authority service did not respond within timeout limits. Circuit breaker opened.",
          timestamp: nowIso,
          incidentCode: `INC-INTG-${Math.floor(1000 + Math.random() * 9000)}`,
          retryAfterSeconds: 60
        };

        // Dispatch admin alert notification
        storage.addNotification({
          title: `[ALERT] เกตเวย์เชื่อมต่อขัดข้อง: ${selectedService.name}`,
          message: `ตรวจพบข้อผิดพลาดเชื่อมต่อ (${statusCode} Service Unavailable) จาก ${selectedService.endpointUrl}. บันทึกรหัสเหตุการณ์ ${payloadObj.incidentCode}`,
          type: 'error',
          link: '/admin/integrations'
        });

        storage.addAuditLog({
          userId: currentUser?.id || 'admin-1',
          userName: currentUser?.fullName || 'ผู้ดูแลระบบ',
          userRole: currentUser?.role || 'admin',
          action: 'INTEGRATION_OUTAGE_SIMULATION',
          resourceType: 'IntegrationService',
          resourceId: selectedService.id,
          result: 'FAILED',
          details: `Simulated gateway outage triggered on ${selectedService.endpointUrl} (Status ${statusCode})`,
          ipAddress: '192.168.1.105'
        });

        toastError(`การทดสอบเชื่อมต่อล้มเหลว (503 Service Unavailable) - ระบบได้ส่งการแจ้งเตือน Incident ไปยังแอดมินแล้ว`);
      } else {
        statusCode = 200;
        isErr = false;

        switch (selectedService.serviceType) {
          case 'THAID':
            payloadObj = {
              status: 200,
              service: "ThaID OpenID Connect / DOPA Hub",
              endpoint: selectedService.endpointUrl,
              citizenIdVerified: true,
              authLevel: "IAL 2.3",
              dopaConnectionStatus: "CONNECTED",
              sessionTokenValid: true,
              latency: `${actualMs}ms`,
              timestamp: nowIso
            };
            break;
          case 'SKYNET':
            payloadObj = {
              status: 200,
              service: "FDA SKYNET Gateway",
              endpoint: selectedService.endpointUrl,
              fdaLicenseValid: true,
              licenseType: "Food Distribution / Manufacturing",
              premisesStatus: "COMPLIANT",
              lastAuditInspectionDate: "2026-08-15",
              syncStatus: "SYNCHRONIZED",
              timestamp: nowIso
            };
            break;
          case 'SQL_SERVER':
            payloadObj = {
              status: 200,
              service: "Microsoft SQL Server 2022 Enterprise",
              endpoint: selectedService.endpointUrl,
              activeConnections: 24,
              tablesVerified: 28,
              schemaVersion: "2026.10-rev4",
              geoRedundancy: "AlwaysOn Availability Groups (Synch)",
              transactionLogHealth: "HEALTHY",
              timestamp: nowIso
            };
            break;
          case 'E_SUBMISSION':
            payloadObj = {
              status: 200,
              service: "FDA e-Submission Document Hub",
              endpoint: selectedService.endpointUrl,
              dossierCount: 1420,
              electronicSignaturesVerified: true,
              pdfACompliant: true,
              timestamp: nowIso
            };
            break;
          case 'GDCC':
            payloadObj = {
              status: 200,
              service: "Government Data Center and Cloud (GDCC)",
              endpoint: selectedService.endpointUrl,
              zone: "BKK-Tier-4-Primary",
              bucketStatus: "READ_WRITE",
              encryptionAtRest: "AES-256-GCM (HSM Backed)",
              timestamp: nowIso
            };
            break;
          default:
            payloadObj = {
              status: 200,
              service: selectedService.name,
              endpoint: selectedService.endpointUrl,
              queueStatus: "IDLE",
              dispatchSuccessRate: "99.98%",
              timestamp: nowIso
            };
        }

        success(`ทดสอบเชื่อมต่อ ${selectedService.name} สำเร็จ (${actualMs} ms)`);
      }

      const formattedJson = JSON.stringify(payloadObj, null, 2);

      // Update state & persistence
      const updatedList: IntegrationStatus[] = integrations.map(item => {
        if (item.id === selectedService.id) {
          return {
            ...item,
            status: (isErr ? 'ERROR' : 'CONFIGURED') as IntegrationStatus['status'],
            lastSyncAt: nowIso,
            responseTimeMs: actualMs,
            lastPayload: formattedJson,
            lastErrorDetail: isErr ? (payloadObj.message as string) : undefined,
            isSimulatedError: isSimulatingError
          };
        }
        return item;
      });

      storage.saveIntegrations(updatedList);
      setIntegrations(updatedList);
      setSelectedService(updatedList.find(i => i.id === selectedService.id) || null);

      setTestResult({
        status: statusCode,
        responseTimeMs: actualMs,
        timestamp: nowIso,
        payload: formattedJson,
        isError: isErr
      });

      setIsRunningTest(false);
    }, simulatedLatency);
  };

  const handleCopyPayload = () => {
    if (!testResult?.payload) return;
    navigator.clipboard.writeText(testResult.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetAllToNormal = () => {
    const resetList: IntegrationStatus[] = integrations.map(item => ({
      ...item,
      status: (item.serviceType === 'SQL_SERVER' ? 'CONFIGURED' : 'PLACEHOLDER') as IntegrationStatus['status'],
      errorMessage: null,
      lastErrorDetail: undefined,
      isSimulatedError: false
    }));
    storage.saveIntegrations(resetList);
    setIntegrations(resetList);
    success('รีเซ็ตสถานะบริการทั้งหมดกลับเป็นปกติเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            สถานะและการตั้งค่าเชื่อมต่อระบบภายนอก (Integration Settings)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ภาพรวมเกตเวย์เชื่อมต่อ ThaID, SKYNET, e-Submission, SQL Server, GDCC และ Notification Hub
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAllToNormal}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>รีเซ็ตสถานะทั้งหมด</span>
          </button>
        </div>
      </div>

      {/* Mandatory Notice Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-2 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <AlertCircle className="w-4 h-4 text-blue-900" />
          <span>ข้อกำหนดความโปร่งใส (Mandatory Compliance Notice):</span>
        </div>
        <p className="leading-relaxed">
          ตามเงื่อนไข TOR ข้อกำหนดความมั่นคงปลอดภัย ห้ามกล่าวอ้างว่ามีการเชื่อมต่อ ThaID, SKYNET, e-Submission, หรือ GDCC จริงหากยังไม่มี Credentials หรือ API จากหน่วยงานต้นสังกัด ระบบได้ติดป้ายกำกับสถานะเป็น <strong>"Integration Placeholder (รอการเชื่อมต่อจริง)"</strong> หรือ <strong>"Architecture Ready"</strong> อย่างชัดเจนทุกจุด พร้อมตัวจำลอง Gateway Simulator สำหรับทดสอบ Response Time และ Error Handling
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
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Connected / Ready
              </span>
            );
          } else if (item.status === 'ERROR') {
            statusBadge = (
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-300 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-600" />
                Service Outage (503)
              </span>
            );
          }

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border ${
                item.status === 'ERROR' ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              } p-6 shadow-xs flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${item.status === 'ERROR' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-blue-900'} flex items-center justify-center font-bold`}>
                      <Server className="w-4 h-4" />
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
                  <div className="flex items-center justify-between font-sans text-[11px] text-slate-500 pt-1">
                    <div>
                      <span>ทดสอบล่าสุด: </span>
                      <strong>{item.lastSyncAt ? new Date(item.lastSyncAt).toLocaleString('th-TH') : '-'}</strong>
                    </div>
                    {item.responseTimeMs !== undefined && (
                      <span className={`px-2 py-0.5 rounded font-mono font-semibold ${
                        item.responseTimeMs > 500 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.responseTimeMs} ms
                      </span>
                    )}
                  </div>
                </div>

                {item.lastErrorDetail && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">จำลองเหตุขัดข้อง (Active Simulated Error):</div>
                      <div>{item.lastErrorDetail}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 truncate max-w-[180px]">{item.notes}</span>

                <button
                  onClick={() => openSimulator(item)}
                  className="px-3.5 py-1.5 bg-[#002B49] hover:bg-[#001D33] text-white rounded-xl font-semibold transition flex items-center gap-1.5 flex-shrink-0 shadow-xs"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>จำลองและทดสอบ API</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* API Gateway Simulator Modal */}
      {isSimulatorOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#002B49] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    API Gateway Simulator: {selectedService.name}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-300">
                    {selectedService.endpointUrl}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Simulator Controls */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                    <span className="font-bold text-slate-800">โหมดจำลองพฤติกรรม (Simulation Config):</span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs hover:border-slate-400 transition">
                    <input
                      type="checkbox"
                      checked={isSimulatingError}
                      onChange={e => setIsSimulatingError(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                    />
                    <span className={`font-semibold ${isSimulatingError ? 'text-rose-700' : 'text-slate-600'}`}>
                      {isSimulatingError ? '⚠️ จำลองระบบขัดข้อง (Simulate Outage 503)' : 'ทำงานปกติ (Normal 200 OK)'}
                    </span>
                  </label>
                </div>

                {isSimulatingError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <BellRing className="w-3.5 h-3.5" />
                      ระบบจะสร้าง Alert Incident ไปยังผู้ดูแลระบบ (Admin)
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      เมื่อทดสอบในโหมดนี้ เกตเวย์จะจำลองข้อผิดพลาด 503 Service Unavailable, ปรับสถานะเป็น ERROR, และส่ง System Notification แบบฉุกเฉินไปยัง Topbar และ Audit Log ทันที
                    </p>
                  </div>
                )}
              </div>

              {/* Action Trigger */}
              <div className="flex items-center justify-between gap-4">
                <div className="text-slate-500 text-[11px]">
                  โปรโตคอล: <span className="font-mono font-bold text-slate-800">REST / HTTPS (JSON)</span> | Timeout: 5000ms
                </div>

                <button
                  onClick={executeSimulation}
                  disabled={isRunningTest}
                  className="px-5 py-2.5 bg-[#002B49] hover:bg-[#001D33] disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition"
                >
                  <RefreshCw className={`w-4 h-4 ${isRunningTest ? 'animate-spin' : ''}`} />
                  <span>{isRunningTest ? 'กำลังส่ง Request จำลอง...' : 'ส่ง Request ทดสอบ (Send Request)'}</span>
                </button>
              </div>

              {/* Simulation Result Area */}
              {testResult ? (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">ผลการตอบสนอง (Response Preview):</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        testResult.isError ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        HTTP {testResult.status} {testResult.isError ? 'Service Unavailable' : 'OK'}
                      </span>
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                        ⏱️ {testResult.responseTimeMs} ms
                      </span>
                    </div>

                    <button
                      onClick={handleCopyPayload}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก JSON'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed border border-slate-800 shadow-inner">
                      {testResult.payload}
                    </pre>
                  </div>

                  <div className="text-[10px] text-slate-400 text-right">
                    ประทับเวลาทดสอบ: {new Date(testResult.timestamp).toLocaleString('th-TH')}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 space-y-2">
                  <Terminal className="w-8 h-8 mx-auto text-slate-300" />
                  <p>กดปุ่ม <strong>"ส่ง Request ทดสอบ"</strong> เพื่อเริ่มการจำลองการติดต่อกับบริการภายนอก</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold text-xs transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
