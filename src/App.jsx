import { useEffect, useState } from 'react';
import { Router, Route, usePath, useNavigate as useRouterNavigate } from './shared/Router.jsx';
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
import PhoneVerifications from './pages/PhoneVerifications.jsx';
import Orders from './pages/Orders.jsx';
import Balance from './pages/Balance.jsx';
import Support from './pages/Support.jsx';
import StructureBuilder from './pages/StructureBuilder.jsx';

// Admin pages (unchanged)
import AdminDashboard from './admin/AdminDashboard.jsx';
import { AdminUsersPage } from './admin/AdminUsersPage.jsx';
import { AdminInventoryPage } from './admin/AdminInventoryPage.jsx';
import { AdminOrdersPage } from './admin/AdminOrdersPage.jsx';
import { AdminDepositsPage } from './admin/AdminDepositsPage.jsx';
import { AdminTicketsPage } from './admin/AdminTicketsPage.jsx';
import { AdminReportsPage } from './admin/AdminReportsPage.jsx';
import { AdminSettingsPage } from './admin/AdminSettingsPage.jsx';
import { AdminAgencyAdAccountsPage } from './admin/AdminAgencyAdAccountsPage.jsx';
import AdminWhatsAppPage from './admin/AdminWhatsAppPage.jsx';
import AdminEmailOTPPage from './admin/AdminEmailOTPPage.jsx';
import AdminOrderNotificationsPage from './admin/AdminOrderNotificationsPage.jsx';
import AdminStructureAssetsPage from './admin/AdminStructureAssetsPage.jsx';
import AdminAppearancePage from './admin/AdminAppearancePage.jsx';
import AdminAllOrdersPage from './admin/AdminAllOrdersPage.jsx';
import AdminPolicyManagementPage from './admin/AdminPolicyManagementPage.jsx';
import AdminPolicyPaymentsPage from './admin/AdminPolicyPaymentsPage.jsx';
import AdminAccountTypesPage from './admin/AdminAccountTypesPage.jsx';
import AdminVerificationsPage from './admin/AdminVerificationsPage.jsx';
import AdminVerificationSettingsPage from './admin/AdminVerificationSettingsPage.jsx';
import AdminTextVerifiedSettingsPage from './admin/AdminTextVerifiedSettingsPage.jsx';
import PolicyPortalPage from './policies/PolicyPortalPage.jsx';
import SavedStructuresPage from './pages/SavedStructuresPage.jsx';

// New public landing page + login/signup (added independently on dev)
import ActiveLandingPage from './landing-custom/ActiveLandingPage.jsx';
import { getTemplateByKey } from './landing-custom/templates/registry.js';
import AuthPageWA from './user/AuthPageWA.jsx';
import ForgotPasswordPage from './user/ForgotPasswordPage.jsx';
import VerifyRequestPage from './user/VerifyRequestPage.jsx';
import PublicProductsPage from './pages/PublicProductsPage.jsx';

const USER_ROUTES = {
  '': Dashboard,
  'dashboard': Dashboard,
  'agency-ad-accounts': AgencyAdAccounts,
  'preverified-accounts': PreVerifiedAccounts,
  'phone-verifications': PhoneVerifications,
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
  const path = usePath();
  const routerNavigate = useRouterNavigate();

  useEffect(() => {
    if (user?.id) syncPermsFromServer(user.id);
    hydrateStore().then(() => setHydrated(true));
  }, [user?.id]);

  // Logging in from the regular /login page (rather than /admin's own login
  // screen) never changes the hash — this component used to just assume the
  // hash already pointed at a matching /admin/* route, leaving every <Route>
  // unmatched (and the content area blank) whenever that assumption was wrong.
  useEffect(() => {
    if (!path.startsWith('/admin')) routerNavigate('/admin');
  }, [path, routerNavigate]);

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
      <AdminSidebar role="admin" logout={logout} userId={user.id} user={user} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar role="admin" user={user} balance={0} />
        <ThemedAdminMain>
          <Route path="/admin" element={<AdminDashboard users={store.users || []} orders={store.orders || []} deposits={store.deposits || []} />} />
          <Route path="/admin/users" element={<AdminUsersPage users={store.users || []} orders={store.orders || []} deposits={store.deposits || []} transactions={store.transactions || []} adAccountRequests={store.adAccountRequests || []} inventoryLines={store.inventoryLines || []} inventoryProducts={store.inventoryProducts || []} structureOrders={store.structureOrders || []} paymentMethods={store.paymentMethods || []} setStore={setStore} />} />
          <Route path="/admin/inventory" element={<AdminInventoryPage products={store.inventoryProducts || []} lines={store.inventoryLines || []} setStore={setStore} />} />
          <Route path="/admin/orders" element={<AdminAllOrdersPage />} />
          <Route path="/admin/deposits" element={<AdminDepositsPage deposits={store.deposits || []} setStore={setStore} addBalance={addBalance} />} />
          <Route path="/admin/tickets" element={<AdminTicketsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/agency-accounts" element={<AdminAgencyAdAccountsPage requests={store.adAccountRequests || []} users={store.users || []} setStore={setStore} platformPrices={store.platformPrices || {}} />} />
          <Route path="/admin/policies" element={<AdminPolicyManagementPage />} />
          <Route path="/admin/policies/payments" element={<AdminPolicyPaymentsPage />} />
          <Route path="/admin/policies/account-types" element={<AdminAccountTypesPage />} />
          <Route path="/admin/verifications" element={<AdminVerificationsPage />} />
          <Route path="/admin/verification-settings" element={<AdminVerificationSettingsPage />} />
          <Route path="/admin/textverified-settings" element={<AdminTextVerifiedSettingsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage paymentMethods={store.paymentMethods || []} businessTypes={store.businessTypes || []} setStore={setStore} />} />
          <Route path="/admin/whatsapp" element={<AdminWhatsAppPage />} />
          <Route path="/admin/email-otp" element={<AdminEmailOTPPage />} />
          <Route path="/admin/order-notifications" element={<AdminOrderNotificationsPage />} />
          <Route path="/admin/structure-assets" element={<AdminStructureAssetsPage />} />
          <Route path="/admin/appearance" element={<AdminAppearancePage />} />
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

  if (hash.startsWith('#/verify/')) {
    const token = hash.replace(/^#\/verify\//, '');
    return <VerifyRequestPage token={token} />;
  }

  if (hash.startsWith('#/preview-landing/')) {
    const key = decodeURIComponent(hash.replace(/^#\/preview-landing\//, ''));
    const PreviewTemplate = getTemplateByKey(key).component;
    return <PreviewTemplate onNavigateLogin={() => {}} onNavigateSignup={() => {}} />;
  }

  // Public product catalog — read-only, accessible whether logged in or not.
  // Respects the admin's "products_page_enabled" toggle internally.
  if (hash.startsWith('#/products')) {
    return (
      <PublicProductsPage
        onNavigateLogin={() => { window.location.hash = '#/login'; }}
        onNavigateSignup={() => { window.location.hash = '#/register'; }}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <Spinner size={28} />
      </div>
    );
  }

  if (!user) {
    if (hash.startsWith('#/policies')) return <PolicyPortalPage />;

    const isRoute = hash.startsWith('#/');
    const hashKey = isRoute ? (hash.replace(/^#\/?/, '') || '') : '';
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
    if (hashKey === 'forgot-password') {
      return <ForgotPasswordPage />;
    }
    if (hashKey === '') {
      return (
        <ActiveLandingPage
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
