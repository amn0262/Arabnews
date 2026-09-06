import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

const BOT_TOKEN = "8394320495:AAGyRY5siD2sQBbjL_JaoY1h6GH016TGBYM";
const TARGET_CHAT_ID = "1117141728";

// Track Telegram update offset so each message is received only once
let telegramOffset = 0;
let isInitialized = false;
const simulatedQueue: Array<{ id: number; text: string; date: number }> = [];

// Fallback high-quality news in case RSS is unreachable or slow
const fallbackArticles = [
  {
    id: "art-1",
    title: "قمة المناخ الدولية تبحث مسارات التحول نحو الطاقة النظيفة والتنمية المستدامة",
    category: "بيئة واقتصاد",
    publishedAt: "منذ ساعتين",
    source: "وكالة الأنباء الدولية",
    author: "قسم الشؤون البيئية",
    readingTime: "4 دقائق",
    summary: "اختتام فعاليات الجلسة الافتتاحية للمؤتمر الدولي للمناخ مع التركيز على آليات التمويل الأخضر وتوسيع مشروعات الهيدروجين.",
    content: [
      "افتتحت اليوم في العاصمة الدولية أعمال المؤتمر السنوي الموسع لبحث سبل تعزيز استثمارات الطاقة المتجددة ووضع أطر عملية لتسريع خفض الانبعاثات الكربونية بحلول العقد المقبل. وشارك في الجلسة رفيعة المستوى عدد من وزراء البيئة والاقتصاد وممثلي المنظمات الدولية المهتمة بمكافحة التغير المناخي والتنمية المستدامة.",
      "وشهدت الجلسات الحوارية استعراض تقارير تقنية حول التقدم المحرز في مشروعات الطاقة الشمسية وطاقة الرياح في الأسواق الناشئة، مع التشديد على ضرورة مضاعفة الدعم المالي ونقل التكنولوجيا الحديثة لتيسير عملية الانتقال العادل للبلدان النامية.",
      "وأكد المشاركون في ختام اليوم الأول أن التنسيق المشترك بين القطاعين الحكومي والخاص يمثل الركيزة الأساسية لضمان استقرار سلاسل الإمداد العالمية وتأمين احتياجات الطاقة المستقبلية في ظل التحديات الجيوسياسية الراهنة والمؤشرات الاقتصادية المتباينة."
    ]
  },
  {
    id: "art-2",
    title: "مؤشرات الأسواق المالية تسجل أداءً متوازناً وسط ترقب قرارات الفائدة العالمية",
    category: "أسواق ومال",
    publishedAt: "منذ 4 ساعات",
    source: "مرصد المؤشرات العالمية",
    author: "التحرير الاقتصادي",
    readingTime: "3 دقائق",
    summary: "تحركات هادئة في البورصات العالمية مع تباين أسعار عقود النفط الخام والمعادن النفيسة قبيل اجتماعات البنوك المركزية.",
    content: [
      "استقرت التداولات في الأسواق المالية العالمية مع بداية تعاملات الأسبوع، حيث فضل المتعاملون التريث في اتخاذ مراكز جديدة بانتظار صدور بيانات التضخم ومؤشرات ثقة المستهلك المقررة في النصف الثاني من الشهر الجاري.",
      "وسجلت أسهم قطاع التكنولوجيا والخدمات المصرفية تحركات طفيفة ضمن نطاقات سعرية محددة، في حين أظهرت أسواق السلع الأولية مرونة ملحوظة في مواجهة تقلبات العرض والطلب العالمية، وسط توقعات متوازنة بخصوص وتيرة النمو في الاقتصادات الكبرى.",
      "ويرى خبراء التحليل المالي أن تماسك الأسواق الحالية يعكس نضجاً استثمارياً وقدرة على استيعاب المتغيرات الدورية دون حدوث هزات سعرية مفاجئة، مما يمنح الثقة للمحافظ طويلة الأجل في تنويع أصولها المالية عبر مختلف القطاعات الحيوية."
    ]
  },
  {
    id: "art-3",
    title: "تطورات متسارعة في أبحاث الحوسبة المتقدمة ونماذج معالجة البيانات الضخمة",
    category: "تكنولوجيا وعلوم",
    publishedAt: "منذ 6 ساعات",
    source: "مجلة الابتكار التقني",
    author: "د. طارق الحكيم",
    readingTime: "5 دقائق",
    summary: "مختبرات الأبحاث العالمية تكشف عن معماريات حوسبية جديدة ترفع كفاءة المعالجة وتخفض استهلاك الطاقة في مراكز البيانات.",
    content: [
      "أعلنت فرق بحثية مشتركة من عدة معاهد تقنية رائدة عن تحقيق تقدم لافت في تطوير شرائح معالجة فائقة السرعة قادرة على تشغيل خوارزميات الذكاء الاصطناعي بنصف الطاقة المستهلكة في الأجيال السابقة. وتعتمد هذه المعمارية المبتكرة على محاكاة الاتصالات العصبية الحيوية لتحسين سرعة نقل البيانات بين المعالج والذاكرة.",
      "ويتيح هذا الإنجاز العلمي الجديد إمكانية تطبيق حلول المعالجة المباشرة على الأجهزة الطرفية دون الحاجة إلى الاعتماد المستمر على الشبكات السحابية الضخمة، مما يفتح آفاقاً رحبة في مجالات الطب الحيوي، والتحكم في المركبات الذكية، ونظم التنبؤ المناخي الدقيقة.",
      "ويتوقع المختصون أن تدخل النماذج التجريبية الأولى حيز الإنتاج التجاري خلال الربعين القادمين، وهو ما سيسهم في تقليص التكاليف التشغيلية للمؤسسات التقنية ويدفع عجلة الابتكار في برمجيات المحاكاة المعقدة."
    ]
  },
  {
    id: "art-4",
    title: "دراسة طبية تسلط الضوء على تأثير جودة النوم ونمط الحياة على التركيز الذهني",
    category: "صحة ومجتمع",
    publishedAt: "اليوم 09:15",
    source: "دورية الصحة العامة",
    author: "فريق الصحة الوقائية",
    readingTime: "3 دقائق",
    summary: "نتائج بحثية جديدة تؤكد الارتباط الوثيق بين انتظام دورات النوم العميق وتحسن القدرات الإدراكية والتوازن النفسي.",
    content: [
      "أظهرت دراسة سريرية موسعة شملت متابعة الآلاف من المشاركين على مدى عام كامل أن الالتزام بمواعيد نوم منتظمة يرفع كفاءة الوظائف التنفيذية للدماغ بنسبة تزيد عن ثلاثين بالمئة مقارنة بالنوم المتقطع، حتى وإن تساوت ساعات النوم الإجمالية.",
      "وأوضحت الدراسة أن النشاط البدني المعتدل خلال ساعات الصباح الأولى، إلى جانب تقنين التعرض للشاشات المضيئة قبل موعد النوم بساعة واحدة على الأقل، يساعد في ضبط الساعة البيولوجية للجسم وتحفيز إفراز الهرمونات المنظمة للاسترخاء الطبيعي.",
      "وشدد الأطباء القائمون على البحث على ضرورة تبني نهج وقائي شامل يرتكز على العادات اليومية البسيطة والبيئة المريحة، لما لذلك من أثر مباشر في الحد من التوتر المزمن وتعزيز الذاكرة والإنتاجية الذهنية على المدى الطويل."
    ]
  }
];

