import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import { DigitalLabel, Product, User } from '../../services/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AssignOfficerModal } from '../../components/officer/AssignOfficerModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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
  Eye,
  UserCheck,
  UserPlus,
  ArrowUpDown,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export const RequestQueuePage: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { success } = useToast();

  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [labels, setLabels] = useState<DigitalLabel[]>(() => storage.getLabels());

  // Filters State
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [officerFilter, setOfficerFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'submitted_desc' | 'submitted_asc' | 'pending_desc' | 'urgency'>('pending_desc');

  // Modal State for Assign/Reassign
  const [selectedLabelForAssign, setSelectedLabelForAssign] = useState<DigitalLabel | null>(null);

  const reloadData = () => {
    setProducts(storage.getProducts());
    setLabels(storage.getLabels());
  };

  const officers = useMemo(() => {
    return storage.getUsers().filter(
      u => u.role.startsWith('officer') || u.role === 'admin'
    );
  }, []);

  // Quick Self Claim
  const handleQuickClaim = (lbl: DigitalLabel) => {
    if (!currentUser) return;
    const updated: DigitalLabel = {
      ...lbl,
      currentOfficerId: currentUser.id,
      currentOfficerName: currentUser.fullName,
      status: lbl.status === 'pending_review' ? 'in_review' : lbl.status,
      claimedAt: new Date().toISOString(),
      claimedByName: currentUser.fullName,
      updatedAt: new Date().toISOString()
    };
    storage.saveLabel(updated, currentUser);

    storage.addTimelineEvent({
      labelId: lbl.id,
      version: lbl.version,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'CLAIM_REQUEST',
      status: updated.status,
      notes: `เจ้าหน้าที่รับเรื่องพิจารณาคำขอ: ${currentUser.fullName}`
    });

    storage.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CLAIM_REQUEST',
      resourceType: 'DIGITAL_LABEL',
      resourceId: lbl.id,
      result: 'SUCCESS',
      details: `เจ้าหน้าที่รับเรื่องพิจารณาคำขอ: ${lbl.titleTh}`
    });

    success(`รับเรื่องคำขอ "${lbl.titleTh}" เรียบร้อยแล้ว`);
    reloadData();
  };

  // Filter and Sort Processing
  const filteredAndSorted = useMemo(() => {
    const list = labels.filter(lbl => {
      const prod = products.find(p => p.id === lbl.productId);
      const matchCat = categoryFilter === 'ALL' || prod?.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || lbl.status === statusFilter;

      // Officer filter
      let matchOfficer = true;
      if (officerFilter === 'UNASSIGNED') {
        matchOfficer = !lbl.currentOfficerId;
      } else if (officerFilter !== 'ALL') {
        matchOfficer = lbl.currentOfficerId === officerFilter;
      }

      // Date range filter (based on submittedAt or createdAt)
      const itemDate = lbl.submittedAt ? lbl.submittedAt.slice(0, 10) : lbl.createdAt.slice(0, 10);
      const matchStart = !startDate || itemDate >= startDate;
      const matchEnd = !endDate || itemDate <= endDate;

      // Text Query
      const cleanQ = query.trim().toLowerCase();
      const matchQ = !cleanQ ||
        lbl.id.toLowerCase().includes(cleanQ) ||
        lbl.titleTh.toLowerCase().includes(cleanQ) ||
        prod?.productNameTh.toLowerCase().includes(cleanQ) ||
        prod?.regNumber.toLowerCase().includes(cleanQ) ||
        prod?.entrepreneurName.toLowerCase().includes(cleanQ) ||
        (lbl.currentOfficerName && lbl.currentOfficerName.toLowerCase().includes(cleanQ));

      return matchCat && matchStatus && matchOfficer && matchStart && matchEnd && matchQ;
    });

    // Sorting
    return list.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.createdAt).getTime();
      const dateB = new Date(b.submittedAt || b.createdAt).getTime();
      const daysA = Math.floor((Date.now() - dateA) / (1000 * 60 * 60 * 24));
      const daysB = Math.floor((Date.now() - dateB) / (1000 * 60 * 60 * 24));

      if (sortBy === 'submitted_desc') return dateB - dateA;
      if (sortBy === 'submitted_asc') return dateA - dateB;
      if (sortBy === 'pending_desc') return daysB - daysA;
      if (sortBy === 'urgency') {
        // Unassigned or overdue highest priority
        const scoreA = (!a.currentOfficerId ? 100 : 0) + daysA;
        const scoreB = (!b.currentOfficerId ? 100 : 0) + daysB;
        return scoreB - scoreA;
      }
      return 0;
    });
  }, [labels, products, query, categoryFilter, statusFilter, officerFilter, startDate, endDate, sortBy]);

  // SLA Summary Metrics
  const metrics = useMemo(() => {
    let unassigned = 0;
    let overdueSLA = 0;
    let inReview = 0;

    labels.forEach(lbl => {
      if (!lbl.currentOfficerId && lbl.status === 'pending_review') unassigned++;
      if (lbl.status === 'in_review') inReview++;
      const days = Math.floor((Date.now() - new Date(lbl.submittedAt || lbl.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (days >= 7 && lbl.status !== 'approved' && lbl.status !== 'published') overdueSLA++;
    });

    return { total: labels.length, unassigned, inReview, overdueSLA };
  }, [labels]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">คิวงานพิจารณาคำขอฉลากดิจิทัล (Request Queue)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ติดตามงานค้างพิจารณา มอบหมายเจ้าหน้าที่ผู้รับผิดชอบ และตรวจประเมินตามกรอบระยะเวลา SLA
          </p>
        </div>
      </div>

      {/* SLA Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">คำขอทั้งหมดในระบบ</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.total}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <span className="text-xs text-amber-800 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            รอเจ้าหน้าที่รับเรื่อง
          </span>
          <div className="text-2xl font-bold text-amber-900 mt-1">{metrics.unassigned}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-xs">
          <span className="text-xs text-blue-800 font-semibold flex items-center gap-1">
            <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
            อยู่ระหว่างการพิจารณา
          </span>
          <div className="text-2xl font-bold text-blue-900 mt-1">{metrics.inReview}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-xs">
          <span className="text-xs text-rose-800 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            ค้างเกิน SLA (&gt; 7 วัน)
          </span>
          <div className="text-2xl font-bold text-rose-900 mt-1">{metrics.overdueSLA}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Row 1: Search & Categorization */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผลิตภัณฑ์, เลขสารบบ (13 หลัก), เลขที่คำขอ, หรือชื่อผู้ประกอบการ..."
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
            <option value="pending_review">ยื่นคำขอแล้ว (รอรับเรื่อง)</option>
            <option value="in_review">อยู่ระหว่างพิจารณา</option>
            <option value="revision_required">ส่งกลับแก้ไข</option>
            <option value="approved">ผ่านการอนุมัติแล้ว</option>
            <option value="published">เผยแพร่แล้ว</option>
          </select>
        </div>

        {/* Row 2: Advanced Date & Officer Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Officer Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">เจ้าหน้าที่:</span>
            <select
              value={officerFilter}
              onChange={e => setOfficerFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">เจ้าหน้าที่ทั้งหมด</option>
              <option value="UNASSIGNED">เฉพาะที่ยังไม่มีผู้รับเรื่อง</option>
              {officers.map(o => (
                <option key={o.id} value={o.id}>
                  {o.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">วันที่ยื่น:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none"
            />
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">เรียงตาม:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="pending_desc">ค้างพิจารณานานที่สุด (SLA Priority)</option>
              <option value="urgency">ความเร่งด่วน & งานยังไม่มอบหมาย</option>
              <option value="submitted_desc">วันที่ยื่นคำขอ: ล่าสุด -&gt; เก่าสุด</option>
              <option value="submitted_asc">วันที่ยื่นคำขอ: เก่าสุด -&gt; ล่าสุด</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">เลขที่คำขอ & วันที่ยื่น</th>
                <th className="py-3.5 px-4">ผลิตภัณฑ์ & เลขสารบบ</th>
                <th className="py-3.5 px-4">ผู้ประกอบการ</th>
                <th className="py-3.5 px-4">ระยะเวลาค้าง (SLA)</th>
                <th className="py-3.5 px-4">เจ้าหน้าที่ผู้รับผิดชอบ</th>
                <th className="py-3.5 px-4">สถานะ</th>
                <th className="py-3.5 px-4 text-center">จัดการคำขอ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    ไม่พบรายการคำขอที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map(lbl => {
                  const prod = products.find(p => p.id === lbl.productId);
                  const dateStr = lbl.submittedAt || lbl.createdAt;
                  const daysPending = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));

                  let urgencyBadge = (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ปกติ ({daysPending} วัน)
                    </span>
                  );

                  if (daysPending >= 7 && lbl.status !== 'approved' && lbl.status !== 'published') {
                    urgencyBadge = (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        เกิน SLA ({daysPending} วัน)
                      </span>
                    );
                  } else if (daysPending >= 3 && lbl.status !== 'approved' && lbl.status !== 'published') {
                    urgencyBadge = (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3" />
                        ใกล้กำหนด ({daysPending} วัน)
                      </span>
                    );
                  }

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
                        <span className="text-[10px] text-slate-400">{prod?.categoryNameTh}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="truncate max-w-[140px] block font-medium text-slate-800">
                          {prod?.entrepreneurName}
                        </span>
                        <span className="text-[10px] text-slate-400">TaxID: {prod?.taxId}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {urgencyBadge}
                      </td>

                      <td className="py-3.5 px-4">
                        {lbl.currentOfficerName ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-900 font-medium">{lbl.currentOfficerName}</span>
                            <button
                              onClick={() => setSelectedLabelForAssign(lbl)}
                              className="p-1 text-slate-400 hover:text-blue-700 hover:bg-slate-100 rounded transition"
                              title="เปลี่ยนผู้รับผิดชอบ"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-700 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              ยังไม่มีผู้รับเรื่อง
                            </span>
                            <button
                              onClick={() => handleQuickClaim(lbl)}
                              className="px-2 py-0.5 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded text-[10px] font-bold transition flex items-center gap-1"
                              title="คลิกเพื่อรับเรื่องทันที"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>รับเรื่อง</span>
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={lbl.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            to={`/officer/review/${lbl.id}`}
                            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>เปิดตรวจ</span>
                          </Link>

                          <button
                            onClick={() => setSelectedLabelForAssign(lbl)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="มอบหมาย / เปลี่ยนผู้รับผิดชอบ"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign / Reassign Officer Modal */}
      {selectedLabelForAssign && (
        <AssignOfficerModal
          isOpen={!!selectedLabelForAssign}
          onClose={() => setSelectedLabelForAssign(null)}
          label={selectedLabelForAssign}
          onSuccess={reloadData}
        />
      )}
    </div>
  );
};
