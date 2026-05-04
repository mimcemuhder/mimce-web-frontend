import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin';
import { checkSystemStatus, type SystemStatus } from '../../services/systemStatus';
import { notificationService, type AdminNotification } from '../../services/adminNotifications';
import {
  Users, BookOpen, Calendar, Award, ArrowUpRight, Mail,
  CheckCircle, AlertTriangle, XCircle, RefreshCw, Wifi,
  Info, Clock, Bell
} from 'lucide-react';

// ─── Sistem durumu badge ───────────────────────────────────────────────────
const StatusDot: React.FC<{ status: SystemStatus['overall'] }> = ({ status }) => {
  if (status === 'online')   return <CheckCircle size={14} className="text-green-400 shrink-0" />;
  if (status === 'degraded') return <AlertTriangle size={14} className="text-yellow-400 shrink-0" />;
  return <XCircle size={14} className="text-red-400 shrink-0" />;
};

const ServiceBadge: React.FC<{ name: string; status: string; latencyMs?: number }> = ({ name, status, latencyMs }) => {
  const color = status === 'online' ? 'text-green-400' : status === 'degraded' ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-300">{name}</span>
      <div className="flex items-center gap-1.5">
        {latencyMs !== undefined && <span className="text-[10px] text-gray-500">{latencyMs}ms</span>}
        <span className={`text-[10px] font-semibold uppercase ${color}`}>{status === 'online' ? 'Çalışıyor' : status === 'degraded' ? 'Kısmi' : 'Çevrimdışı'}</span>
      </div>
    </div>
  );
};

// ─── Aktivite ikonu ────────────────────────────────────────────────────────
const ActivityIcon: React.FC<{ type: AdminNotification['type'] }> = ({ type }) => {
  if (type === 'success') return <CheckCircle size={14} className="text-green-600" />;
  if (type === 'warning') return <AlertTriangle size={14} className="text-yellow-600" />;
  if (type === 'error')   return <XCircle size={14} className="text-red-600" />;
  return <Info size={14} className="text-blue-600" />;
};

const activityBg = (type: AdminNotification['type']) => {
  if (type === 'success') return 'border-green-100 bg-green-50';
  if (type === 'warning') return 'border-yellow-100 bg-yellow-50';
  if (type === 'error')   return 'border-red-100 bg-red-50';
  return 'border-blue-100 bg-blue-50';
};

