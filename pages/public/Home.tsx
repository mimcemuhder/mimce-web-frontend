import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight, Calendar, MapPin, ChevronLeft, ChevronRight,
  BookOpen, Users, Award, Zap, Clock, Heart, Shield, Star
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { fetchHomepageSettings } from '../../services/homepageSettings';
import { Event, Training, Blog } from '../../types';

// ─── Hero Image Cache ────────────────────────────────────────────────────────
const HERO_IMAGE_CACHE_KEY = 'mimce_hero_image';
const preloadImage = (src: string): Promise<void> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });

// ─── Section Header ──────────────────────────────────────────────────────────
const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}> = ({ eyebrow, title, href, linkLabel = 'Tümünü Gör' }) => (
  <div className="flex items-end justify-between mb-8">
    <div>
      <span className="text-primary font-bold text-[11px] tracking-widest uppercase mb-2 block">
        {eyebrow}
      </span>
      <h2 className="text-2xl font-extrabold text-navy">{title}</h2>
    </div>
    {href && (
      <Link to={href} className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
        {linkLabel} <ArrowRight size={14} />
      </Link>
    )}
  </div>
);

// ─── Horizontal Scroll Rail ──────────────────────────────────────────────────
const ScrollRail: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') =>
    railRef.current?.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' });

  return (
    <div className="relative">
      <button onClick={() => scroll('left')} aria-label="Sola kaydır"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-all shadow-sm">
        <ChevronLeft size={18} />
      </button>
      <div ref={railRef} className="flex gap-5 overflow-x-auto pb-3 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {children}
      </div>
      <button onClick={() => scroll('right')} aria-label="Sağa kaydır"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-all shadow-sm">
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

// ─── Skeleton Card ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex-shrink-0 w-52 rounded-xl overflow-hidden bg-white border border-gray-100 animate-pulse shadow-sm">
    <div className="h-64 bg-gray-100" />
    <div className="p-4 space-y-2.5">
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-full" />
    </div>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────
const Home: React.FC = () => {
  const [events, setEvents]       = useState<Event[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [blogs, setBlogs]         = useState<Blog[]>([]);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    let cancelled = false;
    const showHero = async (url: string) => {
      await preloadImage(url);
      if (!cancelled) { sessionStorage.setItem(HERO_IMAGE_CACHE_KEY, url); setHeroImage(url); }
    };
    const load = async () => {
      const cached = sessionStorage.getItem(HERO_IMAGE_CACHE_KEY);
      if (cached) await showHero(cached);
      const [settings, eventsRes, trainingsRes, blogsRes] = await Promise.all([
        fetchHomepageSettings(),
        supabase.from('events').select('*').order('date', { ascending: false }).limit(6),
        supabase.from('trainings').select('*').order('date', { ascending: false }).limit(8),
        supabase.from('blogs').select('*').eq('published', true).order('created_at', { ascending: false }).limit(3),
      ]);
      if (cancelled) return;
      const url = settings.heroImage;
      if (url !== cached) await showHero(url);
      if (eventsRes.data)    setEvents(eventsRes.data);
      if (trainingsRes.data) setTrainings(trainingsRes.data);
      if (blogsRes.data)     setBlogs(blogsRes.data);
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
    <Helmet>
      <title>MİMCE — Millî Mühendisler Cemiyeti</title>
      <meta name="description" content="MİMCE, mühendislik öğrencileri ve profesyonellerini eğitim, etkinlik ve toplulukla buluşturan sivil toplum kuruluşudur." />
      <link rel="canonical" href="https://mimce.org/" />
      <meta property="og:title" content="MİMCE — Millî Mühendisler Cemiyeti" />
      <meta property="og:description" content="Eğitim, etkinlik ve toplulukla büyüyen mühendislik platformu." />
      <meta property="og:url" content="https://mimce.org/" />
      <meta property="og:image" content="https://mimce.org/og-default.png" />
      <meta property="og:type" content="website" />
    </Helmet>
    <div className="w-full bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[580px] flex items-center overflow-hidden bg-navy">
        {heroImage && (
          <img src={heroImage} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        )}
        <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-primary/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[280px] h-[280px] bg-primary/5 rounded-full blur-2xl translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold px-3.5 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            <Zap size={11} /> Millî Mühendisler Cemiyeti
          </div>
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-white leading-[1.08] tracking-tight">
            Mühendisliğin{' '}
            <span className="text-primary">Geleceğini</span>{' '}
            Güçlendiriyoruz
          </h1>
          <p className="mt-6 text-base md:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Akademi ile sektör arasındaki köprüyü kuruyoruz. Eğitim, etkinlik ve topluluk desteğiyle mühendislerin gelişimine katkı sağlıyoruz.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/egitimler" className="px-7 py-3 bg-primary text-navy font-bold rounded-lg hover:bg-primary-dark transition-colors text-sm">
              Eğitimleri Keşfet
            </Link>
            <Link to="/gonullu-ol" className="px-7 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-colors text-sm">
              Gönüllü Ol
            </Link>
          </div>
        </div>

      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-gray-100">
          {[
            { value: '500+',  label: 'Eğitilen Mühendis' },
            { value: '20+',   label: 'Aktif Eğitim' },
            { value: '50+',   label: 'Yıllık Etkinlik' },
            { value: '1000+', label: 'Verilen Sertifika' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center px-4">
              <div className="text-2xl font-extrabold text-navy">{value}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── EĞİTİMLER CAROUSEL ──────────────────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Program Kataloğu" title="Son Eğitimler" href="/egitimler" />
          {loading ? (
            <div className="flex gap-5 overflow-hidden">
              {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : trainings.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">Henüz eğitim eklenmemiş.</p>
          ) : (
            <ScrollRail>
              {trainings.map((t) => (
                <Link key={t.id} to={`/egitimler/${t.id}`}
                  className="flex-shrink-0 w-52 group rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  {/* Afiş tam görünsün: object-contain + açık arka plan */}
                  <div className="relative bg-gray-50" style={{ aspectRatio: '3/4' }}>
                    <img
                      src={t.image}
                      alt={t.title}
                      className="absolute inset-0 w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <span className="absolute bottom-2 left-2 bg-primary text-navy text-[10px] font-extrabold px-2 py-0.5 rounded-full z-10">
                      {t.type}
                    </span>
                    {t.status === 'Tamamlandı' && (
                      <span className="absolute top-2 right-2 bg-gray-700/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10">
                        Tamamlandı
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="font-mono text-[10px] font-bold text-primary tracking-wider mb-1">{t.code}</span>
                    <h3 className="text-sm font-bold text-navy leading-snug line-clamp-2 flex-1">{t.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                      <Calendar size={10} className="text-primary" /> {t.date}
                    </div>
                  </div>
                </Link>
              ))}
            </ScrollRail>
          )}
          <div className="mt-4 sm:hidden text-center">
            <Link to="/egitimler" className="text-xs font-bold text-primary hover:underline">Tüm Eğitimleri Gör →</Link>
          </div>
        </div>
      </section>

      {/* ── ETKİNLİKLER CAROUSEL ─────────────────────────────────────────────── */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Topluluk & Ağ" title="Son Etkinlikler" href="/etkinlikler" />
          {loading ? (
            <div className="flex gap-5 overflow-hidden">
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : events.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">Henüz etkinlik eklenmemiş.</p>
          ) : (
            <ScrollRail>
              {events.map((ev) => (
                <Link key={ev.id} to={`/etkinlikler/${ev.id}`}
                  className="flex-shrink-0 w-72 group rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  <div className="h-44 overflow-hidden relative bg-gray-100">
                    <img src={ev.image} alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white/80 text-xs">
                      <Calendar size={11} /> {ev.date}
                      {ev.time && <><Clock size={11} className="ml-1" />{ev.time}</>}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-navy leading-snug line-clamp-2 flex-1">{ev.title}</h3>
                    {ev.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2.5">
                        <MapPin size={10} className="text-primary shrink-0" />
                        <span className="line-clamp-1">{ev.location}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </ScrollRail>
          )}
          <div className="mt-4 sm:hidden text-center">
            <Link to="/etkinlikler" className="text-xs font-bold text-primary hover:underline">Tüm Etkinlikleri Gör →</Link>
          </div>
        </div>
      </section>

      {/* ── BİZ KİMİZ ─────────────────────────────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary font-bold text-[11px] tracking-widest uppercase mb-2 block">
              Misyonumuz
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy leading-tight mb-4">
              Mühendislik Topluluğunun<br />Büyüme Platformu
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4 text-sm">
              MİMCE; mühendislik öğrencileri ve profesyonelleri bir araya getirerek mentorluk, pratik beceri gelişimi ve sektör bağlantıları sunan bir ekosistem oluşturur.
            </p>
            <p className="text-gray-500 leading-relaxed mb-6 text-sm">
              Birlikte öğrenir, birlikte büyürüz. Her mühendis, kariyerinin her aşamasında doğru desteği hak eder.
            </p>
            <Link to="/hakkimizda" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white font-bold rounded-lg hover:bg-navy-light transition-colors text-sm">
              Daha Fazla Öğren <ArrowRight size={15} />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { icon: BookOpen, title: 'Teknik Eğitimler',      desc: 'Sektörün ihtiyaçlarına göre tasarlanmış pratik eğitim programları.' },
              { icon: Users,    title: 'Mentorluk Ağı',          desc: 'Deneyimli mühendislerden birebir kariyer rehberliği alın.' },
              { icon: Calendar, title: 'Topluluk Etkinlikleri',  desc: 'Networking, hackathon ve panel etkinlikleriyle ağınızı genişletin.' },
              { icon: Award,    title: 'Sertifika Programları',  desc: 'Dijital sertifikalarla kazanımlarınızı belgeleyin ve paylaşın.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-primary/20 hover:shadow-sm transition-all group">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon size={16} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-sm mb-0.5">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MİLLÎ & MANEVİ DEĞERLER ─────────────────────────────────────────── */}
      <section className="py-14 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary font-bold text-[11px] tracking-widest uppercase mb-2 block">
                Köklü Değerler, Güçlü Nesiller
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-navy leading-tight mb-4">
                Millî Mühendislik,<br />Ahlâkî Sorumluluk
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm mb-4">
                MİMCE olarak mühendisliği yalnızca bir meslek değil; milletimize karşı kutsal bir sorumluluk olarak görüyoruz. Teknolojiyi ve bilimi, millî ve manevî değerlerimizle harmanlayarak geleceğe taşıyoruz.
              </p>
              <p className="text-gray-600 leading-relaxed text-sm">
                Vatan sevgisi, dürüstlük ve topluma hizmet anlayışını mühendislik kimliğinin ayrılmaz bir parçası kabul ederek yetişen nesillere örnek olmaya çalışıyoruz.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Shield, title: 'Millî Sorumluluk', desc: 'Bilgimizi ve üretimimizi önce vatanımızın kalkınmasına adıyoruz.' },
                { icon: Heart,  title: 'Ahlâkî Temeller',  desc: 'Dürüstlük, alçakgönüllülük ve çalışkanlık mühendisimizin pusulasıdır.' },
                { icon: Star,   title: 'Vatana Hizmet',    desc: 'Her proje, her eğitim; güçlü ve bağımsız bir Türkiye hedefine hizmet eder.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white border border-gray-100 rounded-xl p-5 text-center hover:border-primary/20 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-navy text-sm mb-1.5">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HEDEF KİTLE CARDS ────────────────────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-8 flex flex-col hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <BookOpen size={18} className="text-primary" />
              </div>
              <h3 className="text-xl font-extrabold text-navy mb-2">Öğrenciler İçin</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-6">
                Eğitimler, atölyeler ve mentorluk programlarıyla kariyerine güçlü bir başlangıç yap.
              </p>
              <Link to="/egitimler" className="inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-primary transition-colors">
                Eğitimlere Göz At <ArrowRight size={15} />
              </Link>
            </div>
            <div className="relative rounded-2xl bg-navy p-8 flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-5 relative z-10">
                <Users size={18} className="text-primary" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2 relative z-10">Profesyoneller İçin</h3>
              <p className="text-sm text-gray-400 leading-relaxed flex-1 mb-6 relative z-10">
                Ağını genişlet, bilgi birikimini paylaş ve yeni nesil mühendislere mentorluk yap.
              </p>
              <Link to="/egitmen-ol" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors relative z-10">
                Eğitmen Ol <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOG ─────────────────────────────────────────────────────────────── */}
      {blogs.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="İçerik & Bilgi" title="Son Yazılar" href="/blog" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {blogs.map((b) => (
                <Link key={b.id} to={`/blog/${b.slug}`}
                  className="group rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 duration-300 flex flex-col bg-white">
                  {b.cover_image && (
                    <div className="h-44 overflow-hidden bg-gray-100">
                      <img src={b.cover_image} alt={b.cover_alt || b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    {b.tags && b.tags.length > 0 && (
                      <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1.5">{b.tags[0]}</span>
                    )}
                    <h3 className="font-bold text-navy text-sm leading-snug mb-2 line-clamp-2 flex-1">{b.title}</h3>
                    {b.excerpt && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{b.excerpt}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50">
                      {b.author && <span className="font-medium">{b.author}</span>}
                      <span>{new Date(b.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-5 sm:hidden text-center">
              <Link to="/blog" className="text-xs font-bold text-primary hover:underline">Tüm Yazıları Gör →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-navy relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <span className="text-primary font-bold text-[11px] tracking-widest uppercase mb-4 block">
            Topluluğa Katıl
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
            Geleceğini Şekillendirmeye Bugün Başla
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8 text-sm">
            Binlerce mühendisle aynı platformda öğren, büyü ve bağlantı kur.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/egitimler" className="px-7 py-3 bg-primary text-navy font-bold rounded-lg hover:bg-primary-dark transition-colors text-sm">
              Eğitimleri İncele
            </Link>
            <Link to="/iletisim" className="px-7 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-colors text-sm">
              Bize Ulaş
            </Link>
          </div>
        </div>
      </section>

    </div>
    </>
  );
};

export default Home;
