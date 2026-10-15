import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Product, DigitalLabel } from '../../services/types';
import { generateQRPngDataUrl, generateQRSvg, downloadDataUrl, downloadFile } from '../../utils/qrGenerator';
import { Download, Copy, ExternalLink, Printer, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  label?: DigitalLabel;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, product, label }) => {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);
  const [resolution, setResolution] = useState<number>(600);
  const [svgString, setSvgString] = useState<string>('');
  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Verification URL uses the chosen newcode
  const publicUrl = `${window.location.origin}/verify/${product.newcode}`;
  const isPublished = label?.status === 'published' || product.activeLabelStatus === 'published';

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    Promise.all([
      generateQRSvg(publicUrl, { width: 300 }),
      generateQRPngDataUrl(publicUrl, { width: resolution })
    ]).then(([svg, png]) => {
      setSvgString(svg);
      setPngDataUrl(png);
      setLoading(false);
    });
  }, [isOpen, publicUrl, resolution]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    success('คัดลอก URL ฉลากดิจิทัลแล้ว');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    downloadFile(svgString, `FDA-QR-${product.newcode}.svg`, 'image/svg+xml');
    success('ดาวน์โหลดไฟล์ Vector SVG สำเร็จ');
  };

  const handleDownloadPng = () => {
    downloadDataUrl(pngDataUrl, `FDA-QR-${product.newcode}-${resolution}px.png`);
    success(`ดาวน์โหลดไฟล์ PNG (${resolution}x${resolution}px) สำเร็จ`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="QR Code ฉลากดิจิทัลประจำผลิตภัณฑ์"
      subtitle={`${product.productNameTh} (${product.regNumber})`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Status Guardrail Alert */}
        {!isPublished ? (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="font-semibold block mb-0.5">ข้อกำหนดความปลอดภัย อย.:</strong>
              ผลิตภัณฑ์นี้ยังไม่ได้อยู่ในสถานะ <strong>"เผยแพร่แล้ว (Published)"</strong> (สถานะปัจจุบัน: {label?.status || product.activeLabelStatus || 'ร่าง'}).
              หากสแกน QR Code นี้ ระบบจะแจ้งเตือนว่าอยู่ระหว่างการตรวจสอบและยังไม่สามารถยืนยันความปลอดภัยได้
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 flex items-center gap-2.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-slate-700 flex-shrink-0" />
            <span>QR Code นี้พร้อมใช้งานบนบรรจุภัณฑ์จริง ลิงก์ตรงสู่ฐานข้อมูลฉลากสาธารณะ อย.</span>
          </div>
        )}

        {/* QR Preview & Details Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            {loading ? (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">กำลังสร้าง QR Code...</div>
            ) : (
              <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200">
                <img src={pngDataUrl} alt="FDA QR Code" className="w-48 h-48 object-contain" />
              </div>
            )}
            <span className="text-[11px] text-slate-400 mt-3 font-mono">Format: ISO/IEC 18004</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">ชื่อผลิตภัณฑ์ (Product Name):</span>
              <p className="font-semibold text-slate-800 text-sm">{product.productNameTh}</p>
              <p className="text-slate-500">{product.productNameEn}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">เลขสารบบ / ทะเบียน:</span>
                <span className="font-bold text-blue-900 font-mono text-sm">{product.regNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">หมวดหมู่:</span>
                <span className="font-medium text-slate-700">{product.categoryNameTh}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block text-[11px]">รหัสผลิตภัณฑ์ Newcode:</span>
              <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded block truncate text-[11px]">
                {product.newcode}
              </span>
            </div>

            <div className="pt-2">
              <span className="text-slate-400 block text-[11px] mb-1">Public Verification URL:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1.5 rounded-lg font-mono text-[11px] truncate focus:outline-none"
                />
                <button
                  onClick={handleCopyUrl}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition flex-shrink-0"
                  title="คัดลอก URL"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Print & Download Options */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">เลือกขนาดความละเอียดสำหรับพิมพ์บรรจุภัณฑ์:</span>
            <div className="flex gap-2">
              {[
                { label: 'เว็บ (300px)', val: 300 },
                { label: 'พิมพ์กล่อง (600px)', val: 600 },
                { label: 'ความละเอียดสูง (1200px)', val: 1200 },
                { label: 'มาสเตอร์ (2400px)', val: 2400 }
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setResolution(opt.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    resolution === opt.val
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <a
              href={`/verify/${product.newcode}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>เปิดหน้าฉลากประชาชน</span>
            </a>

            <button
              onClick={() => window.print()}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition inline-flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ใบรับรอง QR</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด Vector SVG</span>
            </button>

            <button
              onClick={handleDownloadPng}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#002B49] hover:bg-[#001D33] rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด PNG ({resolution}px)</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
