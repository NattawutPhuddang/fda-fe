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
  Clock,
  AlertTriangle,
  RotateCcw,
  Users,
  Building2,
  FileText
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const OfficerReportsPage: React.FC = () => {
  const { role } = useAuth();
  const { success } = useToast();
  const products = storage.getProducts();
  const labels = storage.getLabels();

  // Tab State: 4 reports
  const [reportType, setReportType] = useState<'pending_status' | 'turnaround' | 'revision' | 'officer_performance'>('pending_status');

  // Filter States
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [officerFilter, setOfficerFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const officers = useMemo(() => {
    return storage.getUsers().filter(u => u.role.startsWith('officer') || u.role === 'admin');
  }, []);

  // Filtered dataset
  const filteredProductsAndLabels = useMemo(() => {
    return products.filter(prod => {
      const lbl = storage.getLabelByProductId(prod.id);
      const matchCat = categoryFilter === 'ALL' || prod.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || (lbl?.status || 'draft') === statusFilter;

      let matchOfficer = true;
      if (officerFilter === 'UNASSIGNED') {
        matchOfficer = !lbl?.currentOfficerId;
      } else if (officerFilter !== 'ALL') {
        matchOfficer = lbl?.currentOfficerId === officerFilter;
      }

      const itemDate = lbl?.submittedAt ? lbl.submittedAt.slice(0, 10) : prod.approvedDate ? prod.approvedDate.slice(0, 10) : '';
      const matchStart = !startDate || (itemDate && itemDate >= startDate);
      const matchEnd = !endDate || (itemDate && itemDate <= endDate);

      const q = query.trim().toLowerCase();
      const matchQ = !q ||
        prod.productNameTh.toLowerCase().includes(q) ||
        prod.regNumber.toLowerCase().includes(q) ||
        prod.entrepreneurName.toLowerCase().includes(q) ||
        (lbl?.currentOfficerName && lbl.currentOfficerName.toLowerCase().includes(q));

      return matchCat && matchStatus && matchOfficer && matchStart && matchEnd && matchQ;
    });
  }, [products, labels, categoryFilter, statusFilter, officerFilter, startDate, endDate, query]);

  // Report 1: Pending & Status Rows
  const pendingStatusRows = useMemo(() => {
    return filteredProductsAndLabels.map(prod => {
      const lbl = storage.getLabelByProductId(prod.id);
      const dateStr = lbl?.submittedAt || lbl?.createdAt;
      const daysPending = dateStr ? Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)) : 0;

      return {
        'เลขทะเบียน/สารบบ': prod.regNumber,
        'ชื่อผลิตภัณฑ์ (ไทย)': prod.productNameTh,
        'หมวดหมู่': prod.categoryNameTh,
        'ผู้ประกอบการ': prod.entrepreneurName,
        'สถานะคำขอฉลาก': lbl?.status || 'draft',
        'เจ้าหน้าที่ผู้รับผิดชอบ': lbl?.currentOfficerName || 'ยังไม่มอบหมาย',
        'ยื่นคำขอเมื่อ': lbl?.submittedAt ? new Date(lbl.submittedAt).toLocaleDateString('th-TH') : '-',
        'ระยะเวลาค้าง (วัน)': daysPending,
        'สถานะ SLA': daysPending >= 7 ? 'เกินกำหนด SLA (>7 วัน)' : daysPending >= 3 ? 'ใกล้ครบกำหนด (3-7 วัน)' : 'ปกติ',
        'ยอดการสแกนสะสม': lbl?.scanCount || 0
      };
    });
  }, [filteredProductsAndLabels]);

  // Report 2: Turnaround Time Analysis Rows
  const turnaroundRows = useMemo(() => {
    return filteredProductsAndLabels
      .filter(p => {
        const lbl = storage.getLabelByProductId(p.id);
        return lbl?.submittedAt && lbl?.approvedAt;
      })
      .map(prod => {
        const lbl = storage.getLabelByProductId(prod.id)!;
        const subTime = new Date(lbl.submittedAt!).getTime();
        const appTime = new Date(lbl.approvedAt!).getTime();
        const daysTaken = Math.max(1, Math.round((appTime - subTime) / (1000 * 60 * 60 * 24)));

        return {
          'เลขทะเบียน/สารบบ': prod.regNumber,
          'ชื่อผลิตภัณฑ์': prod.productNameTh,
          'หมวดหมู่': prod.categoryNameTh,
          'ผู้ประกอบการ': prod.entrepreneurName,
          'วันที่ยื่นคำขอ': new Date(lbl.submittedAt!).toLocaleDateString('th-TH'),
          'วันที่อนุมัติ': new Date(lbl.approvedAt!).toLocaleDateString('th-TH'),
          'ระยะเวลาพิจารณาจนเสร็จสิ้น (วัน)': daysTaken,
          'เจ้าหน้าที่ผู้อนุมัติ': lbl.currentOfficerName || 'คณะกรรมการ อย.',
          'การประเมิน SLA': daysTaken <= 7 ? 'เป็นไปตามเป้าหมาย (≤ 7 วัน)' : 'เกินกำหนดเป้าหมาย (> 7 วัน)'
        };
      });
  }, [filteredProductsAndLabels]);

  // Report 3: Revision Required Statistics Rows
  const revisionRows = useMemo(() => {
    return filteredProductsAndLabels
      .filter(p => {
        const lbl = storage.getLabelByProductId(p.id);
        return lbl?.status === 'revision_required' || lbl?.versionChangeReason;
      })
      .map(prod => {
        const lbl = storage.getLabelByProductId(prod.id)!;
        return {
          'เลขทะเบียน/สารบบ': prod.regNumber,
          'ชื่อผลิตภัณฑ์': prod.productNameTh,
          'ผู้ประกอบการ': prod.entrepreneurName,
          'เวอร์ชันฉลาก': `v${lbl.version}`,
          'เจ้าหน้าที่ผู้สั่งแก้ไข': lbl.currentOfficerName || 'เจ้าหน้าที่ อย.',
          'ข้อสังเกตและเหตุผลที่ส่งกลับ': lbl.revisionNotes || 'แก้ไขข้อความคำเตือนและฉลาก',
          'เอกสารหลักฐาน อย. แนบ': lbl.revisionAttachmentName || 'ไม่มี',
          'สถานะปัจจุบัน': lbl.status
        };
      });
  }, [filteredProductsAndLabels]);

  // Report 4: Officer Performance Summary Rows
  const officerPerformanceRows = useMemo(() => {
    return officers.map(off => {
      const assigned = labels.filter(l => l.currentOfficerId === off.id);
      const approvedCount = assigned.filter(l => l.status === 'approved' || l.status === 'published').length;
      const revisionCount = assigned.filter(l => l.status === 'revision_required').length;
      const pendingCount = assigned.filter(l => l.status === 'in_review').length;

      return {
        'ชื่อ-นามสกุล เจ้าหน้าที่': off.fullName,
        'บทบาท': off.role,
        'สังกัดกลุ่มงาน': off.department || 'อย.',
        'งานที่รับผิดชอบทั้งหมด': assigned.length,
        'พิจารณาอนุมัติแล้ว': approvedCount,
        'ส่งกลับแก้ไข': revisionCount,
        'อยู่ระหว่างพิจารณาค้างอยู่': pendingCount,
        'อัตราการอนุมัติสำเร็จ (%)': assigned.length > 0 ? Math.round((approvedCount / assigned.length) * 100) : 0
      };
    });
  }, [officers, labels]);

  // Active dataset for export
  const currentActiveExportRows = useMemo<Record<string, any>[]>(() => {
    if (reportType === 'pending_status') return pendingStatusRows;
    if (reportType === 'turnaround') return turnaroundRows;
    if (reportType === 'revision') return revisionRows;
    return officerPerformanceRows;
  }, [reportType, pendingStatusRows, turnaroundRows, revisionRows, officerPerformanceRows]);

  const handleExportCSV = () => {
    exportToCSV(currentActiveExportRows, `FDA-Report-${reportType}-${new Date().toISOString().slice(0, 10)}`);
    success(`ส่งออกรายงาน "${reportType}" เป็นไฟล์ CSV สำเร็จ`);
  };

  const handleExportExcel = () => {
    exportToExcel(currentActiveExportRows, `FDA-Report-${reportType}-${new Date().toISOString().slice(0, 10)}`, 'FDA_Report');
    success(`ส่งออกรายงาน "${reportType}" เป็นไฟล์ Excel (.xlsx) สำเร็จ`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {role === 'auditor' ? 'รายงานตรวจสอบและสถิติข้อมูล อย. (Auditor Reports)' : 'รายงานสถิติและศูนย์ข้อมูล อย. (Regulatory Reports)'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            รายงานสถิติเชิงลึก 4 มิติ: คำขอค้างพิจารณา, ระยะเวลาเฉลี่ย (Turnaround Time), คำขอส่งกลับแก้ไข, และประสิทธิภาพรายเจ้าหน้าที่
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

      {/* Advanced Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผลิตภัณฑ์, เลขสารบบ, หรือชื่อผู้ประกอบการ..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">ทุกหมวดหมู่ผลิตภัณฑ์</option>
            <option value="food">อาหารและเครื่องดื่ม</option>
            <option value="drug">ยาแผนปัจจุบัน</option>
            <option value="cosmetic">เครื่องสำอาง</option>
            <option value="medical_device">เครื่องมือแพทย์</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">ทุกสถานะคำขอ</option>
            <option value="pending_review">ยื่นคำขอแล้ว (รอรับเรื่อง)</option>
            <option value="in_review">อยู่ระหว่างพิจารณา</option>
            <option value="revision_required">ส่งกลับแก้ไข</option>
            <option value="approved">ผ่านการอนุมัติ</option>
            <option value="published">เผยแพร่แล้ว</option>
            <option value="suspended">สั่งระงับชั่วคราว</option>
          </select>

          <select
            value={officerFilter}
            onChange={e => setOfficerFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">เจ้าหน้าที่ทั้งหมด</option>
            <option value="UNASSIGNED">ยังไม่มีผู้รับเรื่อง</option>
            {officers.map(o => (
              <option key={o.id} value={o.id}>
                {o.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>กรองช่วงวันที่:</span>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-2 py-1 rounded-lg border border-slate-300 bg-white"
          />
          <span>ถึง</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-2 py-1 rounded-lg border border-slate-300 bg-white"
          />
          {(startDate || endDate || categoryFilter !== 'ALL' || statusFilter !== 'ALL' || officerFilter !== 'ALL' || query) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
                setOfficerFilter('ALL');
                setQuery('');
              }}
              className="ml-auto text-blue-700 hover:underline font-semibold text-xs"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* Report Types 4 Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-2 overflow-x-auto">
        <button
          onClick={() => setReportType('pending_status')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            reportType === 'pending_status'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>1. คำขอค้างพิจารณาและสถานะ ({pendingStatusRows.length})</span>
        </button>

        <button
          onClick={() => setReportType('turnaround')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            reportType === 'turnaround'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>2. ระยะเวลาพิจารณาเฉลี่ย Turnaround Time ({turnaroundRows.length})</span>
        </button>

        <button
          onClick={() => setReportType('revision')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            reportType === 'revision'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>3. สถิติคำขอส่งกลับแก้ไข ({revisionRows.length})</span>
        </button>

        <button
          onClick={() => setReportType('officer_performance')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            reportType === 'officer_performance'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>4. สรุปผลงานรายเจ้าหน้าที่ ({officerPerformanceRows.length})</span>
        </button>
      </div>

      {/* Report Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>ตัวอย่างข้อมูลรายงานก่อนส่งออก (Preview: {currentActiveExportRows.length} รายการ)</span>
          <span className="text-[11px] text-slate-400">* ระบบฉลากดิจิทัล อย. ข้อมูลสดแบบ Real-Time</span>
        </div>

        <div className="overflow-x-auto">
          {/* TAB 1: PENDING & STATUS */}
          {reportType === 'pending_status' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">เลขทะเบียน</th>
                  <th className="py-3 px-4">ชื่อผลิตภัณฑ์</th>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4">ผู้ประกอบการ</th>
                  <th className="py-3 px-4">สถานะคำขอ</th>
                  <th className="py-3 px-4">ระยะเวลาค้าง</th>
                  <th className="py-3 px-4">เจ้าหน้าที่</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pendingStatusRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-900">{row['เลขทะเบียน/สารบบ']}</td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium">{row['ชื่อผลิตภัณฑ์ (ไทย)']}</td>
                    <td className="py-3 px-4">{row['หมวดหมู่']}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{row['ผู้ประกอบการ']}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={row['สถานะคำขอฉลาก']} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                        row['ระยะเวลาค้าง (วัน)'] >= 7 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : row['ระยะเวลาค้าง (วัน)'] >= 3 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {row['ระยะเวลาค้าง (วัน)']} วัน
                      </span>
                    </td>
                    <td className="py-3 px-4">{row['เจ้าหน้าที่ผู้รับผิดชอบ']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 2: TURNAROUND TIME */}
          {reportType === 'turnaround' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">เลขทะเบียน</th>
                  <th className="py-3 px-4">ชื่อผลิตภัณฑ์</th>
                  <th className="py-3 px-4">วันที่ยื่น</th>
                  <th className="py-3 px-4">วันที่อนุมัติ</th>
                  <th className="py-3 px-4">เวลาพิจารณา (วัน)</th>
                  <th className="py-3 px-4">การประเมิน SLA</th>
                  <th className="py-3 px-4">ผู้อนุมัติ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {turnaroundRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      ไม่มีรายการคำขอที่อนุมัติเสร็จสิ้นในเงื่อนไขการค้นหานี้
                    </td>
                  </tr>
                ) : (
                  turnaroundRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-semibold text-blue-900">{row['เลขทะเบียน/สารบบ']}</td>
                      <td className="py-3 px-4 font-medium">{row['ชื่อผลิตภัณฑ์']}</td>
                      <td className="py-3 px-4">{row['วันที่ยื่นคำขอ']}</td>
                      <td className="py-3 px-4">{row['วันที่อนุมัติ']}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {row['ระยะเวลาพิจารณาจนเสร็จสิ้น (วัน)']} วัน
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {row['การประเมิน SLA']}
                        </span>
                      </td>
                      <td className="py-3 px-4">{row['เจ้าหน้าที่ผู้อนุมัติ']}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 3: REVISION STATISTICS */}
          {reportType === 'revision' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">เลขทะเบียน</th>
                  <th className="py-3 px-4">ชื่อผลิตภัณฑ์</th>
                  <th className="py-3 px-4">ผู้ประกอบการ</th>
                  <th className="py-3 px-4">เวอร์ชัน</th>
                  <th className="py-3 px-4">เจ้าหน้าที่ผู้สั่งแก้ไข</th>
                  <th className="py-3 px-4">ข้อสังเกตและเหตุผล</th>
                  <th className="py-3 px-4">เอกสารหลักฐาน อย.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {revisionRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      ไม่มีประวัติคำขอที่ถูกส่งกลับแก้ไขในเงื่อนไขนี้
                    </td>
                  </tr>
                ) : (
                  revisionRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-semibold text-blue-900">{row['เลขทะเบียน/สารบบ']}</td>
                      <td className="py-3 px-4 font-medium">{row['ชื่อผลิตภัณฑ์']}</td>
                      <td className="py-3 px-4">{row['ผู้ประกอบการ']}</td>
                      <td className="py-3 px-4 font-mono">{row['เวอร์ชันฉลาก']}</td>
                      <td className="py-3 px-4">{row['เจ้าหน้าที่ผู้สั่งแก้ไข']}</td>
                      <td className="py-3 px-4 max-w-xs truncate text-amber-900 font-medium">{row['ข้อสังเกตและเหตุผลที่ส่งกลับ']}</td>
                      <td className="py-3 px-4 text-blue-900">{row['เอกสารหลักฐาน อย. แนบ']}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 4: OFFICER PERFORMANCE */}
          {reportType === 'officer_performance' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">ชื่อเจ้าหน้าที่</th>
                  <th className="py-3 px-4">บทบาท</th>
                  <th className="py-3 px-4">กลุ่มงาน</th>
                  <th className="py-3 px-4 text-center">งานทั้งหมด</th>
                  <th className="py-3 px-4 text-center">อนุมัติแล้ว</th>
                  <th className="py-3 px-4 text-center">ส่งกลับแก้ไข</th>
                  <th className="py-3 px-4 text-center">ค้างอยู่</th>
                  <th className="py-3 px-4 text-center">สำเร็จ (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {officerPerformanceRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">{row['ชื่อ-นามสกุล เจ้าหน้าที่']}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                        {row['บทบาท']}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{row['สังกัดกลุ่มงาน']}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold">{row['งานที่รับผิดชอบทั้งหมด']}</td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-700 font-bold">{row['พิจารณาอนุมัติแล้ว']}</td>
                    <td className="py-3 px-4 text-center font-mono text-amber-700 font-bold">{row['ส่งกลับแก้ไข']}</td>
                    <td className="py-3 px-4 text-center font-mono text-rose-700 font-bold">{row['อยู่ระหว่างพิจารณาค้างอยู่']}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-blue-900">
                      {row['อัตราการอนุมัติสำเร็จ (%)']}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
