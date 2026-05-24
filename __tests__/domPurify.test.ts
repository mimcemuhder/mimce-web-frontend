import { describe, it, expect } from 'vitest';
import DOMPurify from 'dompurify';

describe('DOMPurify XSS Koruması', () => {
  it("Script tag'lerini temizlemeli", () => {
    const dirty = '<p>Metin</p><script>alert("xss")</script>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('<p>Metin</p>');
  });

  it("onerror event handler'larını kaldırmalı", () => {
    const dirty = '<img src="x" onerror="alert(1)">';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('onerror');
  });

  it('İzin verilen taglar geçmeli', () => {
    const dirty = '<p><strong>Kalın</strong> ve <em>italik</em></p>';
    const clean = DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['p', 'strong', 'em'],
    });
    expect(clean).toContain('<strong>Kalın</strong>');
    expect(clean).toContain('<em>italik</em>');
  });
});
