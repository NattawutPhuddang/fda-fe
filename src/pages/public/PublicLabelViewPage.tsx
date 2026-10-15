import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { storage } from '../../services/storage';
import { Product, DigitalLabel } from '../../services/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PDFViewerModal } from '../../components/common/PDFViewerModal';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  Download, 
  Globe, 
  PhoneCall, 
  Calendar, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  Info, 
  Flag, 
  Printer, 
  Share2, 
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

export const PublicLabelViewPage: React.FC = () => {
  const { newcode } = useParams<{ newcode: string }>();
  const { success, info } = useToast();

  const [lang, setLang] = useState<'th' | 'en'>('th');
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [label, setLabel] = useState<DigitalLabel | undefined>(undefined);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [selectedDocName, setSelectedDocName] = useState('เอกสารกำกับผลิตภัณฑ์_อย.pdf');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSender, setReportSender] = useState('');

  useEffect(() => {
    if (!newcode) return;
    const prod = storage.getProductByNewcode(newcode);
    setProduct(prod);
    if (prod) {
      const lbl = storage.getLabelByProductId(prod.id);
      setLabel(lbl);
    }
  }, [newcode]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.productNameTh,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('คัดลอกลิงก์ตรวจสอบฉลากแล้ว');
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    storage.addAuditLog({
      userId: 'public-consumer',
      userName: reportSender || 'ประชาชนผู้บริโภค',
      userRole: 'public',
      action: 'SUBMIT_CITIZEN_REPORT',
      resourceType: 'DIGITAL_LABEL',
      resourceId: label?.id || product?.id || 'unknown',
      result: 'WARNING',
      details: `แจ้งปัญหาข้อมูลฉลาก: ${reportText}`
    });

    setIsReportOpen(false);
    setReportText('');
    setReportSender('');
    success('ส่งข้อมูลแจ้งปัญหาไปยังศูนย์จัดการเรื่องร้องเรียน อย. เรียบร้อยแล้ว');
  };

  // Case 1: Product Not Found
  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <PublicNavbar lang={lang} onToggleLang={() => setLang(l => l === 'th' ? 'en' : 'th')} />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mb-6 shadow-sm">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">ไม่พบข้อมูลผลิตภัณฑ์นี้ในระบบ อย.</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
            รหัสผลิตภัณฑ์หรือเลขสารบบที่ระบุ (<strong>{newcode}</strong>) ไม่ตรงกับฐานข้อมูลฉลากดิจิทัลที่ได้รับอนุญาต อาจเกิดจากการกรอกรหัสผิด หรือผลิตภัณฑ์ยังไม่ได้รับอนุญาตให้จำหน่าย
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              to="/search"
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow transition"
            >
              ค้นหาผลิตภัณฑ์อื่นในระบบ
            </Link>
            <a
              href="tel:1556"
              className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>แจ้งสายด่วน อย. 1556</span>
            </a>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const isSuspended = product.registrationStatus === 'suspended' || label?.status === 'suspended';
  const isPublished = label?.status === 'published';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <PublicNavbar lang={lang} onToggleLang={() => setLang(l => l === 'th' ? 'en' : 'th')} />

      {/* Breadcrumb / Back button */}
      <div className="bg-white border-b border-slate-200 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
          <Link to="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-900 font-medium">
            <ChevronLeft className="w-4 h-4" />
            <span>กลับหน้าหลักตรวจสอบ</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(l => l === 'th' ? 'en' : 'th')}
              className="inline-flex items-center gap-1 text-blue-900 font-semibold px-2 py-1 rounded hover:bg-blue-50 border border-blue-200"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>ภาษาฉลาก: {lang === 'th' ? 'TH (ไทย)' : 'EN (English)'}</span>
            </button>
            <button
              onClick={handleShare}
              className="text-slate-500 hover:text-slate-800 p-1.5 rounded hover:bg-slate-100 transition"
              title="แชร์ฉลาก"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl w-full mx-auto px-4 py-6 flex-1 space-y-6">
        {/* CASE: SUSPENDED PRODUCT ALERT BANNER */}
        {isSuspended && (
          <div className="bg-rose-600 text-white p-6 rounded-3xl shadow-xl border-2 border-rose-700 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-2xl flex-shrink-0">
                <ShieldAlert className="w-8 h-8 text-amber-300" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="inline-block bg-white text-rose-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  คำสั่งระงับการเผยแพร่ฉลากและจำหน่ายโดย อย.
                </div>
                <h3 className="text-lg sm:text-xl font-bold">
                  เตือนภัยผู้บริโภค: ผลิตภัณฑ์นี้ถูกสั่งระงับชั่วคราว
                </h3>
                <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
                  {label?.suspendedReason || 'สำนักงานคณะกรรมการอาหารและยา (อย.) มีคำสั่งระงับการเผยแพร่ฉลากและเรียกเก็บผลิตภัณฑ์นี้ชั่วคราว เนื่องจากอยู่ระหว่างตรวจสอบข้อกำหนดความปลอดภัย'}
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href="tel:1556"
                    className="px-4 py-2 bg-white text-rose-800 hover:bg-rose-50 text-xs font-bold rounded-xl shadow inline-flex items-center gap-1.5 transition"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>โทรแจ้งสายด่วน อย. 1556 ทันที</span>
                  </a>
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-medium rounded-xl border border-rose-400 inline-flex items-center gap-1.5 transition"
                  >
                    <Flag className="w-4 h-4" />
                    <span>แจ้งเบาะแสว่าพบเห็นในท้องตลาด</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE: PENDING REVIEW ALERT */}
        {!isPublished && !isSuspended && (
          <div className="bg-amber-50 text-amber-900 p-4 rounded-2xl border border-amber-300 flex items-start gap-3 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">สถานะการพิจารณา:</strong>
              ฉลากดิจิทัลของผลิตภัณฑ์นี้อยู่ระหว่างขั้นตอน <strong>"{label?.status || product.activeLabelStatus || 'รอตรวจสอบ'}"</strong> ยังไม่ได้รับสถานะเผยแพร่สมบูรณ์ต่อสาธารณะ ข้อมูลที่แสดงอาจมีการปรับปรุงเพิ่มเติม
            </div>
          </div>
        )}

        {/* MAIN DIGITAL LABEL CARD */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
          {/* Official Verification Header */}
          <div className="bg-gradient-to-r from-[#002B49] via-[#0B3954] to-[#002B49] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-amber-400 text-lg border border-white/20 shadow-inner flex-shrink-0">
                อย.
              </div>
              <div>
                <span className="text-xs text-blue-200 font-medium">สำนักงานคณะกรรมการอาหารและยา กระทรวงสาธารณสุข</span>
                <h2 className="text-xl sm:text-2xl font-bold mt-0.5">
                  {lang === 'th' ? product.productNameTh : product.productNameEn}
                </h2>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  {lang === 'th' ? product.productNameEn : product.productNameTh}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <StatusBadge status={label?.status || product.activeLabelStatus || 'draft'} size="lg" />
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Product Basic Info Badges & Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Product Image */}
              <div className="flex flex-col items-center">
                <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center p-2">
                  <img
                    src={label?.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80'}
                    alt={product.productNameTh}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-2">ภาพบรรจุภัณฑ์ที่ผ่านการรับรอง</span>
              </div>

              {/* Core Registration Attributes */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">เลขสารบบอาหาร / เลขทะเบียน:</span>
                    <strong className="text-blue-900 font-mono text-sm">{product.regNumber}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">หมวดหมู่ผลิตภัณฑ์:</span>
                    <strong className="text-slate-800 text-sm">{product.categoryNameTh}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">รหัสผลิตภัณฑ์สากล (Newcode):</span>
                    <span className="font-mono text-slate-700 text-xs truncate block">{product.newcode}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">วันที่อนุมัติ / วันหมดอายุ:</span>
                    <span className="text-slate-700 text-xs">{product.approvedDate} ถึง {product.expiryDate}</span>
                  </div>
                </div>

                {/* Manufacturer & Licensee */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">ผู้รับอนุญาต / ผู้ถือครองทะเบียน:</span>
                      <strong className="text-slate-800">{product.entrepreneurName}</strong> (Tax ID: {product.taxId})
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
                    <MapPin className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">สถานที่ผลิตหรือนำเข้า:</span>
                      <span className="text-slate-700">{product.manufacturerAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                {lang === 'th' ? 'รายละเอียดและคำบรรยายผลิตภัณฑ์' : 'Product Description'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {lang === 'th' ? label?.descriptionTh : (label?.descriptionEn || label?.descriptionTh)}
              </p>
            </div>

            {/* Specifics: Food Nutrition Table */}
            {product.category === 'food' && label?.nutritionFacts && (
              <div className="border-t border-slate-200 pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    {lang === 'th' ? 'ข้อมูลโภชนาการ (Nutrition Facts)' : 'Nutrition Information'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    หนึ่งหน่วยบริโภค: {label.nutritionFacts.servingSize}
                  </span>
                </div>

                <div className="border border-slate-300 rounded-2xl overflow-hidden max-w-lg">
                  <div className="bg-slate-900 text-white p-3 font-bold text-sm">
                    คุณค่าทางโภชนาการต่อหนึ่งหน่วยบริโภค
                  </div>
                  <div className="p-3 bg-slate-50 border-b text-xs flex justify-between">
                    <span>พลังงานทั้งหมด</span>
                    <strong>{label.nutritionFacts.totalEnergy}</strong>
                  </div>
                  <div className="divide-y divide-slate-200 text-xs">
                    {label.nutritionFacts.nutrients.map((n, idx) => (
                      <div key={idx} className="p-2.5 flex justify-between hover:bg-slate-50">
                        <span className="text-slate-700">{n.name}</span>
                        <div className="flex gap-4">
                          <span className="font-medium text-slate-900">{n.amount}</span>
                          <span className="w-10 text-right text-slate-500">{n.percentDailyValue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Specifics: Drug Indications and Administration */}
            {product.category === 'drug' && label?.drugDetails && (
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  {lang === 'th' ? 'ข้อบ่งใช้และวิธีใช้ยา (Indications & Dosage)' : 'Indications & Dosage'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-1">
                    <span className="font-bold text-blue-950 block">ข้อบ่งใช้ (Indications):</span>
                    <p className="text-slate-700 leading-relaxed">{label.drugDetails.indications}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">วิธีใช้และขนาดยา (Dosage & Admin):</span>
                    <p className="text-slate-700 leading-relaxed">{label.drugDetails.dosageAndAdministration}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1 md:col-span-2">
                    <span className="font-bold text-rose-900 block">ข้อห้ามใช้ (Contraindications):</span>
                    <p className="text-rose-800 leading-relaxed">{label.drugDetails.contraindications}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Specifics: Cosmetic Ingredients */}
            {product.category === 'cosmetic' && label?.cosmeticDetails && (
              <div className="border-t border-slate-200 pt-6 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  {lang === 'th' ? 'ส่วนประกอบทั้งหมดและวิธีใช้ (Ingredients & Usage)' : 'Ingredients & Usage'}
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <p className="font-mono text-slate-700 leading-relaxed">
                    <strong>Ingredients: </strong>
                    {label.cosmeticDetails.ingredients.join(', ')}
                  </p>
                  <p className="text-slate-700 pt-2 border-t">
                    <strong>วิธีใช้: </strong>{label.cosmeticDetails.usageInstructions}
                  </p>
                </div>
              </div>
            )}

            {/* Warnings Box */}
            <div className="border-t border-slate-200 pt-6">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>คำเตือนและข้อควรระวังตามประกาศกระทรวงสาธารณสุข:</span>
                </div>
                <p className="leading-relaxed">
                  {lang === 'th' ? label?.generalWarningTh : (label?.generalWarningEn || label?.generalWarningTh)}
                </p>
                {label?.storageWarningTh && (
                  <p className="text-amber-800 pt-1 border-t border-amber-200/70">
                    <strong>วิธีเก็บรักษา: </strong>
                    {lang === 'th' ? label.storageWarningTh : (label.storageWarningEn || label.storageWarningTh)}
                  </p>
                )}
              </div>
            </div>

            {/* PDF Leaflets & Documents Section */}
            {label?.documents && label.documents.length > 0 && (
              <div className="border-t border-slate-200 pt-6 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  เอกสารกำกับผลิตภัณฑ์ทางการที่ได้รับอนุมัติ (Official Documents)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {label.documents.map(doc => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-800 truncate">{doc.name}</p>
                          <span className="text-[10px] text-slate-400">{doc.size}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => {
                            setSelectedDocName(doc.name);
                            setIsPdfOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white text-[11px] font-medium rounded-lg transition"
                        >
                          เปิดอ่านในเว็บ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Controls: Report Problem, Print */}
            <div className="border-t border-slate-200 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>ปรับปรุงข้อมูลล่าสุดเมื่อ: {label?.updatedAt ? new Date(label.updatedAt).toLocaleDateString('th-TH') : product.lastSyncedAt}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์ฉลาก</span>
                </button>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition inline-flex items-center gap-1.5 font-medium"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>แจ้งปัญหาข้อมูลผลิตภัณฑ์</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PDF Leaflet Modal */}
      <PDFViewerModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        title="เอกสารกำกับผลิตภัณฑ์ทางการ อย."
        documentName={selectedDocName}
      />

      {/* Report Problem Dialog */}
      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="แจ้งปัญหาข้อมูลผลิตภัณฑ์ต่อ อย."
        subtitle={`ส่งเรื่องร้องเรียน/ข้อสงสัยเกี่ยวกับ ${product.productNameTh}`}
      >
        <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              ชื่อ-นามสกุล หรือเบอร์โทรติดต่อกลับ (ไม่บังคับ):
            </label>
            <input
              type="text"
              placeholder="เช่น นายรักดี มีสุข หรือ 081-xxx-xxxx"
              value={reportSender}
              onChange={e => setReportSender(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              รายละเอียดปัญหาที่ตรวจพบ (*):
            </label>
            <textarea
              required
              rows={4}
              placeholder="ระบุปัญหา เช่น ฉลากบนขวดไม่ตรงกับฉลากดิจิทัล, พบวันหมดอายุผิดปกติ, หรือสงสัยว่ามีสารปนเปื้อน..."
              value={reportText}
              onChange={e => setReportText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-slate-500 text-[11px] leading-relaxed">
            * ข้อมูลการแจ้งเหตุจะถูกส่งต่อเข้าสู่ระบบตรวจสอบของศูนย์จัดการเรื่องร้องเรียนและปราบปรามการกระทำความผิดเกี่ยวกับผลิตภัณฑ์สุขภาพ (อย.) โดยตรง
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReportOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow transition"
            >
              ส่งเรื่องแจ้งปัญหา
            </button>
          </div>
        </form>
      </Modal>

      <PublicFooter />
    </div>
  );
};
