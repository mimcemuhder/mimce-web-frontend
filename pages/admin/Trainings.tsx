import React, { useState, useEffect, useRef } from 'react';
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin';
import { Training } from '../../types';
import { Plus, X, Calendar, BookOpen, Upload, Image as ImageIcon } from 'lucide-react';

const Trainings: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainings = async () => {
      const { data } = await supabase
        .from('trainings')
        .select('*')
        .order('date', { ascending: false });
      if (data) setTrainings(data);
    };
    fetchTrainings();
  }, []);
  
  // Form State
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    date: '',
    type: 'Öğrenciler' as Training['type'],
    status: 'Aktif' as NonNullable<Training['status']>,
    image: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Lütfen bir resim dosyası seçin.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      date: '',
      type: 'Öğrenciler',
      status: 'Aktif',
      image: ''
    });
    setSelectedFile(null);
    setImagePreview('');
    setEditingTrainingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu eğitimi silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('trainings').delete().eq('id', id);
    if (!error) {
      setTrainings(prev => prev.filter(t => t.id !== id));
    } else {
      alert('Silme işlemi başarısız: ' + error.message);
    }
  };

  const handleEdit = (training: Training) => {
    setFormData({
      code: training.code ?? '',
      title: training.title,
      description: training.description,
      date: training.date,
      type: training.type,
      status: training.status ?? 'Aktif',
      image: training.image
    });
    setImagePreview(training.image);
    setEditingTrainingId(training.id);
    setIsSheetOpen(true);
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `trainings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert(
          'Görsel yüklenemedi: ' + uploadError.message + '\n\n' +
          'Muhtemel sebep: Supabase Storage\'da "images" bucket\'ı henüz oluşturulmamış.\n' +
          'Supabase Dashboard → Storage → "images" adında public bucket oluşturun.\n\n' +
          'Geçici çözüm: Görsel URL\'si alanına direkt bir URL yapıştırın.'
        );
        return null;
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('Image upload error:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (!formData.code || !formData.title || !formData.date || !formData.type) {
      alert("Kod, başlık, tarih ve tip alanları zorunludur.");
      return;
    }

    let imageUrl = formData.image;

    // Eğer dosya seçilmişse Supabase Storage'a yükle
    if (selectedFile) {
      const uploadedUrl = await uploadImageToSupabase(selectedFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        alert('Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }
    }

    // Eğer ne dosya ne de URL varsa, default görsel kullan (sadece yeni eklemede)
    if (!imageUrl && !editingTrainingId) {
      imageUrl = 'https://picsum.photos/400/250?random=' + Date.now();
    }

    if (editingTrainingId) {
      // Güncelleme
      const updatedTraining: Partial<Training> = {
        code: formData.code,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        type: formData.type,
        status: formData.status,
        image: imageUrl || formData.image
      };

      const { error } = await supabase
        .from('trainings')
        .update(updatedTraining)
        .eq('id', editingTrainingId);

      if (!error) {
        // Listeyi güncelle
        setTrainings(trainings.map(t => 
          t.id === editingTrainingId 
            ? { ...t, ...updatedTraining } as Training
            : t
        ));
        setIsSheetOpen(false);
        resetForm();
      } else {
        alert('Eğitim güncellenirken bir hata oluştu: ' + error.message);
      }
    } else {
      // Yeni ekleme
      const newTraining: Training = {
        id: Date.now().toString(),
        code: formData.code,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        type: formData.type,
        status: formData.status,
        image: imageUrl
      };

      const { error } = await supabase.from('trainings').insert([newTraining]);
      if (!error) {
        setTrainings([newTraining, ...trainings]);
        setIsSheetOpen(false);
        resetForm();
      } else {
        alert('Eğitim eklenirken bir hata oluştu: ' + error.message);
      }
    }
  };

  return (
    <div className="relative h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eğitimler</h1>
          <p className="text-sm text-gray-500 mt-1">Eğitimleri oluşturun ve yönetin.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsSheetOpen(true);
          }}
          className="bg-primary text-navy font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={18} />
          Yeni Eğitim
        </button>
      </div>

      {/* Trainings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {trainings.map(training => (
          <div key={training.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
             <div className="aspect-square bg-gray-200 relative">
               <img src={training.image} className="w-full h-full object-cover" alt={training.title} />
               <div className="absolute top-3 right-3 bg-navy/80 text-white text-xs font-bold px-2 py-1 rounded">
                 {training.type}
               </div>
               <div className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded ${
                 (training.status ?? 'Aktif') === 'Aktif'
                   ? 'bg-green-500 text-white'
                   : 'bg-gray-500 text-white'
               }`}>
                 {(training.status ?? 'Aktif') === 'Aktif' ? 'Aktif' : 'Tamamlandı'}
               </div>
             </div>
             <div className="p-5 flex-1 flex flex-col">
               <div className="flex items-center justify-between mb-2">
                 <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                   {training.code}
                 </span>
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                   (training.status ?? 'Aktif') === 'Aktif'
                     ? 'bg-green-100 text-green-700'
                     : 'bg-gray-200 text-gray-500'
                 }`}>
                   {training.status ?? 'Aktif'}
                 </span>
               </div>
               <h3 className="font-bold text-navy text-base mb-2 leading-snug">{training.title}</h3>
               <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                 <Calendar size={12} className="text-primary"/>
                 {training.date}
                 <span className="mx-1">·</span>
                 <BookOpen size={12} className="text-primary"/>
                 {training.type}
               </div>
               <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{training.description}</p>
               <div className="mt-auto flex gap-2">
                 <button 
                   onClick={() => handleEdit(training)}
                   className="flex-1 py-2 border border-gray-200 rounded text-sm font-medium hover:bg-gray-50"
                 >
                   Düzenle
                 </button>
                 <button onClick={() => handleDelete(training.id)} className="flex-1 py-2 border border-gray-200 rounded text-sm font-medium text-red-600 hover:bg-red-50">Sil</button>
               </div>
             </div>
          </div>
        ))}
        {trainings.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            Henüz eğitim eklenmemiş. Yeni eğitim eklemek için yukarıdaki butona tıklayın.
          </div>
        )}
      </div>

      {/* Side Sheet Overlay */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-navy/30 backdrop-blur-sm" onClick={() => {
            setIsSheetOpen(false);
            resetForm();
          }}></div>
          
          {/* Sheet */}
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-slide-in">
             <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-navy">
                  {editingTrainingId ? 'Eğitimi Düzenle' : 'Yeni Eğitim'}
                </h2>
                <button onClick={() => {
                  setIsSheetOpen(false);
                  resetForm();
                }} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Eğitim Kodu*</label>
                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none font-mono uppercase"
                    placeholder="Örn: MC407"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Eğitime özgü kısa kod. Listede ve detayda gösterilir.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Eğitim Başlığı*</label>
                  <input 
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Örn: İleri Seviye Yapısal Analiz"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Eğitim Tipi*</label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white"
                    required
                  >
                    <option value="Öğrenciler">Öğrenciler</option>
                    <option value="Profesyoneller">Profesyoneller</option>
                    <option value="Atölyeler">Atölyeler</option>
                    <option value="Webinarlar">Webinarlar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Eğitim Durumu*</label>
                  <div className="flex gap-3">
                    {(['Aktif', 'Tamamlandı'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold border-2 transition-colors ${
                          formData.status === s
                            ? s === 'Aktif'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-400 bg-gray-100 text-gray-700'
                            : 'border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        {s === 'Aktif' ? '🟢 Aktif' : '🏁 Tamamlandı'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Tamamlandı seçilirse detay sayfasında kayıt butonu ve müfredat gizlenir.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarih*</label>
                  <input 
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Örn: 15 Ekim 2026"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Görsel</label>
                  
                  {/* Dosya Seçimi */}
                  <div className="mb-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                    >
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Dosya seç veya sürükle</span>
                    </label>
                    {selectedFile && (
                      <p className="text-xs text-gray-500 mt-1">{selectedFile.name}</p>
                    )}
                  </div>

                  {/* Preview */}
                  {(imagePreview || (editingTrainingId && formData.image && !selectedFile)) && (
                    <div className="mb-3">
                      <img
                        src={imagePreview || formData.image}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {/* URL Input (Alternatif) */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon size={16} className="text-gray-400" />
                    </div>
                    <input 
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      type="url" 
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="veya görsel URL'si girin"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Dosya seçebilir veya URL girebilirsiniz. İkisi de boşsa otomatik görsel atanır.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Eğitim detayları ve içeriği..."
                  ></textarea>
                </div>
             </form>

             <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50">
                <button 
                  type="button"
                  onClick={() => {
                    setIsSheetOpen(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-100"
                >
                  İptal
                </button>
                <button 
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 bg-primary text-navy rounded-lg font-bold hover:bg-primary-dark shadow-sm"
                >
                  {editingTrainingId ? 'Güncelle' : 'Eğitimi Kaydet'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainings;
