import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout, AdminLayout } from './components/Layouts';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop';

// Public Pages
import Home from './pages/public/Home';
import Trainings from './pages/public/Trainings';
import TrainingDetail from './pages/public/TrainingDetail';
import PublicEvents from './pages/public/Events';
import EventDetail from './pages/public/EventDetail';
import CertificateVerify from './pages/public/CertificateVerify';
import AboutUs from './pages/public/AboutUs';
import AuthLogin from './pages/public/AuthLogin';
import AuthRegister from './pages/public/AuthRegister';
import Profile from './pages/public/Profile';
import Contact from './pages/public/Contact';
import Volunteer from './pages/public/Volunteer';
import Trainer from './pages/public/Trainer';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Certificates from './pages/admin/Certificates';
import Events from './pages/admin/Events';
import AdminTrainings from './pages/admin/Trainings';
import Notifications from './pages/admin/Notifications';
import Blogs from './pages/admin/Blogs';
import BlogEditor from './pages/admin/BlogEditor';
import HomepageAdmin from './pages/admin/Homepage';

// Public Blog Pages
import PublicBlog from './pages/public/Blog';
import BlogPost from './pages/public/BlogPost';

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/egitimler" element={<PublicLayout><Trainings /></PublicLayout>} />
        <Route path="/egitimler/:id" element={<PublicLayout><TrainingDetail /></PublicLayout>} />
        <Route path="/sertifika-dogrulama" element={<PublicLayout><CertificateVerify /></PublicLayout>} />
        
        {/* Auth Routes */}
        <Route path="/giris" element={<AuthLogin />} />
        <Route path="/uye-ol" element={<AuthRegister />} />
        <Route path="/profil" element={<PublicLayout><Profile /></PublicLayout>} />

        {/* Placeholder for other public links to not 404 */}
        <Route path="/hakkimizda" element={<PublicLayout><AboutUs /></PublicLayout>} />
        <Route path="/etkinlikler" element={<PublicLayout><PublicEvents /></PublicLayout>} />
        <Route path="/etkinlikler/:id" element={<PublicLayout><EventDetail /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><PublicBlog /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
        <Route path="/iletisim" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/gonullu-ol" element={<PublicLayout><Volunteer /></PublicLayout>} />
        <Route path="/egitmen-ol" element={<PublicLayout><Trainer /></PublicLayout>} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />
        
        {/* Admin Routes - Protected */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/sertifikalar" element={<ProtectedRoute><AdminLayout><Certificates /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/etkinlikler" element={<ProtectedRoute><AdminLayout><Events /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/egitimler" element={<ProtectedRoute><AdminLayout><AdminTrainings /></AdminLayout></ProtectedRoute>} />
        
        {/* Admin Blog Routes */}
        <Route path="/admin/bloglar" element={<ProtectedRoute><AdminLayout><Blogs /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/bloglar/yeni" element={<ProtectedRoute><AdminLayout><BlogEditor /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/bloglar/:id" element={<ProtectedRoute><AdminLayout><BlogEditor /></AdminLayout></ProtectedRoute>} />

        {/* Admin Placeholders */}
        <Route path="/admin/uyeler" element={<ProtectedRoute><AdminLayout><div className="p-8 font-bold text-gray-500">Üyeler Yönetimi (Demo)</div></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/ayarlar" element={<ProtectedRoute><AdminLayout><div className="p-8 font-bold text-gray-500">Sistem Ayarları (Demo)</div></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/bildirimler" element={<ProtectedRoute><AdminLayout><Notifications /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/ana-sayfa" element={<ProtectedRoute><AdminLayout><HomepageAdmin /></AdminLayout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;