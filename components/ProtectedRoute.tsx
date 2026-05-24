import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { supabaseAdmin as supabase } from '../services/supabaseAdmin';
import { adminSession } from '../services/adminSession';

const ALLOWED_ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim())
  .filter(Boolean);

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'pointermove'] as const;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isAdminUser = (email: string | undefined | null): boolean => {
    if (!email) return false;
    if (ALLOWED_ADMIN_EMAILS.length === 0) {
      console.error(
        '[ProtectedRoute] VITE_ADMIN_EMAILS tanımsız veya boş! ' +
        'Güvenlik nedeniyle admin erişimi engellendi. ' +
        '.env.local dosyasında VITE_ADMIN_EMAILS değişkenini ayarlayın.'
      );
      return false;
    }
    return ALLOWED_ADMIN_EMAILS.includes(email);
  };

  const forceSignOut = useCallback(async () => {
    adminSession.clear();
    await supabase.auth.signOut();
    setAuthenticated(false);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      if (!isAdminUser(session.user.email)) {
        await forceSignOut();
        setLoading(false);
        return;
      }

      if (adminSession.isExpired() || adminSession.isIdle()) {
        await forceSignOut();
        setLoading(false);
        return;
      }

      // 2FA: kayıtlı TOTP factor varsa aal2 zorunlu
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel !== 'aal2') {
        await forceSignOut();
        setLoading(false);
        return;
      }

      setAuthenticated(true);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        adminSession.clear();
        setAuthenticated(false);
      } else if (isAdminUser(session.user.email)) {
        setAuthenticated(true);
      } else {
        await forceSignOut();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Aktivite takibi ve periyodik timeout kontrolü
  useEffect(() => {
    if (!authenticated) return;

    const handleActivity = () => adminSession.touch();
    ACTIVITY_EVENTS.forEach(ev => window.addEventListener(ev, handleActivity, { passive: true }));

    idleTimerRef.current = setInterval(async () => {
      if (adminSession.isExpired() || adminSession.isIdle()) {
        await forceSignOut();
      }
    }, 60_000);

    return () => {
      ACTIVITY_EVENTS.forEach(ev => window.removeEventListener(ev, handleActivity));
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [authenticated, forceSignOut]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
