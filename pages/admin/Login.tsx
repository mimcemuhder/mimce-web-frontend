import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin';
import { adminSession } from '../../services/adminSession';
import {
  LogIn,
  Mail,
  Lock,
  AlertTriangle,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

// ─── Brute force sabitleri ─────────────────────────────────────────────────
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;
const ATTEMPTS_KEY = 'mimce_admin_login_attempts';
const LOCKOUT_KEY = 'mimce_admin_lockout_until';

const getLockoutRemaining = () =>
  Math.max(0, parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10) - Date.now());

const getAttemptCount = (): number => {
  try {
    return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '0');
  } catch {
    return 0;
  }
};

// ─── Adım tipleri ─────────────────────────────────────────────────────────
type Step = 'credentials' | 'enroll' | 'verify';

const Login: React.FC = () => {
  const navigate = useNavigate();

  // Ortak
  const [step, setStep] = useState<Step>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Adım 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // MFA
  const [factorId, setFactorId] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const totpInputRef = useRef<HTMLInputElement>(null);

  // Enrollment
  const [qrDataUri, setQrDataUri] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [copied, setCopied] = useState(false);

  // ── Kilitleme sayacı ─────────────────────────────────────────────────────
  useEffect(() => {
    const rem = getLockoutRemaining();
    if (rem > 0) setLockoutSeconds(Math.ceil(rem / 1000));
  }, []);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const t = setInterval(() => {
      setLockoutSeconds((p) => {
        if (p <= 1) {
          clearInterval(t);
          localStorage.removeItem(LOCKOUT_KEY);
          localStorage.removeItem(ATTEMPTS_KEY);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [lockoutSeconds]);

  // TOTP inputuna otomatik fokus
  useEffect(() => {
    if (step !== 'credentials') setTimeout(() => totpInputRef.current?.focus(), 100);
  }, [step]);

  // ── Adım 1: E-posta + Şifre ──────────────────────────────────────────────
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (getLockoutRemaining() > 0) {
      setLockoutSeconds(Math.ceil(getLockoutRemaining() / 1000));
      return;
    }
    setLoading(true);

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });

      if (authErr || !data.user) {
        const n = getAttemptCount() + 1;
        if (n >= MAX_ATTEMPTS) {
          localStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_MS));
          localStorage.setItem(ATTEMPTS_KEY, '0');
          setLockoutSeconds(Math.ceil(LOCKOUT_MS / 1000));
          setError(
            `Çok fazla başarısız deneme. ${Math.ceil(LOCKOUT_MS / 60000)} dakika beklemeniz gerekiyor.`
          );
        } else {
          localStorage.setItem(ATTEMPTS_KEY, String(n));
          setError(`E-posta veya şifre hatalı. (${n}/${MAX_ATTEMPTS})`);
        }
        setLoading(false);
        return;
      }

      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);

      // MFA factor kontrolü
      const { data: factorData } = await supabase.auth.mfa.listFactors();
      const totp = factorData?.totp?.[0];

      if (totp) {
        // Kayıtlı factor var → doğrulama adımı
        const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
        if (chErr || !ch) {
          setError('2FA başlatılamadı. Tekrar deneyin.');
          setLoading(false);
          return;
        }
        setFactorId(totp.id);
        setChallengeId(ch.id);
        setStep('verify');
      } else {
        // Factor yok → ilk kurulum
        const { data: enr, error: enrErr } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: 'MİMCE Admin',
        });
        if (enrErr || !enr) {
          setError('2FA kurulumu başlatılamadı.');
          setLoading(false);
          return;
        }
        setFactorId(enr.id);
        setQrDataUri(enr.totp.qr_code);
        setTotpSecret(enr.totp.secret);
        setStep('enroll');
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // ── Adım 2a: İlk enrollment onayı ─────────────────────────────────────
  const handleEnrollVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
      if (chErr || !ch) {
        setError('Challenge oluşturulamadı.');
        return;
      }

      const { error: verErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: ch.id,
        code: totpCode.replace(/\s/g, ''),
      });
      if (verErr) {
        setError('Kod hatalı veya süresi dolmuş. Tekrar deneyin.');
        return;
      }

      adminSession.start();
      navigate('/admin');
    } catch {
      setError('Doğrulama hatası. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // ── Adım 2b: TOTP doğrulama (kayıtlı factor) ─────────────────────────
  const handleTotpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: verErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: totpCode.replace(/\s/g, ''),
      });
      if (verErr) {
        setError('Kod hatalı veya süresi dolmuş.');
        setTotpCode('');
        // Yeni challenge al
        const { data: ch } = await supabase.auth.mfa.challenge({ factorId });
        if (ch) setChallengeId(ch.id);
        return;
      }

      adminSession.start();
      navigate('/admin');
    } catch {
      setError('Doğrulama hatası. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLocked = lockoutSeconds > 0;
  const lockMins = Math.floor(lockoutSeconds / 60);
  const lockSecs = lockoutSeconds % 60;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div
        className="w-full bg-white rounded-2xl shadow-xl overflow-hidden"
        style={{ maxWidth: step === 'enroll' ? '480px' : '448px' }}
      >
        {/* Header */}
        <div className="bg-navy p-8 text-center">
          <img src="/mimce_admin_logo.svg" alt="MİMCE Admin Logo" className="h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">
            {step === 'credentials' && 'Admin Girişi'}
            {step === 'enroll' && 'İki Faktörlü Doğrulama Kurulumu'}
            {step === 'verify' && 'İki Faktörlü Doğrulama'}
          </h1>
          <p className="text-gray-300 text-sm mt-2">
            {step === 'credentials' && 'Yönetim paneline erişmek için giriş yapın'}
            {step === 'enroll' && 'Güvenliğiniz için authenticator uygulaması kurun'}
            {step === 'verify' && 'Authenticator uygulamanızdaki kodu girin'}
          </p>
          {/* Adım göstergesi */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {['credentials', 'enroll', 'verify'].map((s, i) => {
              const current =
                ['credentials', step === 'enroll' ? 'enroll' : 'verify'].indexOf(s) >= 0;
              const steps = ['credentials', step === 'enroll' ? 'enroll' : 'verify'];
              const idx = steps.indexOf(
                s === 'enroll' || s === 'verify' ? (step === 'enroll' ? 'enroll' : 'verify') : s
              );
              const activeIdx = steps.indexOf(step);
              const done =
                i < ['credentials', step === 'enroll' ? 'enroll' : 'verify'].indexOf(step);
              const _ = [current, done, idx, activeIdx];
              void _;
              return null;
            })}
            {[
              { label: '1', title: 'Giriş' },
              { label: '2', title: step === 'enroll' ? 'Kurulum' : 'Doğrulama' },
            ].map((s, i) => {
              const active =
                (i === 0 && step === 'credentials') || (i === 1 && step !== 'credentials');
              const done = i === 0 && step !== 'credentials';
              return (
                <React.Fragment key={i}>
                  {i > 0 && <div className={`h-px w-8 ${done ? 'bg-primary' : 'bg-gray-600'}`} />}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                    ${
                      done
                        ? 'bg-primary text-navy'
                        : active
                          ? 'bg-white text-navy'
                          : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {done ? <Check size={12} /> : s.label}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── Adım 1: Kimlik bilgileri ─────────────────────────────────────── */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentials} className="p-8 space-y-6">
            {error && <ErrorBox message={error} />}
            {isLocked && <LockBox minutes={lockMins} seconds={lockSecs} />}

            <InputField
              label="E-posta"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="admin@mimce.com"
              icon={<Mail size={18} />}
              disabled={isLocked}
              autoComplete="username"
            />
            <InputField
              label="Şifre"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              icon={<Lock size={18} />}
              disabled={isLocked}
              autoComplete="current-password"
            />
            <SubmitButton loading={loading} disabled={isLocked} icon={<LogIn size={18} />}>
              Devam Et
            </SubmitButton>
          </form>
        )}

        {/* ── Adım 2a: İlk kurulum ──────────────────────────────────────────── */}
        {step === 'enroll' && (
          <form onSubmit={handleEnrollVerify} className="p-8 space-y-6">
            {error && <ErrorBox message={error} />}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">Kurulum adımları:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Google Authenticator, Authy veya benzeri bir uygulama açın</li>
                <li>Aşağıdaki QR kodu tarayın veya kodu manuel girin</li>
                <li>Uygulama size 6 haneli bir kod verecek — aşağıya girin</li>
              </ol>
            </div>

            {/* QR Kodu */}
            {qrDataUri && (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={qrDataUri}
                  alt="2FA QR Kodu"
                  className="w-48 h-48 border-4 border-gray-100 rounded-xl"
                />
                <div className="w-full">
                  <p className="text-xs text-gray-500 mb-1 text-center">
                    QR tarayamıyorsanız bu kodu manuel girin:
                  </p>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <code className="flex-1 text-xs font-mono text-gray-700 break-all">
                      {totpSecret}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="shrink-0 text-gray-400 hover:text-primary transition-colors"
                    >
                      {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <InputField
              ref={totpInputRef}
              label="Doğrulama Kodu"
              type="text"
              value={totpCode}
              onChange={setTotpCode}
              placeholder="000 000"
              icon={<KeyRound size={18} />}
              inputMode="numeric"
              maxLength={7}
              autoComplete="one-time-code"
            />
            <SubmitButton loading={loading} icon={<ShieldCheck size={18} />}>
              Kurulumu Tamamla
            </SubmitButton>
            <button
              type="button"
              onClick={() => {
                supabase.auth.signOut();
                setStep('credentials');
                setError('');
              }}
              className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Geri dön
            </button>
          </form>
        )}

        {/* ── Adım 2b: TOTP doğrulama ───────────────────────────────────────── */}
        {step === 'verify' && (
          <form onSubmit={handleTotpVerify} className="p-8 space-y-6">
            {error && <ErrorBox message={error} />}

            <div className="text-center py-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} className="text-primary" />
              </div>
              <p className="text-sm text-gray-600">
                Authenticator uygulamanızdaki <strong>6 haneli kodu</strong> girin.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Doğrulama Kodu
              </label>
              <input
                ref={totpInputRef}
                type="text"
                inputMode="numeric"
                maxLength={7}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9 ]/g, ''))}
                placeholder="000 000"
                autoComplete="one-time-code"
                className="w-full text-center text-3xl font-mono tracking-[0.5em] border-2 border-gray-300 rounded-xl py-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                required
              />
            </div>

            <SubmitButton loading={loading} icon={<ShieldCheck size={18} />}>
              Doğrula ve Giriş Yap
            </SubmitButton>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <button
                type="button"
                onClick={() => {
                  supabase.auth.signOut();
                  setStep('credentials');
                  setError('');
                  setTotpCode('');
                }}
                className="hover:text-gray-600 transition-colors"
              >
                ← Farklı hesapla giriş yap
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { data: ch } = await supabase.auth.mfa.challenge({ factorId });
                  if (ch) {
                    setChallengeId(ch.id);
                    setTotpCode('');
                    setError('');
                  }
                }}
                className="flex items-center gap-1 hover:text-gray-600 transition-colors"
              >
                <RefreshCw size={11} /> Kodu yenile
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ─── Yardımcı bileşenler ───────────────────────────────────────────────────
const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 flex items-start gap-2">
    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
    {message}
  </div>
);

const LockBox: React.FC<{ minutes: number; seconds: number }> = ({ minutes, seconds }) => (
  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800 text-center font-medium">
    Hesap kilitli — {minutes > 0 ? `${minutes}d ` : ''}
    {seconds}s
  </div>
);

const InputField = React.forwardRef<
  HTMLInputElement,
  {
    label: string;
    type: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    autoComplete?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    maxLength?: number;
  }
>(
  (
    {
      label,
      type,
      value,
      onChange,
      placeholder,
      icon,
      disabled,
      autoComplete,
      inputMode,
      maxLength,
    },
    ref
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors`}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          required
        />
      </div>
    </div>
  )
);
InputField.displayName = 'InputField';

const SubmitButton: React.FC<{
  loading: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ loading, disabled, icon, children }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="w-full bg-primary text-navy font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
  >
    {loading ? <RefreshCw size={18} className="animate-spin" /> : icon}
    {loading ? 'Lütfen bekleyin...' : children}
  </button>
);

export default Login;
