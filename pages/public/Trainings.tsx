import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { Training } from '../../types';

const Trainings: React.FC = () => {
  const [filter, setFilter] = useState('Tümü');
  const [trainings, setTrainings] = useState<Training[]>([]);
  
  const filters = ['Tümü', 'Öğrenciler', 'Profesyoneller', 'Atölyeler', 'Webinarlar'];

  useEffect(() => {
    const fetchTrainings = async () => {
      const { data } = await supabase
        .from('trainings')
        .select('*')
        .order('date', { ascending: false });
      if (data) setTrainings(data);
    };
    fetchTrainings();
  }, []);

  const filteredTrainings = filter === 'Tümü' 
    ? trainings 
    : trainings.filter(t => t.type === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-navy">Eğitimler</h1>
            <p className="text-gray-600 mt-2">Kariyerinizde yükselmeniz için tasarlanmış teknik ve sosyal eğitimler.</p>
          </div>
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </span>
            <input 
              type="text" 
              className="block w-full pl-10 pr-4 py-2.5 border-none rounded-lg shadow-sm bg-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Eğitim ara..."
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-navy text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTrainings.map(training => (
            <Link
              key={training.id}
              to={`/egitimler/${training.id}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col group"
            >
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={training.image}
                  alt={training.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-navy/80 text-white text-[10px] font-bold px-2 py-1 rounded">
                  {training.type}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded tracking-wider">
                    {training.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    (training.status ?? 'Aktif') === 'Aktif'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {training.status ?? 'Aktif'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-navy mb-2 leading-tight">{training.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <Calendar size={11} className="text-primary" />
                  {training.date}
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{training.description}</p>
                <div className="flex items-center justify-center gap-1.5 py-2 rounded border border-gray-200 text-sm font-bold text-navy group-hover:bg-navy group-hover:text-white group-hover:border-navy transition-colors">
                  Detayları Gör <ArrowRight size={13} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredTrainings.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            Sonuç bulunamadı.
          </div>
        )}

      </div>
    </div>
  );
};

export default Trainings;