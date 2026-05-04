# Supabase Tarafında Yapılacaklar – MİMCE

Bu belge, frontend ile uyumlu çalışması için Supabase projesinde yapmanız gereken tüm işlemleri listeler.

---

## 1. Storage: Profil Fotoğrafları (avatars)

### 1.1 Bucket oluşturma

1. Supabase Dashboard → **Storage**
2. **Create a new bucket**
3. **Name:** `avatars`
4. **Public bucket:** işaretli (profil fotoğrafları herkese açık görünsün)
5. **Create bucket**

### 1.2 Storage RLS politikaları

**Storage** → `avatars` bucket → **Policies** veya **SQL Editor** ile:

```sql
-- Kullanıcı sadece kendi klasörüne (user_id) yükleyebilir
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Kullanıcı sadece kendi dosyalarını güncelleyebilir/silebilir
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Herkes (anon dahil) avatarları okuyabilir (public bucket)
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

**Not:** Bucket oluşturulduğunda Storage için RLS varsayılan olarak açıktır. Yukarıdaki politikalar yoksa ekleyin.

---

## 2. Tablolar: Kullanıcı eğitim ve etkinlik kayıtları

### 2.1 user_trainings

Kullanıcının kayıt olduğu eğitimler.

**SQL Editor**’da çalıştırın:

```sql
CREATE TABLE IF NOT EXISTS user_trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  training_id TEXT NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, training_id)
);

CREATE INDEX IF NOT EXISTS idx_user_trainings_user_id ON user_trainings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trainings_training_id ON user_trainings(training_id);
```

### 2.2 user_events

Kullanıcının kayıt olduğu etkinlikler.

```sql
CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attended BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_id ON user_events(event_id);
```

**Ön koşul:** `trainings` ve `events` tabloları zaten mevcut olmalı (SUPABASE_KURULUM.md’de tanımlı).

---

## 3. RLS: user_trainings ve user_events

### 3.1 user_trainings RLS

```sql
ALTER TABLE user_trainings ENABLE ROW LEVEL SECURITY;

-- Kullanıcı sadece kendi kayıtlarını görebilir
CREATE POLICY "Users can read own enrollments"
  ON user_trainings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Kullanıcı kendisi adına kayıt ekleyebilir
CREATE POLICY "Users can enroll in trainings"
  ON user_trainings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcı kendi kaydını güncelleyebilir (örn. completed)
CREATE POLICY "Users can update own enrollment"
  ON user_trainings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcı kendi kaydını silebilir (kayıttan çıkma)
CREATE POLICY "Users can delete own enrollment"
  ON user_trainings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### 3.2 user_events RLS

```sql
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own event enrollments"
  ON user_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in events"
  ON user_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own event enrollment"
  ON user_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own event enrollment"
  ON user_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

---

## 4. Authentication: OAuth (Google, GitHub, LinkedIn)

### 4.1 Site URL ve Redirect URL’ler

1. **Authentication** → **URL Configuration**
2. **Site URL:** Canlı site adresiniz (örn. `https://mimce.netlify.app`) veya local için `http://localhost:5173`
3. **Redirect URLs** listesine ekleyin:
   - `http://localhost:5173`
   - `http://localhost:5173/`
   - Production URL’iniz (örn. `https://mimce.netlify.app`)
   - Hash router kullanıyorsanız: `http://localhost:5173/#/` vb. gerekebilir

### 4.2 Google ile giriş

