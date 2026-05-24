import React, { useState } from 'react';
import { Heart, Users, Calendar, BookOpen, Megaphone, Send, CheckCircle } from 'lucide-react';

const AREAS = [
  { id: 'egitim',     label: 'Eğitim',               icon: BookOpen },
  { id: 'etkinlik',   label: 'Etkinlik Organizasyonu', icon: Calendar },
  { id: 'tanitim',    label: 'Tanıtım & Medya',        icon: Megaphone },
  { id: 'topluluk',   label: 'Topluluk Yönetimi',      icon: Users },
];

const BENEFITS = [
  { icon: BookOpen,  title: 'Mesleki Gelişim',   desc: 'Sektör profesyonelleriyle çalışarak hem teknik hem kişisel becerilerini geliştir.' },
  { icon: Users,     title: 'Güçlü Ağ',          desc: 'Yüzlerce mühendis, öğrenci ve profesyonelle tanışarak ağını genişlet.' },
  { icon: Heart,     title: 'Anlam ve Amaç',     desc: 'Emeğinin milletine dokunan bir amaca hizmet ettiğini hissederek çalış.' },
  { icon: Calendar,  title: 'Etkinlik Deneyimi', desc: 'Ulusal ölçekli etkinliklerin organizasyonunda aktif rol al.' },
];

const Volunteer: React.FC = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', institution: '', department: '',
    areas: [] as string[], motivation: '',
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleArea = (id: string) => {
    setForm(prev => ({
      ...prev,
      areas: prev.areas.includes(id) ? prev.areas.filter(a => a !== id) : [...prev.areas, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 900);
  };

  return (
    <div className="w-full bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold px-3.5 py-1.5 rounded-full mb-5 tracking-widest uppercase">
              <Heart size={11} /> Gönüllülük Esası
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
              Sen de Bu<br /><span className="text-primary">Ailenin Parçası</span><br />Ol
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-md">
              MİMCE, tamamen gönüllülük esasıyla çalışan bir sivil toplum kuruluşudur. Emeğinle milletinin geleceğine katkı sağla.
            </p>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <Icon size={18} className="text-primary mb-3" />
                <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAYDALAR MOBİL ───────────────────────────────────────────────────── */}
      <div className="lg:hidden bg-gray-50 border-b border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 gap-4">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-xl p-4">
              <Icon size={16} className="text-primary mb-2" />
              <h3 className="text-navy font-bold text-sm mb-1">{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FORM ─────────────────────────────────────────────────────────────── */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="text-primary font-bold text-[11px] tracking-widest uppercase block mb-2">Başvuru Formu</span>
            <h2 className="text-2xl font-extrabold text-navy">Gönüllü Başvurusu Yap</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                  <CheckCircle size={28} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">Başvurunuz Alındı!</h3>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-6">
                  Başvurunuzu inceleyip en kısa sürede sizinle iletişime geçeceğiz. Teşekkürler!
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', institution: '', department: '', areas: [], motivation: '' }); }}
                  className="px-5 py-2.5 text-sm font-bold text-navy border border-gray-200 rounded-lg hover:bg-navy hover:text-white hover:border-navy transition-colors"
                >
                  Yeni Başvuru
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Ad Soyad *</label>
                    <input name="name" value={form.name} onChange={handleChange} required type="text"
                      placeholder="Adınız Soyadınız"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">E-Posta *</label>
                    <input name="email" value={form.email} onChange={handleChange} required type="email"
                      placeholder="ornek@email.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Telefon</label>
                    <input name="phone" value={form.phone} onChange={handleChange} type="tel"
                      placeholder="+90 5__ ___ __ __"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Üniversite / Kurum *</label>
                    <input name="institution" value={form.institution} onChange={handleChange} required type="text"
                      placeholder="Üniversite veya şirket adı"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Bölüm / Uzmanlık *</label>
                  <input name="department" value={form.department} onChange={handleChange} required type="text"
                    placeholder="örn. Bilgisayar Mühendisliği"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">İlgi Duyduğunuz Birimler *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {AREAS.map(({ id, label, icon: Icon }) => {
                      const selected = form.areas.includes(id);
                      return (
                        <button type="button" key={id} onClick={() => toggleArea(id)}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                            selected
                              ? 'border-primary bg-primary/5 text-navy'
                              : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                          }`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selected ? 'bg-primary/15' : 'bg-gray-100'}`}>
                            <Icon size={15} className={selected ? 'text-primary' : 'text-gray-400'} />
                          </div>
                          <span className="text-sm font-semibold">{label}</span>
                          {selected && <CheckCircle size={14} className="text-primary ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  {form.areas.length === 0 && (
                    <p className="text-xs text-gray-400 mt-2">En az bir birim seçin.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Motivasyonunuz *</label>
                  <textarea name="motivation" value={form.motivation} onChange={handleChange} required rows={4}
                    placeholder="Neden gönüllü olmak istiyorsunuz? MİMCE'ye nasıl katkı sağlamayı planlıyorsunuz?"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none" />
                </div>

                <button type="submit" disabled={loading || form.areas.length === 0}
                  className="w-full py-3 bg-navy text-white font-bold rounded-xl hover:bg-navy-light transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Send size={15} /> Başvuruyu Gönder</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Volunteer;