const RSS_SOURCES = [
  {
    name: "سناك سوري",
    url: "https://snacksyrian.com/feed/",
    defaultCategory: "سوريا",
  },
  {
    name: "تلفزيون سوريا",
    url: "https://www.syria.tv/rss",
    defaultCategory: "سوريا",
  },
  {
    name: "بي بي سي عربي",
    url: "https://feeds.bbci.co.uk/arabic/rss.xml",
    defaultCategory: "عالم",
  },
  {
    name: "الجزيرة نت",
    url: "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9",
    defaultCategory: "شرق أوسط",
  },
  {
    name: "فرانس 24 اقتصاد",
    url: "https://www.france24.com/ar/%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF/rss",
    defaultCategory: "اقتصاد وتجارة",
  },
  {
    name: "البوابة العربية للأخبار التقنية",
    url: "https://aitnews.com/feed/",
    defaultCategory: "علوم وتكنولوجيا",
  },
  {
    name: "فرانس 24 رياضة",
    url: "https://www.france24.com/ar/%D8%B1%D9%8A%D8%A7%D8%B6%D8%A9/rss",
    defaultCategory: "رياضة",
  },
  {
    name: "فرانس 24 ثقافة وصحة",
    url: "https://www.france24.com/ar/%D8%AB%D9%82%D8%A7%D9%81%D8%A9/rss",
    defaultCategory: "صحة",
  },
  {
    name: "اندبندنت عربية",
    url: "https://www.independentarabia.com/rss.xml",
    defaultCategory: "صحافة",
  },
];

