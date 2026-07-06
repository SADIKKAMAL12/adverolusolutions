import { useState } from "react";
import { C, PLATFORMS } from "../shared/theme";
import { Card, Badge, Btn, Input, Select, PlatformIcon, StepHeader, PageShell, DataTable, Pagination } from "../shared/UI";
import { MOCK_AD_ACCOUNTS } from "../shared/mockData";

/* ══════════════════════════════════════════════════
   CREATE AD ACCOUNT  — 5-step wizard, one page at a time
══════════════════════════════════════════════════ */
const WIZARD_STEPS = [
  { label:"Choose Platform",    sub:"Select ad platform"       },
  { label:"Account Details",    sub:"Basic information"        },
  { label:"Business Info",      sub:"Your business details"    },
  { label:"Review & Payment",   sub:"Confirm & pay"            },
  { label:"Confirmation",       sub:"Track your request"       },
];

/* Step 1 — Pick platform */
function WizardStep1({ data, set, onNext }) {
  return (
    <div style={{ maxWidth:700, margin:"0 auto" }}>
      <Card>
        <h2 style={{ margin:"0 0 6px", fontSize:19, fontWeight:900, color:C.g800 }}>Choose Your Platform</h2>
        <p style={{ margin:"0 0 26px", fontSize:14, color:C.g500 }}>Select the advertising platform for which you want an agency ad account.</p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:30 }}>
          {PLATFORMS.map(p=>{
            const sel = data.platform === p.id;
            return (
              <div key={p.id} onClick={()=>set("platform",p.id)}
                style={{ border:`2px solid ${sel?C.primary:C.g200}`, borderRadius:14, padding:"22px 20px", cursor:"pointer", background:sel?C.primaryLight:"#fff", transition:"all .2s", position:"relative" }}>
                {sel && <div style={{ position:"absolute", top:14, right:14, width:22, height:22, background:C.primary, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:900 }}>✓</div>}
                <div style={{ marginBottom:12 }}><PlatformIcon name={p.icon} size={32} /></div>
                <div style={{ fontWeight:900, fontSize:16, color:C.g800, marginBottom:4 }}>{p.name}</div>
                <div style={{ fontSize:13, color:C.g500 }}>{p.sub}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <Btn size="lg" style={{ minWidth:160, opacity:data.platform?1:.4, cursor:data.platform?"pointer":"default" }} onClick={()=>data.platform&&onNext()}>
            Continue →
          </Btn>
        </div>
        {!data.platform && <p style={{ textAlign:"right", fontSize:12, color:C.g400, margin:"8px 0 0" }}>Please select a platform to continue</p>}
      </Card>
    </div>
  );
}

/* Step 2 — Account details */
function WizardStep2({ data, set, onNext, onBack }) {
  const ok = data.accountName && data.timezone && data.currency;
  return (
    <div style={{ maxWidth:700, margin:"0 auto" }}>
      <Card>
        <h2 style={{ margin:"0 0 6px", fontSize:19, fontWeight:900, color:C.g800 }}>Account Details</h2>
        <p style={{ margin:"0 0 24px", fontSize:14, color:C.g500 }}>Enter basic information for your ad account.</p>

        <Input label="Account Name" required value={data.accountName} onChange={e=>set("accountName",e.target.value)} placeholder="e.g. My Agency Account" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Select label="Timezone" required value={data.timezone} onChange={e=>set("timezone",e.target.value)}
            options={["(GMT+00:00) UTC","(GMT-05:00) Eastern Time (US)","(GMT-08:00) Pacific Time (US)","(GMT+01:00) Central European Time","(GMT+01:00) Casablanca (WET)","(GMT+03:00) Riyadh (AST)"]} />
          <Select label="Currency" required value={data.currency} onChange={e=>set("currency",e.target.value)}
            options={["USD – US Dollar","EUR – Euro","GBP – British Pound","AED – UAE Dirham","MAD – Moroccan Dirham","SAR – Saudi Riyal"]} />
        </div>
        <Input label="Website (Optional)" value={data.website} onChange={e=>set("website",e.target.value)} placeholder="https://myagency.com" hint="Your agency or business website" />

        <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
          <Btn variant="outline" size="lg" onClick={onBack}>← Back</Btn>
          <Btn size="lg" style={{ minWidth:160, opacity:ok?1:.4, cursor:ok?"pointer":"default" }} onClick={()=>ok&&onNext()}>Continue →</Btn>
        </div>
      </Card>
    </div>
  );
}

/* Step 3 — Business info */
function WizardStep3({ data, set, onNext, onBack }) {
  const ok = data.businessName && data.businessType && data.businessEmail;
  return (
    <div style={{ maxWidth:700, margin:"0 auto" }}>
      <Card>
        <h2 style={{ margin:"0 0 6px", fontSize:19, fontWeight:900, color:C.g800 }}>Business Information</h2>
        <p style={{ margin:"0 0 24px", fontSize:14, color:C.g500 }}>Provide your business details for account verification.</p>

        <Input label="Business Name" required value={data.businessName} onChange={e=>set("businessName",e.target.value)} placeholder="e.g. My Agency LLC" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Select label="Business Type" required value={data.businessType} onChange={e=>set("businessType",e.target.value)}
            options={["","Marketing Agency","E-Commerce Brand","Freelancer","Startup","Enterprise","Other"]} />
          <Select label="Country" required value={data.country} onChange={e=>set("country",e.target.value)}
            options={["United States","United Kingdom","France","Germany","Morocco","UAE","Saudi Arabia","Canada","Australia"]} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Input label="Business Email" required type="email" value={data.businessEmail} onChange={e=>set("businessEmail",e.target.value)} placeholder="contact@myagency.com" />
          <Input label="Phone Number"            type="tel"   value={data.phone}          onChange={e=>set("phone",e.target.value)}          placeholder="+1 555 123 4567"   />
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
          <Btn variant="outline" size="lg" onClick={onBack}>← Back</Btn>
          <Btn size="lg" style={{ minWidth:160, opacity:ok?1:.4, cursor:ok?"pointer":"default" }} onClick={()=>ok&&onNext()}>Continue →</Btn>
        </div>
      </Card>
    </div>
  );
}

/* Step 4 — Review & pay */
function WizardStep4({ data, onNext, onBack, balance }) {
  const [payWithBalance, setPay] = useState(true);
  const platform = PLATFORMS.find(p=>p.id===data.platform);
  const price=50, fee=2, total=price+fee;
  const canPay = balance >= total;

  return (
    <div style={{ maxWidth:700, margin:"0 auto" }}>
      <Card>
        <h2 style={{ margin:"0 0 6px", fontSize:19, fontWeight:900, color:C.g800 }}>Review & Payment</h2>
        <p style={{ margin:"0 0 26px", fontSize:14, color:C.g500 }}>Review your order details and complete the payment.</p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:28 }}>
          {/* Summary */}
          <div>
            <div style={{ fontSize:12, fontWeight:800, color:C.g500, letterSpacing:.8, textTransform:"uppercase", marginBottom:12 }}>Order Summary</div>
            <div style={{ background:C.g50, borderRadius:12, padding:"16px 18px" }}>
              {[
                ["Platform",      <div style={{ display:"flex", alignItems:"center", gap:6 }}><PlatformIcon name={platform?.icon} size={14} />{platform?.name}</div>],
                ["Account Name",  data.accountName||"—"],
                ["Timezone",      data.timezone],
                ["Currency",      data.currency],
                ["Business Name", data.businessName||"—"],
              ].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.g200}`, fontSize:13 }}>
                  <span style={{ color:C.g500 }}>{k}</span>
                  <span style={{ fontWeight:700, color:C.g700, textAlign:"right", maxWidth:180 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <div style={{ fontSize:12, fontWeight:800, color:C.g500, letterSpacing:.8, textTransform:"uppercase", marginBottom:12 }}>Pricing</div>
            <div style={{ background:C.g50, borderRadius:12, padding:"16px 18px", marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.g200}`, fontSize:13 }}><span style={{ color:C.g500 }}>Service Price</span><span style={{ fontWeight:700 }}>${price}.00</span></div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.g200}`, fontSize:13 }}><span style={{ color:C.g500 }}>Processing Fee</span><span style={{ fontWeight:700 }}>${fee}.00</span></div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 4px", fontSize:16 }}>
                <span style={{ fontWeight:900, color:C.g800 }}>Total</span>
                <span style={{ fontWeight:900, color:C.primary }}>${total}.00</span>
              </div>
            </div>
            {/* Balance toggle */}
            <div style={{ background:canPay?C.greenL:C.redL, border:`1px solid ${canPay?C.green:C.red}30`, borderRadius:12, padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontWeight:700, fontSize:14, color:C.g700 }}>Pay with Balance</span>
                <div onClick={()=>setPay(p=>!p)}
                  style={{ width:44, height:24, borderRadius:12, background:payWithBalance?C.primary:C.g300, cursor:"pointer", position:"relative", transition:"all .2s" }}>
                  <div style={{ width:20, height:20, background:"#fff", borderRadius:"50%", position:"absolute", top:2, left:payWithBalance?22:2, transition:"all .2s", boxShadow:"0 1px 3px rgba(0,0,0,.2)" }} />
                </div>
              </div>
              <div style={{ fontSize:13, color:C.g600 }}>Available: <strong>${balance.toFixed(2)}</strong>{!canPay&&<span style={{ color:C.red, fontWeight:700 }}> — Insufficient balance</span>}</div>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <Btn variant="outline" size="lg" onClick={onBack}>← Back</Btn>
          <Btn size="lg" style={{ minWidth:180, background:canPay?C.primary:C.g300, cursor:canPay?"pointer":"default" }} onClick={()=>canPay&&onNext()}>
            {canPay ? `Pay $${total}.00 →` : "Insufficient Balance"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

/* Step 5 — Confirmation */
function WizardStep5({ data, onDone }) {
  const platform = PLATFORMS.find(p=>p.id===data.platform);
  const reqId = `#AAR-2024-${Math.floor(100000+Math.random()*900000)}`;

  return (
    <div style={{ maxWidth:700, margin:"0 auto" }}>
      <Card>
        <div style={{ textAlign:"center", padding:"16px 0 28px" }}>
          <div style={{ width:72, height:72, background:C.greenL, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, margin:"0 auto 20px" }}>✓</div>
          <h2 style={{ fontSize:24, fontWeight:900, color:C.g800, margin:"0 0 10px" }}>Request Submitted!</h2>
          <p style={{ fontSize:14, color:C.g500, margin:"0 0 30px", maxWidth:440, marginLeft:"auto", marginRight:"auto" }}>
            Your agency ad account request has been received. We'll review it and notify you once it's ready.
          </p>

          <div style={{ background:C.g50, borderRadius:14, padding:"20px 24px", textAlign:"left", marginBottom:28 }}>
            {[["Request ID",reqId],["Platform",platform?.name],["Account Name",data.accountName],["Business",data.businessName],["Date",new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})],["Status",<Badge status="pending review" />]].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.g200}`, fontSize:14 }}>
                <span style={{ color:C.g500, fontWeight:600 }}>{k}</span>
                <span style={{ fontWeight:700, color:C.g700 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Tracking */}
          <div style={{ background:C.primaryLight, border:`1px solid ${C.primary}20`, borderRadius:14, padding:"20px 24px", textAlign:"left", marginBottom:28 }}>
            <div style={{ fontSize:12, fontWeight:800, color:C.primary, marginBottom:16, textTransform:"uppercase", letterSpacing:.8 }}>What happens next?</div>
            {[["Pending Review","Your request is being reviewed",true],["Processing","We are preparing your ad account",false],["Completed","Your ad account is ready",false],["Delivered","Account details sent to you",false]].map(([t,s,act],i)=>(
              <div key={t} style={{ display:"flex", gap:14, marginBottom:i<3?14:0 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ width:30, height:30, borderRadius:"50%", background:act?C.primary:C.g200, color:act?"#fff":C.g400, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, flexShrink:0 }}>{i+1}</div>
                  {i<3&&<div style={{ width:2, height:18, background:C.g200, marginTop:3 }} />}
                </div>
                <div style={{ paddingTop:5 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:act?C.primary:C.g500 }}>{t}</div>
                  <div style={{ fontSize:12, color:C.g400 }}>{s}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <Btn variant="outline" size="lg" onClick={onDone}>View My Requests</Btn>
            <Btn size="lg" onClick={onDone}>Go to Dashboard →</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   CREATE AD ACCOUNT WIZARD — container
══════════════════════════════════════════════════ */
function CreateAdAccountWizard({ onCancel, balance, setPage }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    platform:"", accountName:"", timezone:"(GMT+00:00) UTC", currency:"USD – US Dollar",
    website:"", businessName:"", businessType:"", country:"United States", businessEmail:"", phone:"",
  });
  const set = (k,v) => setData(p=>({...p,[k]:v}));
  const next = ()  => setStep(s=>s+1);
  const back = ()  => setStep(s=>s-1);
  const done = ()  => setPage("dashboard");

  return (
    <PageShell
      breadcrumb="Dashboard › Ad Accounts › Apply for Agency Account"
      title="Apply for Agency Ad Account"
      subtitle="Follow the steps below to submit your request"
      actions={step < 5 ? [<Btn key="cancel" variant="outline" onClick={onCancel}>✕ Cancel</Btn>] : undefined}
    >
      <StepHeader steps={WIZARD_STEPS} current={step} />
      {step===1 && <WizardStep1 data={data} set={set} onNext={next} />}
      {step===2 && <WizardStep2 data={data} set={set} onNext={next} onBack={back} />}
      {step===3 && <WizardStep3 data={data} set={set} onNext={next} onBack={back} />}
      {step===4 && <WizardStep4 data={data} onNext={next} onBack={back} balance={balance} />}
      {step===5 && <WizardStep5 data={data} onDone={done} />}
    </PageShell>
  );
}

/* ══════════════════════════════════════════════════
   AD ACCOUNTS LIST PAGE
══════════════════════════════════════════════════ */
export default function AdAccountsPage({ balance, setPage }) {
  const [view, setView] = useState("list");

  if (view === "create") return <CreateAdAccountWizard onCancel={()=>setView("list")} balance={balance} setPage={setPage} />;

  const cols = [
    { label:"",           render: ()=><input type="checkbox" />, style:{ width:40 } },
    { label:"Account Name",  render: r=><div><div style={{ fontWeight:700, color:C.g800 }}>{r.name}</div><div style={{ fontSize:11, color:C.g400 }}>ID: {r.id}</div></div> },
    { label:"Platform",      render: r=><div style={{ display:"flex", alignItems:"center", gap:6 }}><PlatformIcon name={r.platform} />{r.platform}</div> },
    { label:"Type",          render: r=><span style={{ background:r.type==="Agency Account"?"#ede9fe":"#dbeafe", color:r.type==="Agency Account"?"#8b5cf6":"#3b82f6", fontSize:11, padding:"3px 9px", borderRadius:20, fontWeight:700 }}>{r.type}</span> },
    { label:"Created By",    render: r=><span style={{ fontSize:12, color:C.g500 }}>{r.user}</span> },
    { label:"Balance",       render: r=><span style={{ fontWeight:700 }}>${r.balance}.00</span> },
    { label:"Status",        render: r=><Badge status={r.status} /> },
    { label:"Date",          render: r=><span style={{ fontSize:12, color:C.g400 }}>{r.date}</span> },
    { label:"Actions",       render: ()=><div style={{ display:"flex", gap:8 }}><span style={{ cursor:"pointer" }}>👁</span><span style={{ cursor:"pointer" }}>✏️</span></div> },
  ];

  return (
    <PageShell
      breadcrumb="Dashboard › Ad Accounts"
      title="Ad Accounts"
      actions={[
        <Btn key="exp" variant="outline">↑ Export</Btn>,
        <Btn key="create" onClick={()=>setView("create")}>+ Create Ad Account</Btn>,
      ]}
    >
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:22 }}>
        {[["Total","2,346",C.blue],["Active","1,987",C.green],["Disabled","189",C.red],["Pending","170",C.yellow],["Rejected","56",C.g500]].map(([l,v,c])=>(
          <Card key={l}><div style={{ fontSize:12, color:C.g400, marginBottom:6 }}>{l} Accounts</div><div style={{ fontSize:24, fontWeight:900, color:c }}>{v}</div></Card>
        ))}
      </div>

      <Card>
        {/* Filters */}
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:18, alignItems:"flex-end" }}>
          {[["Platform",["All Platforms","Meta","Google","TikTok","Snapchat"]],["Status",["All Statuses","Active","Pending","Disabled","Rejected"]]].map(([l,o])=>(
            <div key={l}><div style={{ fontSize:12, color:C.g400, marginBottom:5, fontWeight:600 }}>{l}</div>
              <select style={{ background:C.g50, border:`1px solid ${C.g200}`, borderRadius:9, padding:"9px 14px", fontSize:13, fontFamily:"inherit", outline:"none" }}>
                {o.map(opt=><option key={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
          <div style={{ marginLeft:"auto" }}>
            <input placeholder="🔍 Search accounts…" style={{ width:240, border:`1px solid ${C.g200}`, borderRadius:9, padding:"9px 14px", fontSize:13, fontFamily:"inherit", outline:"none" }} />
          </div>
        </div>
        <DataTable cols={cols} rows={MOCK_AD_ACCOUNTS} />
        <Pagination total="2,346" showing={`1–${MOCK_AD_ACCOUNTS.length}`} pages={["‹",1,2,3,"...",294,"›"]} />
      </Card>
    </PageShell>
  );
}
