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
  Flag, 
  Printer, 
  Share2, 
  ChevronLeft
} from 'lucide-react';

export const PublicLabelViewPage: React.FC = () => {
  const { newcode } = useParams<{ newcode: string }>();
  const { success } = useToast();

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
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center mb-5">
            <AlertTriangle className="w-8 h-8 text-slate-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">ไม่พบข้อมูลผลิตภัณฑ์นี้ในระบบ อย.</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
            รหัสผลิตภัณฑ์หรือเลขสารบบที่ระบุ (<strong>{newcode}</strong>) ไม่ตรงกับฐานข้อมูลฉลากดิจิทัลที่ได้รับอนุญาต อาจเกิดจากการพิมพ์ผิด หรือผลิตภัณฑ์ยังไม่ได้รับอนุญาต
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5 justify-center">
            <Link
              to="/search"
              className="px-4 py-2 bg-[#002B49] hover:bg-[#001D33] text-white rounded-lg text-xs font-semibold transition"
            >
              ค้นหาผลิตภัณฑ์อื่นในระบบ
            </Link>
            <a
              href="tel:1556"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar lang={lang} onToggleLang={() => setLang(l => l === 'th' ? 'en' : 'th')} />

      {/* Breadcrumb / Back button */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
          <Link to="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium">
            <ChevronLeft className="w-4 h-4" />
            <span>กลับหน้าหลัก</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(l => l === 'th' ? 'en' : 'th')}
              className="inline-flex items-center gap-1 text-slate-700 font-semibold px-2.5 py-1 rounded-md hover:bg-slate-100 border border-slate-200 text-xs"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'th' ? 'ภาษาไทย (TH)' : 'English (EN)'}</span>
            </button>
            <button
              onClick={handleShare}
              className="text-slate-500 hover:text-slate-800 p-1.5 rounded-md hover:bg-slate-100 transition"
              title="แชร์ฉลาก"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl w-full mx-auto px-4 py-6 flex-1 space-y-5">
        {/* CASE: SUSPENDED PRODUCT ALERT - OFFICIAL STYLE */}
        {isSuspended && (
          <div className="bg-white rounded-xl border-2 border-rose-600 shadow-sm overflow-hidden">
            <div className="bg-rose-700 text-white px-5 py-2.5 flex items-center justify-between text-xs font-bold uppercase tracking-wide">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>คำสั่งระงับการเผยแพร่ฉลากและจำหน่ายชั่วคราวโดย อย.</span>
              </div>
              <span className="text-[11px] font-normal text-rose-100">ประกาศทางการ</span>
            </div>

            <div className="p-5 sm:p-6 space-y-3 text-xs sm:text-sm text-slate-800">
              <h3 className="text-base sm:text-lg font-bold text-rose-900">
                เตือนภัยผู้บริโภค: ผลิตภัณฑ์นี้อยู่ระหว่างถูกระงับการอนุญาต
              </h3>
              <p className="text-slate-700 leading-relaxed text-xs">
                {label?.suspendedReason || 'สำนักงานคณะกรรมการอาหารและยา (อย.) มีคำสั่งระงับการเผยแพร่ฉลากและเรียกเก็บผลิตภัณฑ์นี้ชั่วคราว เนื่องจากอยู่ระหว่างตรวจสอบข้อกำหนดความปลอดภัยตามกฎหมาย'}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <a
                  href="tel:1556"
                  className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-lg shadow-xs inline-flex items-center gap-1.5 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>โทรแจ้งสายด่วน อย. 1556</span>
                </a>
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg border border-slate-300 inline-flex items-center gap-1.5 transition"
                >
                  <Flag className="w-3.5 h-3.5 text-slate-500" />
                  <span>แจ้งเบาะแสว่าพบเห็นในท้องตลาด</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CASE: PENDING REVIEW ALERT */}
        {!isPublished && !isSuspended && (
          <div className="bg-slate-100 text-slate-800 p-3.5 rounded-xl border border-slate-300 flex items-start gap-2.5 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>สถานะการตรวจสอบ:</strong> ฉลากนี้อยู่ระหว่างขั้นตอน <strong>"{label?.status || product.activeLabelStatus || 'รอตรวจสอบ'}"</strong> ยังไม่ได้รับสถานะเผยแพร่สมบูรณ์ ข้อมูลอาจมีการเปลี่ยนแปลง
            </div>
          </div>
        )}

        {/* MAIN DIGITAL LABEL CARD */}
        <div className="bg-white rounded-xl shadow-card border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#002B49] text-white p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
                <img
                  src="/Logo_of_the_Food_and_Drug_Administration.svg"
                  alt="ตรา อย."
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-300 font-normal">สำนักงานคณะกรรมการอาหารและยา กระทรวงสาธารณสุข</span>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  {lang === 'th' ? product.productNameTh : (product.productNameEn || product.productNameTh)}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  {lang === 'th' ? product.productNameEn : product.productNameTh}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <StatusBadge status={label?.status || product.activeLabelStatus || 'draft'} size="md" />
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-6">
            {/* Product Image & Basic Attributes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Image */}
              <div className="flex flex-col items-center">
                <div className="w-full h-56 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2">
                  <img
                    src={label?.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80'}
                    alt={product.productNameTh}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1.5">ภาพบรรจุภัณฑ์ที่ได้รับอนุญาต</span>
              </div>

              {/* Attributes */}
              <div className="md:col-span-2 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">เลขสารบบ / ทะเบียน:</span>
                    <strong className="text-slate-900 font-mono text-sm">{product.regNumber}</strong>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">หมวดหมู่:</span>
                    <strong className="text-slate-800">{product.categoryNameTh}</strong>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Newcode (รหัส อย.):</span>
                    <span className="font-mono text-slate-700 text-[11px] block truncate">{product.newcode}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">วันที่อนุญาต / วันหมดอายุ:</span>
                    <span className="text-slate-700">{product.approvedDate} ถึง {product.expiryDate}</span>
                  </div>
                </div>

                {/* Manufacturer */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-[11px] block">ผู้รับอนุญาต:</span>
                      <strong className="text-slate-900">{product.entrepreneurName}</strong> (Tax ID: {product.taxId})
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pt-1.5 border-t border-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-[11px] block">สถานที่ผลิตหรือนำเข้า:</span>
                      <span className="text-slate-700">{product.manufacturerAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-slate-200 pt-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1.5">
                {lang === 'th' ? 'รายละเอียดและคำบรรยายผลิตภัณฑ์' : 'Product Description'}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {lang === 'th' ? label?.descriptionTh : (label?.descriptionEn || label?.descriptionTh)}
              </p>
            </div>

            {/* Food Nutrition Table */}
            {product.category === 'food' && label?.nutritionFacts && (
              <div className="border-t border-slate-200 pt-5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide">
                    {lang === 'th' ? 'ข้อมูลโภชนาการ' : 'Nutrition Information'}
                  </h3>
                  <span className="text-slate-500 text-[11px]">
                    หนึ่งหน่วยบริโภค: {label.nutritionFacts.servingSize}
                  </span>
                </div>

                <div className="border border-slate-300 rounded-lg overflow-hidden max-w-md text-xs">
                  <div className="bg-slate-800 text-white p-2.5 font-bold">
                    คุณค่าทางโภชนาการต่อหนึ่งหน่วยบริโภค
                  </div>
                  <div className="p-2.5 bg-slate-50 border-b flex justify-between font-medium">
                    <span>พลังงานทั้งหมด</span>
                    <strong>{label.nutritionFacts.totalEnergy}</strong>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {label.nutritionFacts.nutrients.map((n, idx) => (
                      <div key={idx} className="p-2 flex justify-between hover:bg-slate-50">
                        <span className="text-slate-700">{n.name}</span>
                        <div className="flex gap-4">
                          <span className="text-slate-900 font-medium">{n.amount}</span>
                          <span className="w-10 text-right text-slate-500">{n.percentDailyValue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {label.foodDetails?.ingredientsWithPercent && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <strong className="text-slate-900 block mb-0.5">ส่วนประกอบสำคัญโดยประมาณ:</strong>
                    <p className="text-slate-700">{label.foodDetails.ingredientsWithPercent}</p>
                  </div>
                )}

                {label.foodDetails?.allergenInfo && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950">
                    <strong className="text-amber-900 block mb-0.5">ข้อมูลสำหรับผู้แพ้อาหาร:</strong>
                    <p>{label.foodDetails.allergenInfo}</p>
                  </div>
                )}
              </div>
            )}

            {/* Drug Details */}
            {product.category === 'drug' && label?.drugDetails && (
              <div className="border-t border-slate-200 pt-5 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  {lang === 'th' ? 'ข้อบ่งใช้และวิธีใช้ยา' : 'Indications & Dosage'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <strong className="block text-slate-900">ข้อบ่งใช้ (Indications):</strong>
                    <p className="text-slate-700">{label.drugDetails.indications}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <strong className="block text-slate-900">วิธีใช้และขนาดยา (Dosage & Admin):</strong>
                    <p className="text-slate-700">{label.drugDetails.dosageAndAdministration}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 md:col-span-2">
                    <strong className="block text-slate-900">ข้อห้ามใช้ (Contraindications):</strong>
                    <p className="text-slate-700">{label.drugDetails.contraindications}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cosmetic Details */}
            {product.category === 'cosmetic' && label?.cosmeticDetails && (
              <div className="border-t border-slate-200 pt-5 space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  {lang === 'th' ? 'ส่วนประกอบทั้งหมดและวิธีใช้' : 'Ingredients & Usage'}
                </h3>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <p className="font-mono text-slate-700 text-[11px]">
                    <strong>Ingredients: </strong>{label.cosmeticDetails.ingredients.join(', ')}
                  </p>
                  <p className="text-slate-700 pt-1.5 border-t">
                    <strong>วิธีใช้: </strong>{label.cosmeticDetails.usageInstructions}
                  </p>
                </div>
              </div>
            )}

            {/* Warnings */}
            <div className="border-t border-slate-200 pt-5">
              <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                  <span>คำเตือนและข้อควรระวังตามประกาศกระทรวงสาธารณสุข:</span>
                </div>
                <p className="leading-relaxed">
                  {lang === 'th' ? label?.generalWarningTh : (label?.generalWarningEn || label?.generalWarningTh)}
                </p>
                {label?.storageWarningTh && (
                  <p className="text-slate-600 pt-1 border-t border-slate-200">
                    <strong>วิธีเก็บรักษา: </strong>
                    {lang === 'th' ? label.storageWarningTh : (label.storageWarningEn || label.storageWarningTh)}
                  </p>
                )}
              </div>
            </div>

            {/* Official Documents PDF Viewer */}
            {label?.documents && label.documents.length > 0 && (
              <div className="border-t border-slate-200 pt-5 space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  เอกสารกำกับผลิตภัณฑ์ทางการ อย. (Official Documents)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {label.documents.map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-slate-600 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="font-medium text-slate-800 truncate">{doc.name}</p>
                          <span className="text-[10px] text-slate-400">{doc.size}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedDocName(doc.name);
                          setIsPdfOpen(true);
                        }}
                        className="px-2.5 py-1 bg-[#002B49] hover:bg-[#001D33] text-white text-[11px] font-medium rounded transition flex-shrink-0"
                      >
                        เปิดอ่านในเว็บ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="border-t border-slate-200 pt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>ปรับปรุงข้อมูลล่าสุดเมื่อ: {label?.updatedAt ? new Date(label.updatedAt).toLocaleDateString('th-TH') : product.lastSyncedAt}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition inline-flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์ฉลาก</span>
                </button>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md transition inline-flex items-center gap-1"
                >
                  <Flag className="w-3.5 h-3.5 text-slate-500" />
                  <span>แจ้งปัญหาข้อมูล</span>
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
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-700"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              รายละเอียดปัญหาที่ตรวจพบ (*):
            </label>
            <textarea
              required
              rows={4}
              placeholder="ระบุปัญหา เช่น ฉลากบนขวดไม่ตรงกับฉลากดิจิทัล หรือพบวันหมดอายุผิดปกติ..."
              value={reportText}
              onChange={e => setReportText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReportOpen(false)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-[#002B49] hover:bg-[#001D33] text-white font-semibold rounded-lg shadow-xs transition"
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
