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
  Settings,
  ShieldAlert,
  ShieldCheck,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Bell,
  RefreshCw,
  ExternalLink
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
  const notifications = storage.getNotifications();

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      entrepreneurs: users.filter(u => u.role === 'entrepreneur').length,
      officers: users.filter(u => u.role === 'officer').length,
      totalProducts: products.length,
      totalLabels: labels.length,
      configuredIntegrations: integrations.filter(i => i.status === 'CONFIGURED').length,
      errorIntegrations: integrations.filter(i => i.status === 'ERROR').length,
      recentEvents: auditLogs.length
    };
  }, [users, products, labels, integrations, auditLogs]);

  // Aggregate active incidents from error notifications and failed audit logs
  const activeIncidents = useMemo(() => {
    const errorNotifs = notifications
      .filter(n => n.type === 'error' || n.type === 'warning')
      .map(n => ({
        id: n.id,
        severity: n.type === 'error' ? 'CRITICAL' : 'WARNING',
        title: n.title,
        message: n.message,
        timestamp: n.createdAt,
        link: n.link || '/admin/integrations',
        source: 'System Monitor'
      }));

    const failedAudits = auditLogs
      .filter(l => l.result === 'FAILED' || l.action.includes('OUTAGE') || l.action.includes('SUSPEND'))
      .slice(0, 5)
      .map(l => ({
        id: l.id,
        severity: l.action.includes('OUTAGE') ? 'CRITICAL' : 'HIGH',
        title: `การกระทำความปลอดภัย: ${l.action}`,
        message: `${l.details} (โดย ${l.userName})`,
        timestamp: l.timestamp,
        link: '/auditor/logs',
        source: l.resourceType || 'Security Audit'
      }));

    const merged = [...errorNotifs, ...failedAudits].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return merged.slice(0, 6);
  }, [notifications, auditLogs]);

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
            บริหารจัดการผู้ใช้ สิทธิ์การเข้าถึง (RBAC) ข้อมูลหลัก เฝ้าระวัง Service Health และติดตาม Incident
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/users"
            className="px-4 py-2 bg-white text-[#002B49] hover:bg-slate-100 rounded-lg text-xs font-semibold shadow-xs transition"
          >
            จัดการผู้ใช้งาน ({stats.totalUsers})
          </Link>
          <Link
            to="/admin/integrations"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Server className="w-3.5 h-3.5" />
            <span>เกตเวย์ API ({integrations.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">ผู้ใช้งานทั้งหมด</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">ในระบบ</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">ผู้ประกอบการ</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.entrepreneurs}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">นิติบุคคล</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">เจ้าหน้าที่ อย.</span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.officers}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">ผู้ตรวจประเมิน</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">ทะเบียนผลิตภัณฑ์</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalProducts}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">e-Submission</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">เกตเวย์เชื่อมต่อ</span>
            <Server className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 flex items-center gap-1.5">
            <span>{integrations.length}</span>
            {stats.errorIntegrations > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold font-mono animate-pulse">
                {stats.errorIntegrations} error
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">บริการหลัก</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">บันทึก Audit Log</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.recentEvents}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Append-Only</span>
        </div>
      </div>

      {/* Service Health Overview Card (Admin Item 15) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-900" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                สถานะความพร้อมใช้งานของระบบและบริการหลัก (System Service Health)
              </h3>
              <p className="text-xs text-slate-500">
                มอนิเตอร์สถานะเรียลไทม์ของสถาปัตยกรรมคลาวด์ ฐานข้อมูล SQL Server และ API Gateway
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Core System SLA: 99.98%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Service 1: SQL Server */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-900" />
                <span className="font-bold text-slate-800">Microsoft SQL Server</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                HEALTHY
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Enterprise 2022 • AlwaysOn Cluster
            </p>
            <div className="text-[10px] font-mono text-slate-600 pt-1 border-t border-slate-200 flex justify-between">
              <span>Latency: <strong>4 ms</strong></span>
              <span>Tables: <strong>28 schema</strong></span>
            </div>
          </div>

          {/* Service 2: API Gateway */}
          <div className={`p-4 rounded-xl border ${
            stats.errorIntegrations > 0 ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-slate-50/60'
          } space-y-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-900" />
                <span className="font-bold text-slate-800">API Gateway Router</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                stats.errorIntegrations > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {stats.errorIntegrations > 0 ? 'DEGRADED' : 'OPERATIONAL'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              ThaID, SKYNET, e-Submission
            </p>
            <div className="text-[10px] font-mono text-slate-600 pt-1 border-t border-slate-200 flex justify-between">
              <span>Avg Latency: <strong>48 ms</strong></span>
              <span>Services: <strong>{integrations.length} Active</strong></span>
            </div>
          </div>

          {/* Service 3: GDCC Cloud */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-900" />
                <span className="font-bold text-slate-800">GDCC Cloud Storage</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Gov Cloud Tier-4 • AES-256 HSM
            </p>
            <div className="text-[10px] font-mono text-slate-600 pt-1 border-t border-slate-200 flex justify-between">
              <span>Zone: <strong>BKK-1</strong></span>
              <span>Redundancy: <strong>Multi-Zone</strong></span>
            </div>
          </div>

          {/* Service 4: Notification Engine */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-900" />
                <span className="font-bold text-slate-800">Gov Notification Hub</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              In-App Toast, Email & SMS Gateway
            </p>
            <div className="text-[10px] font-mono text-slate-600 pt-1 border-t border-slate-200 flex justify-between">
              <span>Queue: <strong>0 pending</strong></span>
              <span>Success: <strong>99.9%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Active System Incidents & Security Alerts Table (Admin Item 16) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                รายการเหตุการณ์ผิดปกติและความมั่นคงปลอดภัย (Active Incidents & Security Alerts)
              </h3>
              <p className="text-xs text-slate-500">
                ตรวจจับอัตโนมัติเมื่อเกิด API Timeout, การระงับฉลาก, หรือการละเมิดสิทธิ์การใช้งาน
              </p>
            </div>
          </div>

          <Link
            to="/auditor/logs"
            className="text-xs text-blue-900 hover:text-blue-950 font-semibold flex items-center gap-1"
          >
            <span>ดูบันทึก Audit Logs ทั้งหมด</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeIncidents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ระดับความรุนแรง</th>
                  <th className="py-2.5 px-3">รายการเหตุการณ์</th>
                  <th className="py-2.5 px-3">แหล่งที่มา</th>
                  <th className="py-2.5 px-3">วัน-เวลา</th>
                  <th className="py-2.5 px-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {inc.severity === 'CRITICAL' ? (
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 w-fit">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          CRITICAL
                        </span>
                      ) : inc.severity === 'HIGH' ? (
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          HIGH
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] bg-slate-100 text-slate-700 border border-slate-300 w-fit">
                          WARNING
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 max-w-sm">
                      <div className="font-semibold text-slate-900">{inc.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{inc.message}</div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                      {inc.source}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(inc.timestamp).toLocaleString('th-TH')}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <Link
                        to={inc.link}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-900 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 rounded-lg inline-flex items-center gap-1 transition"
                      >
                        <span>ตรวจสอบ</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <p>ไม่พบเหตุการณ์ผิดปกติในขณะนี้ ระบบทำงานได้อย่างเสถียร 100%</p>
          </div>
        )}
      </div>

      {/* API Traffic Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
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
    </div>
  );
};
