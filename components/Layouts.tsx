import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';
import { 
  Menu, X, Home, Users, BookOpen, Calendar, Award, Settings, 
  Search, Bell, HelpCircle, LogOut, Facebook, Twitter, Linkedin, Instagram,
  UserCircle, ChevronDown
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

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };
  
  const menuItems = [
    { path: '/admin', icon: Home, label: 'Gösterge Paneli' },
    { path: '/admin/uyeler', icon: Users, label: 'Üyeler' },
    { path: '/admin/egitimler', icon: BookOpen, label: 'Eğitimler' },
    { path: '/admin/etkinlikler', icon: Calendar, label: 'Etkinlikler' },
    { path: '/admin/sertifikalar', icon: Award, label: 'Sertifikalar' },
    { path: '/admin/ayarlar', icon: Settings, label: 'Ayarlar' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-navy flex flex-col text-gray-300">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/mimce_admin_logo.svg" 
              alt="MİMCE Admin Logo" 
              className="h-8"
            />
            <span className="text-white/40 text-xs font-semibold tracking-wider uppercase">
              ADMIN
            </span>
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
                {item.label}
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
           <div className="flex-1 max-w-lg">
             <div className="relative">
               <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search size={18} className="text-gray-400" />
               </span>
               <input 
                 type="text" 
                 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                 placeholder="Üye, eğitim, etkinlik ara..."
               />
             </div>
           </div>
           <div className="flex items-center gap-4 ml-4">
             <button className="p-2 text-gray-400 hover:text-gray-500 relative">
               <Bell size={20} />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
             <button className="p-2 text-gray-400 hover:text-gray-500">
               <HelpCircle size={20} />
             </button>
             <Link to="/" className="p-2 text-gray-400 hover:text-navy" title="Siteye Dön">
               <Home size={20} />
             </Link>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};