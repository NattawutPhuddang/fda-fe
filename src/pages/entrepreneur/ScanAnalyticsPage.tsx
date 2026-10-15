import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { exportToCSV, exportToExcel } from '../../services/exportService';
import { useToast } from '../../context/ToastContext';
import { 
  BarChart3, 
  Download, 
  Smartphone, 
  Globe2, 
  MapPin, 
  TrendingUp, 
  Calendar,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const ScanAnalyticsPage: React.FC = () => {
  const { success } = useToast();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const products = storage.getProducts();
  const labels = storage.getLabels();

  const totalScans = labels.reduce((acc, curr) => acc + (curr.scanCount || 0), 0);

  // Time trend data
  const trendData = [
    { name: 'จันทร์', scans: 1420 },
    { name: 'อังคาร', scans: 1680 },
    { name: 'พุธ', scans: 2100 },
    { name: 'พฤหัสบดี', scans: 2450 },
    { name: 'ศุกร์', scans: 2890 },
    { name: 'เสาร์', scans: 3420 },
    { name: 'อาทิตย์', scans: 3120 }
  ];

  // Device Breakdown
  const deviceData = [
    { name: 'สมาร์ตโฟน (Mobile)', value: 82, color: '#002B49' },
    { name: 'แท็บเล็ต (Tablet)', value: 12, color: '#005A9C' },
    { name: 'คอมพิวเตอร์ (Desktop)', value: 6, color: '#38bdf8' }
  ];

  // Browser Breakdown
  const browserData = [
    { name: 'Safari (iOS)', value: 54, color: '#0d9488' },
    { name: 'Chrome Mobile', value: 36, color: '#0284c7' },
    { name: 'LINE In-App Browser', value: 8, color: '#10b981' },
    { name: 'อื่นๆ', value: 2, color: '#94a3b8' }
  ];

  // Region breakdown
  const regionData = [
    { region: 'กรุงเทพมหานครและปริมณฑล', scans: 8940, pct: '48.5%' },
    { region: 'ภาคตะวันออกเฉียงเหนือ', scans: 3420, pct: '18.5%' },
    { region: 'ภาคเหนือ', scans: 2710, pct: '14.7%' },
    { region: 'ภาคใต้', scans: 2110, pct: '11.4%' },
    { region: 'ภาคกลางและตะวันออก', scans: 1270, pct: '6.9%' }
  ];

  const handleExportCSV = () => {
    const exportRows = products.map(p => {
      const lbl = storage.getLabelByProductId(p.id);
      return {
        'เลขทะเบียน/สารบบ': p.regNumber,
        'ชื่อผลิตภัณฑ์': p.productNameTh,
        'หมวดหมู่': p.categoryNameTh,
        'สถานะฉลาก': lbl?.status || 'draft',
        'ยอดการสแกนสะสม': lbl?.scanCount || 0,
        'วันที่ปรับปรุง': lbl?.updatedAt ? new Date(lbl.updatedAt).toLocaleDateString('th-TH') : '-'
      };
    });
    exportToCSV(exportRows, `FDA-ScanAnalytics-${new Date().toISOString().slice(0, 10)}`);
    success('ส่งออกรายงานสถิติเป็นไฟล์ CSV สำเร็จ');
  };

  const handleExportExcel = () => {
    const exportRows = products.map(p => {
      const lbl = storage.getLabelByProductId(p.id);
      return {
        'เลขทะเบียน/สารบบ': p.regNumber,
        'ชื่อผลิตภัณฑ์': p.productNameTh,
        'หมวดหมู่': p.categoryNameTh,
        'สถานะฉลาก': lbl?.status || 'draft',
        'ยอดการสแกนสะสม': lbl?.scanCount || 0,
        'วันที่ปรับปรุง': lbl?.updatedAt ? new Date(lbl.updatedAt).toLocaleDateString('th-TH') : '-'
      };
    });
    exportToExcel(exportRows, `FDA-ScanAnalytics-${new Date().toISOString().slice(0, 10)}`, 'ScanAnalytics');
    success('ส่งออกรายงานสถิติเป็นไฟล์ Excel (.xlsx) สำเร็จ');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">สถิติการสแกนฉลากดิจิทัล (Scan Analytics)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            วิเคราะห์การเข้าชมฉลากดิจิทัลของผู้บริโภคตามช่วงเวลา อุปกรณ์ และภูมิภาค
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>ส่งออก Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">ยอดสแกนสะสมทั้งหมด</span>
          <div className="text-3xl font-extrabold text-blue-950 font-mono mt-1">
            {totalScans.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> เพิ่มขึ้น 14.2% จากเดือนที่แล้ว
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">อุปกรณ์หลักที่ใช้สแกน</span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
            82% <span className="text-xs font-normal text-slate-500 font-sans">สมาร์ตโฟน</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">iOS Safari และ Android Chrome</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">พื้นที่ที่มีการสแกนสูงสุด</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 truncate">
            กทม. และปริมณฑล
          </div>
          <p className="text-[11px] text-slate-400 mt-1">สัดส่วน 48.5% ของการเข้าชมทั้งหมด</p>
        </div>
      </div>

      {/* Scan Trend Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800">จำนวนการสแกนในรอบสัปดาห์ (Weekly Volume)</h3>
            <p className="text-xs text-slate-400">เปรียบเทียบจำนวนการตรวจสอบฉลากในแต่ละวัน</p>
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-lg transition ${timeRange === '7d' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-600'}`}
            >
              7 วัน
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 rounded-lg transition ${timeRange === '30d' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-600'}`}
            >
              30 วัน
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="scans" fill="#002B49" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Demographic and Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800">สัดส่วนประเภทอุปกรณ์</h3>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                  {deviceData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-xs">
            {deviceData.map(d => (
              <div key={d.name} className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <strong className="text-slate-800">{d.value}%</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Browser Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800">เว็บเบราว์เซอร์ที่เปิดฉลาก</h3>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={browserData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                  {browserData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-xs">
            {browserData.map(d => (
              <div key={d.name} className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <strong className="text-slate-800">{d.value}%</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Region Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div>
            <h3 className="font-bold text-sm text-slate-800">พื้นที่ภูมิภาคที่มีการสแกน</h3>
            <p className="text-[11px] text-slate-400">ระดับกลุ่มจังหวัด (ไม่เก็บพิกัด GPS ละเอียด)</p>
          </div>
          <div className="space-y-2.5 pt-2 text-xs">
            {regionData.map(r => (
              <div key={r.region} className="space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>{r.region}</span>
                  <span className="font-semibold text-blue-900">{r.scans.toLocaleString()} ({r.pct})</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-800 h-full rounded-full" style={{ width: r.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
