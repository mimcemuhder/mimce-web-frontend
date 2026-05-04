import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout, AdminLayout } from './components/Layouts';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import Trainings from './pages/public/Trainings';
import CertificateVerify from './pages/public/CertificateVerify';
import AboutUs from './pages/public/AboutUs';
import AuthLogin from './pages/public/AuthLogin';
import AuthRegister from './pages/public/AuthRegister';
import Profile from './pages/public/Profile';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Certificates from './pages/admin/Certificates';
import Events from './pages/admin/Events';
import AdminTrainings from './pages/admin/Trainings';
import Notifications from './pages/admin/Notifications';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/egitimler" element={<PublicLayout><Trainings /></PublicLayout>} />
        <Route path="/sertifika-dogrulama" element={<PublicLayout><CertificateVerify /></PublicLayout>} />
        
        {/* Auth Routes */}
        <Route path="/giris" element={<AuthLogin />} />
        <Route path="/uye-ol" element={<AuthRegister />} />
        <Route path="/profil" element={<PublicLayout><Profile /></PublicLayout>} />

        {/* Placeholder for other public links to not 404 */}
        <Route path="/hakkimizda" element={<PublicLayout><AboutUs /></PublicLayout>} />
        <Route path="/etkinlikler" element={<PublicLayout><div className="p-20 text-center">Etkinlikler Listesi (Yapım Aşamasında)</div></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><div className="p-20 text-center">Blog (Yapım Aşamasında)</div></PublicLayout>} />
        <Route path="/iletisim" element={<PublicLayout><div className="p-20 text-center">İletişim (Yapım Aşamasında)</div></PublicLayout>} />
        <Route path="/gonullu-ol" element={<PublicLayout><div className="p-20 text-center">Gönüllü Ol Formu (Yapım Aşamasında)</div></PublicLayout>} />
        <Route path="/egitmen-ol" element={<PublicLayout><div className="p-20 text-center">Eğitmen Ol Formu (Yapım Aşamasında)</div></PublicLayout>} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />
        
        {/* Admin Routes - Protected */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/sertifikalar" element={<ProtectedRoute><AdminLayout><Certificates /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/etkinlikler" element={<ProtectedRoute><AdminLayout><Events /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/egitimler" element={<ProtectedRoute><AdminLayout><AdminTrainings /></AdminLayout></ProtectedRoute>} />
        
        {/* Admin Placeholders */}
        <Route path="/admin/uyeler" element={<ProtectedRoute><AdminLayout><div className="p-8 font-bold text-gray-500">Üyeler Yönetimi (Demo)</div></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/ayarlar" element={<ProtectedRoute><AdminLayout><div className="p-8 font-bold text-gray-500">Sistem Ayarları (Demo)</div></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/bildirimler" element={<ProtectedRoute><AdminLayout><Notifications /></AdminLayout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;