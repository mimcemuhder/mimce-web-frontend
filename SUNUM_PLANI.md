# MİMCE Web Frontend Projesi - Sunum Planı

## 1. Giriş ve Proje Tanıtımı

- MİMCE Mühendisler Derneği web sitesi projesi
- Projenin amacı ve hedef kitle
- Proje kapsamı ve zaman çizelgesi

## 2. Proje Amacı ve İhtiyaç Analizi

- Derneğin dijital varlık ihtiyacı
- Eğitim, etkinlik ve sertifika yönetim sistemi gereksinimleri
- Kullanıcı deneyimi hedefleri

## 3. Teknoloji Stack ve Seçim Gerekçeleri

- Frontend: React 19.2.3 + TypeScript 5.8.2
- Build Tool: Vite 6.2.0
- Routing: React Router DOM 7.13.0 (HashRouter)
- Styling: Tailwind CSS + Lucide React icons
- Backend: Supabase (PostgreSQL, Auth, Storage, RLS)
- Neden bu teknolojiler seçildi?

## 4. Mimari Yapı ve Proje Organizasyonu

- Component-based architecture
- Folder structure (components, pages, services)
- Public ve Admin ayrımı
- Routing yapısı
- State management yaklaşımı

## 5. Endpoint'ler ve Route Yapısı

### Public Endpoint'ler (Herkes Erişebilir)

- `#/` - Ana sayfa (Hero, istatistikler, yaklaşan etkinlikler)
- `#/egitimler` - Eğitimler listesi (filtreleme, arama)
- `#/sertifika-dogrulama` - Sertifika doğrulama sistemi
- `#/hakkimizda` - Hakkımızda (placeholder)
- `#/etkinlikler` - Etkinlikler listesi (placeholder)
- `#/blog` - Blog sayfası (placeholder)
- `#/iletisim` - İletişim formu (placeholder)
- `#/gonullu-ol` - Gönüllü ol formu (placeholder)
- `#/egitmen-ol` - Eğitmen ol formu (placeholder)

### Admin Endpoint'ler

#### Authentication

- `#/admin/login` - Admin giriş sayfası (Korumasız)
  - Email/Password ile giriş
  - Default admin: `mimce@mimce.com` / `mimceadmintest123`

#### Protected Admin Routes (Giriş Gerekli)

- `#/admin` - Dashboard (KPI kartları, aktiviteler)
- `#/admin/sertifikalar` - Sertifika yönetimi (CRUD, arama, filtreleme)
- `#/admin/etkinlikler` - Etkinlik yönetimi (CRUD, durum yönetimi)
- `#/admin/egitimler` - Eğitim yönetimi (CRUD, görsel yükleme)
- `#/admin/uyeler` - Üye yönetimi (placeholder)
- `#/admin/ayarlar` - Sistem ayarları (placeholder)

**Not:** HashRouter kullanıldığı için tüm URL'ler `#` ile başlar. Örnek: `http://localhost:3000/#/admin/login`

## 6. Public Sayfalar ve Özellikler

- Ana Sayfa: Hero section, istatistikler, yaklaşan etkinlikler
- Eğitimler Sayfası: Filtreleme, arama, grid layout
- Sertifika Doğrulama: Sertifika sorgulama sistemi
- Responsive tasarım ve mobile-first yaklaşım

## 7. Admin Paneli ve Yönetim Özellikleri

- Dashboard: KPI kartları, aktivite akışı, hızlı işlemler
- Sertifika Yönetimi: CRUD, arama, filtreleme, pagination
- Etkinlik Yönetimi: CRUD işlemleri, durum yönetimi
- Eğitim Yönetimi: Görsel yükleme (Supabase Storage), CRUD

## 8. Veritabanı Yapısı ve Şema

- Tablolar: events, trainings, certificates, members
- İlişkiler ve veri yapısı
- Storage bucket yapılandırması
- Index'ler ve performans optimizasyonları

## 9. Güvenlik ve Authentication

- Supabase Auth entegrasyonu
- Row Level Security (RLS) politikaları
- Protected routes yapısı (`ProtectedRoute` component)
- Admin yetkilendirme sistemi
- Session yönetimi

## 10. Deployment ve Hosting

- Static site deployment seçenekleri
- GitHub Pages uyumluluğu (HashRouter sayesinde)
- Environment variables yönetimi
- Build ve production süreci

## 11. Geliştirme Süreci ve Best Practices

- TypeScript strict mode
- Code organization
- Error handling
- Loading states
- Responsive design principles

## 12. Kurulum ve Dokümantasyon

- SUPABASE_KURULUM.md rehberi
- README.md dokümantasyonu
- Adım adım kurulum süreci
- Test verileri ve demo

## 13. Gelecek Planları ve Geliştirmeler

- Placeholder sayfalar (Hakkımızda, Blog, İletişim)
- Üye yönetimi modülü
- Sistem ayarları paneli
- Özellik genişletmeleri

## 14. Demo ve Canlı Örnekler

- Public sayfaların gösterimi
- Admin paneli işlevleri (Login → Dashboard → Yönetim sayfaları)
- Sertifika doğrulama akışı
- Responsive tasarım örnekleri

## 15. Soru-Cevap ve Topluluk Katkısı

- Açık kaynak yaklaşımı
- Katkıda bulunma rehberi
- Topluluk geri bildirimi
