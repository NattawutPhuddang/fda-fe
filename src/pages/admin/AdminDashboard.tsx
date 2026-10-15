import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Building2, 
  Briefcase, 
  Package, 
  Server, 
  Activity, 
  Settings
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const users = storage.getUsers();
  const products = storage.getProducts();
  const labels = storage.getLabels();
  const integrations = storage.getIntegrations();
  const auditLogs = storage.getAuditLogs();

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      entrepreneurs: users.filter(u => u.role === 'entrepreneur').length,
      officers: users.filter(u => u.role === 'officer').length,
      totalProducts: products.length,
      totalLabels: labels.length,
      configuredIntegrations: integrations.filter(i => i.status === 'CONFIGURED').length,
      placeholderIntegrations: integrations.filter(i => i.status === 'PLACEHOLDER').length,
      recentEvents: auditLogs.length
    };
  }, [users, products, labels, integrations, auditLogs]);

  const trafficData = [
    { time: '08:00', requests: 450 },
    { time: '10:00', requests: 1200 },
    { time: '12:00', requests: 1850 },
    { time: '14:00', requests: 2100 },
    { time: '16:00', requests: 1980 },
    { time: '18:00', requests: 1400 },
    { time: '20:00', requests: 890 }
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#002B49] text-white p-6 rounded-2xl shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Settings className="w-3.5 h-3.5" />
            <span>ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร (ศทส. อย.)</span>
          </div>
          <h2 className="text-xl font-bold mt-1">
            คอนโซลผู้ดูแลระบบ (Admin Console)
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            บริหารจัดการผู้ใช้ สิทธิ์การเข้าถึง (RBAC) ข้อมูลหลัก และสถานะการเชื่อมต่อบริการภายนอก
          </p>
        </div>

        <Link
          to="/admin/users"
          className="px-4 py-2 bg-white text-[#002B49] hover:bg-slate-100 rounded-lg text-xs font-semibold shadow-xs transition"
        >
          จัดการผู้ใช้งาน ({stats.totalUsers})
        </Link>
      </div>

      {/* KPI Cards Grid - Restrained Colors */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">ผู้ใช้งานทั้งหมด</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">ในฐานข้อมูล</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">ผู้ประกอบการ</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.entrepreneurs}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">นิติบุคคล</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">เจ้าหน้าที่ อย.</span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.officers}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">ผู้ตรวจประเมิน</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">ทะเบียนผลิตภัณฑ์</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalProducts}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">e-Submission</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">บริการเชื่อมต่อ API</span>
            <Server className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{integrations.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">6 บริการ</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">บันทึก Audit Log</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.recentEvents}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">บันทึกสมบูรณ์</span>
        </div>
      </div>

      {/* API Traffic Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">ปริมาณการเรียกใช้งานระบบ API (API Requests / Hour)</h3>
            <p className="text-xs text-slate-500">การเข้าถึงจาก Public Mobile Scans และระบบหลังบ้าน</p>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="apiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#002B49" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#002B49" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="requests" stroke="#002B49" strokeWidth={2} fillOpacity={1} fill="url(#apiGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Integration Status Highlights */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b pb-2.5">
          <h3 className="font-bold text-sm text-slate-900">สถานะการเชื่อมต่อบริการภายนอก (Integration Status)</h3>
          <Link to="/admin/integrations" className="text-xs text-slate-600 hover:text-slate-900">
            ดูรายละเอียดทั้งหมด →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {integrations.slice(0, 3).map(item => (
            <div key={item.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{item.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-200 text-slate-700">
                  {item.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
