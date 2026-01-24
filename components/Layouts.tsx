import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Home, Users, BookOpen, Calendar, Award, Settings, 
  Search, Bell, HelpCircle, LogOut, Facebook, Twitter, Linkedin, Instagram
} from 'lucide-react';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/mimce_logo.png" alt="MIMCE Logo" className="h-10" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-600">
            <Link to="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
            <Link to="/hakkimizda" className="hover:text-primary transition-colors">Hakkımızda</Link>
            <Link to="/egitimler" className="hover:text-primary transition-colors">Eğitimler</Link>
            <Link to="/etkinlikler" className="hover:text-primary transition-colors">Etkinlikler</Link>
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <Link to="/iletisim" className="hover:text-primary transition-colors">İletişim</Link>
          </nav>

          {/* Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-navy">Giriş Yap</Link>
            <Link to="/join" className="px-5 py-2.5 bg-primary text-navy text-sm font-bold rounded hover:bg-primary-dark transition-colors">
              Katıl
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4 shadow-lg">
            <Link to="/" className="text-gray-700 font-medium">Ana Sayfa</Link>
            <Link to="/egitimler" className="text-gray-700 font-medium">Eğitimler</Link>
            <Link to="/etkinlikler" className="text-gray-700 font-medium">Etkinlikler</Link>
            <Link to="/admin" className="text-primary font-bold">Admin Demo</Link>
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
                <img src="/mimce_logo.png" alt="MIMCE Logo" className="h-8 brightness-0 invert" />
             </div>
             <p className="max-w-sm text-sm leading-relaxed">
               MIMCE, mühendislik öğrencileri ve profesyonelleri eğitimler ve etkinliklerle buluşturur.
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
          © 2024 MIMCE. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
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
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <img src="/mimce_logo.png" alt="MIMCE Logo" className="h-8 brightness-0 invert" />
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
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-navy font-bold">SA</div>
             <div className="overflow-hidden">
               <p className="text-sm text-white font-medium truncate">Süper Admin</p>
               <p className="text-xs text-gray-500 truncate">admin@mimce.org</p>
             </div>
          </div>
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
               <LogOut size={20} />
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