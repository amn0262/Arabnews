export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  source: string;
  author: string;
  readingTime: string;
  summary: string;
  content: string[];
}

export interface TickerItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  category?: string;
  articleId?: string;
}

export interface TelegramMessagePayload {
  text: string;
}

export interface TelegramUpdateResponse {
  ok: boolean;
  messages: Array<{
    id: number;
    text: string;
    date: number;
    from?: string;
  }>;
}
