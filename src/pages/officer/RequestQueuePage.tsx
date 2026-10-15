import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import { DigitalLabel, Product } from '../../services/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Calendar,
  Eye
} from 'lucide-react';

export const RequestQueuePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const products = storage.getProducts();
  const labels = storage.getLabels();

  const filtered = useMemo(() => {
    return labels.filter(lbl => {
      const prod = products.find(p => p.id === lbl.productId);
      const matchCat = categoryFilter === 'ALL' || prod?.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || lbl.status === statusFilter;
      const cleanQ = query.trim().toLowerCase();
      const matchQ = !cleanQ ||
        lbl.titleTh.toLowerCase().includes(cleanQ) ||
        prod?.productNameTh.toLowerCase().includes(cleanQ) ||
        prod?.regNumber.toLowerCase().includes(cleanQ) ||
        prod?.entrepreneurName.toLowerCase().includes(cleanQ);

      return matchCat && matchStatus && matchQ;
    });
  }, [labels, products, query, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">คิวงานพิจารณาคำขอฉลากดิจิทัล (Request Queue)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            รายการคำขอฉลากที่ผู้ประกอบการยื่นขอรับการตรวจสอบตามลำดับเวลาและความเร่งด่วน
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผลิตภัณฑ์, เลขสารบบ (13 หลัก), ทะเบียนยา หรือชื่อผู้ประกอบการ..."
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
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="ALL">ทุกสถานะคำขอ</option>
          <option value="pending_review">ยื่นคำขอแล้ว (รอเจ้าหน้าที่รับเรื่อง)</option>
          <option value="in_review">อยู่ระหว่างการพิจารณา</option>
          <option value="revision_required">ส่งกลับแก้ไข</option>
          <option value="approved">ผ่านการอนุมัติแล้ว</option>
          <option value="published">เผยแพร่แล้ว</option>
          <option value="suspended">สั่งระงับชั่วคราว</option>
        </select>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขที่คำขอ & วันที่ยื่น</th>
                <th className="py-3 px-4">ผลิตภัณฑ์ & เลขสารบบ</th>
                <th className="py-3 px-4">ผู้ประกอบการ (นิติบุคคล)</th>
                <th className="py-3 px-4">หมวดหมู่</th>
                <th className="py-3 px-4">เจ้าหน้าที่ผู้รับผิดชอบ</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-center">พิจารณา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(lbl => {
                const prod = products.find(p => p.id === lbl.productId);
                return (
                  <tr key={lbl.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <strong className="text-slate-800 block font-semibold">{lbl.id}</strong>
                      <span className="text-[10px] text-slate-400">
                        {lbl.submittedAt ? new Date(lbl.submittedAt).toLocaleDateString('th-TH') : 'ยังไม่ระบุ'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 line-clamp-1">{lbl.titleTh}</p>
                      <p className="text-[11px] text-blue-900 font-mono font-semibold">{prod?.regNumber}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="truncate max-w-[150px] block font-medium text-slate-800">
                        {prod?.entrepreneurName}
                      </span>
                      <span className="text-[10px] text-slate-400">TaxID: {prod?.taxId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                        {prod?.categoryNameTh}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 font-medium">
                        {lbl.currentOfficerName || 'ยังไม่มีผู้รับเรื่อง'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={lbl.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        to={`/officer/review/${lbl.id}`}
                        className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>เปิดตรวจ</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
