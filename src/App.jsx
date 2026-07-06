import { useEffect, useState } from 'react';
import { Router, Route } from './shared/Router.jsx';
import { AuthProvider, useAuth } from './shared/AuthContext.jsx';
import { ThemeProvider, useTheme } from './shared/ThemeContext.jsx';
import { getThemeColors } from './shared/theme.js';
import { useStore, setStore, hydrateStore } from './shared/store.js';
import { Sidebar as AdminSidebar, TopBar } from './shared/AdminLayout.jsx';
import { syncPermsFromServer } from './shared/permissions.js';
import { Spinner } from './shared/UI.jsx';

// New user pages (src 7 design)
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AgencyAdAccounts from './pages/AgencyAdAccounts.jsx';
import PreVerifiedAccounts from './pages/PreVerifiedAccounts.jsx';
import Orders from './pages/Orders.jsx';
import Balance from './pages/Balance.jsx';
import Support from './pages/Support.jsx';
import StructureBuilder from './pages/StructureBuilder.jsx';

// Admin pages (unchanged)
import AdminLoginPage from './user/AdminLoginPage.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import { AdminUsersPage, AdminInventoryPage, AdminOrdersPage, AdminDepositsPage, AdminTicketsPage, AdminReportsPage, AdminSettingsPage, AdminAgencyAdAccountsPage } from './admin/AdminOtherPages.jsx';
import AdminWhatsAppPage from './admin/AdminWhatsAppPage.jsx';
import AdminEmailOTPPage from './admin/AdminEmailOTPPage.jsx';
import AdminStructureAssetsPage from './admin/AdminStructureAssetsPage.jsx';
import AdminAllOrdersPage from './admin/AdminAllOrdersPage.jsx';
import AdminPolicyManagementPage from './admin/AdminPolicyManagementPage.jsx';
import AdminPolicyPaymentsPage from './admin/AdminPolicyPaymentsPage.jsx';
import AdminAccountTypesPage from './admin/AdminAccountTypesPage.jsx';
import PolicyPortalPage from './policies/PolicyPortalPage.jsx';
import SavedStructuresPage from './pages/SavedStructuresPage.jsx';

// New public landing page + login/signup (added independently on dev)
import LandingPage from './landing-custom/LandingPage.jsx';
import AuthPageWA from './user/AuthPageWA.jsx';

const USER_ROUTES = {
  '': Dashboard,
  'dashboard': Dashboard,
  'agency-ad-accounts': AgencyAdAccounts,
  'preverified-accounts': PreVerifiedAccounts,
  'orders': Orders,
  'balance': Balance,
  'support': Support,
  'structure-builder': StructureBuilder,
  'saved-structures': SavedStructuresPage,
};

function getHashKey() {
  return window.location.hash.replace(/^#\/?/, '') || '';
}

function ThemedAdminMain({ children }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <main style={{
      flex: 1,
      overflowY: 'auto',
      background: TC.bg,
      color: TC.text,
      transition: 'background .2s, color .2s',
    }}>
      {children}
    </main>
  );
}

