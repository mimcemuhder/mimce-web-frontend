import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, ImageIcon, Save, ExternalLink, Crop } from 'lucide-react';
import ImageCropModal from '../../components/ImageCropModal';
import {
  DEFAULT_HERO_IMAGE,
  fetchHomepageSettingsAdmin,
  saveHomepageHeroImage,
  uploadHomepageImage,
} from '../../services/homepageSettings';

const HERO_ASPECT = 16 / 9;

const HomepageAdmin: React.FC = () => {
  const [heroUrl, setHeroUrl] = useState(DEFAULT_HERO_IMAGE);
  const [urlInput, setUrlInput] = useState('');
  const [preview, setPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const previewBlobRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const settings = await fetchHomepageSettingsAdmin();
      setHeroUrl(settings.heroImage);
      setUrlInput(settings.heroImage === DEFAULT_HERO_IMAGE ? '' : settings.heroImage);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (previewBlobRef.current) URL.revokeObjectURL(previewBlobRef.current);
    };
  }, []);

  const revokePreviewBlob = () => {
    if (previewBlobRef.current) {
      URL.revokeObjectURL(previewBlobRef.current);
      previewBlobRef.current = null;
    }
  };

  const setPreviewFromBlob = (url: string) => {
    revokePreviewBlob();
    previewBlobRef.current = url;
    setPreview(url);
  };

  const displayPreview = preview || heroUrl;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (file: File, previewUrl: string) => {
    setSelectedFile(file);
    setUrlInput('');
    setPreviewFromBlob(previewUrl);
    setCropSrc(null);
  };

  const handleRecrop = () => {
    const src = preview || heroUrl;
    if (!src || src === DEFAULT_HERO_IMAGE) return;
    setCropSrc(src);
  };

  const handleSave = async () => {
    setSaving(true);
    let finalUrl = heroUrl;

    if (selectedFile) {
      const uploaded = await uploadHomepageImage(selectedFile);
      if (!uploaded) {
        alert('Görsel yüklenemedi. Storage bucket ve oturumunuzu kontrol edin.');
        setSaving(false);
        return;
      }
      finalUrl = uploaded;
    } else if (urlInput.trim()) {
      finalUrl = urlInput.trim();
    }

    const { error } = await saveHomepageHeroImage(finalUrl);
    setSaving(false);

    if (error) {
      alert('Kaydedilemedi: ' + error);
      return;
    }

    setHeroUrl(finalUrl);
    setUrlInput(finalUrl === DEFAULT_HERO_IMAGE ? '' : finalUrl);
    revokePreviewBlob();
    setPreview('');
    setSelectedFile(null);
    alert('Ana sayfa görseli güncellendi.');
  };

  const handleResetDefault = async () => {
    if (!confirm('Varsayılan görsele dönmek istiyor musunuz?')) return;
    setSaving(true);
    const { error } = await saveHomepageHeroImage(DEFAULT_HERO_IMAGE);
    setSaving(false);
    if (error) {
      alert('Kaydedilemedi: ' + error);
      return;
    }
    setSelectedFile(null);
    revokePreviewBlob();
    setPreview('');
    setUrlInput('');
    setHeroUrl(DEFAULT_HERO_IMAGE);
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Yükleniyor...</div>;
  }

  return (
    <>
      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspect={HERO_ASPECT}
          title="Hero görselini kırp (16:9)"
          onCancel={() => setCropSrc(null)}
          onComplete={handleCropComplete}
        />
      )}

      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Ana Sayfa Görselleri</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ziyaretçilerin gördüğü hero arka planını buradan güncelleyin. Etkinlik kartlarındaki
            görseller{' '}
            <Link to="/admin/etkinlikler" className="text-primary font-semibold hover:underline">
              Etkinlikler
            </Link>{' '}
            sayfasından yönetilir.
          </p>
        </div>

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-navy flex items-center gap-2">
              <ImageIcon size={18} className="text-primary" />
              Hero arka plan
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Yükleme sonrası 16:9 oranında kırpabilirsiniz. Önerilen çıktı: 1920×1080.
            </p>
          </div>

          <div className="relative h-48 md:h-56 bg-navy">
            <img src={displayPreview} alt="Önizleme" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-navy/80 mix-blend-multiply pointer-events-none" />
            <div className="absolute inset-0 flex items-center px-6 pointer-events-none">
              <p className="text-white/80 text-sm font-medium">Önizleme (koyu katman dahil)</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="hero-image-upload"
            />
            <label
              htmlFor="hero-image-upload"
              className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-primary transition-colors"
            >
              <Upload size={18} className="text-gray-400" />
              <span className="text-sm text-gray-500">Bilgisayardan yükle ve kırp (max 5MB)</span>
            </label>

            {displayPreview !== DEFAULT_HERO_IMAGE && (
              <button
                type="button"
                onClick={handleRecrop}
                className="w-full py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Crop size={16} />
                Görseli yeniden kırp
              </button>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">veya görsel URL</label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setSelectedFile(null);
                  revokePreviewBlob();
                  setPreview('');
                }}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-navy font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-primary-dark disabled:opacity-60"
              >
                <Save size={18} />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button
                type="button"
                onClick={handleResetDefault}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Varsayılana dön
              </button>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Siteyi aç
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomepageAdmin;
