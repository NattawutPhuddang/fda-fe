import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { Product, DigitalLabel } from '../../services/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QRModal } from '../../components/common/QRModal';
import { 
  QrCode, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Printer,
  Search
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const QRCodeManagerPage: React.FC = () => {
  const { success } = useToast();
  const products = storage.getProducts();
  const [query, setQuery] = useState('');
  const [selectedQR, setSelectedQR] = useState<{ product: Product; label?: DigitalLabel } | null>(null);

  const filtered = products.filter(p => {
    const q = query.trim().toLowerCase();
    return !q || p.productNameTh.toLowerCase().includes(q) || p.regNumber.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">จัดการ QR Code ประจำผลิตภัณฑ์</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          สร้าง ดาวน์โหลด และจัดการไฟล์ QR Code สองมิติมาตรฐาน สำหรับนำไปพิมพ์บนบรรจุภัณฑ์
        </p>
      </div>

      {/* Guidelines Card */}
      <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs space-y-2 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <QrCode className="w-4 h-4 text-amber-400" />
          <span>ข้อกำหนดการพิมพ์ QR Code ฉลากดิจิทัล อย. บนบรรจุภัณฑ์:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 text-[11px] leading-relaxed">
          <li>ขนาดของ QR Code เมื่อพิมพ์ลงบนบรรจุภัณฑ์จริงต้องมีขนาดไม่น้อยกว่า <strong>1.5 x 1.5 เซนติเมตร</strong></li>
          <li>ต้องมีความคมชัดและอัตราส่วน Contrast ระหว่างพื้นเข้มและพื้นสว่างเพียงพอสำหรับการสแกนด้วยกล้องสมาร์ตโฟนทั่วไป</li>
          <li>เฉพาะผลิตภัณฑ์ที่มีสถานะ <strong>"เผยแพร่แล้ว (Published)"</strong> เท่านั้นที่จะแสดงข้อมูลฉลากสาธารณะที่สมบูรณ์</li>
        </ul>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="ค้นหาผลิตภัณฑ์เพื่อดาวน์โหลด QR Code..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full text-xs text-slate-800 focus:outline-none"
        />
      </div>

      {/* Products QR Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(product => {
          const label = storage.getLabelByProductId(product.id);
          const isPublished = label?.status === 'published';

          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                isPublished ? 'border-slate-200 hover:border-blue-400' : 'border-amber-200 bg-amber-50/10'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {product.regNumber}
                  </span>
                  <StatusBadge status={label?.status || product.activeLabelStatus || 'draft'} size="sm" />
                </div>

                <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{product.productNameTh}</h3>
                <p className="text-[11px] text-slate-400 truncate">{product.productNameEn}</p>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px]">URL ตรวจสอบ:</span>
                    <span className="font-mono text-slate-700 text-[11px]">/verify/{product.newcode.substring(0, 16)}...</span>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-8 h-8 text-blue-950" />
                  </div>
                </div>

                {!isPublished && (
                  <p className="text-[11px] text-amber-700 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>ยังไม่ได้รับอนุมัติเผยแพร่ หากพิมพ์ก่อนจะแสดงสถานะระงับ/รอตรวจ</span>
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`/verify/${product.newcode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-600 hover:text-blue-900 flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>ทดสอบสแกน</span>
                </a>

                <button
                  onClick={() => setSelectedQR({ product, label })}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>จัดการและดาวน์โหลด QR</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Modal */}
      {selectedQR && (
        <QRModal
          isOpen={!!selectedQR}
          onClose={() => setSelectedQR(null)}
          product={selectedQR.product}
          label={selectedQR.label}
        />
      )}
    </div>
  );
};
