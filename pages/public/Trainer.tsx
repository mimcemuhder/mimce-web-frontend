import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { GraduationCap, Users, Award, Star, Send, CheckCircle, Briefcase, Globe } from 'lucide-react';
import { supabase } from '../../services/supabase';

const EXPERTISE = [
  'Yazılım & Programlama', 'Elektrik & Elektronik', 'Makine & İmalat',
  'Endüstri & Süreç', 'Havacılık & Savunma', 'İnşaat & Yapı',
  'Yapay Zeka & Veri', 'Siber Güvenlik', 'Proje Yönetimi', 'Kariyer Koçluğu', 'Diğer',
];

const BENEFITS = [
  { icon: Users,         title: 'Topluluğa Erişim',  desc: 'Yüzlerce öğrenci ve mühendisle buluşarak etkinizi yayın.' },
  { icon: Award,         title: 'Sertifika & Tanınma', desc: 'Eğitimleriniz belgelenir, profiliniz topluluğumuzda paylaşılır.' },
  { icon: Globe,         title: 'Ulusal Platform',    desc: 'Türkiye genelinde mühendislik camiasında ses getirin.' },
  { icon: GraduationCap, title: 'Bilgiyi Aktarın',   desc: 'Deneyiminizi paylaşarak yeni nesil mühendislere yol gösterin.' },
];

