import React from 'react';
import { Newspaper, Shield, FileText, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="news-portal-footer" className="mt-20 border-t-[2px] border-[#1a1a1a] bg-[#FDFBF7] text-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 pb-10 border-b border-[#1a1a1a]/15">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-[#1a1a1a]" />
              <span className="text-xl font-black font-serif text-[#1a1a1a]">مرصد الأخبار اليومية</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#1a1a1a]/70 max-w-md font-sans">
              منصة إخبارية رقمية متخصصة في رصد ومتابعة أبرز الأحداث العالمية والتقارير الاستقصائية والتحليلات الاقتصادية على مدار الساعة، عبر خلاصات الأخبار الموثقة وتغطية حية للأحداث وفق أعلى معايير النزاهة الصحفية.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#1a1a1a]">
              الأقسام الإخبارية
            </h4>
            <ul className="mt-3 space-y-2 text-xs font-sans text-[#1a1a1a]/70">
              <li className="hover:text-[#1a1a1a] transition-colors cursor-pointer">شؤون دولية وإقليمية</li>
              <li className="hover:text-[#1a1a1a] transition-colors cursor-pointer">تقارير وتحليلات استقصائية</li>
              <li className="hover:text-[#1a1a1a] transition-colors cursor-pointer">أسواق المال والأعمال</li>
              <li className="hover:text-[#1a1a1a] transition-colors cursor-pointer">تكنولوجيا وعلوم الفضاء</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#1a1a1a]">
              السياسات والخصوصية
            </h4>
            <ul className="mt-3 space-y-2 text-xs font-sans text-[#1a1a1a]/70">
              <li className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 opacity-60" />
                حماية خصوصية القارئ والمسودات
              </li>
              <li className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 opacity-60" />
                ميثاق الشرف الصحفي
              </li>
              <li className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 opacity-60" />
                معايير التدقيق والتحقق المعتمدة
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-sans text-[#1a1a1a]/60 uppercase tracking-wider">
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} مرصد الأخبار اليومية · The Daily News Chronicle
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span>ISSN 2981-8842</span>
            <span>•</span>
            <span>VERIFIED SYNDICATION</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
