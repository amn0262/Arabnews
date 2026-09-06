import React, { useState, useEffect, useRef } from 'react';
import { Radio, Search, User, ChevronRight, ChevronLeft, Volume2 } from 'lucide-react';
import { TickerItem } from '../types';

interface HeaderProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
  tickerItems: TickerItem[];
  onSelectTickerItem?: (item: TickerItem) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  categories,
  tickerItems,
  onSelectTickerItem,
}) => {
  const [currentTickerIdx, setCurrentTickerIdx] = useState(0);
  const [isTickerPaused, setIsTickerPaused] = useState(false);
  const [isFading, setIsFading] = useState(false);

  // Auto rotate ticker every 4.5 seconds
  useEffect(() => {
    if (tickerItems.length <= 1 || isTickerPaused) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentTickerIdx((prev) => (prev + 1) % tickerItems.length);
        setIsFading(false);
      }, 250);
    }, 4500);

    return () => clearInterval(interval);
  }, [tickerItems.length, isTickerPaused]);

  const handlePrevTicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tickerItems.length === 0) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentTickerIdx((prev) => (prev - 1 + tickerItems.length) % tickerItems.length);
      setIsFading(false);
    }, 200);
  };

  const handleNextTicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tickerItems.length === 0) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentTickerIdx((prev) => (prev + 1) % tickerItems.length);
      setIsFading(false);
    }, 200);
  };

  const currentItem = tickerItems[currentTickerIdx];

  // Helper for source tag styling
  const getSourceBadgeColor = (source: string) => {
    if (source.includes('بي بي سي')) return 'bg-[#BB1919] text-white';
    if (source.includes('الجزيرة')) return 'bg-[#002B49] text-white';
    if (source.includes('فرانس')) return 'bg-[#0055A5] text-white';
    if (source.includes('اندبندنت')) return 'bg-[#8A1538] text-white';
    return 'bg-[#222222] text-white';
  };

  return (
    <header id="news-portal-header" className="flex-none shadow-sm select-none">
      {/* 1. Official BBC Global Black Bar */}
      <div className="bg-[#000000] text-[#FFFFFF] text-xs font-sans border-b border-[#222222]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
          {/* Left / Right based on RTL */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* BBC Blocks Logo */}
            <div className="flex items-center gap-[3px]" aria-label="BBC">
              <span className="flex h-5 w-5 items-center justify-center bg-white font-sans font-black text-black text-[11px] leading-none">
                B
              </span>
              <span className="flex h-5 w-5 items-center justify-center bg-white font-sans font-black text-black text-[11px] leading-none">
                B
              </span>
              <span className="flex h-5 w-5 items-center justify-center bg-white font-sans font-black text-black text-[11px] leading-none">
                C
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-medium text-white/90 hover:text-white cursor-pointer transition">
              <User className="h-3.5 w-3.5 text-white/80" />
              <span className="hidden sm:inline">تسجيل الدخول</span>
            </div>

            <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-white/85">
              <span className="hover:text-white cursor-pointer transition">الرئيسية</span>
              <span className="hover:text-white cursor-pointer transition">أخبار</span>
              <span className="hover:text-white cursor-pointer transition">رياضة</span>
              <span className="hover:text-white cursor-pointer transition">طقس</span>
              <span className="hover:text-white cursor-pointer transition">بودكاست</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/70 hover:text-white cursor-pointer transition">
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">بحث في BBC</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Official BBC News Red Masthead */}
      <div className="bg-[#B80000] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {/* BBC 3 Blocks in Red Bar */}
            <div className="flex items-center gap-[3px]">
              <span className="flex h-7 w-7 items-center justify-center bg-white font-sans font-black text-[#B80000] text-sm leading-none">
                B
              </span>
              <span className="flex h-7 w-7 items-center justify-center bg-white font-sans font-black text-[#B80000] text-sm leading-none">
                B
              </span>
              <span className="flex h-7 w-7 items-center justify-center bg-white font-sans font-black text-[#B80000] text-sm leading-none">
                C
              </span>
            </div>

            {/* NEWS | عربي */}
            <div className="flex items-baseline gap-2.5 leading-none">
              <span className="text-2xl sm:text-3xl font-black font-sans tracking-tight uppercase">
                NEWS
              </span>
              <span className="text-xl sm:text-2xl font-bold font-serif opacity-95">
                عربي
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-sans">
            <div className="flex items-center gap-1.5 bg-black/25 hover:bg-black/35 px-3 py-1.5 rounded-xs transition cursor-pointer text-white font-medium">
              <Radio className="h-3.5 w-3.5 text-white animate-pulse" />
              <span>بث مباشر</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-black/15 hover:bg-black/25 px-3 py-1.5 rounded-xs transition cursor-pointer text-white/90">
              <Volume2 className="h-3.5 w-3.5 text-white/80" />
              <span>راديو</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BBC News Categories Navigation Bar */}
      <div className="bg-[#990000] text-white border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center overflow-x-auto px-2 sm:px-6 scrollbar-none text-sm font-sans">
          {categories.map((cat) => {
            const isActive = currentCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`relative shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-2 font-bold text-xs sm:text-sm transition hover:bg-black/15 cursor-pointer ${
                  isActive ? 'text-white font-extrabold' : 'text-white/85'
                }`}
              >
                {cat}
                {isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-1 bg-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Real Immediate Multi-Source Breaking News Ticker */}
      <div
        className="border-b border-[#dddddd] bg-[#FFFFFF] text-[#1a1a1a] shadow-2xs"
        onMouseEnter={() => setIsTickerPaused(true)}
        onMouseLeave={() => setIsTickerPaused(false)}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 sm:px-6 text-xs font-sans">
          {/* Breaking Red Badge */}
          <div className="flex items-center gap-1.5 bg-[#B80000] text-white px-2.5 py-1 text-[11px] font-sans font-black uppercase tracking-wider shrink-0 rounded-xs">
            <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
            <span>عاجل</span>
          </div>

          {/* Headline Content */}
          <div className="flex-1 overflow-hidden min-w-0">
            {currentItem ? (
              <div
                onClick={() => onSelectTickerItem && onSelectTickerItem(currentItem)}
                className={`flex items-center gap-2 cursor-pointer transition-opacity duration-200 ${
                  isFading ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {/* Source Pill */}
                <span
                  className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-xs ${getSourceBadgeColor(
                    currentItem.source
                  )}`}
                >
                  {currentItem.source}
                </span>

                {/* Time Indicator */}
                <span className="hidden sm:inline-block text-[11px] text-[#666666] shrink-0 font-medium">
                  {currentItem.timeAgo} •
                </span>

                {/* Live Breaking Title */}
                <span className="truncate text-xs sm:text-[13px] font-semibold text-[#1a1a1a] hover:text-[#B80000] transition">
                  {currentItem.title}
                </span>
              </div>
            ) : (
              <span className="text-xs text-neutral-500">جاري مزامنة شريط الأخبار الفوري من المصادر الإخبارية...</span>
            )}
          </div>

          {/* Navigation Controls */}
          {tickerItems.length > 1 && (
            <div className="flex items-center gap-1 shrink-0 ps-2 border-s border-neutral-200">
              <span className="text-[10px] text-neutral-500 hidden sm:inline px-1">
                {currentTickerIdx + 1}/{tickerItems.length}
              </span>
              <button
                type="button"
                onClick={handlePrevTicker}
                aria-label="الخبر السابق"
                className="p-1 hover:bg-neutral-100 rounded-xs text-neutral-700 hover:text-black transition cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextTicker}
                aria-label="الخبر التالي"
                className="p-1 hover:bg-neutral-100 rounded-xs text-neutral-700 hover:text-black transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
