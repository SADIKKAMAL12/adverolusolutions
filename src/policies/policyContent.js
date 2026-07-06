export const POLICY_LANGUAGES = ['en', 'fr', 'ar']

export const POLICY_UI = {
  en: {
    liveTranslation: 'Live translation',
    serviceAndPolicySelection: 'Service & Policy Selection',
    selectCategory: 'Select a category and review the corresponding policy',
    reviewPolicies: 'Step 1 · Review Policies',
    language: 'Language',
    scrollToReview: 'Scroll to review the entire policy',
    scrollForMe: 'Scroll for me',
    tapToScroll: 'Tap to scroll',
    continueToPayment: 'Continue to payment methods',
    paymentMethods: 'Payment Methods',
    paymentSubtitle: 'Choose a method to view payment details in your preferred language.',
    backToPolicies: 'Back to Policies',
    paymentAvailable: 'Payment instructions are available in your preferred language.',
    warranty: 'WARRANTY',
    reviewTime: 'REVIEW TIME',
    warrantyText: 'Warranty remains valid as long as client uses account properly and without policy violations.',
    reviewTimeText: 'Verification can take 24h–7 days depending on platform decision.',
    nextSteps: 'Next Steps',
    nextStepsText: 'After payment, please contact support for confirmation.',
    contactSupport: 'Contact Support',
    accountDetails: 'Account details',
    extraFields: 'Extra details',
    noCategories: 'No policy categories are active yet.',
    noPaymentMethods: 'No payment methods are active yet.',
  },
  fr: {
    liveTranslation: 'Traduction en direct',
    serviceAndPolicySelection: 'Selection du service et des politiques',
    selectCategory: 'Selectionnez une categorie et consultez la politique correspondante',
    reviewPolicies: 'Etape 1 · Lire les politiques',
    language: 'Langue',
    scrollToReview: 'Faites defiler pour lire toute la politique',
    scrollForMe: 'Defiler pour moi',
    tapToScroll: 'Touchez pour defiler',
    continueToPayment: 'Continuer vers les moyens de paiement',
    paymentMethods: 'Moyens de paiement',
    paymentSubtitle: 'Choisissez une methode pour voir les details de paiement dans votre langue.',
    backToPolicies: 'Retour aux politiques',
    paymentAvailable: 'Les instructions de paiement sont disponibles dans votre langue.',
    warranty: 'GARANTIE',
    reviewTime: 'DELAI DE REVISION',
    warrantyText: "La garantie reste valable tant que le client utilise le compte correctement et sans violation des politiques.",
    reviewTimeText: "La verification peut prendre de 24 h a 7 jours selon la decision de la plateforme.",
    nextSteps: 'Etapes suivantes',
    nextStepsText: 'Apres le paiement, contactez le support pour confirmation.',
    contactSupport: 'Contacter le support',
    accountDetails: 'Details du compte',
    extraFields: 'Details supplementaires',
    noCategories: "Aucune categorie de politique n'est active pour le moment.",
    noPaymentMethods: "Aucun moyen de paiement n'est actif pour le moment.",
  },
  ar: {
    liveTranslation: 'ترجمة مباشرة',
    serviceAndPolicySelection: 'اختيار الخدمة والسياسات',
    selectCategory: 'اختر الفئة وراجع السياسة المرتبطة بها',
    reviewPolicies: 'الخطوة 1 · مراجعة السياسات',
    language: 'اللغة',
    scrollToReview: 'مرر لقراءة السياسة بالكامل',
    scrollForMe: 'مرر بدلا مني',
    tapToScroll: 'اضغط للتمرير',
    continueToPayment: 'المتابعة إلى وسائل الدفع',
    paymentMethods: 'وسائل الدفع',
    paymentSubtitle: 'اختر وسيلة لعرض تفاصيل الدفع بلغتك المفضلة.',
    backToPolicies: 'العودة إلى السياسات',
    paymentAvailable: 'تعليمات الدفع متاحة بلغتك المفضلة.',
    warranty: 'الضمان',
    reviewTime: 'مدة المراجعة',
    warrantyText: 'يبقى الضمان ساريا ما دام العميل يستخدم الحساب بشكل صحيح وبدون مخالفات للسياسات.',
    reviewTimeText: 'قد تستغرق عملية التحقق من 24 ساعة إلى 7 أيام حسب قرار المنصة.',
    nextSteps: 'الخطوات التالية',
    nextStepsText: 'بعد الدفع يرجى التواصل مع الدعم لتأكيد العملية.',
    contactSupport: 'التواصل مع الدعم',
    accountDetails: 'تفاصيل الحساب',
    extraFields: 'تفاصيل إضافية',
    noCategories: 'لا توجد فئات سياسات مفعلة حاليا.',
    noPaymentMethods: 'لا توجد وسائل دفع مفعلة حاليا.',
  },
}

