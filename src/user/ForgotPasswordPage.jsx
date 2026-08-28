import React, { useState, useRef } from "react";

/**
 * ForgotPasswordPage — Reset password flow for AdverSolutions
 * 3 steps: Email -> Verification code -> New password -> success
 * Wired to the real backend: /api/password-reset?action=request|verify|complete
 */

const BRAND = "#ff2d55";
const BRAND_DARK = "#e2003c";
const FONT = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';

/* ---------------- icons ---------------- */
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
  BigCheck: (p) => (
    <svg viewBox="0 0 24 24" fill="none" width="30" height="30" {...p}>
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Spinner: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} style={{ animation: "fp-spin .8s linear infinite" }}>
      <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.35)" strokeWidth="3" fill="none" />
      <path d="M21 12a9 9 0 00-9-9" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  ),
};

function BrandMark({ light = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg viewBox="0 0 40 40" width="30" height="30">
        <defs>
          <linearGradient id="fp-bm" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#ff5d80" />
            <stop offset="1" stopColor={BRAND_DARK} />
          </linearGradient>
        </defs>
        <path d="M20 4 L34 32 H26 L20 18 L14 32 H6 Z" fill="url(#fp-bm)" />
        <path d="M20 4 L26 18 L20 18 Z" fill="#9a002a" opacity="0.55" />
      </svg>
      <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em", color: light ? "#fff" : "#111" }}>
        Adver<span style={{ color: BRAND }}>Solutions</span>
      </span>
    </div>
  );
}

/* ---------------- step indicator ---------------- */
function StepIndicator({ step }) {
  const steps = [1, 2, 3];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              fontSize: 13,
              fontWeight: 800,
              flexShrink: 0,
              background: s < step ? "#22c55e" : s === step ? `linear-gradient(180deg,#ff5470,${BRAND})` : "#f0f0f1",
              color: s <= step ? "#fff" : "#a0a0a4",
              boxShadow: s === step ? "0 6px 16px -4px rgba(255,45,85,0.5)" : "none",
              transition: "all .25s",
            }}
          >
            {s < step ? <Icon.Check /> : s}
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 2,
                margin: "0 8px",
                borderRadius: 999,
                background: s < step ? "#22c55e" : "#eeeeef",
                transition: "background .25s",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------------- form field ---------------- */
function Field({ icon, label, type = "text", value, onChange, placeholder, autoComplete, withReveal, hint, autoFocus }) {
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
          autoFocus={autoFocus}
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
            style={{ background: "transparent", border: "none", paddingRight: 14, display: "flex", color: "#9a9a9e", cursor: "pointer" }}
          >
            {reveal ? <Icon.EyeOff /> : <Icon.Eye />}
          </button>
        )}
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
          <div key={i} style={{ height: 5, borderRadius: 999, background: i < s ? STRENGTH_COLORS[s] : "rgba(0,0,0,0.08)", transition: "background .2s" }} />
        ))}
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: STRENGTH_COLORS[s] }}>{STRENGTH_LABELS[s]}</span>
    </div>
  );
}

