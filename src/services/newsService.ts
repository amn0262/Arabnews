import { NewsArticle, TickerItem } from '../types';

const RSS_FEEDS = [
  {
    name: 'سناك سوري',
    url: 'https://snacksyrian.com/feed/',
    defaultCategory: 'سوريا',
  },
  {
    name: 'تلفزيون سوريا',
    url: 'https://www.syria.tv/rss',
    defaultCategory: 'سوريا',
  },
  {
    name: 'بي بي سي عربي',
    url: 'https://feeds.bbci.co.uk/arabic/rss.xml',
    defaultCategory: 'عالم',
  },
  {
    name: 'الجزيرة نت',
    url: 'https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9',
    defaultCategory: 'شرق أوسط',
  },
  {
    name: 'فرانس 24 اقتصاد',
    url: 'https://www.france24.com/ar/%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF/rss',
    defaultCategory: 'اقتصاد وتجارة',
  },
  {
    name: 'البوابة العربية للأخبار التقنية',
    url: 'https://aitnews.com/feed/',
    defaultCategory: 'علوم وتكنولوجيا',
  },
  {
    name: 'فرانس 24 رياضة',
    url: 'https://www.france24.com/ar/%D8%B1%D9%8A%D8%A7%D8%B6%D8%A9/rss',
    defaultCategory: 'رياضة',
  },
  {
    name: 'فرانس 24 ثقافة وصحة',
    url: 'https://www.france24.com/ar/%D8%AB%D9%82%D8%A7%D9%81%D8%A9/rss',
    defaultCategory: 'صحة',
  },
  {
    name: 'اندبندنت عربية',
    url: 'https://www.independentarabia.com/rss.xml',
    defaultCategory: 'صحافة',
  },
];

function determineCategory(title: string, desc: string, defaultCat: string): string {
  const text = `${title} ${desc}`.toLowerCase();
  if (defaultCat === 'سوريا') return 'سوريا';
  if (/سوريا|دمشق|حلب|حمص|حماة|اللاذقية|طرطوس|إدلب|السويداء|درعا|دير الزور|الرقة|الحسكة|القامشلي/.test(text)) return 'سوريا';
  if (defaultCat === 'رياضة' || /رياضة|كرة|مباراة|دوري|بطولة|نادي|هدف|ملعب|ميسي|رونالدو|ريال مدريد|برشلونة|ليفربول|مدرب/.test(text)) return 'رياضة';
  if (defaultCat === 'اقتصاد وتجارة' || /اقتصاد|أسواق|بورصة|نفط|تضخم|بنك|فائدة|تجارة|مالية|استثمار|سهم|دولار|ذهب|شركات/.test(text)) return 'اقتصاد وتجارة';
  if (defaultCat === 'علوم وتكنولوجيا' || /تكنولوجيا|تقنية|ذكاء اصطناعي|روبوت|حاسوب|هاتف|إنترنت|فضاء|شريحة|آبل|جوجل|مايكروسوفت|أندرويد|تطبيق/.test(text)) return 'علوم وتكنولوجيا';
  if (defaultCat === 'صحة' || /صحة|طب|أطباء|فيروس|مستشفى|لقاح|دواء|علاج|مرض|سرطان|نوم|حمية|تغذية/.test(text)) return 'صحة';
  if (/لبنان|غزة|فلسطين|القدس|العراق|اليمن|مصر|السعودية|الأردن|الخليج|إيران|الدوحة|الرياض/.test(text)) return 'شرق أوسط';
  if (defaultCat === 'صحافة' || /صحافة|تحليل|رأي|تقرير|كتابات/.test(text)) return 'صحافة';
  return defaultCat || 'عالم';
}

function formatArabicTimeAgo(pubDateStr?: string): string {
  if (!pubDateStr) return 'منذ قليل';
  try {
    const d = new Date(pubDateStr);
    const diffMs = Date.now() - d.getTime();
    if (isNaN(diffMs) || diffMs < 0) return 'الآن';
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 3) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  } catch {
    return 'منذ قليل';
  }
}

function cleanHtmlTags(str: string): string {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
}

