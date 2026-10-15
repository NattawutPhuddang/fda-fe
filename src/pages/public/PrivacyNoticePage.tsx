import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyNoticePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar />

      <main className="max-w-4xl w-full mx-auto px-4 py-10 flex-1 space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 border-b pb-6">
            <div className="p-3 bg-blue-100 text-blue-900 rounded-2xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                นโยบายการคุ้มครองข้อมูลส่วนบุคคล (Privacy Notice)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                ระบบฉลากดิจิทัล สำนักงานคณะกรรมการอาหารและยา กระทรวงสาธารณสุข — ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
              </p>
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                1. วัตถุประสงค์ของการประมวลผลข้อมูล
              </h3>
              <p>
                สำนักงานคณะกรรมการอาหารและยา (อย.) เก็บรวบรวม ใช้ และประมวลผลข้อมูลส่วนบุคคลของท่าน เพื่อวัตถุประสงค์ในการให้บริการระบบฉลากดิจิทัลแห่งชาติ การยืนยันตัวตนผู้ประกอบการและตัวแทนผู้รับมอบอำนาจตามกฎหมาย การตรวจสอบความถูกต้องของผลิตภัณฑ์สุขภาพ และการเฝ้าระวังความปลอดภัยของผู้บริโภค
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                2. ข้อมูลที่มีการจัดเก็บตามหลัก Data Minimization (เก็บเท่าที่จำเป็น)
              </h3>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li><strong>สำหรับประชาชนทั่วไป:</strong> เมื่อสแกน QR Code เพื่อดูฉลาก ระบบจะไม่เก็บพิกัด GPS ละเอียด (Precise GPS) โดยอัตโนมัติ จะเก็บเพียงสถิติการเข้าถึงประเภทอุปกรณ์ และช่วงเวลา เพื่อเฝ้าระวังทางสถิติเท่านั้น</li>
                <li><strong>สำหรับผู้ประกอบการและเจ้าหน้าที่:</strong> จัดเก็บชื่อ-นามสกุล, เลขประจำตัวประชาชน 13 หลัก, อีเมล, หมายเลขโทรศัพท์ และประวัติการบันทึกคำขอ (Audit Log) ตามหน้าที่ความรับผิดชอบตามกฎหมาย</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                3. ระยะเวลาการเก็บรักษาข้อมูล (Data Retention)
              </h3>
              <p>
                อย. จะเก็บรักษาข้อมูลประวัติคำขอและ Audit Logs เป็นเวลาไม่น้อยกว่า 10 ปี ตามมาตรฐานการจัดเก็บเอกสารทางราชการและมาตรฐานความมั่นคงปลอดภัยระบบสารสนเทศภาครัฐ และจะทำลายหรือทำให้เป็นข้อมูลนิรนามเมื่อครบกำหนดระยะเวลาดังกล่าว
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                4. สิทธิของเจ้าของข้อมูลส่วนบุคคล (Data Subject Rights)
              </h3>
              <p>
                ท่านมีสิทธิในการขอเข้าถึง ขอรับสำเนา ขอแก้ไขข้อมูลให้ถูกต้อง ขอคัดค้าน หรือขอลบข้อมูลส่วนบุคคลของท่านได้ตามเงื่อนไขที่กฎหมายกำหนด โดยสามารถติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO) ของ อย. ได้ที่อีเมล dpo@fda.moph.go.th
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
