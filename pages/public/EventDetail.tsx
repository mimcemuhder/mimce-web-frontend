import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowLeft, ChevronRight, ChevronLeft, X, Images } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { Event } from '../../types';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [related, setRelated] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const { data } = await supabase.from('events').select('*').eq('id', id).single();
      if (data) {
        setEvent(data);
        const { data: rel } = await supabase
          .from('events')
          .select('*')
          .neq('id', id)
          .limit(3);
        if (rel) setRelated(rel);
      } else {
        navigate('/etkinlikler');
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id, navigate]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightbox === null || !event) return;
    const photos = getPhotos(event);
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setLightbox(i => Math.min((i ?? 0) + 1, photos.length - 1));
      if (e.key === 'ArrowLeft') setLightbox(i => Math.max((i ?? 0) - 1, 0));
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, event]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  const getPhotos = (ev: Event) => {
    const all = [...(ev.images ?? []), ...(ev.image ? [ev.image] : [])];
    return [...new Set(all)].filter(u => u && !u.includes('picsum.photos'));
  };

  const photos = getPhotos(event);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/etkinlikler"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm font-medium transition-colors"
          >
            <ArrowLeft size={15} />
            Tüm Etkinlikler
          </Link>
        </div>
      </div>

      {/* Hero photo */}
      {photos.length > 0 && (
        <div
          className="w-full bg-navy overflow-hidden cursor-zoom-in"
          style={{ maxHeight: '520px' }}
          onClick={() => setLightbox(0)}
        >
          <img
            src={photos[0]}
            alt={event.title}
            className="w-full object-cover object-center"
            style={{ maxHeight: '520px' }}
          />
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-extrabold text-navy leading-tight mb-5">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {event.date && (
                  <span className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <Calendar size={14} className="text-primary" />{event.date}
                  </span>
                )}
                {event.time && (
                  <span className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <Clock size={14} className="text-primary" />{event.time}
                  </span>
                )}
                {event.location && (
                  <span className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <MapPin size={14} className="text-primary" />{event.location}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full inline-block" />
                  Etkinlik Hakkında
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{event.description}</p>
              </div>
            )}

            {/* Photo gallery grid */}
            {photos.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full inline-block" />
                  Fotoğraflar
                  <span className="ml-1 text-xs font-normal text-gray-400">({photos.length})</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setLightbox(i)}
                      className="aspect-square rounded-xl overflow-hidden group focus:outline-none"
                    >
                      <img
                        src={url}
                        alt={`Fotoğraf ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider font-semibold mb-4">
                <Images size={14} />
                Etkinlik Bilgileri
              </div>
              <div className="space-y-3 text-sm">
                {event.date && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tarih</span>
                    <span className="font-semibold text-navy">{event.date}</span>
                  </div>
                )}
                {event.time && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saat</span>
                    <span className="font-semibold text-navy">{event.time}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Konum</span>
                    <span className="font-semibold text-navy text-right max-w-[150px]">{event.location}</span>
                  </div>
                )}
                {photos.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fotoğraf</span>
                    <span className="font-semibold text-navy">{photos.length} adet</span>
                  </div>
                )}
              </div>

              {photos.length > 1 && (
                <div className="mt-5 grid grid-cols-3 gap-1.5">
                  {photos.slice(0, 6).map((url, i) => (
                    <button key={i} onClick={() => setLightbox(i)} className="aspect-square rounded-lg overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related events */}
        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-navy">Diğer Etkinlikler</h2>
              <Link to="/etkinlikler" className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Tümünü Gör <ChevronRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map(rel => {
                const relPhotos = rel.images?.length ? rel.images : rel.image ? [rel.image] : [];
                return (
                  <Link
                    key={rel.id}
                    to={`/etkinlikler/${rel.id}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 group transition-all flex gap-4 p-4 items-start"
                  >
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {relPhotos.length > 0 ? (
                        <img src={relPhotos[0]} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Images size={20} /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-navy text-sm leading-snug line-clamp-2">{rel.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Calendar size={10} />{rel.date}</p>
                      {relPhotos.length > 1 && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Images size={10} />{relPhotos.length} fotoğraf</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 text-white/70 hover:text-white"
          >
            <X size={28} />
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightbox + 1} / {photos.length}
          </div>

          {/* Prev */}
          {lightbox > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(i => Math.max((i ?? 1) - 1, 0)); }}
              className="absolute left-4 text-white/70 hover:text-white bg-black/30 rounded-full p-2"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Image */}
          <img
            src={photos[lightbox]}
            alt={`${lightbox + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />

          {/* Next */}
          {lightbox < photos.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(i => Math.min((i ?? 0) + 1, photos.length - 1)); }}
              className="absolute right-4 text-white/70 hover:text-white bg-black/30 rounded-full p-2"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Thumbnails strip */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4">
              {photos.map((url, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setLightbox(i); }}
                  className={`w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                    i === lightbox ? 'border-primary scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventDetail;
