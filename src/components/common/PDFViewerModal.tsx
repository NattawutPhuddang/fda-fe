import React, { useState } from 'react';
import { Modal } from './Modal';
import { Download, ZoomIn, ZoomOut, RotateCw, FileText, Printer, CheckCircle } from 'lucide-react';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl?: string;
  documentName?: string;
  fileSize?: string;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  documentName = 'เอกสารกำกับทางการ_อย.pdf',
  fileSize = '1.8 MB'
}) => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 2;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle={`${documentName} (${fileSize})`} maxWidth="full">
      <div className="flex flex-col h-[75vh]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-200 rounded-t-xl text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-300">หน้า</span>
            <span className="px-2 py-0.5 bg-slate-700 rounded font-bold">{currentPage}</span>
            <span>/ {totalPages}</span>
            <div className="flex gap-1 ml-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded"
              >
                ก่อนหน้า
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded"
              >
                ถัดไป
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(z => Math.max(50, z - 10))}
              className="p-1.5 hover:bg-slate-700 rounded transition"
              title="ย่อ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="w-12 text-center text-xs font-mono">{zoom}%</span>
            <button
              onClick={() => setZoom(z => Math.min(200, z + 10))}
              className="p-1.5 hover:bg-slate-700 rounded transition"
              title="ขยาย"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-600 mx-1" />
            <button
              onClick={handlePrint}
              className="p-1.5 hover:bg-slate-700 rounded transition flex items-center gap-1"
              title="พิมพ์เอกสาร"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">พิมพ์</span>
            </button>
            <button
              onClick={() => alert(`ดาวน์โหลดเอกสาร: ${documentName}`)}
              className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition flex items-center gap-1 text-xs px-2.5"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด PDF</span>
            </button>
          </div>
        </div>

        {/* PDF Document Canvas View */}
        <div className="flex-1 bg-slate-200 overflow-auto p-6 flex justify-center items-start">
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="bg-white shadow-2xl rounded-sm w-[720px] min-h-[960px] p-12 text-slate-800 flex flex-col justify-between transition-transform duration-150 border border-slate-300"
          >
            {/* Page Header */}
            <div>
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-900 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-400">
                    อย. FDA
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-blue-950">สำนักงานคณะกรรมการอาหารและยา</h4>
                    <p className="text-xs text-slate-500">กระทรวงสาธารณสุข — Food and Drug Administration, Thailand</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> ตรวจสอบแล้วผ่านระบบอิเล็กทรอนิกส์
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">e-Document Ref: MOPH-FDA-2026-9812</p>
                </div>
              </div>

              {/* Document Body */}
              <div className="text-center my-6">
                <h3 className="text-xl font-bold text-slate-900 tracking-wide underline decoration-blue-900 underline-offset-8">
                  {currentPage === 1 ? 'เอกสารกำกับผลิตภัณฑ์ทางการ (Official Product Leaflet)' : 'ผลการวิเคราะห์และข้อกำหนดมาตรฐาน (Standard Specifications)'}
                </h3>
                <p className="text-xs text-slate-500 mt-2">อ้างอิงพระราชบัญญัติอาหารและยา และมาตรฐานการกำกับฉลากดิจิทัลแห่งชาติ</p>
              </div>

              {currentPage === 1 ? (
                <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[11px]">ชื่อผลิตภัณฑ์ (ไทย):</span>
                      <strong className="text-slate-900 text-sm">เครื่องดื่มรังนกแท้สำเร็จรูป ผสมโสมสกัด ตรา เฮลท์โกลด์</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Product Name (English):</span>
                      <strong className="text-slate-900 text-sm">HealthGold Instant Bird's Nest with Ginseng</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">เลขสารบบอาหาร / เลขทะเบียน:</span>
                      <strong className="text-blue-900 font-mono text-sm">10-1-04760-5-0012</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">รหัสผลิตภัณฑ์สากล (Newcode):</span>
                      <strong className="text-slate-900 font-mono text-xs">U1FD0001012345678901234567C</strong>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 mb-1">1. รายละเอียดผู้รับอนุญาตและสถานที่ผลิต</h5>
                    <p>บริษัท สยามไบโอเทค เฮลท์แคร์ จำกัด (เลขประจำตัวผู้เสียภาษี 0105556012345) ตั้งอยู่เลขที่ 123 นิคมอุตสาหกรรมบางปู ซอย 8 ตำบลบางปูใหม่ อำเภอเมือง จังหวัดสมุทรปราการ 10280 ได้รับอนุญาตให้ผลิตอาหารตามใบอนุญาตเลขที่ สป 45/2560</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 mb-1">2. ส่วนประกอบสำคัญในร้อยละของน้ำหนัก</h5>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                      <li>รังนกแห้งทำความสะอาดแท้ 100% (Dry Bird's Nest) 1.5%</li>
                      <li>สารสกัดโสมเกาหลี (Korean Ginseng Extract) 0.5%</li>
                      <li>น้ำตาลกรวดออร์แกนิก (Organic Rock Sugar) 9.0%</li>
                      <li>น้ำบริสุทธิ์ (Purified Water) ปริมาณที่เหลือ</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 mb-1">3. คำเตือนและข้อกำหนดทางกฎหมาย</h5>
                    <div className="border border-amber-300 bg-amber-50/50 p-3 rounded text-amber-950 font-medium">
                      คำเตือน: เขย่าขวดก่อนดื่ม เมื่อเปิดฝาแล้วควรดื่มให้หมดทันทีหรือเก็บในตู้เย็นและดื่มให้หมดภายใน 24 ชั่วโมง ผู้ที่มีประวัติแพ้รังนกหรือโสมควรปรึกษาแพทย์ก่อนรับประทาน
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2 border-b">รายการทดสอบ</th>
                          <th className="p-2 border-b">วิธีทดสอบ (Test Method)</th>
                          <th className="p-2 border-b">เกณฑ์มาตรฐาน อย.</th>
                          <th className="p-2 border-b">ผลการวิเคราะห์</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2 font-medium">Arsenic (สารหนู)</td>
                          <td className="p-2">ICP-MS</td>
                          <td className="p-2">&lt; 0.2 mg/kg</td>
                          <td className="p-2 text-emerald-600 font-bold">ผ่าน (&lt; 0.01)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Lead (สารตะกั่ว)</td>
                          <td className="p-2">ICP-MS</td>
                          <td className="p-2">&lt; 0.5 mg/kg</td>
                          <td className="p-2 text-emerald-600 font-bold">ผ่าน (&lt; 0.02)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Total Plate Count</td>
                          <td className="p-2">FDA BAM Chapter 3</td>
                          <td className="p-2">&lt; 10 CFU/ml</td>
                          <td className="p-2 text-emerald-600 font-bold">ไม่พบเชื้อ (Passed)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Preservatives (วัตถุกันเสีย)</td>
                          <td className="p-2">HPLC</td>
                          <td className="p-2">ห้ามใช้ (Not Allowed)</td>
                          <td className="p-2 text-emerald-600 font-bold">ไม่พบ (Not Detected)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8 pt-8 border-t flex justify-between items-end">
                    <div className="text-center">
                      <div className="w-32 h-16 border-b border-dashed border-slate-400 mx-auto mb-1 flex items-center justify-center text-slate-400 italic font-serif">
                        วรรณภา สิริกุล
                      </div>
                      <p className="font-bold text-slate-800">ภญ. วรรณภา สิริกุล</p>
                      <p className="text-[10px] text-slate-500">เภสัชกรชำนาญการพิเศษ ผู้ตรวจประเมิน อย.</p>
                    </div>

                    <div className="text-right">
                      <div className="w-24 h-24 border border-blue-900 rounded p-1 inline-flex items-center justify-center bg-blue-50/50">
                        <div className="text-[9px] text-center text-blue-950 font-bold leading-tight">
                          ตราประทับดิจิทัล<br/>กองอาหารและยา<br/>อย. ประเทศไทย
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">ประทับรับรองเมื่อ 15 ต.ค. 2526</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Page Footer */}
            <div className="border-t pt-4 text-[10px] text-slate-400 flex justify-between items-center">
              <span>ระบบฉลากดิจิทัล สำนักงานคณะกรรมการอาหารและยา กระทรวงสาธารณสุข</span>
              <span>หน้า {currentPage} จาก {totalPages}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