const Trainer: React.FC = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', title: '',
    expertise: '', trainingTitle: '', trainingDesc: '', experience: '', bio: '',
  });
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('trainer_applications')
        .insert([{
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          company: form.company,
          title: form.title,
          expertise: form.expertise,
          training_title: form.trainingTitle,
          training_desc: form.trainingDesc,
          experience: form.experience,
          bio: form.bio,
        }]);
      if (dbError) throw dbError;
      setSent(true);
    } catch (err) {
      setError('Başvurunuz gönderilemedi. Lütfen tekrar deneyin.');
      console.error('[Trainer] Supabase insert error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Helmet>
      <title>Eğitmen Ol | MİMCE</title>
      <meta name="description" content="MİMCE Eğitmen Programı'na katılın. Sektör deneyiminizi ve uzmanlığınızı paylaşarak mühendis adaylarına yol gösterin." />
      <link rel="canonical" href="https://mimce.org/egitmen-ol" />
      <meta property="og:title" content="Eğitmen Ol | MİMCE" />
      <meta property="og:description" content="MİMCE Eğitmen Programı'na katılın." />
      <meta property="og:url" content="https://mimce.org/egitmen-ol" />
      <meta property="og:image" content="https://mimce.org/og-default.png" />
    </Helmet>
    <div className="w-full bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold px-3.5 py-1.5 rounded-full mb-5 tracking-widest uppercase">
              <Star size={11} /> Eğitmen Programı
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
              Bilginizi<br /><span className="text-primary">Geleceğe</span><br />Aktarın
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-md">
              Sektör deneyiminizi ve uzmanlığınızı paylaşarak mühendis adaylarının kariyer yolculuğuna katkı sağlayın.
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

      {/* ── NASIL ÇALIŞIR ────────────────────────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-primary font-bold text-[11px] tracking-widest uppercase block mb-2">Süreç</span>
            <h2 className="text-2xl font-extrabold text-navy">Nasıl Çalışır?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Başvurun',         desc: 'Formu doldurun, uzmanlık alanınızı ve eğitim önerinizi paylaşın.' },
              { step: '02', title: 'Değerlendirme',    desc: 'Ekibimiz başvurunuzu inceler, sizi arayarak detayları görüşür.' },
              { step: '03', title: 'Eğitimi Verin',    desc: 'Müfredat belirlenir, tarih ayarlanır ve eğitiminiz yayına alınır.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center p-6 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-sm transition-all">
                <div className="text-3xl font-extrabold text-primary/20 mb-3">{step}</div>
                <h3 className="font-bold text-navy text-base mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM ─────────────────────────────────────────────────────────────── */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="text-primary font-bold text-[11px] tracking-widest uppercase block mb-2">Başvuru Formu</span>
            <h2 className="text-2xl font-extrabold text-navy">Eğitmen Başvurusu Yap</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                  <CheckCircle size={28} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">Başvurunuz Alındı!</h3>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-6">
                  Ekibimiz başvurunuzu inceleyecek ve 3–5 iş günü içinde size ulaşacak. Teşekkürler!
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name:'', email:'', phone:'', company:'', title:'', expertise:'', trainingTitle:'', trainingDesc:'', experience:'', bio:'' }); }}
                  className="px-5 py-2.5 text-sm font-bold text-navy border border-gray-200 rounded-lg hover:bg-navy hover:text-white hover:border-navy transition-colors"
                >
                  Yeni Başvuru
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Kişisel Bilgiler */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-4 h-px bg-gray-200 inline-block" /> Kişisel Bilgiler
                  </p>
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
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Telefon</label>
                      <input name="phone" value={form.phone} onChange={handleChange} type="tel"
                        placeholder="+90 5__ ___ __ __"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Şirket / Kurum *</label>
                      <input name="company" value={form.company} onChange={handleChange} required type="text"
                        placeholder="Çalıştığınız kurum"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Ünvan / Pozisyon *</label>
                    <input name="title" value={form.title} onChange={handleChange} required type="text"
                      placeholder="örn. Kıdemli Yazılım Mühendisi"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                  </div>
                </div>

                {/* Uzmanlık */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-4 h-px bg-gray-200 inline-block" /> Uzmanlık & Eğitim
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Uzmanlık Alanı *</label>
                      <select name="expertise" value={form.expertise} onChange={handleChange} required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-700">
                        <option value="">Seçin</option>
                        {EXPERTISE.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Eğitim Başlığı *</label>
                      <input name="trainingTitle" value={form.trainingTitle} onChange={handleChange} required type="text"
                        placeholder="Vermek istediğiniz eğitimin başlığı"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Eğitim İçeriği *</label>
                      <textarea name="trainingDesc" value={form.trainingDesc} onChange={handleChange} required rows={3}
                        placeholder="Eğitimde işlenecek konular, hedef kitle ve öğrenme çıktıları..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Deneyim Süresi *</label>
                      <select name="experience" value={form.experience} onChange={handleChange} required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-700">
                        <option value="">Seçin</option>
                        <option value="1-3">1 – 3 yıl</option>
                        <option value="3-5">3 – 5 yıl</option>
                        <option value="5-10">5 – 10 yıl</option>
                        <option value="10+">10 yıl ve üzeri</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Kısa Biyografi *</label>
                      <textarea name="bio" value={form.bio} onChange={handleChange} required rows={3}
                        placeholder="Kendinizi ve kariyerinizi kısaca tanıtın..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none" />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>
                )}
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-navy text-white font-bold rounded-xl hover:bg-navy-light transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Send size={15} /> Başvuruyu Gönder</>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Başvurunuz değerlendirildikten sonra 3–5 iş günü içinde size ulaşılacaktır.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── TEŞVİK BANDI ─────────────────────────────────────────────────────── */}
      <section className="py-12 bg-navy relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <Briefcase size={20} className="text-primary mx-auto mb-3" />
          <h2 className="text-xl font-extrabold text-white mb-2">Sorunuz mu var?</h2>
          <p className="text-gray-400 text-sm mb-5">
            Eğitmen programı hakkında detaylı bilgi almak için bize ulaşabilirsiniz.
          </p>
          <a href="mailto:iletisim@mimce.org"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-navy font-bold rounded-lg hover:bg-primary-dark transition-colors text-sm">
            iletisim@mimce.org
          </a>
        </div>
      </section>
    </div>
    </>
  );
};

export default Trainer;
