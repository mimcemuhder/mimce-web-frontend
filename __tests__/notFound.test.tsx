import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../pages/public/NotFound';

vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('NotFound Sayfası', () => {
  it('404 başlığı göstermeli', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Sayfa Bulunamadı')).toBeInTheDocument();
  });

  it('Ana Sayfa linki içermeli', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /Ana Sayfa/i })).toBeInTheDocument();
  });
});