export const DEFAULT_POLICY_LANGUAGE = 'en'

export function isRTL(language) {
  return language === 'ar'
}

export function getLanguageLabel(language) {
  return {
    en: 'English',
    fr: 'Français',
    ar: 'العربية',
  }[language] || language
}

export function policyText(language, key) {
  return POLICY_UI[language]?.[key] || POLICY_UI.en[key] || key
}

const POLICY_LOGOS = {
  'agency-accounts': '/assets/meta.png',
  'verified-accounts': '/assets/google.webp',
  'verification-service': '/assets/tiktok.png',
  'other-services': '/assets/snapchat.png',
}

export function getPolicyLogoBySlug(slug = '') {
  return POLICY_LOGOS[String(slug || '').trim().toLowerCase()] || ''
}

const FALLBACK_POLICIES = [
  {
    id: 'fallback-agency-accounts',
    slug: 'agency-accounts',
    name: 'Agency Accounts',
    description: 'Policies for agency account activation, access assignment, spend unlocks, and top-up handling.',
    logo: '/assets/meta.png',
    logo_scale: 1,
    display_order: 1,
    active: true,
    translations: {
      en: {
        language: 'en',
        title: 'Agency Accounts Policy',
        short_description: 'Account access, activation, spending limits, and violation handling.',
        active: true,
        content_html: `
          <section><h3>SERVICE DESCRIPTION</h3><p>We do not deliver login credentials. The client provides their own account access. We activate the ad account, open spending, increase limits, assign access, or provide agency-level support.</p></section>
          <section><h3>SERVICE COMPLETION</h3><p>The service is considered delivered once access is successfully assigned or the account is activated.</p></section>
          <section><h3>POLICY VIOLATION CASES</h3><p>If the client runs ads that violate platform rules and the account gets restricted:</p><ul><li>For Facebook and Google: we either replace the access or refund the remaining balance minus a 6% processing fee.</li><li>For TikTok Agency: we provide the AdverSolutions Chrome extension, the client remains fully responsible for their balance, and no balance transfer or refund applies.</li></ul></section>
          <section><h3>WARRANTY</h3><p>Warranty remains valid as long as the client uses the account properly and without policy violations.</p></section>
        `,
      },
      fr: {
        language: 'fr',
        title: 'Politique des comptes agence',
        short_description: "Accès au compte, activation, plafonds de dépense et gestion des violations.",
        active: true,
        content_html: `
          <section><h3>DESCRIPTION DU SERVICE</h3><p>Nous ne livrons pas les identifiants de connexion. Le client fournit son propre accès au compte. Nous activons le compte publicitaire, ouvrons les dépenses, augmentons les limites, attribuons les accès ou apportons un support de niveau agence.</p></section>
          <section><h3>FIN DU SERVICE</h3><p>Le service est considéré comme livré dès que l'accès est attribué avec succès ou que le compte est activé.</p></section>
          <section><h3>CAS DE VIOLATION DES POLITIQUES</h3><p>Si le client diffuse des publicités contraires aux règles de la plateforme et que le compte est restreint :</p><ul><li>Pour Facebook et Google : nous remplaçons l'accès ou remboursons le solde restant moins 6 % de frais de traitement.</li><li>Pour TikTok Agency : nous fournissons l'extension Chrome AdverSolutions, le client reste entièrement responsable de son solde, et aucun transfert ou remboursement n'est applicable.</li></ul></section>
          <section><h3>GARANTIE</h3><p>La garantie reste valable tant que le client utilise le compte correctement et sans violation des politiques.</p></section>
        `,
      },
      ar: {
        language: 'ar',
        title: 'سياسة حسابات الوكالة',
        short_description: 'الوصول إلى الحساب وتفعيله وحدود الإنفاق ومعالجة المخالفات.',
        active: true,
        content_html: `
          <section><h3>وصف الخدمة</h3><p>نحن لا نسلم بيانات تسجيل الدخول. يقوم العميل بتوفير الوصول إلى حسابه الخاص. نحن نقوم بتفعيل الحساب الإعلاني وفتح الإنفاق وزيادة الحدود وتعيين الصلاحيات أو تقديم دعم بمستوى الوكالة.</p></section>
          <section><h3>اكتمال الخدمة</h3><p>تعتبر الخدمة مكتملة بمجرد تعيين الوصول بنجاح أو تفعيل الحساب.</p></section>
          <section><h3>حالات مخالفة السياسات</h3><p>إذا قام العميل بتشغيل إعلانات تخالف قواعد المنصة وتم تقييد الحساب:</p><ul><li>بالنسبة إلى فيسبوك وجوجل: نقوم إما باستبدال الوصول أو برد الرصيد المتبقي بعد خصم 6٪ رسوم معالجة.</li><li>بالنسبة إلى TikTok Agency: نوفر إضافة AdverSolutions Chrome، ويظل العميل مسؤولا بالكامل عن رصيده، ولا ينطبق أي نقل أو استرداد للرصيد.</li></ul></section>
          <section><h3>الضمان</h3><p>يبقى الضمان ساريا طالما استخدم العميل الحساب بشكل صحيح وبدون مخالفات للسياسات.</p></section>
        `,
      },
    },
  },
  {
    id: 'fallback-verified-accounts',
    slug: 'verified-accounts',
    name: 'Verified Accounts',
    description: 'Delivery, first-login warranty, verification support, and misuse exclusions for verified accounts.',
    logo: '/assets/google.webp',
    logo_scale: 1,
    display_order: 2,
    active: true,
    translations: {
      en: {
        language: 'en',
        title: 'Verified Accounts Policy',
        short_description: 'Delivery contents, first-login coverage, and replacement rules.',
        active: true,
        content_html: `
          <section><h3>WHAT IS DELIVERED</h3><p>A zip folder containing login.txt, cookies.txt, and the transferred account inside the client AdsPower workspace.</p></section>
          <section><h3>SERVICE COMPLETION</h3><p>The service is considered completed after the first successful login.</p></section>
          <section><h3>WARRANTY RULES</h3><ul><li>If login does not work on the first attempt, the account is replaced immediately.</li><li>If the account gets banned due to policy violations, fake documents, wrong business information, illegal ads, or changes made by the client, the warranty becomes void.</li><li>If the account gets randomly suspended and not due to client misuse, a replacement is provided.</li></ul></section>
          <section><h3>VERIFICATION HANDLING</h3><p>If the platform requests verification, we handle it as long as the client does not attempt any verification independently or use an external service.</p></section>
        `,
      },
      fr: {
        language: 'fr',
        title: 'Politique des comptes vérifiés',
        short_description: 'Contenu livré, garantie à la première connexion et règles de remplacement.',
        active: true,
        content_html: `
          <section><h3>CE QUI EST LIVRÉ</h3><p>Un dossier zip contenant login.txt, cookies.txt, et le compte transféré dans l'espace AdsPower du client.</p></section>
          <section><h3>FIN DU SERVICE</h3><p>Le service est considéré comme terminé après la première connexion réussie.</p></section>
          <section><h3>RÈGLES DE GARANTIE</h3><ul><li>Si la connexion échoue à la première tentative, le compte est remplacé immédiatement.</li><li>Si le compte est banni à cause d'une violation des politiques, de faux documents, de mauvaises informations d'entreprise, de publicités illégales ou de modifications du client, la garantie devient nulle.</li><li>Si le compte est suspendu aléatoirement sans mauvaise utilisation du client, un remplacement est fourni.</li></ul></section>
          <section><h3>GESTION DE LA VÉRIFICATION</h3><p>Si la plateforme demande une vérification, nous la gérons tant que le client n'essaie pas de vérifier lui-même et n'utilise pas un service externe.</p></section>
        `,
      },
      ar: {
        language: 'ar',
        title: 'سياسة الحسابات الموثقة',
        short_description: 'محتويات التسليم وضمان أول تسجيل دخول وقواعد الاستبدال.',
        active: true,
        content_html: `
          <section><h3>ما الذي يتم تسليمه</h3><p>ملف مضغوط يحتوي على login.txt و cookies.txt ويتم نقل الحساب داخل مساحة AdsPower الخاصة بالعميل.</p></section>
          <section><h3>اكتمال الخدمة</h3><p>تعتبر الخدمة مكتملة بعد أول تسجيل دخول ناجح.</p></section>
          <section><h3>قواعد الضمان</h3><ul><li>إذا لم يعمل تسجيل الدخول في أول محاولة يتم الاستبدال فورا.</li><li>إذا تم حظر الحساب بسبب مخالفة السياسات أو وثائق مزيفة أو معلومات تجارية خاطئة أو إعلانات غير قانونية أو تعديلات قام بها العميل فإن الضمان يصبح لاغيا.</li><li>إذا تم تعليق الحساب بشكل عشوائي وليس بسبب سوء استخدام العميل، يتم توفير بديل.</li></ul></section>
          <section><h3>إدارة التحقق</h3><p>إذا طلبت المنصة التحقق فنحن نتولى ذلك ما دام العميل لا يحاول التحقق بنفسه ولا يستخدم خدمة خارجية.</p></section>
        `,
      },
    },
  },
  {
    id: 'fallback-verification-service',
    slug: 'verification-service',
    name: 'Verification Service',
    description: 'Manual KYC and business verification support with refund rules and review-time expectations.',
    logo: '/assets/tiktok.png',
    logo_scale: 1,
    display_order: 3,
    active: true,
    translations: {
      en: {
        language: 'en',
        title: 'Verification Service Policy',
        short_description: 'KYC, document verification, refunds, and review timelines.',
        active: true,
        content_html: `
          <section><h3>WHAT WE DO</h3><p>We perform KYC verification, ID document submission, video selfie handling, business verification, and document uploading. Success rate varies between 70% and 90% depending on the platform.</p></section>
          <section><h3>REFUND GUARANTEE</h3><p>If verification fails while valid documents were used, the client receives a 100% refund.</p></section>
          <section><h3>NO REFUND IF</h3><ul><li>The client submits fake documents.</li><li>The client uses an invalid identity.</li><li>The client sends modified papers.</li><li>The client submits documents externally.</li></ul></section>
          <section><h3>REVIEW TIME</h3><p>Verification can take 24 hours to 7 days depending on the platform decision.</p></section>
        `,
      },
      fr: {
        language: 'fr',
        title: 'Politique du service de vérification',
        short_description: 'KYC, vérification de documents, remboursements et délais.',
        active: true,
        content_html: `
          <section><h3>CE QUE NOUS FAISONS</h3><p>Nous réalisons la vérification KYC, l'envoi des documents d'identité, la vidéo selfie, la vérification d'entreprise et le téléversement de documents. Le taux de réussite varie entre 70 % et 90 % selon la plateforme.</p></section>
          <section><h3>GARANTIE DE REMBOURSEMENT</h3><p>Si la vérification échoue avec des documents valides, le client reçoit un remboursement intégral.</p></section>
          <section><h3>PAS DE REMBOURSEMENT SI</h3><ul><li>Le client fournit de faux documents.</li><li>Le client utilise une identité invalide.</li><li>Le client envoie des documents modifiés.</li><li>Le client soumet les documents en externe.</li></ul></section>
          <section><h3>DÉLAI DE RÉVISION</h3><p>La vérification peut prendre de 24 heures à 7 jours selon la décision de la plateforme.</p></section>
        `,
      },
      ar: {
        language: 'ar',
        title: 'سياسة خدمة التحقق',
        short_description: 'التحقق من الهوية والوثائق والاسترداد والزمن المتوقع للمراجعة.',
        active: true,
        content_html: `
          <section><h3>ما الذي نقوم به</h3><p>نقوم بإنجاز التحقق من الهوية KYC وإرسال وثائق الهوية ومعالجة فيديو السيلفي والتحقق التجاري ورفع المستندات. تختلف نسبة النجاح بين 70٪ و90٪ حسب المنصة.</p></section>
          <section><h3>ضمان الاسترداد</h3><p>إذا فشل التحقق مع استخدام وثائق صحيحة يحصل العميل على استرداد كامل بنسبة 100٪.</p></section>
          <section><h3>لا يوجد استرداد إذا</h3><ul><li>قدم العميل وثائق مزيفة.</li><li>استخدم العميل هوية غير صالحة.</li><li>أرسل العميل أوراقا معدلة.</li><li>قدم العميل الوثائق خارجيا.</li></ul></section>
          <section><h3>مدة المراجعة</h3><p>قد تستغرق عملية التحقق من 24 ساعة إلى 7 أيام حسب قرار المنصة.</p></section>
        `,
      },
    },
  },
  {
    id: 'fallback-other-services',
    slug: 'other-services',
    name: 'Other Services',
    description: 'Policies for scripts, cloaking, payment services, temporary accounts, and miscellaneous delivery-based services.',
    logo: '/assets/snapchat.png',
    logo_scale: 1,
    display_order: 4,
    active: true,
    translations: {
      en: {
        language: 'en',
        title: 'Other Services Policy',
        short_description: 'Delivery-based services, refund exclusions, and replacement conditions.',
        active: true,
        content_html: `
          <section><h3>SERVICES INCLUDED</h3><p>This category includes Facebook scripts and tools, cloaking service, verified bank accounts, payment gateways, WhatsApp API, temporary accounts, and miscellaneous services.</p></section>
          <section><h3>SERVICE COMPLETION</h3><p>Once access, files, credentials, or activation is delivered, the service is completed.</p></section>
          <section><h3>NO REFUND</h3><p>After delivery, refunds are not applicable.</p></section>
          <section><h3>REPLACEMENT ONLY IF</h3><ul><li>The access provided is wrong.</li><li>The file is corrupted.</li><li>The service was not delivered properly.</li></ul></section>
          <section><h3>CLIENT RESPONSIBILITY</h3><p>Any ban, closure, policy restriction, or compliance failure caused by user usage is not covered by us.</p></section>
        `,
      },
      fr: {
        language: 'fr',
        title: 'Politique des autres services',
        short_description: 'Services livrés, exclusions de remboursement et conditions de remplacement.',
        active: true,
        content_html: `
          <section><h3>SERVICES INCLUS</h3><p>Cette catégorie comprend les scripts et outils Facebook, le cloaking, les comptes bancaires vérifiés, les passerelles de paiement, l'API WhatsApp, les comptes temporaires et d'autres services.</p></section>
          <section><h3>FIN DU SERVICE</h3><p>Dès que l'accès, les fichiers, les identifiants ou l'activation sont livrés, le service est terminé.</p></section>
          <section><h3>PAS DE REMBOURSEMENT</h3><p>Après la livraison, aucun remboursement n'est applicable.</p></section>
          <section><h3>REMPLACEMENT UNIQUEMENT SI</h3><ul><li>L'accès fourni est incorrect.</li><li>Le fichier est corrompu.</li><li>Le service n'a pas été livré correctement.</li></ul></section>
          <section><h3>RESPONSABILITÉ DU CLIENT</h3><p>Toute suspension, fermeture, restriction de politique ou échec de conformité causé par l'utilisation du client n'est pas couvert par nous.</p></section>
        `,
      },
      ar: {
        language: 'ar',
        title: 'سياسة الخدمات الأخرى',
        short_description: 'الخدمات القائمة على التسليم والاستثناءات من الاسترداد وشروط الاستبدال.',
        active: true,
        content_html: `
          <section><h3>الخدمات المشمولة</h3><p>تشمل هذه الفئة أدوات وسكريبتات فيسبوك وخدمة الكلواكينغ والحسابات البنكية الموثقة وبوابات الدفع وواجهة WhatsApp API والحسابات المؤقتة وخدمات أخرى متنوعة.</p></section>
          <section><h3>اكتمال الخدمة</h3><p>بمجرد تسليم الوصول أو الملفات أو بيانات الاعتماد أو التفعيل تعتبر الخدمة مكتملة.</p></section>
          <section><h3>لا يوجد استرداد</h3><p>بعد التسليم لا ينطبق أي استرداد.</p></section>
          <section><h3>الاستبدال فقط إذا</h3><ul><li>كان الوصول المقدم خاطئا.</li><li>كان الملف تالفا.</li><li>لم يتم تسليم الخدمة بالشكل الصحيح.</li></ul></section>
          <section><h3>مسؤولية العميل</h3><p>أي حظر أو إغلاق أو تقييد سياسات أو فشل امتثال ناتج عن استخدام العميل لا يكون مغطى من طرفنا.</p></section>
        `,
      },
    },
  },
]