function AdminApp() {
  const [store] = useStore();
  const { user, logout } = useAuth();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (user?.id) syncPermsFromServer(user.id);
    hydrateStore().then(() => setHydrated(true));
  }, [user?.id]);

  const addBalance = (amount) => {
    setStore(s => ({ ...s, balance: (s.balance || 0) + amount }));
  };

  if (!hydrated) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
      <AdminSidebar role="admin" logout={logout} userId={user.id} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar role="admin" user={user} balance={0} />
        <ThemedAdminMain>
          <Route path="/admin" element={<AdminDashboard users={store.users || []} orders={store.orders || []} deposits={store.deposits || []} />} />
          <Route path="/admin/users" element={<AdminUsersPage users={store.users || []} orders={store.orders || []} deposits={store.deposits || []} transactions={store.transactions || []} adAccountRequests={store.adAccountRequests || []} inventoryLines={store.inventoryLines || []} inventoryProducts={store.inventoryProducts || []} structureOrders={store.structureOrders || []} paymentMethods={store.paymentMethods || []} setStore={setStore} />} />
          <Route path="/admin/inventory" element={<AdminInventoryPage products={store.inventoryProducts || []} lines={store.inventoryLines || []} setStore={setStore} />} />
          <Route path="/admin/orders" element={<AdminAllOrdersPage />} />
          <Route path="/admin/deposits" element={<AdminDepositsPage deposits={store.deposits || []} setStore={setStore} addBalance={addBalance} />} />
          <Route path="/admin/tickets" element={<AdminTicketsPage tickets={store.supportTickets || []} />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/agency-accounts" element={<AdminAgencyAdAccountsPage requests={store.adAccountRequests || []} users={store.users || []} setStore={setStore} platformPrices={store.platformPrices || {}} />} />
          <Route path="/admin/policies" element={<AdminPolicyManagementPage />} />
          <Route path="/admin/policies/payments" element={<AdminPolicyPaymentsPage />} />
          <Route path="/admin/policies/account-types" element={<AdminAccountTypesPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage paymentMethods={store.paymentMethods || []} businessTypes={store.businessTypes || []} setStore={setStore} />} />
          <Route path="/admin/whatsapp" element={<AdminWhatsAppPage />} />
          <Route path="/admin/email-otp" element={<AdminEmailOTPPage />} />
          <Route path="/admin/structure-assets" element={<AdminStructureAssetsPage />} />
          <Route path="/" element={<AdminDashboard users={store.users || []} orders={store.orders || []} deposits={store.deposits || []} />} />
        </ThemedAdminMain>
      </div>
    </div>
  );
}

function UserApp() {
  const [hashKey, setHashKey] = useState(getHashKey());

  useEffect(() => {
    const onChange = () => setHashKey(getHashKey());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  useEffect(() => {
    if (!(hashKey in USER_ROUTES)) {
      window.location.hash = '#/dashboard';
    }
  }, [hashKey]);

  const Page = USER_ROUTES[hashKey] || Dashboard;
  return <Page />;
}

function AppContent() {
  const { user, loading, login, register } = useAuth();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <Spinner size={28} />
      </div>
    );
  }

  if (!user) {
    if (hash.startsWith('#/admin')) return <AdminLoginPage />;
    if (hash.startsWith('#/policies')) return <PolicyPortalPage />;

    const hashKey = hash.replace(/^#\/?/, '') || '';
    if (hashKey === 'login') {
      return (
        <AuthPageWA
          initialMode="signin"
          onSignIn={({ email, password }) => login(email, password)}
          onSignUp={(payload) => register(payload)}
        />
      );
    }
    if (hashKey === 'register') {
      return (
        <AuthPageWA
          initialMode="signup"
          onSignIn={({ email, password }) => login(email, password)}
          onSignUp={(payload) => register(payload)}
        />
      );
    }
    if (hashKey === '') {
      return (
        <LandingPage
          onNavigateLogin={() => { window.location.hash = '#/login'; }}
          onNavigateSignup={() => { window.location.hash = '#/register'; }}
        />
      );
    }
    return <Login />;
  }

  if (hash.startsWith('#/policies')) return <PolicyPortalPage />;
  if (user.role === 'admin') return <AdminApp />;
  return <UserApp />;
}

function PlatformBranding() {
  useEffect(() => {
    fetch('/api/admin/platform-settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        // Page title
        if (d.site_name) document.title = d.site_name;
        // Favicon — remove ALL existing favicon links then add a fresh one
        // (Chrome ignores href changes on existing elements)
        if (d.site_favicon) {
          document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']")
            .forEach(el => el.remove());
          const link = document.createElement('link');
          link.rel = 'icon';
          // Detect type from data URL prefix
          if (d.site_favicon.startsWith('data:image/png'))       link.type = 'image/png';
          else if (d.site_favicon.startsWith('data:image/jpeg')) link.type = 'image/jpeg';
          else if (d.site_favicon.startsWith('data:image/svg'))  link.type = 'image/svg+xml';
          else if (d.site_favicon.startsWith('data:image/webp')) link.type = 'image/webp';
          else if (d.site_favicon.startsWith('data:image/x-ico') || d.site_favicon.startsWith('data:image/vnd')) link.type = 'image/x-icon';
          link.href = d.site_favicon;
          document.head.appendChild(link);
        }
        // Expose branding globally for Sidebar
        window.__platformBranding = { site_name: d.site_name, site_logo: d.site_logo };
        window.dispatchEvent(new Event('platform-branding-loaded'));
      })
      .catch(() => {});
  }, []);
  return null;
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <PlatformBranding />
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
