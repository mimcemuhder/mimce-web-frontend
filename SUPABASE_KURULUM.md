# Supabase Kurulum Rehberi - MİMCE Projesi

## 1. Supabase Dashboard'dan Bilgileri Alın

1. https://supabase.com adresine gidin ve giriş yapın
2. Projenizi seçin (yoksa yeni proje oluşturun)
3. Sol menüden **Settings** > **API** sayfasına gidin
4. Şu bilgileri kopyalayın:
   - **Project URL**: `https://xxxxx.supabase.co` formatında
   - **anon/public key**: `sb_publishable_...` ile başlayan key

## 2. .env.local Dosyasını Oluşturun/Güncelleyin

Proje kök dizininde `.env.local` dosyası oluşturun (yoksa):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_your_key_here
```

**ÖNEMLİ:** Değerleri Supabase dashboard'unuzdan kopyalayın!

## 3. Database Tablolarını Oluşturun

Supabase dashboard'da:
1. Sol menüden **SQL Editor**'a gidin
2. Yeni bir query oluşturun
3. **ADIM 1:** Aşağıdaki SQL'i kopyalayıp çalıştırın (TABLOLAR):

```sql
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Taslak',
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trainings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  "certificateNo" TEXT UNIQUE NOT NULL,
  "recipientName" TEXT NOT NULL,
  "courseName" TEXT NOT NULL,
  "issueDate" TEXT NOT NULL,
  status TEXT DEFAULT 'Beklemede',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. **ADIM 2:** Index'leri oluşturun:

```sql
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_no ON certificates("certificateNo");
CREATE INDEX IF NOT EXISTS idx_trainings_type ON trainings(type);
```

## 4. Row Level Security (RLS) Politikaları

**ÖNEMLİ:** Güvenlik için RLS mutlaka ayarlanmalı!

**ADIM 3:** Aşağıdaki SQL'i çalıştırın (EVENTS RLS):

```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for events" ON events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert events" ON events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update events" ON events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete events" ON events FOR DELETE TO authenticated USING (true);
```

**ADIM 4:** TRAININGS RLS:

```sql
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for trainings" ON trainings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert trainings" ON trainings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update trainings" ON trainings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete trainings" ON trainings FOR DELETE TO authenticated USING (true);
```

**ADIM 5:** CERTIFICATES RLS:

```sql
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert certificates" ON certificates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update certificates" ON certificates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete certificates" ON certificates FOR DELETE TO authenticated USING (true);
```

**ADIM 6:** MEMBERS RLS:

```sql
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read members" ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert members" ON members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update members" ON members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete members" ON members FOR DELETE TO authenticated USING (true);
```

## 5. Supabase Storage Bucket Oluşturun (Görsel Yükleme İçin)

Eğitim görsellerini yüklemek için Storage bucket oluşturmanız gerekiyor:

1. Supabase Dashboard'da **Storage** menüsüne gidin
2. **Create a new bucket** butonuna tıklayın
3. Bucket adı: `images`
4. **Public bucket** seçeneğini işaretleyin (görsellerin herkese açık olması için)
5. **Create bucket** butonuna tıklayın

**RLS Politikası (Storage için):**
Storage bucket oluşturduktan sonra, aşağıdaki SQL'i çalıştırın:

```sql
-- Storage bucket için RLS politikası
CREATE POLICY "Public read access for images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'images');
```

## 6. Default Admin Kullanıcısını Oluşturun

### Yöntem 1: Supabase Dashboard'dan (Önerilen)

1. Supabase Dashboard'da **Authentication** > **Users** sayfasına gidin
2. **Add user** > **Create new user** butonuna tıklayın
3. Şu bilgileri girin:
   - **Email:** `mimce@mimce.com`
   - **Password:** `mimceadmintest123`
   - **Auto Confirm User:** ✅ (işaretli olsun)
4. **Create user** butonuna tıklayın

### Yöntem 2: Kod ile (Test için)

Tarayıcı konsolunda (geliştirme ortamında):

```javascript
// Browser console'da çalıştır
import { createDefaultAdmin } from './services/createAdmin';
createDefaultAdmin();
```

**NOT:** Supabase varsayılan olarak email doğrulama ister. Test için **Settings** > **Authentication** > **Email Auth** bölümünden "Enable email confirmations" seçeneğini kapatabilirsiniz (sadece geliştirme için).

