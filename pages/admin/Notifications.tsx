import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  notificationService,
  type AdminNotification,
  type NotificationFilters,
  type NotificationStats,
} from '../../services/adminNotifications';
import {
  Bell,
  Plus,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  X,
  Send,
  MailOpen,
} from 'lucide-react';

// ─── Tipler ────────────────────────────────────────────────────────────────
type TypeFilter = AdminNotification['type'] | 'all';
type ReadFilter = 'all' | 'unread' | 'read';

const TYPE_LABELS: Record<TypeFilter, string> = {
  all: 'Tümü',
  info: 'Bilgi',
  success: 'Başarı',
  warning: 'Uyarı',
  error: 'Hata',
};

const TYPE_COLORS: Record<AdminNotification['type'], string> = {
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  error: 'bg-red-100 text-red-700 border-red-200',
};

const TYPE_DOT: Record<AdminNotification['type'], string> = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

const NotifTypeIcon: React.FC<{ type: AdminNotification['type']; size?: number }> = ({
  type,
  size = 16,
}) => {
  if (type === 'success') return <CheckCircle size={size} className="text-green-600" />;
  if (type === 'warning') return <AlertTriangle size={size} className="text-yellow-600" />;
  if (type === 'error') return <XCircle size={size} className="text-red-600" />;
  return <Info size={size} className="text-blue-600" />;
};

