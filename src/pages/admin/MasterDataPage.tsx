import React, { useState } from 'react';
import { Database, Plus, Check, FileText, Tag, Layers, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const MasterDataPage: React.FC = () => {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<'categories' | 'doctypes' | 'checklists'>('categories');

  const [categories, setCategories] = useState([
    { code: 'food', nameTh: 'อาหารและเครื่องดื่ม', nameEn: 'Food and Beverages', status: 'ACTIVE', prefix: '10-1-' },
    { code: 'drug', nameTh: 'ยาแผนปัจจุบัน', nameEn: 'Modern Pharmaceuticals', status: 'ACTIVE', prefix: '1A ' },
    { code: 'cosmetic', nameTh: 'เครื่องสำอาง', nameEn: 'Cosmetics', status: 'ACTIVE', prefix: '10-1-6' },
    { code: 'medical_device', nameTh: 'เครื่องมือแพทย์', nameEn: 'Medical Devices', status: 'ACTIVE', prefix: 'MD-' },
    { code: 'hazardous', nameTh: 'วัตถุอันตรายที่ใช้ในบ้านเรือน', nameEn: 'Hazardous Substances', status: 'ACTIVE', prefix: 'HZ-' }
  ]);

  const [docTypes, setDocTypes] = useState([
    { code: 'LEAFLET', nameTh: 'เอกสารกำกับยาและผลิตภัณฑ์ (Official Leaflet)', ext: '.pdf', required: true },
    { code: 'LAB_REPORT', nameTh: 'ผลการตรวจวิเคราะห์ทางห้องปฏิบัติการ (Lab Certificate)', ext: '.pdf', required: false },
    { code: 'GMP_CERT', nameTh: 'หนังสือรับรองมาตรฐานสถานที่ผลิต (GMP / ISO 22000)', ext: '.pdf', required: true },
    { code: 'PACKAGING_ARTWORK', nameTh: 'แบบอาร์ตเวิร์กฉลากจริง (Package Artwork)', ext: '.pdf, .png', required: true }
  ]);

  const handleAddCategory = () => {
    const name = prompt('ระบุชื่อหมวดหมู่ผลิตภัณฑ์ใหม่ (ภาษาไทย):');
    if (name) {
      setCategories(prev => [
        ...prev,
        {
          code: `cat_${Date.now()}`,
          nameTh: name,
          nameEn: 'New Product Category',
          status: 'ACTIVE',
          prefix: 'GEN-'
        }
      ]);
      success(`เพิ่มหมวดหมู่ Master Data "${name}" สำเร็จ`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">การจัดการข้อมูลหลัก (Master Data Management)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            กำหนดค่ามาตรฐานหมวดหมู่ผลิตภัณฑ์ ประเภทเอกสารแนบ และแม่แบบ Checklist สำหรับ อย.
          </p>
        </div>

        <button
          onClick={handleAddCategory}
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มรายการ Master Data</span>
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
          <span>หมวดหมู่ผลิตภัณฑ์ (Product Categories)</span>
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
          <span>ประเภทเอกสารแนบ (Document Types)</span>
        </button>
      </div>

      {/* Tab 1: Categories */}
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
                    <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Document Types */}
      {activeTab === 'doctypes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">รหัสเอกสาร (Type Code)</th>
                <th className="py-3 px-4">ชื่อประเภทเอกสาร</th>
                <th className="py-3 px-4">นามสกุลไฟล์ที่รองรับ</th>
                <th className="py-3 px-4">ข้อกำหนดบังคับ</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
