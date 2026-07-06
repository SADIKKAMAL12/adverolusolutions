import { C, getThemeColors } from '../shared/theme.js'
import { useState } from 'react'
import { useNavigate, usePath } from '../shared/Router.jsx'
import { useTheme } from '../shared/ThemeContext.jsx'
import { PageShell, Card, Btn, PlatformIcon, Badge, Input, Textarea } from '../shared/UI.jsx'
import { useAuth } from '../shared/AuthContext.jsx'
import { createTicket } from '../lib/db.js'

export function ProjectsListPage({ projects }) {
  const navigate = useNavigate();
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const projectList = projects || [];
  return (
    <PageShell title="Projects" subtitle="Manage all your media buyer projects.">
      {projectList.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "60px 32px" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: TC.text, margin: "0 0 8px" }}>No Projects Yet</h3>
          <p style={{ fontSize: 14, color: TC.g400, margin: "0 0 20px" }}>Hire a media buyer to create your first project.</p>
          <Btn onClick={() => navigate("/media-buyers")}>Find Media Buyers →</Btn>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
          {projectList.map(prj => (
            <Card key={prj.id} onClick={() => navigate(`/projects/${prj.id}`)} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, background: "#1877f210", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PlatformIcon name={prj.platform} size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: TC.text, marginBottom: 3 }}>{prj.platform} Ads Campaign</div>
                  <div style={{ fontSize: 12, color: TC.g400, marginBottom: 8 }}>Buyer: {prj.buyerName} · Budget: ${prj.budget}/mo</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: TC.g200, borderRadius: 3 }}>
                      <div style={{ width: `${prj.progress}%`, height: "100%", background: C.primary, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: TC.g600 }}>{prj.progress}%</span>
                  </div>
                </div>
                <Badge status={prj.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

export function ProjectDetailPage({ projects, setStore }) {
  const navigate = useNavigate();
  const path = usePath();
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const isDark = theme === 'dark'
  const projectId = path.split("/projects/")[1];
  const projectList = projects || [];
  const project = projectList.find(p => p.id === projectId);
  const [tab, setTab] = useState("overview");
  const [msgText, setMsgText] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");
  const [showAddUpdate, setShowAddUpdate] = useState(false);

  if (!project) return (
    <PageShell title="Project Not Found">
      <Card style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>❓</div>
        <div style={{ fontWeight: 700, color: TC.g600 }}>Project not found.</div>
        <Btn onClick={() => navigate("/projects")} style={{ marginTop: 16 }}>Back to Projects</Btn>
      </Card>
    </PageShell>
  );

  const sendMessage = () => {
    if (!msgText.trim()) return;
    setStore(s => ({
      ...s,
      projects: s.projects.map(p => p.id === project.id ? {
        ...p,
        messages: [...p.messages, { id: Date.now(), from: "client", name: "You", text: msgText, date: "Just now" }]
      } : p)
    }));
    setMsgText("");
  };

  const addUpdate = () => {
    if (!updateTitle.trim() || !updateMsg.trim()) return;
    setStore(s => ({
      ...s,
      projects: s.projects.map(p => p.id === project.id ? {
        ...p,
        progress: Math.min(100, p.progress + 10),
        updates: [...p.updates, {
          id: Date.now(),
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          title: updateTitle,
          msg: updateMsg,
          prog: Math.min(100, p.progress + 10),
          by: "client"
        }]
      } : p)
    }));
    setUpdateTitle("");
    setUpdateMsg("");
    setShowAddUpdate(false);
  };

  const addFile = () => {
    setStore(s => ({
      ...s,
      projects: s.projects.map(p => p.id === project.id ? {
        ...p,
        files: [...p.files, { name: `file_${Date.now()}.pdf`, size: "1.2 MB", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }]
      } : p)
    }));
  };

  return (
    <PageShell breadcrumb={`Dashboard › Projects › ${project.platform} Campaign`} title={project.platform + " Ads Campaign"}>
      <div style={{ fontSize: 13, color: C.primary, cursor: "pointer", marginBottom: 16 }} onClick={() => navigate("/projects")}>← Back to My Projects</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 270px", gap: 20 }}>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 18 }}>
              <div style={{ width: 54, height: 54, background: "#1877f210", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center" }}><PlatformIcon name={project.platform} size={28} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TC.text, letterSpacing: '-0.01em' }}>{project.platform} Ads Campaign</h2>
                  <Badge status={project.status} />
                </div>
                <div style={{ fontSize: 13, color: TC.g400 }}>Project ID: {project.id} · Hired: {project.createdAt} · Buyer: <span style={{ color: C.primary, fontWeight: 700 }}>{project.buyerName}</span></div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: TC.g400, marginBottom: 4 }}>Overall Progress</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: TC.text, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{project.progress}%</div>
                <div style={{ width: 160, height: 8, background: TC.g200, borderRadius: 4, marginTop: 6 }}>
                  <div style={{ width: `${project.progress}%`, height: "100%", background: C.primary, borderRadius: 4 }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", borderBottom: `1px solid ${TC.g200}` }}>
              {["Overview", "Updates", "Files", "Messages"].map(t => (
                <button key={t} onClick={() => setTab(t.toLowerCase())}
                  style={{ padding: "11px 22px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === t.toLowerCase() ? 800 : 400, color: tab === t.toLowerCase() ? C.primary : TC.g400, borderBottom: tab === t.toLowerCase() ? `2px solid ${C.primary}` : "2px solid transparent", fontFamily: "inherit", marginBottom: -1 }}>
                  {t}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            {tab === "overview" && (
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: TC.text }}>Project Overview</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["Platform", project.platform + " Ads"], ["Campaign Type", "Traffic"], ["Daily Budget", "$50.00"], ["Total Budget", `$${project.budget}.00`], ["Target Country", "United States"], ["Start Date", project.createdAt], ["Buyer", project.buyerName], ["Status", project.status]].map(([k, v]) => (
                    <div key={k} style={{ background: TC.g50, borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 11, color: TC.g400, marginBottom: 3 }}>{k}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TC.text }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "updates" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <h3 style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 800, color: TC.text }}>Project Updates</h3>
                    <p style={{ margin: 0, fontSize: 12, color: TC.g400 }}>Updates shared by your media buyer.</p>
                  </div>
                  <Btn size="sm" onClick={() => setShowAddUpdate(true)}>+ Add Update</Btn>
                </div>
                {showAddUpdate && (
                  <div style={{ background: TC.g50, borderRadius: 12, padding: 16, marginBottom: 18 }}>
                    <Input label="Title" value={updateTitle} onChange={e => setUpdateTitle(e.target.value)} placeholder="Update title" />
                    <Textarea label="Message" value={updateMsg} onChange={e => setUpdateMsg(e.target.value)} placeholder="Describe the update..." rows={3} />
                    <div style={{ display: "flex", gap: 10 }}>
                      <Btn variant="outline" size="sm" onClick={() => setShowAddUpdate(false)}>Cancel</Btn>
                      <Btn size="sm" onClick={addUpdate}>Add Update</Btn>
                    </div>
                  </div>
                )}
                {project.updates.map((u, i) => (
                  <div key={u.id} style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: i === 0 ? C.primary : TC.g100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚀</div>
                      {i < project.updates.length - 1 && <div style={{ width: 2, flex: 1, background: TC.g200, minHeight: 28 }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 8 }}>
                      <div style={{ fontSize: 11, color: TC.g400, marginBottom: 7 }}>{u.date} · {u.time}</div>
                      <div style={{ background: TC.g50, borderRadius: 13, padding: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
                          <span style={{ fontWeight: 800, fontSize: 14, color: TC.text }}>{u.title}</span>
                          <span style={{ background: TC.primaryLight, color: C.primary, fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>Progress: {u.prog}%</span>
                        </div>
                        <p style={{ fontSize: 13, color: TC.g500, margin: "0 0 12px" }}>{u.msg}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "files" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TC.text }}>Files & Documents</h3>
                  <Btn size="sm" onClick={addFile}>+ Upload File (Mock)</Btn>
                </div>
                {project.files.length === 0 ? (
                  <div style={{ textAlign: "center", color: TC.g400, padding: 20 }}>No files yet.</div>
                ) : (
                  project.files.map(f => (
                    <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${TC.g100}` }}>
                      <span style={{ fontSize: 24 }}>📄</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: TC.text }}>{f.name}</div>
                        <div style={{ fontSize: 12, color: TC.g400 }}>{f.date} · {f.size}</div>
                      </div>
                      <Btn size="sm" variant="outline">⬇ Download</Btn>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "messages" && (
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: TC.text }}>Messages</h3>
                <div style={{ maxHeight: 400, overflowY: "auto", marginBottom: 16 }}>
                  {project.messages.map(msg => (
                    <div key={msg.id} style={{ background: msg.from === "client" ? TC.primaryLight : TC.g50, borderRadius: 11, padding: 14, marginBottom: 10, marginLeft: msg.from === "client" ? 40 : 0 }}>
                      <div style={{ fontSize: 11, color: TC.g400, marginBottom: 5 }}>{msg.name} · {msg.date}</div>
                      <p style={{ margin: 0, fontSize: 13, color: TC.g600 }}>{msg.text}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Type a message…" style={{ flex: 1, border: `1.5px solid ${TC.g200}`, borderRadius: 9, padding: "11px 14px", fontSize: 13, fontFamily: "inherit", outline: "none", background: TC.card, color: TC.text }} />
                  <Btn onClick={sendMessage}>Send</Btn>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800, color: TC.text }}>Project Details</h3>
            {[["Platform", project.platform + " Ads"], ["Budget", `$${project.budget}/mo`], ["Buyer", project.buyerName], ["Start Date", project.createdAt], ["Status", project.status]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${TC.g100}`, fontSize: 13 }}>
                <span style={{ color: TC.g400 }}>{k}</span><span style={{ fontWeight: 700, color: TC.g700 }}>{v}</span>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TC.text }}>Files</h3>
              <span style={{ color: C.primary, fontSize: 12, cursor: "pointer", fontWeight: 700 }}>View All</span>
            </div>
            {project.files.slice(0, 3).map(f => (
              <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0", borderBottom: `1px solid ${TC.g100}` }}>
                <span>📄</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: TC.g600 }}>{f.name}</div><div style={{ fontSize: 11, color: TC.g400 }}>{f.size}</div></div>
                <span style={{ cursor: "pointer" }}>⬇</span>
              </div>
            ))}
            {project.files.length === 0 && <div style={{ fontSize: 12, color: TC.g400 }}>No files yet.</div>}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

export function SupportPage({ tickets, setStore }) {
  const { user } = useAuth();
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const ticketList = tickets || [];
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [category, setCategory] = useState("General Inquiry");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!subject || !msg) return;
    if (!user) { setError("Please log in."); return; }

    const dateStr = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

    try {
      await createTicket({
        user_id: user.id,
        user_email: user.email,
        subject,
        message: msg,
        status: "open",
      });

      setStore(s => ({ ...s, supportTickets: [{
        id: `TKT-${Date.now()}`,
        subject,
        category,
        message: msg,
        status: "open",
        date: dateStr,
      }, ...s.supportTickets] }));

      setSent(true);
      setError("");
      setSubject("");
      setMsg("");
    } catch (err) {
      setError("Failed to submit ticket: " + err.message);
    }
  };

  return (
    <PageShell title="Support" subtitle="Get help from our 24/7 support team.">
      {sent && (
        <div style={{ background: TC.greenL, border: `1px solid ${TC.green}40`, borderRadius: 12, padding: "14px 18px", marginBottom: 22, display: "flex", gap: 10, alignItems: "center" }}>
          <span>✅</span>
          <div><strong style={{ color: TC.green }}>Ticket submitted!</strong> <span style={{ fontSize: 13, color: TC.green, opacity: 0.8 }}>We'll respond within 24 hours.</span></div>
          <button onClick={() => setSent(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: TC.green }}>✕</button>
        </div>
      )}

      {error && (
        <div style={{ background: TC.redL, border: `1px solid ${TC.red}40`, borderRadius: 12, padding: "12px 18px", marginBottom: 22, fontSize: 13, color: TC.red }}>{error}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[["💬", TC.blue, "Live Chat", "Chat with our team in real-time", "Start Chat"], ["📧", TC.green, "Email Support", "We respond within 24 hours", "Send Email"], ["📞", TC.purple, "Phone Support", "Call us during business hours", "Call Now"]].map(([ic, c, t, s, btn]) => (
          <Card key={t} style={{ textAlign: "center", padding: "28px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{ic}</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: TC.text }}>{t}</h3>
            <p style={{ fontSize: 13, color: TC.g400, margin: "0 0 16px" }}>{s}</p>
            <button style={{ background: c, color: "#fff", border: "none", borderRadius: 9, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{btn}</button>
          </Card>
        ))}
      </div>

      {ticketList.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: TC.text }}>My Tickets</h3>
          {ticketList.map(t => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${TC.g100}` }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: TC.text }}>{t.subject}</div>
                <div style={{ fontSize: 12, color: TC.g400 }}>{t.category} · {t.date}</div>
              </div>
              <Badge status={t.status} />
            </div>
          ))}
        </Card>
      )}

      <Card>
        <h3 style={{ margin: "0 0 22px", fontSize: 16, fontWeight: 800, color: TC.text }}>Submit a Support Ticket</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 0 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: TC.g600, marginBottom: 7, fontWeight: 600 }}>Subject <span style={{ color: C.primary }}>*</span></label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief subject of your issue"
              style={{ width: "100%", border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: TC.card, color: TC.text }}
              onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = TC.g200}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: TC.g600, marginBottom: 7, fontWeight: 600 }}>Category <span style={{ color: C.primary }}>*</span></label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: "100%", background: TC.card, color: TC.text, border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "inherit", outline: "none" }}>
              {["General Inquiry", "Billing Issue", "Technical Problem", "Account Issue", "Ad Account Problem"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={{ display: "block", fontSize: 13, color: TC.g600, marginBottom: 7, fontWeight: 600 }}>Message <span style={{ color: C.primary }}>*</span></label>
          <textarea rows={5} value={msg} onChange={e => setMsg(e.target.value)} placeholder="Describe your issue in detail…"
            style={{ width: "100%", border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", outline: "none", background: TC.card, color: TC.text }}
            onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = TC.g200}
          />
        </div>
        <Btn onClick={submit} style={{ opacity: subject && msg ? 1 : .5 }}>Submit Ticket</Btn>
      </Card>
    </PageShell>
  );
}
