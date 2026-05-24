import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, Globe, Send, Instagram, Youtube, CheckCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const contactSchema = z.object({
  name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  subject: z.string().min(1, 'Konu seçiniz'),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalıdır'),
});

type ContactForm = z.infer<typeof contactSchema>;

const Contact: React.FC = () => {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const socials = [
    { label: 'Instagram', handle: '@mimcemuhder', icon: Instagram, url: 'https://instagram.com/mimcemuhder' },
    { label: 'X (Twitter)', handle: '@mimcemuhder', icon: XIcon,     url: 'https://x.com/mimcemuhder' },
    { label: 'YouTube',    handle: '@mimcemuhder', icon: Youtube,    url: 'https://youtube.com/@mimcemuhder' },
  ];

  const onSubmit = async (data: ContactForm) => {
    const { error } = await supabase
      .from('contact_submissions')
      .insert([{ name: data.name, email: data.email, subject: data.subject, message: data.message }]);
    if (error) throw new Error('Mesajınız gönderilemedi. Lütfen tekrar deneyin.');
    setSent(true);
  };

  return (
    <>
    <Helmet>
      <title>İletişim | MİMCE</title>
      <meta name="description" content="MİMCE ile iletişime geçin. Sorularınız, önerileriniz veya iş birliği talepleriniz için bize yazın." />
      <link rel="canonical" href="https://mimce.org/iletisim" />
      <meta property="og:title" content="İletişim | MİMCE" />
      <meta property="og:description" content="MİMCE ile iletişime geçin." />
      <meta property="og:url" content="https://mimce.org/iletisim" />
      <meta property="og:image" content="https://mimce.org/og-default.png" />
    </Helmet>
    <div className="w-full bg-white">

      {/* ── SAYFA HERO ───────────────────────────────────────────────────────── */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <span className="text-primary font-bold text-[11px] tracking-widest uppercase block mb-3">
            Bize Ulaşın
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">İletişim</h1>
          <p className="text-gray-400 text-base max-w-xl">
            Sorularınız, önerileriniz veya iş birliği talepleriniz için bize yazın.
          </p>
        </div>
      </section>

      {/* ── İÇERİK ───────────────────────────────────────────────────────────── */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Sol: Bilgi */}
            <div className="lg:col-span-2 space-y-5">

              {/* İletişim kartları */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                <a href="mailto:iletisim@mimce.org"
                  className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Mail size={17} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">E-Posta</div>
                    <div className="text-navy font-semibold text-sm">iletisim@mimce.org</div>
                  </div>
                </a>

                <a href="https://www.mimce.org" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Globe size={17} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Web Sitesi</div>
                    <div className="text-navy font-semibold text-sm">www.mimce.org</div>
                  </div>
                </a>

                <a href="https://maps.google.com/?q=Hacı+Bayram+Yayık+Sk+No:13+Altındağ+Ankara"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <MapPin size={17} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Adres</div>
                    <div className="text-navy font-semibold text-sm leading-relaxed">
                      Hacı Bayram, Yayık Sk. No:13<br />Altındağ / Ankara
                    </div>
                  </div>
                </a>
              </div>

              {/* Sosyal medya */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-bold text-navy uppercase tracking-widest mb-4">Sosyal Medya</h3>
                <div className="space-y-3">
                  {socials.map(s => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 group">
                      <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all flex items-center justify-center shrink-0 text-gray-500 group-hover:text-primary">
                        <s.icon {...(s.label !== 'X (Twitter)' ? { size: 15 } : {})} />
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-medium">{s.label}</div>
                        <div className="text-sm font-semibold text-navy leading-tight">{s.handle}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Harita */}
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-48">
                <iframe
                  title="MİMCE Konum"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3059.!2d32.863!3d39.943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d34f9f9f9f9f9f%3A0x0!2zSGFjxLEgQmF5cmFtLCBZYXnEsWsgU2suIE5vOjEzLCBBbHTEsW5kYcSfL0Fua2FyYQ!5e0!3m2!1str!2str!4v1"
                  width="100%" height="100%"
                  style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Sağ: Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                {sent ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                      <CheckCircle size={22} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-navy mb-2">Mesajınız İletildi!</h3>
                    <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                      En kısa sürede size geri döneceğiz. Teşekkür ederiz.
                    </p>
                    <button
                      onClick={() => { setSent(false); reset(); }}
                      className="mt-6 px-5 py-2.5 text-sm font-bold text-navy border border-gray-200 rounded-lg hover:bg-navy hover:text-white hover:border-navy transition-colors"
                    >
                      Yeni Mesaj Gönder
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-primary font-bold text-[11px] tracking-widest uppercase block mb-1">
                      Mesaj Gönderin
                    </span>
                    <h2 className="text-xl font-extrabold text-navy mb-6">Sizden duymak isteriz</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Ad Soyad *</label>
                          <input {...register('name')} type="text"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white"
                            placeholder="Adınız Soyadınız" />
                          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">E-Posta *</label>
                          <input {...register('email')} type="email"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white"
                            placeholder="ornek@email.com" />
                          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Konu *</label>
                        <select {...register('subject')}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white text-gray-700">
                          <option value="">Konu seçin</option>
                          <option value="Genel Bilgi">Genel Bilgi</option>
                          <option value="Eğitim">Eğitimler</option>
                          <option value="Etkinlik">Etkinlikler</option>
                          <option value="Gönüllülük">Gönüllülük</option>
                          <option value="İş Birliği">İş Birliği</option>
                          <option value="Diğer">Diğer</option>
                        </select>
                        {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Mesaj *</label>
                        <textarea {...register('message')} rows={6}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                          placeholder="Mesajınızı buraya yazın..." />
                        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                      </div>

                      <button type="submit" disabled={isSubmitting}
                        className="w-full py-3 bg-navy text-white font-bold rounded-xl hover:bg-navy-light transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                        {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={15} /> Gönder</>}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Contact;
