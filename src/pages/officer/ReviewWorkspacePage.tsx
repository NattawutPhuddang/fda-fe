import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import { 
  DigitalLabel, 
  Product, 
  ReviewChecklistItem, 
  LabelStatus, 
  DigitalLabelVersionRecord,
  LabelTimelineEvent,
  UserRole
} from '../../services/types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PDFViewerModal } from '../../components/common/PDFViewerModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LabelDiffModal } from '../../components/officer/LabelDiffModal';
import { Modal } from '../../components/common/Modal';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Save, 
  Globe, 
  FileText, 
  ArrowLeft, 
  Eye, 
  Building2, 
  Calendar, 
  MapPin, 
  UserCheck, 
  HelpCircle,
  GitCompare,
  History,
  Lock,
  UploadCloud,
  FileSpreadsheet,
  Check,
  X,
  Clock,
  ArrowRight
} from 'lucide-react';

export const ReviewWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, role } = useAuth();
  const { success, warning, error, info } = useToast();

  const [label, setLabel] = useState<DigitalLabel | undefined>(undefined);
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [checklist, setChecklist] = useState<ReviewChecklistItem[]>([]);
  const [timeline, setTimeline] = useState<LabelTimelineEvent[]>([]);
  const [previousVersion, setPreviousVersion] = useState<DigitalLabelVersionRecord | null>(null);

  // Modal Controls
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [selectedDocName, setSelectedDocName] = useState('เอกสารกำกับผลิตภัณฑ์.pdf');

  // Revision Modal State
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionSummary, setRevisionSummary] = useState('');
  const [revisionAttachmentName, setRevisionAttachmentName] = useState('');

  // Rejection & Suspension Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionOrderNo, setSuspensionOrderNo] = useState('');
  const [suspensionEffectiveDate, setSuspensionEffectiveDate] = useState(new Date().toISOString().slice(0, 10));

  // Generic Confirmation Dialog
  const [actionConfirm, setActionConfirm] = useState<{
    action: 'APPROVE' | 'PUBLISH';
    title: string;
    message: string;
    variant: 'primary' | 'success' | 'warning' | 'danger';
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    const lbl = storage.getLabelById(id);
    setLabel(lbl);
    if (lbl) {
      const prod = storage.getProductById(lbl.productId);
      setProduct(prod);

      // Load checklist tailored to product category
      const items = storage.getChecklistForLabel(lbl.id, prod?.category);
      setChecklist(items);

      // Load timeline
      setTimeline(storage.getTimelineForLabel(lbl.id));

      // Load previous version snapshot for diff comparison
      const versions = storage.getLabelVersions(lbl.id);
      if (versions.length > 0) {
        setPreviousVersion(versions[0]);
      } else {
        // Create an initial version snapshot if none exists for demo comparison
        const mockPrev: DigitalLabelVersionRecord = {
          id: `ver-${lbl.id}-v1-seed`,
          labelId: lbl.id,
          version: Math.max(1, lbl.version - 1),
          titleTh: lbl.titleTh + ' (ฉบับก่อนแก้ไข)',
          titleEn: lbl.titleEn,
          status: 'revision_required',
          snapshot: {
            ...lbl,
            version: Math.max(1, lbl.version - 1),
            titleTh: lbl.titleTh + ' (สูตรผสมวิตามินซีเข้มข้น)',
            generalWarningTh: 'ข้อความคำเตือนเดิม: เด็กและสตรีมีครรภ์ไม่ควรรับประทาน (ยังไม่ระบุขนาดรับประทาน)'
          },
          changeLog: 'คำขอฉบับแรกก่อนเจ้าหน้าที่ อย. สั่งส่งกลับแก้ไข',
          changedByName: 'ผู้ประกอบการ',
          changedByRole: 'entrepreneur',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
        };
        setPreviousVersion(mockPrev);
      }
    }
  }, [id]);

  if (!label || !product) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">ไม่พบคำขอฉลากนี้ในระบบ</h3>
        <Link to="/officer/queue" className="mt-4 inline-block text-xs text-blue-700 hover:underline">
          กลับสู่คิวงานตรวจสอบ
        </Link>
      </div>
    );
  }

  // --- ROLE CAPABILITIES ---
  // The existing 'officer' (and admin) role has full capabilities to review, request revision, approve, and suspend
  const canReviewChecklist = role === 'officer' || role === 'admin';
  const canRequestRevision = role === 'officer' || role === 'admin';
  const canApproveOrReject = role === 'officer' || role === 'admin';
  const canSuspend = role === 'officer' || role === 'admin';

  // Checklist Item State Change: 'pending' | 'passed' | 'failed' | 'revision_needed'
  const handleSetItemStatus = (itemId: string, status: 'passed' | 'failed' | 'revision_needed') => {
    if (!canReviewChecklist) {
      warning('สิทธิ์การตรวจประเมิน Checklist สงวนไว้สำหรับ "เจ้าหน้าที่ผู้ตรวจสอบ (Reviewer)"');
      return;
    }
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, status, passed: status === 'passed' }
          : item
      )
    );
  };

  // Checklist Item Note Change
  const handleItemNoteChange = (itemId: string, notes: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  // Save Progress
  const handleSaveProgress = () => {
    storage.saveChecklistForLabel(label.id, checklist);
    storage.addAuditLog({
      userId: currentUser?.id || 'officer',
      userName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
      userRole: currentUser?.role || 'officer',
      action: 'SAVE_CHECKLIST_PROGRESS',
      resourceType: 'DIGITAL_LABEL',
      resourceId: label.id,
      result: 'SUCCESS',
      details: `บันทึกความคืบหน้า Checklist: ${checklist.filter(c => c.status === 'passed').length}/${checklist.length} ผ่าน`
    });
    success('บันทึกความคืบหน้าการตรวจประเมิน Checklist เรียบร้อยแล้ว');
  };

  // Execute Approve Action
  const handleApprove = () => {
    if (!canApproveOrReject) {
      warning('ท่านไม่มีสิทธิ์อนุมัติคำขอ (สงวนสิทธิ์เฉพาะผู้มีอำนาจอนุมัติ Approver)');
      return;
    }

    // Guardrail: Checklist Must be Complete
    const uninspected = checklist.filter(c => c.status === 'pending');
    if (uninspected.length > 0) {
      warning(`ไม่สามารถอนุมัติได้: ยังมีหัวข้อ Checklist ที่ยังไม่ได้ตรวจ ${uninspected.length} ข้อ`);
      return;
    }

    const failedItems = checklist.filter(c => c.status === 'failed' || c.status === 'revision_needed');
    if (failedItems.length > 0) {
      warning(`ไม่สามารถอนุมัติได้: พบหัวข้อที่ไม่ผ่านหรือต้องแก้ไข ${failedItems.length} ข้อ`);
      return;
    }

    const updated: DigitalLabel = {
      ...label,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storage.saveLabel(updated, currentUser || undefined);
    storage.saveChecklistForLabel(label.id, checklist);
    setLabel(updated);

    // Timeline
    const event = storage.addTimelineEvent({
      labelId: label.id,
      version: label.version,
      actorName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
      actorRole: currentUser?.role || 'officer',
      action: 'APPROVE',
      status: 'approved',
      notes: `อนุมัติคำขอฉลากดิจิทัลเรียบร้อยแล้ว ผ่านเกณฑ์ Checklist ครบทั้ง ${checklist.length} ข้อ`
    });
    setTimeline(prev => [...prev, event]);

    // Audit Log
    storage.addAuditLog({
      userId: currentUser?.id || 'officer',
      userName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
      userRole: currentUser?.role || 'officer',
      action: 'APPROVE_LABEL',
      resourceType: 'DIGITAL_LABEL',
      resourceId: label.id,
      result: 'SUCCESS',
      details: `อนุมัติคำขอฉลาก: ${product.productNameTh} (${product.regNumber}) ผ่านเกณฑ์ครบถ้วน`
    });

    // Notify entrepreneur
    storage.addNotification({
      userId: product.entrepreneurId,
      title: 'คำขอฉลากได้รับการอนุมัติแล้ว',
      message: `ฉลากดิจิทัล "${product.productNameTh}" ได้รับการอนุมัติแล้ว ท่านสามารถกดเผยแพร่สู่สาธารณะได้ทันที`,
      type: 'success',
      link: '/entrepreneur/labels'
    });

    success(`อนุมัติคำขอฉลาก "${product.productNameTh}" เรียบร้อยแล้ว (สถานะ: Approved)`);
    setActionConfirm(null);
  };

  // Execute Request Revision
  const handleExecuteRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRequestRevision) {
      warning('ท่านไม่มีสิทธิ์ส่งกลับแก้ไข (สงวนสิทธิ์เฉพาะผู้พิจารณา Evaluator)');
      return;
    }

    if (!revisionSummary.trim()) {
      warning('กรุณาระบุข้อความสรุปสิ่งที่ต้องการให้ผู้ประกอบการแก้ไข');
      return;
    }

    // Gather per-issue failure notes
    const failedNotes = checklist
      .filter(c => c.status === 'failed' || c.status === 'revision_needed')
      .map(c => `• [${c.title}]: ${c.notes || 'ไม่ผ่านเกณฑ์มาตรฐาน'}`)
      .join('\n');

    const fullRevisionNotes = `${revisionSummary}\n\nรายการข้อผิดพลาดรายข้อ:\n${failedNotes || '- ให้ตรวจสอบตามระเบียบ อย.'}`;

    const updated: DigitalLabel = {
      ...label,
      status: 'revision_required',
      revisionNotes: fullRevisionNotes,
      revisionAttachmentName: revisionAttachmentName || undefined,
      revisionAttachmentUrl: revisionAttachmentName ? '/sample-evidence.pdf' : undefined,
      updatedAt: new Date().toISOString()
    };

    storage.saveLabel(updated, currentUser || undefined);
    storage.saveChecklistForLabel(label.id, checklist);
    setLabel(updated);

    // Timeline
    const event = storage.addTimelineEvent({
      labelId: label.id,
      version: label.version,
      actorName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
      actorRole: currentUser?.role || 'officer',
      action: 'REQUEST_REVISION',
      status: 'revision_required',
      notes: fullRevisionNotes
    });
    setTimeline(prev => [...prev, event]);

    // Audit Log
    storage.addAuditLog({
      userId: currentUser?.id || 'officer',
      userName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
      userRole: currentUser?.role || 'officer',
      action: 'REQUEST_REVISION',
      resourceType: 'DIGITAL_LABEL',
      resourceId: label.id,
      result: 'SUCCESS',
      details: `ส่งกลับแก้ไขคำขอฉลาก: ${product.productNameTh} พร้อมระบุข้อผิดพลาด ${checklist.filter(c => c.status !== 'passed').length} ข้อ`
    });

    // Notify entrepreneur
    storage.addNotification({
      userId: product.entrepreneurId,
      title: 'คำขอฉลากถูกส่งกลับแก้ไข (Revision Required)',
      message: `เจ้าหน้าที่ อย. ตรวจพบข้อบกพร่องในคำขอ "${product.productNameTh}" กรุณาตรวจสอบข้อสังเกตและส่งข้อมูลใหม่`,
      type: 'warning',
      link: `/entrepreneur/labels/${label.id}/edit`
    });

    success('ส่งคำขอกลับแก้ไข (Revision Required) ไปยังผู้ประกอบการเรียบร้อยแล้ว');
    setIsRevisionModalOpen(false);
  };

  // Execute Rejection
  const handleExecuteReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canApproveOrReject) {
      warning('ท่านไม่มีสิทธิ์ไม่อนุมัติคำขอ (สงวนสิทธิ์เฉพาะผู้มีอำนาจอนุมัติ Approver)');
      return;
    }

    if (!rejectionReason.trim()) {
      warning('กรุณาระบุเหตุผลการไม่อนุมัติคำขอ');
      return;
    }

    const updated: DigitalLabel = {
      ...label,
      status: 'rejected',
      revisionNotes: rejectionReason,
      updatedAt: new Date().toISOString()
    };

    storage.saveLabel(updated, currentUser || undefined);
    setLabel(updated);

    // Timeline
    const event = storage.addTimelineEvent({
      labelId: label.id,
      version: label.version,
      actorName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
      actorRole: currentUser?.role || 'officer',
      action: 'REJECT',
      status: 'rejected',
      notes: `ไม่อนุมัติคำขอ: ${rejectionReason}`
    });
    setTimeline(prev => [...prev, event]);

    // Audit Log
    storage.addAuditLog({
      userId: currentUser?.id || 'officer',
      userName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
      userRole: currentUser?.role || 'officer',
      action: 'REJECT_LABEL',
      resourceType: 'DIGITAL_LABEL',
      resourceId: label.id,
      result: 'SUCCESS',
      details: `ไม่อนุมัติคำขอฉลาก: ${product.productNameTh} เหตุผล: ${rejectionReason}`
    });

    success('บันทึกผลการไม่อนุมัติคำขอเรียบร้อยแล้ว');
    setIsRejectModalOpen(false);
  };

  // Execute Suspension
  const handleExecuteSuspend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSuspend) {
      warning('ท่านไม่มีสิทธิ์สั่งระงับฉลาก (สงวนสิทธิ์เฉพาะผู้มีอำนาจอนุมัติ Approver และ Admin)');
      return;
    }

    if (!suspensionReason.trim() || !suspensionOrderNo.trim()) {
      warning('กรุณาระบุเหตุผลและเลขที่คำสั่งระงับฉลากให้ครบถ้วน');
      return;
    }

    const updated: DigitalLabel = {
      ...label,
      status: 'suspended',
      suspendedReason: suspensionReason,
      updatedAt: new Date().toISOString()
    };
    storage.saveLabel(updated, currentUser || undefined);
    setLabel(updated);

    // Save Suspension Record
    storage.saveSuspension({
      id: `susp-${Date.now()}`,
      labelId: label.id,
      productId: product.id,
      productNameTh: product.productNameTh,
      regNumber: product.regNumber,
      action: 'SUSPEND',
      reason: suspensionReason,
      orderNumber: suspensionOrderNo,
      effectiveDate: suspensionEffectiveDate,
      authorizedSignatory: currentUser?.fullName || 'คณะกรรมการ อย.',
      officerId: currentUser?.id || 'officer',
      officerName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
      timestamp: new Date().toISOString()
    });

    // Timeline
    const event = storage.addTimelineEvent({
      labelId: label.id,
      version: label.version,
      actorName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
      actorRole: currentUser?.role || 'officer',
      action: 'SUSPEND',
      status: 'suspended',
      notes: `คำสั่งระงับฉลาก เลขที่ ${suspensionOrderNo} เหตุผล: ${suspensionReason}`
    });
    setTimeline(prev => [...prev, event]);

    // Audit Log
    storage.addAuditLog({
      userId: currentUser?.id || 'officer',
      userName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
      userRole: currentUser?.role || 'officer',
      action: 'SUSPEND_LABEL',
      resourceType: 'DIGITAL_LABEL',
      resourceId: label.id,
      result: 'SUCCESS',
      details: `สั่งระงับฉลาก: ${product.productNameTh} คำสั่งเลขที่ ${suspensionOrderNo}`
    });

    success(`สั่งระงับการเผยแพร่ฉลาก "${product.productNameTh}" เรียบร้อยแล้ว`);
    setIsSuspendModalOpen(false);
  };

  const allPassed = checklist.length > 0 && checklist.every(c => c.status === 'passed');
  const pendingCount = checklist.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'คิวงานพิจารณาคำขอ', path: '/officer/queue' },
          { label: `ห้องพิจารณาคำขอ: ${product.regNumber}` }
        ]}
      />

      {/* Top Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {product.regNumber}
            </span>
            <StatusBadge status={label.status} />
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
              v{label.version}.0
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">{product.productNameTh}</h2>
          <p className="text-xs text-slate-500">
            ยื่นขอโดย: <strong className="text-slate-800">{product.entrepreneurName}</strong> | ผู้รับผิดชอบ: <strong className="text-blue-900">{label.currentOfficerName || 'ยังไม่มีผู้รับเรื่อง'}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Diff Button */}
          <button
            onClick={() => setIsDiffOpen(true)}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            title="เปรียบเทียบข้อมูลฉลากเดิมกับฉลากใหม่ที่แก้ไขกลับมา"
          >
            <GitCompare className="w-4 h-4 text-indigo-700" />
            <span>เปรียบเทียบข้อมูล (Diff)</span>
          </button>

          <a
            href={`/verify/${product.newcode}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>ดูหน้าฉลากประชาชน</span>
          </a>
        </div>
      </div>

      {/* Role Notice Banner */}
      <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>
            บทบาทปัจจุบัน: <strong>{role}</strong> | สิทธิ์ที่ปฏิบัติได้: {canReviewChecklist && 'ตรวจ Checklist | '}{canRequestRevision && 'ส่งกลับแก้ไข | '}{canApproveOrReject && 'อนุมัติ / ไม่อนุมัติ | '}{canSuspend && 'สั่งระงับฉลาก'}
          </span>
        </div>
        <span className="text-[11px] text-slate-400">ควบคุมสิทธิ์ตามมาตรฐาน RBAC อย.</span>
      </div>

      {/* TWO-COLUMN REVIEW WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PRODUCT & LABEL DATA (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Master Registration Data */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-900" />
                <h3 className="font-bold text-sm text-slate-900">ข้อมูลทะเบียนอ้างอิง e-Submission</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                Ref: {product.eSubmissionRef}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">ชื่อผลิตภัณฑ์ (ไทย):</span>
                <strong className="text-slate-900">{product.productNameTh}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Product Name (EN):</span>
                <strong className="text-slate-900">{product.productNameEn}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Newcode:</span>
                <span className="font-mono text-slate-700 text-[11px] truncate block">{product.newcode}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">หมวดหมู่:</span>
                <span className="text-slate-800">{product.categoryNameTh}</span>
              </div>
              <div className="col-span-2 pt-2 border-t">
                <span className="text-slate-400 block text-[11px]">สถานที่ผลิต:</span>
                <span className="text-slate-700">{product.manufacturerAddress}</span>
              </div>
            </div>
          </div>

          {/* Digital Label Content & Image */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">เนื้อหาฉลากดิจิทัลที่ยื่นขออนุมัติ</h3>
              <span className="text-xs font-semibold text-slate-500">เวอร์ชัน {label.version}.0</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-32 h-32 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 p-1">
                <img src={label.imageUrl} alt="Packaging" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-2 text-xs flex-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">ชื่อฉลาก:</span>
                  <p className="font-bold text-slate-900 text-sm">{label.titleTh}</p>
                  <p className="text-slate-500 italic">{label.titleEn}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">คำบรรยายและสรรพคุณ:</span>
                  <p className="text-slate-700 leading-relaxed">{label.descriptionTh}</p>
                </div>
              </div>
            </div>

            {/* Warnings */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
              <strong className="block font-semibold">ข้อความคำเตือน:</strong>
              <p>{label.generalWarningTh}</p>
            </div>

            {/* Category Details */}
            {label.drugDetails && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <strong className="block text-slate-900">ข้อมูลยา:</strong>
                <p><strong>ข้อบ่งใช้:</strong> {label.drugDetails.indications}</p>
                <p><strong>วิธีใช้:</strong> {label.drugDetails.dosageAndAdministration}</p>
                <p><strong>ข้อห้ามใช้:</strong> {label.drugDetails.contraindications}</p>
              </div>
            )}

            {label.foodDetails && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <strong className="block text-slate-900">ข้อมูลอาหาร:</strong>
                <p><strong>ส่วนประกอบสำคัญ:</strong> {label.foodDetails.ingredientsWithPercent}</p>
                <p><strong>ข้อมูลผู้แพ้อาหาร:</strong> {label.foodDetails.allergenInfo}</p>
              </div>
            )}
          </div>

          {/* Supporting Documents & Leaflet PDF */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-3">เอกสารหลักฐานประกอบ (PDF Attached)</h3>
            <div className="space-y-2">
              {label.documents.map(doc => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-600" />
                    <div>
                      <p className="font-semibold text-slate-800">{doc.name}</p>
                      <span className="text-[10px] text-slate-400">{doc.size}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDocName(doc.name);
                      setIsPdfOpen(true);
                    }}
                    className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-medium transition"
                  >
                    เปิดอ่าน PDF ในเว็บ
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline History Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <History className="w-4 h-4 text-blue-900" />
              <h3 className="font-bold text-sm text-slate-900">ประวัติการดำเนินงานและ Timeline คำขอ</h3>
            </div>

            <div className="space-y-3">
              {timeline.length === 0 ? (
                <p className="text-xs text-slate-400">ยังไม่มีประวัติการดำเนินการ</p>
              ) : (
                timeline.map((event, idx) => (
                  <div key={event.id || idx} className="flex gap-3 text-xs items-start">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-900 mt-1 flex-shrink-0" />
                    <div className="flex-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800">{event.actorName} ({event.actorRole})</strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(event.timestamp).toLocaleString('th-TH')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                          {event.action}
                        </span>
                        <StatusBadge status={event.status} size="sm" />
                      </div>
                      {event.notes && (
                        <p className="text-slate-600 text-[11px] whitespace-pre-line mt-1 bg-white p-2 rounded border border-slate-100">
                          {event.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REVIEW CHECKLIST & DECISION CONTROLS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6 sticky top-20">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-900" />
                <h3 className="font-bold text-sm text-slate-900">Checklist การตรวจสอบโดย อย.</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                allPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {checklist.filter(c => c.status === 'passed').length}/{checklist.length} ผ่าน
              </span>
            </div>

            {/* Checklist Validation Warning */}
            {pendingCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">ยังมีหัวข้อที่ยังไม่ได้ตรวจ ({pendingCount} ข้อ)</strong>
                  <span className="text-[11px] text-amber-800">
                    เจ้าหน้าที่ผู้ตรวจสอบต้องตรวจและเลือกสถานะ (ผ่าน/ไม่ผ่าน/ต้องแก้ไข) ให้ครบทุกข้อก่อนการอนุมัติ
                  </span>
                </div>
              </div>
            )}

            {/* Checklist Items with 3 Status Choices & Note Field */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {checklist.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                    item.status === 'passed'
                      ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950'
                      : item.status === 'failed'
                      ? 'border-rose-300 bg-rose-50/40 text-rose-950'
                      : item.status === 'revision_needed'
                      ? 'border-amber-300 bg-amber-50/40 text-amber-950'
                      : 'border-slate-200 bg-slate-50/60 text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">ข้อที่ {idx + 1}: {item.title}</span>
                        {item.isRequired && (
                          <span className="text-[9px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            บังคับ
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  {/* 3 Status Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      disabled={!canReviewChecklist}
                      onClick={() => handleSetItemStatus(item.id, 'passed')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition flex items-center justify-center gap-1 ${
                        item.status === 'passed'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>ผ่าน</span>
                    </button>

                    <button
                      type="button"
                      disabled={!canReviewChecklist}
                      onClick={() => handleSetItemStatus(item.id, 'revision_needed')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition flex items-center justify-center gap-1 ${
                        item.status === 'revision_needed'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>ต้องแก้ไข</span>
                    </button>

                    <button
                      type="button"
                      disabled={!canReviewChecklist}
                      onClick={() => handleSetItemStatus(item.id, 'failed')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition flex items-center justify-center gap-1 ${
                        item.status === 'failed'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>ไม่ผ่าน</span>
                    </button>
                  </div>

                  {/* Per-item Observation / Remarks */}
                  <div>
                    <input
                      type="text"
                      disabled={!canReviewChecklist}
                      value={item.notes || ''}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      placeholder="บันทึกข้อสังเกตหรือสิ่งที่ต้องแก้ไขในข้อนี้..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Save Progress Button */}
            {canReviewChecklist && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveProgress}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกความคืบหน้า Checklist</span>
                </button>
              </div>
            )}

            {/* Action Decisions Form Toolbar */}
            <div className="pt-4 border-t space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                การตัดสินผลการพิจารณา (Regulatory Actions)
              </h4>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Approve Button */}
                  <button
                    disabled={!canApproveOrReject}
                    onClick={() =>
                      setActionConfirm({
                        action: 'APPROVE',
                        title: 'ยืนยันการอนุมัติคำขอฉลาก?',
                        message: `ยืนยันว่าผลิตภัณฑ์ "${product.productNameTh}" ผ่านเกณฑ์การตรวจประเมินฉลากดิจิทัลครบทุกข้อ หลังจากอนุมัติแล้วผู้ประกอบการจะสามารถกดเผยแพร่ (Publish) สู่สาธารณะได้`,
                        variant: 'success'
                      })
                    }
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 ${
                      canApproveOrReject
                        ? 'bg-[#002B49] hover:bg-[#001D33] text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    title={!canApproveOrReject ? 'สิทธิ์เฉพาะผู้มีอำนาจอนุมัติ (Approver)' : undefined}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>อนุมัติ (Approve)</span>
                  </button>

                  {/* Request Revision Button */}
                  <button
                    disabled={!canRequestRevision}
                    onClick={() => setIsRevisionModalOpen(true)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 ${
                      canRequestRevision
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    title={!canRequestRevision ? 'สิทธิ์เฉพาะผู้พิจารณา (Evaluator)' : undefined}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>ส่งกลับแก้ไข</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Reject Button */}
                  <button
                    disabled={!canApproveOrReject}
                    onClick={() => setIsRejectModalOpen(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1 ${
                      canApproveOrReject
                        ? 'bg-slate-50 hover:bg-rose-50 text-rose-700 border-slate-200 hover:border-rose-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                    title={!canApproveOrReject ? 'สิทธิ์เฉพาะผู้มีอำนาจอนุมัติ (Approver)' : undefined}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>ไม่อนุมัติ (Reject)</span>
                  </button>

                  {/* Suspend Button */}
                  <button
                    disabled={!canSuspend}
                    onClick={() => setIsSuspendModalOpen(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                      canSuspend
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    title={!canSuspend ? 'สิทธิ์เฉพาะผู้มีอำนาจอนุมัติ (Approver) และ Admin' : undefined}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>สั่งระงับฉลาก</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Request Revision Dialog with Evidence Upload */}
      <Modal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title="ส่งกลับแก้ไขคำขอฉลาก (Request Revision)"
        maxWidth="xl"
      >
        <form onSubmit={handleExecuteRevision} className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
            <strong className="block font-semibold">ข้อสังเกตจากหัวข้อ Checklist ที่ไม่ผ่าน:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-amber-900">
              {checklist
                .filter(c => c.status === 'failed' || c.status === 'revision_needed')
                .map(c => (
                  <li key={c.id}>
                    <strong>{c.title}:</strong> {c.notes || 'ยังไม่เป็นไปตามเกณฑ์'}
                  </li>
                ))}
              {checklist.filter(c => c.status === 'failed' || c.status === 'revision_needed').length === 0 && (
                <li className="italic text-slate-500">ไม่มีหัวข้อ Checklist ที่ระบุว่าไม่ผ่าน (กรุณาระบุคำแนะนำด้านล่าง)</li>
              )}
            </ul>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              คำอธิบายรายละเอียดข้อผิดพลาดและคำแนะนำในการแก้ไข (บังคับ):
            </label>
            <textarea
              rows={4}
              required
              value={revisionSummary}
              onChange={e => setRevisionSummary(e.target.value)}
              placeholder="ระบุสิ่งที่ผู้ประกอบการต้องดำเนินการแก้ไขอย่างละเอียด เช่น ปรับลดข้อความโฆษณาในส่วนบรรยาย, แนบผลแล็บฉบับล่าสุด..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Evidence Attachment Upload Simulation */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-blue-900" />
                แนบหลักฐาน / เอกสารอธิบายเพิ่มเติมจาก อย. (ถ้ามี):
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={revisionAttachmentName}
                onChange={e => setRevisionAttachmentName(e.target.value)}
                placeholder="เช่น เอกสารชี้แจงเกณฑ์ข้อความโฆษณา_อย.pdf"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setRevisionAttachmentName('แนวทางการแก้ไขข้อความโฆษณา_อย.pdf')}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                เลือกไฟล์จำลอง
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsRevisionModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              ยืนยันส่งกลับแก้ไข
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Rejection Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="ไม่อนุมัติคำขอฉลากดิจิทัล (Reject Application)"
        maxWidth="lg"
      >
        <form onSubmit={handleExecuteReject} className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950">
            คำขอนี้จะถูกปฏิเสธและไม่สามารถดำเนินการต่อได้ กรุณาระบุเหตุผลทางกฎหมายที่ชัดเจน
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เหตุผลการไม่อนุมัติคำขอ:
            </label>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="ระบุเหตุผล เช่น ไม่ผ่านเกณฑ์ความปลอดภัยขั้นวิกฤต, เอกสารปลอมแปลง..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              ยืนยันไม่อนุมัติ
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Suspension Modal with Order No & Effective Date */}
      <Modal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        title="คำสั่งระงับฉลากผลิตภัณฑ์ (Product Label Suspension)"
        maxWidth="lg"
      >
        <form onSubmit={handleExecuteSuspend} className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950 space-y-1">
            <strong className="block font-semibold">อำนาจตาม พ.ร.บ. อาหารและยา:</strong>
            <p>
              การสั่งระงับฉลากจะมีผลให้ประชาชนที่สแกน QR Code เห็นการแจ้งเตือนอันตรายสีแดงทันทีแบบ Real-time
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                เลขที่คำสั่ง อย. / เอกสารอ้างอิง:
              </label>
              <input
                type="text"
                required
                value={suspensionOrderNo}
                onChange={e => setSuspensionOrderNo(e.target.value)}
                placeholder="เช่น อย. ๑๐๐๒/๒๕๖๙"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                วันที่มีผลบังคับใช้:
              </label>
              <input
                type="date"
                required
                value={suspensionEffectiveDate}
                onChange={e => setSuspensionEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เหตุผลคำสั่งระงับฉลาก:
            </label>
            <textarea
              rows={3}
              required
              value={suspensionReason}
              onChange={e => setSuspensionReason(e.target.value)}
              placeholder="ระบุข้อเท็จจริง เช่น ตรวจพบสารปนเปื้อนเกินมาตรฐาน, มีคำสั่งเรียกเก็บคืนสินค้า (Recall)..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsSuspendModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              ยืนยันคำสั่งระงับฉลาก
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Diff Comparison Modal */}
      <LabelDiffModal
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        currentLabel={label}
        previousVersion={previousVersion}
        product={product}
      />

      {/* PDF Leaflet Modal */}
      <PDFViewerModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        title="เอกสารกำกับและผลแล็บประกอบการพิจารณา"
        documentName={selectedDocName}
      />

      {/* Action Confirmation Dialog for Approve */}
      {actionConfirm && (
        <ConfirmDialog
          isOpen={!!actionConfirm}
          onClose={() => setActionConfirm(null)}
          onConfirm={handleApprove}
          title={actionConfirm.title}
          message={actionConfirm.message}
          confirmText="ยืนยันการอนุมัติ"
          variant={actionConfirm.variant}
        />
      )}
    </div>
  );
};
