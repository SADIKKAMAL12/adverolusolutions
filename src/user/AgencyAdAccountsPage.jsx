import { C, PLATFORMS, getThemeColors } from '../shared/theme.js'
import { useState, useEffect } from 'react'
import { useStore } from '../shared/store.js'
import { useNavigate } from '../shared/Router.jsx'
import { useTheme } from '../shared/ThemeContext.jsx'
import { PageShell, Card, Btn, PlatformIcon, Badge, DataTable, StepHeader, Input, Select } from '../shared/UI.jsx'
import { createAdAccountRequest, updateUser } from '../lib/db.js'

const DEFAULT_PRICES = { price: 50, fee: 6, minTopup: 200, active: true };

function getPlatformPrice(platformId, platformPrices) {
  const entry = (platformPrices || {})[platformId];
  return {
    price:    entry?.price    ?? DEFAULT_PRICES.price,
    fee:      entry?.fee      ?? DEFAULT_PRICES.fee,
    minTopup: entry?.minTopup ?? DEFAULT_PRICES.minTopup,
  };
}

function getActivePlatforms(platformPrices) {
  return PLATFORMS.filter(p => {
    const entry = (platformPrices || {})[p.id];
    return entry === undefined ? true : entry.active !== false;
  });
}

const WIZARD_STEPS = [
  { label: "Choose Platform",    sub: "Select ad platform" },
  { label: "Account Details",    sub: "Basic information" },
  { label: "Business Info",      sub: "Your business details" },
  { label: "Review & Payment",   sub: "Confirm & pay" },
  { label: "Confirmation",       sub: "Track your request" },
];

