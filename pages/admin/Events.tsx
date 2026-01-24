import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Event } from '../../types';
import { Plus, X, Calendar, MapPin, Clock } from 'lucide-react';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });
      if (data) setEvents(data);
    };
    fetchEvents();
  }, []);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    status: 'Taslak',
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (!formData.title || !formData.date) {
      alert("Bu alan zorunludur.");
      return;
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      title: formData.title,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      status: formData.status as any,
      description: formData.description,
      image: 'https://picsum.photos/400/250?random=' + Date.now()
    };

    const { error } = await supabase.from('events').insert([newEvent]);
    if (!error) {
      setEvents([newEvent, ...events]);
      setIsSheetOpen(false);
      // Reset form
      setFormData({
        title: '', date: '', time: '', location: '', status: 'Taslak', description: ''
      });
    }
  };

  return (
    <div className="relative h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etkinlikler</h1>
          <p className="text-sm text-gray-500 mt-1">Yaklaşan etkinlikleri planlayın ve düzenleyin.</p>
        </div>
        <button 
          onClick={() => setIsSheetOpen(true)}
          className="bg-primary text-navy font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={18} />
          Yeni Etkinlik
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
             <div className="h-40 bg-gray-200 relative">
               <img src={event.image} className="w-full h-full object-cover" alt={event.title} />
               <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold ${
                 event.status === 'Yayında' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
               }`}>
                 {event.status}
               </div>
             </div>
             <div className="p-5 flex-1 flex flex-col">
               <h3 className="font-bold text-navy text-lg mb-2">{event.title}</h3>
               <div className="space-y-2 mb-4 text-sm text-gray-600">
                 <div className="flex items-center gap-2"><Calendar size={14} className="text-primary"/> {event.date}</div>
                 <div className="flex items-center gap-2"><Clock size={14} className="text-primary"/> {event.time}</div>
                 <div className="flex items-center gap-2"><MapPin size={14} className="text-primary"/> {event.location}</div>
               </div>
               <div className="mt-auto flex gap-2">
                 <button className="flex-1 py-2 border border-gray-200 rounded text-sm font-medium hover:bg-gray-50">Düzenle</button>
                 <button className="flex-1 py-2 border border-gray-200 rounded text-sm font-medium text-red-600 hover:bg-red-50">Sil</button>
               </div>
             </div>
          </div>
        ))}
      </div>

      {/* Side Sheet Overlay */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-navy/30 backdrop-blur-sm" onClick={() => setIsSheetOpen(false)}></div>
          
          {/* Sheet */}
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-slide-in">
             <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-navy">Yeni Etkinlik</h2>
                <button onClick={() => setIsSheetOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Etkinlik Başlığı*</label>
                  <input 
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Örn: Mühendislik Zirvesi"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                    <input 
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      type="date" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Saati</label>
                    <input 
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      type="time" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
                  <input 
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Adres veya Online Link"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white"
                  >
                    <option value="Taslak">Taslak</option>
                    <option value="Yayında">Yayında</option>
                    <option value="İptal">İptal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Etkinlik detayları..."
                  ></textarea>
                </div>
             </form>

             <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50">
                <button 
                  onClick={() => setIsSheetOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-100"
                >
                  İptal
                </button>
                <button 
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 bg-primary text-navy rounded-lg font-bold hover:bg-primary-dark shadow-sm"
                >
                  Etkinliği Kaydet
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;