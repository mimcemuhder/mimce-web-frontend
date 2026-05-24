import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { User } from '@supabase/supabase-js';
import type { Training, Event as MimceEvent, UserTraining, UserEvent } from '../../types';
import { universities } from '../../data/universities';
import {
  UserCircle, Mail, Shield, Calendar, Save, Camera,
  LogOut, Key, CheckCircle, AlertCircle, Github,
  BookOpen, MapPin, Clock, Award, Upload, X, ChevronDown, Search, Trash2,
} from 'lucide-react';

const DELETE_CONFIRM_PHRASE = 'HESABIMI SIL';

type Tab = 'profile' | 'trainings' | 'events';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const navigate = useNavigate();

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');

  // Avatar
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Password
  const [passwordSection, setPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Hesap silme
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);

  // Enrollments
  const [userTrainings, setUserTrainings] = useState<UserTraining[]>([]);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/giris');
        return;
      }
      const u = session.user;
      setUser(u);
      const meta = u.user_metadata;
      setFullName(meta?.full_name || meta?.name || '');
      const rawPhone = meta?.phone as string | undefined;
      if (rawPhone && rawPhone.trim() !== '') {
        setPhone(rawPhone.startsWith('+90') ? rawPhone : `+90 ${rawPhone.replace(/^0+/, '')}`);
      } else {
        setPhone('+90 ');
      }
      setBio(meta?.bio || '');
      setUniversity(meta?.university || '');
      setDepartment(meta?.department || '');
      setCurrentAvatarUrl(meta?.avatar_url || null);
      setLoading(false);
    };
    getUser();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'trainings') fetchUserTrainings();
    if (activeTab === 'events') fetchUserEvents();
  }, [activeTab, user]);

  const fetchUserTrainings = async () => {
    if (!user) return;
    setEnrollmentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_trainings')
        .select('*, training:trainings(*)')
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (!error && data) {
        setUserTrainings(data.map((d: UserTraining) => ({ ...d, training: d.training })));
      }
    } catch {
      // Table may not exist yet
    }
    setEnrollmentsLoading(false);
  };

  const fetchUserEvents = async () => {
    if (!user) return;
    setEnrollmentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_events')
        .select('*, event:events(*)')
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (!error && data) {
        setUserEvents(data.map((d: UserEvent) => ({ ...d, event: d.event })));
      }
    } catch {
      // Table may not exist yet
    }
    setEnrollmentsLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Lütfen bir resim dosyası seçin.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Dosya boyutu 2MB\'dan küçük olmalıdır.' });
      return;
    }

    setAvatarUploading(true);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      await supabase.storage.from('avatars').remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setMessage({ type: 'error', text: 'Fotoğraf yüklenirken hata oluştu: ' + uploadError.message });
        setAvatarUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl + '?t=' + Date.now();

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });

      if (updateError) {
        setMessage({ type: 'error', text: 'Profil güncellenemedi.' });
      } else {
        setCurrentAvatarUrl(avatarUrl);
        const { data: { user: updatedUser } } = await supabase.auth.getUser();
        setUser(updatedUser);
        setMessage({ type: 'success', text: 'Profil fotoğrafı güncellendi.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Beklenmedik bir hata oluştu.' });
    }

    setAvatarUploading(false);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setAvatarUploading(true);
    setMessage(null);

    try {
      const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const filesToRemove = extensions.map(ext => `${user.id}/avatar.${ext}`);
      await supabase.storage.from('avatars').remove(filesToRemove);

      await supabase.auth.updateUser({
        data: { avatar_url: null },
      });

      setCurrentAvatarUrl(null);
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
      setMessage({ type: 'success', text: 'Profil fotoğrafı kaldırıldı.' });
    } catch {
      setMessage({ type: 'error', text: 'Fotoğraf kaldırılırken hata oluştu.' });
    }

    setAvatarUploading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone, bio, university, department },
    });

    if (error) {
      setMessage({ type: 'error', text: 'Profil güncellenirken bir hata oluştu.' });
    } else {
      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi.' });
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalıdır.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'Şifreler eşleşmiyor.' });
      return;
    }

    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage({ type: 'error', text: 'Şifre değiştirilemedi: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi.' });
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordSection(false);
    }
    setPasswordSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteConfirmText('');
    setDeletePassword('');
    setDeleteModalError(null);
  };

  const handleDeleteAccount = async () => {
    if (!user?.email) return;
    setMessage(null);
    setDeleteModalError(null);

    if (deleteConfirmText.trim() !== DELETE_CONFIRM_PHRASE) {
      setDeleteModalError(`Onay için tam olarak "${DELETE_CONFIRM_PHRASE}" yazın.`);
      return;
    }

    const oauthProvider = user.app_metadata?.provider;
    const userIsOAuth = oauthProvider === 'google' || oauthProvider === 'github';

    if (!userIsOAuth) {
      if (!deletePassword) {
        setDeleteModalError('Hesabınızı silmek için şifrenizi girin.');
        return;
      }
      const { error: reauthErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: deletePassword,
      });
      if (reauthErr) {
        setDeleteModalError('Şifre hatalı veya oturum doğrulanamadı.');
        return;
      }
    }

    setDeleteAccountLoading(true);
    const { data, error: fnError } = await supabase.functions.invoke('delete-account', { method: 'POST' });

    if (fnError) {
      setDeleteModalError(
        fnError.message?.includes('Failed to fetch') || fnError.message?.includes('non-2xx')
          ? 'Hesap silme servisi yanıt vermedi. Supabase’de delete-account edge function ve SUPABASE_SERVICE_ROLE_KEY gizli anahtarını kontrol edin.'
          : `İşlem başarısız: ${fnError.message}`,
      );
      setDeleteAccountLoading(false);
      return;
    }

    const payload = data as { ok?: boolean; error?: string } | null;
    if (payload && 'error' in payload && payload.error) {
      setDeleteModalError(payload.error);
      setDeleteAccountLoading(false);
      return;
    }

    await supabase.auth.signOut({ scope: 'local' });
    closeDeleteModal();
    navigate('/');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\s+/g, ' ');

    // Her zaman +90 ile başlasın
    if (!val.startsWith('+90')) {
      // baştaki 0 veya 90'ı temizle
      val = val.replace(/^[+]*90\s?/, '');
      val = val.replace(/^0+/, '');
      val = `+90 ${val}`;
    }

    // +90 dışındaki karakterleri sadeleştir (sadece rakam)
    const withoutPrefix = val.replace(/^\+90\s?/, '');
    const digits = withoutPrefix.replace(/[^\d]/g, '').slice(0, 10); // 10 hane

    const formatted = digits ? `+90 ${digits}` : '+90 ';
    setPhone(formatted);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 flex justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const provider = user.app_metadata?.provider;
  const isOAuth = provider === 'google' || provider === 'github';
  const createdAt = new Date(user.created_at).toLocaleDateString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const initials = (fullName || user.email || '?').charAt(0).toUpperCase();

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profil', icon: <UserCircle size={18} /> },
    { id: 'trainings', label: 'Eğitimlerim', icon: <BookOpen size={18} /> },
    { id: 'events', label: 'Etkinliklerim', icon: <Calendar size={18} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      {/* Profile Header with Avatar Upload */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar with Upload */}
          <div className="relative group">
            {currentAvatarUrl ? (
              <img
                src={currentAvatarUrl}
                alt=""
                className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center text-navy font-bold text-4xl ring-4 ring-white shadow-lg">
                {initials}
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                title="Fotoğraf yükle"
              >
                <Camera size={18} className="text-gray-700" />
              </button>
              {currentAvatarUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={avatarUploading}
                  className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  title="Fotoğrafı kaldır"
                >
                  <X size={18} className="text-red-600" />
                </button>
              )}
            </div>

            {avatarUploading && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <div className="h-7 w-7 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              </div>
            )}

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 pt-1 sm:pt-0">
            <h1 className="text-2xl font-bold text-gray-900">{fullName || 'Kullanıcı'}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {createdAt}
              </span>
              {isOAuth && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                  {provider === 'google' ? (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  ) : (
                    <Github size={13} />
                  )}
                  {provider === 'google' ? 'Google' : 'GitHub'}
                </span>
              )}
              {university && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-full text-blue-600">
                  <Award size={13} />
                  {university}
                </span>
              )}
            </div>
          </div>

          {/* Logout button (desktop) */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium border border-red-200"
          >
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info Form */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <UserCircle size={20} className="text-primary" />
                  Kişisel Bilgiler
                </h2>
              </div>
              <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Soyad</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">E-posta</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Üniversite</label>
                    <UniversitySelect value={university} onChange={setUniversity} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bölüm</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="Örn: Bilgisayar Mühendisliği"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
                  <input
                    type="tel"
                    value={phone}
                onChange={handlePhoneChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Hakkımda</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                    placeholder="Kendinizi kısaca tanıtın..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-navy font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    <Save size={18} />
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Section */}
            {!isOAuth && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Key size={20} className="text-primary" />
                    Şifre Değiştir
                  </h2>
                </div>
                {!passwordSection ? (
                  <div className="p-6">
                    <button
                      onClick={() => setPasswordSection(true)}
                      className="text-sm text-primary font-semibold hover:underline"
                    >
                      Şifremi değiştirmek istiyorum
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Yeni Şifre</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        placeholder="En az 6 karakter"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Yeni Şifre Tekrar</label>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={passwordSaving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-navy font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                      >
                        <Key size={16} />
                        {passwordSaving ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPasswordSection(false); setNewPassword(''); setConfirmNewPassword(''); }}
                        className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-800 font-medium"
                      >
                        İptal
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Hesap Bilgileri</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Durum</span>
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Giriş Yöntemi</span>
                  <span className="text-gray-900 font-medium">
                    {provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'E-posta'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Kayıt Tarihi</span>
                  <span className="text-gray-900 font-medium">{createdAt}</span>
                </div>
                {user.email_confirmed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">E-posta</span>
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <Shield size={14} />
                      Doğrulanmış
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">İstatistikler</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-navy">{userTrainings.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Eğitim</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-navy">{userEvents.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Etkinlik</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-navy">
                    {userTrainings.filter(t => t.completed).length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Tamamlanan</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-navy">
                    {userEvents.filter(ev => ev.attended).length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Katılım</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6 space-y-3">
              <h3 className="text-sm font-semibold text-red-800 uppercase tracking-wide">Tehlikeli işlemler</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Hesabınız kalıcı silinir. Verileriniz veritabanındaki silme kurallarına (cascade) göre kaldırılır.
              </p>
              <button
                type="button"
                onClick={() => { setDeleteModalOpen(true); setMessage(null); setDeleteModalError(null); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
                Hesabımı sil
              </button>
            </div>

            {/* Mobile Logout */}
            <button
              onClick={handleLogout}
              className="sm:hidden w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium border border-red-200"
            >
              <LogOut size={16} />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}

      {/* Trainings Tab */}
      {activeTab === 'trainings' && (
        <div className="space-y-6">
          {enrollmentsLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
            </div>
          ) : userTrainings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTrainings.map(ut => (
                <div key={ut.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                  {ut.training?.image && (
                    <div className="h-40 overflow-hidden relative">
                      <img src={ut.training.image} alt={ut.training?.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3">
                        {ut.completed ? (
                          <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle size={12} /> Tamamlandı
                          </span>
                        ) : (
                          <span className="bg-yellow-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            Devam Ediyor
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-navy mb-2">{ut.training?.title || 'Eğitim'}</h3>
                    {ut.training?.type && (
                      <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded mb-2 w-fit">
                        {ut.training.type}
                      </span>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{ut.training?.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {ut.training?.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {new Date(ut.enrolled_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<BookOpen size={48} className="text-gray-300" />}
              title="Henüz bir eğitime kayıt olmadınız"
              description="Eğitimler sayfasından ilginizi çeken eğitimlere kayıt olabilirsiniz."
              linkTo="/egitimler"
              linkLabel="Eğitimleri Keşfet"
            />
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {enrollmentsLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
            </div>
          ) : userEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userEvents.map(ue => (
                <div key={ue.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                  {ue.event?.image && (
                    <div className="h-40 overflow-hidden relative">
                      <img src={ue.event.image} alt={ue.event?.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3">
                        {ue.attended ? (
                          <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle size={12} /> Katıldı
                          </span>
                        ) : (
                          <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            Kayıtlı
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-navy mb-2">{ue.event?.title || 'Etkinlik'}</h3>
                    <div className="space-y-1.5 mb-3 text-sm text-gray-500">
                      {ue.event?.date && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-primary" />
                          {ue.event.date}
                        </div>
                      )}
                      {ue.event?.time && (
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-primary" />
                          {ue.event.time}
                        </div>
                      )}
                      {ue.event?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-primary" />
                          {ue.event.location}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 flex-1">{ue.event?.description}</p>
                    <div className="text-xs text-gray-400 pt-3 mt-3 border-t border-gray-100 flex items-center gap-1">
                      <Clock size={13} />
                      Kayıt: {new Date(ue.enrolled_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar size={48} className="text-gray-300" />}
              title="Henüz bir etkinliğe kayıt olmadınız"
              description="Etkinlikler sayfasından yaklaşan etkinliklere kayıt olabilirsiniz."
              linkTo="/etkinlikler"
              linkLabel="Etkinlikleri Keşfet"
            />
          )}
        </div>
      )}

      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-account-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Trash2 className="text-red-600" size={22} />
              Hesabı sil
            </h2>
            <p className="text-sm text-gray-600">
              Bu işlem geri alınamaz. Devam etmek için aşağıya tam olarak <strong className="text-gray-900">{DELETE_CONFIRM_PHRASE}</strong> yazın.
            </p>
            {deleteModalError && (
              <div className="flex items-start gap-2 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{deleteModalError}</span>
              </div>
            )}
            {!isOAuth && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Şifre</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                  placeholder="Mevcut şifreniz"
                  autoComplete="current-password"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Onay metni</label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none font-mono text-sm"
                placeholder={DELETE_CONFIRM_PHRASE}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteAccountLoading}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteAccountLoading}
                className="px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteAccountLoading ? 'Siliniyor...' : 'Kalıcı olarak sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  linkTo: string;
  linkLabel: string;
}> = ({ icon, title, description, linkTo, linkLabel }) => {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      <a
        href={linkTo}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-navy font-bold rounded-lg hover:bg-primary-dark transition-colors"
      >
        {linkLabel}
      </a>
    </div>
  );
};

const DIGER = '__diger__';

const UniversitySelect: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isKnown = universities.includes(value);

  useEffect(() => {
    if (value && !isKnown && value !== '') {
      setIsCustom(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  const filtered = universities.filter(u =>
    u.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr'))
  );

  const handleSelect = (uni: string) => {
    if (uni === DIGER) {
      setIsCustom(true);
      onChange('');
      setOpen(false);
      return;
    }
    setIsCustom(false);
    onChange(uni);
    setOpen(false);
    setSearch('');
  };

  if (isCustom) {
    return (
      <div className="space-y-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          placeholder="Üniversite adını yazın..."
          autoFocus
        />
        <button
          type="button"
          onClick={() => { setIsCustom(false); onChange(''); setSearch(''); }}
          className="text-xs text-primary font-medium hover:underline"
        >
          Listeden seç
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-lg text-left transition-colors ${
          open
            ? 'border-primary ring-2 ring-primary'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || 'Üniversite seçin...'}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                placeholder="Üniversite ara..."
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">Sonuç bulunamadı</div>
            ) : (
              filtered.map(uni => (
                <button
                  key={uni}
                  type="button"
                  onClick={() => handleSelect(uni)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    value === uni
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {uni}
                </button>
              ))
            )}
            <button
              type="button"
              onClick={() => handleSelect(DIGER)}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-navy border-t border-gray-100 hover:bg-gray-50 sticky bottom-0 bg-white"
            >
              Diğer (elle yaz)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
