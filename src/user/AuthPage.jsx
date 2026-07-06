import { useState, useEffect } from 'react'
import { useNavigate } from '../shared/Router.jsx'
import { useAuth } from '../shared/AuthContext.jsx'

/* ---------- i18n strings ---------- */
const STR = {
  en: {
    dir: "ltr",
    signin: {
      eyebrow: "Sign in",
      title: "Welcome back",
      sub: "Sign in to your account to continue scaling.",
      email: "Email address",
      password: "Password",
      forgot: "Forgot password?",
      remember: "Keep me signed in",
      submit: "Sign in",
      noAccount: "Don't have an account?",
      switch: "Create account",
    },
    signup: {
      eyebrow: "Create account",
      title: "Start scaling today",
      sub: "Get instant access to verified ad accounts on every major platform.",
      name: "Full name",
      email: "Work email",
      password: "Password",
      confirm: "Confirm password",
      agree: "I agree to the",
      terms: "Terms",
      and: "and",
      privacy: "Privacy Policy",
      submit: "Create account",
      hasAccount: "Already have an account?",
      switch: "Sign in",
      pwHint: "8+ characters, mix of letters and numbers",
      strength: ["Too short", "Weak", "Okay", "Strong", "Excellent"],
      whatsapp: "WhatsApp number",
      whatsappHint: "OTP will be sent here.",
      whatsappPlaceholder: "+1 555 123 4567",
      continue: "Continue →",
      pwMismatch: "Passwords do not match.",
    },
    otp: {
      title: "Verify your WhatsApp",
      sub: "We'll send a 6-digit code to",
      active: "Make sure this number is active on WhatsApp.",
      sent: "Code sent. Check your WhatsApp.",
      send: "Send OTP via WhatsApp",
      sending: "Sending…",
      verify: "Verify Code →",
      verifying: "Verifying…",
      label: "Enter 6-digit OTP",
      resendIn: "Resend in",
      resend: "Resend OTP",
      back: "← Back",
    },
    side: {
      kicker: "AdverSolutions",
      heading: "Scale your ads,",
      heading2: "faster.",
      desc: "Access pre-verified ad accounts, hire expert media buyers, and manage every campaign from one premium dashboard.",
      stats: [
        { n: "500+", l: "Agencies trust us" },
        { n: "$120M+", l: "Ad spend managed" },
        { n: "24/7", l: "Live support" },
      ],
      features: [
        { t: "Pre-verified ad accounts", d: "Meta · Google · TikTok · Snapchat · Bing — ready to launch." },
        { t: "Expert media buyers", d: "Hire vetted professionals to run your campaigns." },
        { t: "Real-time tracking", d: "Monitor performance and scale with confidence." },
      ],
      trustedBy: "Trusted by teams running ads on",
    },
    common: {
      backHome: "Back to site",
      placeholderEmail: "you@company.com",
      placeholderName: "Sarah Johnson",
      placeholderPw: "••••••••••",
      copy: "© 2026 AdverSolutions. All rights reserved.",
    },
  },
  fr: {
    dir: "ltr",
    signin: {
      eyebrow: "Connexion",
      title: "Bon retour",
      sub: "Connectez-vous à votre compte pour continuer.",
      email: "Adresse e-mail",
      password: "Mot de passe",
      forgot: "Mot de passe oublié ?",
      remember: "Rester connecté",
      submit: "Se connecter",
      noAccount: "Pas encore de compte ?",
      switch: "Créer un compte",
    },
    signup: {
      eyebrow: "Créer un compte",
      title: "Lancez-vous aujourd'hui",
      sub: "Accès instantané à des comptes publicitaires vérifiés sur toutes les plateformes.",
      name: "Nom complet",
      email: "E-mail professionnel",
      password: "Mot de passe",
      confirm: "Confirmer le mot de passe",
      agree: "J'accepte les",
      terms: "Conditions",
      and: "et la",
      privacy: "Politique de confidentialité",
      submit: "Créer le compte",
      hasAccount: "Déjà un compte ?",
      switch: "Se connecter",
      pwHint: "8+ caractères, mélange de lettres et de chiffres",
      strength: ["Trop court", "Faible", "Correct", "Fort", "Excellent"],
      whatsapp: "Numéro WhatsApp",
      whatsappHint: "L'OTP sera envoyé ici.",
      whatsappPlaceholder: "+33 6 12 34 56 78",
      continue: "Continuer →",
      pwMismatch: "Les mots de passe ne correspondent pas.",
    },
    otp: {
      title: "Vérifiez votre WhatsApp",
      sub: "Nous enverrons un code à 6 chiffres au",
      active: "Assurez-vous que ce numéro est actif sur WhatsApp.",
      sent: "Code envoyé. Vérifiez votre WhatsApp.",
      send: "Envoyer le code via WhatsApp",
      sending: "Envoi…",
      verify: "Vérifier le code →",
      verifying: "Vérification…",
      label: "Code OTP à 6 chiffres",
      resendIn: "Renvoyer dans",
      resend: "Renvoyer l'OTP",
      back: "← Retour",
    },
    side: {
      kicker: "AdverSolutions",
      heading: "Faites scaler vos pubs,",
      heading2: "plus vite.",
      desc: "Accédez à des comptes pubs pré-vérifiés, recrutez des media buyers experts, et gérez tout depuis un dashboard premium.",
      stats: [
        { n: "500+", l: "Agences nous font confiance" },
        { n: "120M$+", l: "Dépense publicitaire gérée" },
        { n: "24/7", l: "Support en direct" },
      ],
      features: [
        { t: "Comptes pubs pré-vérifiés", d: "Meta · Google · TikTok · Snapchat · Bing — prêts à lancer." },
        { t: "Media buyers experts", d: "Recrutez des professionnels qualifiés pour vos campagnes." },
        { t: "Suivi en temps réel", d: "Mesurez la performance et scalez en confiance." },
      ],
      trustedBy: "Utilisé par les équipes qui font de la pub sur",
    },
    common: {
      backHome: "Retour au site",
      placeholderEmail: "vous@entreprise.com",
      placeholderName: "Sarah Dupont",
      placeholderPw: "••••••••••",
      copy: "© 2026 AdverSolutions. Tous droits réservés.",
    },
  },
  ar: {
    dir: "rtl",
    signin: {
      eyebrow: "تسجيل الدخول",
      title: "مرحباً بعودتك",
      sub: "سجّل الدخول إلى حسابك للمتابعة.",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      forgot: "نسيت كلمة المرور؟",
      remember: "أبقني مسجّلاً",
      submit: "تسجيل الدخول",
      noAccount: "ليس لديك حساب؟",
      switch: "إنشاء حساب",
    },
    signup: {
      eyebrow: "إنشاء حساب",
      title: "ابدأ بالتوسّع اليوم",
      sub: "وصول فوري إلى حسابات إعلانية موثّقة على كل المنصات الكبرى.",
      name: "الاسم الكامل",
      email: "البريد المهني",
      password: "كلمة المرور",
      confirm: "تأكيد كلمة المرور",
      agree: "أوافق على",
      terms: "الشروط",
      and: "و",
      privacy: "سياسة الخصوصية",
      submit: "إنشاء الحساب",
      hasAccount: "لديك حساب؟",
      switch: "تسجيل الدخول",
      pwHint: "8 أحرف+، مزيج من الحروف والأرقام",
      strength: ["قصيرة جداً", "ضعيفة", "مقبولة", "قوية", "ممتازة"],
      whatsapp: "رقم واتساب",
      whatsappHint: "سيُرسل رمز OTP إليه.",
      whatsappPlaceholder: "+966 5x xxx xxxx",
      continue: "متابعة ←",
      pwMismatch: "كلمتا المرور غير متطابقتين.",
    },
    otp: {
      title: "تحقق من واتساب",
      sub: "سنرسل رمزاً مكوناً من 6 أرقام إلى",
      active: "تأكد أن هذا الرقم مفعّل على واتساب.",
      sent: "تم إرسال الرمز. تحقق من واتساب.",
      send: "إرسال OTP عبر واتساب",
      sending: "جارٍ الإرسال…",
      verify: "تحقق من الرمز ←",
      verifying: "جارٍ التحقق…",
      label: "أدخل رمز OTP المكوّن من 6 أرقام",
      resendIn: "إعادة الإرسال خلال",
      resend: "إعادة إرسال OTP",
      back: "→ رجوع",
    },
    side: {
      kicker: "AdverSolutions",
      heading: "وسّع إعلاناتك،",
      heading2: "بشكل أسرع.",
      desc: "وصول إلى حسابات إعلانية موثّقة مسبقاً، وتوظيف خبراء media buyers، وإدارة كل حملاتك من لوحة تحكم متميّزة.",
      stats: [
        { n: "+500", l: "وكالة تثق بنا" },
        { n: "+$120M", l: "إنفاق إعلاني مُدار" },
        { n: "24/7", l: "دعم مباشر" },
      ],
      features: [
        { t: "حسابات إعلانية موثّقة", d: "ميتا · جوجل · تيك توك · سناب · بينج — جاهزة للإطلاق." },
        { t: "خبراء Media Buyers", d: "وظّف محترفين معتمدين لإدارة حملاتك." },
        { t: "تتبّع لحظي", d: "راقب الأداء ووسّع بثقة." },
      ],
      trustedBy: "تستخدمه فرق تشغّل إعلاناتها على",
    },
    common: {
      backHome: "العودة للموقع",
      placeholderEmail: "you@company.com",
      placeholderName: "سارة محمد",
      placeholderPw: "••••••••••",
      copy: "© 2026 AdverSolutions. جميع الحقوق محفوظة.",
    },
  },
};

