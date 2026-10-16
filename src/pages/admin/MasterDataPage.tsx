import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { ProductCategory, ChecklistTemplateItem } from '../../services/types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { 
  Database, 
  Plus, 
  Check, 
  FileText, 
  Tag, 
  Layers, 
  CheckCircle2, 
  ClipboardCheck, 
  FileEdit, 
  Trash2, 
  AlertTriangle,
  Lock,
  Power
} from 'lucide-react';

interface CategoryItem {
  code: string;
  nameTh: string;
  nameEn: string;
  status: 'ACTIVE' | 'INACTIVE';
  prefix: string;
}

interface DocTypeItem {
  code: string;
  nameTh: string;
  ext: string;
  required: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export const MasterDataPage: React.FC = () => {
  const { success, warning, error } = useToast();
  const [activeTab, setActiveTab] = useState<'categories' | 'doctypes' | 'checklists'>('categories');

  // Categories State
  const [categories, setCategories] = useState<CategoryItem[]>([
    { code: 'food', nameTh: 'อาหารและเครื่องดื่ม', nameEn: 'Food and Beverages', status: 'ACTIVE', prefix: '10-1-' },
    { code: 'drug', nameTh: 'ยาแผนปัจจุบัน', nameEn: 'Modern Pharmaceuticals', status: 'ACTIVE', prefix: '1A ' },
    { code: 'cosmetic', nameTh: 'เครื่องสำอาง', nameEn: 'Cosmetics', status: 'ACTIVE', prefix: '10-1-6' },
    { code: 'medical_device', nameTh: 'เครื่องมือแพทย์', nameEn: 'Medical Devices', status: 'ACTIVE', prefix: 'MD-' },
    { code: 'hazardous', nameTh: 'วัตถุอันตรายที่ใช้ในบ้านเรือน', nameEn: 'Hazardous Substances', status: 'ACTIVE', prefix: 'HZ-' }
  ]);

  // Document Types State
  const [docTypes, setDocTypes] = useState<DocTypeItem[]>([
    { code: 'LEAFLET', nameTh: 'เอกสารกำกับยาและผลิตภัณฑ์ (Official Leaflet)', ext: '.pdf', required: true, status: 'ACTIVE' },
    { code: 'LAB_REPORT', nameTh: 'ผลการตรวจวิเคราะห์ทางห้องปฏิบัติการ (Lab Certificate)', ext: '.pdf', required: false, status: 'ACTIVE' },
    { code: 'GMP_CERT', nameTh: 'หนังสือรับรองมาตรฐานสถานที่ผลิต (GMP / ISO 22000)', ext: '.pdf', required: true, status: 'ACTIVE' },
    { code: 'PACKAGING_ARTWORK', nameTh: 'แบบอาร์ตเวิร์กฉลากจริง (Package Artwork)', ext: '.pdf, .png', required: true, status: 'ACTIVE' }
  ]);

  // Checklist Templates State
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplateItem[]>(() =>
    storage.getChecklistTemplates()
  );
  const [checklistCatFilter, setChecklistCatFilter] = useState<string>('ALL');

  // Modal State for Category Add/Edit
  const [categoryModal, setCategoryModal] = useState<{ isOpen: boolean; editing?: CategoryItem | null }>({
    isOpen: false,
    editing: null
  });
  const [catCode, setCatCode] = useState('');
  const [catNameTh, setCatNameTh] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catPrefix, setCatPrefix] = useState('');

  // Modal State for DocType Add/Edit
  const [docTypeModal, setDocTypeModal] = useState<{ isOpen: boolean; editing?: DocTypeItem | null }>({
    isOpen: false,
    editing: null
  });
  const [docCode, setDocCode] = useState('');
  const [docNameTh, setDocNameTh] = useState('');
  const [docExt, setDocExt] = useState('');
  const [docRequired, setDocRequired] = useState(true);

  // Modal State for Checklist Item Add/Edit
  const [checklistModal, setChecklistModal] = useState<{ isOpen: boolean; editing?: ChecklistTemplateItem | null }>({
    isOpen: false,
    editing: null
  });
  const [chkTitle, setChkTitle] = useState('');
  const [chkDesc, setChkDesc] = useState('');
  const [chkCat, setChkCat] = useState<ProductCategory | 'ALL'>('food');
  const [chkRequired, setChkRequired] = useState(true);

