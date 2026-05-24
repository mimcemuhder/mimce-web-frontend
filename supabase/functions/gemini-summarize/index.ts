import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
] as const;

function isRetryableError(status: number, detail: string): boolean {
  if (status === 404 || status === 429) return true;
  const lower = detail.toLowerCase();
  return (
    lower.includes('quota') || lower.includes('resource_exhausted') || lower.includes('not found')
  );
}

function extractSummary(data: unknown): string | null {
  const d = data as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
}

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return json({ error: 'API key yapılandırılmamış' }, 500);

  let parsed: { title?: string; body?: string };
  try {
    parsed = await req.json();
  } catch {
    return json({ error: 'Geçersiz JSON' }, 400);
  }

  const title = (parsed.title ?? '').trim();
  const content = (parsed.body ?? '').trim().slice(0, 12_000);

  if (!title && !content) return json({ error: 'Başlık veya içerik gerekli' }, 400);

  const prompt = `Aşağıdaki blog yazısını Türkçe olarak en fazla 2 kısa cümlede özetle.
Sadece özeti yaz; tırnak, başlık veya ek açıklama ekleme.

Başlık: ${title || '(başlıksız)'}

İçerik:
${content || '(içerik yok)'}`;

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 120, temperature: 0.35 },
        }),
      });
    } catch {
      continue;
    }

    if (res.ok) {
      const data = await res.json();
      const summary = extractSummary(data);
      if (summary) return json({ text: summary, source: 'gemini' }, 200);
      continue;
    }

    const detail = await res.text().catch(() => '');
    if (!isRetryableError(res.status, detail)) break;
  }

  return json({ error: 'Tüm Gemini modelleri başarısız' }, 503);
});
