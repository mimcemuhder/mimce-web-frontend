<div align="center">
  <img src="public/mimce_admin_logo.svg" alt="MİMCE Logo" width="200" />
  
  # MİMCE Web Frontend
  
  **MİMCE Mühendisler Derneği Web Sitesi - React & TypeScript ile Geliştirilmiş**
  
  [![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-2.91.1-3ECF8E?logo=supabase)](https://supabase.com/)
</div>

---

## 📖 Hakkında

MİMCE Mühendisler Derneği için geliştirilmiş modern, responsive ve kullanıcı dostu web sitesi. Derneğin mühendislik öğrencileri ve profesyonelleri için eğitim, etkinlik ve sertifika yönetim sistemi sunar.

### ✨ Temel Özellikler

- 🎨 **Modern UI/UX**: Tailwind CSS ile tasarlanmış responsive arayüz
- 🔐 **Güvenli Authentication**: Supabase Auth ile admin paneli koruması
- 📊 **Gerçek Zamanlı Veri**: Supabase ile canlı veri yönetimi
- 🚀 **Hızlı Performans**: Vite ile optimize edilmiş build süreci
- 📱 **Mobile First**: Tüm cihazlarda mükemmel deneyim
- 🎯 **Type Safety**: TypeScript ile tip güvenliği

---

## 🚀 Teknoloji Stack

### Frontend Framework
- **React 19.2.3** - Modern UI framework
- **TypeScript 5.8.2** - Type-safe development
- **Vite 6.2.0** - Next-generation build tool

### Routing & State
- **React Router DOM 7.13.0** - Client-side routing
- **BrowserRouter** (`App.tsx`) — statik hostta (ör. GitHub Pages) SPA için sunucuda tüm yolların `index.html`’e düşmesi veya hash routing gerekir

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library

### Backend & Database
- **Supabase 2.91.1** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Storage (görsel yükleme)
  - Row Level Security (RLS)

---

## 📁 Proje Yapısı

```
mimce-web-frontend/
├── components/
│   ├── Layouts.tsx              # PublicLayout ve AdminLayout
│   └── ProtectedRoute.tsx        # Authentication guard
├── pages/
│   ├── public/
│   │   ├── Home.tsx              # Ana sayfa (hero, stats, events)
│   │   ├── Trainings.tsx         # Eğitimler listesi ve filtreleme
│   │   └── CertificateVerify.tsx # Sertifika doğrulama sistemi
│   └── admin/
│       ├── Login.tsx             # Admin giriş sayfası
│       ├── Dashboard.tsx         # KPI dashboard ve aktiviteler
│       ├── Certificates.tsx      # Sertifika yönetimi
│       ├── Events.tsx            # Etkinlik yönetimi (CRUD)
│       └── Trainings.tsx         # Eğitim yönetimi (CRUD + görsel yükleme)
├── services/
│   ├── supabase.ts              # Supabase client konfigürasyonu
│   ├── supabaseTest.ts          # Bağlantı testi utilities
│   └── createAdmin.ts           # Default admin oluşturma
├── public/
│   ├── mimce_logo.svg           # Public sayfalar için logo
│   └── mimce_admin_logo.svg     # Admin paneli için logo
├── types.ts                      # TypeScript type tanımları
├── App.tsx                       # Ana routing yapısı
├── index.tsx                     # React entry point
└── index.html                    # HTML template
```

---

## 🎯 Özellikler

### 🌐 Public Sayfalar

#### Ana Sayfa (`/`)
- **Hero Section**: Etkileyici başlık ve CTA butonları
- **İstatistikler**: Eğitilen mühendis, etkinlik ve iş ortağı sayıları
- **Biz Kimiz**: Dernek tanıtımı
- **Hedef Kitle Kartları**: Öğrenciler ve Profesyoneller için özel bölümler
- **Yaklaşan Etkinlikler**: Son 3 yayında etkinlik (Supabase'den)

#### Eğitimler (`/egitimler`)
- **Filtreleme**: Tümü, Öğrenciler, Profesyoneller, Atölyeler, Webinarlar
- **Arama**: Eğitim başlığına göre arama
- **Grid Layout**: Responsive kart görünümü
- **Gerçek Zamanlı Veri**: Supabase'den canlı eğitim listesi

#### Sertifika Doğrulama (`/sertifika-dogrulama`)
- **İki Kolonlu Tasarım**: Sol tarafta bilgi, sağda form
- **Sertifika Sorgulama**: Sertifika numarası ile doğrulama
- **Sonuç Gösterimi**: Başarılı/Başarısız durum mesajları
- **Detay Bilgileri**: Alıcı, eğitim ve tarih bilgileri

### 🔐 Admin Paneli

#### Dashboard (`/admin`)
- **KPI Kartları**: 
  - Toplam Üye sayısı
  - Aktif Eğitim sayısı
  - Yaklaşan Etkinlik sayısı
  - Verilen Sertifika sayısı
- **Son Aktiviteler**: Gerçek zamanlı aktivite akışı
- **Hızlı İşlemler**: 
  - Yeni Eğitim Ekle
  - Sertifika Oluştur
  - Gönüllülere E-posta
- **Sistem Durumu**: Servis durumu göstergesi

#### Sertifikalar Yönetimi (`/admin/sertifikalar`)
- **Tablo Görünümü**: Tüm sertifikaların listesi
- **Arama**: Sertifika no ve alıcı adına göre
- **Filtreleme**: Kategori bazlı filtreler
- **Pagination**: Sayfalama desteği

#### Etkinlikler Yönetimi (`/admin/etkinlikler`)
- **Grid Görünümü**: Etkinlik kartları
- **CRUD İşlemleri**: 
  - Yeni etkinlik oluşturma
  - Etkinlik düzenleme
  - Etkinlik silme
- **Side Sheet Form**: Modern form deneyimi
- **Durum Yönetimi**: Yayında, Taslak, İptal

#### Eğitimler Yönetimi (`/admin/egitimler`)
- **Görsel Yükleme**: Supabase Storage entegrasyonu
- **Dosya veya URL**: İki yöntemle görsel ekleme
- **CRUD İşlemleri**: Tam yönetim desteği
- **Önizleme**: Görsel önizleme özelliği

---

## 🛠️ Kurulum

### Gereksinimler

- **Node.js** 18.0.0 veya üzeri
- **npm** 9.0.0 veya üzeri (veya yarn/pnpm)
- **Supabase Hesabı** (ücretsiz tier yeterli)

### Adımlar

#### 1. Repository'yi Klonlayın

```bash
git clone git@github.com:mimcemuhder/mimce-web-frontend.git
cd mimce-web-frontend
```

#### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

#### 3. Environment Variables

Proje kök dizininde `.env.local` dosyası oluşturun:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Not:** Supabase dashboard'dan bu değerleri alabilirsiniz (Settings > API).

#### 4. Supabase Kurulumu

Detaylı kurulum için [`SUPABASE_KURULUM.md`](SUPABASE_KURULUM.md) ve tamamlayıcı kontrol listesi için [`SUPABASE_YAPILACAKLAR.md`](SUPABASE_YAPILACAKLAR.md) dosyalarına bakın. Özet:

1. Supabase'de tabloları oluşturun (`events`, `trainings`, `certificates`, `members`; ayrıca profil sekmeleri için `user_trainings`, `user_events`)
2. Row Level Security (RLS) politikalarını ayarlayın
3. Storage bucket: `images` (eğitim görselleri), `avatars` (profil fotoğrafı)
4. **Authentication → URL Configuration:** Site URL ve Redirect URL listesi, dağıtım adresiniz ve yerel geliştirme (`http://localhost:3000` vb.) ile aynı olmalı (Google/GitHub/LinkedIn OAuth için şart)
5. İsteğe bağlı: OAuth provider’ları **Sign In / Providers** altından açın (Dashboard’daki **OAuth Apps** listesi sosyal girişle aynı değildir)
6. Default admin kullanıcısı oluşturun

Yerel doğrulama (`.env.local` dolu iken):

```bash
npm run verify:supabase
```

#### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

---

## 📦 Build & Deploy

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Build çıktısı `dist/` klasöründe oluşturulur.

### Sürekli entegrasyon

GitHub’a push veya PR açıldığında `typecheck` + `build` çalıştırmak için [.github/workflows/ci.yml](.github/workflows/ci.yml) tanımlıdır.

### Build Önizleme

```bash
npm run preview
```

Production build'i local'de test eder.

### Deployment

Proje statik dosyalar ürettiği için herhangi bir static hosting servisine deploy edilebilir:

- **Vercel**: Otomatik CI/CD
- **Netlify**: Drag & drop veya Git entegrasyonu
- **GitHub Pages**: `dist/` klasörünü deploy edin
- **Supabase Hosting**: Supabase'in kendi hosting servisi

---

## 🎨 Stil ve Tema

### Renk Paleti

Proje özel bir renk paleti kullanır (Tailwind config'de tanımlı):

```javascript
colors: {
  primary: '#13ecc8',        // Bright Teal
  'primary-dark': '#0fbda0', // Darker Teal
  navy: '#0f172a',           // Slate 900
  'navy-light': '#1e293b',   // Slate 800
}
```

### Typography

- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700

### Responsive Breakpoints

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

---

## 🔧 Konfigürasyon

### Vite Config

```typescript
{
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  }
}
```

### TypeScript Config

- **Target**: ES2022
- **Module**: ESNext
- **JSX**: react-jsx
- **Path Alias**: `@/*` -> `./*`

---

## 🗺️ Routing

### Public Routes

| Route | Açıklama |
|-------|----------|
| `/` | Ana sayfa |
| `/egitimler` | Eğitimler listesi |
| `/sertifika-dogrulama` | Sertifika doğrulama |
| `/hakkimizda` | Hakkımızda (placeholder) |
| `/etkinlikler` | Etkinlikler (placeholder) |
| `/blog` | Blog (placeholder) |
| `/iletisim` | İletişim (placeholder) |

### Admin Routes (Protected)

| Route | Açıklama | Auth Required |
|-------|----------|---------------|
| `/admin/login` | Admin giriş | ❌ |
| `/admin` | Dashboard | ✅ |
| `/admin/sertifikalar` | Sertifika yönetimi | ✅ |
| `/admin/etkinlikler` | Etkinlik yönetimi | ✅ |
| `/admin/egitimler` | Eğitim yönetimi | ✅ |
| `/admin/uyeler` | Üye yönetimi (placeholder) | ✅ |
| `/admin/ayarlar` | Sistem ayarları (placeholder) | ✅ |

**Not:** Tüm admin route'ları `ProtectedRoute` component'i ile korunur.

---

## 🔐 Authentication

### Admin Login

- **Email/Password**: Supabase Auth ile giriş
- **Session Management**: Otomatik session yönetimi
- **Protected Routes**: Authentication kontrolü
- **Logout**: Güvenli çıkış işlemi

### Default Admin

Kurulum sonrası default admin kullanıcısı:

- **Email**: `mimce@mimce.com`
- **Password**: `mimceadmintest123`

**⚠️ Güvenlik:** Production'da mutlaka şifreyi değiştirin!

---

## 📊 Database Schema

### Tablolar

#### `events`
- `id` (TEXT, PRIMARY KEY)
- `title` (TEXT, NOT NULL)
- `date` (TEXT, NOT NULL)
- `time` (TEXT, NOT NULL)
- `location` (TEXT, NOT NULL)
- `description` (TEXT)
- `status` (TEXT: 'Yayında', 'Taslak', 'İptal')
- `image` (TEXT)
- `created_at` (TIMESTAMP)

#### `trainings`
- `id` (TEXT, PRIMARY KEY)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `date` (TEXT, NOT NULL)
- `type` (TEXT: 'Öğrenciler', 'Profesyoneller', 'Atölyeler', 'Webinarlar')
- `image` (TEXT)
- `created_at` (TIMESTAMP)

#### `certificates`
- `id` (TEXT, PRIMARY KEY)
- `certificateNo` (TEXT, UNIQUE, NOT NULL)
- `recipientName` (TEXT, NOT NULL)
- `courseName` (TEXT, NOT NULL)
- `issueDate` (TEXT, NOT NULL)
- `status` (TEXT: 'Doğrulandı', 'Beklemede')
- `created_at` (TIMESTAMP)

#### `members`
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)
- `created_at` (TIMESTAMP)

### Storage

- **Bucket**: `images`
- **Kullanım**: Eğitim görselleri yükleme
- **Public Access**: Evet (görseller herkese açık)

---

## 🧪 Development

### Code Structure

- **Components**: Reusable UI components
- **Pages**: Route-specific page components
- **Services**: API calls and business logic
- **Types**: TypeScript type definitions

### Best Practices

- ✅ TypeScript strict mode aktif (`strict: true`, `strictNullChecks: true`, `noImplicitAny: true`)
- ✅ Functional components kullanımı
- ✅ Hooks (useState, useEffect, custom hooks) ile state management
- ✅ AuthContext ile merkezi auth state yönetimi
- ✅ Responsive design (mobile-first)
- ✅ Error handling: ErrorBoundary + form validation (react-hook-form + zod)
- ✅ Code splitting ve lazy loading (`React.lazy` + `Suspense`) — tüm rotalar
- ✅ XSS koruması: DOMPurify (blog içerikleri)
- ✅ SEO: react-helmet-async, robots.txt, sitemap.xml, JSON-LD
- ✅ Monitoring: Sentry + Web Vitals (CLS, INP, LCP, FCP, TTFB)
- ✅ Test altyapısı: vitest + @testing-library/react

---

## 📝 Scripts

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Development server başlatır (port 3000) |
| `npm run build` | Production build oluşturur |
| `npm run preview` | Build önizlemesi yapar |
| `npm run typecheck` | TypeScript strict mod kontrolü |
| `npm test` | Tüm testleri çalıştırır (vitest) |
| `npm run test:watch` | Test izleme modu |
| `npm run lint` | ESLint + jsx-a11y kontrolü |
| `npm run format` | Prettier ile kod formatı |

---

## 🐛 Sorun Giderme

### "Supabase URL veya Anon Key bulunamadı"

- `.env.local` dosyasının proje kök dizininde olduğundan emin olun
- Dosya adının tam olarak `.env.local` olduğunu kontrol edin
- Değerlerin tırnak içinde olmadığından emin olun
- Sunucuyu yeniden başlatın (`npm run dev`)

### "relation does not exist" hatası

- SQL Editor'da tabloların oluşturulduğunu kontrol edin
- Tablo isimlerinin doğru olduğundan emin olun (küçük harf)

### "new row violates row-level security policy"

- RLS politikalarının doğru ayarlandığından emin olun
- Kullanıcının authenticated olduğundan emin olun

### Login çalışmıyor

- Email doğrulama ayarlarını kontrol edin
- Supabase Dashboard'da kullanıcının oluşturulduğunu kontrol edin
- Browser console'da hata mesajlarını kontrol edin

---

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

---

## 📄 Lisans

Bu proje MİMCE için özel olarak geliştirilmiştir. Tüm hakları saklıdır.

---

## 📞 İletişim

**MİMCE Mühendisler Derneği**

- Website: [mimce.org](https://mimce.org)
- Email: info@mimce.org

---

<div align="center">
  <p>Made with ❤️ by MİMCE Team</p>
  <p>© 2026 MİMCE. All rights reserved.</p>
</div>
