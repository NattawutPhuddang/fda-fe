import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PhoneCall, Mail, ExternalLink } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3 text-white font-bold text-base">
            <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center flex-shrink-0">
              <img
                src="/Logo_of_the_Food_and_Drug_Administration.svg"
                alt="อย."
                className="w-full h-full object-contain"
              />
            </div>
            <span>สำนักงานคณะกรรมการอาหารและยา</span>
          </div>
          <p className="leading-relaxed text-slate-400">
            ระบบสารสนเทศฉลากดิจิทัลแห่งชาติ เพื่อความปลอดภัยและสุขภาวะของผู้บริโภคชาวไทย ให้ประชาชนเข้าถึงข้อมูลฉลากที่ถูกต้อง แม่นยำ และตรวจสอบย้อนกลับได้
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">ช่องทางติดต่อราชการ</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              <span>สายด่วน อย. 1556 (ตลอด 24 ชั่วโมง)</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>1556@fda.moph.go.th</span>
            </li>
            <li className="text-slate-500 text-[11px] mt-2">
              88/24 ถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมือง จังหวัดนนทบุรี 11000
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">บริการและข้อกำหนด</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/search" className="hover:text-white transition">ค้นหาฉลากผลิตภัณฑ์สาธารณะ</Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-white transition">นโยบายการคุ้มครองข้อมูลส่วนบุคคล (PDPA)</Link>
            </li>
            <li>
              <a href="https://oryor.com" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1">
                <span>เว็บไซต์หลัก อย. (oryor.com)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 transition">เข้าสู่ระบบสำหรับเจ้าหน้าที่และผู้ประกอบการ</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-slate-800 text-center text-[11px] text-slate-400">
        <p>© 2026 สำนักงานคณะกรรมการอาหารและยา (อย.) กระทรวงสาธารณสุข — All Rights Reserved.</p>
        <p className="mt-1 text-slate-400 font-mono">
          * ข้อมูลในระบบนี้เป็นข้อมูลจำลองเพื่อการสาธิตระบบต้นแบบฉลากดิจิทัล อย. (Prototype Evaluation)
        </p>
      </div>
    </footer>
  );
};