/* ---------------- submit button ---------------- */
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
      onMouseEnter={(e) => { if (!loading && !disabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {loading ? <Icon.Spinner /> : children}
    </button>
  );
}

/* ---------------- 6-digit code input ---------------- */
function CodeInput({ value, onChange, error }) {
  const refs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const setDigit = (i, v) => {
    const clean = v.replace(/[^0-9]/g, "").slice(-1);
    const next = digits.slice();
    next[i] = clean;
    const joined = next.join("").replace(/\s+$/, "");
    onChange(joined);
    if (clean && i < 5) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (text) {
      e.preventDefault();
      onChange(text);
      refs.current[Math.min(text.length, 5)]?.focus();
    }
  };

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }} onPaste={onPaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          inputMode="numeric"
          maxLength={1}
          autoFocus={i === 0}
          style={{
            width: "100%",
            aspectRatio: "1",
            textAlign: "center",
            fontSize: 22,
            fontWeight: 800,
            color: "#111",
            borderRadius: 12,
            border: error ? "1.5px solid #ef4444" : d ? `1.5px solid ${BRAND}` : "1px solid rgba(0,0,0,0.12)",
            outline: "none",
            fontFamily: FONT,
            background: d ? "#fff5f7" : "#fff",
            boxShadow: d ? "0 0 0 4px rgba(255,45,85,0.1)" : "none",
            transition: "all .15s",
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- Step 1: email ---------------- */
function StepEmail({ email, setEmail, onNext, onSendCode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    Promise.resolve(onSendCode({ email }))
      .then(() => onNext())
      .catch((err) => setError(err?.message || "Couldn't send the code. Try again."))
      .finally(() => setLoading(false));
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Field icon={<Icon.Mail />} label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@company.com" autoComplete="email" autoFocus />
      {error && <div style={{ fontSize: 12.5, color: "#ef4444", fontWeight: 600 }}>{error}</div>}
      <SubmitButton loading={loading} disabled={!email}>
        Send Code
        <Icon.Arrow />
      </SubmitButton>
    </form>
  );
}

/* ---------------- Step 2: code ---------------- */
function StepCode({ email, onNext, onBack, onVerifyCode, onSendCode }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    Promise.resolve(onVerifyCode({ email, code }))
      .then(() => onNext())
      .catch((err) => setError(err?.message || "Incorrect code. Please try again."))
      .finally(() => setLoading(false));
  };

  const resend = () => {
    setResending(true);
    setResent(false);
    Promise.resolve(onSendCode({ email }))
      .then(() => setResent(true))
      .finally(() => setResending(false));
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontSize: 13.5, color: "#5b5b60", lineHeight: 1.5 }}>
        We sent a 6-digit code to <strong style={{ color: "#171719" }}>{email || "your email"}</strong>.
      </div>
      <CodeInput value={code} onChange={setCode} error={!!error} />
      {error && <div style={{ fontSize: 12.5, color: "#ef4444", fontWeight: 600 }}>{error}</div>}
      <SubmitButton loading={loading} disabled={code.length < 6}>
        Verify Code
        <Icon.Arrow />
      </SubmitButton>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", padding: 0, fontSize: 13, fontWeight: 700, color: "#5b5b60", cursor: "pointer", fontFamily: FONT }}>
          ← Change email
        </button>
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          style={{ background: "none", border: "none", padding: 0, fontSize: 13, fontWeight: 700, color: BRAND, cursor: resending ? "not-allowed" : "pointer", fontFamily: FONT }}
        >
          {resending ? "Sending…" : resent ? "Code sent ✓" : "Resend code"}
        </button>
      </div>
    </form>
  );
}

/* ---------------- Step 3: new password ---------------- */
function StepNewPassword({ email, onNext, onResetPassword }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mismatched = confirm.length > 0 && confirm !== password;
  const tooWeak = password.length > 0 && strengthOf(password) < 1;

  const submit = (e) => {
    e.preventDefault();
    if (mismatched || tooWeak) return;
    setError("");
    setLoading(true);
    Promise.resolve(onResetPassword({ email, password }))
      .then(() => onNext())
      .catch((err) => setError(err?.message || "Couldn't reset your password. Try again."))
      .finally(() => setLoading(false));
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <Field icon={<Icon.Lock />} label="New password" value={password} onChange={setPassword} placeholder="••••••••••" autoComplete="new-password" withReveal hint="8+ chars, mix of letters & numbers" autoFocus />
        <StrengthMeter pw={password} />
      </div>
      <div>
        <Field icon={<Icon.Lock />} label="Confirm new password" value={confirm} onChange={setConfirm} placeholder="••••••••••" autoComplete="new-password" withReveal />
        {mismatched && <div style={{ marginTop: 6, fontSize: 12, color: "#ef4444", fontWeight: 600 }}>Passwords don't match</div>}
      </div>
      {error && <div style={{ fontSize: 12.5, color: "#ef4444", fontWeight: 600 }}>{error}</div>}
      <SubmitButton loading={loading} disabled={!password || mismatched || tooWeak}>
        Reset Password
        <Icon.Arrow />
      </SubmitButton>
    </form>
  );
}

/* ---------------- Step 4: success ---------------- */
function StepSuccess({ loginHref }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8, padding: "12px 0 4px" }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(135deg,#22c55e,#16a34a)",
          color: "#fff",
          boxShadow: "0 16px 32px -10px rgba(34,197,94,0.5)",
          marginBottom: 8,
        }}
      >
        <Icon.BigCheck />
      </div>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111" }}>Password reset</h2>
      <p style={{ margin: "4px 0 20px", fontSize: 14.5, color: "#8a8a8e", lineHeight: 1.5, maxWidth: 320 }}>
        Your password has been updated successfully. You can now sign in with your new password.
      </p>
      <a
        href={loginHref}
        style={{
          width: "100%",
          height: 50,
          borderRadius: 100,
          background: `linear-gradient(180deg, #ff5470, ${BRAND})`,
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          textDecoration: "none",
          boxShadow: "0 16px 30px -12px rgba(255,45,85,0.5)",
        }}
      >
        Continue to Sign in
        <Icon.Arrow />
      </a>
    </div>
  );
}