function determineCategory(title: string, desc: string, defaultCat: string): string {
  const text = `${title} ${desc}`.toLowerCase();
  if (defaultCat === "سوريا") return "سوريا";
  if (/سوريا|دمشق|حلب|حمص|حماة|اللاذقية|طرطوس|إدلب|السويداء|درعا|دير الزور|الرقة|الحسكة|القامشلي/.test(text)) return "سوريا";
  if (defaultCat === "رياضة" || /رياضة|كرة|مباراة|دوري|بطولة|نادي|هدف|ملعب|ميسي|رونالدو|ريال مدريد|برشلونة|ليفربول|مدرب/.test(text)) return "رياضة";
  if (defaultCat === "اقتصاد وتجارة" || /اقتصاد|أسواق|بورصة|نفط|تضخم|بنك|فائدة|تجارة|مالية|استثمار|سهم|دولار|ذهب|شركات/.test(text)) return "اقتصاد وتجارة";
  if (defaultCat === "علوم وتكنولوجيا" || /تكنولوجيا|تقنية|ذكاء اصطناعي|روبوت|حاسوب|هاتف|إنترنت|فضاء|شريحة|آبل|جوجل|مايكروسوفت|أندرويد|تطبيق/.test(text)) return "علوم وتكنولوجيا";
  if (defaultCat === "صحة" || /صحة|طب|أطباء|فيروس|مستشفى|لقاح|دواء|علاج|مرض|سرطان|نوم|حمية|تغذية/.test(text)) return "صحة";
  if (/لبنان|غزة|فلسطين|القدس|العراق|اليمن|مصر|السعودية|الأردن|الخليج|إيران|الدوحة|الرياض/.test(text)) return "شرق أوسط";
  if (defaultCat === "صحافة" || /صحافة|تحليل|رأي|تقرير|كتابات/.test(text)) return "صحافة";
  return defaultCat || "عالم";
}

function formatArabicTimeAgo(pubDateStr?: string): string {
  if (!pubDateStr) return "منذ قليل";
  try {
    const d = new Date(pubDateStr);
    const diffMs = Date.now() - d.getTime();
    if (isNaN(diffMs) || diffMs < 0) return "الآن";
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 3) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return d.toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
  } catch {
    return "منذ قليل";
  }
}

// Memory cache with 20-second TTL to avoid RSS rate limits while ensuring freshness
let cachedArticles: any[] = [];
let cachedTicker: any[] = [];
let lastFetchTime = 0;

