import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  QrCode, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  FileEdit,
  Building2
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

  const stats = useMemo(() => {
    const totalProd = products.length;
    const activeProd = products.filter(p => p.registrationStatus === 'active').length;
    const publishedLabels = labels.filter(l => l.status === 'published').length;
    const pendingLabels = labels.filter(l => l.status === 'pending_review' || l.status === 'in_review').length;
    const revisionLabels = labels.filter(l => l.status === 'revision_required').length;
    const totalScans = labels.reduce((acc, curr) => acc + (curr.scanCount || 0), 0);

    return { totalProd, activeProd, publishedLabels, pendingLabels, revisionLabels, totalScans };
  }, [products, labels]);

  const scanTrendData = [
    { date: '09 ต.ค.', scans: 1240 },
    { date: '10 ต.ค.', scans: 1480 },
    { date: '11 ต.ค.', scans: 1890 },
    { date: '12 ต.ค.', scans: 2340 },
    { date: '13 ต.ค.', scans: 2150 },
    { date: '14 ต.ค.', scans: 2890 },
    { date: '15 ต.ค.', scans: 3120 }
  ];

  // Restrained, executive government color scheme for categories
  const categoryData = [
    { name: 'อาหารและเครื่องดื่ม', value: products.filter(p => p.category === 'food').length, color: '#002B49' },
    { name: 'ยาแผนปัจจุบัน', value: products.filter(p => p.category === 'drug').length, color: '#334155' },
    { name: 'เครื่องสำอาง', value: products.filter(p => p.category === 'cosmetic').length, color: '#64748b' }
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#002B49] text-white p-6 rounded-2xl shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5" />
            <span>{currentUser?.organization || 'บริษัท สยามไบโอเทค เฮลท์แคร์ จำกัด'} (Tax ID: 0105556012345)</span>
          </div>
          <h2 className="text-xl font-bold mt-1">
            ยินดีต้อนรับ, {currentUser?.fullName || 'ผู้ประกอบการ'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            ระบบบริหารจัดการทะเบียนและฉลากดิจิทัล อย. ประจำสถานประกอบการ
          </p>
        </div>

        <Link
          to="/entrepreneur/labels/new"
          className="px-4 py-2 bg-white text-[#002B49] hover:bg-slate-100 rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ยื่นคำขอฉลากใหม่</span>
        </Link>
      </div>

      {/* KPI Cards Grid - Restrained Monochrome & Navy */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">ผลิตภัณฑ์ทั้งหมด</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalProd}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">เชื่อม e-Submission</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">เผยแพร่แล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.publishedLabels}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">สแกน QR ได้จริง</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">คำขอรอพิจารณา</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.pendingLabels}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">อยู่ในคิวตรวจ</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">ฉลากต้องแก้ไข</span>
            <AlertTriangle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.revisionLabels}</div>
          <span className="text-[11px] text-amber-700 mt-1 inline-block font-medium">ต้องดำเนินการ</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 col-span-2">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">ยอดสแกนฉลากสะสม</span>
            <QrCode className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {stats.totalScans.toLocaleString()} <span className="text-xs font-normal text-slate-500 font-sans">ครั้ง</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-slate-600" /> สถิติสะสมจากประชาชน
          </span>
        </div>
      </div>

      {/* Analytics & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">แนวโน้มการสแกน QR Code (7 วันล่าสุด)</h3>
              <p className="text-xs text-slate-500">สถิติการตรวจสอบฉลากจากผู้บริโภค</p>
            </div>
            <Link
              to="/entrepreneur/analytics"
              className="text-xs text-slate-700 hover:text-slate-900 font-medium inline-flex items-center gap-1"
            >
              <span>ดูรายงานละเอียด</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scanTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#002B49" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#002B49" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="scans" stroke="#002B49" strokeWidth={2} fillOpacity={1} fill="url(#scanGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Categories Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">สัดส่วนหมวดหมู่ผลิตภัณฑ์</h3>
            <p className="text-xs text-slate-500">จำแนกตามประเภทที่ได้รับอนุมัติในระบบ</p>

            <div className="h-40 flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={3}
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

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
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
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">รายการฉลากที่ต้องดำเนินการ</h3>
            <Link to="/entrepreneur/labels" className="text-xs text-slate-600 hover:text-slate-900">
              ดูทั้งหมด
            </Link>
          </div>

          <div className="space-y-2.5">
            {labels.filter(l => l.status === 'revision_required' || l.status === 'draft').map(l => {
              const prod = products.find(p => p.id === l.productId);
              return (
                <div key={l.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={l.status} size="sm" />
                      <span className="text-xs font-mono text-slate-500">{prod?.regNumber}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 mt-1 truncate">{l.titleTh}</h4>
                    {l.revisionNotes && (
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1 italic">
                        จนท: "{l.revisionNotes}"
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/entrepreneur/labels/${l.id}/edit`}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-medium flex-shrink-0 transition flex items-center gap-1"
                  >
                    <FileEdit className="w-3 h-3" />
                    <span>แก้ไข</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">ประวัติกิจกรรมล่าสุด (Activity Stream)</h3>
            <span className="text-[11px] text-slate-400">บันทึกอัตโนมัติ</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {auditLogs.slice(0, 4).map(log => (
              <div key={log.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
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
