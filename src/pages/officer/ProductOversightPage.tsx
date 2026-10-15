import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { Product, DigitalLabel } from '../../services/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
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
  History
} from 'lucide-react';

export const ProductOversightPage: React.FC = () => {
  const { currentUser } = useAuth();
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
  const [reasonInput, setReasonInput] = useState('');

  const filtered = products.filter(p => {
    const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const q = query.trim().toLowerCase();
    const matchQ = !q || p.productNameTh.toLowerCase().includes(q) || p.regNumber.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const handleExecuteOversight = () => {
    if (!targetAction) return;
    const { label, product, type } = targetAction;

    if (type === 'SUSPEND') {
      if (!reasonInput.trim()) {
        warning('กรุณาระบุเหตุผลการสั่งระงับฉลากชั่วคราว');
        return;
      }

      const updated: DigitalLabel = {
        ...label,
        status: 'suspended',
        suspendedReason: reasonInput,
        updatedAt: new Date().toISOString()
      };
      storage.saveLabel(updated, currentUser || undefined);

      // Update product status
      const updatedProds = products.map(p => p.id === product.id ? { ...p, registrationStatus: 'suspended' as const } : p);
      storage.saveProducts(updatedProds);
      setProducts(updatedProds);
      setLabels(storage.getLabels());

      storage.addAuditLog({
        userId: currentUser?.id || 'officer',
        userName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
        userRole: 'officer',
        action: 'SUSPEND_LABEL_OVERSIGHT',
        resourceType: 'DIGITAL_LABEL',
        resourceId: label.id,
        result: 'SUCCESS',
        details: `มีคำสั่งระงับการเผยแพร่ฉลาก: ${product.productNameTh} (${product.regNumber}) เหตุผล: ${reasonInput}`
      });

      success(`สั่งระงับการเผยแพร่ฉลากของ "${product.productNameTh}" เรียบร้อยแล้ว`);
    } else {
      // Unsuspend back to published
      const updated: DigitalLabel = {
        ...label,
        status: 'published',
        suspendedReason: undefined,
        updatedAt: new Date().toISOString()
      };
      storage.saveLabel(updated, currentUser || undefined);

      const updatedProds = products.map(p => p.id === product.id ? { ...p, registrationStatus: 'active' as const } : p);
      storage.saveProducts(updatedProds);
      setProducts(updatedProds);
      setLabels(storage.getLabels());

      storage.addAuditLog({
        userId: currentUser?.id || 'officer',
        userName: currentUser?.fullName || 'เจ้าหน้าที่ อย.',
        userRole: 'officer',
        action: 'UNSUSPEND_LABEL_OVERSIGHT',
        resourceType: 'DIGITAL_LABEL',
        resourceId: label.id,
        result: 'SUCCESS',
        details: `ยกเลิกคำสั่งระงับ และเปิดการเผยแพร่ฉลากตามปกติ: ${product.productNameTh}`
      });

      success(`ยกเลิกคำสั่งระงับ และเปิดให้ประชาชนสแกนฉลากได้ตามปกติแล้ว`);
    }

    setTargetAction(null);
    setReasonInput('');
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
          <ShieldAlert className="w-4 h-4" />
          <span>อำนาจการสั่งระงับฉลากดิจิทัลตามพระราชบัญญัติอาหารและยา:</span>
        </div>
        <p className="leading-relaxed text-slate-300">
          เมื่อเจ้าหน้าที่ อย. ตรวจพบผลิตภัณฑ์ที่มีสารต้องห้าม ฉลากเป็นเท็จ หรือมีคำสั่งเรียกเก็บคืน (Recall) เจ้าหน้าที่สามารถกด <strong>"สั่งระงับฉลาก (Suspend)"</strong> โดยระบบจะปรับปรุงผลลัพธ์การสแกน QR Code เป็นการแจ้งเตือนอันตรายสีแดงทันทีแบบ Real-time เพื่อคุ้มครองประชาชน
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
        </select>
      </div>

      {/* Oversight Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขทะเบียน / Newcode</th>
                <th className="py-3 px-4">ชื่อผลิตภัณฑ์</th>
                <th className="py-3 px-4">ผู้รับอนุญาต</th>
                <th className="py-3 px-4">สถานะฉลาก</th>
                <th className="py-3 px-4">หมายเหตุ / คำสั่ง</th>
                <th className="py-3 px-4 text-center">มาตรการกำกับดูแล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(prod => {
                const label = storage.getLabelByProductId(prod.id);
                const isSuspended = label?.status === 'suspended' || prod.registrationStatus === 'suspended';

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
                          {label?.suspendedReason || 'สั่งระงับชั่วคราว'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`/verify/${prod.newcode}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          title="ดูหน้าฉลากประชาชน"
                        >
                          <Eye className="w-4 h-4" />
                        </a>

                        {label && (
                          isSuspended ? (
                            <button
                              onClick={() => setTargetAction({ label, product: prod, type: 'UNSUSPEND' })}
                              className="px-2.5 py-1 bg-[#002B49] hover:bg-[#001D33] text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
                              title="ยกเลิกคำสั่งระงับ และเปิดเผยแพร่ตามปกติ"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>ปลดล็อกระงับ</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setReasonInput('');
                                setTargetAction({ label, product: prod, type: 'SUSPEND' });
                              }}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
                              title="มีคำสั่งระงับการเผยแพร่ฉลาก"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>สั่งระงับฉลาก</span>
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

      {/* Suspend / Unsuspend Confirmation Dialog */}
      {targetAction && (
        <ConfirmDialog
          isOpen={!!targetAction}
          onClose={() => setTargetAction(null)}
          onConfirm={handleExecuteOversight}
          title={targetAction.type === 'SUSPEND' ? 'ยืนยันคำสั่งระงับฉลากชั่วคราว?' : 'ยืนยันยกเลิกคำสั่งระงับฉลาก?'}
          message={
            targetAction.type === 'SUSPEND'
              ? `ผลิตภัณฑ์ "${targetAction.product.productNameTh}" (${targetAction.product.regNumber}) จะถูกสั่งระงับการเผยแพร่ฉลากทันที และแสดงแบนเนอร์แจ้งเตือนอันตรายสีแดงเมื่อประชาชนสแกน QR Code`
              : `ผลิตภัณฑ์ "${targetAction.product.productNameTh}" จะกลับสู่สถานะ "เผยแพร่แล้ว (Published)" และประชาชนสามารถสแกนตรวจสอบฉลากได้ตามปกติ`
          }
          confirmText={targetAction.type === 'SUSPEND' ? 'ยืนยันสั่งระงับ' : 'ยืนยันปลดล็อก'}
          variant={targetAction.type === 'SUSPEND' ? 'danger' : 'success'}
        />
      )}
    </div>
  );
};