const PLATFORM_LOGOS = [
  { k: "meta", src: "/assets/meta.png" },
  { k: "google", src: "/assets/google.webp" },
  { k: "tiktok", src: "/assets/tiktok.png" },
  { k: "snapchat", src: "/assets/snapchat.png" },
  { k: "bing", src: "/assets/bing.png" },
];

/* ---------- SVG icons ---------- */
const IconMail = (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.6"/><path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
const IconLock = (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
const IconUser = (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
const IconEye = (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/></svg>;
const IconEyeOff = (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 3l18 18M10.5 10.7a2 2 0 002.8 2.8M9.5 5.4A11 11 0 0112 5c6.5 0 10 7 10 7a17.6 17.6 0 01-3.4 4.3M6.4 6.4A17.6 17.6 0 002 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
const IconArrow = (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconCheck = (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconGlobe = (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" stroke="currentColor" strokeWidth="1.6"/></svg>;
const IconCaret = (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconWA = (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 21l1.5-5A8.5 8.5 0 1 1 8 19.5L3 21z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.2-1.7-1-.9.7c-1-.4-1.8-1.2-2.2-2.2l.7-.9-1-1.7L9 9.5z" fill="currentColor"/></svg>;

/* ---------- Brand mark ---------- */
function BrandMark({ white = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" style={{ height: 36, width: 'auto' }}>
        <defs>
          <linearGradient id="bm-auth" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#ff5d80"/>
            <stop offset="1" stopColor="#e2003c"/>
          </linearGradient>
        </defs>
        <path d="M20 4 L34 32 H26 L20 18 L14 32 H6 Z" fill="url(#bm-auth)"/>
        <path d="M20 4 L26 18 L20 18 Z" fill="#9a002a" opacity="0.55"/>
      </svg>
      <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px', lineHeight: 1, color: white ? '#fff' : '#111' }}>
        Adver<span style={{ color: '#ff2d55' }}>Solutions</span>
      </span>
    </div>
  );
}

/* ---------- Language picker ---------- */
const LANGS = [{ c: 'EN', v: 'en', n: 'English' }, { c: 'FR', v: 'fr', n: 'Français' }, { c: 'AR', v: 'ar', n: 'العربية' }];

function LangPicker({ lang, setLang, dark = false }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 36,
          borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          border: dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
          color: dark ? 'rgba(255,255,255,0.8)' : '#404040',
          background: 'transparent', transition: 'all .15s',
        }}
      >
        <IconGlobe style={{ width: 16, height: 16 }} />
        {lang.toUpperCase()}
        <IconCaret style={{ width: 14, height: 14, opacity: 0.6 }} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 44, insetInlineEnd: 0, width: 160, borderRadius: 12,
            padding: 4, zIndex: 50, boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            background: dark ? '#1a0710' : '#fff',
            border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
          }}>
            {LANGS.map(l => (
              <button
                key={l.v}
                type="button"
                onClick={() => { setLang(l.v); setOpen(false); }}
                style={{
                  width: '100%', textAlign: 'start', padding: '8px 12px', borderRadius: 8,
                  fontSize: 13.5, cursor: 'pointer', border: 'none', transition: 'all .12s',
                  fontWeight: lang === l.v ? 700 : 400,
                  color: lang === l.v ? '#ff2d55' : (dark ? 'rgba(255,255,255,0.7)' : '#404040'),
                  background: lang === l.v ? (dark ? 'rgba(255,255,255,0.05)' : '#fff5f7') : 'transparent',
                }}
              >
                {l.c} — {l.n}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Field ---------- */
function Field({ icon, label, type = 'text', value, onChange, placeholder, autoComplete, withReveal = false, hint }) {
  const [reveal, setReveal] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputType = withReveal ? (reveal ? 'text' : 'password') : type;
  return (
    <label style={{ display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#404040', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        {hint && <span style={{ fontSize: 11, color: '#9ca3af' }}>{hint}</span>}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', borderRadius: 12,
        border: focused ? '1.5px solid #ff2d55' : '1.5px solid rgba(0,0,0,0.1)',
        boxShadow: focused ? '0 0 0 4px rgba(255,45,85,0.12)' : 'none',
        background: '#fff', transition: 'all .15s',
      }}>
        <span style={{ paddingInlineStart: 14, color: focused ? '#ff2d55' : '#9ca3af', display: 'flex', transition: 'color .15s' }}>
          {icon}
        </span>
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          dir="ltr"
          style={{
            flex: 1, background: 'transparent', padding: '0 12px', height: 48,
            outline: 'none', border: 'none', fontSize: 15, color: '#111', fontFamily: 'inherit',
          }}
        />
        {withReveal && (
          <button
            type="button"
            onClick={() => setReveal(r => !r)}
            tabIndex={-1}
            style={{ paddingInlineEnd: 14, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
          >
            {reveal ? <IconEyeOff style={{ width: 20, height: 20 }} /> : <IconEye style={{ width: 20, height: 20 }} />}
          </button>
        )}
      </div>
    </label>
  );
}

/* ---------- Password strength ---------- */
function strengthOf(pw) {
  if (!pw) return -1;
  if (pw.length < 6) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
function StrengthMeter({ pw, labels }) {
  const s = strengthOf(pw);
  if (s < 0) return null;
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'];
  return (
    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ height: 6, borderRadius: 999, transition: 'all .3s', background: i < s ? colors[s] : 'rgba(0,0,0,0.07)' }} />
        ))}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: colors[s] }}>{labels[s]}</span>
    </div>
  );
}

/* ---------- Submit button ---------- */
function SubmitBtn({ loading, children, disabled, onClick }) {
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        width: '100%', height: 48, borderRadius: 12, fontWeight: 600, fontSize: 15,
        color: '#fff', border: 'none', cursor: loading || disabled ? 'not-allowed' : 'pointer',
        background: 'linear-gradient(to bottom, #ff4f7a, #ff2d55)',
        boxShadow: '0 10px 28px -10px rgba(255,45,85,0.6)',
        opacity: disabled ? 0.5 : 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 8, transition: 'all .15s', fontFamily: 'inherit',
      }}
    >
      {loading ? (
        <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
      ) : children}
    </button>
  );
}

/* ---------- Checkbox ---------- */
function Checkbox({ checked, onChange }) {
  return (
    <span
      onClick={onChange}
      style={{
        width: 18, height: 18, borderRadius: 6, border: checked ? '1.5px solid #ff2d55' : '1.5px solid rgba(0,0,0,0.2)',
        background: checked ? '#ff2d55' : '#fff', display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all .15s',
      }}
    >
      {checked && <IconCheck style={{ width: 12, height: 12, color: '#fff' }} />}
    </span>
  );
}

/* ---------- Mode tab ---------- */
function ModeTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '0 16px', height: 36, borderRadius: 8, fontSize: 13.5, fontWeight: 600,
        border: 'none', cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap', fontFamily: 'inherit',
        background: active ? '#fff' : 'transparent',
        color: active ? '#111' : '#6b7280',
        boxShadow: active ? '0 2px 8px -2px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

/* ---------- OTP Step ---------- */
function StepOTP({ phone, onVerified, onBack, s }) {
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(60);
    const id = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(id); return 0; } return c - 1; });
    }, 1000);
  };

  const sendOTP = async () => {
    setSending(true); setError('');
    try {
      const r = await fetch('/api/otp?action=send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to send OTP');
      setSent(true); startCountdown();
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) return;
    setVerifying(true); setError('');
    try {
      const r = await fetch('/api/otp?action=verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Verification failed');
      onVerified();
    } catch (err) { setError(err.message); }
    finally { setVerifying(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>📱</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '0 0 6px' }}>{s.title}</h3>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
          {s.sub} <strong style={{ color: '#374151' }}>{phone}</strong>
        </p>
      </div>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#ef4444' }}>
          {error}
        </div>
      )}
      {!sent ? (
        <>
          <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
            {s.active} <strong>{phone}</strong>
          </div>
          <SubmitBtn loading={sending} onClick={sendOTP}>
            {s.send}
          </SubmitBtn>
        </>
      ) : (
        <>
          <div style={{ background: '#f0fdf4', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#16a34a', fontWeight: 700 }}>
            ✓ {s.sent}
          </div>
          <Field
            icon={<span style={{ fontSize: 18 }}>🔑</span>}
            label={s.label}
            value={otp}
            onChange={v => setOtp(v.replace(/\D/g, '').slice(0, 6))}
            placeholder="483921"
          />
          <SubmitBtn loading={verifying} disabled={otp.length !== 6} onClick={verifyOTP}>
            {verifying ? s.verifying : s.verify}
          </SubmitBtn>
          <div style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
            {countdown > 0 ? `${s.resendIn} ${countdown}s` : (
              <span onClick={sendOTP} style={{ color: '#ff2d55', cursor: 'pointer', fontWeight: 700 }}>{s.resend}</span>
            )}
          </div>
        </>
      )}
      <button
        type="button"
        onClick={onBack}
        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 13, padding: '4px 0', fontFamily: 'inherit' }}
      >
        {s.back}
      </button>
    </div>
  );
}