function WizardStep1({ data, set, onNext, platformPrices }) {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Card>
        <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: TC.text, letterSpacing: "-0.01em" }}>Choose Your Platform</h2>
        <p style={{ margin: "0 0 26px", fontSize: 14, fontWeight: 500, color: TC.g500 }}>Select the advertising platform for which you want an agency ad account.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 30 }}>
          {getActivePlatforms(platformPrices).map(p => {
            const sel = data.platform === p.id;
            return (
              <div key={p.id} onClick={() => set("platform", p.id)}
                style={{ border: `2px solid ${sel ? C.primary : TC.g200}`, borderRadius: 14, padding: "22px 20px", cursor: "pointer", background: sel ? TC.primaryLight : TC.card, transition: "all .2s", position: "relative" }}>
                {sel && <div style={{ position: "absolute", top: 14, right: 14, width: 22, height: 22, background: C.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</div>}
                <div style={{ marginBottom: 12 }}><PlatformIcon name={p.icon} size={32} /></div>
                <div style={{ fontWeight: 900, fontSize: 16, color: TC.text, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: TC.g500 }}>{p.sub}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Btn size="lg" style={{ minWidth: 160, opacity: data.platform ? 1 : .4, cursor: data.platform ? "pointer" : "default" }} onClick={() => data.platform && onNext()}>
            Continue →
          </Btn>
        </div>
        {!data.platform && <p style={{ textAlign: "right", fontSize: 12, color: TC.g400, margin: "8px 0 0" }}>Please select a platform to continue</p>}
      </Card>
    </div>
  );
}

function WizardStep2({ data, set, onNext, onBack }) {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const isMeta = data.platform === "meta";
  const isGoogle = data.platform === "google";
  const ok = data.accountName && data.timezone && data.currency && (isMeta || isGoogle ? data.websites.length > 0 : true) && (isMeta ? data.pageLinks.length > 0 : true);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Card>
        <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: TC.text, letterSpacing: "-0.01em" }}>Account Details</h2>
        <p style={{ margin: "0 0 24px", fontSize: 14, fontWeight: 500, color: TC.g500 }}>Enter basic information for your ad account.</p>
        <Input label="Account Name" required value={data.accountName} onChange={e => set("accountName", e.target.value)} placeholder="e.g. My Agency Account" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Select label="Timezone" required value={data.timezone} onChange={e => set("timezone", e.target.value)}
            options={["(GMT+00:00) UTC", "(GMT-05:00) Eastern Time (US)", "(GMT-08:00) Pacific Time (US)", "(GMT+01:00) Central European Time", "(GMT+01:00) Casablanca (WET)", "(GMT+03:00) Riyadh (AST)"]} />
          <Select label="Currency" required value={data.currency} onChange={e => set("currency", e.target.value)}
            options={["USD – US Dollar", "EUR – Euro", "GBP – British Pound", "AED – UAE Dirham", "MAD – Moroccan Dirham", "SAR – Saudi Riyal"]} />
        </div>
        {(isMeta || isGoogle) && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: TC.g600, marginBottom: 7, fontWeight: 600 }}>Website{(isMeta || isGoogle) ? <span style={{ color: C.primary }}> *</span> : ""}</label>
              {data.websites.map((w, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input value={w} onChange={e => {
                    const arr = [...data.websites];
                    arr[i] = e.target.value;
                    set("websites", arr);
                  }} placeholder="https://myagency.com" style={{ flex: 1, border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", background: TC.card, color: TC.text }} />
                  {data.websites.length > 1 && <Btn variant="outline" size="sm" onClick={() => set("websites", data.websites.filter((_, idx) => idx !== i))}>✕</Btn>}
                </div>
              ))}
              <Btn variant="outline" size="sm" onClick={() => set("websites", [...data.websites, ""])}>+ Add Website</Btn>
            </div>
          </>
        )}
        {isMeta && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: TC.g600, marginBottom: 7, fontWeight: 600 }}>Page Link<span style={{ color: C.primary }}> *</span></label>
            {data.pageLinks.map((w, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={w} onChange={e => {
                  const arr = [...data.pageLinks];
                  arr[i] = e.target.value;
                  set("pageLinks", arr);
                }} placeholder="https://facebook.com/mypage" style={{ flex: 1, border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", background: TC.card, color: TC.text }} />
                {data.pageLinks.length > 1 && <Btn variant="outline" size="sm" onClick={() => set("pageLinks", data.pageLinks.filter((_, idx) => idx !== i))}>✕</Btn>}
              </div>
            ))}
            <Btn variant="outline" size="sm" onClick={() => set("pageLinks", [...data.pageLinks, ""])}>+ Add Page Link</Btn>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <Btn variant="outline" size="lg" onClick={onBack}>← Back</Btn>
          <Btn size="lg" style={{ minWidth: 160, opacity: ok ? 1 : .4, cursor: ok ? "pointer" : "default" }} onClick={() => ok && onNext()}>Continue →</Btn>
        </div>
      </Card>
    </div>
  );
}

function WizardStep3({ data, set, onNext, onBack, businessTypes }) {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const isMeta = data.platform === "meta";
  const ok = isMeta ? data.bmId && data.businessType : data.businessType;
  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Card>
        <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: TC.text, letterSpacing: "-0.01em" }}>Business Information</h2>
        <p style={{ margin: "0 0 24px", fontSize: 14, fontWeight: 500, color: TC.g500 }}>Provide your business details for account verification.</p>
        {isMeta && (
          <Input label="Business Manager ID" required value={data.bmId} onChange={e => set("bmId", e.target.value)} placeholder="e.g. 123456789012345" />
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Select label="Business Type" required value={data.businessType} onChange={e => set("businessType", e.target.value)}
            options={["", ...businessTypes]} />
          <Input label="Business Name" value={data.businessName} onChange={e => set("businessName", e.target.value)} placeholder="e.g. My Agency LLC" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Input label="Country" value={data.country} onChange={e => set("country", e.target.value)} placeholder="e.g. United States" />
          <Input label="Email" type="email" value={data.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" />
        </div>
        <Input label="Phone Number" type="tel" value={data.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 555 123 4567" />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <Btn variant="outline" size="lg" onClick={onBack}>← Back</Btn>
          <Btn size="lg" style={{ minWidth: 160, opacity: ok ? 1 : .4, cursor: ok ? "pointer" : "default" }} onClick={() => ok && onNext()}>Continue →</Btn>
        </div>
      </Card>
    </div>
  );
}

function WizardStep4({ data, set, onNext, onBack, balance, platformPrices }) {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const platform = PLATFORMS.find(p => p.id === data.platform);
  const { price, fee, minTopup } = getPlatformPrice(data.platform, platformPrices);
  const topup = parseFloat(data.topupAmount) || 0;
  const feeAmount = +(topup * fee / 100).toFixed(2);
  const total = +(price + topup + feeAmount).toFixed(2);
  const topupValid = topup >= minTopup;
  const canPay = balance >= total && topupValid;

  const row = (label, value, last = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: last ? "none" : `1px solid ${TC.g200}`, fontSize: 13 }}>
      <span style={{ color: TC.g500 }}>{label}</span>
      <span style={{ fontWeight: 700, color: TC.g700, textAlign: "right", maxWidth: 180 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 740, margin: "0 auto" }}>
      <Card>
        <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: TC.text, letterSpacing: "-0.01em" }}>Review & Payment</h2>
        <p style={{ margin: "0 0 26px", fontSize: 14, fontWeight: 500, color: TC.g500 }}>Enter your desired top-up amount and confirm the order.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: TC.g500, letterSpacing: .8, textTransform: "uppercase", marginBottom: 12 }}>Order Summary</div>
            <div style={{ background: TC.g50, borderRadius: 12, padding: "16px 18px" }}>
              {row("Platform", <div style={{ display: "flex", alignItems: "center", gap: 6 }}><PlatformIcon name={platform?.icon || data.platform} size={14} />{platform?.name || data.platform}</div>)}
              {row("Account Name", data.accountName || "—")}
              {row("Timezone", data.timezone)}
              {row("Currency", data.currency)}
              {row("Business Type", data.businessType || "—", true)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: TC.g500, letterSpacing: .8, textTransform: "uppercase", marginBottom: 12 }}>Pricing</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: TC.g700, marginBottom: 7 }}>
                Top-up Amount <span style={{ color: C.primary }}>*</span>
                <span style={{ fontWeight: 400, color: TC.g400, marginLeft: 8 }}>min ${minTopup.toLocaleString()}</span>
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: TC.g500, fontSize: 15, fontWeight: 700 }}>$</span>
                <input
                  type="number"
                  min={minTopup}
                  value={data.topupAmount}
                  onChange={e => set("topupAmount", e.target.value)}
                  placeholder={String(minTopup)}
                  style={{ width: "100%", border: `2px solid ${!data.topupAmount ? TC.g200 : topupValid ? TC.green : TC.red}`, borderRadius: 10, padding: "11px 14px 11px 30px", fontSize: 15, fontWeight: 700, fontFamily: "inherit", outline: "none", boxSizing: "border-box", color: TC.text, background: TC.card }}
                />
              </div>
              {data.topupAmount && !topupValid && (
                <div style={{ fontSize: 12, color: TC.red, fontWeight: 600, marginTop: 5 }}>Minimum top-up is ${minTopup.toLocaleString()}</div>
              )}
            </div>

            <div style={{ background: TC.g50, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
              {row("Service Price", `$${price.toFixed(2)}`)}
              {row("Top-up Amount", topup > 0 ? `$${topup.toFixed(2)}` : "—")}
              {row(`Fee (${fee}% on top-up)`, topup > 0 ? `$${feeAmount.toFixed(2)}` : "—")}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 2px", fontSize: 16 }}>
                <span style={{ fontWeight: 900, color: TC.text }}>Total</span>
                <span style={{ fontWeight: 900, color: C.primary }}>${topup > 0 ? total.toFixed(2) : "—"}</span>
              </div>
            </div>

            <div style={{ background: (canPay || !data.topupAmount) ? TC.greenL : TC.redL, border: `1px solid ${(canPay || !data.topupAmount) ? TC.green : TC.red}30`, borderRadius: 12, padding: "12px 16px", fontSize: 13, color: TC.g600 }}>
              Your balance: <strong>${balance.toFixed(2)}</strong>
              {data.topupAmount && !canPay && balance < total && (
                <span style={{ color: TC.red, fontWeight: 700 }}> — Insufficient balance</span>
              )}
              {data.topupAmount && canPay && (
                <span style={{ color: TC.green, fontWeight: 700 }}> — After payment: ${(balance - total).toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Btn variant="outline" size="lg" onClick={onBack}>← Back</Btn>
          <Btn size="lg"
            style={{ minWidth: 200, background: canPay ? C.primary : TC.g300, cursor: canPay ? "pointer" : "default" }}
            onClick={() => canPay && onNext()}>
            {!data.topupAmount ? "Enter top-up amount" : !topupValid ? `Min top-up $${minTopup}` : balance < total ? "Insufficient Balance" : `Pay $${total.toFixed(2)} →`}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

function WizardStep5({ data, onDone, platformPrices }) {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const platform = PLATFORMS.find(p => p.id === data.platform);
  const { price, fee } = getPlatformPrice(data.platform, platformPrices);
  const topup = parseFloat(data.topupAmount) || 0;
  const feeAmount = +(topup * fee / 100).toFixed(2);
  const total = +(price + topup + feeAmount).toFixed(2);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Card>
        <div style={{ textAlign: "center", padding: "16px 0 28px" }}>
          <div style={{ width: 72, height: 72, background: TC.greenL, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, margin: "0 auto 20px" }}>✓</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: TC.text, margin: "0 0 10px" }}>Request Submitted!</h2>
          <p style={{ fontSize: 14, fontWeight: 500, color: TC.g500, margin: "0 0 30px", maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
            Your agency ad account request has been received. We'll review it and notify you once it's ready.
          </p>
          <div style={{ background: TC.g50, borderRadius: 14, padding: "20px 24px", textAlign: "left", marginBottom: 28 }}>
            {[
              ["Request ID", data.requestId],
              ["Platform", platform?.name || data.platform],
              ["Account Name", data.accountName],
              ["Business", data.businessName || data.businessType],
              ["Top-up Amount", `$${topup.toFixed(2)}`],
              [`Fee (${fee}%)`, `$${feeAmount.toFixed(2)}`],
              ["Total Paid", <span style={{ color: C.primary, fontWeight: 900 }}>${total.toFixed(2)}</span>],
              ["Date", new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
              ["Status", <Badge status="pending" />],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${TC.g200}`, fontSize: 14 }}>
                <span style={{ color: TC.g500, fontWeight: 600 }}>{k}</span>
                <span style={{ fontWeight: 700, color: TC.g700 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Btn variant="outline" size="lg" onClick={onDone}>View My Requests</Btn>
            <Btn size="lg" onClick={onDone}>Go to Dashboard →</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CreateAdAccountWizard({ onCancel, balance, setStore, businessTypes, auth, platformPrices }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    platform: "", accountName: "", timezone: "(GMT+00:00) UTC", currency: "USD – US Dollar",
    websites: [""], pageLinks: [""],
    bmId: "", businessName: "", businessType: "", country: "", email: "", phone: "",
    requestId: "", topupAmount: "",
  });
  const set = (k, v) => setData(p => ({ ...p, [k]: v }));
  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);
  const done = async () => {
    const { price, fee } = getPlatformPrice(data.platform, platformPrices);
    const topup = parseFloat(data.topupAmount) || 0;
    const feeAmount = +(topup * fee / 100).toFixed(2);
    const total = +(price + topup + feeAmount).toFixed(2);
    const now = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const dbId = String(Date.now());
    const reqId = data.requestId || ("#AAR-" + dbId);

    const dbRecord = {
      id: dbId,
      user_id: auth?.id || null,
      user_email: auth?.email || null,
      platform: data.platform,
      account_name: data.accountName,
      timezone: data.timezone,
      currency: data.currency,
      websites: data.websites,
      page_links: data.pageLinks,
      bm_id: data.bmId || null,
      business_name: data.businessName || null,
      business_type: data.businessType,
      business_email: data.email || null,
      country: data.country || null,
      phone: data.phone || null,
      status: "pending",
      amount: total,
      request_id: reqId,
      submitted_at: now,
    };

    try {
      await createAdAccountRequest(dbRecord);
    } catch (err) {
      console.warn("Failed to save request to DB:", err.message);
    }

    if (auth?.id) {
      const newBalance = (parseFloat(auth.balance) || 0) - total;
      try {
        await updateUser(auth.id, { balance: newBalance });
      } catch (err) {
        console.warn("Failed to update balance in DB:", err.message);
      }
    }

    const req = { ...dbRecord, accountName: data.accountName, pageLinks: data.pageLinks, bmId: data.bmId, businessName: data.businessName, businessType: data.businessType, email: data.email, requestId: reqId, submittedAt: now };
    setStore(s => ({
      ...s,
      adAccountRequests: [req, ...s.adAccountRequests],
      balance: s.balance - total,
      transactions: [{ id: Date.now(), type: "Spent", method: "Agency Ad Account", amount: -total, status: "completed", date: now }, ...s.transactions]
    }));
    onCancel();
  };

  useEffect(() => {
    if (step === 5 && !data.requestId) {
      set("requestId", "#AAR-2024-" + Math.floor(100000 + Math.random() * 900000));
    }
  }, [step]);

  return (
    <PageShell
      breadcrumb="Dashboard › Agency Ad Accounts › Apply for Agency Account"
      title="Apply for Agency Ad Account"
      subtitle="Follow the steps below to submit your request"
      actions={step < 5 ? [<Btn key="cancel" variant="outline" onClick={onCancel}>✕ Cancel</Btn>] : undefined}
    >
      <StepHeader steps={WIZARD_STEPS} current={step} />
      {step === 1 && <WizardStep1 data={data} set={set} onNext={next} platformPrices={platformPrices} />}
      {step === 2 && <WizardStep2 data={data} set={set} onNext={next} onBack={back} />}
      {step === 3 && <WizardStep3 data={data} set={set} onNext={next} onBack={back} businessTypes={businessTypes} />}
      {step === 4 && <WizardStep4 data={data} set={set} onNext={next} onBack={back} balance={balance} platformPrices={platformPrices} />}
      {step === 5 && <WizardStep5 data={data} onDone={done} platformPrices={platformPrices} />}
    </PageShell>
  );
}

export default function AgencyAdAccountsPage({ balance, requests, setStore, platformPrices }) {
  const [store] = useStore();
  const [view, setView] = useState("list");
  const navigate = useNavigate();
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')

  if (view === "create") return <CreateAdAccountWizard onCancel={() => setView("list")} balance={balance} setStore={setStore} businessTypes={store.businessTypes} auth={store.auth} platformPrices={platformPrices} />;

  const cols = [
    { label: "", render: () => <input type="checkbox" />, style: { width: 40 } },
    { label: "Request ID", render: r => <div><div style={{ fontWeight: 700, color: TC.text }}>{r.accountName}</div><div style={{ fontSize: 11, color: TC.g400 }}>ID: {r.requestId}</div></div> },
    { label: "Platform", render: r => <div style={{ display: "flex", alignItems: "center", gap: 6 }}><PlatformIcon name={(PLATFORMS.find(p => p.id === r.platform) && PLATFORMS.find(p => p.id === r.platform).icon) || r.platform} />{(PLATFORMS.find(p => p.id === r.platform) && PLATFORMS.find(p => p.id === r.platform).name) || r.platform}</div> },
    { label: "Business Type", render: r => <span style={{ background: TC.purpleL, color: TC.purple, fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 700 }}>{r.businessType}</span> },
    { label: "Submitted", render: r => <span style={{ fontSize: 12, color: TC.g500 }}>{r.submittedAt}</span> },
    { label: "Status", render: r => <Badge status={r.status} /> },
    { label: "Actions", render: () => <div style={{ display: "flex", gap: 8 }}><span style={{ cursor: "pointer" }}>👁</span></div> },
  ];

  return (
    <PageShell
      breadcrumb="Dashboard › Agency Ad Accounts"
      title="Agency Ad Accounts"
      actions={[
        <Btn key="exp" variant="outline">↑ Export</Btn>,
        <Btn key="create" onClick={() => setView("create")}>+ Create Ad Account</Btn>,
      ]}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[["Total Requests", requests.length, TC.blue], ["Active", requests.filter(r => r.status === "completed").length, TC.green], ["Pending", requests.filter(r => r.status === "pending").length, TC.yellow], ["Rejected", requests.filter(r => r.status === "rejected").length, TC.red]].map(([l, v, c]) => (
          <Card key={l}><div style={{ fontSize: 12, color: TC.g400, marginBottom: 6 }}>{l}</div><div style={{ fontSize: 28, fontWeight: 800, color: c, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{v}</div></Card>
        ))}
      </div>
      <Card>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18, alignItems: "flex-end" }}>
          {[ ["Platform", ["All Platforms", "Meta", "Google", "TikTok", "Snapchat"]], ["Status", ["All Statuses", "Active", "Pending", "Disabled", "Rejected"]] ].map(([l, o]) => (
            <div key={l}><div style={{ fontSize: 12, color: TC.g400, marginBottom: 5, fontWeight: 600 }}>{l}</div>
              <select style={{ background: TC.g50, color: TC.g700, border: `1px solid ${TC.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
                {o.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
          <div style={{ marginLeft: "auto" }}>
            <input placeholder="🔍 Search accounts…" style={{ width: 240, border: `1px solid ${TC.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none", background: TC.card, color: TC.text }} />
          </div>
        </div>
        <DataTable cols={cols} rows={requests} emptyMsg="No ad account requests yet. Create your first one!" />
      </Card>
    </PageShell>
  );
}