1. **Authentication** → **Providers** → **Google**
2. **Enable Sign in with Google** açın
3. Google Cloud Console’da:
   - [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
   - **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins: `https://your-project.supabase.co`, `http://localhost:5173`, production URL
   - Authorized redirect URIs: Supabase’in verdiği callback URL (Authentication → Providers → Google’da yazar), örn. `https://xxxxx.supabase.co/auth/v1/callback`
4. Client ID ve Client Secret’ı kopyalayıp Supabase’te **Google** provider alanlarına yapıştırın
5. **Save**

### 4.3 GitHub ile giriş

1. **Authentication** → **Providers** → **GitHub**
2. **Enable Sign in with GitHub** açın
3. GitHub’da:
   - GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**
   - Homepage URL: site URL’iniz
   - Authorization callback URL: `https://xxxxx.supabase.co/auth/v1/callback` (Supabase’teki callback URL’i kopyalayın)
4. Client ID ve Client Secret’ı Supabase’te **GitHub** alanlarına girin
5. **Save**

### 4.4 LinkedIn ile giriş (OpenID Connect)

1. **Authentication** → **Providers** → **LinkedIn (OIDC)** (veya benzeri isim)
2. **Enable** açın
3. [LinkedIn Developers](https://www.linkedin.com/developers/apps) → uygulama oluşturun → **Auth** sekmesinde OAuth 2.0 ayarları
4. **Authorized redirect URLs** için Supabase’in gösterdiği callback adresini ekleyin (örn. `https://xxxxx.supabase.co/auth/v1/callback`)
5. **Client ID** ve **Client Secret** değerlerini Supabase provider alanlarına yapıştırın
6. **Save**

Frontend `signInWithOAuth` provider değeri: **`linkedin_oidc`** (kayıt/giriş sayfalarında buton mevcut).

---

## 5. Mevcut Storage bucket (images)

Eğitim görselleri için `images` bucket’ı SUPABASE_KURULUM.md’de anlatılmıştı. Yoksa:

1. **Storage** → **Create bucket** → Name: `images`, Public: evet
2. Aynı dosyadaki “RLS Politikası (Storage için)” SQL’ini çalıştırın

---

## 6. Kontrol listesi

### 6.0 Yerel doğrulama (isteğe bağlı)

Proje kökünde `.env.local` dolu iken:

```bash
npm run verify:supabase
```

Bu komut anon anahtar ile temel tabloların ve `avatars` / `images` bucket’larının varlığını kontrol eder; eksikse çıkış kodu `1` döner.

Supabase tarafında tamamlamanız gerekenler:

- [ ] **Storage**
  - [ ] `avatars` bucket oluşturuldu (public)
  - [ ] `avatars` için RLS politikaları eklendi (upload/update/delete kendi user_id, read herkese)
- [ ] **Tablolar**
  - [ ] `user_trainings` tablosu oluşturuldu
  - [ ] `user_events` tablosu oluşturuldu
  - [ ] İndeksler eklendi
- [ ] **RLS**
  - [ ] `user_trainings` RLS açık ve politikalar tanımlı
  - [ ] `user_events` RLS açık ve politikalar tanımlı
- [ ] **Auth**
  - [ ] Site URL ve Redirect URLs ayarlandı
  - [ ] İsteniyorsa Google provider açıldı ve credential’lar girildi
  - [ ] İsteniyorsa GitHub provider açıldı ve credential’lar girildi
  - [ ] İsteniyorsa LinkedIn (OIDC) provider açıldı ve credential’lar girildi
- [ ] **Mevcut**
  - [ ] `trainings` ve `events` tabloları mevcut (SUPABASE_KURULUM.md)
  - [ ] `images` bucket’ı eğitim görselleri için mevcut

---

## 7. Tablo özeti (referans)

| Tablo           | Amaç                          |
|-----------------|-------------------------------|
| `user_trainings`| Kullanıcı–eğitim kayıtları    |
| `user_events`   | Kullanıcı–etkinlik kayıtları  |

**user_trainings:** `id`, `user_id` (auth.users), `training_id` (trainings), `enrolled_at`, `completed`

**user_events:** `id`, `user_id` (auth.users), `event_id` (events), `enrolled_at`, `attended`

**Storage bucket:** `avatars` – dosya yolu: `{user_id}/avatar.{ext}`

Bu adımları tamamladıktan sonra profil fotoğrafı yükleme ve “Eğitimlerim / Etkinliklerim” özellikleri frontend ile uyumlu çalışır.

---

## 8. E-posta şablonları (isteğe bağlı)

Kayıt doğrulama ve şifre sıfırlama metinleri için: **Authentication** → **Email** — şablonları ve gerekirse özel SMTP’yi buradan yapılandırın.
