import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { supabaseAdmin } from '../services/supabaseAdmin';
import { notificationService, type AdminNotification } from '../services/adminNotifications';
import { adminSession } from '../services/adminSession';
import type { User } from '@supabase/supabase-js';
import { 
  Menu, X, Home, Users, BookOpen, Calendar, Award, Settings, 
  Search, Bell, HelpCircle, LogOut, Facebook, Twitter, Linkedin, Instagram,
  UserCircle, ChevronDown, CheckCheck, Trash2, Plus, Info, AlertTriangle,
  CheckCircle, XCircle, Keyboard, ExternalLink, Clock
} from 'lucide-react';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trainingsDropdownOpen, setTrainingsDropdownOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfileMenuOpen(false);
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/mimce_logo.svg" alt="MİMCE Logo" className="h-10" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-600">
            <Link to="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
            <Link to="/hakkimizda" className="hover:text-primary transition-colors">Hakkımızda</Link>
            <div 
              className="relative"
              onMouseEnter={() => setTrainingsDropdownOpen(true)}
              onMouseLeave={() => setTrainingsDropdownOpen(false)}
            >
              <Link to="/egitimler" className="hover:text-primary transition-colors">Eğitimler</Link>
              {trainingsDropdownOpen && (
                <div className="absolute top-full left-0 pt-2 bg-transparent z-50 min-w-[180px]">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    <Link 
                      to="/sertifika-dogrulama"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      Sertifika
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link to="/etkinlikler" className="hover:text-primary transition-colors">Etkinlikler</Link>
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <Link to="/iletisim" className="hover:text-primary transition-colors">İletişim</Link>
          </nav>

          {/* Auth Area */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-navy font-bold text-sm">
                      {initials}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profil"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <UserCircle size={18} className="text-gray-400" />
                        Profilim
                      </Link>
                      <Link
                        to="/profil"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings size={18} className="text-gray-400" />
                        Hesap Ayarları
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/giris" className="text-sm font-semibold text-gray-700 hover:text-navy">Giriş Yap</Link>
                <Link to="/uye-ol" className="px-5 py-2.5 bg-primary text-navy text-sm font-bold rounded hover:bg-primary-dark transition-colors">
                  Üye Ol
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4 shadow-lg">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 font-medium">Ana Sayfa</Link>
            <Link to="/hakkimizda" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 font-medium">Hakkımızda</Link>
            <Link to="/egitimler" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 font-medium">Eğitimler</Link>
            <Link to="/etkinlikler" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 font-medium">Etkinlikler</Link>
            <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 font-medium">Blog</Link>
            <Link to="/iletisim" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 font-medium">İletişim</Link>
            <div className="border-t border-gray-200 pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 pb-2">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-navy font-bold text-sm">
                        {initials}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/profil" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-700 font-medium">
                    <UserCircle size={18} /> Profilim
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-red-600 font-medium">
                    <LogOut size={18} /> Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <Link to="/giris" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg">Giriş Yap</Link>
                  <Link to="/uye-ol" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 text-sm font-bold bg-primary text-navy rounded-lg">Üye Ol</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-navy text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-2 space-y-6">
             <div className="flex items-center">
                <img src="/mimce_logo.svg" alt="MİMCE Logo" className="h-8 brightness-0 invert" />
             </div>
             <p className="max-w-sm text-sm leading-relaxed">
               MİMCE, mühendislik öğrencileri ve profesyonelleri eğitimler ve etkinliklerle buluşturur.
             </p>
             <div className="flex gap-4">
                <Facebook size={20} className="hover:text-primary cursor-pointer"/>
                <Twitter size={20} className="hover:text-primary cursor-pointer"/>
                <Linkedin size={20} className="hover:text-primary cursor-pointer"/>
                <Instagram size={20} className="hover:text-primary cursor-pointer"/>
             </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide text-sm">KEŞFET</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/egitimler" className="hover:text-primary">Eğitimler</Link></li>
              <li><Link to="/etkinlikler" className="hover:text-primary">Etkinlikler</Link></li>
              <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
              <li><Link to="/gonullu-ol" className="hover:text-primary">Gönüllü Ol</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide text-sm">DESTEK</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/iletisim" className="hover:text-primary">İletişim</Link></li>
              <li><Link to="#" className="hover:text-primary">Gizlilik Politikası</Link></li>
              <li><Link to="#" className="hover:text-primary">Kullanım Şartları</Link></li>
              <li><Link to="/admin" className="hover:text-primary text-primary">Admin Portal</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-800 text-xs text-center md:text-left">
          © 2026 MİMCE. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
};

// ─── Bildirim tipi ikonları ──────────────────────────────────────────────────
const NotifIcon: React.FC<{ type: AdminNotification['type']; size?: number }> = ({ type, size = 16 }) => {
  if (type === 'success') return <CheckCircle size={size} className="text-green-500" />;
  if (type === 'warning') return <AlertTriangle size={size} className="text-yellow-500" />;
  if (type === 'error')   return <XCircle size={size} className="text-red-500" />;
  return <Info size={size} className="text-blue-500" />;
};

// ─── AdminLayout ──────────────────────────────────────────────────────────────
export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // ── Bildirimler ──────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [newNotifOpen, setNewNotifOpen] = useState(false);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'info' as AdminNotification['type'] });
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // ── Yardım modali ────────────────────────────────────────────────────────
  const [helpOpen, setHelpOpen] = useState(false);

  // ── Arama ───────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ label: string; path: string; type: string }[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch {
      // tablo henüz oluşturulmamışsa sessizce geç
    }
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabaseAdmin.auth.getUser();
      setUser(user);
    };
    getUser();
    loadNotifications();

    const channel = notificationService.subscribe(loadNotifications);
    return () => { channel.unsubscribe(); };
  }, [loadNotifications]);

  // Bildirim paneli dışına tıklayınca kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
        setNewNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Arama dışına tıklayınca kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    adminSession.clear();
    await supabaseAdmin.auth.signOut();
    navigate('/admin/login');
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    await loadNotifications();
  };

  const handleMarkRead = async (id: string) => {
    await notificationService.markRead(id);
    await loadNotifications();
  };

  const handleDeleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.deleteNotification(id);
    await loadNotifications();
  };

  const handleCreateNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifForm.title.trim() || !notifForm.message.trim()) return;
    setNotifLoading(true);
    try {
      await notificationService.create(notifForm);
      setNotifForm({ title: '', message: '', type: 'info' });
      setNewNotifOpen(false);
      await loadNotifications();
    } finally {
      setNotifLoading(false);
    }
  };

  // Arama: trainings + events + certificates
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!value.trim()) { setSearchResults([]); setSearchOpen(false); return; }

    searchDebounce.current = setTimeout(async () => {
      const q = value.toLowerCase();
      const [trainings, events, certs] = await Promise.all([
        supabaseAdmin.from('trainings').select('id, title').ilike('title', `%${q}%`).limit(5),
        supabaseAdmin.from('events').select('id, title').ilike('title', `%${q}%`).limit(5),
        supabaseAdmin.from('certificates').select('id, recipient_name, course_name').or(`recipient_name.ilike.%${q}%,course_name.ilike.%${q}%`).limit(5),
      ]);

      const results: { label: string; path: string; type: string }[] = [
        ...(trainings.data || []).map(t => ({ label: t.title, path: '/admin/egitimler', type: 'Eğitim' })),
        ...(events.data || []).map(ev => ({ label: ev.title, path: '/admin/etkinlikler', type: 'Etkinlik' })),
        ...(certs.data || []).map(c => ({ label: `${c.recipient_name} – ${c.course_name}`, path: '/admin/sertifikalar', type: 'Sertifika' })),
      ];
      setSearchResults(results);
      setSearchOpen(results.length > 0);
    }, 300);
  };

  const menuItems = [
    { path: '/admin', icon: Home, label: 'Gösterge Paneli' },
    { path: '/admin/uyeler', icon: Users, label: 'Üyeler' },
    { path: '/admin/egitimler', icon: BookOpen, label: 'Eğitimler' },
    { path: '/admin/etkinlikler', icon: Calendar, label: 'Etkinlikler' },
    { path: '/admin/sertifikalar', icon: Award, label: 'Sertifikalar' },
    { path: '/admin/bildirimler', icon: Bell, label: 'Bildirimler', badge: unreadCount || undefined },
    { path: '/admin/ayarlar', icon: Settings, label: 'Ayarlar' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-navy flex flex-col text-gray-300">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/mimce_admin_logo.svg" alt="MİMCE Admin Logo" className="h-8" />
            <span className="text-white/40 text-xs font-semibold tracking-wider uppercase">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-navy-light text-primary border-l-4 border-primary'
                    : 'hover:bg-navy-light hover:text-white border-l-4 border-transparent'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-primary' : 'text-gray-400'} />
                <span className="flex-1">{item.label}</span>
                {'badge' in item && item.badge ? (
                  <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-navy font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm text-white font-medium truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'Yükleniyor...'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-navy-light rounded-md transition-colors"
          >
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
          {/* Arama */}
          <div className="flex-1 max-w-lg" ref={searchRef}>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Eğitim, etkinlik, sertifika ara..."
              />
              {searchOpen && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-auto">
                  {searchResults.map((r, i) => (
                    <Link
                      key={i}
                      to={r.path}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm text-gray-800 truncate">{r.label}</span>
                      <span className="text-xs text-gray-400 ml-2 shrink-0">{r.type}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {/* Bildirim butonu */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(v => !v); setNewNotifOpen(false); }}
                className="p-2 text-gray-400 hover:text-gray-700 relative rounded-lg hover:bg-gray-100 transition-colors"
                title="Bildirimler"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 flex flex-col max-h-[480px]">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">Bildirimler</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <CheckCheck size={12} /> Tümünü oku
                        </button>
                      )}
                      <button
                        onClick={() => setNewNotifOpen(v => !v)}
                        className="flex items-center gap-1 text-xs bg-primary text-navy font-bold px-2 py-1 rounded-md hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={12} /> Yeni
                      </button>
                    </div>
                  </div>

                  {/* Yeni bildirim formu */}
                  {newNotifOpen && (
                    <form onSubmit={handleCreateNotif} className="border-b border-gray-100 p-4 space-y-3 bg-gray-50">
                      <input
                        type="text"
                        placeholder="Başlık"
                        value={notifForm.title}
                        onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                      <textarea
                        placeholder="Mesaj..."
                        value={notifForm.message}
                        onChange={e => setNotifForm(f => ({ ...f, message: e.target.value }))}
                        rows={2}
                        className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        required
                      />
                      <div className="flex items-center gap-2">
                        <select
                          value={notifForm.type}
                          onChange={e => setNotifForm(f => ({ ...f, type: e.target.value as AdminNotification['type'] }))}
                          className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="info">Bilgi</option>
                          <option value="success">Başarı</option>
                          <option value="warning">Uyarı</option>
                          <option value="error">Hata</option>
                        </select>
                        <button
                          type="submit"
                          disabled={notifLoading}
                          className="px-3 py-1.5 bg-navy text-white text-sm font-semibold rounded-md hover:bg-navy-light transition-colors disabled:opacity-50"
                        >
                          {notifLoading ? '...' : 'Gönder'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Bildirim listesi */}
                  <div className="overflow-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-sm text-gray-400">Bildirim yok</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50/40' : ''}`}
                        >
                          <div className="mt-0.5 shrink-0">
                            <NotifIcon type={n.type} size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium text-gray-900 truncate ${!n.is_read ? 'font-bold' : ''}`}>{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                              <Clock size={10} />
                              {new Date(n.created_at).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              {n.created_by && <span className="ml-1">· {n.created_by}</span>}
                            </div>
                          </div>
                          <button
                            onClick={e => handleDeleteNotif(n.id, e)}
                            className="shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Yardım / Info butonu */}
            <button
              onClick={() => setHelpOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              title="Yardım ve Kısayollar"
            >
              <HelpCircle size={20} />
            </button>

            <Link to="/" className="p-2 text-gray-400 hover:text-navy rounded-lg hover:bg-gray-100 transition-colors" title="Siteye Dön">
              <Home size={20} />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Yardım Modali */}
      {helpOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setHelpOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <HelpCircle size={22} className="text-primary" />
                <h2 className="text-lg font-bold text-gray-900">Yardım & Bilgi</h2>
              </div>
              <button onClick={() => setHelpOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3"><Keyboard size={16} /> Klavye Kısayolları</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { key: '/', desc: 'Aramaya odaklan' },
                    { key: 'Esc', desc: 'Modal / dropdown kapat' },
                    { key: 'Alt + D', desc: 'Gösterge Paneli' },
                    { key: 'Alt + E', desc: 'Eğitimler' },
                    { key: 'Alt + V', desc: 'Etkinlikler' },
                    { key: 'Alt + S', desc: 'Sertifikalar' },
                  ].map(s => (
                    <div key={s.key} className="flex items-center justify-between">
                      <span className="text-gray-600">{s.desc}</span>
                      <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">{s.key}</kbd>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3"><Info size={16} /> Bildirim Sistemi</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Bildirimler Supabase'de saklanır ve tüm admin cihazlarına <strong>gerçek zamanlı</strong> iletilir.
                  "Yeni" butonuyla bildirim oluşturun — giriş yapmış olan tüm adminler anında görür.
                </p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3"><ExternalLink size={16} /> Bağlantılar</h3>
                <div className="space-y-2">
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ExternalLink size={14} /> Supabase Dashboard
                  </a>
                  <a href="https://netlify.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ExternalLink size={14} /> Netlify Panel
                  </a>
                </div>
              </div>

              <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                MİMCE Admin Panel · v1.0 · {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};