/* ---------------- brand side panel ---------------- */
function BrandPanel({ backHref }) {
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
      <div style={{ position: "absolute", top: -120, right: -120, width: 420, height: 420, borderRadius: 999, filter: "blur(90px)", opacity: 0.55, background: "radial-gradient(circle, rgba(255,45,85,0.6), transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: -140, left: -80, width: 380, height: 380, borderRadius: 999, filter: "blur(90px)", opacity: 0.4, background: "radial-gradient(circle, rgba(255,79,122,0.5), transparent 70%)" }} />

      <div style={{ position: "relative" }}>
        <a href={backHref} style={{ textDecoration: "none" }}>
          <BrandMark light />
        </a>
      </div>

      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28, maxWidth: 440 }}>
        <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)", fontSize: 12.5, fontWeight: 700 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "#ff5d80" }} />
          Account recovery
        </div>

        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.08, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Let's get you
          <br />
          <span style={{ background: "linear-gradient(90deg,#ff5d80,#ffb3c4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            back in.
          </span>
        </h1>

        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.7)" }}>
          A few quick steps and you'll be back to managing your ad accounts.
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
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 14px" }}>
              <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg,#ff4f7a,${BRAND})`, display: "grid", placeItems: "center", boxShadow: "0 4px 14px -2px rgba(255,45,85,0.5)" }}>
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

const STEP_META = {
  1: { title: "Reset your password", sub: "Enter the email linked to your account and we'll send you a verification code." },
  2: { title: "Check your email", sub: "Enter the 6-digit code we just sent you." },
  3: { title: "Choose a new password", sub: "Make it strong — at least 8 characters with a mix of letters and numbers." },
};

/* ---------------- main export ---------------- */
export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const resetTokenRef = useRef(null);

  const backHref = "#/";
  const loginHref = "#/login";

  const sendCode = async ({ email }) => {
    const r = await fetch("/api/password-reset?action=request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Failed to send code");
  };

  const verifyCode = async ({ email, code }) => {
    const r = await fetch("/api/password-reset?action=verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), otp: code }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Verification failed");
    resetTokenRef.current = data.resetToken;
  };

  const resetPassword = async ({ password }) => {
    const r = await fetch("/api/password-reset?action=complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetToken: resetTokenRef.current, newPassword: password }),
    });
    const data = await r.json();
    if (!r.ok || data.error) throw new Error(data.error || "Failed to update password");
  };

  const meta = STEP_META[step] || {};

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: FONT, display: "grid", gridTemplateColumns: "1.05fr 1fr" }} className="fp-auth-root">
      <style>{`
        @keyframes fp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .fp-auth-root { grid-template-columns: 1fr !important; }
          .fp-auth-brand { display: none !important; }
        }
      `}</style>

      <div className="fp-auth-brand">
        <BrandPanel backHref={backHref} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "24px 40px 0" }}>
          <a href={backHref} style={{ fontSize: 13, fontWeight: 700, color: "#5b5b60", textDecoration: "none" }}>
            ← Back to site
          </a>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            {step <= 3 && <StepIndicator step={step} />}

            {step <= 3 && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.01em", color: "#111" }}>{meta.title}</h2>
                <p style={{ margin: "8px 0 0", fontSize: 14.5, color: "#8a8a8e", lineHeight: 1.5 }}>{meta.sub}</p>
              </div>
            )}

            {step === 1 && <StepEmail email={email} setEmail={setEmail} onNext={() => setStep(2)} onSendCode={sendCode} />}
            {step === 2 && (
              <StepCode email={email} onNext={() => setStep(3)} onBack={() => setStep(1)} onVerifyCode={verifyCode} onSendCode={sendCode} />
            )}
            {step === 3 && <StepNewPassword email={email} onNext={() => setStep(4)} onResetPassword={resetPassword} />}
            {step === 4 && <StepSuccess loginHref={loginHref} />}

            {step <= 3 && (
              <p style={{ textAlign: "center", fontSize: 13.5, color: "#5b5b60", marginTop: 24 }}>
                Remembered your password?{" "}
                <a href={loginHref} style={{ fontWeight: 700, color: BRAND, textDecoration: "none" }}>
                  Back to sign in
                </a>
              </p>
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
