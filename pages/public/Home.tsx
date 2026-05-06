import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, Briefcase } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { Event } from '../../types';

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })
        .limit(3);
      if (data) setEvents(data);
    };
    fetchEvents();
  }, []);

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative w-full h-[600px] flex items-center">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
           <img 
             src="https://picsum.photos/1920/1080?grayscale&blur=2" 
             alt="Engineering Background" 
             className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-navy/80 mix-blend-multiply"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
            Mühendisliğin <span className="text-primary">Geleceğini</span> Güçlendiriyoruz
          </h1>
          <p className="mt-6 max-w-2xl text-lg md:text-xl text-gray-300 leading-relaxed">
            Akademi ile sektör arasındaki köprüyü kuruyoruz. Eğitim, etkinlik ve topluluk desteğiyle gelişmenizi sağlıyoruz.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/egitimler" className="px-8 py-3.5 bg-primary text-navy font-bold rounded-md hover:bg-primary-dark transition text-center">
              Eğitimleri Keşfet
            </Link>
            <Link to="/gonullu-ol" className="px-8 py-3.5 bg-transparent border-2 border-white text-white font-bold rounded-md hover:bg-white hover:text-navy transition text-center">
              Gönüllü Ol
            </Link>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-4">
              <div className="text-4xl font-extrabold text-navy">500+</div>
              <div className="mt-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Eğitilen Mühendis</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-navy">20+</div>
              <div className="mt-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Yıllık Etkinlik</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-navy">50+</div>
              <div className="mt-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Kurumsal İş Ortağı</div>
            </div>
          </div>
        </div>
      </div>

      {/* BİZ KİMİZ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-navy inline-block relative pb-4">
            Biz Kimiz
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full"></span>
          </h2>
          <p className="mt-8 text-lg text-gray-600 leading-relaxed">
            MİMCE; mühendislik öğrencileri ve profesyonelleri bir araya getirerek mentorluk, pratik beceri gelişimi ve sektör bağlantıları sunan bir ekosistem oluşturur.
          </p>
        </div>
      </section>

      {/* AUDIENCE CARDS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Card (Light) */}
            <div className="bg-gray-50 rounded-2xl p-10 flex flex-col items-start border border-gray-100 hover:shadow-lg transition-shadow">
               <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-6">
                 <Briefcase size={24} />
               </div>
               <h3 className="text-2xl font-bold text-navy mb-4">Öğrenciler İçin</h3>
               <p className="text-gray-600 mb-8 leading-relaxed">
                 Eğitimler, atölyeler ve mentorluk programlarıyla kariyerine güçlü bir başlangıç yap.
               </p>
               <Link to="/egitimler" className="mt-auto font-bold text-navy flex items-center gap-2 hover:gap-3 transition-all">
                 Başla <ArrowRight size={18} />
               </Link>
            </div>

            {/* Professional Card (Dark) */}
            <div className="bg-navy rounded-2xl p-10 flex flex-col items-start hover:shadow-xl transition-shadow relative overflow-hidden">
               {/* Accent circle */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full"></div>
               
               <div className="w-12 h-12 bg-navy-light rounded-xl flex items-center justify-center text-primary mb-6 relative z-10">
                 <Users size={24} />
               </div>
               <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Profesyoneller İçin</h3>
               <p className="text-gray-400 mb-8 leading-relaxed relative z-10">
                 Ağını genişlet, bilgi birikimini paylaş, yeni nesil mühendislere mentorluk yap.
               </p>
               <Link to="/egitmen-ol" className="mt-auto font-bold text-primary flex items-center gap-2 hover:gap-3 transition-all relative z-10">
                 Dahil Ol <ArrowRight size={18} />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* YAKLAŞAN ETKİNLİKLER */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-navy">Yaklaşan Etkinlikler</h2>
              <p className="mt-2 text-gray-600">Eğitim, networking ve gelişim için bize katıl.</p>
            </div>
            <Link to="/etkinlikler" className="text-primary font-bold hover:underline">
              Tüm Etkinlikleri Gör
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-48 overflow-hidden relative">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-bold text-navy uppercase">
                    {event.date}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy mb-2 line-clamp-1">{event.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>
                  <Link to={`/etkinlikler/${event.id}`} className="inline-flex items-center text-sm font-bold text-primary hover:text-primary-dark">
                    Detay <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;