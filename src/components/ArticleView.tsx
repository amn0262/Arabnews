import React, { useState, useEffect, useRef } from 'react';
import { NewsArticle } from '../types';
import { Calendar, User, Clock, Share2, Printer, Bookmark, ShieldAlert, MessageSquare } from 'lucide-react';

interface ArticleViewProps {
  article: NewsArticle;
  covertMessage: string | null;
  covertMessageVisible: boolean;
  isCovertPinned: boolean;
  onDismissCovertMessage: () => void;
  onSendSecret: (text: string) => Promise<boolean>;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  covertMessage,
  covertMessageVisible,
  isCovertPinned,
  onDismissCovertMessage,
  onSendSecret,
}) => {
  const [commentText, setCommentText] = useState('');
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Requirement 3: Auto-wipe on 5-second typing pause
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCommentText(value);

    // Clear existing inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    // If there is text, start a 5-second auto-wipe timer
    if (value.trim().length > 0) {
      inactivityTimerRef.current = setTimeout(() => {
        setCommentText('');
        if (textareaRef.current) {
          textareaRef.current.value = '';
        }
      }, 5000);
    }
  };

  // Requirement 3: Wipe immediately on page close, refresh, or tab hide
  useEffect(() => {
    const wipeDataImmediately = () => {
      setCommentText('');
      if (textareaRef.current) {
        textareaRef.current.value = '';
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };

    window.addEventListener('beforeunload', wipeDataImmediately);
    window.addEventListener('unload', wipeDataImmediately);
    window.addEventListener('pagehide', wipeDataImmediately);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        wipeDataImmediately();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', wipeDataImmediately);
      window.removeEventListener('unload', wipeDataImmediately);
      window.removeEventListener('pagehide', wipeDataImmediately);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  // Secret Send: Triggered silently on submission
  const handleSendComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = commentText.trim();
    if (!textToSend) return;

    // Reset inactivity timer & clear input field instantly
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    setCommentText('');
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }

    // Transmit silently to backend
    await onSendSecret(textToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  // Render article paragraphs. The covert message is injected into the last paragraph.
  const paragraphs = article.content && article.content.length > 0
    ? article.content
    : [article.summary || 'جاري تحديث تفاصيل الخبر...'];

  const initialParagraphs = paragraphs.slice(0, paragraphs.length - 1);
  const lastParagraph = paragraphs[paragraphs.length - 1];

  return (
    <article id="active-news-article" className="border border-[#1a1a1a]/20 bg-[#FDFBF7] p-6 sm:p-10 text-[#1a1a1a]">
      {/* Category & Editorial Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a1a1a]/15 pb-4">
        <div className="flex items-center gap-2">
          <span className="bg-[#1a1a1a] text-[#FDFBF7] px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-widest">
            {article.category}
          </span>
          <span className="border border-[#1a1a1a]/20 px-2 py-0.5 text-[10px] font-sans uppercase tracking-wider text-[#1a1a1a]/80">
            تغطية موثقة
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#1a1a1a]/70 text-xs font-sans">
          <button
            onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
            className="flex items-center gap-1 border border-[#1a1a1a]/20 px-2.5 py-1 hover:bg-[#1a1a1a]/5 hover:text-[#1a1a1a] transition"
            title="تغيير حجم الخط"
          >
            خط {fontSize === 'normal' ? 'أكبر' : 'عادي'}
          </button>
          <button
            onClick={() => window.print()}
            className="p-1 border border-[#1a1a1a]/20 hover:bg-[#1a1a1a]/5 text-[#1a1a1a] transition"
            title="طباعة التقرير"
          >
            <Printer className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="p-1 border border-[#1a1a1a]/20 hover:bg-[#1a1a1a]/5 text-[#1a1a1a] transition"
            title="نسخ الرابط"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Headline in Serif Typography */}
      <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-black font-serif text-[#1a1a1a] leading-tight">
        {article.title}
      </h2>

      {/* Metadata Bar - Editorial Double Rule */}
      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-sans text-[#1a1a1a]/70 border-y border-[#1a1a1a]/15 py-3">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#1a1a1a]">
          <User className="h-3.5 w-3.5 opacity-60" />
          {article.author} · {article.source}
        </span>
        <span className="opacity-30">•</span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 opacity-60" />
          {article.publishedAt}
        </span>
        <span className="opacity-30">•</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 opacity-60" />
          زمن القراءة: {article.readingTime}
        </span>
      </div>

      {/* Summary Highlight Box (Authentic Journalistic Style) */}
      {article.summary && (
        <div className="my-6 border-s-[3px] border-[#1a1a1a] bg-[#f4f1ea] p-4 text-base font-serif italic leading-relaxed text-[#1a1a1a]">
          {article.summary}
        </div>
      )}

      {/* Main Article Body in Serif Editorial Style */}
      {/* 
        CRITICAL REQUIREMENT 4:
        Seamless camouflage injection.
        The incoming covert message is injected directly at the end of the news text.
        - If ends with a period, it stays pinned until clicked!
        - If not, it remains for 3 seconds then fades out.
        - Clicking it directly fades it out anytime.
      */}
      <div
        className={`mt-6 text-justify text-[#1a1a1a] space-y-5 font-serif font-normal ${
          fontSize === 'large' ? 'text-xl leading-10' : 'text-lg leading-9'
        }`}
      >
        {initialParagraphs.map((para, index) => (
          <p key={index} className="leading-relaxed">
            {para}
          </p>
        ))}

        {/* Concluding paragraph with camouflaged secret message integration */}
        <p className="leading-relaxed">
          <span>{lastParagraph}</span>
          {covertMessage && (
            <span
              onClick={onDismissCovertMessage}
              className={`inline transition-opacity duration-700 ease-in-out text-[#1a1a1a] ${
                covertMessageVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
              } ${isCovertPinned ? 'cursor-pointer select-text' : ''}`}
            >
              {' ' + covertMessage}
            </span>
          )}
        </p>
      </div>

      {/* Article Footer & Tags */}
      <div className="mt-10 border-t border-[#1a1a1a]/15 pt-4 text-xs font-sans text-[#1a1a1a]/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1a1a1a] uppercase tracking-wider text-[11px]">الوسوم التحريرية:</span>
          <span className="border border-[#1a1a1a]/20 px-2 py-0.5 text-[11px] font-sans">تقارير دولية</span>
          <span className="border border-[#1a1a1a]/20 px-2 py-0.5 text-[11px] font-sans">شؤون الساعة</span>
          <span className="border border-[#1a1a1a]/20 px-2 py-0.5 text-[11px] font-sans">توثيق مباشر</span>
        </div>
        <div className="flex items-center gap-1 opacity-60">
          <Bookmark className="h-3.5 w-3.5" />
          تم التوثيق والتدقيق التحريري
        </div>
      </div>

      {/* 
        CRITICAL REQUIREMENT 2 & 3: Secret Input Box (Camouflaged as Reader Notes / Comments)
        - Looks like a standard reader notes / feedback field
        - Button labeled "اكتب تعليق" with NO icon
        - All assistance tools disabled (autocomplete, autocorrect, spellcheck, etc.)
        - Silent transmission
        - 5-second inactivity auto-wipe
        - Instant wipe on close / refresh
      */}
      <section id="reader-notes-section" className="mt-12 border-t-[2px] border-[#1a1a1a] bg-[#FDFBF7] pt-6">
        <div className="flex items-center justify-between gap-2 border-b border-[#1a1a1a]/15 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[#1a1a1a]" />
            <h3 className="text-xs font-sans font-black uppercase tracking-[0.2em] text-[#1a1a1a]">
              ملاحظات القارئ والتعليقات التحريرية
            </h3>
          </div>
          <span className="text-[10px] font-sans opacity-50 uppercase tracking-widest hidden sm:inline">
            Internal Chronicle Memo
          </span>
        </div>

        <form onSubmit={handleSendComment} className="mt-4">
          <label htmlFor="reader-comment-input" className="sr-only">
            إضافة ملاحظة أو تعليق
          </label>

          <div className="relative">
            <textarea
              id="reader-comment-input"
              ref={textareaRef}
              rows={3}
              value={commentText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="أضف ملاحظتك أو تعقيبك التحريري حول هذا التقرير الإخباري..."
              className="w-full resize-none border border-[#1a1a1a]/25 bg-[#f4f1ea] p-4 text-sm font-sans text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#1a1a1a] focus:outline-none transition"
              // Disabled all browser assistance tools as strictly required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
              aria-autocomplete="none"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-sans text-[#1a1a1a]/60">
              <ShieldAlert className="h-3.5 w-3.5 opacity-60 shrink-0" />
              <span>
                تنبيه الخصوصية: تُمسح المسودة تلقائياً بعد 5 ثوانٍ من التوقف عن الكتابة أو عند مغادرة الصفحة.
              </span>
            </div>

            <button
              id="send-reader-comment-btn"
              type="submit"
              disabled={!commentText.trim()}
              className="inline-flex items-center justify-center bg-[#1a1a1a] px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-widest text-[#FDFBF7] shadow-xs hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 transition"
            >
              اكتب تعليق
            </button>
          </div>
        </form>
      </section>
    </article>
  );
};
