import React, { useState } from "react";

/**
 * AuthPage — Sign in / Sign up screen for AdverSolutions
 * Plain React component, no external UI libraries required.
 * Drop this file into any React app (Vite / CRA / Next "use client") and render <AuthPage />.
 *
 * Font: this design uses "Plus Jakarta Sans". Add it once in your app's <head> or global CSS:
 *   <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
 * If you skip it, the component falls back to system-ui fonts automatically.
 *
 * Wire up onSignIn / onSignUp props to your real auth calls — they currently
 * just simulate a network request (1.2s) and log the payload to console.
 */

const BRAND = "#ff2d55";
const BRAND_DARK = "#e2003c";
const FONT = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';

/* ---------------- icons (inline, no icon package needed) ---------------- */
const Icon = {
  Mail: (p) => (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...p}>
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Lock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...p}>
      <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...p}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Eye: (p) => (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  EyeOff: (p) => (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...p}>
      <path
        d="M3 3l18 18M10.5 10.7a2 2 0 002.8 2.8M9.5 5.4A11 11 0 0112 5c6.5 0 10 7 10 7a17.6 17.6 0 01-3.4 4.3M6.4 6.4A17.6 17.6 0 002 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  Arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...p}>
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" width="13" height="13" {...p}>
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Spinner: ({ style, ...p } = {}) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} style={{ animation: "auth-spin .8s linear infinite", ...style }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" fill="none" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  ),
};

/* ---------------- brand mark ---------------- */
function BrandMark({ light = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg viewBox="0 0 40 40" width="30" height="30">
        <defs>
          <linearGradient id="auth-bm" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#ff5d80" />
            <stop offset="1" stopColor={BRAND_DARK} />
          </linearGradient>
        </defs>
        <path d="M20 4 L34 32 H26 L20 18 L14 32 H6 Z" fill="url(#auth-bm)" />
        <path d="M20 4 L26 18 L20 18 Z" fill="#9a002a" opacity="0.55" />
      </svg>
      <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em", color: light ? "#fff" : "#111" }}>
        Adver<span style={{ color: BRAND }}>Solutions</span>
      </span>
    </div>
  );
}

/* ---------------- form field ---------------- */
function Field({ icon, label, type = "text", value, onChange, placeholder, autoComplete, withReveal, hint }) {
  const [reveal, setReveal] = useState(false);
  const [focused, setFocused] = useState(false);
  const t = withReveal ? (reveal ? "text" : "password") : type;

  return (
    <label style={{ display: "block" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#3a3a3d", letterSpacing: "0.02em", textTransform: "uppercase" }}>
          {label}
        </span>
        {hint && <span style={{ fontSize: 11.5, color: "#9a9a9e" }}>{hint}</span>}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 12,
          border: focused ? `1.5px solid ${BRAND}` : "1px solid rgba(0,0,0,0.1)",
          background: "#fff",
          boxShadow: focused ? "0 0 0 4px rgba(255,45,85,0.12)" : "none",
          transition: "all .15s",
        }}
      >
        <span style={{ paddingLeft: 14, display: "flex", color: focused ? BRAND : "#9a9a9e", transition: "color .15s" }}>{icon}</span>
        <input
          type={t}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "0 12px",
            height: 48,
            fontSize: 15,
            color: "#111",
            fontFamily: FONT,
          }}
        />
        {withReveal && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            tabIndex={-1}
            aria-label={reveal ? "Hide password" : "Show password"}
            style={{
              background: "transparent",
              border: "none",
              paddingRight: 14,
              display: "flex",
              color: "#9a9a9e",
              cursor: "pointer",
            }}
          >
            {reveal ? <Icon.EyeOff /> : <Icon.Eye />}
          </button>
        )}
      </div>
    </label>
  );
}