  // --- CATEGORY HANDLERS ---
  const handleOpenCatModal = (cat?: CategoryItem) => {
    if (cat) {
      setCatCode(cat.code);
      setCatNameTh(cat.nameTh);
      setCatNameEn(cat.nameEn);
      setCatPrefix(cat.prefix);
      setCategoryModal({ isOpen: true, editing: cat });
    } else {
      setCatCode('');
      setCatNameTh('');
      setCatNameEn('');
      setCatPrefix('');
      setCategoryModal({ isOpen: true, editing: null });
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catCode.trim() || !catNameTh.trim()) {
      warning('กรุณาระบุรหัสหมวดหมู่และชื่อภาษาไทย');
      return;
    }

    // Duplicate Check
    const dup = categories.find(
      c => (c.code.toLowerCase() === catCode.trim().toLowerCase() || c.nameTh === catNameTh.trim()) &&
           c.code !== categoryModal.editing?.code
    );
    if (dup) {
      warning('รหัสหมวดหมู่หรือชื่อหมวดหมู่นี้ซ้ำกับรายการที่มีอยู่แล้ว');
      return;
    }

    if (categoryModal.editing) {
      setCategories(prev =>
        prev.map(c =>
          c.code === categoryModal.editing!.code
            ? { ...c, nameTh: catNameTh.trim(), nameEn: catNameEn.trim(), prefix: catPrefix.trim() }
            : c
        )
      );
      success(`แก้ไขข้อมูลหมวดหมู่ "${catNameTh}" เรียบร้อยแล้ว`);
    } else {
      setCategories(prev => [
        ...prev,
        {
          code: catCode.trim().toLowerCase(),
          nameTh: catNameTh.trim(),
          nameEn: catNameEn.trim() || 'Product Category',
          status: 'ACTIVE',
          prefix: catPrefix.trim() || 'GEN-'
        }
      ]);
      success(`เพิ่มหมวดหมู่ Master Data "${catNameTh}" สำเร็จ`);
    }
    setCategoryModal({ isOpen: false, editing: null });
  };

  const handleToggleCategoryStatus = (cat: CategoryItem) => {
    // In-Use Check
    if (cat.status === 'ACTIVE') {
      const inUseCheck = storage.isMasterDataInUse('category', cat.code);
      if (inUseCheck.inUse) {
        warning(`ไม่สามารถปิดใช้งานหมวดหมู่นี้ได้: ${inUseCheck.message}`);
        return;
      }
    }

    const nextStatus = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setCategories(prev =>
      prev.map(c => (c.code === cat.code ? { ...c, status: nextStatus } : c))
    );
    success(`${nextStatus === 'ACTIVE' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} หมวดหมู่ "${cat.nameTh}" สำเร็จ`);
  };

  // --- DOCTYPE HANDLERS ---
  const handleOpenDocTypeModal = (doc?: DocTypeItem) => {
    if (doc) {
      setDocCode(doc.code);
      setDocNameTh(doc.nameTh);
      setDocExt(doc.ext);
      setDocRequired(doc.required);
      setDocTypeModal({ isOpen: true, editing: doc });
    } else {
      setDocCode('');
      setDocNameTh('');
      setDocExt('.pdf');
      setDocRequired(true);
      setDocTypeModal({ isOpen: true, editing: null });
    }
  };

