import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import { DigitalLabel, Product, LabelStatus } from '../../services/types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { 
  Save, 
  Send, 
  Eye, 
  ArrowLeft, 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Package
} from 'lucide-react';

export const LabelCreateEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { success, error, warning } = useToast();

  const isNew = !id || id === 'new';
  const preselectedProductId = searchParams.get('productId');

  const products = storage.getProducts();

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [titleTh, setTitleTh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionTh, setDescriptionTh] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [generalWarningTh, setGeneralWarningTh] = useState('');
  const [storageWarningTh, setStorageWarningTh] = useState('');

  // Category specific state
  const [drugIndications, setDrugIndications] = useState('');
  const [drugDosage, setDrugDosage] = useState('');
  const [drugContraindications, setDrugContraindications] = useState('');

  const [cosmeticIngredients, setCosmeticIngredients] = useState('');
  const [cosmeticUsage, setCosmeticUsage] = useState('');

  const [currentStatus, setCurrentStatus] = useState<LabelStatus>('draft');
  const [version, setVersion] = useState(1);
  const [revisionNotes, setRevisionNotes] = useState<string | undefined>(undefined);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      const existing = storage.getLabelById(id);
      if (existing) {
        setSelectedProductId(existing.productId);
        setTitleTh(existing.titleTh);
        setTitleEn(existing.titleEn);
        setDescriptionTh(existing.descriptionTh);
        setDescriptionEn(existing.descriptionEn);
        setImageUrl(existing.imageUrl);
        setGeneralWarningTh(existing.generalWarningTh);
        setStorageWarningTh(existing.storageWarningTh);
        setCurrentStatus(existing.status);
        setVersion(existing.version);
        setRevisionNotes(existing.revisionNotes);

        if (existing.drugDetails) {
          setDrugIndications(existing.drugDetails.indications);
          setDrugDosage(existing.drugDetails.dosageAndAdministration);
          setDrugContraindications(existing.drugDetails.contraindications);
        }

        if (existing.cosmeticDetails) {
          setCosmeticIngredients(existing.cosmeticDetails.ingredients.join(', '));
          setCosmeticUsage(existing.cosmeticDetails.usageInstructions);
        }
      }
    } else if (preselectedProductId) {
      setSelectedProductId(preselectedProductId);
      const prod = products.find(p => p.id === preselectedProductId);
      if (prod) {
        setTitleTh(`${prod.productNameTh} (ฉลากดิจิทัล)`);
        setTitleEn(`${prod.productNameEn} (Digital Label)`);
      }
    }
  }, [id, isNew, preselectedProductId, products]);

  const activeProduct = products.find(p => p.id === selectedProductId);

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      warning('กรุณาเลือกผลิตภัณฑ์ที่ต้องการทำฉลากดิจิทัล');
      return;
    }

    const labelData: DigitalLabel = {
      id: id && id !== 'new' ? id : `lbl-${Date.now()}`,
      productId: selectedProductId,
      version: version,
      status: 'draft',
      titleTh: titleTh || (activeProduct?.productNameTh ?? 'แบบร่างฉลาก'),
      titleEn: titleEn || (activeProduct?.productNameEn ?? 'Draft Label'),
      descriptionTh,
      descriptionEn,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
      generalWarningTh,
      generalWarningEn: '',
      storageWarningTh,
      storageWarningEn: '',
      documents: [
        {
          id: `doc-${Date.now()}`,
          name: 'เอกสารแนบร่างฉลาก_อย.pdf',
          url: '/sample-label-approval.pdf',
          type: 'application/pdf',
          uploadedAt: new Date().toISOString(),
          size: '1.2 MB'
        }
      ],
      scanCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      drugDetails: activeProduct?.category === 'drug' ? {
        genericName: activeProduct.productNameTh,
        dosageForm: 'ยาแผนปัจจุบัน',
        strength: 'ตามทะเบียน',
        indications: drugIndications,
        contraindications: drugContraindications,
        dosageAndAdministration: drugDosage,
        storageConditions: storageWarningTh,
        leafletPdfUrl: '/sample-drug-leaflet.pdf'
      } : undefined,
      cosmeticDetails: activeProduct?.category === 'cosmetic' ? {
        ingredients: cosmeticIngredients.split(',').map(s => s.trim()).filter(Boolean),
        usageInstructions: cosmeticUsage,
        warnings: generalWarningTh,
        netVolume: '50 ml / g',
        batchNumber: 'LOT-DEMO-01',
        mfgDate: '2026-01-01',
        expDate: '2028-01-01'
      } : undefined
    };

    storage.saveLabel(labelData, currentUser || undefined);
    success('บันทึกแบบร่าง (Draft) ฉลากดิจิทัลสำเร็จ');
    navigate('/entrepreneur/labels');
  };

  const handleSubmitReview = () => {
    if (!selectedProductId || !titleTh.trim()) {
      warning('กรุณากรอกข้อมูลชื่อฉลากและเลือกผลิตภัณฑ์ก่อนส่งคำขอ');
      return;
    }

    const labelData: DigitalLabel = {
      id: id && id !== 'new' ? id : `lbl-${Date.now()}`,
      productId: selectedProductId,
      version: currentStatus === 'revision_required' ? version + 1 : version,
      status: 'pending_review',
      titleTh,
      titleEn,
      descriptionTh,
      descriptionEn,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
      generalWarningTh,
      generalWarningEn: '',
      storageWarningTh,
      storageWarningEn: '',
      documents: [
        {
          id: `doc-${Date.now()}`,
          name: 'เอกสารประกอบคำขอฉลากดิจิทัล_ฉบับสมบูรณ์.pdf',
          url: '/sample-label-approval.pdf',
          type: 'application/pdf',
          uploadedAt: new Date().toISOString(),
          size: '1.8 MB'
        }
      ],
      scanCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      drugDetails: activeProduct?.category === 'drug' ? {
        genericName: activeProduct.productNameTh,
        dosageForm: 'ยาแผนปัจจุบัน',
        strength: 'ตามทะเบียน',
        indications: drugIndications,
        contraindications: drugContraindications,
        dosageAndAdministration: drugDosage,
        storageConditions: storageWarningTh,
        leafletPdfUrl: '/sample-drug-leaflet.pdf'
      } : undefined,
      cosmeticDetails: activeProduct?.category === 'cosmetic' ? {
        ingredients: cosmeticIngredients.split(',').map(s => s.trim()).filter(Boolean),
        usageInstructions: cosmeticUsage,
        warnings: generalWarningTh,
        netVolume: '50 ml / g',
        batchNumber: 'LOT-DEMO-01',
        mfgDate: '2026-01-01',
        expDate: '2028-01-01'
      } : undefined
    };

    storage.saveLabel(labelData, currentUser || undefined);

    storage.addAuditLog({
      userId: currentUser?.id || 'usr-ent',
      userName: currentUser?.fullName || 'ผู้ประกอบการ',
      userRole: 'entrepreneur',
      action: 'SUBMIT_LABEL_REQUEST',
      resourceType: 'DIGITAL_LABEL',
      resourceId: labelData.id,
      result: 'SUCCESS',
      details: `ยื่นคำขอฉลากดิจิทัลสำหรับผลิตภัณฑ์: ${activeProduct?.productNameTh} (${activeProduct?.regNumber}) เพื่อรอเจ้าหน้าที่ อย. ตรวจสอบ`
    });

    success('ยื่นคำขอฉลากดิจิทัลเข้าสู่คิวงานพิจารณาของเจ้าหน้าที่ อย. เรียบร้อยแล้ว!');
    navigate('/entrepreneur/labels');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'จัดการฉลากดิจิทัล', path: '/entrepreneur/labels' },
          { label: isNew ? 'สร้างคำขอฉลากใหม่' : `แก้ไขฉลาก (${titleTh || 'แบบร่าง'})` }
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {isNew ? 'สร้างคำขอฉลากดิจิทัลใหม่' : 'แก้ไขและจัดการรายละเอียดฉลากดิจิทัล'}
            </h2>
            <StatusBadge status={currentStatus} size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            กรอกข้อมูลและแนบเอกสารตามประเภทผลิตภัณฑ์เพื่อยื่นต่อสำนักงานคณะกรรมการอาหารและยา
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>ดูตัวอย่างฉลาก (Preview)</span>
          </button>
        </div>
      </div>

      {/* Revision notes from FDA Officer if revision required */}
      {revisionNotes && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>ข้อเสนอแนะในการส่งกลับแก้ไขจากเจ้าหน้าที่ อย. (Revision Required):</span>
          </div>
          <p className="leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-200 mt-2 font-medium">
            "{revisionNotes}"
          </p>
          <span className="text-[11px] text-amber-800 block pt-1">
            * กรุณาปรับปรุงข้อมูลตามข้อเสนอแนะด้านบน แล้วกดปุ่ม "ยื่นส่งคำขอพิจารณาใหม่" เพื่อส่งให้เจ้าหน้าที่ตรวจสอบอีกครั้ง
          </span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSaveDraft} className="space-y-8">
        {/* Step 1: Select Master Product */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-800">เลือกผลิตภัณฑ์เป้าหมายจาก e-Submission</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ผลิตภัณฑ์ที่ต้องการสร้างหรือแก้ไขฉลาก (*):
            </label>
            <select
              value={selectedProductId}
              onChange={e => {
                const prodId = e.target.value;
                setSelectedProductId(prodId);
                const p = products.find(prod => prod.id === prodId);
                if (p && !titleTh) {
                  setTitleTh(`${p.productNameTh} (ฉลากดิจิทัล)`);
                  setTitleEn(`${p.productNameEn} (Digital Label)`);
                }
              }}
              disabled={!isNew}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100"
            >
              <option value="">-- กรุณาเลือกผลิตภัณฑ์ที่ได้รับอนุญาต --</option>
              {products.map(prod => (
                <option key={prod.id} value={prod.id}>
                  [{prod.regNumber}] {prod.productNameTh} ({prod.categoryNameTh})
                </option>
              ))}
            </select>
          </div>

          {activeProduct && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">เลขสารบบ / ทะเบียน:</span>
                <strong className="text-blue-900 font-mono">{activeProduct.regNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">หมวดหมู่:</span>
                <span className="text-slate-700">{activeProduct.categoryNameTh}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">สถานที่ผลิต:</span>
                <span className="text-slate-700 truncate block">{activeProduct.manufacturerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">สถานะทะเบียน:</span>
                <StatusBadge status={activeProduct.registrationStatus} size="sm" />
              </div>
            </div>
          )}
        </div>

        {/* Step 2: General Label Content */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-800">ข้อมูลรายละเอียดฉลาก (ทั่วไปและสองภาษา)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อฉลากผลิตภัณฑ์ (ภาษาไทย) (*):
              </label>
              <input
                type="text"
                required
                value={titleTh}
                onChange={e => setTitleTh(e.target.value)}
                placeholder="เช่น เครื่องดื่มรังนกแท้สำเร็จรูป ตรา เฮลท์โกลด์ (ขวด 70 มล.)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Product Title (English):
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                placeholder="e.g. Instant Bird's Nest Beverage (70 ml)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                รายละเอียดและสรรพคุณที่ได้รับอนุญาต (ภาษาไทย) (*):
              </label>
              <textarea
                rows={3}
                required
                value={descriptionTh}
                onChange={e => setDescriptionTh(e.target.value)}
                placeholder="ระบุคำบรรยายผลิตภัณฑ์ตามที่ได้รับอนุญาต ห้ามโอ้อวดสรรพคุณเกินจริง..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Product Description (English):
              </label>
              <textarea
                rows={2}
                value={descriptionEn}
                onChange={e => setDescriptionEn(e.target.value)}
                placeholder="English translation of product description..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                รูปภาพบรรจุภัณฑ์ (URL รูปภาพที่ผ่านการตรวจสอบ):
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://... หรือใช้รูปภาพมาตรฐาน"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                วิธีเก็บรักษา (Storage Conditions):
              </label>
              <input
                type="text"
                value={storageWarningTh}
                onChange={e => setStorageWarningTh(e.target.value)}
                placeholder="เช่น เก็บในที่แห้งและเย็น หลีกเลี่ยงแสงแดด"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                คำเตือนและข้อควรระวังตามประกาศกระทรวงสาธารณสุข (*):
              </label>
              <textarea
                rows={2}
                required
                value={generalWarningTh}
                onChange={e => setGeneralWarningTh(e.target.value)}
                placeholder="ระบุข้อความคำเตือนตามที่กฎหมายกำหนด..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Category Specific Fields */}
        {activeProduct?.category === 'drug' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-900 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-800">ข้อมูลเฉพาะหมวดหมู่ยาแผนปัจจุบัน (Drug Details)</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ข้อบ่งใช้ (Indications) (*):</label>
                <textarea
                  rows={2}
                  value={drugIndications}
                  onChange={e => setDrugIndications(e.target.value)}
                  placeholder="เช่น บรรเทาอาการปวดและลดไข้..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">วิธีใช้และขนาดยา (Dosage & Admin) (*):</label>
                <textarea
                  rows={2}
                  value={drugDosage}
                  onChange={e => setDrugDosage(e.target.value)}
                  placeholder="เช่น ผู้ใหญ่รับประทานครั้งละ 1 เม็ด ทุก 4-6 ชั่วโมง..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ข้อห้ามใช้ (Contraindications) (*):</label>
                <textarea
                  rows={2}
                  value={drugContraindications}
                  onChange={e => setDrugContraindications(e.target.value)}
                  placeholder="เช่น ห้ามใช้ในผู้ที่มีประวัติแพ้ยานี้ หรือผู้ป่วยโรคตับ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {activeProduct?.category === 'cosmetic' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-800">ข้อมูลเฉพาะหมวดเครื่องสำอาง (Cosmetic Ingredients)</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ส่วนประกอบทั้งหมดตามระบบสากล (INCI Ingredients) คั่นด้วยจุลภาค (*):
                </label>
                <textarea
                  rows={3}
                  value={cosmeticIngredients}
                  onChange={e => setCosmeticIngredients(e.target.value)}
                  placeholder="e.g. Aqua, Niacinamide, Glycerin, Cetyl Alcohol, Fragrance"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">วิธีใช้เครื่องสำอาง (*):</label>
                <input
                  type="text"
                  value={cosmeticUsage}
                  onChange={e => setCosmeticUsage(e.target.value)}
                  placeholder="เช่น ทาบำรุงผิวหน้าเป็นประจำทุกเช้าและก่อนนอน"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm sticky bottom-4">
          <Link
            to="/entrepreneur/labels"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            ← ย้อนกลับ
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึกแบบร่าง (Draft)</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitReview}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ส่งคำขอพิจารณา (Submit to FDA)</span>
            </button>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="ตัวอย่างการแสดงผลฉลากดิจิทัล (Live Preview)"
        subtitle="มุมมองเมื่อประชาชนสแกน QR Code ตรวจสอบ"
        maxWidth="xl"
      >
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
          <div className="bg-[#002B49] text-white p-4 rounded-xl">
            <span className="text-[10px] text-blue-200">สำนักงานคณะกรรมการอาหารและยา</span>
            <h4 className="text-base font-bold mt-0.5">{titleTh || 'ชื่อฉลากผลิตภัณฑ์ (ตัวอย่าง)'}</h4>
            <p className="text-xs text-slate-300">{titleEn || 'Product Name (Preview)'}</p>
          </div>

          <div className="space-y-2">
            <p className="text-slate-700">{descriptionTh || 'ไม่มีคำบรรยาย'}</p>
            {generalWarningTh && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                <strong>คำเตือน:</strong> {generalWarningTh}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
