import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, 
  Tag, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  QrCode, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  FileEdit,
  Building2,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { StatusBadge } from '../../components/common/StatusBadge';

export const EntrepreneurDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const products = storage.getProducts();
  const labels = storage.getLabels();
  const auditLogs = storage.getAuditLogs();

  // Statistics calculation
  const stats = useMemo(() => {
    const totalProd = products.length;
    const activeProd = products.filter(p => p.registrationStatus === 'active').length;
    const publishedLabels = labels.filter(l => l.status === 'published').length;
    const pendingLabels = labels.filter(l => l.status === 'pending_review' || l.status === 'in_review').length;
    const revisionLabels = labels.filter(l => l.status === 'revision_required').length;
    const totalScans = labels.reduce((acc, curr) => acc + (curr.scanCount || 0), 0);

    return { totalProd, activeProd, publishedLabels, pendingLabels, revisionLabels, totalScans };
  }, [products, labels]);

  // Chart data for daily scans
  const scanTrendData = [
    { date: '09 ต.ค.', scans: 1240 },
    { date: '10 ต.ค.', scans: 1480 },
    { date: '11 ต.ค.', scans: 1890 },
    { date: '12 ต.ค.', scans: 2340 },
    { date: '13 ต.ค.', scans: 2150 },
    { date: '14 ต.ค.', scans: 2890 },
    { date: '15 ต.ค.', scans: 3120 }
  ];

  // Category breakdown
  const categoryData = [
    { name: 'อาหารและเครื่องดื่ม', value: products.filter(p => p.category === 'food').length, color: '#0284c7' },
    { name: 'ยาแผนปัจจุบัน', value: products.filter(p => p.category === 'drug').length, color: '#0d9488' },
    { name: 'เครื่องสำอาง', value: products.filter(p => p.category === 'cosmetic').length, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#0B3954] to-[#005A9C] text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <Building2 className="w-4 h-4" />
            <span>{currentUser?.organization || 'บริษัท สยามไบโอเทค เฮลท์แคร์ จำกัด'} (Tax ID: 0105556012345)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1">
            ยินดีต้อนรับ, {currentUser?.fullName || 'ผู้ประกอบการ'}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            ศูนย์บริหารจัดการทะเบียนและฉลากดิจิทัล อย. ประจำสถานประกอบการ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/entrepreneur/labels/new"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>ยื่นคำขอฉลากดิจิทัลใหม่</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">ผลิตภัณฑ์ทั้งหมด</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{stats.totalProd}</div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">เชื่อม e-Submission</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">ฉลากที่เผยแพร่แล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{stats.publishedLabels}</div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">สแกน QR ได้จริง</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">คำขอรอพิจารณา</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-sky-700">{stats.pendingLabels}</div>
          <span className="text-[11px] text-sky-600 mt-1 inline-block">อยู่ในคิวตรวจ</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">ฉลากที่ต้องแก้ไข</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.revisionLabels}</div>
          <span className="text-[11px] text-amber-700 mt-1 inline-block">ต้องดำเนินการ</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">ยอดสแกนฉลากรวม</span>
            <QrCode className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {stats.totalScans.toLocaleString()} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% จากสัปดาห์ก่อน
          </span>
        </div>
      </div>

      {/* Analytics & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">แนวโน้มการสแกน QR Code (7 วันล่าสุด)</h3>
              <p className="text-xs text-slate-400">สถิติการสแกนจากผู้บริโภคทั่วประเทศ</p>
            </div>
            <Link
              to="/entrepreneur/analytics"
              className="text-xs text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1"
            >
              <span>ดูรายงานวิเคราะห์ละเอียด</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scanTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005A9C" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#005A9C" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="scans" stroke="#005A9C" strokeWidth={2.5} fillOpacity={1} fill="url(#scanGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Categories Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800">สัดส่วนหมวดหมู่ผลิตภัณฑ์</h3>
            <p className="text-xs text-slate-400">จำแนกตามประเภทที่ได้รับอนุมัติในระบบ</p>

            <div className="h-44 flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600">{c.name}</span>
                </div>
                <strong className="text-slate-800">{c.value} รายการ</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Required & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Required: Revisions & Drafts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-800">รายการฉลากที่ต้องดำเนินการ (Action Required)</h3>
            </div>
            <Link to="/entrepreneur/labels" className="text-xs text-blue-700 hover:underline">
              ดูทั้งหมด
            </Link>
          </div>

          <div className="space-y-3">
            {labels.filter(l => l.status === 'revision_required' || l.status === 'draft').map(l => {
              const prod = products.find(p => p.id === l.productId);
              return (
                <div key={l.id} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center justify-between gap-3">
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={l.status} size="sm" />
                      <span className="text-xs font-mono text-slate-500">{prod?.regNumber}</span>
                    </div>
                    <h4 className="font-semibold text-xs text-slate-900 mt-1 truncate">{l.titleTh}</h4>
                    {l.revisionNotes && (
                      <p className="text-[11px] text-amber-800 mt-0.5 line-clamp-1 italic">
                        จนท: "{l.revisionNotes}"
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/entrepreneur/labels/${l.id}/edit`}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium flex-shrink-0 transition flex items-center gap-1"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>แก้ไข</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-800">ประวัติกิจกรรมล่าสุด (Activity Stream)</h3>
            <span className="text-[11px] text-slate-400">ระบบบันทึก Audit Logs อัตโนมัติ</span>
          </div>

          <div className="space-y-3 text-xs">
            {auditLogs.slice(0, 4).map(log => (
              <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{log.userName}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString('th-TH')}</span>
                  </div>
                  <p className="font-medium text-slate-800 mt-0.5 truncate">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
