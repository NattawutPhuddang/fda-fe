import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { Product, DigitalLabel, SuspensionRecord } from '../../services/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SuspensionHistoryModal } from '../../components/officer/SuspensionHistoryModal';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw,
  ExternalLink,
  History,
  Lock,
  FileText
} from 'lucide-react';

export const ProductOversightPage: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { success, warning } = useToast();

  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [labels, setLabels] = useState<DigitalLabel[]>(() => storage.getLabels());
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Suspend/Unsuspend action dialog
  const [targetAction, setTargetAction] = useState<{
    label: DigitalLabel;
    product: Product;
    type: 'SUSPEND' | 'UNSUSPEND';
  } | null>(null);

  // Form fields for suspension
  const [reasonInput, setReasonInput] = useState('');
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [effectiveDateInput, setEffectiveDateInput] = useState(new Date().toISOString().slice(0, 10));
  const [authorizedSignatoryInput, setAuthorizedSignatoryInput] = useState('');

  // History Modal State
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<Product | null>(null);

  // RBAC Permission: only approver, generic officer, and admin can execute suspend/unsuspend
  const canManageSuspension = role === 'officer' || role === 'admin';

  const filtered = products.filter(p => {
    const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const q = query.trim().toLowerCase();
    const matchQ = !q || p.productNameTh.toLowerCase().includes(q) || p.regNumber.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const handleOpenActionModal = (label: DigitalLabel, product: Product, type: 'SUSPEND' | 'UNSUSPEND') => {
    if (!canManageSuspension) {
      warning('ท่านไม่มีสิทธิ์สั่งระงับหรือปลดล็อกฉลาก (สงวนสิทธิ์เฉพาะเจ้าหน้าที่ อย. และ Admin)');
      return;
    }
    setReasonInput('');
    setOrderNumberInput(type === 'SUSPEND' ? 'อย. ๑๐๐๒/๒๕๖๙' : 'อย. ๑๐๐๓/๒๕๖๙');
    setEffectiveDateInput(new Date().toISOString().slice(0, 10));
    setAuthorizedSignatoryInput(currentUser?.fullName || 'คณะกรรมการ อย.');
    setTargetAction({ label, product, type });
  };

  const handleExecuteOversight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAction) return;
    const { label, product, type } = targetAction;

    if (!reasonInput.trim()) {
      warning('กรุณาระบุเหตุผลการดำเนินการ');
      return;
    }

    if (type === 'SUSPEND') {
      const updatedLabel: DigitalLabel = {
        ...label,
        status: 'suspended',
        suspendedReason: reasonInput,
        updatedAt: new Date().toISOString()
      };
      storage.saveLabel(updatedLabel, currentUser || undefined);

      // Update product status
      const updatedProds = products.map(p => p.id === product.id ? { ...p, registrationStatus: 'suspended' as const } : p);
      storage.saveProducts(updatedProds);
      setProducts(updatedProds);
      setLabels(storage.getLabels());

      // Save Suspension Audit Record
      storage.saveSuspension({
        id: `susp-${Date.now()}`,
        labelId: label.id,
        productId: product.id,
        productNameTh: product.productNameTh,
        regNumber: product.regNumber,
        action: 'SUSPEND',
        reason: reasonInput,
        orderNumber: orderNumberInput,
        effectiveDate: effectiveDateInput,
        authorizedSignatory: authorizedSignatoryInput,
        officerId: currentUser?.id || 'officer',
        officerName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
        timestamp: new Date().toISOString()
      });

      storage.addTimelineEvent({
        labelId: label.id,
        version: label.version,
        actorName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
        actorRole: currentUser?.role || 'officer',
        action: 'SUSPEND_LABEL',
        status: 'suspended',
        notes: `คำสั่งระงับฉลาก เลขที่ ${orderNumberInput} เหตุผล: ${reasonInput}`
      });

      storage.addAuditLog({
        userId: currentUser?.id || 'officer',
        userName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
        userRole: currentUser?.role || 'officer',
        action: 'SUSPEND_LABEL_OVERSIGHT',
        resourceType: 'DIGITAL_LABEL',
        resourceId: label.id,
        result: 'SUCCESS',
        details: `มีคำสั่งระงับการเผยแพร่ฉลาก: ${product.productNameTh} (${product.regNumber}) คำสั่งเลขที่: ${orderNumberInput}`
      });

      success(`สั่งระงับการเผยแพร่ฉลากของ "${product.productNameTh}" เรียบร้อยแล้ว`);
    } else {
      // Unsuspend back to published
      const updatedLabel: DigitalLabel = {
        ...label,
        status: 'published',
        suspendedReason: undefined,
        updatedAt: new Date().toISOString()
      };
      storage.saveLabel(updatedLabel, currentUser || undefined);

      const updatedProds = products.map(p => p.id === product.id ? { ...p, registrationStatus: 'active' as const } : p);
      storage.saveProducts(updatedProds);
      setProducts(updatedProds);
      setLabels(storage.getLabels());

      // Save Suspension Record
      storage.saveSuspension({
        id: `unsusp-${Date.now()}`,
        labelId: label.id,
        productId: product.id,
        productNameTh: product.productNameTh,
        regNumber: product.regNumber,
        action: 'UNSUSPEND',
        reason: reasonInput,
        orderNumber: orderNumberInput,
        effectiveDate: effectiveDateInput,
        authorizedSignatory: authorizedSignatoryInput,
        officerId: currentUser?.id || 'officer',
        officerName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
        timestamp: new Date().toISOString()
      });

      storage.addTimelineEvent({
        labelId: label.id,
        version: label.version,
        actorName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
        actorRole: currentUser?.role || 'officer',
        action: 'UNSUSPEND_LABEL',
        status: 'published',
        notes: `ยกเลิกคำสั่งระงับฉลาก และเปิดเผยแพร่ตามปกติ คำสั่งเลขที่: ${orderNumberInput}`
      });

      storage.addAuditLog({
        userId: currentUser?.id || 'officer',
        userName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
        userRole: currentUser?.role || 'officer',
        action: 'UNSUSPEND_LABEL_OVERSIGHT',
        resourceType: 'DIGITAL_LABEL',
        resourceId: label.id,
        result: 'SUCCESS',
        details: `ยกเลิกคำสั่งระงับ และเปิดการเผยแพร่ฉลากตามปกติ: ${product.productNameTh}`
      });

      success(`ยกเลิกคำสั่งระงับ และเปิดให้ประชาชนสแกนฉลากได้ตามปกติแล้ว`);
    }

    setTargetAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">กำกับดูแลและระงับฉลากผลิตภัณฑ์ (Product Oversight)</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          ตรวจสอบประวัติการเผยแพร่ ติดตามการเฝ้าระวังความปลอดภัย และสั่งระงับฉลากเมื่อพบการฝ่าฝืนกฎหมาย
        </p>
      </div>

      {/* Oversight Guidance */}
      <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs space-y-1.5 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>
            {canManageSuspension
              ? 'อำนาจการสั่งระงับฉลากดิจิทัลตามพระราชบัญญัติอาหารและยา (เจ้าหน้าที่ อย. / ผู้ดูแลระบบ):'
              : 'สิทธิ์การเข้าถึงสำหรับผู้ตรวจสอบ (Auditor - Read Only):'}
          </span>
        </div>
        <p className="leading-relaxed text-slate-300">
          {canManageSuspension
            ? 'เมื่อตรวจพบผลิตภัณฑ์ที่มีสารต้องห้าม ฉลากเป็นเท็จ หรือมีคำสั่งเรียกเก็บคืน (Recall) ผู้มีอำนาจอนุมัติและผู้ดูแลระบบสามารถกด "สั่งระงับฉลาก" โดยระบุเลขที่คำสั่ง วันที่มีผล และเหตุผล เพื่อให้ระบบแจ้งเตือนอันตรายสีแดงทันทีเมื่อประชาชนสแกน QR Code'
            : 'ท่านอยู่ในโหมดอ่านอย่างเดียว (Read-Only) สามารถสืบค้น ตรวจสอบประวัติสถานะฉลาก และเปิดดูตัวอย่างฉลากดิจิทัลของประชาชนได้ แต่ไม่มีสิทธิ์สั่งระงับหรือแก้ไขคำสั่ง'}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผลิตภัณฑ์, เลขสารบบ (13 หลัก), หรือ Newcode..."
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
          <option value="medical_device">เครื่องมือแพทย์</option>
        </select>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">เลขสารบบ / Newcode</th>
                <th className="py-3.5 px-4">ชื่อผลิตภัณฑ์</th>
                <th className="py-3.5 px-4">ผู้ประกอบการ</th>
                <th className="py-3.5 px-4">สถานะฉลาก</th>
                <th className="py-3.5 px-4">คำสั่งระงับล่าสุด</th>
                <th className="py-3.5 px-4 text-center">ประวัติ & ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(prod => {
                const label = labels.find(l => l.productId === prod.id);
                const isSuspended = (label?.status === 'suspended') || (prod.registrationStatus === 'suspended');

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <strong className="text-blue-900 block font-semibold">{prod.regNumber}</strong>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">{prod.newcode}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 line-clamp-1">{prod.productNameTh}</p>
                      <span className="text-[10px] text-slate-400">{prod.categoryNameTh}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="truncate max-w-[140px] block">{prod.entrepreneurName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={label?.status || prod.activeLabelStatus || 'draft'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {isSuspended ? (
                        <span className="text-rose-700 font-medium block text-[11px] bg-rose-50 p-1.5 rounded border border-rose-200">
                          {label?.suspendedReason || 'สั่งระงับชั่วคราวตาม พ.ร.บ.'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Public Label */}
                        <a
                          href={`/verify/${prod.newcode}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          title="ดูหน้าฉลากประชาชน"
                        >
                          <Eye className="w-4 h-4" />
                        </a>

                        {/* Suspension History Button */}
                        <button
                          onClick={() => setSelectedProductForHistory(prod)}
                          className="p-1.5 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition"
                          title="ดูประวัติคำสั่งระงับและปลดล็อก"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {/* Suspend / Unsuspend Action Button (Only for authorized roles) */}
                        {canManageSuspension && label && (
                          isSuspended ? (
                            <button
                              onClick={() => handleOpenActionModal(label, prod, 'UNSUSPEND')}
                              className="px-2.5 py-1 bg-[#002B49] hover:bg-[#001D33] text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
                              title="ยกเลิกคำสั่งระงับ และเปิดเผยแพร่ตามปกติ"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>ปลดล็อก</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenActionModal(label, prod, 'SUSPEND')}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
                              title="มีคำสั่งระงับการเผยแพร่ฉลาก"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>สั่งระงับ</span>
                            </button>
                          )
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

      {/* Suspend / Unsuspend Dialog with Order Ref, Effective Date & Authorized Signatory */}
      {targetAction && (
        <Modal
          isOpen={!!targetAction}
          onClose={() => setTargetAction(null)}
          title={targetAction.type === 'SUSPEND' ? 'คำสั่งระงับฉลากผลิตภัณฑ์ (Product Suspension Order)' : 'ยกเลิกคำสั่งระงับฉลาก (Unsuspend Order)'}
          maxWidth="lg"
        >
          <form onSubmit={handleExecuteOversight} className="space-y-4">
            <div className={`p-3 rounded-xl border text-xs space-y-1 ${
              targetAction.type === 'SUSPEND' 
                ? 'bg-rose-50 border-rose-200 text-rose-950' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <strong className="block font-semibold">
                ผลิตภัณฑ์: {targetAction.product.productNameTh} ({targetAction.product.regNumber})
              </strong>
              <p>
                {targetAction.type === 'SUSPEND'
                  ? 'เมื่อบันทึกคำสั่งระงับ ผลิตภัณฑ์นี้จะถูกระงับการเผยแพร่ทันที และแสดงแบนเนอร์แจ้งเตือนอันตรายสีแดงเมื่อประชาชนสแกน QR Code'
                  : 'เมื่อยกเลิกคำสั่งระงับ ฉลากจะกลับสู่สถานะเผยแพร่ตามปกติ (Published) และประชาชนสามารถสแกนดูข้อมูลได้ตามเดิม'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลขที่เอกสาร / คำสั่งอ้างอิง อย.:
                </label>
                <input
                  type="text"
                  required
                  value={orderNumberInput}
                  onChange={e => setOrderNumberInput(e.target.value)}
                  placeholder="เช่น อย. ๑๐๐๒/๒๕๖๙"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  วันที่มีผลบังคับใช้:
                </label>
                <input
                  type="date"
                  required
                  value={effectiveDateInput}
                  onChange={e => setEffectiveDateInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ผู้มีอำนาจสั่งการ / ลงนาม:
              </label>
              <input
                type="text"
                required
                value={authorizedSignatoryInput}
                onChange={e => setAuthorizedSignatoryInput(e.target.value)}
                placeholder="เช่น นพ. วรพจน์ กิตติคุณ (ประธานคณะกรรมการ อย.)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เหตุผลและรายละเอียดคำสั่ง:
              </label>
              <textarea
                rows={3}
                required
                value={reasonInput}
                onChange={e => setReasonInput(e.target.value)}
                placeholder={targetAction.type === 'SUSPEND' 
                  ? 'ระบุสาเหตุ เช่น ตรวจพบสารต้องห้ามปนเปื้อนในรุ่นการผลิต, มีคำสั่งเรียกเก็บคืนสินค้า (Recall)...' 
                  : 'ระบุผลการตรวจสอบแก้ไข เช่น ผู้ประกอบการได้ทำลายสินค้าที่มีปัญหาและปรับปรุงสูตรผ่านเกณฑ์แล้ว...'}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setTargetAction(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition ${
                  targetAction.type === 'SUSPEND'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#002B49] hover:bg-[#001D33]'
                }`}
              >
                {targetAction.type === 'SUSPEND' ? 'ยืนยันสั่งระงับฉลาก' : 'ยืนยันปลดล็อกระงับ'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Suspension History Modal */}
      {selectedProductForHistory && (
        <SuspensionHistoryModal
          isOpen={!!selectedProductForHistory}
          onClose={() => setSelectedProductForHistory(null)}
          product={selectedProductForHistory}
        />
      )}
    </div>
  );
};
