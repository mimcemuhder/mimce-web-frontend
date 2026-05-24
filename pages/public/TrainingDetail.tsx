import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  Tag,
  ArrowLeft,
  Share2,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { Training } from '../../types';

const typeColors: Record<string, string> = {
  Öğrenciler: 'bg-blue-100 text-blue-700',
  Profesyoneller: 'bg-purple-100 text-purple-700',
  Atölyeler: 'bg-orange-100 text-orange-700',
  Webinarlar: 'bg-teal-100 text-teal-700',
};

const TrainingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [training, setTraining] = useState<Training | null>(null);
  const [related, setRelated] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const fetchTraining = async () => {
      setLoading(true);
      const { data } = await supabase.from('trainings').select('*').eq('id', id).single();
      if (data) {
        setTraining(data);
        const { data: rel } = await supabase.from('trainings').select('*').neq('id', id).limit(3);
        if (rel) setRelated(rel);
      } else {
        navigate('/egitimler');
      }
      setLoading(false);
    };
    fetchTraining();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!training) return null;

  const isCompleted = training.status === 'Tamamlandı';

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{training.title} | Eğitimler | MİMCE</title>
        <meta
          name="description"
          content={training.description?.slice(0, 155) || 'MİMCE eğitim detayları'}
        />
        <link rel="canonical" href={`https://mimce.org/egitimler/${training.id}`} />
        <meta property="og:title" content={`${training.title} | MİMCE`} />
        <meta property="og:description" content={training.description?.slice(0, 155) || ''} />
        <meta property="og:image" content={training.image || 'https://mimce.org/og-default.png'} />
        <meta property="og:url" content={`https://mimce.org/egitimler/${training.id}`} />
      </Helmet>

      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/egitimler"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm font-medium transition-colors"
          >
            <ArrowLeft size={15} />
            Tüm Eğitimler
          </Link>
        </div>
      </div>

      {/* Hero section: poster left + info right */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Poster / Afiş */}
            <div className="w-full md:w-72 lg:w-80 flex-shrink-0">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <img
                  src={training.image || `https://picsum.photos/seed/${training.id}/600/600`}
                  alt={training.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Code + badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="font-mono text-sm font-bold bg-navy text-primary px-3 py-1 rounded-lg tracking-widest">
                  {training.code}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeColors[training.type] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {training.type}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isCompleted ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {isCompleted ? 'Tamamlandı' : 'Aktif'}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-navy leading-tight mb-5">
                {training.title}
              </h1>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
                    Tarih
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-navy">
                    <Calendar size={13} className="text-primary" />
                    {training.date}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
                    Kategori
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-navy">
                    <Tag size={13} className="text-primary" />
                    {training.type}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
                    Sertifika
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-navy">
                    <BookOpen size={13} className="text-primary" />
                    Evet
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                {training.description}
              </p>

              <div className="flex flex-wrap gap-3">
                {isCompleted ? (
                  <div className="px-6 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-400">
                    Eğitim Tamamlandı
                  </div>
                ) : (
                  <button
                    onClick={() => setEnrolled((e) => !e)}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                      enrolled
                        ? 'bg-green-50 text-green-700 border-2 border-green-200'
                        : 'bg-navy text-white hover:bg-navy/90 shadow-md'
                    }`}
                  >
                    {enrolled ? '✓ Kayıt Yapıldı' : 'Eğitime Kayıt Ol'}
                  </button>
                )}
                <button className="px-5 py-3 rounded-xl font-medium text-sm border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
                  <Share2 size={14} />
                  Paylaş
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Description */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full inline-block" />
            Eğitim Hakkında
          </h2>
          <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
            {training.description}
          </div>
        </div>

        {!isCompleted && (
          <>
            {/* What you'll learn */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full inline-block" />
                Ne Öğreneceksiniz?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Temel kavramlar ve teorik altyapı',
                  'Gerçek dünya uygulamaları ve vaka analizleri',
                  'Sektörde kullanılan araçlar ve metodolojiler',
                  'Pratik proje ve problem çözme teknikleri',
                  'Uzman mentör eşliğinde rehberlik',
                  'Sertifika ve portfolyo desteği',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                    <CheckCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full inline-block" />
                Eğitim İçeriği
              </h2>
              <div className="space-y-3">
                {[
                  { week: 'Modül 1', title: 'Giriş ve Temel Kavramlar', duration: '2 saat' },
                  { week: 'Modül 2', title: 'Teori ve Metodoloji', duration: '3 saat' },
                  { week: 'Modül 3', title: 'Uygulamalı Çalışmalar', duration: '4 saat' },
                  { week: 'Modül 4', title: 'Proje ve Değerlendirme', duration: '2 saat' },
                ].map((mod, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold text-xs flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                        {mod.week}
                      </div>
                      <div className="text-sm font-semibold text-navy">{mod.title}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} />
                      {mod.duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {isCompleted && (
          <div className="bg-gray-100 rounded-2xl border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-3">🏁</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">Bu eğitim tamamlandı</h3>
            <p className="text-sm text-gray-500">
              Bu eğitim geçmişte gerçekleşti. Aktif eğitimlerimizi incelemek için{' '}
              <Link to="/egitimler" className="text-primary font-semibold hover:underline">
                eğitimler sayfasına
              </Link>{' '}
              dönebilirsiniz.
            </p>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="pt-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-navy">Diğer Eğitimler</h2>
              <Link
                to="/egitimler"
                className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
              >
                Tümünü Gör <ChevronRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/egitimler/${rel.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 group transition-all flex gap-4 p-4 items-start"
                >
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={rel.image || `https://picsum.photos/seed/${rel.id}/200/200`}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0">
                    {rel.code && (
                      <span className="font-mono text-[10px] font-bold text-primary">
                        {rel.code}
                      </span>
                    )}
                    <h3 className="font-bold text-navy text-sm leading-snug line-clamp-2 mt-0.5">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar size={10} />
                      {rel.date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingDetail;
