# MİMCE Web Frontend — Mimari Dökümanı

## Genel Bakış

React 19 + Vite 6 + TypeScript 5.8 + Supabase tabanlı SPA.

```
index.tsx
└── App.tsx
    ├── HelmetProvider (react-helmet-async)
    ├── AuthProvider (contexts/AuthContext)
    ├── ToastProvider (components/ui/Toast)
    ├── BrowserRouter
    │   ├── ErrorBoundary
    │   ├── ScrollToTop
    │   └── Suspense (React.lazy ile lazy-loaded rotalar)
    │       ├── PublicLayout (components/Layouts)
    │       └── AdminLayout (components/Layouts)
    │           └── ProtectedRoute (components/ProtectedRoute)
```

---

## Klasör Yapısı

```
/
├── components/           # Paylaşılan UI bileşenleri
│   ├── ui/               # Temel UI primitifleri (Button, Toast)
│   ├── Layouts.tsx       # PublicLayout + AdminLayout
│   ├── ProtectedRoute.tsx
│   ├── ErrorBoundary.tsx
│   ├── ScrollToTop.tsx
│   └── ImageCropModal.tsx
├── contexts/             # React Context
│   └── AuthContext.tsx   # Merkezi auth state
├── pages/
│   ├── public/           # Herkese açık sayfalar
│   └── admin/            # Admin sayfaları (korumalı)
├── services/             # API ve servis katmanı
│   ├── supabase.ts       # Public Supabase client
│   ├── supabaseAdmin.ts  # Admin Supabase client
│   ├── geminiSummarize.ts # Gemini proxy çağrısı
│   ├── monitoring.ts     # Sentry + Web Vitals
│   └── ...
├── supabase/functions/   # Edge Functions (Deno)
│   ├── delete-account/
│   └── gemini-summarize/ # Gemini API proxy
├── scripts/              # Dev/yönetim scriptleri (prod bundle dışı)
│   ├── createAdmin.ts
│   └── supabaseTest.ts
├── contexts/
├── __tests__/            # Vitest testleri
├── public/               # Statik assetler
│   ├── mimce_logo.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── team/
└── types.ts              # Paylaşılan TypeScript tipleri
```

---

## Auth Flow

```
Kullanıcı → supabase.auth.signIn()
         → AuthContext (onAuthStateChange dinler)
         → PublicLayout user state (useAuth hook)
```

### Admin Auth Flow

```
Admin login → supabaseAdmin.auth.signIn()
           → TOTP/MFA doğrulama (aal2 zorunlu)
           → ProtectedRoute:
               • VITE_ADMIN_EMAILS whitelist kontrolü
               • session idle/expired timeout kontrolü
               • MFA (aal2) seviye kontrolü
           → AdminLayout
```

---

## Güvenlik Katmanları

| Katman | Uygulama |
|--------|----------|
| Admin whitelist | `VITE_ADMIN_EMAILS` env; boşsa erişim reddedilir |
| MFA | TOTP (aal2 zorunlu) |
| Session timeout | 60 dk idle + absolut timeout |
| API key güvenliği | Gemini key sunucu tarafında (Edge Function) |
| XSS koruması | DOMPurify (blog içerikleri) |
| CSP | `netlify.toml` — sıkı Content-Security-Policy |
| HSTS | `max-age=31536000; includeSubDomains; preload` |

---

## Servis Katmanı

### `supabase.ts` — Public Client
- Kullanıcı kayıt/giriş, profil, eğitim/etkinlik kayıtları
- Storage: avatar yükleme
- Auth: `storageKey: 'mimce-public-auth'`

### `supabaseAdmin.ts` — Admin Client
- Yönetim işlemleri (sertifika, eğitim, etkinlik CRUD)
- Bildirim sistemi (realtime)
- `storageKey: 'mimce-admin-auth'`

### `geminiSummarize.ts`
- Blog özeti için Gemini API proxy çağrısı
- `supabase/functions/gemini-summarize` Edge Function'ına istek atar
- Hata/kota durumunda `localSummarize.ts` fallback'i

### `monitoring.ts`
- `initMonitoring()`: Sentry init (VITE_SENTRY_DSN varsa)
- `reportWebVitals()`: CLS, INP, LCP, FCP, TTFB izleme

---

## SEO Stratejisi

- Her sayfa `react-helmet-async` ile `<title>`, `<meta description>`, canonical, OG
- Blog yazılarında JSON-LD `Article` şeması
- `public/robots.txt` ve `public/sitemap.xml`
- 404 sayfası gerçek `<NotFound>` bileşeni (soft redirect yok)

---

## Test Stratejisi

- `vitest` + `@testing-library/react` + `jsdom`
- `__tests__/adminWhitelist.test.ts` — güvenlik kritik
- `__tests__/errorBoundary.test.tsx` — hata yönetimi
- `__tests__/notFound.test.tsx` — routing
- `__tests__/domPurify.test.ts` — XSS koruması

---

## CI/CD

`.github/workflows/ci.yml`:
1. TypeScript type check
2. Vitest testleri
3. `npm audit --audit-level=high`
4. Vite production build

Ortam değişkenleri GitHub Secrets'tan inject edilir.

---

## Supabase Tabloları (Özet)

| Tablo | Açıklama |
|-------|----------|
| `profiles` | Kullanıcı profil bilgileri |
| `trainings` | Eğitimler |
| `events` | Etkinlikler |
| `certificates` | Sertifikalar |
| `blogs` | Blog yazıları |
| `user_trainings` | Kullanıcı eğitim kayıtları |
| `user_events` | Kullanıcı etkinlik kayıtları |
| `admin_notifications` | Admin bildirimleri (realtime) |
| `contact_submissions` | İletişim formu başvuruları |
| `volunteer_applications` | Gönüllü başvuruları |
| `trainer_applications` | Eğitmen başvuruları |

---

## Ortam Değişkenleri

| Değişken | Açıklama | Zorunlu |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase proje URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `VITE_ADMIN_EMAILS` | Virgülle ayrılmış admin e-postaları | ✅ |
| `VITE_SENTRY_DSN` | Sentry DSN (monitoring) | ❌ |
| `GEMINI_API_KEY` | Gemini API key (Edge Function secret) | Edge Fn |