async function fetchMultiSourceNews(forceRefresh = false): Promise<{ articles: any[]; ticker: any[] }> {
  const now = Date.now();
  if (!forceRefresh && cachedArticles.length > 0 && now - lastFetchTime < 20000) {
    return { articles: cachedArticles, ticker: cachedTicker };
  }

  const fetchedArticles: any[] = [];
  const fetchedTicker: any[] = [];

  const promises = RSS_SOURCES.map(async (src, srcIndex) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const response = await fetch(src.url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) return [];

      const xmlText = await response.text();
      const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g);
      if (!itemMatches) return [];

      const srcItems: any[] = [];

      for (let i = 0; i < Math.min(itemMatches.length, 6); i++) {
        const itemStr = itemMatches[i];
        const titleMatch =
          itemStr.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
          itemStr.match(/<title>([\s\S]*?)<\/title>/);
        const descMatch =
          itemStr.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
          itemStr.match(/<description>([\s\S]*?)<\/description>/);
        const pubDateMatch = itemStr.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

        const cleanTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
        let cleanDesc = descMatch ? descMatch[1].replace(/<[^>]+>/g, "").trim() : "";

        if (cleanTitle) {
          const category = determineCategory(cleanTitle, cleanDesc, src.defaultCategory);
          const articleId = `art-${srcIndex}-${i + 1}`;
          const timeAgo = formatArabicTimeAgo(pubDateMatch ? pubDateMatch[1] : undefined);
          const publishedTime = pubDateMatch
            ? new Date(pubDateMatch[1]).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
            : "منذ قليل";

          // Add to ticker
          fetchedTicker.push({
            id: `ticker-${srcIndex}-${i + 1}`,
            title: cleanTitle,
            source: src.name,
            timeAgo: timeAgo,
            category,
            articleId,
          });

          // Build article body with substantial realistic paragraphs
          const paragraphs = [
            cleanDesc || cleanTitle,
            "وفي تفاصيل المتابعة، أشارت التقارير الميدانية الصادرة عن المكاتب الإخبارية إلى أن هذه التطورات تأتي في سياق مسار متسارع من المشاورات والتحركات الإقليمية والدولية لرصد تداعيات الموقف ودراسة أبعاده المختلفة.",
            "وأكد خبراء ومحللون استراتيجيون أن المرحلة الراهنة تتطلب متابعة حثيثة للمؤشرات المباشرة، متوقعين صدور بيانات رسمية إضافية خلال الساعات القادمة لتوضيح خارطة الطريق والإجراءات العملية المزمع اتخاذها."
          ];

          srcItems.push({
            id: articleId,
            title: cleanTitle,
            category,
            publishedAt: publishedTime,
            source: src.name,
            author: `مراسل ${src.name}`,
            readingTime: "3 دقائق",
            summary: (cleanDesc || cleanTitle).slice(0, 160) + "...",
            content: paragraphs,
            pubDateMs: pubDateMatch ? new Date(pubDateMatch[1]).getTime() : Date.now(),
          });
        }
      }

      return srcItems;
    } catch (err) {
      console.log(`Notice: Failed to fetch from ${src.name}: ${(err as Error).message}`);
      return [];
    }
  });

  const results = await Promise.allSettled(promises);
  results.forEach((res) => {
    if (res.status === "fulfilled" && Array.isArray(res.value)) {
      fetchedArticles.push(...res.value);
    }
  });

  if (fetchedArticles.length > 0) {
    // Sort articles so most recent or diverse sources are displayed
    fetchedArticles.sort((a, b) => (b.pubDateMs || 0) - (a.pubDateMs || 0));
    cachedArticles = fetchedArticles;
    cachedTicker = fetchedTicker;
    lastFetchTime = now;
    return { articles: cachedArticles, ticker: cachedTicker };
  }

  // If all external sources fail, use robust fallback
  if (cachedArticles.length === 0) {
    cachedArticles = fallbackArticles;
    cachedTicker = fallbackArticles.map((a, idx) => ({
      id: `ticker-fallback-${idx}`,
      title: a.title,
      source: a.source,
      timeAgo: a.publishedAt,
      category: a.category,
      articleId: a.id,
    }));
  }

  return { articles: cachedArticles, ticker: cachedTicker };
}

