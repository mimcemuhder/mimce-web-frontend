import React from 'react';

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
    name: 'Mehmet Emin Ergenç',
    role: 'Tanıtım Medya',
    department: 'Bilgisayar Mühendisi',
    image: '/team/mehmet-emin-ergenc.png',
  },
  {
    name: 'Mirsad Türker',
    role: 'Maliye ve Kaynak Geliştirme',
    department: 'Makine Mühendisi',
    image: '/team/mirsad-turker.png',
  },
  {
    name: 'Salih Burak Bilak',
    role: 'Kurumsal İlişkiler',
    department: 'Yazılım Mühendisi',
    image: '/team/salih-burak-bilak.png',
  },
];

const DotPattern: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute ${className}`} style={{ opacity: 0.3 }}>
    <div className="grid grid-cols-8 gap-1.5">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#1a3c5e]" />
      ))}
    </div>
  </div>
);

const INTRO_TEXT =
  '2014 Yılında bir grup yeni mezun mühendisin gurbette, büyük şehirde öğrencilik yıllarında karşılaşmış oldukları zorlukları; atölye, kurs, okul dışında kendini geliştirme fırsatı vb. imkanların yetersizliğinden dolayı kendilerinden sonra gelen, bu vatanın birer mühendisi olacağını iddia eden her mühendis adayına ve mezun mühendise bu zorluklarla karşılaşmaması için tamamen gönüllü olarak hiçbir kar amacı gütmeden yetersiz olan imkanları karşılamak için kurulmuş bir sivil toplum kuruluşudur.';

const DotPatternSmall: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute ${className}`} style={{ opacity: 0.3 }}>
    <div className="grid grid-cols-6 gap-1.5">
      {Array.from({ length: 36 }).map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#1a3c5e]" />
      ))}
    </div>
  </div>
);

const AboutUs: React.FC = () => {
  return (
    <div className="w-full bg-white">
      {/* Hero: HAKKIMIZDA */}
      <section className="relative h-[320px] md:h-[400px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="/team/aboutus_header.jpg"
            alt="MİMCE topluluk"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-navy/70" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wider uppercase">
            Hakkımızda
          </h1>
          <div className="mt-4 mx-auto w-16 h-1 bg-primary rounded-full" />
        </div>
      </section>

      {/* Tanıtım metni + buton */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <DotPatternSmall className="left-4 md:left-8 top-1/2 -translate-y-1/2" />
        <DotPatternSmall className="right-4 md:right-8 top-1/2 -translate-y-1/2" />

        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            {INTRO_TEXT}
          </p>
        </div>
      </section>

      {/* Section: Ekibimizle Tanışın */}
      <section className="relative py-20 overflow-hidden">
        {/* Top blue line */}
        <div className="flex justify-center mb-10">
          <div className="w-16 h-1 bg-[#1a3c5e] rounded-full" />
        </div>

        {/* Title */}
        <h2 className="text-center text-4xl md:text-5xl font-extrabold tracking-wider text-[#0f2b46] uppercase mb-6">
          Ekibimizle Tanışın
        </h2>

        {/* Subtitle */}
        <p className="text-center text-gray-500 max-w-2xl mx-auto mb-16 px-4 text-sm leading-relaxed">
          MİMCE'nin farklı birimlerinde görev alan, alanında yetkin ve gönüllülük esasıyla çalışan ekibimizi yakından tanıyın.
        </p>

        {/* Row 1 */}
        <div className="relative max-w-6xl mx-auto px-4 mb-20">
          <DotPattern className="left-0 top-8 -translate-x-4" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            {teamMembers.slice(0, 4).map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
        </div>

        {/* Divider line */}
        <div className="flex justify-center mb-20">
          <div className="w-16 h-1 bg-[#1a3c5e] rounded-full" />
        </div>

        {/* Row 2 */}
        <div className="relative max-w-6xl mx-auto px-4">
          <DotPattern className="left-0 top-8 -translate-x-4" />
          <DotPattern className="right-0 top-8 translate-x-4" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            {teamMembers.slice(4, 8).map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const TeamCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-full aspect-square mb-4 overflow-hidden">
      <img
        src={member.image}
        alt={member.name}
        className="w-full h-full object-cover grayscale"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=300&background=1a3c5e&color=fff&bold=true`;
        }}
      />
    </div>
    <h3 className="text-[#1a3c5e] font-bold text-sm md:text-base mb-1">
      {member.name}
    </h3>
    <p className="text-gray-600 text-xs md:text-sm">
      {member.role}
    </p>
    <p className="text-gray-400 text-xs italic mt-0.5">
      {member.department}
    </p>
  </div>
);

export default AboutUs;
