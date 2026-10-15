import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Globe, 
  ArrowRight, 
  TrendingUp,
  FileSpreadsheet,
  Building2,
  Calendar
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

export const OfficerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const products = storage.getProducts();
  const labels = storage.getLabels();

  const stats = useMemo(() => {
    const totalRequests = labels.length;
    const pending = labels.filter(l => l.status === 'pending_review').length;
    const inReview = labels.filter(l => l.status === 'in_review').length;
    const revision = labels.filter(l => l.status === 'revision_required').length;
    const approved = labels.filter(l => l.status === 'approved').length;
    const published = labels.filter(l => l.status === 'published').length;
    const suspended = labels.filter(l => l.status === 'suspended').length;

    return { totalRequests, pending, inReview, revision, approved, published, suspended };
  }, [labels]);

  // Turnaround review time mock data
  const turnaroundData = [
    { category: 'อาหาร', days: 2.4 },
    { category: 'ยา', days: 4.8 },
    { category: 'เครื่องสำอาง', days: 1.6 }
  ];

  const categoryDistribution = [
    { name: 'อาหาร', count: labels.filter(l => products.find(p => p.id === l.productId)?.category === 'food').length, color: '#0284c7' },
    { name: 'ยา', count: labels.filter(l => products.find(p => p.id === l.productId)?.category === 'drug').length, color: '#0d9488' },
    { name: 'เครื่องสำอาง', count: labels.filter(l => products.find(p => p.id === l.productId)?.category === 'cosmetic').length, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      {/* Officer Welcome Banner */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#0B3954] to-[#005A9C] text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <Building2 className="w-4 h-4" />
            <span>กองกำกับและตรวจสอบผลิตภัณฑ์ — สำนักงานคณะกรรมการอาหารและยา</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1">
            แดชบอร์ดเจ้าหน้าที่ อย.: {currentUser?.fullName || 'เจ้าหน้าที่ผู้พิจารณา'}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            ระบบคิวงานตรวจสอบและกำกับดูแลฉลากดิจิทัลแห่งชาติ (Regulatory Oversight)
          </p>
        </div>

        <Link
          to="/officer/queue"
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>เปิดคิวงานตรวจสอบ ({stats.pending + stats.inReview})</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">คำขอรอรับเรื่อง</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-sky-700">{stats.pending}</div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">รอดำเนินการ</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">อยู่ระหว่างพิจารณา</span>
            <ClipboardCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700">{stats.inReview}</div>
          <span className="text-[11px] text-indigo-600 mt-1 inline-block">รับเรื่องแล้ว</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">ส่งกลับแก้ไข</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.revision}</div>
          <span className="text-[11px] text-amber-700 mt-1 inline-block">รอผู้ประกอบการ</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">อนุมัติแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{stats.approved}</div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">รอเผยแพร่</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">เผยแพร่สาธารณะ</span>
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.published}</div>
          <span className="text-[11px] text-emerald-600 mt-1 inline-block">ออนไลน์สมบูรณ์</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-medium">สั่งระงับชั่วคราว</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{stats.suspended}</div>
          <span className="text-[11px] text-rose-600 mt-1 inline-block">เฝ้าระวังความปลอดภัย</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnaround Time Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">ระยะเวลาพิจารณาเฉลี่ย (วันทำการ)</h3>
              <p className="text-xs text-slate-400">วัดผลความรวดเร็วในการพิจารณาคำขอฉลากแยกตามประเภท</p>
            </div>
            <Link to="/officer/reports" className="text-xs text-blue-700 hover:underline">
              ดูรายงาน
            </Link>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={turnaroundData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} unit=" วัน" />
                <Tooltip
                  formatter={(val: any) => [`${val} วันทำการ`, 'เวลาเฉลี่ย']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="days" fill="#005A9C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests in Queue Overview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800">สัดส่วนคำขอในระบบตามหมวดหมู่</h3>
                <p className="text-xs text-slate-400">ปริมาณงานคำขอฉลากดิจิทัลที่กำลังดำเนินการ</p>
              </div>
            </div>

            <div className="h-44 flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="count">
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {categoryDistribution.map(c => (
              <div key={c.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </span>
                <strong className="text-slate-800">{c.count} รายการ</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Immediate Action Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-blue-900" />
            <h3 className="font-bold text-sm text-slate-800">คำขอที่รอการตรวจประเมินด่วน (Urgent Queue)</h3>
          </div>
          <Link to="/officer/queue" className="text-xs text-blue-700 hover:underline font-medium">
            ดูคิวงานทั้งหมด →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {labels.filter(l => l.status === 'pending_review' || l.status === 'in_review').map(lbl => {
            const prod = products.find(p => p.id === lbl.productId);
            return (
              <div key={lbl.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {prod?.regNumber}
                    </span>
                    <StatusBadge status={lbl.status} size="sm" />
                    <span className="text-[11px] text-slate-400">ยื่นเมื่อ: {lbl.submittedAt ? new Date(lbl.submittedAt).toLocaleDateString('th-TH') : '-'}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm truncate">{lbl.titleTh}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    ผู้ยื่นคำขอ: {prod?.entrepreneurName} ({prod?.categoryNameTh})
                  </p>
                </div>

                <Link
                  to={`/officer/review/${lbl.id}`}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>เปิดห้องพิจารณา (Review Workspace)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