// ─── Dashboard ────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [kpiData, setKpiData] = useState([
    { label: 'Toplam Üye', value: '—', icon: 'users', change: '' },
    { label: 'Aktif Eğitim', value: '—', icon: 'book', change: '' },
    { label: 'Yaklaşan Etkinlik', value: '—', icon: 'calendar', change: '' },
    { label: 'Verilen Sertifika', value: '—', icon: 'award', change: '' },
  ]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [statusChecking, setStatusChecking] = useState(false);

  const [activities, setActivities] = useState<AdminNotification[]>([]);

  const getIcon = (name: string) => {
    switch (name) {
      case 'users':    return <Users size={24} />;
      case 'book':     return <BookOpen size={24} />;
      case 'calendar': return <Calendar size={24} />;
      case 'award':    return <Award size={24} />;
      default:         return <Users size={24} />;
    }
  };

  const fetchKPIs = useCallback(async () => {
    const [members, trainings, events, certs] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }),
      supabase.from('trainings').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('certificates').select('*', { count: 'exact', head: true }),
    ]);
    setKpiData([
      { label: 'Toplam Üye', value: String(members.count ?? 0), icon: 'users', change: '' },
      { label: 'Aktif Eğitim', value: String(trainings.count ?? 0), icon: 'book', change: '' },
      { label: 'Yaklaşan Etkinlik', value: String(events.count ?? 0), icon: 'calendar', change: '' },
      { label: 'Verilen Sertifika', value: String(certs.count ?? 0), icon: 'award', change: '' },
    ]);
    setLastUpdated(new Date());
  }, []);

  const fetchSystemStatus = useCallback(async () => {
    setStatusChecking(true);
    try {
      const status = await checkSystemStatus();
      setSystemStatus(status);
    } finally {
      setStatusChecking(false);
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      const data = await notificationService.getAll();
      setActivities(data.slice(0, 8));
    } catch {
      // tablo yoksa boş bırak
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
    fetchSystemStatus();
    fetchActivities();

    // Sistem durumu her 30 saniyede yenilenir
    const statusInterval = setInterval(fetchSystemStatus, 30_000);
    // KPI'lar her 60 saniyede yenilenir
    const kpiInterval = setInterval(fetchKPIs, 60_000);

    // Bildirimler realtime
    const channel = notificationService.subscribe(fetchActivities);

    return () => {
      clearInterval(statusInterval);
      clearInterval(kpiInterval);
      channel.unsubscribe();
    };
  }, [fetchKPIs, fetchSystemStatus, fetchActivities]);

  const overallLabel = systemStatus
    ? systemStatus.overall === 'online' ? 'Tüm servisler çalışıyor' : systemStatus.overall === 'degraded' ? 'Kısmi sorun var' : 'Servis kesintisi'
    : 'Kontrol ediliyor...';

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Genel Bakış</h1>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock size={13} />
              Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => { fetchKPIs(); fetchSystemStatus(); fetchActivities(); }}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors"
          >
            <RefreshCw size={13} className={statusChecking ? 'animate-spin' : ''} />
            Yenile
          </button>
        </div>
      </div>

      {/* KPI Kartları */}
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
        {/* Son Aktiviteler (bildirimler) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Bell size={18} className="text-primary" />
              Son Bildirimler
            </h3>
            <Link to="/admin/bildirimler" className="text-xs text-primary hover:underline">Tümünü gör</Link>
          </div>
          {activities.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              Henüz bildirim yok.<br />
              <span className="text-xs">Topbar'daki 🔔 butonundan yeni bildirim oluşturun.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 min-w-[28px] h-7 rounded-full flex items-center justify-center border-2 ${activityBg(a.type)}`}>
                    <ActivityIcon type={a.type} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.message}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(a.created_at).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {a.created_by && <span>· {a.created_by}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sağ kolon */}
        <div className="space-y-6">
          {/* Hızlı İşlemler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Hızlı İşlemler</h3>
            <div className="space-y-3">
              <Link
                to="/admin/egitimler"
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary hover:bg-teal-50 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded bg-navy text-white flex items-center justify-center group-hover:bg-primary group-hover:text-navy transition-colors">
                  <BookOpen size={20} />
                </div>
                <div>
                  <span className="block text-sm font-bold text-gray-800">Yeni Eğitim Ekle</span>
                  <span className="block text-xs text-gray-500">Müfredat oluştur</span>
                </div>
              </Link>

              <Link
                to="/admin/sertifikalar"
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary hover:bg-teal-50 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded bg-navy text-white flex items-center justify-center group-hover:bg-primary group-hover:text-navy transition-colors">
                  <Award size={20} />
                </div>
                <div>
                  <span className="block text-sm font-bold text-gray-800">Sertifika Oluştur</span>
                  <span className="block text-xs text-gray-500">Toplu gönderim yap</span>
                </div>
              </Link>

              <a
                href="mailto:?subject=MİMCE%20Duyurusu&body=Merhaba%2C"
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary hover:bg-teal-50 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded bg-navy text-white flex items-center justify-center group-hover:bg-primary group-hover:text-navy transition-colors">
                  <Mail size={20} />
                </div>
                <div>
                  <span className="block text-sm font-bold text-gray-800">Gönüllülere E-posta</span>
                  <span className="block text-xs text-gray-500">Duyuru yayınla</span>
                </div>
              </a>
            </div>
          </div>

          {/* Sistem Durumu */}
          <div className="bg-navy rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                <Wifi size={14} /> Sistem Durumu
              </h4>
              <button
                onClick={fetchSystemStatus}
                disabled={statusChecking}
                className="text-gray-400 hover:text-white transition-colors"
                title="Yenile"
              >
                <RefreshCw size={12} className={statusChecking ? 'animate-spin' : ''} />
              </button>
            </div>

            {systemStatus ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <StatusDot status={systemStatus.overall} />
                  <p className="text-xs text-gray-200 font-medium">{overallLabel}</p>
                </div>
                <div className="divide-y divide-gray-700">
                  {systemStatus.services.map(s => (
                    <ServiceBadge key={s.name} name={s.name} status={s.status} latencyMs={s.latencyMs} />
                  ))}
                </div>
                <p className="text-[10px] text-gray-600 mt-3">
                  Son kontrol: {systemStatus.lastChecked.toLocaleTimeString('tr-TR')}
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-400">Kontrol ediliyor...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