// ─── Yeni Bildirim Formu ───────────────────────────────────────────────────
interface NewNotifModalProps {
  onClose: () => void;
  onCreated: () => void;
}
const NewNotifModal: React.FC<NewNotifModalProps> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info' as AdminNotification['type'],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await notificationService.create(form);
      onCreated();
      onClose();
    } catch {
      setError('Bildirim oluşturulamadı. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Yeni Bildirim</h2>
              <p className="text-xs text-gray-500">Giriş yapık tüm adminlere anlık iletilir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              <AlertTriangle size={15} className="shrink-0" /> {error}
            </div>
          )}

          {/* Tip seçici */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Bildirim Tipi</label>
            <div className="grid grid-cols-4 gap-2">
              {(['info', 'success', 'warning', 'error'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    form.type === t
                      ? `${TYPE_COLORS[t]} border-current`
                      : 'border-gray-200 hover:border-gray-300 text-gray-500'
                  }`}
                >
                  <NotifTypeIcon type={t} size={18} />
                  <span className="text-xs font-medium">{TYPE_LABELS[t]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Bildirim başlığı..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.title.length}/100</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mesaj</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Bildirim içeriği..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/500</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-navy text-white text-sm font-bold rounded-lg hover:bg-navy/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
              {loading ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Ana Sayfa ─────────────────────────────────────────────────────────────
const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filtreler
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  // Seçim
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Modal
  const [showNewModal, setShowNewModal] = useState(false);

  // Realtime
  const realtimeRef = useRef<boolean>(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(
    async (resetPage = false) => {
      const currentPage = resetPage ? 1 : page;
      if (resetPage) setPage(1);
      setLoading(true);
      try {
        const filters: NotificationFilters = {
          type: typeFilter,
          isRead: readFilter === 'all' ? 'all' : readFilter === 'read',
          search,
          page: currentPage,
          limit: LIMIT,
          sort,
        };
        const [result, statsData] = await Promise.all([
          notificationService.getPaginated(filters),
          notificationService.getStats(),
        ]);
        setNotifications(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setStats(statsData);
        setSelected(new Set());
      } catch {
        // tablo yoksa boş
      } finally {
        setLoading(false);
      }
    },
    [typeFilter, readFilter, search, page, sort]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime
  useEffect(() => {
    if (realtimeRef.current) return;
    realtimeRef.current = true;
    const channel = notificationService.subscribe(() => fetchData());
    return () => {
      channel.unsubscribe();
      realtimeRef.current = false;
    };
  }, [fetchData]);

  // Arama debounce
  const handleSearchChange = (v: string) => {
    setSearchInput(v);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearch(v);
      setPage(1);
    }, 350);
  };

  // ── Seçim işlemleri ──────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === notifications.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(notifications.map((n) => n.id)));
    }
  };

  // ── Toplu işlemler ───────────────────────────────────────────────────────
  const handleBulkRead = async () => {
    if (!selected.size) return;
    setBulkLoading(true);
    await notificationService.markManyRead([...selected]);
    await fetchData();
    setBulkLoading(false);
  };

  const handleBulkDelete = async () => {
    if (!selected.size) return;
    if (!window.confirm(`${selected.size} bildirimi silmek istediğinize emin misiniz?`)) return;
    setBulkLoading(true);
    await notificationService.deleteMany([...selected]);
    await fetchData();
    setBulkLoading(false);
  };

  const handleMarkAllRead = async () => {
    setBulkLoading(true);
    await notificationService.markAllRead();
    await fetchData();
    setBulkLoading(false);
  };

  const handleDeleteAllRead = async () => {
    if (!window.confirm('Tüm okunmuş bildirimleri silmek istediğinize emin misiniz?')) return;
    setBulkLoading(true);
    await notificationService.deleteAllRead();
    await fetchData();
    setBulkLoading(false);
  };

  const handleMarkOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    if (stats) setStats({ ...stats, unread: Math.max(0, stats.unread - 1) });
  };

  const handleDeleteOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.deleteNotification(id);
    await fetchData();
  };

  const allSelected = notifications.length > 0 && selected.size === notifications.length;
  const someSelected = selected.size > 0 && selected.size < notifications.length;

  return (
    <div className="space-y-6">
      {/* ── Başlık ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Bell size={24} className="text-primary" />
            Bildirimler
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tüm admin bildirimleri — gerçek zamanlı güncellenir
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-navy text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-navy/90 transition-colors shadow-sm"
        >
          <Plus size={18} /> Yeni Bildirim
        </button>
      </div>

      {/* ── İstatistik kartları ─────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              label: 'Toplam',
              value: stats.total,
              color: 'bg-gray-50 border-gray-200',
              textColor: 'text-gray-700',
              dot: 'bg-gray-400',
            },
            {
              label: 'Okunmamış',
              value: stats.unread,
              color: 'bg-red-50 border-red-200',
              textColor: 'text-red-700',
              dot: 'bg-red-500',
            },
            {
              label: 'Bilgi',
              value: stats.info,
              color: 'bg-blue-50 border-blue-200',
              textColor: 'text-blue-700',
              dot: 'bg-blue-500',
            },
            {
              label: 'Başarı',
              value: stats.success,
              color: 'bg-green-50 border-green-200',
              textColor: 'text-green-700',
              dot: 'bg-green-500',
            },
            {
              label: 'Uyarı',
              value: stats.warning,
              color: 'bg-yellow-50 border-yellow-200',
              textColor: 'text-yellow-700',
              dot: 'bg-yellow-500',
            },
            {
              label: 'Hata',
              value: stats.error,
              color: 'bg-red-50 border-red-200',
              textColor: 'text-red-700',
              dot: 'bg-red-500',
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.color} border rounded-xl p-4 flex items-center gap-3`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`} />
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-xl font-bold ${s.textColor}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filtre & Araç çubuğu ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Arama */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Başlık veya mesajda ara..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Tip filtresi */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['all', 'info', 'success', 'warning', 'error'] as TypeFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  typeFilter === t
                    ? 'bg-white shadow-sm text-navy'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-1">
                  {t !== 'all' && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${TYPE_DOT[t as AdminNotification['type']]}`}
                    />
                  )}
                  {TYPE_LABELS[t]}
                </span>
              </button>
            ))}
          </div>

          {/* Okunma filtresi */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(
              [
                ['all', 'Tümü'],
                ['unread', 'Okunmamış'],
                ['read', 'Okunmuş'],
              ] as [ReadFilter, string][]
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => {
                  setReadFilter(val);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${readFilter === val ? 'bg-white shadow-sm text-navy' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sıralama */}
          <button
            onClick={() => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            title={sort === 'newest' ? 'En yeni önce' : 'En eski önce'}
          >
            {sort === 'newest' ? <SortDesc size={15} /> : <SortAsc size={15} />}
            {sort === 'newest' ? 'En Yeni' : 'En Eski'}
          </button>

          {/* Yenile */}
          <button
            onClick={() => fetchData(true)}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Toplu eylemler */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={14} />
            <span>{total} bildirim</span>
            {selected.size > 0 && (
              <span className="px-2 py-0.5 bg-primary/20 text-navy rounded-full font-semibold text-xs">
                {selected.size} seçili
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selected.size > 0 ? (
              <>
                <button
                  onClick={handleBulkRead}
                  disabled={bulkLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <MailOpen size={13} /> Okundu işaretle
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} /> Sil
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2"
                >
                  Seçimi kaldır
                </button>
              </>
            ) : (
              <>
                {(stats?.unread ?? 0) > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={bulkLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <CheckCheck size={13} /> Tümünü okundu işaretle
                  </button>
                )}
                <button
                  onClick={handleDeleteAllRead}
                  disabled={bulkLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-500 text-xs rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} /> Okunanları temizle
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Bildirim listesi ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Liste başlığı */}
        <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
          </label>
          <span className="flex-1">Başlık / Mesaj</span>
          <span className="w-20 text-center hidden sm:block">Tip</span>
          <span className="w-24 text-center hidden md:block">Durum</span>
          <span className="w-36 hidden lg:block">Tarih</span>
          <span className="w-16 text-right">İşlem</span>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <RefreshCw size={28} className="animate-spin text-primary" />
            <p className="text-sm">Yükleniyor...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-4 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Bell size={28} className="text-gray-300" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-500">Bildirim bulunamadı</p>
              <p className="text-sm mt-1">
                {search || typeFilter !== 'all' || readFilter !== 'all'
                  ? 'Filtreleri temizleyerek tüm bildirimleri görün'
                  : 'Henüz bildirim oluşturulmamış'}
              </p>
            </div>
            {(search || typeFilter !== 'all' || readFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSearchInput('');
                  setTypeFilter('all');
                  setReadFilter('all');
                }}
                className="text-sm text-primary hover:underline"
              >
                Filtreleri temizle
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => toggleSelect(n.id)}
                className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors
                  ${selected.has(n.id) ? 'bg-primary/5 border-l-4 border-primary' : !n.is_read ? 'bg-blue-50/30 border-l-4 border-blue-400' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
              >
                {/* Checkbox */}
                <label className="mt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(n.id)}
                    onChange={() => toggleSelect(n.id)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </label>

                {/* İkon */}
                <div
                  className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLORS[n.type]}`}
                >
                  <NotifTypeIcon type={n.type} size={16} />
                </div>

                {/* İçerik */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`text-sm text-gray-900 truncate ${!n.is_read ? 'font-bold' : 'font-medium'}`}
                    >
                      {n.title}
                    </p>
                    {!n.is_read && <span className="shrink-0 w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {n.created_by && (
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <User size={10} /> {n.created_by}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock size={10} />
                      {new Date(n.created_at).toLocaleString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Tip badge (sm+) */}
                <div className="hidden sm:flex w-20 justify-center shrink-0">
                  <span
                    className={`px-2 py-1 rounded-full text-[11px] font-semibold border ${TYPE_COLORS[n.type]}`}
                  >
                    {TYPE_LABELS[n.type]}
                  </span>
                </div>

                {/* Durum (md+) */}
                <div className="hidden md:flex w-24 justify-center shrink-0">
                  <span
                    className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                      n.is_read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {n.is_read ? 'Okundu' : 'Okunmadı'}
                  </span>
                </div>

                {/* Tarih (lg+) */}
                <div className="hidden lg:block w-36 text-xs text-gray-400 shrink-0">
                  {new Date(n.created_at).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                  <br />
                  {new Date(n.created_at).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>

                {/* Aksiyon butonları */}
                <div
                  className="flex items-center gap-1 shrink-0 w-16 justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!n.is_read && (
                    <button
                      onClick={(e) => handleMarkOne(n.id, e)}
                      title="Okundu işaretle"
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <MailOpen size={14} />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteOne(n.id, e)}
                    title="Sil"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} / {total} bildirim
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} /> Önceki
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 5) {
                    p = i + 1;
                  } else if (page <= 3) {
                    p = i + 1;
                  } else if (page >= totalPages - 2) {
                    p = totalPages - 4 + i;
                  } else {
                    p = page - 2 + i;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === p ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sonraki <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Yeni bildirim modali */}
      {showNewModal && (
        <NewNotifModal onClose={() => setShowNewModal(false)} onCreated={() => fetchData(true)} />
      )}
    </div>
  );
};

export default Notifications;