export function getFallbackPolicyCategories() {
  return FALLBACK_POLICIES.map(category => ({
    ...category,
    logo: category.logo || getPolicyLogoBySlug(category.slug),
    logo_scale: Number(category.logo_scale) || 1,
  }))
}

export function emptyTranslation(language) {
  return {
    language,
    title: '',
    short_description: '',
    content_html: '',
    active: true,
  }
}

export function mergeWithFallbackPolicies(categories = []) {
  const fallback = getFallbackPolicyCategories()
  const fallbackSlugs = new Set(fallback.map(category => String(category.slug || '').trim().toLowerCase()))
  const bySlug = new Map(
    categories.map(category => [
      String(category.slug || '').trim().toLowerCase(),
      {
        ...category,
        logo: category.logo ?? null,
        logo_scale: Number(category.logo_scale) || 1,
      },
    ]),
  )

  const merged = fallback.map(category => {
    const saved = bySlug.get(String(category.slug || '').trim().toLowerCase())
    if (!saved) return category
    // Use saved.logo if it was explicitly set (even to '') — only fall back when null/undefined
    const logo = saved.logo != null ? saved.logo : (category.logo ?? getPolicyLogoBySlug(saved.slug || category.slug))
    return {
      ...category,
      ...saved,
      logo,
      logo_scale: Number(saved.logo_scale) || Number(category.logo_scale) || 1,
      translations: {
        ...category.translations,
        ...(saved.translations || {}),
      },
    }
  })

  for (const category of categories) {
    const slug = String(category.slug || '').trim().toLowerCase()
    if (!fallbackSlugs.has(slug)) {
      merged.push({
        ...category,
        logo: category.logo != null ? category.logo : getPolicyLogoBySlug(category.slug),
        logo_scale: Number(category.logo_scale) || 1,
      })
    }
  }

  return merged.sort((a, b) => {
    if ((a.display_order || 0) !== (b.display_order || 0)) return (a.display_order || 0) - (b.display_order || 0)
    return String(a.name || '').localeCompare(String(b.name || ''))
  })
}
