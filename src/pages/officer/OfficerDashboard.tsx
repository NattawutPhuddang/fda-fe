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
  Building2
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

  const turnaroundData = [
    { category: 'อาหาร', days: 2.4 },
    { category: 'ยา', days: 4.8 },
    { category: 'เครื่องสำอาง', days: 1.6 }
  ];

  const categoryDistribution = [
    { name: 'อาหาร', count: labels.filter(l => products.find(p => p.id === l.productId)?.category === 'food').length, color: '#002B49' },
    { name: 'ยา', count: labels.filter(l => products.find(p => p.id === l.productId)?.category === 'drug').length, color: '#334155' },
    { name: 'เครื่องสำอาง', count: labels.filter(l => products.find(p => p.id === l.productId)?.category === 'cosmetic').length, color: '#64748b' }
  ];

  return (
    <div className="space-y-6">
      {/* Officer Welcome Banner */}
      <div className="bg-[#002B49] text-white p-6 rounded-2xl shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5" />
            <span>กองกำกับและตรวจสอบผลิตภัณฑ์ — สำนักงานคณะกรรมการอาหารและยา</span>
          </div>
          <h2 className="text-xl font-bold mt-1">
            แดชบอร์ดเจ้าหน้าที่ อย.: {currentUser?.fullName || 'เจ้าหน้าที่ผู้พิจารณา'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            ระบบคิวงานตรวจสอบและกำกับดูแลฉลากดิจิทัลแห่งชาติ (Regulatory Oversight)
          </p>
        </div>

        <Link
          to="/officer/queue"
          className="px-4 py-2 bg-white text-[#002B49] hover:bg-slate-100 rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>เปิดคิวงานตรวจสอบ ({stats.pending + stats.inReview})</span>
        </Link>
      </div>

      {/* KPI Cards Grid - Restrained Executive Palette */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">รอรับเรื่อง</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.pending}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">รอดำเนินการ</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">อยู่ระหว่างพิจารณา</span>
            <ClipboardCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.inReview}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">รับเรื่องแล้ว</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">ส่งกลับแก้ไข</span>
            <AlertTriangle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.revision}</div>
          <span className="text-[11px] text-amber-700 mt-1 inline-block font-medium">รอผู้ประกอบการ</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">อนุมัติแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.approved}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">รอเผยแพร่</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">เผยแพร่สาธารณะ</span>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.published}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">ออนไลน์สมบูรณ์</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">สั่งระงับชั่วคราว</span>
            <ShieldAlert className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.suspended}</div>
          <span className="text-[11px] text-rose-700 mt-1 inline-block font-medium">เฝ้าระวังความปลอดภัย</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnaround Time Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">ระยะเวลาพิจารณาเฉลี่ย (วันทำการ)</h3>
              <p className="text-xs text-slate-500">วัดผลความรวดเร็วในการพิจารณาคำขอฉลาก</p>
            </div>
            <Link to="/officer/reports" className="text-xs text-slate-600 hover:text-slate-900">
              ดูรายงาน
            </Link>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={turnaroundData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit=" วัน" />
                <Tooltip
                  formatter={(val: any) => [`${val} วันทำการ`, 'เวลาเฉลี่ย']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="days" fill="#002B49" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests in Queue Overview */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">สัดส่วนคำขอในระบบตามหมวดหมู่</h3>
            <p className="text-xs text-slate-500">ปริมาณงานคำขอฉลากดิจิทัลที่กำลังดำเนินการ</p>

            <div className="h-40 flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={60} dataKey="count">
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-sm text-slate-900">คำขอที่รอการตรวจประเมินด่วน (Urgent Queue)</h3>
          </div>
          <Link to="/officer/queue" className="text-xs text-slate-600 hover:text-slate-900 font-medium">
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
                    <span className="font-mono text-slate-900 font-semibold bg-slate-100 px-2 py-0.5 rounded text-[11px]">
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
                  className="px-3.5 py-1.5 bg-[#002B49] hover:bg-[#001D33] text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>เปิดห้องพิจารณา</span>
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
