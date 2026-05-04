// Not: supabase.auth.signOut() çağrısı supabaseAdmin üzerinden yapılır (ProtectedRoute/AdminLayout)
const ADMIN_SESSION_KEY = 'mimce_admin_session_start';
const ADMIN_LAST_ACTIVITY_KEY = 'mimce_admin_last_activity';

const SESSION_MAX_MS = 8 * 60 * 60 * 1000;  // 8 saat mutlak limit
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;     // 30 dakika hareketsizlik

export const adminSession = {
  start() {
    const now = Date.now().toString();
    localStorage.setItem(ADMIN_SESSION_KEY, now);
    localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, now);
  },

  touch() {
    localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, Date.now().toString());
  },

  clear() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
  },

  isExpired(): boolean {
    const start = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!start) return true;
    return Date.now() - parseInt(start, 10) > SESSION_MAX_MS;
  },

  isIdle(): boolean {
    const last = localStorage.getItem(ADMIN_LAST_ACTIVITY_KEY);
    if (!last) return true;
    return Date.now() - parseInt(last, 10) > IDLE_TIMEOUT_MS;
  },

  remainingMs(): number {
    const start = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!start) return 0;
    return Math.max(0, SESSION_MAX_MS - (Date.now() - parseInt(start, 10)));
  },
};
