import { summarizeLocally } from './localSummarize';

export type SummarizeResult = {
  text: string;
  source: 'gemini' | 'local';
  notice?: string;
};

export async function summarizeBlogExcerpt(params: {
  title: string;
  body: string;
}): Promise<SummarizeResult> {
  const body = params.body.trim().slice(0, 12_000);
  const title = params.title.trim();

  if (!body && !title) {
    throw new Error('Özet için başlık veya içerik gerekli.');
  }

  const local = (notice?: string): SummarizeResult => ({
    text: summarizeLocally(title, body),
    source: 'local',
    notice: notice ?? 'Gemini kullanılamıyor; metinden otomatik özet oluşturuldu.',
  });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return local('Supabase yapılandırması eksik; yerel özet kullanıldı.');
  }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/gemini-summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ title, body }),
    });

    if (res.ok) {
      const data = await res.json() as { text?: string };
      if (data.text) return { text: data.text, source: 'gemini' };
    }
  } catch {
    // Edge function ulaşılamıyor
  }

  return local();
}
