import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../../services/storage';
import { DigitalLabel, Product, LabelStatus } from '../../services/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QRModal } from '../../components/common/QRModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Modal } from '../../components/common/Modal';
import { TimelineView } from '../../components/common/TimelineView';
import { VersionDiffModal } from '../../components/entrepreneur/VersionDiffModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Tag, 
  Search, 
  Plus, 
  FileEdit, 
  Eye, 
  QrCode, 
  Globe, 
  Send, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  GitCompare,
  PlusCircle,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export const LabelListPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { success, warning, error, info } = useToast();
  const navigate = useNavigate();

  const [labels, setLabels] = useState<DigitalLabel[]>(() => storage.getLabels());
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedForQR, setSelectedForQR] = useState<{ product: Product; label: DigitalLabel } | null>(null);
  const [labelToPublish, setLabelToPublish] = useState<DigitalLabel | null>(null);

  // Timeline & Version Modals
  const [timelineLabel, setTimelineLabel] = useState<DigitalLabel | null>(null);
  const [diffLabel, setDiffLabel] = useState<DigitalLabel | null>(null);

  const products = storage.getProducts();
  const repAuth = storage.checkRepresentativeAuthority('เผยแพร่ฉลากดิจิทัล');

  const filteredLabels = useMemo(() => {
    return labels.filter(lbl => {
      const matchStatus = statusFilter === 'ALL' || lbl.status === statusFilter;
      const prod = products.find(p => p.id === lbl.productId);
      const cleanQ = query.trim().toLowerCase();
      const matchQ = !cleanQ ||
        lbl.titleTh.toLowerCase().includes(cleanQ) ||
        lbl.titleEn.toLowerCase().includes(cleanQ) ||
        prod?.regNumber.toLowerCase().includes(cleanQ) ||
        prod?.productNameTh.toLowerCase().includes(cleanQ);
      return matchStatus && matchQ;
    });
  }, [labels, products, query, statusFilter]);

  const handlePublish = (targetLabel: DigitalLabel) => {
    if (!repAuth.allowed) {
      error(repAuth.reason || 'ตัวแทนไม่มีสิทธิ์เผยแพร่ฉลาก');
      setLabelToPublish(null);
      return;
    }

    const updated: DigitalLabel = {
      ...targetLabel,
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    storage.saveLabel(updated, currentUser || undefined, 'ผู้ประกอบการกดเผยแพร่ฉลากดิจิทัลสู่สาธารณะ');
    setLabels(storage.getLabels());
    setLabelToPublish(null);
    success(`เผยแพร่ฉลาก "${updated.titleTh}" สู่สาธารณะสำเร็จแล้ว! ประชาชนสามารถสแกน QR Code ได้ทันที`);
  };

  const handleCreateNewVersion = (targetLabel: DigitalLabel) => {
    const repCheck = storage.checkRepresentativeAuthority('ยื่นคำขอฉลากดิจิทัล');
    if (!repCheck.allowed) {
      error(repCheck.reason || 'ตัวแทนไม่มีสิทธิ์สร้างคำขอฉลาก');
      return;
    }

    const newVersionNumber = targetLabel.version + 1;
    const newVersionLabel: DigitalLabel = {
      ...targetLabel,
      id: `lbl-${targetLabel.productId}-v${newVersionNumber}-${Date.now()}`,
      version: newVersionNumber,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: undefined,
      approvedAt: undefined,
      publishedAt: undefined,
      previousVersionId: targetLabel.id,
      versionChangeReason: 'ปรับปรุงสูตรและรายละเอียดฉลากประจำปี'
    };

    storage.saveLabel(newVersionLabel, currentUser || undefined, `สร้างฉบับร่างเวอร์ชันใหม่ (v${newVersionNumber}.0)`);
    setLabels(storage.getLabels());
    success(`สร้างฉบับร่างเวอร์ชันใหม่ (v${newVersionNumber}.0) สำเร็จ กำลังเปิดหน้าแก้ไข...`);
    navigate(`/entrepreneur/labels/${newVersionLabel.id}/edit`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">จัดการฉลากดิจิทัล (Digital Labels)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            สร้าง จัดการ ยื่นขอรับการตรวจสอบ และเผยแพร่ฉลากดิจิทัลประจำผลิตภัณฑ์สุขภาพ
          </p>
        </div>

        <Link
          to="/entrepreneur/labels/new"
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างคำขอฉลากใหม่</span>
        </Link>
      </div>

      {/* Representative Alert if expired or revoked */}
      {!repAuth.allowed && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>{repAuth.reason}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อฉลาก, เลขสารบบ หรือชื่อผลิตภัณฑ์..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
        >
          <option value="ALL">ทุกสถานะฉลาก</option>
          <option value="draft">แบบร่าง (Draft)</option>
          <option value="pending_review">ยื่นคำขอแล้ว (รอเจ้าหน้าที่รับเรื่อง)</option>
          <option value="in_review">อยู่ระหว่างการพิจารณา</option>
          <option value="revision_required">ส่งกลับแก้ไข (Revision Required)</option>
          <option value="approved">ผ่านการอนุมัติ (รอผู้ประกอบการเผยแพร่)</option>
          <option value="published">เผยแพร่แล้ว (Published)</option>
          <option value="suspended">ถูกสั่งระงับชั่วคราว (Suspended)</option>
          <option value="rejected">ไม่อนุมัติ (Rejected)</option>
        </select>
      </div>

      {/* Labels Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ผลิตภัณฑ์ & เลขสารบบ</th>
                <th className="py-3 px-4">ชื่อฉลากดิจิทัล</th>
                <th className="py-3 px-4">เวอร์ชัน</th>
                <th className="py-3 px-4">สถานะคำขอ</th>
                <th className="py-3 px-4">ยอดสแกน</th>
                <th className="py-3 px-4">อัปเดตล่าสุด</th>
                <th className="py-3 px-4 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLabels.map(lbl => {
                const prod = products.find(p => p.id === lbl.productId);
                return (
                  <tr key={lbl.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <strong className="text-blue-900 block font-semibold">{prod?.regNumber}</strong>
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px] block font-sans">
                        {prod?.productNameTh}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 line-clamp-1">{lbl.titleTh}</p>
                      <p className="text-[11px] text-slate-400 italic line-clamp-1">{lbl.titleEn}</p>
                      {lbl.revisionNotes && (
                        <span className="inline-block text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 mt-1 font-sans">
                          จนท. ส่งกลับ: {lbl.revisionNotes.slice(0, 45)}...
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                        v{lbl.version}.0
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={lbl.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800 font-semibold">
                      {lbl.scanCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(lbl.updatedAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Publish button for Approved state */}
                        {lbl.status === 'approved' && (
                          <button
                            onClick={() => setLabelToPublish(lbl)}
                            className="px-2.5 py-1 bg-[#002B49] hover:bg-[#001D33] text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
                            title="กดเพื่อเผยแพร่ฉลากสู่สาธารณะ"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>เผยแพร่ (Publish)</span>
                          </button>
                        )}

                        {/* Create new version button for Published state */}
                        {lbl.status === 'published' && (
                          <button
                            onClick={() => handleCreateNewVersion(lbl)}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                            title="สร้างเวอร์ชันใหม่ (v2.0) เมื่อมีการปรับปรุงสูตรหรือฉลาก"
                          >
                            <PlusCircle className="w-3 h-3 text-indigo-700" />
                            <span>v{lbl.version + 1}.0</span>
                          </button>
                        )}

                        {/* Edit Button */}
                        <Link
                          to={`/entrepreneur/labels/${lbl.id}/edit`}
                          className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="แก้ไขรายละเอียดฉลาก"
                        >
                          <FileEdit className="w-4 h-4" />
                        </Link>

                        {/* Timeline & History Button */}
                        <button
                          onClick={() => setTimelineLabel(lbl)}
                          className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition"
                          title="ดูประวัติการดำเนินงาน (Timeline)"
                        >
                          <Clock className="w-4 h-4" />
                        </button>

                        {/* Version Diff Button */}
                        <button
                          onClick={() => setDiffLabel(lbl)}
                          className="p-1.5 text-slate-500 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition"
                          title="เปรียบเทียบเวอร์ชัน (Version Diff)"
                        >
                          <GitCompare className="w-4 h-4" />
                        </button>

                        {/* QR Code button */}
                        {prod && (
                          <button
                            onClick={() => setSelectedForQR({ product: prod, label: lbl })}
                            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="จัดการและดาวน์โหลด QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        )}

                        {/* Public Link */}
                        {prod && (
                          <a
                            href={`/verify/${prod.newcode}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="ดูตัวอย่างฉลากมุมมองประชาชน"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish Confirmation Dialog */}
      {labelToPublish && (
        <ConfirmDialog
          isOpen={!!labelToPublish}
          onClose={() => setLabelToPublish(null)}
          onConfirm={() => handlePublish(labelToPublish)}
          title="ยืนยันการเผยแพร่ฉลากดิจิทัลสู่สาธารณะ?"
          message={`ผลิตภัณฑ์ "${labelToPublish.titleTh}" ผ่านการอนุมัติเนื้อหาจากเจ้าหน้าที่ อย. แล้ว การกดเผยแพร่จะทำให้ QR Code บนบรรจุภัณฑ์มีผลใช้งานจริง และประชาชนสามารถสแกนตรวจสอบได้ทันที`}
          confirmText="เผยแพร่สู่สาธารณะ"
          variant="success"
        />
      )}

      {/* Timeline Modal */}
      {timelineLabel && (
        <Modal
          isOpen={!!timelineLabel}
          onClose={() => setTimelineLabel(null)}
          title="ประวัติและสถานะการดำเนินงานคำขอ (Workflow Timeline)"
          subtitle={`คำขอฉลาก: ${timelineLabel.titleTh}`}
          maxWidth="2xl"
        >
          <div className="py-2">
            <TimelineView
              events={storage.getTimelineForLabel(timelineLabel.id)}
              currentVersion={timelineLabel.version}
            />
          </div>
        </Modal>
      )}

      {/* Version Diff Modal */}
      {diffLabel && (
        <VersionDiffModal
          isOpen={!!diffLabel}
          onClose={() => setDiffLabel(null)}
          currentLabel={diffLabel}
          versions={storage.getLabelVersions(diffLabel.id)}
        />
      )}

      {/* QR Code Modal */}
      {selectedForQR && (
        <QRModal
          isOpen={!!selectedForQR}
          onClose={() => setSelectedForQR(null)}
          product={selectedForQR.product}
          label={selectedForQR.label}
        />
      )}
    </div>
  );
};
