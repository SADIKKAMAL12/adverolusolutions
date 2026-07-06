import { C } from '../shared/theme.js'
import { useStore } from '../shared/store.js'
import { useNavigate } from '../shared/Router.jsx'
import { PageShell, Card, Btn, PlatformIcon } from '../shared/UI.jsx'

export default function MediaBuyersPage({ mediaBuyers, setStore }) {
  const [store] = useStore();
  const navigate = useNavigate();
  const approved = (mediaBuyers || []).filter(m => m.status === "approved");

  const hireBuyer = (buyer) => {
    const project = {
      id: "PRJ-" + Date.now(),
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerAvatar: buyer.avatar,
      clientName: (store.auth && store.auth.name) || "Client",
      clientEmail: (store.auth && store.auth.email) || "client@example.com",
      platform: buyer.platforms[0],
      budget: buyer.rate,
      status: "active",
      progress: 0,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      updates: [
        { id: 1, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), title: "Project Created", msg: buyer.name + " has been hired. Initial setup will begin shortly.", prog: 0, by: "system" }
      ],
      files: [],
      messages: [
        { id: 1, from: "buyer", name: buyer.name, text: "Hi! I'm excited to work on your campaign. Could you share your goals and target audience?", date: "Just now" },
      ],
    };
    setStore(s => ({
      ...s,
      projects: [project, ...s.projects],
      orders: [{ id: "ORD-" + Date.now(), user: (s.auth && s.auth.email) || "user", type: "Media Buyer", platform: buyer.platforms[0], amount: buyer.rate, status: "processing", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }, ...s.orders],
    }));
    alert("You hired " + buyer.name + "! A new project has been created.");
    navigate("/projects");
  };

  return (
    <PageShell
      title="Media Buyers"
      subtitle="Hire expert media buyers to scale your advertising campaigns."
      actions={[
        <Btn key="how" variant="outline">? How it works?</Btn>,
      ]}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20 }}>
        <div>
          <Card style={{ marginBottom: 18, padding: "14px 18px" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[ ["Platform", ["All Platforms", "Meta", "Google", "TikTok", "Snapchat"]], ["Expertise", ["All Expertise", "Performance", "Brand", "E-commerce"]], ["Pricing", ["All Pricing", "Monthly", "Project"]] ].map(([l, o]) => (
                <div key={l}>
                  <div style={{ fontSize: 11, color: C.g400, marginBottom: 4, fontWeight: 600 }}>{l}</div>
                  <select style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
                    {o.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ marginLeft: "auto", alignSelf: "flex-end" }}>
                <input placeholder="🔍 Search buyers…" style={{ width: 200, border: `1px solid ${C.g200}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
              </div>
            </div>
          </Card>

          <div style={{ fontSize: 13, color: C.g400, marginBottom: 14 }}>
            Showing {approved.length} media buyer{approved.length !== 1 ? "s" : ""} available
          </div>

          {approved.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "64px 32px" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>👤</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: C.g700, margin: "0 0 8px" }}>No Media Buyers Available Yet</h3>
              <p style={{ fontSize: 14, color: C.g400, margin: "0 0 20px" }}>We're reviewing applications. Check back soon!</p>
            </Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {approved.map(mb => (
                <Card key={mb.id}>
                  {mb.orders > 100 && <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 20, background: C.yellowL, color: "#d97706", display: "inline-block", marginBottom: 10 }}>⭐ Top Rated</span>}
                  {mb.orders > 50 && mb.orders <= 100 && <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 20, background: C.blueL, color: C.blue, display: "inline-block", marginBottom: 10 }}>Pro Seller</span>}
                  {!mb.orders && mb.orders === 0 && mb.status === "approved" && <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 20, background: C.greenL, color: C.green, display: "inline-block", marginBottom: 10 }}>New</span>}
                  <div style={{ width: 50, height: 50, borderRadius: "50%", background: `linear-gradient(135deg,${C.primary},#ff6b7a)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, marginBottom: 10 }}>{mb.avatar}</div>
                  <div style={{ fontWeight: 900, fontSize: 14, color: C.g800 }}>{mb.name} ✓</div>
                  <div style={{ fontSize: 12, color: C.g500, marginBottom: 8 }}>{mb.speciality}</div>
                  <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>{mb.platforms.map(p => <PlatformIcon key={p} name={p} size={15} />)}</div>
                  {mb.rating > 0 && (
                    <div style={{ fontSize: 12, color: C.yellow }}>
                      {"★".repeat(Math.floor(mb.rating))}
                      <span style={{ color: C.g400 }}> {mb.rating} ({mb.reviews} reviews)</span>
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: C.g400, margin: "5px 0 14px" }}>
                    {mb.spent} managed {mb.orders > 0 ? `· ${mb.orders} orders` : ""}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 900, fontSize: 16, color: C.primary }}>${mb.rate}<span style={{ fontSize: 11, color: C.g400, fontWeight: 400 }}>/mo</span></span>
                    <Btn size="sm" onClick={() => hireBuyer(mb)}>Hire Now</Btn>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800, color: C.g800 }}>Why Hire a Media Buyer?</h3>
            {[["📊", "Expert campaign management", "Maximize ROI with proven strategies"], ["⏱", "Save time & effort", "We handle ads while you focus on business"], ["🚀", "Scale faster", "Experienced buyers achieve better results"], ["🛡", "Risk-free", "Pay monthly, cancel anytime"]].map(([ic, t, s]) => (
              <div key={t} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, background: C.primaryLight, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{ic}</div>
                <div><div style={{ fontWeight: 700, fontSize: 12, color: C.g700 }}>{t}</div><div style={{ fontSize: 11, color: C.g400, marginTop: 2 }}>{s}</div></div>
              </div>
            ))}
          </Card>
          <Card>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800, color: C.g800 }}>How It Works</h3>
            {[["Browse & choose", "Explore buyers and check their reviews"], ["Hire & discuss", "Share your campaign goals and budget"], ["Launch & grow", "They manage your ads and drive results"]].map(([t, s], i) => (
              <div key={t} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 26, height: 26, background: C.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                <div><div style={{ fontWeight: 700, fontSize: 13, color: C.g600 }}>{t}</div><div style={{ fontSize: 11, color: C.g400, marginTop: 2 }}>{s}</div></div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
