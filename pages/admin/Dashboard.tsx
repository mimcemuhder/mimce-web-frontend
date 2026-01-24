import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Activity } from '../../types';
import { 
  Users, BookOpen, Calendar, Award, MoreHorizontal, 
  ArrowUpRight, Plus, Mail, ShieldCheck, Clock 
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [kpiData, setKpiData] = useState([
    { label: 'Toplam Üye', value: '0', icon: 'users', change: '+0%' },
    { label: 'Aktif Eğitim', value: '0', icon: 'book', change: '+0' },
    { label: 'Yaklaşan Etkinlik', value: '0', icon: 'calendar' },
    { label: 'Verilen Sertifika', value: '0', icon: 'award', change: '+0' },
  ]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [members, trainings, events, certificates] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('trainings').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('certificates').select('*', { count: 'exact', head: true }),
      ]);

      setKpiData([
        { label: 'Toplam Üye', value: String(members.count || 0), icon: 'users', change: '+0%' },
        { label: 'Aktif Eğitim', value: String(trainings.count || 0), icon: 'book', change: '+0' },
        { label: 'Yaklaşan Etkinlik', value: String(events.count || 0), icon: 'calendar' },
        { label: 'Verilen Sertifika', value: String(certificates.count || 0), icon: 'award', change: '+0' },
      ]);
    };
    fetchData();
  }, []);

  // Icon mapping
  const getIcon = (name: string) => {
    switch(name) {
      case 'users': return <Users size={24} />;
      case 'book': return <BookOpen size={24} />;
      case 'calendar': return <Calendar size={24} />;
      case 'award': return <Award size={24} />;
      default: return <Users size={24} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Genel Bakış</h1>
        <span className="text-sm text-gray-500">Son güncelleme: Bugün 14:30</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-36">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
                <h3 className="text-3xl font-bold text-navy mt-1">{kpi.value}</h3>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg text-primary-dark">
                {getIcon(kpi.icon)}
              </div>
            </div>
            {kpi.change && (
              <div className="flex items-center text-xs font-semibold text-green-600">
                <ArrowUpRight size={14} className="mr-1" />
                {kpi.change} <span className="text-gray-400 font-normal ml-1">geçen aya göre</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Son Aktiviteler</h3>
            <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20} /></button>
          </div>
          <div className="space-y-6">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={`mt-1 min-w-[32px] h-8 rounded-full flex items-center justify-center border-2 
                  ${activity.type === 'success' ? 'border-green-100 bg-green-50 text-green-600' : 
                    activity.type === 'warning' ? 'border-red-100 bg-red-50 text-red-600' : 
                    'border-blue-100 bg-blue-50 text-blue-600'}`}>
                   {activity.type === 'success' ? <ShieldCheck size={14} /> : activity.type === 'warning' ? <ShieldCheck size={14} /> : <Clock size={14} />}
                </div>
                <div className="flex-1">
                   <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                   <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="space-y-6">
           {/* Quick Actions */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h3 className="font-bold text-gray-900 text-lg mb-4">Hızlı İşlemler</h3>
             <div className="space-y-3">
               <Link to="/admin/egitimler" className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary hover:bg-teal-50 transition-colors text-left group">
                 <div className="w-10 h-10 rounded bg-navy text-white flex items-center justify-center group-hover:bg-primary group-hover:text-navy transition-colors">
                   <BookOpen size={20} />
                 </div>
                 <div>
                   <span className="block text-sm font-bold text-gray-800">Yeni Eğitim Ekle</span>
                   <span className="block text-xs text-gray-500">Müfredat oluştur</span>
                 </div>
               </Link>

               <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary hover:bg-teal-50 transition-colors text-left group">
                 <div className="w-10 h-10 rounded bg-navy text-white flex items-center justify-center group-hover:bg-primary group-hover:text-navy transition-colors">
                   <Award size={20} />
                 </div>
                 <div>
                   <span className="block text-sm font-bold text-gray-800">Sertifika Oluştur</span>
                   <span className="block text-xs text-gray-500">Toplu gönderim yap</span>
                 </div>
               </button>

               <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary hover:bg-teal-50 transition-colors text-left group">
                 <div className="w-10 h-10 rounded bg-navy text-white flex items-center justify-center group-hover:bg-primary group-hover:text-navy transition-colors">
                   <Mail size={20} />
                 </div>
                 <div>
                   <span className="block text-sm font-bold text-gray-800">Gönüllülere E-posta</span>
                   <span className="block text-xs text-gray-500">Duyuru yayınla</span>
                 </div>
               </button>
             </div>
           </div>
           
           {/* System Status */}
           <div className="bg-navy rounded-xl p-5 text-white">
              <h4 className="text-sm font-bold text-primary mb-2">Sistem Durumu</h4>
              <p className="text-xs text-gray-300">Tüm servisler çalışıyor. Son yedekleme: 03:00.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;