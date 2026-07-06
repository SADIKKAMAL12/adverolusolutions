import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const en = {
  dir: "ltr",
  nav: { home: "Home", platforms: "Platforms", pricing: "Pricing", features: "Features", faq: "FAQ", contact: "Contact", login: "Log in", cta: "Access Dashboard" },
  hero: {
    badge: "Trusted by 500+ Agencies",
    title_1: "Scale Your Campaigns",
    title_with: "With",
    title_2: "Trusted Agency",
    title_3: "Accounts",
    sub: "Instant access to Meta, Google, TikTok, Snapchat and Bing advertising accounts for agencies and scaling brands.",
    cta1: "Access Dashboard",
    cta2: "Explore Platforms",
    badges: ["Instant Delivery", "Verified Accounts", "Balance Warranty", "24/7 Support"]
  },
  billing: {
    title: "Meta Agency Billing", active: "Active",
    outstanding: "Outstanding balance", anyFees: "+ any applicable fees", payNow: "Pay Now",
    methods: "Payment methods", addMethod: "Add payment method",
    creditLine: "Credit line", default: "Default", creditAvail: "Credit available:", high: "High",
    company: "ADVERSOLUTIONS LLC",
    spendLimit: "Account spending limit", remaining: "Remaining amount: $5,000.00",
    spent: "$5,000.00 spent | $10,000.00 spending limit",
    resetsManually: "Resets manually", resetNow: "Reset now",
    recent: "Recent transactions", date: "Date", desc: "Description", amount: "Amount", status: "Status", paid: "Paid",
    viewAll: "View all transactions"
  },
  platforms: {
    kicker: "Platforms Supported",
    title: "Premium Ad Accounts For Every Platform",
    sub: "Choose from the world's leading advertising platforms and access reliable, high-performing agency accounts.",
    available: "Available", verified: "Verified", learnMore: "Learn more",
    cards: [
      { name: "Meta Ads", desc: "Meta Agency advertising accounts with strong stability and elevated limits." },
      { name: "Google Ads", desc: "Google Ads agency accounts ideal for large-scale, high-performing campaigns." },
      { name: "TikTok Ads", desc: "TikTok Ads agency accounts to reach your audience quickly and at scale." },
      { name: "Snapchat Ads", desc: "Snapchat Ads agency accounts for profitable, well-targeted campaigns." },
      { name: "Bing Ads", desc: "Bing Ads agency accounts to reach qualified, high-intent audiences." }
    ]
  },
  features: {
    kicker: "Why Choose Us",
    title: "Everything You Need To Scale",
    items: [
      { t: "Instant Delivery", d: "Get account access within minutes." },
      { t: "Verified Accounts", d: "All accounts are verified and ready to use." },
      { t: "Balance Warranty", d: "We guarantee balance and account stability." },
      { t: "24/7 Support", d: "Our team is here for you 24/7." },
      { t: "Secure Infrastructure", d: "Your data and accounts are 100% secure." },
      { t: "Advanced Dashboard", d: "Manage your accounts from a powerful dashboard." }
    ]
  },
  pricing: {
    kicker: "Agency Account Pricing",
    title: "Simple, Transparent Pricing",
    sub: "Every account includes balance warranty and instant delivery.",
    perAccount: "/ per account", popular: "POPULAR",
    minTopup: "Minimum topup", topupFees: "Topup fees",
    pay: "Secure payments and flexible methods",
    cards: [
      { name: "Meta Agency Ads", price: "$70", min: "$100", fees: "6%", features: ["Balance warranty", "Instant delivery", "Dashboard access", "Verified account", "Premium support"], cta: "Choose Meta Ads" },
      { name: "Google Agency Ads", price: "$99", min: "$200", fees: "9%", features: ["Balance warranty", "Stable billing", "Dashboard access", "Verified account", "Premium support"], cta: "Choose Google Ads" },
      { name: "TikTok Agency Ads", price: "$39", min: "$100", fees: "3%", features: ["Balance warranty", "Instant delivery", "Scalable spending", "Dashboard access", "Premium support"], cta: "Choose TikTok Ads" }
    ]
  },
  faq: {
    kicker: "FAQ", title: "Frequently Asked Questions",
    sub: "Everything you need to know about our agency advertising accounts.",
    items: [
      { q: "What is an agency ad account?", a: "An agency ad account is a premium advertising account managed by a verified agency partner. It offers higher limits, faster reviews, and dedicated stability for scaling brands." },
      { q: "Are the accounts verified?", a: "Yes, every account is fully verified and provisioned through trusted agency partnerships before delivery." },
      { q: "How fast is delivery?", a: "Most accounts are delivered within minutes of payment confirmation, with full dashboard credentials." },
      { q: "Which platforms are supported?", a: "Meta, Google, TikTok, Snapchat and Bing — all delivered as agency-grade accounts." },
      { q: "Do you provide balance warranty?", a: "Yes, every account ships with a balance warranty so any unspent balance is protected." },
      { q: "Is dashboard access included?", a: "Every order includes access to our advanced dashboard to manage spend, top-ups and account health." },
      { q: "What payment methods are accepted?", a: "We support major cards, crypto, and wire transfers — all secured with enterprise-grade encryption." }
    ]
  },
  cta: { title: "Ready to Scale Your Advertising?", sub: "Join 500+ agencies and brands already running on AdverSolutions.", btn1: "Access Dashboard", btn2: "Contact Support" },
  footer: {
    tag: "The #1 platform for verified, reliable agency advertising accounts.",
    navTitle: "Navigation", platTitle: "Platforms", resTitle: "Resources", contactTitle: "Contact",
    live: "Live chat 24/7", terms: "Terms", privacy: "Privacy",
    copy: "© 2026 AdverSolutions. All rights reserved."
  },
  ui: {
    nav: {
      dashboard: "Dashboard", agencyAdAccounts: "Agency Ad Accounts", preVerifiedAccounts: "Pre-Verified Accounts",
      purchaseHistory: "Purchase History", balance: "Balance", support: "Support",
      needHelp: "Need help?", supportAvailable: "Support team available 24/7",
      contactSupport: "Contact Support", logout: "← Logout",
    },
    topbar: { balance: "Balance" },
    dashboard: {
      welcome: "Welcome back! 👋", subtitle: "Here's what's happening with your account today.",
      currentBalance: "Current Balance", totalSpend: "Total Spend", totalAccounts: "Total Accounts", pendingOrders: "Pending Orders",
      quickActions: "Quick Actions",
      createAdAccount: "Create Ad Account", createAdAccountSub: "Request new ad account",
      topUpBalance: "Top Up Balance", topUpBalanceSub: "Add funds to account",
      buyVerifiedAccount: "Buy Verified Account", buyVerifiedAccountSub: "Browse accounts",
      contactSupport: "Contact Support", contactSupportSub: "Get help from our team",
      recentActivity: "Recent Activity", viewAll: "View all →",
      noActivity: "No activity yet. Make your first deposit to get started!",
      balanceOverview: "Balance Overview", currentBalanceLabel: "Current Balance",
      pending: "Pending", totalDeposits: "Total Deposits", topUpBtn: "◈ Top Up Balance",
      col: { hash: "#", type: "Type", method: "Method", amount: "Amount", status: "Status", date: "Date" },
    },
  },
};