/* ---------------- country dial codes (Morocco default) ---------------- */
const COUNTRIES = [
  { code: "MA", dial: "212", flag: "🇲🇦", name: "Morocco" },
  { code: "US", dial: "1", flag: "🇺🇸", name: "United States" },
  { code: "GB", dial: "44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "FR", dial: "33", flag: "🇫🇷", name: "France" },
  { code: "ES", dial: "34", flag: "🇪🇸", name: "Spain" },
  { code: "DE", dial: "49", flag: "🇩🇪", name: "Germany" },
  { code: "IT", dial: "39", flag: "🇮🇹", name: "Italy" },
  { code: "AE", dial: "971", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "SA", dial: "966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "QA", dial: "974", flag: "🇶🇦", name: "Qatar" },
  { code: "KW", dial: "965", flag: "🇰🇼", name: "Kuwait" },
  { code: "EG", dial: "20", flag: "🇪🇬", name: "Egypt" },
  { code: "DZ", dial: "213", flag: "🇩🇿", name: "Algeria" },
  { code: "TN", dial: "216", flag: "🇹🇳", name: "Tunisia" },
  { code: "TR", dial: "90", flag: "🇹🇷", name: "Turkey" },
  { code: "CA", dial: "1", flag: "🇨🇦", name: "Canada" },
  { code: "NL", dial: "31", flag: "🇳🇱", name: "Netherlands" },
  { code: "BE", dial: "32", flag: "🇧🇪", name: "Belgium" },
  { code: "PT", dial: "351", flag: "🇵🇹", name: "Portugal" },
  { code: "IN", dial: "91", flag: "🇮🇳", name: "India" },
  { code: "PK", dial: "92", flag: "🇵🇰", name: "Pakistan" },
  { code: "AU", dial: "61", flag: "🇦🇺", name: "Australia" },
  { code: "BR", dial: "55", flag: "🇧🇷", name: "Brazil" },
];

/* ---------------- phone field with country-code selector ---------------- */
function PhoneField({ label, country, onCountryChange, value, onChange, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <label style={{ display: "block" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#3a3a3d", letterSpacing: "0.02em", textTransform: "uppercase" }}>
          {label}
        </span>
        {hint && <span style={{ fontSize: 11.5, color: "#9a9a9e" }}>{hint}</span>}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 12,
          border: focused ? `1.5px solid ${BRAND}` : "1px solid rgba(0,0,0,0.1)",
          background: "#fff",
          boxShadow: focused ? "0 0 0 4px rgba(255,45,85,0.12)" : "none",
          transition: "all .15s",
        }}
      >
        <select
          value={country.code}
          onChange={(e) => onCountryChange(COUNTRIES.find((c) => c.code === e.target.value) || COUNTRIES[0])}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            height: 48,
            paddingLeft: 14,
            paddingRight: 6,
            fontSize: 14.5,
            color: "#111",
            fontFamily: FONT,
            cursor: "pointer",
            borderRight: "1px solid rgba(0,0,0,0.08)",
            maxWidth: 108,
          }}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} +{c.dial}
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d\s-]/g, ""))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="6XX XXX XXX"
          autoComplete="tel-national"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "0 12px",
            height: 48,
            fontSize: 15,
            color: "#111",
            fontFamily: FONT,
            minWidth: 0,
          }}
        />
      </div>
    </label>
  );
}

/* ---------------- password strength ---------------- */
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
const STRENGTH_LABELS = ["Too short", "Weak", "Okay", "Strong", "Excellent"];
const STRENGTH_COLORS = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#10b981"];

function StrengthMeter({ pw }) {
  const s = strengthOf(pw);
  if (s < 0) return null;
  return (
    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 5,
              borderRadius: 999,
              background: i < s ? STRENGTH_COLORS[s] : "rgba(0,0,0,0.08)",
              transition: "background .2s",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: STRENGTH_COLORS[s] }}>{STRENGTH_LABELS[s]}</span>
    </div>
  );
}