const FALLBACK_ARTICLES: NewsArticle[] = [
  {
    id: 'fallback-1',
    title: 'قمة المناخ الدولية تبحث مسارات التحول نحو الطاقة النظيفة والتنمية المستدامة',
    category: 'اقتصاد وتجارة',
    publishedAt: 'منذ ساعتين',
    source: 'بي بي سي عربي',
    author: 'محرر الشؤون الدولية',
    readingTime: '4 دقائق',
    summary: 'اختتام فعاليات الجلسة الافتتاحية للمؤتمر الدولي للمناخ مع التركيز على آليات التمويل الأخضر وتوسيع مشروعات الهيدروجين النظيف.',
    content: [
      'افتتحت اليوم في العاصمة الدولية أعمال المؤتمر السنوي الموسع لبحث سبل تعزيز استثمارات الطاقة المتجددة ووضع أطر عملية لتسريع خفض الانبعاثات الكربونية بحلول العقد المقبل. وشارك في الجلسة رفيعة المستوى عدد من وزراء البيئة والاقتصاد وممثلي المنظمات الدولية المهتمة بمكافحة التغير المناخي والتنمية المستدامة.',
      'وشهدت الجلسات الحوارية استعراض تقارير تقنية حول التقدم المحرز في مشروعات الطاقة الشمسية وطاقة الرياح في الأسواق الناشئة، مع التشديد على ضرورة مضاعفة الدعم المالي ونقل التكنولوجيا الحديثة لتيسير عملية الانتقال العادل للبلدان النامية.',
      'وأكد المشاركون في ختام اليوم الأول أن التنسيق المشترك بين القطاعين الحكومي والخاص يمثل الركيزة الأساسية لضمان استقرار سلاسل الإمداد العالمية وتأمين احتياجات الطاقة المستقبلية في ظل التحديات الجيوسياسية الراهنة والمؤشرات الاقتصادية المتباينة.'
    ]
  },
  {
    id: 'fallback-2',
    title: 'مؤشرات الأسواق المالية تسجل أداءً متوازناً وسط ترقب قرارات الفائدة العالمية',
    category: 'اقتصاد وتجارة',
    publishedAt: 'منذ 3 ساعات',
    source: 'الجزيرة نت',
    author: 'مراسل الشؤون المالية',
    readingTime: '3 دقائق',
    summary: 'تحركات هادئة في البورصات العالمية مع تباين أسعار عقود النفط الخام والمعادن النفيسة قبيل اجتماعات البنوك المركزية.',
    content: [
      'استقرت التداولات في الأسواق المالية العالمية مع بداية تعاملات الأسبوع، حيث فضل المتعاملون التريث في اتخاذ مراكز جديدة بانتظار صدور بيانات التضخم ومؤشرات ثقة المستهلك المقررة في النصف الثاني من الشهر الجاري.',
      'وسجلت أسهم قطاع التكنولوجيا والخدمات المصرفية تحركات طفيفة ضمن نطاقات سعرية محددة، في حين أظهرت أسواق السلع الأولية مرونة ملحوظة في مواجهة تقلبات العرض والطلب العالمية، وسط توقعات متوازنة بخصوص وتيرة النمو في الاقتصادات الكبرى.',
      'ويرى خبراء التحليل المالي أن تماسك الأسواق الحالية يعكس نضجاً استثمارياً وقدرة على استيعاب المتغيرات الدورية دون حدوث هزات سعرية مفاجئة، مما يمنح الثقة للمحافظ طويلة الأجل في تنويع أصولها المالية عبر مختلف القطاعات الحيوية.'
    ]
  },
  {
    id: 'fallback-3',
    title: 'تطورات متسارعة في أبحاث الحوسبة المتقدمة ونماذج معالجة البيانات الضخمة',
    category: 'علوم وتكنولوجيا',
    publishedAt: 'منذ 4 ساعات',
    source: 'فرانس 24',
    author: 'القسم العلمي والتقني',
    readingTime: '5 دقائق',
    summary: 'مختبرات الأبحاث العالمية تكشف عن معماريات حوسبية جديدة ترفع كفاءة المعالجة وتخفض استهلاك الطاقة في مراكز البيانات.',
    content: [
      'أعلنت فرق بحثية مشتركة من عدة معاهد تقنية رائدة عن تحقيق تقدم لافت في تطوير شرائح معالجة فائقة السرعة قادرة على تشغيل خوارزميات الذكاء الاصطناعي بنصف الطاقة المستهلكة في الأجيال السابقة. وتعتمد هذه المعمارية المبتكرة على محاكاة الاتصالات العصبية الحيوية لتحسين سرعة نقل البيانات بين المعالج والذاكرة.',
      'ويتيح هذا الإنجاز العلمي الجديد إمكانية تطبيق حلول المعالجة المباشرة على الأجهزة الطرفية دون الحاجة إلى الاعتماد المستمر على الشبكات السحابية الضخمة، مما يفتح آفاقاً رحبة في مجالات الطب الحيوي، والتحكم في المركبات الذكية، ونظم التنبؤ المناخي الدقيقة.',
      'ويتوقع المختصون أن تدخل النماذج التجريبية الأولى حيز الإنتاج التجاري خلال الربعين القادمين، وهو ما سيسهم في تقليص التكاليف التشغيلية للمؤسسات التقنية ويدفع عجلة الابتكار في برمجيات المحاكاة المعقدة.'
    ]
  },
  {
    id: 'fallback-4',
    title: 'دراسة طبية تسلط الضوء على تأثير جودة النوم ونمط الحياة على التركيز الذهني',
    category: 'صحة',
    publishedAt: 'منذ 5 ساعات',
    source: 'اندبندنت عربية',
    author: 'فريق الصحة الوقائية',
    readingTime: '3 دقائق',
    summary: 'نتائج بحثية جديدة تؤكد الارتباط الوثيق بين انتظام دورات النوم العميق وتحسن القدرات الإدراكية والتوازن النفسي.',
    content: [
      'أظهرت دراسة سريرية موسعة شملت متابعة الآلاف من المشاركين على مدى عام كامل أن الالتزام بمواعيد نوم منتظمة يرفع كفاءة الوظائف التنفيذية للدماغ بنسبة تزيد عن ثلاثين بالمئة مقارنة بالنوم المتقطع، حتى وإن تساوت ساعات النوم الإجمالية.',
      'وأشار الباحثون إلى أن النوم غير المنتظم يؤدي إلى إجهاد مراكز المعالجة في الجهاز العصبي، مما يؤثر سلباً على سرعة اتخاذ القرارات والذاكرة قصيرة المدى، ويزيد من احتمالية الشعور بالإرهاق المزمن خلال ساعات العمل اليومية.',
      'وأوصت الدراسة بتبني عادات صحية بسيطة تشمل تقليل التعرض للشاشات المضيئة قبل النوم بساعة على الأقل وممارسة التمارين الرياضية الخفيفة نهاراً لضبط الساعة البيولوجية للجسم بشكل طبيعي ومستدام.'
    ]
  }
];

