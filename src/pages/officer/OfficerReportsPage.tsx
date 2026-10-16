import React, { useState, useMemo } from 'react';
import { storage } from '../../services/storage';
import { exportToCSV, exportToExcel } from '../../services/exportService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  BarChart2, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const OfficerReportsPage: React.FC = () => {
  const { role } = useAuth();
  const { success } = useToast();
  const products = storage.getProducts();
  const labels = storage.getLabels();

  const [reportType, setReportType] = useState<'status' | 'category' | 'turnaround'>('status');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Prepared Report Rows
  const reportRows = useMemo(() => {
    return products.map(prod => {
      const lbl = storage.getLabelByProductId(prod.id);
      return {
        'เลขทะเบียน/สารบบ': prod.regNumber,
        'ชื่อผลิตภัณฑ์ (ไทย)': prod.productNameTh,
        'หมวดหมู่': prod.categoryNameTh,
        'ผู้ประกอบการ': prod.entrepreneurName,
        'สถานะคำขอฉลาก': lbl?.status || 'draft',
        'เจ้าหน้าที่ผู้รับผิดชอบ': lbl?.currentOfficerName || 'ยังไม่มอบหมาย',
        'ยื่นคำขอเมื่อ': lbl?.submittedAt ? new Date(lbl.submittedAt).toLocaleDateString('th-TH') : '-',
        'อนุมัติเมื่อ': lbl?.approvedAt ? new Date(lbl.approvedAt).toLocaleDateString('th-TH') : '-',
        'เผยแพร่เมื่อ': lbl?.publishedAt ? new Date(lbl.publishedAt).toLocaleDateString('th-TH') : '-',
        'ยอดการสแกนสะสม': lbl?.scanCount || 0
      };
    });
  }, [products, labels]);

  const handleExportCSV = () => {
    exportToCSV(reportRows, `FDA-RegulatoryReport-${reportType}-${new Date().toISOString().slice(0, 10)}`);
    success('ส่งออกรายงานทางการเป็นไฟล์ CSV สำเร็จ');
  };

  const handleExportExcel = () => {
    exportToExcel(reportRows, `FDA-RegulatoryReport-${reportType}-${new Date().toISOString().slice(0, 10)}`, 'RegulatoryReport');
    success('ส่งออกรายงานทางการเป็นไฟล์ Excel (.xlsx) สำเร็จ');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {role === 'auditor' ? 'รายงานตรวจสอบและสถิติข้อมูล อย.' : 'รายงานสรุปผลการดำเนินงานและสถิติ อย.'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {role === 'auditor'
              ? 'ศูนย์รายงานข้อมูลคำขอและประวัติฉลากดิจิทัลสำหรับการตรวจสอบและส่งออกข้อมูล'
              : 'ศูนย์รายงานและวิเคราะห์ข้อมูลคำขอฉลากดิจิทัลเพื่อการกำกับดูแลเชิงรุกและการส่งออกข้อมูล'}
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

      {/* Report Types Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-2">
        <button
          onClick={() => setReportType('status')}
          className={`py-2.5 px-4 border-b-2 transition ${
            reportType === 'status'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          รายงานจำแนกตามสถานะคำขอ
        </button>
        <button
          onClick={() => setReportType('category')}
          className={`py-2.5 px-4 border-b-2 transition ${
            reportType === 'category'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          รายงานจำแนกตามหมวดหมู่ผลิตภัณฑ์
        </button>
        <button
          onClick={() => setReportType('turnaround')}
          className={`py-2.5 px-4 border-b-2 transition ${
            reportType === 'turnaround'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          รายงานระยะเวลาการพิจารณา (Turnaround Time)
        </button>
      </div>

      {/* Report Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>ตัวอย่างข้อมูลรายงานก่อนส่งออก (Preview: {reportRows.length} แถว)</span>
          <span className="text-[11px] text-slate-400">* ข้อมูลอ้างอิงฐานข้อมูลระบบฉลากดิจิทัล อย.</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-4">เลขทะเบียน</th>
                <th className="py-3 px-4">ชื่อผลิตภัณฑ์</th>
                <th className="py-3 px-4">หมวดหมู่</th>
                <th className="py-3 px-4">ผู้ประกอบการ</th>
                <th className="py-3 px-4">สถานะคำขอ</th>
                <th className="py-3 px-4">เจ้าหน้าที่</th>
                <th className="py-3 px-4">ยอดสแกน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reportRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-semibold text-blue-900">{row['เลขทะเบียน/สารบบ']}</td>
                  <td className="py-3 px-4 max-w-xs truncate font-medium">{row['ชื่อผลิตภัณฑ์ (ไทย)']}</td>
                  <td className="py-3 px-4">{row['หมวดหมู่']}</td>
                  <td className="py-3 px-4 max-w-xs truncate">{row['ผู้ประกอบการ']}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={row['สถานะคำขอฉลาก']} size="sm" />
                  </td>
                  <td className="py-3 px-4">{row['เจ้าหน้าที่ผู้รับผิดชอบ']}</td>
                  <td className="py-3 px-4 font-mono font-semibold">{row['ยอดการสแกนสะสม'].toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
