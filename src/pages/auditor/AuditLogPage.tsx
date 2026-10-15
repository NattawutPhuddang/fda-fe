import React, { useState, useMemo } from 'react';
import { storage } from '../../services/storage';
import { AuditLog } from '../../services/types';
import { exportToCSV, exportToExcel } from '../../services/exportService';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { 
  FileSearch, 
  Download, 
  Search, 
  Filter, 
  ShieldCheck, 
  Calendar, 
  User, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Lock,
  FileSpreadsheet
} from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { success } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>(() => storage.getAuditLogs());
  const [query, setQuery] = useState('');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchResult = resultFilter === 'ALL' || l.result === resultFilter;
      const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
      const q = query.trim().toLowerCase();
      const matchQ = !q ||
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.correlationId.toLowerCase().includes(q);
      return matchResult && matchAction && matchQ;
    });
  }, [logs, query, resultFilter, actionFilter]);

  const handleExportCSV = () => {
    const exportRows = filteredLogs.map(l => ({
      'Log ID': l.id,
      'Timestamp (UTC)': l.timestamp,
      'ผู้ใช้งาน': l.userName,
      'บทบาท': l.userRole,
      'การดำเนินการ (Action)': l.action,
      'ประเภททรัพยากร': l.resourceType,
      'ผลลัพธ์': l.result,
      'IP Address': l.ipAddress,
      'Correlation ID': l.correlationId,
      'รายละเอียด': l.details
    }));
    exportToCSV(exportRows, `FDA-AuditLogs-${new Date().toISOString().slice(0, 10)}`);
    success('ส่งออกบันทึก Audit Logs เป็นไฟล์ CSV สำเร็จ');
  };

  const handleExportExcel = () => {
    const exportRows = filteredLogs.map(l => ({
      'Log ID': l.id,
      'Timestamp (UTC)': l.timestamp,
      'ผู้ใช้งาน': l.userName,
      'บทบาท': l.userRole,
      'การดำเนินการ (Action)': l.action,
      'ประเภททรัพยากร': l.resourceType,
      'ผลลัพธ์': l.result,
      'IP Address': l.ipAddress,
      'Correlation ID': l.correlationId,
      'รายละเอียด': l.details
    }));
    exportToExcel(exportRows, `FDA-AuditLogs-${new Date().toISOString().slice(0, 10)}`, 'AuditLogs');
    success('ส่งออกบันทึก Audit Logs เป็นไฟล์ Excel (.xlsx) สำเร็จ');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            บันทึกประวัติการใช้งานระบบ (Audit Log & Security)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ตรวจสอบการเข้าถึง การแก้ไขข้อมูล การอนุมัติ และเหตุการณ์ความปลอดภัยตามระเบียบสารบรรณและ พ.ร.บ. ไซเบอร์ฯ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>ส่งออก Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Immutability & Security Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-1.5 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
          <Lock className="w-4 h-4" />
          <span>มาตรการป้องกันการแก้ไขย้อนหลัง (Tamper-Resistant Audit Trail):</span>
        </div>
        <p className="leading-relaxed text-slate-300">
          บันทึก Audit Log ทุกรายการถูกออกแบบให้เป็นแบบ Append-Only (Write Once, Read Many) ห้ามมิให้ผู้ใช้งานทั่วไปรวมถึงผู้ดูแลระบบแก้ไขหรือลบประวัติย้อนหลัง พร้อมทั้งจัดเก็บ Correlation ID สำหรับตรวจสอบ Traceability กับ Target ASP.NET Core API
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ใช้, การดำเนินการ, รายละเอียด หรือ Correlation ID..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={resultFilter}
          onChange={e => setResultFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="ALL">ทุกผลลัพธ์ (All Results)</option>
          <option value="SUCCESS">สำเร็จ (SUCCESS)</option>
          <option value="WARNING">แจ้งเตือน (WARNING)</option>
          <option value="FAILED">ล้มเหลว (FAILED)</option>
        </select>

        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="ALL">ทุกประเภทเหตุการณ์ (All Actions)</option>
          <option value="USER_LOGIN">เข้าสู่ระบบ (USER_LOGIN)</option>
          <option value="USER_LOGOUT">ออกจากระบบ (USER_LOGOUT)</option>
          <option value="SUBMIT_LABEL_REQUEST">ยื่นคำขอฉลาก (SUBMIT)</option>
          <option value="APPROVE_LABEL">อนุมัติฉลาก (APPROVE)</option>
          <option value="SUSPEND_LABEL">ระงับฉลาก (SUSPEND)</option>
          <option value="UPDATE_LABEL">แก้ไขฉลาก (UPDATE)</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">วันเวลา (Timestamp)</th>
                <th className="py-3 px-4">ผู้ใช้งาน & บทบาท</th>
                <th className="py-3 px-4">การดำเนินการ (Action)</th>
                <th className="py-3 px-4">ทรัพยากร (Resource)</th>
                <th className="py-3 px-4">ผลลัพธ์</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-center">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map(log => {
                let badgeClass = 'bg-slate-100 text-slate-800 border-slate-200';
                if (log.result === 'FAILED') badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                else if (log.result === 'WARNING') badgeClass = 'bg-slate-200 text-slate-800 border-slate-300';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <span>{new Date(log.timestamp).toLocaleDateString('th-TH')}</span>
                      <span className="text-[10px] text-slate-400 block">{new Date(log.timestamp).toLocaleTimeString('th-TH')}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 block font-semibold">{log.userName}</strong>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{log.userRole}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono bg-slate-100 text-blue-950 px-2 py-0.5 rounded font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 font-medium block">{log.resourceType}</span>
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px] block">{log.resourceId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-semibold text-[10px] border ${badgeClass}`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {log.ipAddress}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition"
                        title="ดูรายละเอียด Log"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="รายละเอียดบันทึกเหตุการณ์ (Audit Log Entry)"
          subtitle={`Event ID: ${selectedLog.id}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Timestamp:</span>
                <strong className="text-slate-900 font-mono">{selectedLog.timestamp}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Correlation ID:</span>
                <span className="font-mono text-blue-900 font-bold">{selectedLog.correlationId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">ผู้ดำเนินการ:</span>
                <strong className="text-slate-900">{selectedLog.userName} ({selectedLog.userRole})</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">IP Address:</span>
                <span className="font-mono text-slate-700">{selectedLog.ipAddress}</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
              <span className="text-slate-400 block text-[11px]">รายละเอียดเหตุการณ์ (Event Details):</span>
              <p className="text-slate-800 leading-relaxed font-sans text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedLog.details}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition font-medium"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
