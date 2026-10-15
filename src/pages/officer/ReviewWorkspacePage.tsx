import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import { DigitalLabel, Product, ReviewChecklistItem, LabelStatus } from '../../services/types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PDFViewerModal } from '../../components/common/PDFViewerModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
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
  HelpCircle 
} from 'lucide-react';

export const ReviewWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { success, warning, error, info } = useToast();

  const [label, setLabel] = useState<DigitalLabel | undefined>(undefined);
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [checklist, setChecklist] = useState<ReviewChecklistItem[]>([]);
  const [officerNotes, setOfficerNotes] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');

  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [selectedDocName, setSelectedDocName] = useState('เอกสารกำกับผลิตภัณฑ์.pdf');

  // Confirmation dialogs
  const [actionConfirm, setActionConfirm] = useState<{
    action: 'APPROVE' | 'REQUEST_REVISION' | 'REJECT' | 'SUSPEND' | 'PUBLISH';
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
      const items = storage.getChecklistForLabel(lbl.id);
      setChecklist(items);
      setOfficerNotes(lbl.revisionNotes || '');
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

  // Toggle checklist item
  const handleToggleChecklist = (itemId: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === itemId ? { ...item, passed: !item.passed } : item))
    );
  };

  // Claim request
  const handleClaim = () => {
    const updated: DigitalLabel = {
      ...label,
      status: 'in_review',
      currentOfficerId: currentUser?.id,
      currentOfficerName: currentUser?.fullName,
      updatedAt: new Date().toISOString()
    };
    storage.saveLabel(updated, currentUser || undefined);
    storage.saveChecklistForLabel(label.id, checklist);
    setLabel(updated);

    storage.addAuditLog({
      userId: currentUser?.id || 'officer',
      userName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
      userRole: 'officer',
      action: 'CLAIM_REQUEST',
      resourceType: 'DIGITAL_LABEL',
      resourceId: label.id,
      result: 'SUCCESS',
      details: `รับเรื่องพิจารณาคำขอฉลาก: ${product.productNameTh} (${product.regNumber})`
    });

    success('รับเรื่องพิจารณาคำขอแล้ว (สถานะ: อยู่ระหว่างการพิจารณา)');
  };

  // Save draft progress
  const handleSaveProgress = () => {
    storage.saveChecklistForLabel(label.id, checklist);
    const updated: DigitalLabel = {
      ...label,
      revisionNotes: officerNotes,
      updatedAt: new Date().toISOString()
    };
    storage.saveLabel(updated, currentUser || undefined);
    setLabel(updated);
    success('บันทึกความคืบหน้าการตรวจสอบ Checklist เรียบร้อยแล้ว');
  };

  // Execute workflow transitions
  const executeAction = () => {
    if (!actionConfirm) return;
    const { action } = actionConfirm;

    let targetStatus: LabelStatus = label.status;
    let auditAction = '';
    let auditDetails = '';

    if (action === 'APPROVE') {
      const allPassed = checklist.every(c => c.passed);
      if (!allPassed) {
        warning('มีรายการ Checklist ที่ยังไม่ผ่านการตรวจสอบ กรุณาตรวจสอบให้ครบทุกข้อก่อนอนุมัติ');
        return;
      }
      targetStatus = 'approved';
      auditAction = 'APPROVE_LABEL';
      auditDetails = `อนุมัติคำขอฉลากดิจิทัล: ${product.productNameTh} ผ่าน Checklist ครบ ${checklist.length} ข้อ`;
    } else if (action === 'REQUEST_REVISION') {
      if (!revisionNotes.trim()) {
        warning('กรุณาระบุเหตุผลและข้อความที่ต้องการให้ผู้ประกอบการส่งกลับแก้ไข');
        return;
      }
      targetStatus = 'revision_required';
      auditAction = 'REQUEST_REVISION';
      auditDetails = `ส่งกลับแก้ไขคำขอฉลาก: ${revisionNotes}`;
    } else if (action === 'REJECT') {
      if (!rejectionReason.trim()) {
        warning('กรุณาระบุเหตุผลการไม่อนุมัติคำขอฉลาก');
        return;
      }
      targetStatus = 'rejected';
      auditAction = 'REJECT_LABEL';
      auditDetails = `ไม่อนุมัติคำขอฉลาก: ${rejectionReason}`;
    } else if (action === 'SUSPEND') {
      if (!suspensionReason.trim()) {
        warning('กรุณาระบุเหตุผลคำสั่งระงับฉลากชั่วคราว');
        return;
      }
      targetStatus = 'suspended';
      auditAction = 'SUSPEND_LABEL';
      auditDetails = `มีคำสั่งระงับการเผยแพร่ฉลากชั่วคราว: ${suspensionReason}`;
    } else if (action === 'PUBLISH') {
      targetStatus = 'published';
      auditAction = 'PUBLISH_LABEL_OFFICER';
      auditDetails = `เจ้าหน้าที่เปิดเผยแพร่ฉลากดิจิทัลสู่สาธารณะโดยตรง`;
    }

    const updated: DigitalLabel = {
      ...label,
      status: targetStatus,
      revisionNotes: action === 'REQUEST_REVISION' ? revisionNotes : label.revisionNotes,
      suspendedReason: action === 'SUSPEND' ? suspensionReason : label.suspendedReason,
      approvedAt: action === 'APPROVE' ? new Date().toISOString() : label.approvedAt,
      publishedAt: action === 'PUBLISH' ? new Date().toISOString() : label.publishedAt,
      updatedAt: new Date().toISOString(),
      currentOfficerId: currentUser?.id,
      currentOfficerName: currentUser?.fullName
    };

    storage.saveLabel(updated, currentUser || undefined);
    storage.saveChecklistForLabel(label.id, checklist);
    setLabel(updated);

    storage.addAuditLog({
      userId: currentUser?.id || 'officer',
      userName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
      userRole: 'officer',
      action: auditAction,
      resourceType: 'DIGITAL_LABEL',
      resourceId: label.id,
      result: 'SUCCESS',
      details: auditDetails
    });

    success(`ดำเนินการปรับสถานะคำขอเป็น "${targetStatus}" เรียบร้อยแล้ว`);
    setActionConfirm(null);
  };

  const allChecklistPassed = checklist.length > 0 && checklist.every(c => c.passed);

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
            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate max-w-md">
              {product.productNameTh}
            </h2>
            <StatusBadge status={label.status} size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ผู้ยื่นคำขอ: <strong>{product.entrepreneurName}</strong> | ผู้รับผิดชอบปัจจุบัน: <strong>{label.currentOfficerName || 'ยังไม่กำหนด'}</strong>
          </p>
        </div>

        {/* Quick Claim or Status Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {label.status === 'pending_review' && (
            <button
              onClick={handleClaim}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>รับเรื่องพิจารณา (Claim Request)</span>
            </button>
          )}

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

            {label.cosmeticDetails && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <strong className="block text-slate-900">ส่วนประกอบเครื่องสำอาง (INCI):</strong>
                <p className="font-mono">{label.cosmeticDetails.ingredients.join(', ')}</p>
                <p><strong>วิธีใช้:</strong> {label.cosmeticDetails.usageInstructions}</p>
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
                allChecklistPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {checklist.filter(c => c.passed).length}/{checklist.length} ผ่าน
              </span>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {checklist.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs ${
                    item.passed
                      ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.passed}
                      onChange={() => {}} // handled by div click
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProgress}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>บันทึกความคืบหน้า Checklist</span>
              </button>
            </div>

            {/* Officer Action Decisions Form */}
            <div className="pt-4 border-t space-y-4">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                ผลการพิจารณาและการตัดสินใจ (Regulatory Decision)
              </h4>

              {/* Revision remarks input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  ข้อเสนอแนะในการส่งกลับแก้ไข (กรณีไม่ผ่าน):
                </label>
                <textarea
                  rows={2}
                  value={revisionNotes}
                  onChange={e => setRevisionNotes(e.target.value)}
                  placeholder="ระบุข้อความที่ต้องปรับปรุง เช่น แก้ไขข้อความคำเตือน..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Action Buttons Toolbar */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Approve Button */}
                  <button
                    onClick={() =>
                      setActionConfirm({
                        action: 'APPROVE',
                        title: 'ยืนยันการอนุมัติคำขอฉลาก?',
                        message: `ยืนยันว่าผลิตภัณฑ์ "${product.productNameTh}" ผ่านเกณฑ์การตรวจประเมินฉลากดิจิทัลครบทุกข้อ หลังจากอนุมัติแล้วผู้ประกอบการจะสามารถกดเผยแพร่ (Publish) สู่สาธารณะได้`,
                        variant: 'success'
                      })
                    }
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>อนุมัติ (Approve)</span>
                  </button>

                  {/* Request Revision Button */}
                  <button
                    onClick={() =>
                      setActionConfirm({
                        action: 'REQUEST_REVISION',
                        title: 'ยืนยันการส่งกลับแก้ไข?',
                        message: `ระบบจะแจ้งเตือนผู้ประกอบการและส่งคำขอกลับไปยังสถานะ "ส่งกลับแก้ไข (Revision Required)" พร้อมข้อความข้อเสนอแนะของเจ้าหน้าที่`,
                        variant: 'warning'
                      })
                    }
                    className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>ส่งกลับแก้ไข</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Reject Button */}
                  <button
                    onClick={() => {
                      const reason = prompt('กรุณาระบุเหตุผลการไม่อนุมัติ (Reject):');
                      if (reason) {
                        setRejectionReason(reason);
                        setActionConfirm({
                          action: 'REJECT',
                          title: 'ยืนยันการไม่อนุมัติคำขอ?',
                          message: `คำขอนี้จะถูกยกเลิกถาวรด้วยเหตุผล: "${reason}"`,
                          variant: 'danger'
                        });
                      }
                    }}
                    className="py-2 px-3 bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>ไม่อนุมัติ (Reject)</span>
                  </button>

                  {/* Suspend or Publish Direct */}
                  {label.status === 'published' ? (
                    <button
                      onClick={() => {
                        const reason = prompt('กรุณาระบุเหตุผลคำสั่งระงับฉลากชั่วคราว:');
                        if (reason) {
                          setSuspensionReason(reason);
                          setActionConfirm({
                            action: 'SUSPEND',
                            title: 'ยืนยันคำสั่งระงับฉลากชั่วคราว (Suspend)?',
                            message: `การระงับจะแสดงแบนเนอร์แจ้งเตือนอันตรายสีแดงทันทีเมื่อประชาชนสแกน QR Code: "${reason}"`,
                            variant: 'danger'
                          });
                        }
                      }}
                      className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-1"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>สั่งระงับฉลาก (Suspend)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setActionConfirm({
                          action: 'PUBLISH',
                          title: 'เปิดเผยแพร่ฉลากสู่สาธารณะทันที?',
                          message: `ในฐานะเจ้าหน้าที่ อย. ท่านสามารถเปิดเผยแพร่ฉลากนี้สู่ประชาชนได้โดยตรง`,
                          variant: 'primary'
                        })
                      }
                      className="py-2 px-3 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>เปิดเผยแพร่ (Publish)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Leaflet Modal */}
      <PDFViewerModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        title="เอกสารกำกับและผลแล็บประกอบการพิจารณา"
        documentName={selectedDocName}
      />

      {/* Action Confirmation Dialog */}
      {actionConfirm && (
        <ConfirmDialog
          isOpen={!!actionConfirm}
          onClose={() => setActionConfirm(null)}
          onConfirm={executeAction}
          title={actionConfirm.title}
          message={actionConfirm.message}
          confirmText="ยืนยันการดำเนินการ"
          variant={actionConfirm.variant}
        />
      )}
    </div>
  );
};
