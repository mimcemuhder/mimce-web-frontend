# MIMCE Web Frontend

MIMCE (Mühendislik Platformu) için modern ve responsive web uygulaması. React, TypeScript ve Vite ile geliştirilmiştir.

## 🚀 Teknolojiler

- **React 19.2.3** - UI framework
- **TypeScript 5.8.2** - Type safety
- **Vite 6.2.0** - Build tool ve dev server
- **React Router DOM 7.13.0** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## 📁 Proje Yapısı

```
mimce-web-frontend/
├── components/
│   └── Layouts.tsx          # PublicLayout ve AdminLayout bileşenleri
├── pages/
│   ├── public/
│   │   ├── Home.tsx          # Ana sayfa
│   │   ├── Trainings.tsx     # Eğitimler listesi
│   │   └── CertificateVerify.tsx  # Sertifika doğrulama
│   └── admin/
│       ├── Dashboard.tsx     # Admin dashboard
│       ├── Certificates.tsx  # Sertifika yönetimi
│       └── Events.tsx         # Etkinlik yönetimi
├── services/
│   └── mockData.ts           # Mock data ve CRUD fonksiyonları
├── types.ts                  # TypeScript type tanımları
├── App.tsx                   # Ana routing yapısı
├── index.tsx                 # React entry point
└── index.html                # HTML template

```

## 🎯 Özellikler

### Public Sayfalar
- **Ana Sayfa**: Hero section, istatistikler, hedef kitle kartları, yaklaşan etkinlikler
- **Eğitimler**: Filtrelenebilir eğitim listesi (Öğrenciler, Profesyoneller, Atölyeler, Webinarlar)
- **Sertifika Doğrulama**: Sertifika numarası ile doğrulama sistemi

### Admin Paneli
- **Dashboard**: KPI kartları, son aktiviteler, hızlı işlemler
- **Sertifikalar Yönetimi**: Sertifika listesi, arama, filtreleme
- **Etkinlikler Yönetimi**: Etkinlik oluşturma, düzenleme, silme

## 🛠️ Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn

### Adımlar

1. **Bağımlılıkları yükle:**
```bash
npm install
```

2. **Geliştirme sunucusunu başlat:**
```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

3. **Production build:**
```bash
npm run build
```

4. **Build önizleme:**
```bash
npm run preview
```

## 🎨 Stil ve Tema

Proje Tailwind CSS kullanır. Özel renk paleti:

- **Primary**: `#13ecc8` (Bright Teal)
- **Primary Dark**: `#0fbda0`
- **Navy**: `#0f172a` (Slate 900)
- **Navy Light**: `#1e293b` (Slate 800)

Font: Inter (Google Fonts)

## 📦 Scripts

- `npm run dev` - Development server başlatır
- `npm run build` - Production build oluşturur
- `npm run preview` - Build önizlemesi yapar

## 🔧 Konfigürasyon

### Vite Config
- Port: 3000
- Host: 0.0.0.0
- Path alias: `@/*` -> `./*`

### TypeScript
- Target: ES2022
- Module: ESNext
- JSX: react-jsx

## 🗺️ Routing

### Public Routes
- `/` - Ana sayfa
- `/egitimler` - Eğitimler listesi
- `/sertifika-dogrulama` - Sertifika doğrulama

### Admin Routes
- `/admin` - Dashboard
- `/admin/sertifikalar` - Sertifika yönetimi
- `/admin/etkinlikler` - Etkinlik yönetimi

## 📝 Notlar

- Proje şu anda mock data kullanmaktadır (`services/mockData.ts`)
- Backend entegrasyonu için API servisleri eklenecektir
- Authentication/Authorization henüz implement edilmemiştir

## 📄 Lisans

Bu proje MIMCE için özel olarak geliştirilmiştir.
