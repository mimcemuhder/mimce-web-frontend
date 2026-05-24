import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';

const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error('Test hatası');
  return <div>İçerik yüklendi</div>;
};

describe('ErrorBoundary', () => {
  it('Hata yoksa children render etmeli', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('İçerik yüklendi')).toBeInTheDocument();
  });

  it('Hata varsa fallback UI göstermeli', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Beklenmeyen Bir Hata/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('Özel fallback varsa onu göstermeli', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<div>Özel hata sayfası</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Özel hata sayfası')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