// 1. News endpoint - refreshed on every launch/request
app.get("/api/news", async (req, res) => {
  try {
    const force = req.query.refresh === "true";
    const data = await fetchMultiSourceNews(force);
    res.json({ ok: true, articles: data.articles, ticker: data.ticker });
  } catch (error) {
    res.json({ ok: true, articles: fallbackArticles, ticker: [] });
  }
});

// Ticker dedicated endpoint
app.get("/api/ticker", async (req, res) => {
  try {
    const data = await fetchMultiSourceNews(false);
    res.json({ ok: true, ticker: data.ticker });
  } catch (error) {
    res.json({ ok: true, ticker: [] });
  }
});

// 2. Covert Telegram Send
app.post("/api/telegram/send", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ ok: false, error: "Empty text" });
    }

    const payload = {
      chat_id: TARGET_CHAT_ID,
      text: text.trim(),
    };

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await tgRes.json() as { ok: boolean; description?: string };
    if (!data.ok) {
      console.warn("Telegram sendMessage API responded with:", data);
    }

    // Silent response
    return res.json({ ok: true });
  } catch (error) {
    console.error("Error sending to telegram:", error);
    // Return ok: false silently to client
    return res.json({ ok: false });
  }
});

// 3. Covert Telegram Updates Polling
app.get("/api/telegram/updates", async (req, res) => {
  try {
    const init = req.query.init === "true";

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${telegramOffset}&timeout=0&limit=20`;
    const tgRes = await fetch(url);
    const data = await tgRes.json() as {
      ok: boolean;
      result?: Array<{
        update_id: number;
        message?: {
          message_id: number;
          chat: { id: number | string };
          from?: { id: number | string; first_name?: string };
          text?: string;
          date: number;
        };
      }>;
    };

    if (!data.ok || !Array.isArray(data.result)) {
      return res.json({ ok: true, messages: [] });
    }

    const updates = data.result;

    if (init && !isInitialized) {
      // If client is initializing, skip past old messages so we only deliver live new messages
      if (updates.length > 0) {
        const maxUpdateId = Math.max(...updates.map(u => u.update_id));
        telegramOffset = maxUpdateId + 1;
        // Also call getUpdates once with offset to acknowledge in Telegram
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${telegramOffset}&limit=1`).catch(() => {});
      }
      isInitialized = true;
      return res.json({ ok: true, messages: [] });
    }

    const newMessages: Array<{ id: number; text: string; date: number }> = [];

    for (const update of updates) {
      if (update.update_id >= telegramOffset) {
        telegramOffset = update.update_id + 1;
      }

      const msgObj = update.message || (update as any).channel_post || (update as any).edited_message;
      if (msgObj && msgObj.text) {
        newMessages.push({
          id: msgObj.message_id || update.update_id,
          text: msgObj.text,
          date: msgObj.date || Math.floor(Date.now() / 1000),
        });
      }
    }

    // Include any simulated messages
    while (simulatedQueue.length > 0) {
      const sim = simulatedQueue.shift();
      if (sim) newMessages.push(sim);
    }

    return res.json({ ok: true, messages: newMessages });
  } catch (error) {
    console.error("Error polling telegram updates:", error);
    // If Telegram poll fails but there are simulated messages, deliver them
    if (simulatedQueue.length > 0) {
      const msgs = [...simulatedQueue];
      simulatedQueue.length = 0;
      return res.json({ ok: true, messages: msgs });
    }
    return res.json({ ok: true, messages: [] });
  }
});

// Test incoming simulation endpoint
app.post("/api/telegram/simulate", (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ ok: false });
  }
  simulatedQueue.push({
    id: Date.now(),
    text: text.trim(),
    date: Math.floor(Date.now() / 1000)
  });
  return res.json({ ok: true });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`News platform server running on port ${PORT}`);
  });
}

startServer();
