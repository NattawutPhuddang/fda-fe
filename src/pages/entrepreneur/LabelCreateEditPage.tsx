import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import { 
  DigitalLabel, 
  Product, 
  LabelStatus, 
  LabelDocument, 
  NutritionFactItem,
  ReviewChecklistItem 
} from '../../services/types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { TimelineView } from '../../components/common/TimelineView';
import { PDFViewerModal } from '../../components/common/PDFViewerModal';
import { OfficerFeedbackBanner } from '../../components/entrepreneur/OfficerFeedbackBanner';
import { VersionDiffModal } from '../../components/entrepreneur/VersionDiffModal';
import { 
  Save, 
  Send, 
  Eye, 
  ArrowLeft, 
  ArrowRight,
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Package,
  Clock,
  GitCompare,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  FileCheck,
  HelpCircle,
  X
} from 'lucide-react';

export const LabelCreateEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { success, error, warning, info } = useToast();

  const isNew = !id || id === 'new';
  const preselectedProductId = searchParams.get('productId');

  const products = storage.getProducts();

  // Wizard Step: 1 = Product & e-Submission, 2 = Category Content, 3 = Files & Uploads, 4 = Validation & Summary
  const stepParam = parseInt(searchParams.get('step') || '1', 10);
  const [currentStep, setCurrentStep] = useState<number>(stepParam >= 1 && stepParam <= 4 ? stepParam : 1);

  // Representative Authority Check
  const [repAuth, setRepAuth] = useState(() => storage.checkRepresentativeAuthority('ยื่นคำขอฉลากดิจิทัล'));

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [titleTh, setTitleTh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionTh, setDescriptionTh] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [generalWarningTh, setGeneralWarningTh] = useState('');
  const [generalWarningEn, setGeneralWarningEn] = useState('');
  const [storageWarningTh, setStorageWarningTh] = useState('');
  const [storageWarningEn, setStorageWarningEn] = useState('');
  const [documents, setDocuments] = useState<LabelDocument[]>([]);

  // Category: Food specific state
  const [foodServingSize, setFoodServingSize] = useState('1 หน่วยบริโภค (70 มล.)');
  const [foodServingsPerContainer, setFoodServingsPerContainer] = useState('1');
  const [foodTotalEnergy, setFoodTotalEnergy] = useState('45 kcal');
  const [foodEnergyFromFat, setFoodEnergyFromFat] = useState('0 kcal');
  const [foodIngredientsWithPercent, setFoodIngredientsWithPercent] = useState('รังนกแห้ง 1.4%, โสมเกาหลีสกัด 0.5%, น้ำตาลกรวด 9.0%');
  const [foodAllergenInfo, setFoodAllergenInfo] = useState('ไม่มีส่วนผสมของสารก่อภูมิแพ้ 8 ชนิด');
  const [foodNetWeight, setFoodNetWeight] = useState('70 มล.');
  const [foodNutrients, setFoodNutrients] = useState<NutritionFactItem[]>([
    { name: 'ไขมันทั้งหมด (Total Fat)', amount: '0 ก.', percentDailyValue: '0%' },
    { name: 'โปรตีน (Protein)', amount: '1 ก.', percentDailyValue: '2%' },
    { name: 'คาร์โบไฮเดรตทั้งหมด (Total Carbohydrate)', amount: '10 ก.', percentDailyValue: '3%' },
    { name: 'น้ำตาล (Sugars)', amount: '9 ก.', percentDailyValue: '14%' },
    { name: 'โซเดียม (Sodium)', amount: '15 มก.', percentDailyValue: '1%' }
  ]);

  // Category: Drug specific state
  const [drugGenericName, setDrugGenericName] = useState('');
  const [drugClassification, setDrugClassification] = useState('ยาสามัญประจำบ้าน');
  const [drugActiveIngredients, setDrugActiveIngredients] = useState('Paracetamol 500 mg ต่อเม็ด');
  const [drugIndications, setDrugIndications] = useState('');
  const [drugDosage, setDrugDosage] = useState('');
  const [drugContraindications, setDrugContraindications] = useState('');
  const [drugAdverseReactions, setDrugAdverseReactions] = useState('อาจเกิดผื่นแพ้ทางผิวหนัง หรือตับอักเสบหากรับประทานเกินขนาด');

  // Category: Cosmetic specific state
  const [cosmeticIngredients, setCosmeticIngredients] = useState('');
  const [cosmeticUsage, setCosmeticUsage] = useState('');
  const [cosmeticNetVolume, setCosmeticNetVolume] = useState('50 มล.');
  const [cosmeticBatchNumber, setCosmeticBatchNumber] = useState('LOT-2026-01');
  const [cosmeticMfgDate, setCosmeticMfgDate] = useState('2026-01-15');
  const [cosmeticExpDate, setCosmeticExpDate] = useState('2028-01-14');
  const [cosmeticNotificationNumber, setCosmeticNotificationNumber] = useState('');

  // Status & Versioning
  const [currentStatus, setCurrentStatus] = useState<LabelStatus>('draft');
  const [version, setVersion] = useState(1);
  const [revisionNotes, setRevisionNotes] = useState<string | undefined>(undefined);
  const [officerChecklist, setOfficerChecklist] = useState<ReviewChecklistItem[]>([]);

  // Legal Confirmation in Step 4
  const [isLegalConfirmed, setIsLegalConfirmed] = useState(false);

  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  // Load existing data
  useEffect(() => {
    setRepAuth(storage.checkRepresentativeAuthority('ยื่นคำขอฉลากดิจิทัล'));

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
        setGeneralWarningEn(existing.generalWarningEn || '');
        setStorageWarningTh(existing.storageWarningTh);
        setStorageWarningEn(existing.storageWarningEn || '');
        setCurrentStatus(existing.status);
        setVersion(existing.version);
        setRevisionNotes(existing.revisionNotes);
        setDocuments(existing.documents || []);

        if (existing.foodDetails) {
          setFoodServingSize(existing.foodDetails.servingSize || '');
          setFoodServingsPerContainer(existing.foodDetails.servingsPerContainer || '');
          setFoodTotalEnergy(existing.foodDetails.totalEnergy || '');
          setFoodEnergyFromFat(existing.foodDetails.energyFromFat || '');
          setFoodIngredientsWithPercent(existing.foodDetails.ingredientsWithPercent || '');
          setFoodAllergenInfo(existing.foodDetails.allergenInfo || '');
          setFoodNetWeight(existing.foodDetails.netWeight || '');
          if (existing.foodDetails.nutrients?.length) {
            setFoodNutrients(existing.foodDetails.nutrients);
          }
        } else if (existing.nutritionFacts) {
          setFoodServingSize(existing.nutritionFacts.servingSize || '');
          setFoodServingsPerContainer(existing.nutritionFacts.servingsPerContainer || '');
          setFoodTotalEnergy(existing.nutritionFacts.totalEnergy || '');
          setFoodEnergyFromFat(existing.nutritionFacts.energyFromFat || '');
          if (existing.nutritionFacts.nutrients?.length) {
            setFoodNutrients(existing.nutritionFacts.nutrients);
          }
        }

        if (existing.drugDetails) {
          setDrugGenericName(existing.drugDetails.genericName || '');
          setDrugClassification(existing.drugDetails.classification || 'ยาสามัญประจำบ้าน');
          setDrugActiveIngredients(existing.drugDetails.activeIngredients || '');
          setDrugIndications(existing.drugDetails.indications || '');
          setDrugDosage(existing.drugDetails.dosageAndAdministration || '');
          setDrugContraindications(existing.drugDetails.contraindications || '');
          setDrugAdverseReactions(existing.drugDetails.adverseReactions || '');
        }

        if (existing.cosmeticDetails) {
          setCosmeticIngredients(existing.cosmeticDetails.ingredients?.join(', ') || '');
          setCosmeticUsage(existing.cosmeticDetails.usageInstructions || '');
          setCosmeticNetVolume(existing.cosmeticDetails.netVolume || '');
          setCosmeticBatchNumber(existing.cosmeticDetails.batchNumber || '');
          setCosmeticMfgDate(existing.cosmeticDetails.mfgDate || '');
          setCosmeticExpDate(existing.cosmeticDetails.expDate || '');
          setCosmeticNotificationNumber(existing.cosmeticDetails.notificationNumber || '');
        }

        // Checklist for revision notes
        const checklistItems = storage.getChecklistForLabel(existing.id);
        setOfficerChecklist(checklistItems);
      }
    } else if (preselectedProductId) {
      setSelectedProductId(preselectedProductId);
      const prod = products.find(p => p.id === preselectedProductId);
      if (prod) {
        setTitleTh(`${prod.productNameTh} (ฉลากดิจิทัล)`);
        setTitleEn(`${prod.productNameEn || prod.productNameTh} (Digital Label)`);
      }
    }
  }, [id, isNew, preselectedProductId, products]);

  const activeProduct = products.find(p => p.id === selectedProductId);
  const category = activeProduct?.category || 'food';

  // Quick load template for testing
  const handleLoadSampleTemplate = () => {
    if (!activeProduct) {
      warning('กรุณาเลือกผลิตภัณฑ์ก่อนโหลดตัวอย่าง');
      return;
    }

    if (activeProduct.category === 'food') {
      setTitleTh(`${activeProduct.productNameTh} (ฉบับสมบูรณ์)`);
      setTitleEn(`${activeProduct.productNameEn || 'Food Product'} (Standard Digital Label)`);
      setDescriptionTh('ผลิตภัณฑ์อาหารและเครื่องดื่มคัดสรรคุณภาพสูง ผลิตภายใต้มาตรฐาน GMP สากล รสชาติอร่อย สะอาด ถูกสุขอนามัย');
      setDescriptionEn('Premium healthy food and beverage, manufactured strictly under international GMP standards.');
      setGeneralWarningTh('ควรบริโภคก่อนวันหมดอายุที่ระบุบนบรรจุภัณฑ์ ผู้ที่มีอาการแพ้ส่วนประกอบโปรดหลีกเลี่ยง');
      setStorageWarningTh('เก็บรักษาในที่แห้งและเย็น อุณหภูมิไม่เกิน 25 องศาเซลเซียส หลีกเลี่ยงแสงแดด');
      setFoodServingSize('1 ขวด (70 มล.)');
      setFoodServingsPerContainer('1');
      setFoodTotalEnergy('45 กิโลแคลอรี');
      setFoodEnergyFromFat('0 กิโลแคลอรี');
      setFoodIngredientsWithPercent('รังนกแห้ง 1.4%, โสมสกัด 0.5%, น้ำตาลกรวด 9.0%, น้ำสะอาด 89.1%');
      setFoodAllergenInfo('ไม่มีส่วนประกอบของสารก่อภูมิแพ้');
      setFoodNetWeight('70 มล.');
    } else if (activeProduct.category === 'drug') {
      setTitleTh(`${activeProduct.productNameTh} (ฉลากกำกับยา)`);
      setTitleEn(`${activeProduct.productNameEn || 'Drug Product'} (Official Leaflet)`);
      setDescriptionTh('ยาสามัญประจำบ้านแผนปัจจุบัน บรรเทาอาการปวดและลดไข้ ออกฤทธิ์เร็ว');
      setDescriptionEn('Household remedy analgesic and antipyretic tablets.');
      setDrugGenericName('Paracetamol 500 mg');
      setDrugClassification('ยาสามัญประจำบ้าน');
      setDrugActiveIngredients('พาราเซตามอล (Paracetamol) 500 มิลลิกรัม ต่อเม็ด');
      setDrugIndications('บรรเทาอาการปวด ลดไข้ สำหรับผู้ใหญ่และเด็กอายุ 12 ปีขึ้นไป');
      setDrugDosage('รับประทานครั้งละ 1-2 เม็ด ทุก 4-6 ชั่วโมงเมื่อมีอาการ (ห้ามเกิน 8 เม็ดต่อวัน)');
      setDrugContraindications('ห้ามใช้ในผู้ที่มีประวัติแพ้ยาพาราเซตามอล หรือผู้ป่วยโรคตับรุนแรง');
      setGeneralWarningTh('คำเตือน: หากรับประทานเกินขนาดอาจเป็นอันตรายต่อตับ หลีกเลี่ยงการดื่มเครื่องดื่มแอลกอฮอล์ขณะรับประทานยานี้');
      setStorageWarningTh('เก็บที่อุณหภูมิต่ำกว่า 30°C ในที่แห้ง พ้นแสงแดด และเก็บให้พ้นมือเด็ก');
    } else if (activeProduct.category === 'cosmetic') {
      setTitleTh(`${activeProduct.productNameTh} (ฉลากเครื่องสำอาง)`);
      setTitleEn(`${activeProduct.productNameEn || 'Cosmetic Product'} (Digital Label)`);
      setDescriptionTh('ผลิตภัณฑ์บำรุงผิวหน้า ช่วยเพิ่มความชุ่มชื้น ให้ผิวกระจ่างใสอย่างเป็นธรรมชาติ');
      setDescriptionEn('Nourishing and hydrating facial cream for smooth, radiant complexion.');
      setCosmeticIngredients('Aqua, Niacinamide, Glycerin, Cetyl Alcohol, Dimethicone, Titanium Dioxide, Fragrance, Phenoxyethanol');
      setCosmeticUsage('ลูบไล้ให้ทั่วใบหน้าและลำคอเป็นประจำทุกเช้าและก่อนนอน');
      setCosmeticNetVolume('50 กรัม / มล.');
      setCosmeticBatchNumber('LOT-2026-B08');
      setCosmeticMfgDate('2026-02-01');
      setCosmeticExpDate('2028-01-31');
      setCosmeticNotificationNumber(activeProduct.regNumber || '10-1-6500012345');
      setGeneralWarningTh('หากเกิดอาการระคายเคือง ผื่นแดง หรือคัน ให้หยุดใช้ทันทีและปรึกษาแพทย์หรือเภสัชกร');
      setStorageWarningTh('เก็บในอุณหภูมิห้อง หลีกเลี่ยงความร้อนและแสงแดดจัด');
    }

    if (!imageUrl) {
      setImageUrl('https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80');
    }

    if (documents.length === 0) {
      setDocuments([
        {
          id: `doc-init-1`,
          name: 'เอกสารอนุมัติฉลากและทะเบียน_อย.pdf',
          url: '/sample-label-approval.pdf',
          type: 'application/pdf',
          uploadedAt: new Date().toISOString(),
          size: '1.4 MB'
        }
      ]);
    }

    info('โหลดข้อมูลตัวอย่างตามหมวดหมู่เรียบร้อยแล้ว ท่านสามารถปรับแต่งเพิ่มเติมได้ตามต้องการ');
  };

  // Image Upload handler (Base64 data URL)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (.jpg, .png, .webp)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      warning('ขนาดไฟล์เกิน 5MB กรุณาเลือกรูปภาพขนาดเล็กลง');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      setImageUrl(dataUrl);
      success(`อัปโหลดรูปภาพ "${file.name}" เรียบร้อยแล้ว`);
    };
    reader.readAsDataURL(file);
  };

  // Document Upload handler
  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const newDoc: LabelDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      url: '/sample-label-approval.pdf', // Mock preview url
      type: file.type || 'application/pdf',
      uploadedAt: new Date().toISOString(),
      size: formattedSize
    };

    setDocuments(prev => [newDoc, ...prev]);
    success(`เพิ่มเอกสารประกอบคำขอ "${file.name}" สำเร็จ`);
    e.target.value = '';
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    info('ลบเอกสารออกจากรายการแล้ว');
  };

  // Nutrients helper
  const handleAddNutrient = () => {
    setFoodNutrients(prev => [...prev, { name: 'วิตามิน / แร่ธาตุใหม่', amount: '0 มก.', percentDailyValue: '0%' }]);
  };

  const handleRemoveNutrient = (index: number) => {
    setFoodNutrients(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateNutrient = (index: number, field: keyof NutritionFactItem, value: string) => {
    setFoodNutrients(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Validation Rules
  const validationErrors: string[] = [];
  if (!selectedProductId) validationErrors.push('ยังไม่ได้เลือกผลิตภัณฑ์เป้าหมายจาก e-Submission (ขั้นตอนที่ 1)');
  if (!titleTh.trim()) validationErrors.push('กรุณาระบุชื่อฉลากผลิตภัณฑ์ภาษาไทย (ขั้นตอนที่ 2)');
  if (!descriptionTh.trim()) validationErrors.push('กรุณาระบุรายละเอียดและสรรพคุณภาษาไทย (ขั้นตอนที่ 2)');
  if (!generalWarningTh.trim()) validationErrors.push('กรุณาระบุคำเตือนและข้อควรระวังตามประกาศ อย. (ขั้นตอนที่ 2)');
  if (activeProduct?.category === 'drug' && (!drugIndications.trim() || !drugDosage.trim())) {
    validationErrors.push('หมวดยา: ต้องระบุข้อบ่งใช้และขนาดวิธีใช้อย่างครบถ้วน (ขั้นตอนที่ 2)');
  }
  if (activeProduct?.category === 'cosmetic' && !cosmeticIngredients.trim()) {
    validationErrors.push('หมวดเครื่องสำอาง: ต้องระบุส่วนประกอบตามระบบสากล (INCI) (ขั้นตอนที่ 2)');
  }
  if (!imageUrl.trim()) validationErrors.push('ต้องมีรูปภาพบรรจุภัณฑ์ผลิตภัณฑ์อย่างน้อย 1 ภาพ (ขั้นตอนที่ 3)');
  if (documents.length === 0) validationErrors.push('ต้องแนบเอกสารประกอบคำขออย่างน้อย 1 ฉบับ (ขั้นตอนที่ 3)');

  const isValidForSubmit = validationErrors.length === 0 && repAuth.allowed;

  // Build payload
  const buildLabelPayload = (targetStatus: LabelStatus, targetVersion: number): DigitalLabel => {
    return {
      id: id && id !== 'new' ? id : `lbl-${Date.now()}`,
      productId: selectedProductId,
      version: targetVersion,
      status: targetStatus,
      titleTh: titleTh || (activeProduct?.productNameTh ?? 'แบบร่างฉลาก'),
      titleEn: titleEn || (activeProduct?.productNameEn ?? 'Draft Label'),
      descriptionTh,
      descriptionEn,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
      generalWarningTh,
      generalWarningEn,
      storageWarningTh,
      storageWarningEn,
      documents,
      scanCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: targetStatus === 'pending_review' ? new Date().toISOString() : undefined,
      submittedByName: currentUser?.fullName || 'ผู้ประกอบการ',
      submittedByRole: currentUser?.role || 'entrepreneur',
      revisionNotes: targetStatus === 'pending_review' ? undefined : revisionNotes,
      foodDetails: activeProduct?.category === 'food' ? {
        servingSize: foodServingSize,
        servingsPerContainer: foodServingsPerContainer,
        totalEnergy: foodTotalEnergy,
        energyFromFat: foodEnergyFromFat,
        ingredientsWithPercent: foodIngredientsWithPercent,
        allergenInfo: foodAllergenInfo,
        netWeight: foodNetWeight,
        nutrients: foodNutrients
      } : undefined,
      nutritionFacts: activeProduct?.category === 'food' ? {
        servingSize: foodServingSize,
        servingsPerContainer: foodServingsPerContainer,
        totalEnergy: foodTotalEnergy,
        energyFromFat: foodEnergyFromFat,
        nutrients: foodNutrients
      } : undefined,
      drugDetails: activeProduct?.category === 'drug' ? {
        genericName: drugGenericName || activeProduct.productNameTh,
        dosageForm: 'ยาแผนปัจจุบัน',
        strength: 'ตามทะเบียน',
        classification: drugClassification,
        activeIngredients: drugActiveIngredients,
        indications: drugIndications,
        contraindications: drugContraindications,
        dosageAndAdministration: drugDosage,
        adverseReactions: drugAdverseReactions,
        storageConditions: storageWarningTh,
        leafletPdfUrl: '/sample-drug-leaflet.pdf'
      } : undefined,
      cosmeticDetails: activeProduct?.category === 'cosmetic' ? {
        ingredients: cosmeticIngredients.split(',').map(s => s.trim()).filter(Boolean),
        usageInstructions: cosmeticUsage,
        warnings: generalWarningTh,
        netVolume: cosmeticNetVolume,
        batchNumber: cosmeticBatchNumber,
        mfgDate: cosmeticMfgDate,
        expDate: cosmeticExpDate,
        notificationNumber: cosmeticNotificationNumber || activeProduct.regNumber
      } : undefined
    };
  };

  // Save Draft
  const handleSaveDraft = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProductId) {
      warning('กรุณาเลือกผลิตภัณฑ์ก่อนบันทึกแบบร่าง');
      setCurrentStep(1);
      return;
    }

    const payload = buildLabelPayload('draft', version);
    storage.saveLabel(payload, currentUser || undefined, 'บันทึกแบบร่างฉลาก (Draft)');
    success('บันทึกแบบร่างฉลากดิจิทัลเรียบร้อยแล้ว');
    navigate('/entrepreneur/labels');
  };

  // Submit to FDA
  const handleSubmitReview = () => {
    if (!repAuth.allowed) {
      error(repAuth.reason || 'ท่านไม่มีอำนาจยื่นคำขอตามหนังสือมอบอำนาจ');
      return;
    }

    if (!isValidForSubmit) {
      warning('กรุณากรอกข้อมูลและแนบเอกสารให้ครบถ้วนก่อนส่งคำขอ');
      setCurrentStep(4);
      return;
    }

    if (!isLegalConfirmed) {
      warning('กรุณาทำเครื่องหมายถูกเพื่อรับรองความถูกต้องของข้อมูลตามกฎหมาย');
      return;
    }

    const nextVer = currentStatus === 'revision_required' ? version + 1 : version;
    const noteMsg = currentStatus === 'revision_required' 
      ? `ยื่นส่งคำขอพิจารณาใหม่ (v${nextVer}.0) หลังปรับปรุงตามข้อสังเกตของเจ้าหน้าที่` 
      : `ยื่นคำขอฉลากดิจิทัลใหม่ (v${nextVer}.0) สู่คิวงานตรวจสอบ อย.`;

    const payload = buildLabelPayload('pending_review', nextVer);
    storage.saveLabel(payload, currentUser || undefined, noteMsg);

    success('ยื่นคำขอฉลากดิจิทัลเข้าสู่ระบบตรวจพิจารณาของ อย. เรียบร้อยแล้ว!');
    navigate('/entrepreneur/labels');
  };

  const timelineEvents = id ? storage.getTimelineForLabel(id) : [];
  const versionHistory = id ? storage.getLabelVersions(id) : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'จัดการฉลากดิจิทัล', path: '/entrepreneur/labels' },
          { label: isNew ? 'สร้างคำขอฉลากใหม่' : `แก้ไขฉลาก (${titleTh || 'คำขอ'})` }
        ]}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {isNew ? 'สร้างคำขอฉลากดิจิทัลใหม่' : `แก้ไขคำขอฉลาก: ${titleTh || 'ฉลากดิจิทัล'}`}
            </h2>
            <StatusBadge status={currentStatus} size="sm" />
            <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              v{version}.0
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ระบบจัดทำและยื่นคำขอฉลากดิจิทัลเชื่อมโยงฐานข้อมูล อย. และ e-Submission
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          {timelineEvents.length > 0 && (
            <button
              type="button"
              onClick={() => setIsTimelineOpen(true)}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
              title="ดูประวัติการดำเนินงาน Timeline"
            >
              <Clock className="w-3.5 h-3.5 text-blue-700" />
              <span>ประวัติคำขอ ({timelineEvents.length})</span>
            </button>
          )}

          {versionHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setIsDiffOpen(true)}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
              title="เปรียบเทียบเวอร์ชัน"
            >
              <GitCompare className="w-3.5 h-3.5 text-indigo-700" />
              <span>ประวัติเวอร์ชัน ({versionHistory.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>พรีวิวฉลาก (Preview)</span>
          </button>
        </div>
      </div>

      {/* Representative Warning if restricted */}
      {!repAuth.allowed && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <strong className="text-red-900 block font-bold">
              การจำกัดสิทธิ์ตัวแทนผู้รับมอบอำนาจ (Authority Restriction):
            </strong>
            <p className="leading-relaxed">{repAuth.reason}</p>
            <span className="text-[11px] text-red-700 block">
              * ปุ่มยืนยันส่งคำขอจะถูกปิดการทำงานจนกว่าจะได้รับการต่ออายุหรือแก้ไขขอบเขตอำนาจในหน้าจัดการตัวแทน
            </span>
          </div>
        </div>
      )}

      {/* Officer Feedback Banner if revision required */}
      {currentStatus === 'revision_required' && (
        <OfficerFeedbackBanner
          revisionNotes={revisionNotes}
          checklist={officerChecklist}
          officerName="ภญ. วรรณภา สิริกุล"
          onFocusRevisionField={() => setCurrentStep(2)}
        />
      )}

      {/* 4-Step Wizard Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          {[
            { step: 1, label: '1. ผลิตภัณฑ์ e-Submission', desc: 'ดึงข้อมูลและล็อกอ้างอิง' },
            { step: 2, label: '2. ข้อมูลฉลากแยกหมวด', desc: `${category === 'food' ? 'อาหาร & ตารางโภชนาการ' : category === 'drug' ? 'ยา & ข้อบ่งใช้' : 'เครื่องสำอาง & INCI'}` },
            { step: 3, label: '3. อัปโหลดรูปภาพ & ไฟล์', desc: 'เลือกไฟล์จริงจากคอมพิวเตอร์' },
            { step: 4, label: '4. ตรวจสอบ & หน้าสรุป', desc: 'Checklist & กดยืนยันส่ง' }
          ].map(s => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStep(s.step)}
                className={`text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                  isActive
                    ? 'border-blue-900 bg-blue-50/50 ring-2 ring-blue-900/10'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30 hover:bg-slate-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isActive ? 'text-blue-900' : isCompleted ? 'text-emerald-800' : 'text-slate-600'}`}>
                    {s.label}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 truncate block">{s.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wizard Step Content */}
      <div className="space-y-6">
        {/* STEP 1: e-Submission Master Data Selection */}
        {currentStep === 1 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">เลือกผลิตภัณฑ์และดึงข้อมูลทะเบียน e-Submission</h3>
                  <p className="text-xs text-slate-500">
                    ข้อมูลอ้างอิงจากฐานข้อมูลทะเบียนผลิตภัณฑ์ อย. จะถูกล็อกเพื่อป้องกันการแก้ไขโดยพลการ
                  </p>
                </div>
              </div>
            </div>

            {/* Product Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                เลือกผลิตภัณฑ์เป้าหมายที่ได้รับอนุญาต (*):
              </label>
              <select
                value={selectedProductId}
                onChange={e => {
                  const prodId = e.target.value;
                  setSelectedProductId(prodId);
                  const p = products.find(prod => prod.id === prodId);
                  if (p && !titleTh) {
                    setTitleTh(`${p.productNameTh} (ฉลากดิจิทัล)`);
                    setTitleEn(`${p.productNameEn || p.productNameTh} (Digital Label)`);
                  }
                }}
                disabled={!isNew}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 font-medium"
              >
                <option value="">-- กรุณาเลือกผลิตภัณฑ์ที่ต้องการทำฉลากดิจิทัล --</option>
                {products.map(prod => (
                  <option key={prod.id} value={prod.id}>
                    [{prod.regNumber}] {prod.productNameTh} ({prod.categoryNameTh})
                  </option>
                ))}
              </select>
            </div>

            {/* Locked e-Submission Master Reference Card */}
            {activeProduct ? (
              <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/30 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-900" />
                    <span className="font-bold text-xs text-blue-950 uppercase tracking-wide">
                      ข้อมูลอ้างอิงทะเบียนจากระบบ e-Submission (อย.)
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Lock className="w-2.5 h-2.5" />
                    <span>ล็อกป้องกันการแก้ไข (Locked Reference)</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">เลขสารบบ / ทะเบียนตำรับยา:</span>
                    <strong className="text-blue-950 font-mono text-sm block mt-0.5">{activeProduct.regNumber}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">Newcode: {activeProduct.newcode}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">ชื่อการค้าที่ได้รับอนุญาต (ภาษาไทย):</span>
                    <p className="font-bold text-slate-800 mt-0.5 line-clamp-2">{activeProduct.productNameTh}</p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Trade Name (English):</span>
                    <p className="font-medium text-slate-700 mt-0.5 italic line-clamp-2">
                      {activeProduct.productNameEn || '-'}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">หมวดหมู่ผลิตภัณฑ์สุขภาพ:</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">{activeProduct.categoryNameTh}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">สถานที่ผลิต / นำเข้า:</span>
                    <p className="text-slate-800 font-medium text-[11px] mt-0.5 line-clamp-2">
                      {activeProduct.manufacturerName}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">สถานะทะเบียน & อ้างอิงคำขอ:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={activeProduct.registrationStatus} size="sm" />
                      <span className="font-mono text-[10px] text-slate-500">{activeProduct.eSubmissionRef}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-white/70 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span>วันหมดอายุทะเบียน: <strong>{activeProduct.expiryDate}</strong></span>
                  <span>ซิงค์ข้อมูลล่าสุด: {new Date(activeProduct.lastSyncedAt).toLocaleString('th-TH')}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed rounded-2xl bg-slate-50">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30 text-blue-900" />
                <p>กรุณาเลือกผลิตภัณฑ์ด้านบนเพื่อดึงข้อมูลทะเบียน e-Submission อัตโนมัติ</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Category-Specific Structured Label Content */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header with Template Button */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      ข้อมูลรายละเอียดฉลากเฉพาะหมวดหมู่ ({activeProduct?.categoryNameTh || 'ทั่วไป'})
                    </h3>
                    <p className="text-xs text-slate-500">
                      กรอกข้อมูลตามสัดส่วนที่กฎหมายกำหนด แยกช่องชัดเจนแทนการพิมพ์รวม
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLoadSampleTemplate}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>โหลดตัวอย่างข้อมูลตามหมวดหมู่</span>
                </button>
              </div>

              {/* General Core Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ชื่อฉลากผลิตภัณฑ์ (ภาษาไทย) (*):
                  </label>
                  <input
                    type="text"
                    required
                    value={titleTh}
                    onChange={e => setTitleTh(e.target.value)}
                    placeholder="เช่น เครื่องดื่มรังนกแท้สำเร็จรูป ตรา เฮลท์โกลด์ (ขวด 70 มล.)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Product Title (English):
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={e => setTitleEn(e.target.value)}
                    placeholder="e.g. HealthGold Instant Bird's Nest Beverage (70 ml)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    รายละเอียดและสรรพคุณที่ได้รับอนุญาต (ภาษาไทย) (*):
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={descriptionTh}
                    onChange={e => setDescriptionTh(e.target.value)}
                    placeholder="ระบุคำบรรยายและสรรพคุณตามที่ได้รับอนุญาตในทะเบียน ห้ามโอ้อวดเกินจริง..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    คำเตือนและข้อควรระวังตามประกาศกระทรวงสาธารณสุข (*):
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={generalWarningTh}
                    onChange={e => setGeneralWarningTh(e.target.value)}
                    placeholder="ระบุคำเตือนตามประกาศ อย. เช่น เด็กและสตรีมีครรภ์ไม่ควรรับประทาน..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    วิธีการเก็บรักษา (Storage Conditions):
                  </label>
                  <textarea
                    rows={2}
                    value={storageWarningTh}
                    onChange={e => setStorageWarningTh(e.target.value)}
                    placeholder="เช่น เก็บในที่แห้งและเย็น อุณหภูมิไม่เกิน 30°C หลีกเลี่ยงแสงแดด"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Category: FOOD Specifics */}
            {category === 'food' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                      หมวดอาหาร
                    </span>
                    <h4 className="font-bold text-sm text-slate-800">
                      ตารางข้อมูลโภชนาการและสารก่อภูมิแพ้ (Nutrition Facts & Allergens)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNutrient}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>เพิ่มสารอาหาร</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1">หนึ่งหน่วยบริโภค:</label>
                    <input
                      type="text"
                      value={foodServingSize}
                      onChange={e => setFoodServingSize(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">จำนวนหน่วยบริโภคต่อภาชนะ:</label>
                    <input
                      type="text"
                      value={foodServingsPerContainer}
                      onChange={e => setFoodServingsPerContainer(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">พลังงานทั้งหมด:</label>
                    <input
                      type="text"
                      value={foodTotalEnergy}
                      onChange={e => setFoodTotalEnergy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">พลังงานจากไขมัน:</label>
                    <input
                      type="text"
                      value={foodEnergyFromFat}
                      onChange={e => setFoodEnergyFromFat(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                {/* Nutrient Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b text-slate-600 font-semibold text-[11px]">
                      <tr>
                        <th className="py-2 px-3">ชื่อสารอาหาร</th>
                        <th className="py-2 px-3 w-32">ปริมาณต่อหน่วย</th>
                        <th className="py-2 px-3 w-32">% ปริมาณที่แนะนำต่อวัน</th>
                        <th className="py-2 px-3 w-12 text-center">ลบ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {foodNutrients.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.name}
                              onChange={e => handleUpdateNutrient(idx, 'name', e.target.value)}
                              className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.amount}
                              onChange={e => handleUpdateNutrient(idx, 'amount', e.target.value)}
                              className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.percentDailyValue}
                              onChange={e => handleUpdateNutrient(idx, 'percentDailyValue', e.target.value)}
                              className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveNutrient(idx)}
                              className="p-1 text-slate-400 hover:text-red-600 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      ส่วนประกอบสำคัญโดยประมาณ (%):
                    </label>
                    <input
                      type="text"
                      value={foodIngredientsWithPercent}
                      onChange={e => setFoodIngredientsWithPercent(e.target.value)}
                      placeholder="เช่น รังนกแท้ 1.4%, โสมสกัด 0.5%, น้ำตาลกรวด 9.0%"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      ข้อมูลสำหรับผู้แพ้อาหาร (Allergen Information):
                    </label>
                    <input
                      type="text"
                      value={foodAllergenInfo}
                      onChange={e => setFoodAllergenInfo(e.target.value)}
                      placeholder="เช่น มีแป้งสาลีและถั่วเหลือง หรือ ไม่มีสารก่อภูมิแพ้"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Category: DRUG Specifics */}
            {category === 'drug' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold text-[10px]">
                    หมวดยาแผนปัจจุบัน
                  </span>
                  <h4 className="font-bold text-sm text-slate-800">
                    ข้อมูลกำกับยา ข้อบ่งใช้ ขนาด และข้อห้ามใช้ (Drug Specifications)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ตัวยาสำคัญและความแรง (*):</label>
                    <input
                      type="text"
                      value={drugActiveIngredients}
                      onChange={e => setDrugActiveIngredients(e.target.value)}
                      placeholder="เช่น Paracetamol 500 mg ต่อเม็ด"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">การจัดประเภทยา (*):</label>
                    <select
                      value={drugClassification}
                      onChange={e => setDrugClassification(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="ยาสามัญประจำบ้าน">ยาสามัญประจำบ้าน</option>
                      <option value="ยาอันตราย">ยาอันตราย</option>
                      <option value="ยาควบคุมพิเศษ">ยาควบคุมพิเศษ</option>
                      <option value="ยาบรรจุเสร็จ">ยาบรรจุเสร็จ</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">ข้อบ่งใช้ (Indications) (*):</label>
                    <textarea
                      rows={2}
                      value={drugIndications}
                      onChange={e => setDrugIndications(e.target.value)}
                      placeholder="เช่น บรรเทาอาการปวด ลดไข้ สำหรับผู้ใหญ่และเด็ก..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">ขนาดและวิธีใช้ (Dosage & Administration) (*):</label>
                    <textarea
                      rows={2}
                      value={drugDosage}
                      onChange={e => setDrugDosage(e.target.value)}
                      placeholder="เช่น รับประทานครั้งละ 1-2 เม็ด ทุก 4-6 ชั่วโมงเมื่อมีอาการ..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ข้อห้ามใช้ (Contraindications) (*):</label>
                    <textarea
                      rows={2}
                      value={drugContraindications}
                      onChange={e => setDrugContraindications(e.target.value)}
                      placeholder="เช่น ห้ามใช้ในผู้ที่มีประวัติแพ้ยานี้ หรือโรคตับรุนแรง..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">อาการไม่พึงประสงค์ (Adverse Reactions):</label>
                    <textarea
                      rows={2}
                      value={drugAdverseReactions}
                      onChange={e => setDrugAdverseReactions(e.target.value)}
                      placeholder="เช่น อาจเกิดผื่นลมพิษ หรืออาการง่วงซึม..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Category: COSMETIC Specifics */}
            {category === 'cosmetic' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-bold text-[10px]">
                    หมวดเครื่องสำอาง
                  </span>
                  <h4 className="font-bold text-sm text-slate-800">
                    ส่วนประกอบสากล (INCI Ingredients) และข้อมูลรุ่นการผลิต
                  </h4>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      ส่วนประกอบทั้งหมดตามระบบสากล (INCI Ingredients) คั่นด้วยเครื่องหมายจุลภาค (*):
                    </label>
                    <textarea
                      rows={3}
                      value={cosmeticIngredients}
                      onChange={e => setCosmeticIngredients(e.target.value)}
                      placeholder="e.g. Aqua, Niacinamide, Glycerin, Cetyl Alcohol, Dimethicone, Fragrance"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">วิธีใช้ (*):</label>
                      <input
                        type="text"
                        value={cosmeticUsage}
                        onChange={e => setCosmeticUsage(e.target.value)}
                        placeholder="เช่น ลูบไล้ทั่วใบหน้าเช้า-เย็น"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ปริมาณสุทธิ:</label>
                      <input
                        type="text"
                        value={cosmeticNetVolume}
                        onChange={e => setCosmeticNetVolume(e.target.value)}
                        placeholder="50 มล. / กรัม"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ครั้งที่ผลิต (Lot No.):</label>
                      <input
                        type="text"
                        value={cosmeticBatchNumber}
                        onChange={e => setCosmeticBatchNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">วันที่ผลิต (MFG Date):</label>
                      <input
                        type="date"
                        value={cosmeticMfgDate}
                        onChange={e => setCosmeticMfgDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">วันหมดอายุ (EXP Date):</label>
                      <input
                        type="date"
                        value={cosmeticExpDate}
                        onChange={e => setCosmeticExpDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Local File Uploads (Images & PDF Documents from PC) */}
        {currentStep === 3 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  อัปโหลดรูปภาพผลิตภัณฑ์และเอกสารประกอบคำขอจากเครื่องคอมพิวเตอร์
                </h3>
                <p className="text-xs text-slate-500">
                  รองรับการเลือกไฟล์จริงจากคอมพิวเตอร์ของคุณ พร้อมระบบแสดงพรีวิวทันที
                </p>
              </div>
            </div>

            {/* Packaging Image Section */}
            <div className="space-y-3">
              <label className="block font-bold text-xs text-slate-800">
                1. รูปภาพบรรจุภัณฑ์ผลิตภัณฑ์ (Packaging Image) (*):
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Upload Box */}
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-2xl p-5 text-center transition bg-slate-50/50 hover:bg-blue-50/30">
                  <Upload className="w-8 h-8 text-blue-900 mx-auto mb-2 opacity-70" />
                  <p className="text-xs font-bold text-slate-800">เลือกรูปภาพจากเครื่องคอมพิวเตอร์</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">รองรับไฟล์ .JPG, .PNG, .WEBP (ขนาดไม่เกิน 5 MB)</p>

                  <label className="mt-3 inline-block px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition">
                    <span>เลือกไฟล์รูปภาพ (Browse File)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  <div className="mt-3 text-[10px] text-slate-400">
                    หรือระบุ URL รูปภาพ:
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Preview Box */}
                <div className="border rounded-2xl p-4 bg-white flex flex-col items-center justify-center min-h-[160px] text-center">
                  {imageUrl ? (
                    <div className="relative group">
                      <img
                        src={imageUrl}
                        alt="Product packaging preview"
                        className="w-44 h-44 object-cover rounded-xl shadow-xs border"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 shadow transition"
                        title="ลบรูปภาพ"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-slate-500 block mt-1.5 font-medium">
                        ตัวอย่างรูปภาพบรรจุภัณฑ์ที่แนบ
                      </span>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs space-y-1">
                      <Package className="w-10 h-10 mx-auto opacity-30" />
                      <p>ยังไม่มีรูปภาพบรรจุภัณฑ์</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Supporting Documents Section */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-bold text-xs text-slate-800">
                    2. เอกสารประกอบคำขอ (Supporting Documents) (*):
                  </label>
                  <p className="text-[11px] text-slate-500">
                    เช่น ใบสำคัญการขึ้นทะเบียน, ผลตรวจวิเคราะห์สารอาหาร, เอกสารกำกับยาฉบับทางการ
                  </p>
                </div>

                <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>แนบไฟล์ PDF จากเครื่อง</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleDocumentFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Document List */}
              <div className="space-y-2">
                {documents.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-2xl bg-slate-50">
                    <FileText className="w-8 h-8 mx-auto mb-1 opacity-30" />
                    <p>ยังไม่มีเอกสารแนบประกอบคำขอ (ต้องมีอย่างน้อย 1 ฉบับ)</p>
                  </div>
                ) : (
                  documents.map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 bg-red-100 text-red-800 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{doc.name}</p>
                          <span className="text-[10px] text-slate-400">
                            ขนาด: {doc.size} • อัปโหลดเมื่อ: {new Date(doc.uploadedAt).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setPdfPreviewUrl(doc.url)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 rounded-lg text-xs font-medium transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>ดูเอกสาร</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition"
                          title="ลบเอกสาร"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Pre-submission Validation & Summary Sheet */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Validation Checklist Card */}
            <div className={`p-5 rounded-2xl border shadow-xs space-y-3 ${
              validationErrors.length === 0 ? 'bg-emerald-50/60 border-emerald-300' : 'bg-red-50/70 border-red-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {validationErrors.length === 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {validationErrors.length === 0 
                        ? 'ข้อมูลครบถ้วนพร้อมส่งคำขอ (Pre-submission Validation Passed)' 
                        : `ตรวจพบข้อผิดพลาด / ข้อมูลไม่ครบถ้วน (${validationErrors.length} รายการ)`}
                    </h3>
                    <p className="text-xs text-slate-600">
                      ระบบทำการตรวจสอบฟิลด์บังคับและความครบถ้วนของหลักฐานประกอบคำขอ
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  validationErrors.length === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {validationErrors.length === 0 ? 'ผ่านเกณฑ์ตรวจสอบ' : 'ต้องแก้ไข'}
                </span>
              </div>

              {validationErrors.length > 0 && (
                <ul className="space-y-1.5 pt-2 border-t border-red-200/80 text-xs text-red-800">
                  {validationErrors.map((err, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Summary Review Sheet */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      หน้าสรุปรายละเอียดคำขอฉลากดิจิทัล (Application Summary Sheet)
                    </h3>
                    <p className="text-xs text-slate-500">
                      กรุณาตรวจสอบข้อมูลทั้งหมดให้ถูกต้องก่อนกดยืนยันส่งต่อเจ้าหน้าที่ อย.
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Reference */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">เลขสารบบ / ทะเบียน e-Submission:</span>
                  <strong className="text-blue-900 font-mono text-sm">{activeProduct?.regNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ชื่อผลิตภัณฑ์ที่ได้รับอนุญาต:</span>
                  <span className="font-bold text-slate-800">{activeProduct?.productNameTh}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">หมวดหมู่:</span>
                  <span className="text-slate-700 font-semibold">{activeProduct?.categoryNameTh}</span>
                </div>
              </div>

              {/* Label Content Summary */}
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-white border rounded-xl">
                    <span className="text-slate-400 block text-[10px] font-semibold">ชื่อฉลากภาษาไทย:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{titleTh || '-'}</p>
                  </div>
                  <div className="p-3 bg-white border rounded-xl">
                    <span className="text-slate-400 block text-[10px] font-semibold">Product Title (English):</span>
                    <p className="font-medium text-slate-700 mt-0.5 italic">{titleEn || '-'}</p>
                  </div>
                </div>

                <div className="p-3 bg-white border rounded-xl">
                  <span className="text-slate-400 block text-[10px] font-semibold">รายละเอียดและสรรพคุณ:</span>
                  <p className="text-slate-800 mt-0.5 leading-relaxed">{descriptionTh || '-'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                    <span className="text-amber-900 block text-[10px] font-bold">คำเตือนและข้อควรระวัง:</span>
                    <p className="text-amber-950 mt-0.5">{generalWarningTh || '-'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-xl">
                    <span className="text-slate-500 block text-[10px] font-semibold">วิธีเก็บรักษา:</span>
                    <p className="text-slate-700 mt-0.5">{storageWarningTh || '-'}</p>
                  </div>
                </div>

                {/* Attachments preview */}
                <div className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {imageUrl && (
                      <img src={imageUrl} alt="thumb" className="w-10 h-10 object-cover rounded-lg border" />
                    )}
                    <div>
                      <span className="text-[10px] text-slate-400 block">เอกสารและรูปภาพที่แนบ:</span>
                      <strong className="text-slate-800">
                        รูปภาพบรรจุภัณฑ์ {imageUrl ? '1 ภาพ' : '0'} • เอกสารประกอบ {documents.length} ฉบับ
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Acknowledgment Checkbox */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLegalConfirmed}
                    onChange={e => setIsLegalConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-900 focus:ring-blue-600"
                  />
                  <span className="text-slate-800 leading-relaxed font-medium">
                    ข้าพเจ้าขอรับรองว่า ข้อมูลและเอกสารหลักฐานทั้งหมดที่ยื่นคำขอนี้ เป็นความจริง ถูกต้อง และตรงตามที่ได้รับอนุญาตจากสำนักงานคณะกรรมการอาหารและยา (อย.) ทุกประการ หากมีข้อมูลอันเป็นเท็จ ข้าพเจ้ายินยอมรับผิดตามกฎหมายที่เกี่ยวข้อง
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm sticky bottom-4 z-20">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ย้อนกลับ (Back)</span>
              </button>
            ) : (
              <Link
                to="/entrepreneur/labels"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                ยกเลิก
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSaveDraft()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึกแบบร่าง (Save Draft)</span>
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <span>ถัดไป (Next)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={!isValidForSubmit || !isLegalConfirmed}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {currentStatus === 'revision_required' ? 'ยื่นส่งคำขอพิจารณาใหม่ (Resubmit)' : 'ยืนยันและส่งคำขอ (Submit to FDA)'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="ตัวอย่างการแสดงผลฉลากดิจิทัล (Live Citizen Preview)"
        subtitle="มุมมองเมื่อประชาชนสแกน QR Code ตรวจสอบ"
        maxWidth="xl"
      >
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
          <div className="bg-[#002B49] text-white p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-blue-200">สำนักงานคณะกรรมการอาหารและยา</span>
              <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded">v{version}.0</span>
            </div>
            <h4 className="text-base font-bold mt-1">{titleTh || 'ชื่อฉลากผลิตภัณฑ์ (ตัวอย่าง)'}</h4>
            <p className="text-xs text-slate-300">{titleEn || 'Product Name (Preview)'}</p>
          </div>

          <div className="space-y-3 bg-white p-4 rounded-xl border">
            {imageUrl && (
              <img src={imageUrl} alt="Packaging" className="w-full h-44 object-cover rounded-lg border" />
            )}
            <p className="text-slate-700 leading-relaxed">{descriptionTh || 'ไม่มีคำบรรยาย'}</p>
            {generalWarningTh && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                <strong>คำเตือน:</strong> {generalWarningTh}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Timeline Modal */}
      <Modal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        title="ประวัติและสถานะการดำเนินงานคำขอ (Workflow Timeline)"
        subtitle={`คำขอฉลาก: ${titleTh || activeProduct?.productNameTh}`}
        maxWidth="2xl"
      >
        <div className="py-2">
          <TimelineView events={timelineEvents} currentVersion={version} />
        </div>
      </Modal>

      {/* Version Diff Modal */}
      {id && (
        <VersionDiffModal
          isOpen={isDiffOpen}
          onClose={() => setIsDiffOpen(false)}
          currentLabel={buildLabelPayload(currentStatus, version)}
          versions={versionHistory}
        />
      )}

      {/* PDF Document Viewer Modal */}
      {pdfPreviewUrl && (
        <PDFViewerModal
          isOpen={!!pdfPreviewUrl}
          onClose={() => setPdfPreviewUrl(null)}
          pdfUrl={pdfPreviewUrl}
          title="เอกสารประกอบคำขอฉลากดิจิทัล"
        />
      )}
    </div>
  );
};