  const handleSaveDocType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docCode.trim() || !docNameTh.trim()) {
      warning('กรุณาระบุรหัสเอกสารและชื่อเอกสาร');
      return;
    }

    // Duplicate Check
    const dup = docTypes.find(
      d => d.code.toUpperCase() === docCode.trim().toUpperCase() && d.code !== docTypeModal.editing?.code
    );
    if (dup) {
      warning('รหัสเอกสารนี้มีอยู่แล้วในระบบ กรุณาใช้รหัสอื่น');
      return;
    }

    if (docTypeModal.editing) {
      setDocTypes(prev =>
        prev.map(d =>
          d.code === docTypeModal.editing!.code
            ? { ...d, nameTh: docNameTh.trim(), ext: docExt.trim(), required: docRequired }
            : d
        )
      );
      success(`แก้ไขประเภทเอกสาร "${docNameTh}" สำเร็จ`);
    } else {
      setDocTypes(prev => [
        ...prev,
        {
          code: docCode.trim().toUpperCase(),
          nameTh: docNameTh.trim(),
          ext: docExt.trim() || '.pdf',
          required: docRequired,
          status: 'ACTIVE'
        }
      ]);
      success(`เพิ่มประเภทเอกสาร "${docNameTh}" สำเร็จ`);
    }
    setDocTypeModal({ isOpen: false, editing: null });
  };

  const handleToggleDocTypeStatus = (doc: DocTypeItem) => {
    // In-Use Check
    if (doc.status === 'ACTIVE') {
      const inUseCheck = storage.isMasterDataInUse('doctype', doc.code);
      if (inUseCheck.inUse) {
        warning(`ไม่สามารถปิดใช้งานประเภทเอกสารนี้ได้: ${inUseCheck.message}`);
        return;
      }
    }

    const nextStatus = doc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setDocTypes(prev =>
      prev.map(d => (d.code === doc.code ? { ...d, status: nextStatus } : d))
    );
    success(`${nextStatus === 'ACTIVE' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} เอกสาร "${doc.nameTh}" สำเร็จ`);
  };

  // --- CHECKLIST TEMPLATE HANDLERS ---
  const handleOpenChecklistModal = (tmpl?: ChecklistTemplateItem) => {
    if (tmpl) {
      setChkTitle(tmpl.title);
      setChkDesc(tmpl.description);
      setChkCat(tmpl.category);
      setChkRequired(tmpl.isRequired);
      setChecklistModal({ isOpen: true, editing: tmpl });
    } else {
      setChkTitle('');
      setChkDesc('');
      setChkCat((checklistCatFilter !== 'ALL' ? checklistCatFilter : 'food') as any);
      setChkRequired(true);
      setChecklistModal({ isOpen: true, editing: null });
    }
  };

  const handleSaveChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chkTitle.trim()) {
      warning('กรุณาระบุหัวข้อ Checklist');
      return;
    }

    let updatedList: ChecklistTemplateItem[];
    if (checklistModal.editing) {
      updatedList = checklistTemplates.map(t =>
        t.id === checklistModal.editing!.id
          ? {
              ...t,
              title: chkTitle.trim(),
              description: chkDesc.trim(),
              category: chkCat,
              isRequired: chkRequired
            }
          : t
      );
      success(`แก้ไขหัวข้อ Checklist "${chkTitle}" สำเร็จ`);
    } else {
      const newTmpl: ChecklistTemplateItem = {
        id: `tmpl-${Date.now()}`,
        category: chkCat,
        title: chkTitle.trim(),
        description: chkDesc.trim(),
        isRequired: chkRequired,
        order: checklistTemplates.length + 1,
        status: 'ACTIVE'
      };
      updatedList = [...checklistTemplates, newTmpl];
      success(`เพิ่มหัวข้อ Checklist ใหม่สำหรับหมวด "${chkCat}" สำเร็จ`);
    }

    setChecklistTemplates(updatedList);
    storage.saveChecklistTemplates(updatedList);
    setChecklistModal({ isOpen: false, editing: null });
  };

  const handleToggleChecklistStatus = (tmpl: ChecklistTemplateItem) => {
    const nextStatus: 'ACTIVE' | 'INACTIVE' = tmpl.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated: ChecklistTemplateItem[] = checklistTemplates.map(t => (t.id === tmpl.id ? { ...t, status: nextStatus } : t));
    setChecklistTemplates(updated);
    storage.saveChecklistTemplates(updated);
    success(`${nextStatus === 'ACTIVE' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} หัวข้อ Checklist สำเร็จ`);
  };

  const filteredChecklistTemplates = checklistTemplates.filter(
    t => checklistCatFilter === 'ALL' || t.category === checklistCatFilter
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">การจัดการข้อมูลหลัก (Master Data Management)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            กำหนดค่ามาตรฐานหมวดหมู่ผลิตภัณฑ์ ประเภทเอกสารแนบ และแม่แบบ Checklist ตามหมวดหมู่ผลิตภัณฑ์
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'categories') handleOpenCatModal();
            else if (activeTab === 'doctypes') handleOpenDocTypeModal();
            else handleOpenChecklistModal();
          }}
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>
            {activeTab === 'categories'
              ? 'เพิ่มหมวดหมู่ผลิตภัณฑ์'
              : activeTab === 'doctypes'
              ? 'เพิ่มประเภทเอกสาร'
              : 'เพิ่มหัวข้อ Checklist'}
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-2">
        <button
          onClick={() => setActiveTab('categories')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. หมวดหมู่ผลิตภัณฑ์ (Product Categories)</span>
        </button>

        <button
          onClick={() => setActiveTab('doctypes')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'doctypes'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. ประเภทเอกสารแนบ (Document Types)</span>
        </button>

        <button
          onClick={() => setActiveTab('checklists')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'checklists'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>3. แม่แบบ Checklist รายหมวดหมู่ (Checklist Templates)</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">รหัสระบบ (Code)</th>
                <th className="py-3 px-4">ชื่อหมวดหมู่ (ไทย)</th>
                <th className="py-3 px-4">Category Name (English)</th>
                <th className="py-3 px-4">รูปแบบเลขสารบบ</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {categories.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{c.code}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">{c.nameTh}</td>
                  <td className="py-3.5 px-4 text-slate-500 italic">{c.nameEn}</td>
                  <td className="py-3.5 px-4 font-mono">{c.prefix}XXXXX...</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      c.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenCatModal(c)}
                        className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition"
                        title="แก้ไขหมวดหมู่"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleCategoryStatus(c)}
                        className={`p-1.5 rounded-lg transition ${
                          c.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={c.status === 'ACTIVE' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: DOCUMENT TYPES */}
      {activeTab === 'doctypes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">รหัสเอกสาร (Code)</th>
                <th className="py-3 px-4">ชื่อประเภทเอกสาร</th>
                <th className="py-3 px-4">นามสกุลไฟล์ที่รองรับ</th>
                <th className="py-3 px-4">ข้อกำหนดบังคับ</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {docTypes.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{d.code}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">{d.nameTh}</td>
                  <td className="py-3.5 px-4 font-mono text-blue-900">{d.ext}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      d.required ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {d.required ? 'เอกสารบังคับ (Mandatory)' : 'ไม่บังคับ (Optional)'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      d.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenDocTypeModal(d)}
                        className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition"
                        title="แก้ไขประเภทเอกสาร"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleDocTypeStatus(d)}
                        className={`p-1.5 rounded-lg transition ${
                          d.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={d.status === 'ACTIVE' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: CHECKLIST TEMPLATES PER CATEGORY */}
      {activeTab === 'checklists' && (
        <div className="space-y-4">
          {/* Category Filter for Checklist */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">เลือกหมวดหมู่ที่ต้องการดู/จัดการ Checklist:</span>
              <select
                value={checklistCatFilter}
                onChange={e => setChecklistCatFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none"
              >
                <option value="ALL">ทุกหมวดหมู่ ({checklistTemplates.length} รายการ)</option>
                <option value="food">อาหารและเครื่องดื่ม</option>
                <option value="drug">ยาแผนปัจจุบัน</option>
                <option value="cosmetic">เครื่องสำอาง</option>
                <option value="medical_device">เครื่องมือแพทย์</option>
              </select>
            </div>
            <span className="text-slate-400 text-[11px]">
              * แบบฟอร์ม Checklist นี้จะถูกดึงไปแสดงในหน้าพิจารณาคำขอของเจ้าหน้าที่โดยอัตโนมัติตามประเภทผลิตภัณฑ์
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">ลำดับ</th>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4">หัวข้อเกณฑ์การตรวจสอบ (Checklist Item)</th>
                  <th className="py-3 px-4">รายละเอียดข้อกำหนด</th>
                  <th className="py-3 px-4 text-center">เงื่อนไข</th>
                  <th className="py-3 px-4 text-center">สถานะ</th>
                  <th className="py-3 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredChecklistTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      ยังไม่มีแม่แบบ Checklist ในหมวดหมู่นี้
                    </td>
                  </tr>
                ) : (
                  filteredChecklistTemplates.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 font-mono text-[10px] px-2 py-0.5 rounded font-semibold">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 max-w-xs">{t.title}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-sm text-[11px] leading-relaxed">{t.description}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          t.isRequired ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {t.isRequired ? 'บังคับผ่าน' : 'ข้อสังเกต'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenChecklistModal(t)}
                            className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition"
                            title="แก้ไขหัวข้อ Checklist"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleChecklistStatus(t)}
                            className={`p-1.5 rounded-lg transition ${
                              t.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={t.status === 'ACTIVE' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Category Form Modal */}
      <Modal
        isOpen={categoryModal.isOpen}
        onClose={() => setCategoryModal({ isOpen: false, editing: null })}
        title={categoryModal.editing ? `แก้ไขหมวดหมู่: ${categoryModal.editing.nameTh}` : 'เพิ่มหมวดหมู่ผลิตภัณฑ์ใหม่'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">รหัสหมวดหมู่ (Code) *:</label>
              <input
                type="text"
                required
                disabled={!!categoryModal.editing}
                value={catCode}
                onChange={e => setCatCode(e.target.value)}
                placeholder="เช่น food, drug, herbal..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ชื่อหมวดหมู่ (ภาษาไทย) *:</label>
              <input
                type="text"
                required
                value={catNameTh}
                onChange={e => setCatNameTh(e.target.value)}
                placeholder="เช่น ผลิตภัณฑ์สมุนไพร"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category Name (English):</label>
              <input
                type="text"
                value={catNameEn}
                onChange={e => setCatNameEn(e.target.value)}
                placeholder="เช่น Herbal Products"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">คำนำหน้าเลขสารบบ (Prefix):</label>
              <input
                type="text"
                value={catPrefix}
                onChange={e => setCatPrefix(e.target.value)}
                placeholder="เช่น HB-"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setCategoryModal({ isOpen: false, editing: null })}
              className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Document Type Form Modal */}
      <Modal
        isOpen={docTypeModal.isOpen}
        onClose={() => setDocTypeModal({ isOpen: false, editing: null })}
        title={docTypeModal.editing ? `แก้ไขประเภทเอกสาร: ${docTypeModal.editing.nameTh}` : 'เพิ่มประเภทเอกสารแนบใหม่'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveDocType} className="space-y-4">
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">รหัสเอกสาร (Type Code) *:</label>
              <input
                type="text"
                required
                disabled={!!docTypeModal.editing}
                value={docCode}
                onChange={e => setDocCode(e.target.value)}
                placeholder="เช่น CLINICAL_STUDY"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ชื่อประเภทเอกสาร (ไทย) *:</label>
              <input
                type="text"
                required
                value={docNameTh}
                onChange={e => setDocNameTh(e.target.value)}
                placeholder="เช่น รายงานผลการศึกษาวิจัยทางคลินิก"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">นามสกุลไฟล์ที่รองรับ:</label>
              <input
                type="text"
                value={docExt}
                onChange={e => setDocExt(e.target.value)}
                placeholder=".pdf, .png"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="docRequiredChk"
                checked={docRequired}
                onChange={e => setDocRequired(e.target.checked)}
                className="w-4 h-4 rounded text-blue-900"
              />
              <label htmlFor="docRequiredChk" className="font-semibold text-slate-700">
                เป็นเอกสารบังคับแนบในคำขอ (Mandatory)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setDocTypeModal({ isOpen: false, editing: null })}
              className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Checklist Item Form Modal */}
      <Modal
        isOpen={checklistModal.isOpen}
        onClose={() => setChecklistModal({ isOpen: false, editing: null })}
        title={checklistModal.editing ? `แก้ไขหัวข้อ Checklist` : 'เพิ่มหัวข้อแม่แบบ Checklist'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveChecklist} className="space-y-4">
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">หมวดหมู่ผลิตภัณฑ์ที่ใช้เกณฑ์นี้ *:</label>
              <select
                value={chkCat}
                onChange={e => setChkCat(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
              >
                <option value="food">อาหารและเครื่องดื่ม (Food)</option>
                <option value="drug">ยาแผนปัจจุบัน (Drug)</option>
                <option value="cosmetic">เครื่องสำอาง (Cosmetic)</option>
                <option value="medical_device">เครื่องมือแพทย์ (Medical Device)</option>
                <option value="ALL">ใช้กับทุกหมวดหมู่ผลิตภัณฑ์ (Universal)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">หัวข้อเกณฑ์การตรวจสอบ *:</label>
              <input
                type="text"
                required
                value={chkTitle}
                onChange={e => setChkTitle(e.target.value)}
                placeholder="เช่น การแสดงข้อมูลส่วนประกอบสำคัญและสารก่อภูมิแพ้"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">คำอธิบายรายละเอียดข้อกำหนดเกณฑ์:</label>
              <textarea
                rows={3}
                value={chkDesc}
                onChange={e => setChkDesc(e.target.value)}
                placeholder="ระบุสิ่งที่เจ้าหน้าที่ต้องตรวจสอบ เช่น ตรวจสอบร้อยละของส่วนประกอบตามประกาศ อย. ฉบับที่..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="chkRequiredBox"
                checked={chkRequired}
                onChange={e => setChkRequired(e.target.checked)}
                className="w-4 h-4 rounded text-blue-900"
              />
              <label htmlFor="chkRequiredBox" className="font-semibold text-slate-700">
                เป็นเกณฑ์บังคับต้องผ่านก่อนอนุมัติ (Mandatory Item)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setChecklistModal({ isOpen: false, editing: null })}
              className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold"
            >
              บันทึกแม่แบบ Checklist
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
