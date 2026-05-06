import React, { useState } from 'react';
import { Mail, MapPin, Globe, Send, Instagram, Youtube } from 'lucide-react';

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const socials = [
    { label: 'Instagram', handle: '@mimcemuhder', icon: Instagram, url: 'https://instagram.com/mimcemuhder', color: 'hover:text-pink-500' },
    { label: 'X', handle: '@mimcemuhder', icon: XIcon, url: 'https://x.com/mimcemuhder', color: 'hover:text-gray-900' },
    { label: 'YouTube', handle: '@mimcemuhder', icon: Youtube, url: 'https://youtube.com/@mimcemuhder', color: 'hover:text-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Bize Ulaşın</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">İletişim</h1>
          <p className="text-gray-300 text-lg max-w-xl">
            Sorularınız, önerileriniz veya iş birliği talepleriniz için bize yazın.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Left: Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Contact cards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
              {/* Email */}
              <a
                href="mailto:iletisim@mimce.org"
                className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">E-Posta</div>
                  <div className="text-navy font-semibold text-sm">iletisim@mimce.org</div>
                </div>
              </a>

              {/* Website */}
              <a
                href="https://www.mimce.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Globe size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Web Sitesi</div>
                  <div className="text-navy font-semibold text-sm">www.mimce.org</div>
                </div>
              </a>

              {/* Address */}
              <a
                href="https://maps.google.com/?q=Hacı+Bayram+Yayık+Sk+No:13+Altındağ+Ankara"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Adres</div>
                  <div className="text-navy font-semibold text-sm leading-relaxed">
                    Hacı Bayram, Yayık Sk. No:13<br />
                    Altındağ / Ankara
                  </div>
                </div>
              </a>
            </div>

            {/* Socials */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full inline-block" />
                Sosyal Medya
              </h3>
              <div className="space-y-3">
                {socials.map(s => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 text-gray-500 ${s.color} transition-colors group`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors flex items-center justify-center flex-shrink-0">
                      <s.icon {...(s.label !== 'X' ? { size: 15 } : {})} />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-medium">{s.label}</div>
                      <div className="text-sm font-semibold text-navy leading-tight">{s.handle}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Map embed */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-52">
              <iframe
                title="MİMCE Konum"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3059.!2d32.863!3d39.943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d34f9f9f9f9f9f%3A0x0!2zSGFjxLEgQmF5cmFtLCBZYXnEsWsgU2suIE5vOjEzLCBBbHTEsW5kYcSfL0Fua2FyYQ!5e0!3m2!1str!2str!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
                    <Send size={24} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">Mesajınız İletildi!</h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    En kısa sürede size geri döneceğiz. Teşekkür ederiz.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="mt-6 px-5 py-2.5 text-sm font-bold text-navy border-2 border-navy rounded-xl hover:bg-navy hover:text-white transition-colors"
                  >
                    Yeni Mesaj Gönder
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-navy mb-1 flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full inline-block" />
                    Mesaj Gönderin
                  </h2>
                  <p className="text-sm text-gray-400 mb-7 ml-3"></p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Ad Soyad*</label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          type="text"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                          placeholder="Adınız Soyadınız"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">E-Posta*</label>
                        <input
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          type="email"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                          placeholder="ornek@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Konu*</label>
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white text-gray-700"
                      >
                        <option value="">Konu seçin</option>
                        <option value="Genel Bilgi">Genel Bilgi</option>
                        <option value="Eğitim">Eğitimler</option>
                        <option value="Etkinlik">Etkinlikler</option>
                        <option value="Gönüllülük">Gönüllülük</option>
                        <option value="İş Birliği">İş Birliği</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Mesaj*</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                        placeholder="Mesajınızı buraya yazın..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-navy text-white font-bold rounded-xl hover:bg-navy/90 transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                    >
                      <Send size={16} />
                      Gönder
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