const fr = {
  dir: "ltr",
  nav: { home: "Accueil", platforms: "Plateformes", pricing: "Tarifs", features: "Fonctionnalités", faq: "FAQ", contact: "Contact", login: "Se connecter", cta: "Accéder au Dashboard" },
  hero: {
    badge: "Approuvé par 500+ Agences",
    title_1: "Développez Vos Campagnes", title_with: "Avec",
    title_2: "des Comptes", title_3: "Agence Vérifiés",
    sub: "Accédez instantanément à des comptes publicitaires Meta, Google, TikTok, Snapchat et Bing, conçus pour les marques et agences en croissance.",
    cta1: "Accéder au Dashboard", cta2: "Explorer les Plateformes",
    badges: ["Livraison Instantanée", "Comptes Vérifiés", "Garantie de Solde", "Support 24/7"]
  },
  billing: {
    title: "Meta Agency Billing", active: "Actif",
    outstanding: "Solde dû", anyFees: "+ frais éventuels", payNow: "Payer",
    methods: "Moyens de paiement", addMethod: "Ajouter un moyen",
    creditLine: "Ligne de crédit", default: "Défaut", creditAvail: "Crédit disponible :", high: "Élevé",
    company: "ADVERSOLUTIONS LLC",
    spendLimit: "Limite de dépense du compte", remaining: "Montant restant : 5 000,00 $",
    spent: "5 000,00 $ dépensés | 10 000,00 $ de limite",
    resetsManually: "Réinitialisation manuelle", resetNow: "Réinitialiser",
    recent: "Transactions récentes", date: "Date", desc: "Description", amount: "Montant", status: "Statut", paid: "Payé",
    viewAll: "Voir toutes les transactions"
  },
  platforms: {
    kicker: "Plateformes Supportées",
    title: "Comptes Publicitaires Premium pour Chaque Plateforme",
    sub: "Choisissez parmi les meilleures plateformes publicitaires au monde et accédez à des comptes agence fiables et performants.",
    available: "Disponible", verified: "Vérifié", learnMore: "En savoir plus",
    cards: [
      { name: "Meta Ads", desc: "Comptes publicitaires Meta Agence avec une stabilité et des limites élevées." },
      { name: "Google Ads", desc: "Comptes Google Ads Agence pour des campagnes à grande échelle et performantes." },
      { name: "TikTok Ads", desc: "Comptes TikTok Ads Agence idéaux pour atteindre votre audience rapidement." },
      { name: "Snapchat Ads", desc: "Comptes Snapchat Ads Agence pour des campagnes rentables et ciblées." },
      { name: "Bing Ads", desc: "Comptes Bing Ads Agence pour toucher des audiences qualifiées." }
    ]
  },
  features: {
    kicker: "Pourquoi Nous Choisir", title: "Tout Ce Dont Vous Avez Besoin Pour Scaler",
    items: [
      { t: "Livraison Instantanée", d: "Accédez à vos comptes en quelques minutes seulement." },
      { t: "Comptes Vérifiés", d: "Tous nos comptes sont vérifiés et prêts à l'emploi." },
      { t: "Garantie de Solde", d: "Nous garantissons le solde et la stabilité des comptes." },
      { t: "Support 24/7", d: "Notre équipe est disponible 24h/24 et 7j/7 pour vous." },
      { t: "Sécurisé & Fiable", d: "Vos données et vos comptes sont 100% sécurisés." },
      { t: "Dashboard Avancé", d: "Gérez vos comptes depuis un dashboard puissant." }
    ]
  },
  pricing: {
    kicker: "Tarifs des Comptes Agence", title: "Des Tarifs Simples et Transparents",
    sub: "Tous les comptes incluent une garantie sur le solde et une livraison instantanée.",
    perAccount: "/ par compte", popular: "POPULAIRE",
    minTopup: "Topup minimum", topupFees: "Frais de topup",
    pay: "Paiements sécurisés et méthodes flexibles",
    cards: [
      { name: "Meta Agency Ads", price: "$70", min: "$100", fees: "6%", features: ["Garantie sur le solde", "Livraison instantanée", "Accès au dashboard", "Compte vérifié", "Support premium"], cta: "Choisir Meta Ads" },
      { name: "Google Agency Ads", price: "$99", min: "$200", fees: "9%", features: ["Garantie sur le solde", "Facturation stable", "Accès au dashboard", "Compte vérifié", "Support premium"], cta: "Choisir Google Ads" },
      { name: "TikTok Agency Ads", price: "$39", min: "$100", fees: "3%", features: ["Garantie sur le solde", "Livraison instantanée", "Dépense scalable", "Accès au dashboard", "Support premium"], cta: "Choisir TikTok Ads" }
    ]
  },
  faq: {
    kicker: "FAQ", title: "Questions Fréquemment Posées",
    sub: "Tout ce que vous devez savoir sur nos comptes agence publicitaires.",
    items: [
      { q: "Qu'est-ce qu'un compte agence ?", a: "Un compte agence est un compte publicitaire premium géré via un partenaire agence vérifié. Il offre des limites plus élevées et une meilleure stabilité." },
      { q: "Les comptes sont-ils vérifiés ?", a: "Oui, chaque compte est entièrement vérifié et provisionné via des partenariats agence de confiance." },
      { q: "Combien de temps prend la livraison ?", a: "La plupart des comptes sont livrés en quelques minutes après confirmation du paiement." },
      { q: "Quelles plateformes sont disponibles ?", a: "Meta, Google, TikTok, Snapchat et Bing — toutes en qualité agence." },
      { q: "Fournissez-vous une garantie sur le solde ?", a: "Oui, chaque compte est livré avec une garantie de solde pour protéger les fonds non dépensés." },
      { q: "Quels sont les modes de paiement acceptés ?", a: "Nous acceptons les cartes principales, les cryptomonnaies et les virements bancaires sécurisés." },
      { q: "Proposez-vous un support après-vente ?", a: "Oui, notre équipe support est disponible 24/7 pour vous accompagner après chaque commande." }
    ]
  },
  cta: { title: "Prêt à Scaler Votre Publicité ?", sub: "Rejoignez plus de 500 agences et marques qui font confiance à AdverSolutions.", btn1: "Accéder au Dashboard", btn2: "Nous Contacter" },
  footer: {
    tag: "La plateforme n°1 pour les comptes publicitaires agence vérifiés et fiables.",
    navTitle: "Navigation", platTitle: "Plateformes", resTitle: "Ressources", contactTitle: "Contact",
    live: "Live chat 24/7", terms: "Conditions", privacy: "Confidentialité",
    copy: "© 2026 AdverSolutions. Tous droits réservés."
  },
  ui: {
    nav: {
      dashboard: "Tableau de bord", agencyAdAccounts: "Comptes Agence", preVerifiedAccounts: "Comptes Pré-Vérifiés",
      purchaseHistory: "Historique d'achats", balance: "Solde", support: "Support",
      needHelp: "Besoin d'aide ?", supportAvailable: "Équipe support disponible 24/7",
      contactSupport: "Contacter le support", logout: "← Déconnexion",
    },
    topbar: { balance: "Solde" },
    dashboard: {
      welcome: "Bon retour ! 👋", subtitle: "Voici ce qui se passe avec votre compte aujourd'hui.",
      currentBalance: "Solde actuel", totalSpend: "Dépenses totales", totalAccounts: "Comptes totaux", pendingOrders: "Commandes en attente",
      quickActions: "Actions rapides",
      createAdAccount: "Créer un compte pub", createAdAccountSub: "Demander un nouveau compte",
      topUpBalance: "Recharger le solde", topUpBalanceSub: "Ajouter des fonds",
      buyVerifiedAccount: "Acheter un compte vérifié", buyVerifiedAccountSub: "Parcourir les comptes",
      contactSupport: "Contacter le support", contactSupportSub: "Obtenir de l'aide",
      recentActivity: "Activité récente", viewAll: "Voir tout →",
      noActivity: "Aucune activité. Faites votre premier dépôt pour commencer !",
      balanceOverview: "Aperçu du solde", currentBalanceLabel: "Solde actuel",
      pending: "En attente", totalDeposits: "Dépôts totaux", topUpBtn: "◈ Recharger le solde",
      col: { hash: "#", type: "Type", method: "Méthode", amount: "Montant", status: "Statut", date: "Date" },
    },
  },
};

