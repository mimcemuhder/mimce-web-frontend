import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Heart, Shield, Star, Users } from 'lucide-react';

// ─── Takım Verileri ───────────────────────────────────────────────────────────
interface TeamMember {
  name: string;
  role: string;
  department: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'İbrahim Çalışkan',
    role: 'Başkan',
    department: 'Endüstri Mühendisi',
    image: '/team/ibrahim-caliskan.png',
  },
  {
    name: 'Semih Güneş',
    role: 'Sekreterya',
    department: 'Endüstri Mühendisliği, Öğrenci',
    image: '/team/semih-gunes.png',
  },
  {
    name: 'Hakan Sezen',
    role: 'Teşkilatlanma',
    department: 'Uçak Mühendisi',
    image: '/team/hakan-sezen.png',
  },
  {
    name: 'Bedirhan Yiğit',
    role: 'Üniversite',
    department: 'Bilgisayar Mühendisliği, Öğrenci',
    image: '/team/bedirhan-yigit.png',
  },
  {
    name: 'Nusret Eren Özbek',
    role: 'Eğitim',
    department: 'Makine Mühendisliği, Öğrenci',
    image: '/team/nusret-eren-ozbek.png',
  },
  {
    name: 'Ahmet Balkan',
    role: 'Tanıtım Medya',
    department: 'Bilgisayar Mühendisliği, Öğrenci',
    image: '/team/ahmet-medya.jpeg',
  },
  {
    name: 'Salih Burak Bilak',
    role: 'Maliye ve Kaynak Geliştirme',
    department: 'Yazılım Mühendisi',
    image: '/team/salih-burak-bilak.png',
  },
  {
    name: 'Mehmet Emin Ergenç',
    role: 'Bilgi Teknolojileri',
    department: 'Bilgisayar Mühendisi',
    image: '/team/mehmet-emin-ergenc.png',
  },
];

