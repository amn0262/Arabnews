import React from 'react';
import { NewsArticle } from '../types';
import { TrendingUp, ChevronLeft, Eye, Clock } from 'lucide-react';

interface SidebarNewsProps {
  articles: NewsArticle[];
  activeArticleId: string;
  onSelectArticle: (article: NewsArticle) => void;
}

export const SidebarNews: React.FC<SidebarNewsProps> = ({
  articles,
  activeArticleId,
  onSelectArticle,
}) => {
  return (
    <aside id="news-sidebar" className="space-y-6 text-[#1a1a1a]">
      {/* Most Read Articles */}
      <div className="border border-[#1a1a1a]/20 bg-[#FDFBF7] p-5">
        <div className="flex items-center justify-between border-b-[2px] border-[#1a1a1a] pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#1a1a1a]" />
            <h3 className="text-xs font-sans font-black uppercase tracking-[0.2em] text-[#1a1a1a]">
              أبرز التقارير والمتابعات
            </h3>
          </div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#1a1a1a]/50">
            Chronicle Wire
          </span>
        </div>

        <div className="mt-4 divide-y divide-[#1a1a1a]/15">
          {articles.map((art, idx) => {
            const isActive = art.id === activeArticleId;
            return (
              <button
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className={`w-full text-right py-3.5 transition-colors group flex items-start gap-3.5 ${
                  isActive ? 'bg-[#1a1a1a]/5 px-2 -mx-2' : 'hover:bg-[#1a1a1a]/5 hover:px-2 hover:-mx-2'
                }`}
              >
                <span className={`font-serif text-lg font-bold shrink-0 w-5 text-center ${
                  isActive ? 'text-[#1a1a1a] underline' : 'text-[#1a1a1a]/40 group-hover:text-[#1a1a1a]'
                }`}>
                  {idx + 1}
                </span>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-wider text-[#1a1a1a]/60 mb-1">
                    <span className="font-bold text-[#1a1a1a]">{art.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 opacity-60" />
                      {art.publishedAt}
                    </span>
                  </div>
                  <h4 className={`text-sm font-serif leading-snug ${
                    isActive ? 'text-[#1a1a1a] font-bold underline underline-offset-4' : 'text-[#1a1a1a] group-hover:underline'
                  }`}>
                    {art.title}
                  </h4>
                </div>

                <ChevronLeft className="h-4 w-4 text-[#1a1a1a]/30 group-hover:text-[#1a1a1a] shrink-0 self-center" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Editorial Disclaimer / Live Service */}
      <div className="border border-[#1a1a1a]/20 bg-[#f4f1ea] p-4 text-xs font-sans text-[#1a1a1a]/80">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5 text-[11px]">
          <Eye className="h-3.5 w-3.5 opacity-70" />
          الميثاق المهني والشفافية التحريرية
        </div>
        <p className="leading-relaxed text-[#1a1a1a]/70 text-[11px]">
          تعتمد المنصة على تدفقات RSS الإخبارية المباشرة مع آليات تدقيق مستمرة لضمان دقة المحتوى المنشور وسرعة تحديث التقارير الاستقصائية وفق معايير الصحافة المستقلة.
        </p>
      </div>
    </aside>
  );
};
