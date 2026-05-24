import { summarizeLocally } from './localSummarize';

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
] as const;

export type SummarizeResult = {
  text: string;
  source: 'gemini' | 'local';
  notice?: string;
};

function getApiKey(): string | undefined {
  return import.meta.env.VITE_GEMINI_API_KEY;
}

async function callGemini(model: string, apiKey: string, prompt: string): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  return fetch(`${url}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 120,
        temperature: 0.35,
      },
    }),
  });
}

function isRetryableError(status: number, detail: string): boolean {
  if (status === 404 || status === 429) return true;
  const lower = detail.toLowerCase();
  return (
    lower.includes('quota') ||
    lower.includes('resource_exhausted') ||
    lower.includes('not found')
  );
}

function extractSummary(data: unknown): string | null {
  const d = data as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
}

export async function summarizeBlogExcerpt(params: {
  title: string;
  body: string;
}): Promise<SummarizeResult> {
  const body = params.body.trim().slice(0, 12_000);
  const title = params.title.trim();

  if (!body && !title) {
    throw new Error('Özet için başlık veya içerik gerekli.');
  }

  const local = (): SummarizeResult => ({
    text: summarizeLocally(title, body),
    source: 'local',
    notice: 'Gemini kotası dolu veya kullanılamıyor; metinden otomatik özet oluşturuldu.',
  });

  const apiKey = getApiKey();
  if (!apiKey) {
    return { ...local(), notice: 'API anahtarı yok; metinden otomatik özet oluşturuldu.' };
  }

  const prompt = `Aşağıdaki blog yazısını Türkçe olarak en fazla 2 kısa cümlede özetle.
Sadece özeti yaz; tırnak, başlık veya ek açıklama ekleme.

Başlık: ${title || '(başlıksız)'}

İçerik:
${body || '(içerik yok)'}`;

  for (const model of MODELS) {
    const res = await callGemini(model, apiKey, prompt);
    if (res.ok) {
      const data = await res.json();
      const summary = extractSummary(data);
      if (summary) return { text: summary, source: 'gemini' };
      continue;
    }

    const detail = await res.text().catch(() => '');
    if (!isRetryableError(res.status, detail)) break;
  }

  return local();
}
