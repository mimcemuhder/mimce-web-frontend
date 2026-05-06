import React, { useState, useEffect, useRef } from 'react';
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin';
import { Event } from '../../types';
import { Plus, X, Calendar, MapPin, Clock, Upload, ImageIcon, Trash2 } from 'lucide-react';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false });
    if (data) setEvents(data);
  };

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const valid = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (valid.length !== files.length) alert('Bazı dosyalar geçersiz ya da 5MB\'dan büyük, atlandı.');

    setImageFiles(prev => [...prev, ...valid]);
    valid.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeNewImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setFormData({ title: '', date: '', time: '', location: '', description: '' });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setUrlInput('');
    setEditingEventId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openEdit = (event: Event) => {
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
    });
    const allUrls = [...(event.images ?? []), ...(event.image ? [event.image] : [])];
    const realImages = [...new Set(allUrls)].filter(u => u && !u.includes('picsum.photos'));
    setExistingImages(realImages);
    setImageFiles([]);
    setImagePreviews([]);
    setEditingEventId(event.id);
    setIsSheetOpen(true);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const path = `events/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('images').upload(path, file);
    if (error) {
      console.error('Storage upload hatası:', error.message);
      return null;
    }
    return supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      alert('Başlık ve tarih zorunludur.');
      return;
    }

    setSaving(true);

    const uploadedUrls: string[] = [];
    let uploadFailed = false;
    for (const file of imageFiles) {
      const url = await uploadImage(file);
      if (url) {
        uploadedUrls.push(url);
      } else {
        uploadFailed = true;
      }
    }

    if (uploadFailed) {
      alert(
        'Bazı görseller yüklenemedi.\n\n' +
        'Muhtemel sebep: Supabase Storage\'da "images" bucket\'ı henüz oluşturulmamış.\n\n' +
        'Geçici çözüm: URL alanına görsel bağlantısı yapıştırın.\n\n' +
        'Kalıcı çözüm: Supabase Dashboard → Storage → "images" adında public bucket oluşturun.'
      );
      setSaving(false);
      return;
    }

    // URL girdisi varsa ekle
    if (urlInput.trim()) uploadedUrls.push(urlInput.trim());

    const allImages = [...existingImages, ...uploadedUrls];
    const coverImage = allImages[0] ?? '';

    if (editingEventId) {
      const updated: Partial<Event> = {
        ...formData,
        image: coverImage,
        images: allImages,
      };
      const { error } = await supabase.from('events').update(updated).eq('id', editingEventId);
      if (!error) {
        setEvents(events.map(ev => ev.id === editingEventId ? { ...ev, ...updated } as Event : ev));
        setIsSheetOpen(false);
        resetForm();
      } else {
        alert('Hata: ' + error.message);
      }
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        ...formData,
        image: coverImage,
        images: allImages,
      };
      const { error } = await supabase.from('events').insert([newEvent]);
      if (!error) {
        setEvents([newEvent, ...events]);
        setIsSheetOpen(false);
        resetForm();
      } else {
        alert('Hata: ' + error.message);
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) setEvents(events.filter(ev => ev.id !== id));
  };

  const allPreviews = [...existingImages, ...imagePreviews];

  return (
    <div className="relative h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etkinlikler</h1>
          <p className="text-sm text-gray-500 mt-1">Geçmiş etkinlikleri ekleyin ve yönetin.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsSheetOpen(true); }}
          className="bg-primary text-navy font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={18} />
          Yeni Etkinlik
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map(event => {
          const allUrls = [...(event.images ?? []), ...(event.image ? [event.image] : [])];
          const photos = [...new Set(allUrls)].filter(u => u && !u.includes('picsum.photos'));
          return (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              {/* Photo strip */}
              <div className="h-44 bg-gray-100 relative overflow-hidden">
                {photos.length > 0 ? (
                  <>
                    <img src={photos[0]} className="w-full h-full object-cover" alt={event.title} />
                    {photos.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-navy/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        +{photos.length - 1} fotoğraf
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-navy text-base mb-3 leading-snug">{event.title}</h3>
                <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-2"><Calendar size={12} className="text-primary" />{event.date}</div>
                  <div className="flex items-center gap-2"><Clock size={12} className="text-primary" />{event.time}</div>
                  <div className="flex items-center gap-2"><MapPin size={12} className="text-primary" />{event.location}</div>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 flex-1 mb-4">{event.description}</p>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => openEdit(event)} className="flex-1 py-2 border border-gray-200 rounded text-sm font-medium hover:bg-gray-50">
                    Düzenle
                  </button>
                  <button onClick={() => handleDelete(event.id)} className="flex-1 py-2 border border-gray-200 rounded text-sm font-medium text-red-600 hover:bg-red-50 flex items-center justify-center gap-1">
                    <Trash2 size={13} /> Sil
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            Henüz etkinlik eklenmemiş.
          </div>
        )}
      </div>

      {/* Side Sheet */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-navy/30 backdrop-blur-sm" onClick={() => { setIsSheetOpen(false); resetForm(); }} />

          <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-navy">
                {editingEventId ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}
              </h2>
              <button onClick={() => { setIsSheetOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Etkinlik Başlığı*</label>
                <input
                  name="title" value={formData.title} onChange={handleInputChange}
                  type="text" required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Örn: Mühendislik Zirvesi 2025"
                />
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tarih*</label>
                  <input
                    name="date" value={formData.date} onChange={handleInputChange}
                    type="date" required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Saat (24s)</label>
                  <input
                    name="time" value={formData.time} onChange={handleInputChange}
                    type="time"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">Örn: 19:00</p>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Konum</label>
                <input
                  name="location" value={formData.location} onChange={handleInputChange}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Adres veya Çevrimiçi"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Açıklama</label>
                <textarea
                  name="description" value={formData.description} onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Etkinlik hakkında kısa bilgi..."
                />
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fotoğraflar</label>

                {/* Upload area */}
                <input
                  ref={fileInputRef} type="file" accept="image/*" multiple
                  onChange={handleFileSelect} className="hidden" id="event-images"
                />
                <label
                  htmlFor="event-images"
                  className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-primary transition-colors"
                >
                  <Upload size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Fotoğraf ekle (çoklu seçim)</span>
                </label>

                {/* Preview grid */}
                {allPreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {existingImages.map((url, i) => (
                      <div key={`ex-${i}`} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute top-1 left-1 bg-primary text-navy text-[9px] font-bold px-1.5 py-0.5 rounded">Kapak</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.map((src, i) => (
                      <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        {existingImages.length === 0 && i === 0 && (
                          <span className="absolute top-1 left-1 bg-primary text-navy text-[9px] font-bold px-1.5 py-0.5 rounded">Kapak</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-1.5">İlk fotoğraf kapak görseli olarak kullanılır. Maks 5MB/fotoğraf.</p>

                {/* URL fallback */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Ya da görsel URL'si girin</label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="https://ornek.com/fotograf.jpg"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Supabase Storage bucket kurulmadan önce URL kullanın.
                  </p>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50">
              <button
                type="button"
                onClick={() => { setIsSheetOpen(false); resetForm(); }}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-100"
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 py-2.5 bg-primary text-navy rounded-lg font-bold hover:bg-primary-dark shadow-sm disabled:opacity-60"
              >
                {saving ? 'Kaydediliyor...' : editingEventId ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
