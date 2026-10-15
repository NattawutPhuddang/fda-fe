import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { storage } from '../../services/storage';
import { ProductCategory, Product } from '../../services/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Search, Filter, ArrowRight, ShieldCheck, Tag, ExternalLink } from 'lucide-react';

export const PublicSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [lang, setLang] = useState<'th' | 'en'>('th');

  const products = storage.getProducts();

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = category === 'ALL' || p.category === category;
      const cleanQ = query.trim().toLowerCase();
      const matchQuery = !cleanQ || 
        p.productNameTh.toLowerCase().includes(cleanQ) ||
        p.productNameEn.toLowerCase().includes(cleanQ) ||
        p.regNumber.toLowerCase().includes(cleanQ) ||
        p.newcode.toLowerCase().includes(cleanQ) ||
        p.manufacturerName.toLowerCase().includes(cleanQ);
      return matchCat && matchQuery;
    });
  }, [products, query, category]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar lang={lang} onToggleLang={() => setLang(l => l === 'th' ? 'en' : 'th')} />

      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">ค้นหาฉลากผลิตภัณฑ์สุขภาพ อย.</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ฐานข้อมูลสาธารณะตรวจสอบความถูกต้องของฉลากดิจิทัลและสถานะการอนุญาต
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อผลิตภัณฑ์, เลขสารบบ (13 หลัก), ทะเบียนยา, หรือ Newcode..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Category Select */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">ทุกหมวดหมู่ผลิตภัณฑ์</option>
                <option value="food">อาหารและเครื่องดื่ม</option>
                <option value="drug">ยาแผนปัจจุบัน</option>
                <option value="cosmetic">เครื่องสำอาง</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>พบทั้งหมด <strong>{filtered.length}</strong> รายการ</span>
            <span className="text-[11px] text-slate-400">* ระบบอัปเดตสถานะแบบเรียลไทม์จากฐานข้อมูล อย.</span>
          </div>
        </div>

        {/* Results Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(product => {
              const label = storage.getLabelByProductId(product.id);
              const isSuspended = product.registrationStatus === 'suspended' || label?.status === 'suspended';

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                    isSuspended ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {product.categoryNameTh}
                      </span>
                      <StatusBadge status={label?.status || product.activeLabelStatus || 'draft'} size="sm" />
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                      {product.productNameTh}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 italic">
                      {product.productNameEn}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">เลขทะเบียน / สารบบ:</span>
                        <strong className="text-blue-900 font-mono">{product.regNumber}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ผู้ผลิต:</span>
                        <span className="truncate max-w-[160px]">{product.manufacturerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">วันที่อนุมัติ:</span>
                        <span>{product.approvedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 border-t ${isSuspended ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50/50 border-slate-100'}`}>
                    <Link
                      to={`/verify/${product.newcode}`}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        isSuspended
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                          : 'bg-blue-900 hover:bg-blue-950 text-white shadow-xs'
                      }`}
                    >
                      <span>{isSuspended ? 'ตรวจสอบคำสั่งระงับ' : 'ดูข้อมูลฉลากดิจิทัล'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">ไม่พบข้อมูลผลิตภัณฑ์ที่ค้นหา</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              กรุณาตรวจสอบความถูกต้องของเลขสารบบอาหาร (13 หลัก) หรือเลขทะเบียนยา หรือลองค้นหาด้วยคำสำคัญชื่อผลิตภัณฑ์ภาษาไทย
            </p>
            <button
              onClick={() => { setQuery(''); setCategory('ALL'); }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              ล้างคำค้นหาทั้งหมด
            </button>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