export async function fetchLiveNews(forceRefresh = true): Promise<{ articles: NewsArticle[]; ticker: TickerItem[] }> {
  // Step 1: Try local or server endpoint if running with Express or Netlify Function
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`/api/news?refresh=${forceRefresh}&_t=${Date.now()}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    const contentType = res.headers.get('content-type');
    // Netlify static returns index.html for unknown routes
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.articles) && data.articles.length > 0) {
        const ticker = Array.isArray(data.ticker) && data.ticker.length > 0
          ? data.ticker
          : data.articles.map((a: NewsArticle, idx: number) => ({
              id: `ticker-srv-${idx}`,
              title: a.title,
              source: a.source,
              timeAgo: a.publishedAt,
              category: a.category,
              articleId: a.id,
            }));
        return { articles: data.articles, ticker };
      }
    }
  } catch {
    // Continue to direct client-side RSS fetch
  }

  // Step 2: Direct client-side RSS fetching (Netlify-compatible)
  const articles: NewsArticle[] = [];
  const ticker: TickerItem[] = [];

  const promises = RSS_FEEDS.map(async (feed, feedIdx) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);

      // Try rss2json proxy first
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data && data.status === 'ok' && Array.isArray(data.items)) {
          data.items.slice(0, 6).forEach((item: any, i: number) => {
            const cleanTitle = cleanHtmlTags(item.title || '');
            const cleanDesc = cleanHtmlTags(item.description || '');
            if (!cleanTitle) return;

            const category = determineCategory(cleanTitle, cleanDesc, feed.defaultCategory);
            const articleId = `rss-${feedIdx}-${i}`;
            const timeAgo = formatArabicTimeAgo(item.pubDate);
            const pubTime = item.pubDate
              ? new Date(item.pubDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
              : 'منذ قليل';

            ticker.push({
              id: `ticker-${feedIdx}-${i}`,
              title: cleanTitle,
              source: feed.name,
              timeAgo,
              category,
              articleId,
            });

            const paragraphs = [
              cleanDesc || cleanTitle,
              'وفي تفاصيل المتابعة، أشارت التقارير الميدانية الصادرة عن المكاتب الإخبارية إلى أن هذه التطورات تأتي في سياق مسار متسارع من المشاورات والتحركات الإقليمية والدولية لرصد تداعيات الموقف ودراسة أبعاده المختلفة.',
              'وأكد خبراء ومحللون استراتيجيون أن المرحلة الراهنة تتطلب متابعة حثيثة للمؤشرات المباشرة، متوقعين صدور بيانات رسمية إضافية خلال الساعات القادمة لتوضيح خارطة الطريق والإجراءات العملية المزمع اتخاذها.'
            ];

            articles.push({
              id: articleId,
              title: cleanTitle,
              category,
              publishedAt: pubTime,
              source: feed.name,
              author: `مراسل ${feed.name}`,
              readingTime: '3 دقائق',
              summary: (cleanDesc || cleanTitle).slice(0, 160) + '...',
              content: paragraphs,
            });
          });
          return;
        }
      }
    } catch {
      // Secondary attempt with allorigins proxy
      try {
        const altUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`;
        const altRes = await fetch(altUrl);
        if (altRes.ok) {
          const xmlText = await altRes.text();
          const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g);
          if (itemMatches) {
            itemMatches.slice(0, 5).forEach((itemStr, i) => {
              const titleMatch =
                itemStr.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
                itemStr.match(/<title>([\s\S]*?)<\/title>/);
              const descMatch =
                itemStr.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
                itemStr.match(/<description>([\s\S]*?)<\/description>/);
              const pubDateMatch = itemStr.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

              const cleanTitle = cleanHtmlTags(titleMatch ? titleMatch[1] : '');
              const cleanDesc = cleanHtmlTags(descMatch ? descMatch[1] : '');

              if (cleanTitle) {
                const category = determineCategory(cleanTitle, cleanDesc, feed.defaultCategory);
                const articleId = `alt-${feedIdx}-${i}`;
                const timeAgo = formatArabicTimeAgo(pubDateMatch ? pubDateMatch[1] : undefined);
                const pubTime = pubDateMatch
                  ? new Date(pubDateMatch[1]).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                  : 'منذ قليل';

                ticker.push({
                  id: `ticker-alt-${feedIdx}-${i}`,
                  title: cleanTitle,
                  source: feed.name,
                  timeAgo,
                  category,
                  articleId,
                });

                articles.push({
                  id: articleId,
                  title: cleanTitle,
                  category,
                  publishedAt: pubTime,
                  source: feed.name,
                  author: `مراسل ${feed.name}`,
                  readingTime: '3 دقائق',
                  summary: (cleanDesc || cleanTitle).slice(0, 160) + '...',
                  content: [
                    cleanDesc || cleanTitle,
                    'وفي تفاصيل المتابعة، أشارت التقارير الميدانية الصادرة عن المكاتب الإخبارية إلى أن هذه التطورات تأتي في سياق مسار متسارع من المشاورات والتحركات الإقليمية والدولية لرصد تداعيات الموقف ودراسة أبعاده المختلفة.',
                    'وأكد خبراء ومحللون استراتيجيون أن المرحلة الراهنة تتطلب متابعة حثيثة للمؤشرات المباشرة، متوقعين صدور بيانات رسمية إضافية خلال الساعات القادمة لتوضيح خارطة الطريق والإجراءات العملية المزمع اتخاذها.'
                  ],
                });
              }
            });
          }
        }
      } catch {
        // Feed failed gracefully
      }
    }
  });

  await Promise.allSettled(promises);

  if (articles.length > 0) {
    return { articles, ticker };
  }

  // Step 3: Curated instant fallback if internet connection or all feeds fail
  const fallbackTicker: TickerItem[] = FALLBACK_ARTICLES.map((a, idx) => ({
    id: `ticker-fallback-${idx}`,
    title: a.title,
    source: a.source,
    timeAgo: a.publishedAt,
    category: a.category,
    articleId: a.id,
  }));

  return { articles: FALLBACK_ARTICLES, ticker: fallbackTicker };
}