/* ---------------- checkbox ---------------- */
function Checkbox({ checked, onChange, children }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 9, cursor: "pointer", userSelect: "none" }}>
      <span
        onClick={() => onChange(!checked)}
        style={{
          width: 18,
          height: 18,
          marginTop: 1,
          flexShrink: 0,
          borderRadius: 6,
          border: checked ? `1.5px solid ${BRAND}` : "1.5px solid rgba(0,0,0,0.18)",
          background: checked ? BRAND : "#fff",
          display: "grid",
          placeItems: "center",
          transition: "all .15s",
        }}
      >
        {checked && <Icon.Check style={{ color: "#fff" }} />}
      </span>
      <span style={{ fontSize: 13, color: "#5b5b60", lineHeight: 1.4 }}>{children}</span>
    </label>
  );
}

/* ---------------- primary submit button ---------------- */
function SubmitButton({ loading, disabled, children }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      style={{
        width: "100%",
        height: 50,
        borderRadius: 100,
        border: "none",
        background: `linear-gradient(180deg, #ff5470, ${BRAND})`,
        color: "#fff",
        fontSize: 15,
        fontWeight: 700,
        fontFamily: FONT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: loading || disabled ? "not-allowed" : "pointer",
        opacity: disabled && !loading ? 0.5 : 1,
        boxShadow: "0 16px 30px -12px rgba(255,45,85,0.5)",
        transition: "transform .15s, box-shadow .15s",
      }}
      onMouseEnter={(e) => {
        if (!loading && !disabled) e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {loading ? <Icon.Spinner /> : children}
    </button>
  );
}

/* ---------------- sign in form ---------------- */
function SignInForm({ onSwitch, onSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    Promise.resolve(onSignIn ? onSignIn({ email, password, remember }) : new Promise((r) => setTimeout(r, 1200)))
      .catch((err) => setError(err && err.message ? err.message : "Something went wrong. Please try again."))
      .finally(() => setLoading(false));
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field icon={<Icon.Mail />} label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@company.com" autoComplete="email" />
      <div>
        <Field icon={<Icon.Lock />} label="Password" value={password} onChange={setPassword} placeholder="••••••••••" autoComplete="current-password" withReveal />
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Checkbox checked={remember} onChange={setRemember}>
            Keep me signed in
          </Checkbox>
          <a href="#" style={{ fontSize: 13, fontWeight: 700, color: BRAND, textDecoration: "none" }}>
            Forgot password?
          </a>
        </div>
      </div>
      {error && (
        <div style={{ background: "#fef2f3", color: "#c4111f", borderRadius: 10, padding: "10px 14px", fontSize: 13.5, fontWeight: 600 }}>
          {error}
        </div>
      )}
      <SubmitButton loading={loading}>
        Sign in
        <Icon.Arrow />
      </SubmitButton>
      <p style={{ textAlign: "center", fontSize: 14, color: "#5b5b60", margin: 0 }}>
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          style={{ background: "none", border: "none", padding: 0, font: "inherit", fontWeight: 700, color: BRAND, cursor: "pointer" }}
        >
          Create account
        </button>
      </p>
    </form>
  );
}

/* ---------------- sign up form ---------------- */
function SignUpForm({ onSwitch, onSignUp }) {
  const [step, setStep] = useState("form"); // "form" | "verify"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]); // Morocco default
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState("");

  const mismatched = confirm.length > 0 && confirm !== password;
  const phoneDigits = phone.replace(/\D/g, "");
  const canContinue = name.trim() && email.trim() && phoneDigits && password && !mismatched && agree;

  const goToVerify = (e) => {
    e.preventDefault();
    if (!canContinue) return;
    setError("");
    setStep("verify");
  };

  if (step === "verify") {
    return (
      <VerifyStep
        data={{ name, email, password, fullPhone: country.dial + phoneDigits }}
        onBack={() => setStep("form")}
        onSignUp={onSignUp}
      />
    );
  }

  return (
    <form onSubmit={goToVerify} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field icon={<Icon.User />} label="Full name" value={name} onChange={setName} placeholder="Sarah Johnson" autoComplete="name" />
      <Field icon={<Icon.Mail />} label="Work email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" autoComplete="email" />
      <PhoneField
        label="WhatsApp number"
        country={country}
        onCountryChange={setCountry}
        value={phone}
        onChange={setPhone}
        hint="used to verify your account"
      />
      <div>
        <Field
          icon={<Icon.Lock />}
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••••"
          autoComplete="new-password"
          withReveal
          hint="8+ chars, mix of letters & numbers"
        />
        <StrengthMeter pw={password} />
      </div>
      <div>
        <Field
          icon={<Icon.Lock />}
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          placeholder="••••••••••"
          autoComplete="new-password"
          withReveal
        />
        {mismatched && <div style={{ marginTop: 6, fontSize: 12, color: "#ef4444", fontWeight: 600 }}>Passwords don't match</div>}
      </div>
      <Checkbox checked={agree} onChange={setAgree}>
        I agree to the <a href="#" style={{ color: "#171719", fontWeight: 700, textDecoration: "underline" }}>Terms</a> and{" "}
        <a href="#" style={{ color: "#171719", fontWeight: 700, textDecoration: "underline" }}>Privacy Policy</a>.
      </Checkbox>
      {error && (
        <div style={{ background: "#fef2f3", color: "#c4111f", borderRadius: 10, padding: "10px 14px", fontSize: 13.5, fontWeight: 600 }}>
          {error}
        </div>
      )}
      <SubmitButton disabled={!canContinue}>
        Next
        <Icon.Arrow />
      </SubmitButton>
      <p style={{ textAlign: "center", fontSize: 14, color: "#5b5b60", margin: 0 }}>
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          style={{ background: "none", border: "none", padding: 0, font: "inherit", fontWeight: 700, color: BRAND, cursor: "pointer" }}
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

/* ---------------- OTP verification step (email + WhatsApp, either is enough) ---------------- */
function OtpChannelCard({ title, subtitle, sendLabel, onSend, onVerify, verified }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = async () => {
    setError("");
    setSending(true);
    try {
      await onSend();
      setSent(true);
      setCooldown(60);
    } catch (err) {
      setError(err && err.message ? err.message : "Failed to send code.");
    } finally {
      setSending(false);
    }
  };

  const verify = async () => {
    if (!code.trim()) return;
    setError("");
    setVerifying(true);
    try {
      await onVerify(code.trim());
    } catch (err) {
      setError(err && err.message ? err.message : "Invalid code.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div
      style={{
        borderRadius: 14,
        border: verified ? `1.5px solid #22c55e` : "1px solid rgba(0,0,0,0.1)",
        background: verified ? "#f0fdf4" : "#fff",
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#111" }}>{title}</div>
          <div style={{ fontSize: 12.5, color: "#8a8a8e", marginTop: 2 }}>{subtitle}</div>
        </div>
        {verified && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "#22c55e",
              color: "#fff",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            <Icon.Check /> Verified
          </span>
        )}
      </div>

      {!verified && (
        <>
          {!sent ? (
            <button
              type="button"
              onClick={send}
              disabled={sending}
              style={{
                height: 42,
                borderRadius: 10,
                border: `1.5px solid ${BRAND}`,
                background: "#fff",
                color: BRAND,
                fontWeight: 700,
                fontSize: 13.5,
                fontFamily: FONT,
                cursor: sending ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {sending ? <Icon.Spinner style={{ color: BRAND }} /> : sendLabel}
            </button>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit code"
                  inputMode="numeric"
                  style={{
                    flex: 1,
                    height: 42,
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.12)",
                    padding: "0 12px",
                    fontSize: 15,
                    letterSpacing: 4,
                    fontFamily: FONT,
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={verify}
                  disabled={verifying || code.length < 6}
                  style={{
                    height: 42,
                    padding: "0 18px",
                    borderRadius: 10,
                    border: "none",
                    background: BRAND,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13.5,
                    fontFamily: FONT,
                    cursor: verifying || code.length < 6 ? "not-allowed" : "pointer",
                    opacity: verifying || code.length < 6 ? 0.6 : 1,
                  }}
                >
                  {verifying ? <Icon.Spinner /> : "Verify"}
                </button>
              </div>
              <button
                type="button"
                onClick={send}
                disabled={cooldown > 0 || sending}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: cooldown > 0 ? "#b0b0b3" : BRAND,
                  cursor: cooldown > 0 ? "default" : "pointer",
                  alignSelf: "flex-start",
                }}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
            </>
          )}
          {error && <div style={{ fontSize: 12.5, color: "#ef4444", fontWeight: 600 }}>{error}</div>}
        </>
      )}
    </div>
  );
}

function VerifyStep({ data, onBack, onSignUp }) {
  const [emailVerified, setEmailVerified] = useState(false);
  const [waVerified, setWaVerified] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const finish = async (verifiedVia) => {
    setError("");
    setCreating(true);
    try {
      await Promise.resolve(
        onSignUp
          ? onSignUp({ name: data.name, email: data.email, password: data.password, phone: data.fullPhone, verifiedVia })
          : new Promise((r) => setTimeout(r, 1000))
      );
    } catch (err) {
      setError(err && err.message ? err.message : "Something went wrong creating your account.");
      setCreating(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ margin: 0, fontSize: 14, color: "#5b5b60", lineHeight: 1.5 }}>
        Verify your account with <strong>either</strong> your email or your WhatsApp number to finish creating it.
      </p>

      <OtpChannelCard
        title="Email"
        subtitle={data.email}
        sendLabel="Send code to email"
        onSend={async () => {
          const r = await fetch("/api/email-otp?action=send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: data.email }),
          });
          const json = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(json.error || "Failed to send email code.");
        }}
        onVerify={async (code) => {
          const r = await fetch("/api/email-otp?action=verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: data.email, otp: code }),
          });
          const json = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(json.error || "Invalid code.");
          setEmailVerified(true);
          finish("email");
        }}
        verified={emailVerified}
      />

      <OtpChannelCard
        title="WhatsApp"
        subtitle={`+${data.fullPhone}`}
        sendLabel="Send code via WhatsApp"
        onSend={async () => {
          const r = await fetch("/api/otp?action=send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: data.fullPhone }),
          });
          const json = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(json.error || "Failed to send WhatsApp code.");
        }}
        onVerify={async (code) => {
          const r = await fetch("/api/otp?action=verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: data.fullPhone, otp: code }),
          });
          const json = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(json.error || "Invalid code.");
          setWaVerified(true);
          finish("whatsapp");
        }}
        verified={waVerified}
      />

      {error && (
        <div style={{ background: "#fef2f3", color: "#c4111f", borderRadius: 10, padding: "10px 14px", fontSize: 13.5, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {creating && !error && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13.5, color: "#5b5b60", fontWeight: 600 }}>
          <Icon.Spinner style={{ color: BRAND }} /> Creating your account…
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        disabled={creating}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          fontSize: 13.5,
          fontWeight: 700,
          color: "#8a8a8e",
          cursor: creating ? "default" : "pointer",
          alignSelf: "flex-start",
        }}
      >
        ← Back
      </button>
    </div>
  );
}

/* ---------------- mode tabs ---------------- */
function ModeTabs({ mode, setMode }) {
  const tabStyle = (active) => ({
    padding: "8px 18px",
    borderRadius: 9,
    fontSize: 13.5,
    fontWeight: 700,
    fontFamily: FONT,
    border: "none",
    cursor: "pointer",
    background: active ? "#fff" : "transparent",
    color: active ? "#111" : "#8a8a8e",
    boxShadow: active ? "0 2px 8px -2px rgba(0,0,0,0.1)" : "none",
    transition: "all .15s",
  });
  return (
    <div style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: 12, background: "#f4f4f5", border: "1px solid rgba(0,0,0,0.05)" }}>
      <button type="button" style={tabStyle(mode === "signin")} onClick={() => setMode("signin")}>
        Sign in
      </button>
      <button type="button" style={tabStyle(mode === "signup")} onClick={() => setMode("signup")}>
        Create account
      </button>
    </div>
  );
}

/* ---------------- brand side panel ---------------- */
function BrandPanel() {
  const stats = [
    { n: "500+", l: "Agencies trust us" },
    { n: "$120M+", l: "Ad spend managed" },
    { n: "24/7", l: "Live support" },
  ];
  const features = [
    { t: "Pre-verified ad accounts", d: "Meta · Google · TikTok · Snapchat · Bing — ready to launch." },
    { t: "Balance warranty", d: "Every account ships with protection on unspent balance." },
    { t: "Real-time tracking", d: "Monitor performance and scale with confidence." },
  ];
  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        overflow: "hidden",
        color: "#fff",
        background: "linear-gradient(160deg, #1a0510, #3a0419 55%, #0a0207)",
        padding: "48px 44px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 420,
          height: 420,
          borderRadius: 999,
          filter: "blur(90px)",
          opacity: 0.55,
          background: "radial-gradient(circle, rgba(255,45,85,0.6), transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -140,
          left: -80,
          width: 380,
          height: 380,
          borderRadius: 999,
          filter: "blur(90px)",
          opacity: 0.4,
          background: "radial-gradient(circle, rgba(255,79,122,0.5), transparent 70%)",
        }}
      />

      <div style={{ position: "relative" }}>
        <BrandMark light />
      </div>

      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28, maxWidth: 440 }}>
        <div
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.16)",
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "#ff5d80" }} />
          AdverSolutions
        </div>

        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.08, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Scale your ads,
          <br />
          <span style={{ background: "linear-gradient(90deg,#ff5d80,#ffb3c4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            faster.
          </span>
        </h1>

        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.7)" }}>
          Access pre-verified ad accounts and manage every campaign from one premium dashboard.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 10px" }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{s.n}</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", marginTop: 4, lineHeight: 1.3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                borderRadius: 14,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "12px 14px",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: `linear-gradient(135deg,#ff4f7a,${BRAND})`,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 4px 14px -2px rgba(255,45,85,0.5)",
                }}
              >
                <Icon.Check style={{ color: "#fff" }} />
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{f.t}</div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.4, marginTop: 2 }}>{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- main export ---------------- */
function AuthPage({ initialMode = "signin", onSignIn, onSignUp }) {
  const [mode, setMode] = useState(initialMode);
  const switchMode = () => setMode((m) => (m === "signin" ? "signup" : "signin"));

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: FONT, display: "grid", gridTemplateColumns: "1.05fr 1fr" }} className="adver-auth-root">
      <style>{`
        @keyframes auth-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .adver-auth-root { grid-template-columns: 1fr !important; }
          .adver-auth-brand { display: none !important; }
        }
      `}</style>

      <div className="adver-auth-brand">
        <BrandPanel />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "24px 40px 0" }}>
          <a href="/" style={{ fontSize: 13, fontWeight: 700, color: "#5b5b60", textDecoration: "none" }}>
            ← Back to site
          </a>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <div style={{ marginBottom: 28 }}>
              <ModeTabs mode={mode} setMode={setMode} />
            </div>

            <div style={{ marginBottom: 28 }}>
              <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em", color: "#111" }}>
                {mode === "signin" ? "Welcome back" : "Start scaling today"}
              </h2>
              <p style={{ margin: "8px 0 0", fontSize: 15, color: "#8a8a8e", lineHeight: 1.5 }}>
                {mode === "signin"
                  ? "Sign in to your account to continue scaling."
                  : "Get instant access to verified ad accounts on every major platform."}
              </p>
            </div>

            {mode === "signin" ? (
              <SignInForm onSwitch={switchMode} onSignIn={onSignIn} />
            ) : (
              <SignUpForm onSwitch={switchMode} onSignUp={onSignUp} />
            )}
          </div>
        </div>

        <div style={{ padding: "0 24px 24px", textAlign: "center", fontSize: 12, color: "#b0b0b3" }}>
          © 2026 AdverSolutions. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