// ─── Takım Kartı ─────────────────────────────────────────────────────────────
const TeamCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden mb-4 border-2 border-gray-100 group-hover:border-primary/40 transition-all duration-300 shadow-sm group-hover:shadow-md">
      <img
        src={member.image}
        alt={member.name}
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=300&background=0f172a&color=13ecc8&bold=true&font-size=0.4`;
        }}
      />
    </div>
    <h3 className="font-bold text-navy text-sm mb-0.5">{member.name}</h3>
    <p className="text-primary text-xs font-semibold mb-0.5">{member.role}</p>
    <p className="text-gray-400 text-xs">{member.department}</p>
  </div>
);

// ─── Sayfa ────────────────────────────────────────────────────────────────────
const AboutUs: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Hakkımızda | MİMCE</title>
        <meta
          name="description"
          content="MİMCE (Millî Mühendisler Cemiyeti) hakkında bilgi edinin. Misyonumuz, ekibimiz ve değerlerimiz."
        />
        <link rel="canonical" href="https://mimce.org/hakkimizda" />
        <meta property="og:title" content="Hakkımızda | MİMCE" />
        <meta property="og:description" content="MİMCE misyonu, ekibi ve değerleri." />
        <meta property="og:url" content="https://mimce.org/hakkimizda" />
        <meta property="og:image" content="https://mimce.org/og-default.png" />
      </Helmet>
      <div className="w-full bg-white">
        {/* ── SAYFA HERO ───────────────────────────────────────────────────────── */}
        <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden bg-navy">
          <img
            src="/team/aboutus_header.jpg"
            alt="MİMCE topluluk"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 text-center px-4">
            <span className="text-primary font-bold text-[11px] tracking-widest uppercase block mb-3">
              Millî Mühendisler Cemiyeti
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Hakkımızda
            </h1>
            <div className="mt-4 mx-auto w-12 h-1 bg-primary rounded-full" />
          </div>
        </section>

        {/* ── HİKAYEMİZ ───────────────────────────────────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary font-bold text-[11px] tracking-widest uppercase mb-3 block">
                Kuruluş Hikayemiz
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-navy leading-tight mb-5">
                2014'ten Bu Yana
                <br />
                Gönüllülük Ruhuyla
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                2014 yılında bir grup yeni mezun mühendisin gurbette, büyük şehirde öğrencilik
                yıllarında karşılaşmış oldukları zorluklardan doğduk. Atölye, kurs, okul dışında
                kendini geliştirme imkânlarının yetersizliği bu yolculuğu başlattı.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Kendilerinden sonra gelecek, bu vatanın birer mühendisi olacağını iddia eden her
                mühendis adayına ve mezun mühendise bu zorluklarla karşılaşmaması için tamamen
                gönüllü olarak, hiçbir kâr amacı gütmeden kurulmuş bir sivil toplum kuruluşuyuz.
              </p>
              <Link
                to="/iletisim"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white font-bold rounded-lg hover:bg-navy-light transition-colors text-sm"
              >
                Bize Ulaşın <ArrowRight size={15} />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '10+', label: 'Yıllık Deneyim', sub: "2014'ten beri aktif" },
                { value: '500+', label: 'Eğitilen Mühendis', sub: 'Türkiye genelinde' },
                { value: '20+', label: 'Aktif Eğitim', sub: 'Her dönem güncelleniyor' },
                { value: '%100', label: 'Gönüllü Ekip', sub: 'Kâr amacı gütmeden' },
              ].map(({ value, label, sub }) => (
                <div
                  key={label}
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:border-primary/20 hover:shadow-sm transition-all"
                >
                  <div className="text-2xl font-extrabold text-navy mb-1">{value}</div>
                  <div className="text-sm font-bold text-gray-700 mb-0.5">{label}</div>
                  <div className="text-xs text-gray-400">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DEĞERLERIMIZ ─────────────────────────────────────────────────────── */}
        <section className="py-14 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-primary font-bold text-[11px] tracking-widest uppercase block mb-2">
                Temel İlkelerimiz
              </span>
              <h2 className="text-2xl font-extrabold text-navy">Değerlerimiz</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: Shield,
                  title: 'Millî Sorumluluk',
                  desc: 'Mühendisliği milletimize karşı kutsal bir sorumluluk olarak görüyor; bilgimizi vatanımızın kalkınmasına adıyoruz.',
                },
                {
                  icon: Heart,
                  title: 'Ahlâkî Temeller',
                  desc: 'Dürüstlük, alçakgönüllülük ve çalışkanlık; cemiyetimizin ve her üyemizin pusuladır.',
                },
                {
                  icon: Users,
                  title: 'Topluma Hizmet',
                  desc: 'Hiçbir kâr amacı gütmeden, tamamen gönüllülük esasıyla çalışarak mühendis topluluğumuza hizmet ediyoruz.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-primary/20 hover:shadow-sm transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-navy text-base mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EKİBİMİZ ─────────────────────────────────────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-primary font-bold text-[11px] tracking-widest uppercase block mb-2">
                Gönüllü Kadromuz
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-navy mb-3">
                Ekibimizle Tanışın
              </h2>
              <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
                MİMCE'nin farklı birimlerinde görev alan, alanında yetkin ve gönüllülük esasıyla
                çalışan ekibimizi yakından tanıyın.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {teamMembers.slice(0, 5).map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>
            <div className="grid grid-cols-5 gap-8 mt-8">
              <div className="col-start-1">
                <TeamCard member={teamMembers[5]} />
              </div>
              <div className="col-start-3">
                <TeamCard member={teamMembers[6]} />
              </div>
              <div className="col-start-5">
                <TeamCard member={teamMembers[7]} />
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────────── */}
        <section className="py-16 bg-navy relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
            <Star size={20} className="text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
              Sen de Bu Ailenin Bir Parçası Ol
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Gönüllü olarak ekibimize katıl, mühendislik topluluğuna katkı sağla ve kariyer
              yolculuğunu anlamlı kıl.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/gonullu-ol"
                className="px-7 py-3 bg-primary text-navy font-bold rounded-lg hover:bg-primary-dark transition-colors text-sm"
              >
                Gönüllü Ol
              </Link>
              <Link
                to="/iletisim"
                className="px-7 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                Bize Ulaş
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutUs;
