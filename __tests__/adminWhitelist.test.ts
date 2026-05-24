import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Admin Whitelist Güvenlik Kontrolü', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_ADMIN_EMAILS', '');
  });

  it('Whitelist boşsa erişim reddedilmeli', () => {
    const allowedEmails: string[] = [];

    const isAdminUser = (email: string | undefined | null): boolean => {
      if (!email) return false;
      if (allowedEmails.length === 0) return false;
      return allowedEmails.includes(email);
    };

    expect(isAdminUser('herhangi@biri.com')).toBe(false);
    expect(isAdminUser('')).toBe(false);
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser(undefined)).toBe(false);
  });

  it('Whitelist doluysa sadece listede olan e-posta kabul edilmeli', () => {
    const allowedEmails = ['admin@mimce.org', 'test@mimce.org'];

    const isAdminUser = (email: string | undefined | null): boolean => {
      if (!email) return false;
      if (allowedEmails.length === 0) return false;
      return allowedEmails.includes(email);
    };

    expect(isAdminUser('admin@mimce.org')).toBe(true);
    expect(isAdminUser('test@mimce.org')).toBe(true);
    expect(isAdminUser('hacker@evil.com')).toBe(false);
    expect(isAdminUser('admin@mimce.org.evil.com')).toBe(false);
  });

  it('E-posta büyük/küçük harf duyarlı olmalı', () => {
    const allowedEmails = ['admin@mimce.org'];

    const isAdminUser = (email: string | undefined | null): boolean => {
      if (!email) return false;
      if (allowedEmails.length === 0) return false;
      return allowedEmails.includes(email);
    };

    expect(isAdminUser('ADMIN@MIMCE.ORG')).toBe(false);
    expect(isAdminUser('Admin@Mimce.Org')).toBe(false);
    expect(isAdminUser('admin@mimce.org')).toBe(true);
  });
});
