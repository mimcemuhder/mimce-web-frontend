/** API kotası yokken: metinden 1–2 cümlelik özet (ücretsiz, yerel). */
export function summarizeLocally(title: string, body: string): string {
  const combined = [title.trim(), body.trim()].filter(Boolean).join('. ');
  const normalized = combined.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  const sentences =
    normalized
      .match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g)
      ?.map(s => s.trim())
      .filter(s => s.length > 15) ?? [];

  if (sentences.length === 0) {
    return normalized.length > 220 ? `${normalized.slice(0, 217)}...` : normalized;
  }

  let summary = sentences.slice(0, 2).join(' ');
  if (summary.length > 280) {
    summary = `${summary.slice(0, 277).trim()}...`;
  }
  return summary;
}
