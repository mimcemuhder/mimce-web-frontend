import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, MapPin, Search, Images, ArrowUpDown } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { Event } from '../../types';
import { EventSort, EVENT_SORT_OPTIONS, sortEvents } from '../../utils/listSort';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<EventSort>('date-desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });
      if (data) setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matched = query
      ? events.filter(
          e =>
            e.title.toLowerCase().includes(query) ||
            e.location.toLowerCase().includes(query),
        )
      : events;
    return sortEvents(matched, sort);
  }, [events, search, sort]);

  return (
    <>
    <Helmet>
      <title>Etkinlikler | MİMCE</title>
      <meta name="description" content="MİMCE mühendislik etkinlikleri — konferanslar, atölyeler ve networking etkinlikleri." />
      <link rel="canonical" href="https://mimce.org/etkinlikler" />
      <meta property="og:title" content="Etkinlikler | MİMCE" />
      <meta property="og:url" content="https://mimce.org/etkinlikler" />
      <meta property="og:image" content="https://mimce.org/og-default.png" />
    </Helmet>
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-navy py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Geçmiş Etkinlikler</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">Etkinlikler</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            MİMCE'nin düzenlediği sempozyumlar, paneller, atölyeler ve buluşmaların arşivi.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search & Sort */}
        <div className="mb-8 flex flex-col sm:flex-row justify-end gap-3">
          <div className="relative w-full sm:w-auto sm:min-w-[200px]">
            <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={sort}
              onChange={e => setSort(e.currentTarget.value as EventSort)}
              className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer"
            >
              {EVENT_SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Etkinlik ara..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400 font-medium">Sonuç bulunamadı.</div>
        ) : (
          <div key={sort} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map(event => {
              const allUrls = [...(event.images ?? []), ...(event.image ? [event.image] : [])];
              const photos = [...new Set(allUrls)].filter(u => u && !u.includes('picsum.photos'));
              return (
                <Link
                  key={event.id}
                  to={`/etkinlikler/${event.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 group transition-all flex flex-col"
                >
                  {/* Cover photo */}
                  <div className="relative overflow-hidden bg-gray-100" style={{ paddingBottom: '66.66%' }}>
                    <div className="absolute inset-0">
                      {photos.length > 0 ? (
                        <img
                          src={photos[0]}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                          <Images size={32} />
                        </div>
                      )}
                      {/* Photo count badge */}
                      {photos.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-navy/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Images size={10} />
                          {photos.length}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-navy text-base leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-2"><Calendar size={12} className="text-primary flex-shrink-0" />{event.date}</div>
                      {event.time && <div className="flex items-center gap-2"><Clock size={12} className="text-primary flex-shrink-0" />{event.time}</div>}
                      {event.location && <div className="flex items-center gap-2"><MapPin size={12} className="text-primary flex-shrink-0" />{event.location}</div>}
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 flex-1">{event.description}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Events;
