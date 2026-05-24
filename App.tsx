import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { PublicLayout, AdminLayout } from './components/Layouts';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';

// Public Pages
const Home = lazy(() => import('./pages/public/Home'));
const Trainings = lazy(() => import('./pages/public/Trainings'));
const TrainingDetail = lazy(() => import('./pages/public/TrainingDetail'));
const PublicEvents = lazy(() => import('./pages/public/Events'));
const EventDetail = lazy(() => import('./pages/public/EventDetail'));
const CertificateVerify = lazy(() => import('./pages/public/CertificateVerify'));
const AboutUs = lazy(() => import('./pages/public/AboutUs'));
const AuthLogin = lazy(() => import('./pages/public/AuthLogin'));
const AuthRegister = lazy(() => import('./pages/public/AuthRegister'));
const Profile = lazy(() => import('./pages/public/Profile'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Volunteer = lazy(() => import('./pages/public/Volunteer'));
const Trainer = lazy(() => import('./pages/public/Trainer'));
const PublicBlog = lazy(() => import('./pages/public/Blog'));
const BlogPost = lazy(() => import('./pages/public/BlogPost'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

// Admin Pages
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Certificates = lazy(() => import('./pages/admin/Certificates'));
const Events = lazy(() => import('./pages/admin/Events'));
const AdminTrainings = lazy(() => import('./pages/admin/Trainings'));
const Notifications = lazy(() => import('./pages/admin/Notifications'));
const Blogs = lazy(() => import('./pages/admin/Blogs'));
const BlogEditor = lazy(() => import('./pages/admin/BlogEditor'));
const HomepageAdmin = lazy(() => import('./pages/admin/Homepage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <ErrorBoundary>
              <ScrollToTop />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route
                    path="/"
                    element={
                      <PublicLayout>
                        <Home />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/egitimler"
                    element={
                      <PublicLayout>
                        <Trainings />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/egitimler/:id"
                    element={
                      <PublicLayout>
                        <TrainingDetail />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/sertifika-dogrulama"
                    element={
                      <PublicLayout>
                        <CertificateVerify />
                      </PublicLayout>
                    }
                  />

                  {/* Auth Routes */}
                  <Route path="/giris" element={<AuthLogin />} />
                  <Route path="/uye-ol" element={<AuthRegister />} />
                  <Route
                    path="/profil"
                    element={
                      <PublicLayout>
                        <Profile />
                      </PublicLayout>
                    }
                  />

                  {/* Other Public Routes */}
                  <Route
                    path="/hakkimizda"
                    element={
                      <PublicLayout>
                        <AboutUs />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/etkinlikler"
                    element={
                      <PublicLayout>
                        <PublicEvents />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/etkinlikler/:id"
                    element={
                      <PublicLayout>
                        <EventDetail />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/blog"
                    element={
                      <PublicLayout>
                        <PublicBlog />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/blog/:slug"
                    element={
                      <PublicLayout>
                        <BlogPost />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/iletisim"
                    element={
                      <PublicLayout>
                        <Contact />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/gonullu-ol"
                    element={
                      <PublicLayout>
                        <Volunteer />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/egitmen-ol"
                    element={
                      <PublicLayout>
                        <Trainer />
                      </PublicLayout>
                    }
                  />

                  {/* Admin Login */}
                  <Route path="/admin/login" element={<Login />} />

                  {/* Admin Routes - Protected */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Dashboard />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/sertifikalar"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Certificates />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/etkinlikler"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Events />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/egitimler"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <AdminTrainings />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Blog Routes */}
                  <Route
                    path="/admin/bloglar"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Blogs />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/bloglar/yeni"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <BlogEditor />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/bloglar/:id"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <BlogEditor />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Placeholders */}
                  <Route
                    path="/admin/uyeler"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <div className="p-8 font-bold text-gray-500">Üyeler Yönetimi (Demo)</div>
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/ayarlar"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <div className="p-8 font-bold text-gray-500">Sistem Ayarları (Demo)</div>
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/bildirimler"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Notifications />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/ana-sayfa"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <HomepageAdmin />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 */}
                  <Route
                    path="*"
                    element={
                      <PublicLayout>
                        <NotFound />
                      </PublicLayout>
                    }
                  />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
