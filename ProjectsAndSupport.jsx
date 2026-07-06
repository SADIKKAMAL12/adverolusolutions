import { useState } from "react";
import { C } from "../shared/theme";
import { Card, Badge, PlatformIcon, Btn, PageShell } from "../shared/UI";

/* ═══════════════════════════════════════════════════
   PROJECTS PAGE
═══════════════════════════════════════════════════ */
export function ProjectsPage() {
  const [tab, setTab] = useState("updates");

  const updates = [
    { date:"May 31", time:"10:30 AM", title:"Optimization Phase",       msg:"We paused low performing ad sets and scaled the winners. CPA decreased by 20% compared to last week.", prog:75, file:"performance_report.png", size:"125 KB" },
    { date:"May 29", time:"04:15 PM", title:"Campaign Launched",        msg:"We launched 3 campaigns targeting US audience. CTR looks promising, testing creatives now.",            prog:60, file:"campaign_screenshot.png", size:"210 KB" },
    { date:"May 25", time:"11:20 AM", title:"Initial Setup Completed",  msg:"Pixel installed, audiences created and first ad sets are ready. Will launch after your approval.",      prog:30, file:"setup_details.pdf",       size:"320 KB" },
  ];

  const files = [
    ["📄","campaign_brief.pdf",       "May 20, 2024","2.1 MB"],
    ["📊","audience_research.xlsx",   "May 22, 2024","18 KB" ],
    ["🗜","ad_creatives.zip",         "May 25, 2024","5.4 MB"],
    ["📄","weekly_report_may31.pdf",  "May 31, 2024","1.8 MB"],
  ];

  return (
    <PageShell breadcrumb="Dashboard › Projects" title="Projects">
      <div style={{ fontSize:13, color:C.g400, cursor:"pointer", marginBottom:16 }}>← Back to My Projects</div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 270px", gap:20 }}>
        <div>
          {/* Project header card */}
          <Card style={{ marginBottom:16 }}>
            <div style={{ display:"flex", gap:16, alignItems:"flex-start", marginBottom:18 }}>
              <div style={{ width:54, height:54, background:"#1877f210", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center" }}><PlatformIcon name="Meta" size={28} /></div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
                  <h2 style={{ margin:0, fontSize:19, fontWeight:900, color:C.g800 }}>Meta Ads Campaign</h2>
                  <Badge status="active" />
                </div>
                <div style={{ fontSize:13, color:C.g400 }}>Project ID: #1023 · Hired: May 20, 2024 · Buyer: <span style={{ color:C.primary, fontWeight:700 }}>Alex Smith</span></div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:12, color:C.g400, marginBottom:4 }}>Overall Progress</div>
                <div style={{ fontSize:32, fontWeight:900, color:C.g800 }}>70%</div>
                <div style={{ width:160, height:8, background:C.g200, borderRadius:4, marginTop:6 }}>
                  <div style={{ width:"70%", height:"100%", background:C.primary, borderRadius:4 }} />
                </div>
              </div>
            </div>
            <div style={{ display:"flex", borderBottom:`1px solid ${C.g200}` }}>
              {["Overview","Updates","Files","Messages"].map(t=>(
                <button key={t} onClick={()=>setTab(t.toLowerCase())}
                  style={{ padding:"11px 22px", border:"none", background:"none", cursor:"pointer", fontSize:14, fontWeight:tab===t.toLowerCase()?800:400, color:tab===t.toLowerCase()?C.primary:C.g400, borderBottom:tab===t.toLowerCase()?`2px solid ${C.primary}`:"2px solid transparent", fontFamily:"inherit", marginBottom:-1 }}>
                  {t}
                </button>
              ))}
            </div>
          </Card>

          {/* Tab content */}
          <Card>
            {tab==="overview" && (
              <div>
                <h3 style={{ margin:"0 0 16px", fontSize:15, fontWeight:800 }}>Project Overview</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  {[["Platform","Meta Ads"],["Campaign Type","Traffic"],["Daily Budget","$50.00"],["Total Budget","$1,000.00"],["Target Country","United States"],["Start Date","May 20, 2024"],["Est. Duration","30 Days"],["Status","Active"]].map(([k,v])=>(
                    <div key={k} style={{ background:C.g50, borderRadius:10, padding:"12px 14px" }}>
                      <div style={{ fontSize:11, color:C.g400, marginBottom:3 }}>{k}</div>
                      <div style={{ fontSize:14, fontWeight:700, color:C.g800 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab==="updates" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                  <div>
                    <h3 style={{ margin:"0 0 3px", fontSize:15, fontWeight:800, color:C.g800 }}>Project Updates</h3>
                    <p style={{ margin:0, fontSize:12, color:C.g400 }}>Updates shared by your media buyer.</p>
                  </div>
                  <Btn size="sm">+ Add Update</Btn>
                </div>
                {updates.map((u,i)=>(
                  <div key={u.title} style={{ display:"flex", gap:16, marginBottom:24 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", background:i===0?C.primary:C.g100, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🚀</div>
                      {i<updates.length-1 && <div style={{ width:2, flex:1, background:C.g200, minHeight:28 }} />}
                    </div>
                    <div style={{ flex:1, paddingBottom:8 }}>
                      <div style={{ fontSize:11, color:C.g400, marginBottom:7 }}>{u.date}, 2024 · {u.time}</div>
                      <div style={{ background:C.g50, borderRadius:13, padding:16 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:9 }}>
                          <span style={{ fontWeight:800, fontSize:14, color:C.g800 }}>{u.title}</span>
                          <span style={{ background:C.primaryLight, color:C.primary, fontSize:11, fontWeight:800, padding:"3px 10px", borderRadius:20 }}>Progress: {u.prog}%</span>
                        </div>
                        <p style={{ fontSize:13, color:C.g500, margin:"0 0 12px" }}>{u.msg}</p>
                        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", border:`1px solid ${C.g200}`, borderRadius:9, padding:"9px 13px" }}>
                          <span>📎</span><span style={{ fontSize:13, fontWeight:700, flex:1 }}>{u.file}</span>
                          <span style={{ fontSize:11, color:C.g400 }}>{u.size}</span>
                          <span style={{ cursor:"pointer" }}>⬇</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab==="files" && (
              <div>
                <h3 style={{ margin:"0 0 16px", fontSize:15, fontWeight:800 }}>Files & Documents</h3>
                {files.map(([ic,n,d,s])=>(
                  <div key={n} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:`1px solid ${C.g100}` }}>
                    <span style={{ fontSize:24 }}>{ic}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:13 }}>{n}</div>
                      <div style={{ fontSize:12, color:C.g400 }}>{d} · {s}</div>
                    </div>
                    <Btn size="sm" variant="outline">⬇ Download</Btn>
                  </div>
                ))}
              </div>
            )}

            {tab==="messages" && (
              <div>
                <h3 style={{ margin:"0 0 16px", fontSize:15, fontWeight:800 }}>Messages</h3>
                <div style={{ background:C.g50, borderRadius:11, padding:14, marginBottom:10 }}>
                  <div style={{ fontSize:11, color:C.g400, marginBottom:5 }}>Alex Smith · May 31</div>
                  <p style={{ margin:0, fontSize:13, color:C.g600 }}>Hi! I've uploaded the performance report. CPA is down 20% this week — great results!</p>
                </div>
                <div style={{ background:C.primaryLight, borderRadius:11, padding:14, marginBottom:16, marginLeft:40 }}>
                  <div style={{ fontSize:11, color:C.g400, marginBottom:5 }}>You · May 31</div>
                  <p style={{ margin:0, fontSize:13, color:C.g600 }}>Great work! Can we increase the budget for the best-performing campaign?</p>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <input placeholder="Type a message…" style={{ flex:1, border:`1.5px solid ${C.g200}`, borderRadius:9, padding:"11px 14px", fontSize:13, fontFamily:"inherit", outline:"none" }} />
                  <Btn>Send</Btn>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <h3 style={{ margin:"0 0 14px", fontSize:14, fontWeight:800 }}>Project Details</h3>
            {[["Platform","Meta Ads"],["Daily Budget","$50.00"],["Total Budget","$1,000.00"],["Target Country","United States"],["Start Date","May 20, 2024"],["Duration","30 Days"]].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.g100}`, fontSize:13 }}>
                <span style={{ color:C.g400 }}>{k}</span><span style={{ fontWeight:700, color:C.g700 }}>{v}</span>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <h3 style={{ margin:0, fontSize:14, fontWeight:800 }}>Files</h3>
              <span style={{ color:C.primary, fontSize:12, cursor:"pointer", fontWeight:700 }}>View All</span>
            </div>
            {files.slice(0,3).map(([ic,n,_,s])=>(
              <div key={n} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 0", borderBottom:`1px solid ${C.g100}` }}>
                <span>{ic}</span>
                <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:700, color:C.g600 }}>{n}</div><div style={{ fontSize:11, color:C.g400 }}>{s}</div></div>
                <span style={{ cursor:"pointer" }}>⬇</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   SUPPORT PAGE
═══════════════════════════════════════════════════ */
export function SupportPage() {
  const [subject, setSubject] = useState("");
  const [msg,     setMsg]     = useState("");
  const [sent,    setSent]    = useState(false);

  const submit = () => { if (subject && msg) setSent(true); };

  return (
    <PageShell title="Support" subtitle="Get help from our 24/7 support team.">
      {sent && (
        <div style={{ background:C.greenL, border:`1px solid ${C.green}40`, borderRadius:12, padding:"14px 18px", marginBottom:22, display:"flex", gap:10, alignItems:"center" }}>
          <span>✅</span>
          <div><strong style={{ color:C.green }}>Ticket submitted!</strong> <span style={{ fontSize:13, color:"#065f46" }}>We'll respond within 24 hours.</span></div>
          <button onClick={()=>setSent(false)} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontSize:18, color:C.green }}>✕</button>
        </div>
      )}

      {/* Contact options */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[["💬",C.blue,   "Live Chat",     "Chat with our team in real-time",     "Start Chat"],
          ["📧",C.green,  "Email Support", "We respond within 24 hours",          "Send Email"],
          ["📞",C.purple, "Phone Support", "Call us during business hours",        "Call Now" ]].map(([ic,c,t,s,btn])=>(
          <Card key={t} style={{ textAlign:"center", padding:"28px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>{ic}</div>
            <h3 style={{ margin:"0 0 8px", fontSize:15, fontWeight:800, color:C.g800 }}>{t}</h3>
            <p style={{ fontSize:13, color:C.g400, margin:"0 0 16px" }}>{s}</p>
            <button style={{ background:c, color:"#fff", border:"none", borderRadius:9, padding:"9px 22px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{btn}</button>
          </Card>
        ))}
      </div>

      {/* Ticket form */}
      <Card>
        <h3 style={{ margin:"0 0 22px", fontSize:16, fontWeight:800, color:C.g800 }}>Submit a Support Ticket</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:0 }}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:13, color:C.g600, marginBottom:7, fontWeight:600 }}>Subject <span style={{ color:C.primary }}>*</span></label>
            <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Brief subject of your issue"
              style={{ width:"100%", border:`1.5px solid ${C.g200}`, borderRadius:10, padding:"11px 14px", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor=C.primary} onBlur={e=>e.target.style.borderColor=C.g200}
            />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:13, color:C.g600, marginBottom:7, fontWeight:600 }}>Category <span style={{ color:C.primary }}>*</span></label>
            <select style={{ width:"100%", background:"#fff", border:`1.5px solid ${C.g200}`, borderRadius:10, padding:"11px 14px", fontSize:14, fontFamily:"inherit", outline:"none" }}>
              {["General Inquiry","Billing Issue","Technical Problem","Account Issue","Ad Account Problem"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom:22 }}>
          <label style={{ display:"block", fontSize:13, color:C.g600, marginBottom:7, fontWeight:600 }}>Message <span style={{ color:C.primary }}>*</span></label>
          <textarea rows={5} value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Describe your issue in detail…"
            style={{ width:"100%", border:`1.5px solid ${C.g200}`, borderRadius:10, padding:"11px 14px", fontSize:14, resize:"vertical", boxSizing:"border-box", fontFamily:"inherit", outline:"none" }}
            onFocus={e=>e.target.style.borderColor=C.primary} onBlur={e=>e.target.style.borderColor=C.g200}
          />
        </div>
        <Btn onClick={submit} style={{ opacity:subject&&msg?1:.5 }}>Submit Ticket</Btn>
      </Card>
    </PageShell>
  );
}