/* ---------- Sign In Form ---------- */
function SignInForm({ s, common, dir, onSwitch, onError, onLoading }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field
        icon={<IconMail style={{ width: 20, height: 20 }} />}
        label={s.email}
        type="email"
        value={email}
        onChange={setEmail}
        placeholder={common.placeholderEmail}
        autoComplete="email"
      />
      <div>
        <Field
          icon={<IconLock style={{ width: 20, height: 20 }} />}
          label={s.password}
          value={password}
          onChange={setPassword}
          placeholder={common.placeholderPw}
          autoComplete="current-password"
          withReveal
        />
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
            <Checkbox checked={remember} onChange={() => setRemember(r => !r)} />
            <span style={{ fontSize: 13, color: '#4b5563' }}>{s.remember}</span>
          </label>
          <span
            onClick={() => navigate('/forgot-password')}
            style={{ fontSize: 13, fontWeight: 700, color: '#ff2d55', cursor: 'pointer' }}
          >
            {s.forgot}
          </span>
        </div>
      </div>
      {error && (
        <div style={{ background: '#fef2f2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ef4444' }}>{error}</div>
      )}
      <SubmitBtn loading={loading}>
        {s.submit}
        <IconArrow style={{ width: 16, height: 16 }} />
      </SubmitBtn>
      <p style={{ textAlign: 'center', fontSize: 14, color: '#4b5563', margin: '4px 0 0' }}>
        {s.noAccount}{' '}
        <button type="button" onClick={onSwitch} style={{ fontWeight: 700, color: '#ff2d55', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
          {s.switch}
        </button>
      </p>
    </form>
  );
}

/* ---------- Sign Up Form ---------- */
function SignUpForm({ s, common, dir, onSwitch }) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pwMismatch = confirm && password !== confirm;
  const step1Ok = name && email && whatsapp && password && confirm && !pwMismatch && agree;

  const handleVerified = async () => {
    setLoading(true); setError('');
    try {
      await register(name, email, password, whatsapp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <>
        {error && (
          <div style={{ background: '#fef2f2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ef4444', marginBottom: 12 }}>{error}</div>
        )}
        <StepOTP phone={whatsapp} onVerified={handleVerified} onBack={() => setStep(1)} s={s._otp} />
        {loading && <div style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 8 }}>Creating account…</div>}
      </>
    );
  }

  return (
    <form
      onSubmit={e => { e.preventDefault(); if (step1Ok) setStep(2); }}
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <Field
        icon={<IconUser style={{ width: 20, height: 20 }} />}
        label={s.name}
        value={name}
        onChange={setName}
        placeholder={common.placeholderName}
        autoComplete="name"
      />
      <Field
        icon={<IconMail style={{ width: 20, height: 20 }} />}
        label={s.email}
        type="email"
        value={email}
        onChange={setEmail}
        placeholder={common.placeholderEmail}
        autoComplete="email"
      />
      <Field
        icon={<IconWA style={{ width: 20, height: 20 }} />}
        label={s.whatsapp}
        type="tel"
        value={whatsapp}
        onChange={setWhatsapp}
        placeholder={s.whatsappPlaceholder}
        autoComplete="tel"
        hint={s.whatsappHint}
      />
      <div>
        <Field
          icon={<IconLock style={{ width: 20, height: 20 }} />}
          label={s.password}
          value={password}
          onChange={setPassword}
          placeholder={common.placeholderPw}
          autoComplete="new-password"
          withReveal
          hint={s.pwHint}
        />
        <StrengthMeter pw={password} labels={s.strength} />
      </div>
      <div>
        <Field
          icon={<IconLock style={{ width: 20, height: 20 }} />}
          label={s.confirm}
          value={confirm}
          onChange={setConfirm}
          placeholder={common.placeholderPw}
          autoComplete="new-password"
          withReveal
        />
        {pwMismatch && (
          <div style={{ marginTop: 6, fontSize: 12, color: '#ef4444' }}>{s.pwMismatch}</div>
        )}
      </div>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
        <Checkbox checked={agree} onChange={() => setAgree(a => !a)} />
        <span style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>
          {s.agree}{' '}
          <span style={{ fontWeight: 700, color: '#111', textDecoration: 'underline', textDecorationStyle: 'dotted', cursor: 'pointer' }}>{s.terms}</span>{' '}
          {s.and}{' '}
          <span style={{ fontWeight: 700, color: '#111', textDecoration: 'underline', textDecorationStyle: 'dotted', cursor: 'pointer' }}>{s.privacy}</span>.
        </span>
      </label>
      <SubmitBtn loading={false} disabled={!step1Ok}>
        {s.continue}
      </SubmitBtn>
      <p style={{ textAlign: 'center', fontSize: 14, color: '#4b5563', margin: '4px 0 0' }}>
        {s.hasAccount}{' '}
        <button type="button" onClick={onSwitch} style={{ fontWeight: 700, color: '#ff2d55', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
          {s.switch}
        </button>
      </p>
    </form>
  );
}

/* ---------- Brand Side Panel ---------- */
function BrandPanel({ t }) {
  const s = t.side;
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', color: '#fff' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a0510 0%, #3a0419 50%, #0a0207 100%)' }} />
      {/* Orbs */}
      <div style={{ position: 'absolute', top: -128, insetInlineEnd: -128, width: 520, height: 520, borderRadius: '50%', opacity: 0.6, filter: 'blur(80px)', background: 'radial-gradient(circle, rgba(255,45,85,0.55), transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: -160, insetInlineStart: -80, width: 460, height: 460, borderRadius: '50%', opacity: 0.4, filter: 'blur(80px)', background: 'radial-gradient(circle, rgba(255,79,122,0.5), transparent 70%)' }} />
      {/* Grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

      {/* Content */}
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', padding: '40px 48px' }}>
        <BrandMark white />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28, maxWidth: 440 }}>
          {/* Kicker badge */}
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 8, padding: '0 12px', height: 28, borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 12.5, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff5d80', boxShadow: '0 0 10px 2px rgba(255,93,128,0.8)' }} />
            {s.kicker}
          </div>

          <h1 style={{ fontSize: 46, lineHeight: 1.05, fontWeight: 900, letterSpacing: '-1px', margin: 0 }}>
            {s.heading}<br />
            <span style={{ background: 'linear-gradient(to right, #ff5d80, #ffb3c4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.heading2}</span>
          </h1>

          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', maxWidth: 440, margin: 0 }}>{s.desc}</p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, maxWidth: 440 }}>
            {s.stats.map((x, i) => (
              <div key={i} style={{ borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px' }}>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{x.n}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4, lineHeight: 1.3 }}>{x.l}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 440 }}>
            {s.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px' }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #ff4f7a, #ff2d55)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px -2px rgba(255,45,85,0.5)' }}>
                  <IconCheck style={{ width: 16, height: 16, color: '#fff' }} />
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{f.t}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4, marginTop: 2 }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform logos */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>{s.trustedBy}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {PLATFORM_LOGOS.map(({ k, src }) => (
              <img key={k} src={src} alt={k} draggable={false} style={{ height: 24, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.5 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main AuthPage ---------- */
export default function AuthPage({ defaultMode = 'signin' }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(defaultMode);
  const [lang, setLang] = useState(() => localStorage.getItem('adv_lang') || 'en');

  const t = STR[lang] || STR.en;
  const dir = t.dir;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem('adv_lang', lang);
  }, [lang, dir]);

  const switchMode = () => setMode(m => m === 'signin' ? 'signup' : 'signin');
  const current = mode === 'signin' ? t.signin : t.signup;

  // Pass OTP strings into SignUpForm via the signup strings object
  const signupWithOTP = { ...t.signup, _otp: t.otp };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .auth-form-fade { animation: fadeIn 0.2s ease; }
        .auth-mobile-bar { display: flex; }
        .auth-split { display: grid; grid-template-columns: 1.05fr 1fr; min-height: 100vh; }
        .auth-brand-col { display: block; position: relative; }
        .auth-desktop-topbar { display: flex; }
        @media (max-width: 1023px) {
          .auth-mobile-bar { display: flex; }
          .auth-split { display: block; }
          .auth-brand-col { display: none; }
          .auth-desktop-topbar { display: none; }
        }
        @media (min-width: 1024px) {
          .auth-mobile-bar { display: none; }
        }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Sora', system-ui, sans-serif" }} dir={dir}>

        {/* Mobile top bar */}
        <div className="auth-mobile-bar" style={{ alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 64, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <BrandMark />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span onClick={() => navigate('/')} style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', cursor: 'pointer', padding: '0 8px' }}>{t.common.backHome}</span>
            <LangPicker lang={lang} setLang={setLang} />
          </div>
        </div>

        {/* Split layout */}
        <div className="auth-split" style={{ flex: 1 }}>
          {/* Brand panel — hidden on mobile */}
          <div className="auth-brand-col">
            <div style={{ position: 'sticky', top: 0, height: '100vh' }}>
              <BrandPanel t={t} />
            </div>
          </div>

          {/* Form panel */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Desktop top bar (inside form panel) */}
            <div className="auth-desktop-topbar" style={{ alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '24px 32px' }}>
              <span onClick={() => navigate('/')} style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', cursor: 'pointer', padding: '0 8px', display: 'inline-flex', alignItems: 'center', height: 36, borderRadius: 10, transition: 'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ff2d55'}
                onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
              >{t.common.backHome}</span>
              <LangPicker lang={lang} setLang={setLang} />
            </div>

            {/* Form area */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
              <div style={{ width: '100%', maxWidth: 440 }}>

                {/* Mode tabs */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: 4, borderRadius: 12, background: '#f3f4f6', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <ModeTab active={mode === 'signin'} onClick={() => mode !== 'signin' && switchMode()}>
                      {t.signin.eyebrow}
                    </ModeTab>
                    <ModeTab active={mode === 'signup'} onClick={() => mode !== 'signup' && switchMode()}>
                      {t.signup.eyebrow}
                    </ModeTab>
                  </div>
                </div>

                {/* Heading */}
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.5px', color: '#111', margin: '0 0 8px', lineHeight: 1.1 }}>{current.title}</h2>
                  <p style={{ fontSize: 15, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{current.sub}</p>
                </div>

                {/* Form */}
                <div key={mode} className="auth-form-fade">
                  {mode === 'signin' ? (
                    <SignInForm s={t.signin} common={t.common} dir={dir} onSwitch={switchMode} />
                  ) : (
                    <SignUpForm s={signupWithOTP} common={t.common} dir={dir} onSwitch={switchMode} />
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 32px', textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
              {t.common.copy}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
