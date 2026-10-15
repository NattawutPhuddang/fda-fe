import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import { Product, ProductCategory } from '../../services/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { QRModal } from '../../components/common/QRModal';
import { 
  Package, 
  Search, 
  Filter, 
  ExternalLink, 
  Eye, 
  Tag, 
  QrCode, 
  RefreshCw, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ProductListPage: React.FC = () => {
  const { success } = useToast();
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qrProduct, setQrProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = category === 'ALL' || p.category === category;
      const cleanQ = query.trim().toLowerCase();
      const matchQ = !cleanQ ||
        p.productNameTh.toLowerCase().includes(cleanQ) ||
        p.productNameEn.toLowerCase().includes(cleanQ) ||
        p.regNumber.toLowerCase().includes(cleanQ) ||
        p.newcode.toLowerCase().includes(cleanQ);
      return matchCat && matchQ;
    });
  }, [products, query, category]);

  const handleSyncESubmission = () => {
    success('ซิงก์ข้อมูลอัปเดตจาก e-Submission สำเร็จ (Mock Service Adapter)');
    setProducts(storage.getProducts());
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">ทะเบียนผลิตภัณฑ์ที่ได้รับอนุญาต</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ข้อมูลผลิตภัณฑ์สุขภาพที่เชื่อมโยงจากฐานข้อมูล e-Submission ของสำนักงานคณะกรรมการอาหารและยา
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncESubmission}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
            title="ดึงข้อมูลล่าสุดจากระบบ e-Submission"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-700" />
            <span>ซิงก์ e-Submission</span>
          </button>
        </div>
      </div>

      {/* Notice Card: Guardrail */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>ข้อกำหนดด้านความถูกต้องของทะเบียน:</strong> ข้อมูลเลขสารบบ, Newcode, ชื่อผลิตภัณฑ์, และสถานที่ผลิต เป็นข้อมูลอ้างอิงหลักจากฐานข้อมูล <strong>e-Submission อย.</strong> ผู้ประกอบการไม่สามารถแก้ไขข้อมูลดังกล่าวได้โดยตรง หากมีการแก้ไขเปลี่ยนแปลงสูตรหรือสถานที่ ต้องยื่นคำขอแก้ไขทะเบียนหลักที่ระบบ e-Submission ก่อน
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผลิตภัณฑ์, เลขสารบบ (13 หลัก), ทะเบียนยา หรือ Newcode..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="ALL">ทุกหมวดหมู่ผลิตภัณฑ์</option>
          <option value="food">อาหารและเครื่องดื่ม</option>
          <option value="drug">ยาแผนปัจจุบัน</option>
          <option value="cosmetic">เครื่องสำอาง</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขทะเบียน / Newcode</th>
                <th className="py-3 px-4">ชื่อผลิตภัณฑ์ (ไทย-อังกฤษ)</th>
                <th className="py-3 px-4">หมวดหมู่</th>
                <th className="py-3 px-4">สถานะทะเบียน</th>
                <th className="py-3 px-4">สถานะฉลากดิจิทัล</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.map(prod => {
                const label = storage.getLabelByProductId(prod.id);
                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <strong className="text-blue-900 block font-semibold">{prod.regNumber}</strong>
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">{prod.newcode}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-800 line-clamp-1">{prod.productNameTh}</p>
                      <p className="text-[11px] text-slate-400 italic line-clamp-1">{prod.productNameEn}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                        {prod.categoryNameTh}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={prod.registrationStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={label?.status || prod.activeLabelStatus || 'draft'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedProduct(prod)}
                          className="p-1.5 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition"
                          title="ดูรายละเอียดทะเบียน"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {label ? (
                          <Link
                            to={`/entrepreneur/labels/${label.id}/edit`}
                            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="แก้ไขฉลากดิจิทัล"
                          >
                            <Tag className="w-4 h-4" />
                          </Link>
                        ) : (
                          <Link
                            to={`/entrepreneur/labels/new?productId=${prod.id}`}
                            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="สร้างคำขอฉลากดิจิทัล"
                          >
                            <Tag className="w-4 h-4" />
                          </Link>
                        )}

                        <button
                          onClick={() => setQrProduct(prod)}
                          className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="ดู QR Code ผลิตภัณฑ์"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title="ข้อมูลทะเบียนผลิตภัณฑ์ (e-Submission Synchronized)"
          subtitle={`เลขสารบบ/ทะเบียน: ${selectedProduct.regNumber}`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">ชื่อภาษาไทย:</span>
                <strong className="text-slate-900 text-sm">{selectedProduct.productNameTh}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Product Name (EN):</span>
                <strong className="text-slate-900 text-sm">{selectedProduct.productNameEn}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">เลขสารบบ / ทะเบียนยา:</span>
                <strong className="text-blue-900 font-mono text-sm">{selectedProduct.regNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Newcode (อย.):</span>
                <span className="text-slate-700 font-mono text-xs">{selectedProduct.newcode}</span>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-white rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">ผู้ถือครองทะเบียน (Licensee):</span>
                <p className="font-semibold text-slate-800">{selectedProduct.entrepreneurName}</p>
                <p className="text-slate-500">เลขประจำตัวผู้เสียภาษี: {selectedProduct.taxId}</p>
              </div>
              <div className="pt-2 border-t">
                <span className="text-slate-400 block text-[11px]">สถานที่ผลิต:</span>
                <p className="text-slate-800">{selectedProduct.manufacturerName}</p>
                <p className="text-slate-500">{selectedProduct.manufacturerAddress}</p>
              </div>
              <div className="pt-2 border-t grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">วันที่อนุมัติ:</span>
                  <p className="text-slate-700">{selectedProduct.approvedDate}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">วันหมดอายุใบอนุญาต:</span>
                  <p className="text-slate-700">{selectedProduct.expiryDate}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-slate-400 text-[11px] pt-2">
              <span>e-Submission Reference: {selectedProduct.eSubmissionRef}</span>
              <span>ซิงก์ล่าสุด: {new Date(selectedProduct.lastSyncedAt).toLocaleString('th-TH')}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* QR Code Modal */}
      {qrProduct && (
        <QRModal
          isOpen={!!qrProduct}
          onClose={() => setQrProduct(null)}
          product={qrProduct}
          label={storage.getLabelByProductId(qrProduct.id)}
        />
      )}
    </div>
  );
};