## 7. Test Verileri Ekleme (Opsiyonel)

Test için örnek veri eklemek isterseniz:

```sql
-- Örnek Etkinlik
INSERT INTO events (id, title, date, time, location, description, status, image)
VALUES (
  '1',
  'Mühendislik Zirvesi 2024',
  '2024-11-15',
  '09:00',
  'Grand Pera Hotel, İstanbul',
  'Sektör liderlerinin buluştuğu yıllık zirve.',
  'Yayında',
  'https://picsum.photos/400/250?random=10'
);

-- Örnek Eğitim
INSERT INTO trainings (id, title, description, date, type, image)
VALUES (
  '1',
  'İleri Seviye Yapısal Analiz',
  'Deprem yönetmeliğine uygun yapısal analiz tekniklerini öğrenin.',
  '15 Ekim 2024',
  'Profesyoneller',
  'https://picsum.photos/400/250?random=1'
);

-- Örnek Sertifika
INSERT INTO certificates (id, "certificateNo", "recipientName", "courseName", "issueDate", status)
VALUES (
  '1',
  'MIMCE-2024-X9Y',
  'Ahmet Yılmaz',
  'Yapısal Analiz',
  '2024-09-15',
  'Doğrulandı'
);
```

## 8. Kontrol Listesi

Kurulumu tamamladıktan sonra kontrol edin:

- [ ] `.env.local` dosyası oluşturuldu ve doğru değerler girildi
- [ ] Tüm 4 tablo oluşturuldu (`events`, `trainings`, `certificates`, `members`)
- [ ] RLS politikaları ayarlandı
- [ ] Default admin kullanıcısı oluşturuldu (`mimce@mimce.com`)
- [ ] Proje çalıştırıldı (`npm run dev`)
- [ ] Admin login sayfası açılıyor (`#/admin/login`)
- [ ] Login başarılı oluyor
- [ ] Admin panelden veri eklenebiliyor

## 9. Sorun Giderme

### "Supabase URL veya Anon Key bulunamadı" hatası
- `.env.local` dosyasının proje kök dizininde olduğundan emin olun
- Dosya adının tam olarak `.env.local` olduğunu kontrol edin
- Değerlerin tırnak içinde olmadığından emin olun
- Sunucuyu yeniden başlatın (`npm run dev`)

### "relation does not exist" hatası
- SQL Editor'da tabloların oluşturulduğunu kontrol edin
- Tablo isimlerinin doğru olduğundan emin olun (küçük harf)

### "new row violates row-level security policy" hatası
- RLS politikalarının doğru ayarlandığından emin olun
- Kullanıcının authenticated olduğundan emin olun

### Login çalışmıyor
- Email doğrulama ayarlarını kontrol edin
- Supabase Dashboard'da kullanıcının oluşturulduğunu kontrol edin
- Browser console'da hata mesajlarını kontrol edin

## 10. Tablo Yapıları Özeti

### events
- `id` (TEXT, PRIMARY KEY)
- `title` (TEXT, NOT NULL)
- `date` (TEXT, NOT NULL)
- `time` (TEXT, NOT NULL)
- `location` (TEXT, NOT NULL)
- `description` (TEXT)
- `status` (TEXT: 'Yayında', 'Taslak', 'İptal')
- `image` (TEXT)
- `created_at` (TIMESTAMP)

### trainings
- `id` (TEXT, PRIMARY KEY)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `date` (TEXT, NOT NULL)
- `type` (TEXT: 'Öğrenciler', 'Profesyoneller', 'Atölyeler', 'Webinarlar')
- `image` (TEXT)
- `created_at` (TIMESTAMP)

### certificates
- `id` (TEXT, PRIMARY KEY)
- `certificateNo` (TEXT, UNIQUE, NOT NULL) - **NOT:** camelCase kullanılıyor
- `recipientName` (TEXT, NOT NULL)
- `courseName` (TEXT, NOT NULL)
- `issueDate` (TEXT, NOT NULL)
- `status` (TEXT: 'Doğrulandı', 'Beklemede')
- `created_at` (TIMESTAMP)

### members
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)
- `created_at` (TIMESTAMP)

## 11. Sonraki Adımlar

1. Admin panelden gerçek veriler ekleyin
2. Public sayfaların verileri gösterdiğini test edin
3. Sertifika doğrulama sayfasını test edin
4. Dashboard KPI'larının doğru çalıştığını kontrol edin