const ar = {
  dir: "rtl",
  nav: { home: "الرئيسية", platforms: "المنصات", pricing: "الأسعار", features: "الميزات", faq: "الأسئلة", contact: "اتصل بنا", login: "تسجيل الدخول", cta: "الدخول إلى لوحة التحكم" },
  hero: {
    badge: "موثوق به من +500 وكالة",
    title_1: "وسّع نطاق حملاتك", title_with: "مع",
    title_2: "حسابات وكالة", title_3: "موثوقة",
    sub: "وصول فوري إلى حسابات إعلانات Meta وGoogle وTikTok وSnapchat وBing للوكالات والعلامات التجارية المتنامية.",
    cta1: "الدخول إلى لوحة التحكم", cta2: "استكشف المنصات",
    badges: ["تسليم فوري", "حسابات موثقة", "ضمان الرصيد", "دعم 24/7"]
  },
  billing: {
    title: "فوترة وكالة Meta", active: "نشط",
    outstanding: "الرصيد المستحق", anyFees: "+ أي رسوم إضافية", payNow: "ادفع الآن",
    methods: "طرق الدفع", addMethod: "إضافة وسيلة دفع",
    creditLine: "خط الائتمان", default: "افتراضي", creditAvail: "الائتمان المتاح:", high: "مرتفع",
    company: "ADVERSOLUTIONS LLC",
    spendLimit: "حد إنفاق الحساب", remaining: "المبلغ المتبقي: 5,000.00 $",
    spent: "5,000.00 $ مُنفقة | 10,000.00 $ حد الإنفاق",
    resetsManually: "إعادة تعيين يدوياً", resetNow: "إعادة الآن",
    recent: "المعاملات الأخيرة", date: "التاريخ", desc: "الوصف", amount: "المبلغ", status: "الحالة", paid: "مدفوع",
    viewAll: "عرض كل المعاملات"
  },
  platforms: {
    kicker: "المنصات المدعومة", title: "حسابات إعلانية متميزة لكل منصة",
    sub: "اختر من بين أفضل المنصات الإعلانية في العالم واحصل على حسابات وكالة موثوقة وعالية الأداء.",
    available: "متاح", verified: "موثق", learnMore: "اعرف المزيد",
    cards: [
      { name: "Meta Ads", desc: "حسابات إعلانية Meta Agency باستقرار عالٍ وحدود مرتفعة." },
      { name: "Google Ads", desc: "حسابات وكالة Google Ads مثالية للحملات الواسعة وعالية الأداء." },
      { name: "TikTok Ads", desc: "حسابات وكالة TikTok Ads للوصول إلى جمهورك بسرعة وعلى نطاق واسع." },
      { name: "Snapchat Ads", desc: "حسابات وكالة Snapchat Ads لحملات مربحة ومستهدفة." },
      { name: "Bing Ads", desc: "حسابات وكالة Bing Ads للوصول إلى جماهير مؤهلة." }
    ]
  },
  features: {
    kicker: "لماذا تختارنا", title: "كل ما تحتاجه للنمو",
    items: [
      { t: "تسليم فوري", d: "احصل على حسابك خلال دقائق." },
      { t: "حسابات موثقة", d: "جميع الحسابات موثقة وجاهزة للاستخدام." },
      { t: "ضمان الرصيد", d: "نضمن استقرار الرصيد والحساب." },
      { t: "دعم 24/7", d: "فريقنا متاح لك على مدار الساعة." },
      { t: "بنية تحتية آمنة", d: "بياناتك وحساباتك مؤمنة 100٪." },
      { t: "لوحة تحكم متطورة", d: "إدارة حساباتك من لوحة قوية." }
    ]
  },
  pricing: {
    kicker: "أسعار حسابات الوكالة", title: "أسعار بسيطة وشفافة",
    sub: "كل حساب يشمل ضمان الرصيد والتسليم الفوري.",
    perAccount: "/ لكل حساب", popular: "الأكثر شيوعاً",
    minTopup: "الحد الأدنى للشحن", topupFees: "رسوم الشحن",
    pay: "مدفوعات آمنة وطرق مرنة",
    cards: [
      { name: "Meta Agency Ads", price: "$70", min: "$100", fees: "6%", features: ["ضمان الرصيد", "تسليم فوري", "وصول إلى الداشبورد", "حساب موثق", "دعم متميز"], cta: "اختر Meta Ads" },
      { name: "Google Agency Ads", price: "$99", min: "$200", fees: "9%", features: ["ضمان الرصيد", "فوترة مستقرة", "وصول إلى الداشبورد", "حساب موثق", "دعم متميز"], cta: "اختر Google Ads" },
      { name: "TikTok Agency Ads", price: "$39", min: "$100", fees: "3%", features: ["ضمان الرصيد", "تسليم فوري", "إنفاق قابل للتوسع", "وصول إلى الداشبورد", "دعم متميز"], cta: "اختر TikTok Ads" }
    ]
  },
  faq: {
    kicker: "الأسئلة الشائعة", title: "الأسئلة الأكثر شيوعاً",
    sub: "كل ما تريد معرفته عن حسابات الوكالة الإعلانية.",
    items: [
      { q: "ما هو حساب الوكالة الإعلاني؟", a: "حساب وكالة إعلاني هو حساب متميز يُدار عبر شريك وكالة موثوق، يوفر حدوداً أعلى واستقراراً أفضل." },
      { q: "هل الحسابات موثقة؟", a: "نعم، كل حساب يتم التحقق منه بالكامل قبل التسليم." },
      { q: "ما مدى سرعة التسليم؟", a: "تُسلَّم معظم الحسابات في غضون دقائق بعد تأكيد الدفع." },
      { q: "ما المنصات المدعومة؟", a: "Meta وGoogle وTikTok وSnapchat وBing — جميعها بجودة وكالة." },
      { q: "هل تقدمون ضمان الرصيد؟", a: "نعم، يأتي كل حساب مع ضمان لحماية الرصيد غير المنفق." },
      { q: "هل وصول لوحة التحكم مشمول؟", a: "كل طلب يشمل الوصول إلى لوحة تحكم متقدمة لإدارة الإنفاق." },
      { q: "ما طرق الدفع المقبولة؟", a: "البطاقات الرئيسية والعملات الرقمية والتحويلات البنكية بأمان كامل." }
    ]
  },
  cta: { title: "هل أنت جاهز لتوسيع إعلاناتك؟", sub: "انضم إلى أكثر من 500 وكالة وعلامة تجارية تعتمد على AdverSolutions.", btn1: "الدخول إلى لوحة التحكم", btn2: "تواصل مع الدعم" },
  footer: {
    tag: "المنصة رقم 1 لحسابات الوكالات الإعلانية الموثقة والموثوقة.",
    navTitle: "التنقل", platTitle: "المنصات", resTitle: "الموارد", contactTitle: "اتصل بنا",
    live: "دردشة مباشرة 24/7", terms: "الشروط", privacy: "الخصوصية",
    copy: "© 2026 AdverSolutions. جميع الحقوق محفوظة."
  },
  ui: {
    nav: {
      dashboard: "لوحة التحكم", agencyAdAccounts: "حسابات الوكالة", preVerifiedAccounts: "حسابات موثقة مسبقاً",
      purchaseHistory: "سجل المشتريات", balance: "الرصيد", support: "الدعم",
      needHelp: "هل تحتاج مساعدة؟", supportAvailable: "فريق الدعم متاح 24/7",
      contactSupport: "تواصل مع الدعم", logout: "تسجيل الخروج ←",
    },
    topbar: { balance: "الرصيد" },
    dashboard: {
      welcome: "مرحباً بعودتك! 👋", subtitle: "إليك ما يحدث في حسابك اليوم.",
      currentBalance: "الرصيد الحالي", totalSpend: "إجمالي الإنفاق", totalAccounts: "إجمالي الحسابات", pendingOrders: "الطلبات المعلقة",
      quickActions: "إجراءات سريعة",
      createAdAccount: "إنشاء حساب إعلاني", createAdAccountSub: "طلب حساب إعلاني جديد",
      topUpBalance: "شحن الرصيد", topUpBalanceSub: "إضافة أموال للحساب",
      buyVerifiedAccount: "شراء حساب موثق", buyVerifiedAccountSub: "تصفح الحسابات",
      contactSupport: "تواصل مع الدعم", contactSupportSub: "احصل على مساعدة من فريقنا",
      recentActivity: "النشاط الأخير", viewAll: "عرض الكل →",
      noActivity: "لا يوجد نشاط بعد. قم بأول إيداع للبدء!",
      balanceOverview: "نظرة عامة على الرصيد", currentBalanceLabel: "الرصيد الحالي",
      pending: "معلق", totalDeposits: "إجمالي الإيداعات", topUpBtn: "◈ شحن الرصيد",
      col: { hash: "#", type: "النوع", method: "الطريقة", amount: "المبلغ", status: "الحالة", date: "التاريخ" },
    },
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar }
    },
    lng: localStorage.getItem("adv_lang") || "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    returnObjects: true
  });

  i18n.on("languageChanged", (lng) => {
    localStorage.setItem("adv_lang", lng);
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  });

  document.documentElement.lang = i18n.language;
  document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
}

export default i18n;
