import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NewsArticle, TickerItem } from './types';
import { Header } from './components/Header';
import { ArticleView } from './components/ArticleView';
import { SidebarNews } from './components/SidebarNews';
import { Footer } from './components/Footer';
import { Loader2, RefreshCw } from 'lucide-react';
import { fetchLiveNews } from './services/newsService';
import { sendCovertMessage, fetchCovertUpdates } from './services/telegramService';

const BBC_CATEGORIES = ['الرئيسية', 'سوريا', 'شرق أوسط', 'عالم', 'اقتصاد وتجارة', 'علوم وتكنولوجيا', 'صحة', 'رياضة', 'صحافة'];

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('الرئيسية');

  // Covert Message Display State
  // Camouflage: Smooth appearance, pinned if ends with a period until clicked, or 3-second fade-out
  const [covertMessage, setCovertMessage] = useState<string | null>(null);
  const [covertMessageVisible, setCovertMessageVisible] = useState(false);
  const [isCovertPinned, setIsCovertPinned] = useState(false);

  // Queue of incoming messages
  const messageQueueRef = useRef<string[]>([]);
  const isDisplayingMessageRef = useRef<boolean>(false);
  const covertTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch News on every startup/launch directly from multi-source live feeds (Netlify-ready)
  const loadNews = async (forceRefresh = true) => {
    try {
      setLoading(true);
      const data = await fetchLiveNews(forceRefresh);
      if (data && data.articles && data.articles.length > 0) {
        setArticles(data.articles);
        setActiveArticle((prev) => {
          if (!prev) return data.articles[0];
          const stillExists = data.articles.find((a) => a.id === prev.id);
          return stillExists || data.articles[0];
        });
      }
      if (data && Array.isArray(data.ticker)) {
        setTickerItems(data.ticker);
      }
    } catch (err) {
      console.error('Failed to load news feed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Immediate refresh on every site startup
  useEffect(() => {
    loadNews(true);
  }, []);

  // Handle clicking an item on the breaking news ticker
  const handleSelectTickerItem = (item: TickerItem) => {
    if (!item) return;
    const found = articles.find((a) => a.id === item.articleId || a.title === item.title);
    if (found) {
      setActiveArticle(found);
      window.scrollTo({ top: 140, behavior: 'smooth' });
    } else {
      const newArticle: NewsArticle = {
        id: item.articleId || `ticker-${Date.now()}`,
        title: item.title,
        category: item.category || 'عاجل',
        publishedAt: item.timeAgo || 'الآن',
        source: item.source || 'المصادر الإخبارية',
        author: `مراسل ${item.source}`,
        readingTime: 'دقيقتان',
        summary: item.title,
        content: [
          item.title,
          "تفيد التقارير العاجلة الواردة من مصادر المتابعة الميدانية باستمرار تطورات الموقف مع ترقب صدور بيانات توضيحية إضافية خلال الساعات القادمة.",
          "وتتابع غرف الأخبار المشتركة آخر المستجدات المتعلقة بهذا الحدث لتقديم تغطية شاملة ومباشرة لكافة التفاصيل فور ورودها."
        ],
      };
      setArticles((prev) => [newArticle, ...prev]);
      setActiveArticle(newArticle);
      window.scrollTo({ top: 140, behavior: 'smooth' });
    }
  };

  // Dismiss current covert message with smooth fade out
  const dismissCovertMessage = useCallback(() => {
    if (covertTimerRef.current) {
      clearTimeout(covertTimerRef.current);
      covertTimerRef.current = null;
    }

    setCovertMessageVisible(false);

    // After fade-out animation completes (700ms), completely clear and process next
    setTimeout(() => {
      setCovertMessage(null);
      setIsCovertPinned(false);
      isDisplayingMessageRef.current = false;
      if (messageQueueRef.current.length > 0) {
        processNextMessage();
      }
    }, 700);
  }, []);

  // Process next message in covert queue
  const processNextMessage = useCallback(() => {
    if (isDisplayingMessageRef.current || messageQueueRef.current.length === 0) {
      return;
    }

    const nextText = messageQueueRef.current.shift();
    if (!nextText) return;

    isDisplayingMessageRef.current = true;

    // Requirement: If message ends with a period, it stays pinned until clicked!
    const trimmed = nextText.trim();
    const endsWithPeriod = trimmed.endsWith('.') || trimmed.endsWith('۔') || trimmed.endsWith('。');

    setCovertMessage(nextText);
    setIsCovertPinned(endsWithPeriod);

    // Fade-in smoothly
    requestAnimationFrame(() => {
      setCovertMessageVisible(true);
    });

    if (covertTimerRef.current) {
      clearTimeout(covertTimerRef.current);
      covertTimerRef.current = null;
    }

    // If NOT ending with a period, auto-dismiss after exactly 3 seconds (3000ms)
    if (!endsWithPeriod) {
      covertTimerRef.current = setTimeout(() => {
        dismissCovertMessage();
      }, 3000);
    }
  }, [dismissCovertMessage]);

  // Periodic check every 3 seconds for live updates (works seamlessly on Netlify & local)
  useEffect(() => {
    // Initial call to acknowledge past updates
    fetchCovertUpdates(true).catch(() => {});

    const intervalId = setInterval(async () => {
      try {
        const messages = await fetchCovertUpdates(false);
        if (messages.length > 0) {
          for (const text of messages) {
            messageQueueRef.current.push(text);
          }
          processNextMessage();
        }
      } catch {
        // Silent error handling
      }
    }, 3000); // 3-second polling interval

    return () => clearInterval(intervalId);
  }, [processNextMessage]);

  // Secret Send (works directly on Netlify or through backend)
  const handleSendSecret = async (text: string): Promise<boolean> => {
    return await sendCovertMessage(text);
  };

  // Category filtering matching official BBC Arabic taxonomy & Syrian sources
  const categories = BBC_CATEGORIES;

  const matchesCategory = (a: NewsArticle, cat: string): boolean => {
    if (cat === 'الرئيسية' || cat === 'الكل') return true;
    if (a.category === cat || a.category.includes(cat)) return true;

    const fullText = `${a.title} ${a.summary || ''} ${a.source || ''}`.toLowerCase();
    if (cat === 'سوريا') {
      return /سناك سوري|تلفزيون سوريا|سوريا|سورية|دمشق|حلب|حمص|حماة|اللاذقية|طرطوس|إدلب|السويداء|درعا|دير الزور|الرقة|الحسكة|القامشلي/.test(fullText);
    }
    if (cat === 'شرق أوسط') {
      return /لبنان|غزة|فلسطين|مصر|الأردن|العراق|اليمن|الخليج|إيران|القدس|الضفة/.test(fullText);
    }
    if (cat === 'عالم') {
      return /عالم|دولي|أوروبا|أمريكا|روسيا|الصين|أوكرانيا|واشنطن|باريس|لندن|بريطانيا|ألمانيا/.test(fullText);
    }
    if (cat === 'اقتصاد وتجارة') {
      return /اقتصاد|أسواق|نفط|تضخم|بنك|فائدة|تجارة|بورصة|مالية|استثمار|سهم|دولار|ذهب/.test(fullText);
    }
    if (cat === 'علوم وتكنولوجيا') {
      return /تكنولوجيا|تقنية|ذكاء اصطناعي|روبوت|حاسوب|هاتف|إنترنت|فضاء|شريحة|تطبيق|برمجيات|aitnews/.test(fullText);
    }
    if (cat === 'صحة') {
      return /صحة|طب|أطباء|فيروس|مستشفى|لقاح|دواء|علاج|مرض|سرطان|نوم|حمية|تغذية/.test(fullText);
    }
    if (cat === 'رياضة') {
      return /رياضة|كرة|مباراة|ميسي|رونالدو|دوري|بطولة|نادي|هدف|ملعب|ليفربول|ريال مدريد|برشلونة/.test(fullText);
    }
    if (cat === 'صحافة') {
      return /صحافة|تحليل|رأي|مقال|تقرير|اندبندنت/.test(fullText);
    }
    return false;
  };

  const filteredArticles =
    selectedCategory === 'الرئيسية' || selectedCategory === 'الكل'
      ? articles
      : articles.filter((a) => matchesCategory(a, selectedCategory));

  const displayArticles = filteredArticles.length > 0 ? filteredArticles : articles;

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    const relevant = cat === 'الرئيسية' || cat === 'الكل'
      ? articles
      : articles.filter((a) => matchesCategory(a, cat));
    if (relevant.length > 0) {
      setActiveArticle(relevant[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1a1a1a] flex flex-col font-sans">
      {/* Header - Identical to Official BBC News Arabic with live multi-source breaking ticker */}
      <Header
        currentCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        categories={categories}
        tickerItems={tickerItems}
        onSelectTickerItem={handleSelectTickerItem}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#1a1a1a]/60">
            <Loader2 className="h-8 w-8 animate-spin text-[#B80000] mb-3" />
            <p className="text-sm font-serif">جاري جلب أحدث التقارير المباشرة من المصادر الإخبارية العالمية...</p>
          </div>
        ) : activeArticle ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Main Reading Pane (8 cols) */}
            <div className="lg:col-span-8">
              <ArticleView
                article={activeArticle}
                covertMessage={covertMessage}
                covertMessageVisible={covertMessageVisible}
                isCovertPinned={isCovertPinned}
                onDismissCovertMessage={dismissCovertMessage}
                onSendSecret={handleSendSecret}
              />
            </div>

            {/* Sidebar (4 cols) */}
            <div className="lg:col-span-4">
              <SidebarNews
                articles={displayArticles}
                activeArticleId={activeArticle.id}
                onSelectArticle={(art) => {
                  setActiveArticle(art);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
              />
            </div>
          </div>
        ) : (
          <div className="border border-[#1a1a1a]/20 bg-[#FDFBF7] p-12 text-center text-[#1a1a1a]/70">
            <p className="text-base font-serif">لا توجد تقارير متاحة حالياً في هذه الطبعة.</p>
            <button
              onClick={() => loadNews(true)}
              className="mt-4 inline-flex items-center gap-2 bg-[#B80000] px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-widest text-white hover:opacity-90 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              تحديث النشرة فوراً
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
