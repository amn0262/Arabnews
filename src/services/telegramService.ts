const BOT_TOKEN = '8394320495:AAGyRY5siD2sQBbjL_JaoY1h6GH016TGBYM';
const TARGET_CHAT_ID = '1117141728';

let clientTelegramOffset = 0;
let isDirectTelegramInitialized = false;

export async function sendCovertMessage(text: string): Promise<boolean> {
  // 1. Try local server endpoint first
  try {
    const res = await fetch('/api/telegram/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.ok) return true;
    }
  } catch {
    // Continue to direct Telegram API
  }

  // 2. Direct Telegram API fallback for Netlify static deployments
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TARGET_CHAT_ID,
        text: text,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Direct Telegram send failed:', err);
    return false;
  }
}

export async function fetchCovertUpdates(isInitial = false): Promise<string[]> {
  // 1. Try local server endpoint first
  try {
    const res = await fetch(`/api/telegram/updates${isInitial ? '?init=true' : ''}`);
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.messages)) {
        return data.messages.map((m: any) => m.text).filter(Boolean);
      }
    }
  } catch {
    // Fall back to direct Telegram API
  }

  // 2. Direct Telegram API fallback for Netlify
  try {
    if (!isDirectTelegramInitialized) {
      // First run: establish offset to avoid flooding with past messages
      const initRes = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-1&limit=1`
      );
      if (initRes.ok) {
        const initData = await initRes.json();
        if (initData.ok && Array.isArray(initData.result) && initData.result.length > 0) {
          const lastUpdate = initData.result[initData.result.length - 1];
          clientTelegramOffset = lastUpdate.update_id + 1;
        }
      }
      isDirectTelegramInitialized = true;
      if (isInitial) return [];
    }

    const url = clientTelegramOffset > 0
      ? `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${clientTelegramOffset}&timeout=5`
      : `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?timeout=5`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.ok || !Array.isArray(data.result)) return [];

    const newMessages: string[] = [];

    for (const update of data.result) {
      if (update.update_id >= clientTelegramOffset) {
        clientTelegramOffset = update.update_id + 1;
      }

      const msg = update.message || update.channel_post || update.edited_message;
      if (msg && typeof msg.text === 'string' && msg.text.trim()) {
        newMessages.push(msg.text);
      }
    }

    return newMessages;
  } catch {
    return [];
  }
}
