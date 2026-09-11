(function () {
  const STORAGE_KEY = 'smartProcureAdminLanguage';
  const supported = ['en', 'te'];
  const extra = {
    'Analytics': 'విశ్లేషణలు', 'Admin profile': 'అడ్మిన్ ప్రొఫైల్', 'unread notifications': 'చదవని నోటిఫికేషన్‌లు', 'THURSDAY, 10 SEPTEMBER 2026': 'గురువారం, 10 సెప్టెంబర్ 2026', 'Ravi Kumar booking created': 'రవి కుమార్ బుకింగ్ సృష్టించబడింది', 'Rice · Vijayawada Center · 10:00 AM': 'బియ్యం · విజయవాడ కేంద్రం · 10:00 AM', 'Sita Devi procurement completed': 'సీతా దేవి కొనుగోలు పూర్తయింది', 'Wheat · 300 kg · Center B': 'గోధుమ · 300 కిలోలు · కేంద్రం B', 'New slot request received': 'కొత్త స్లాట్ అభ్యర్థన అందింది', 'Anita Singh · Maize · Center C': 'అనితా సింగ్ · మొక్కజొన్న · కేంద్రం C', '126 total': 'మొత్తం 126', '18 requests': '18 అభ్యర్థనలు', '542 procurements': '542 కొనుగోళ్లు', '48 slots': '48 స్లాట్‌లు', 'total': 'మొత్తం', 'Pending approval': 'ఆమోదం కోసం వేచి ఉంది', 'requests': 'అభ్యర్థనలు', 'procurements': 'కొనుగోళ్లు', 'Available slots': 'అందుబాటులో ఉన్న స్లాట్‌లు', 'slots': 'స్లాట్‌లు',
    '₹': '₹', '◷': '◷', '📅': '📅', '💰': '💰', 'Centers': 'కేంద్రాలు', 'SmartProcure control center': 'SmartProcure నియంత్రణ కేంద్రం', 'Admin navigation': 'అడ్మిన్ నావిగేషన్', 'Admin dashboard navigation': 'అడ్మిన్ డ్యాష్‌బోర్డ్ నావిగేషన్', 'Admin profile': 'అడ్మిన్ ప్రొఫైల్', 'System overview': 'సిస్టమ్ అవలోకనం', 'Procurement overview': 'కొనుగోలు అవలోకనం', 'Quick management': 'త్వరిత నిర్వహణ', 'Close details': 'వివరాలు మూసివేయండి', 'More analytics': 'మరిన్ని విశ్లేషణలు', 'Registered in the system': 'సిస్టమ్‌లో రిజిస్టర్ చేసినవి', 'Total Procurement Bookings': 'మొత్తం కొనుగోలు బుకింగ్‌లు', 'All scheduled bookings': 'అన్ని షెడ్యూల్ చేసిన బుకింగ్‌లు', 'Pending Bookings': 'పెండింగ్ బుకింగ్‌లు', 'Awaiting approval': 'ఆమోదం కోసం వేచి ఉంది', 'Completed Procurements': 'పూర్తయిన కొనుగోళ్లు', 'Completed this month': 'ఈ నెల పూర్తయినవి', 'Available Procurement Slots': 'అందుబాటులో ఉన్న కొనుగోలు స్లాట్‌లు', 'Across active centers': 'క్రియాశీల కేంద్రాల్లో', 'View All Requests': 'అన్ని అభ్యర్థనలు చూడండి', 'Review farmer accounts and registration activity.': 'రైతు ఖాతాలు మరియు రిజిస్ట్రేషన్ కార్యకలాపాలను పరిశీలించండి.', 'Update locations, operating hours, and availability.': 'ప్రదేశాలు, పని వేళలు మరియు అందుబాటును నవీకరించండి.', 'Control daily capacity and appointment schedules.': 'రోజువారీ సామర్థ్యం మరియు అపాయింట్‌మెంట్ షెడ్యూల్‌లను నియంత్రించండి.', 'Keep procurement progress accurate for farmers.': 'రైతుల కోసం కొనుగోలు పురోగతిని ఖచ్చితంగా ఉంచండి.', 'New farmer registration': 'కొత్త రైతు రిజిస్ట్రేషన్', 'New procurement request': 'కొత్త కొనుగోలు అభ్యర్థన', 'Slot confirmed': 'స్లాట్ నిర్ధారించబడింది', 'Center availability updated': 'కేంద్ర అందుబాటు నవీకరించబడింది', 'View Farmers': 'రైతులను చూడండి', 'Update Status': 'స్థితిని నవీకరించండి'
  };

  function language() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return supported.includes(stored) ? stored : 'en';
  }

  function translate(value) {
    const dictionary = window.adminTranslations?.[language()] || {};
    return dictionary[value] || (language() === 'te' ? extra[value] || value : value);
  }

  function phraseMap() {
    const en = window.adminTranslations?.en || {};
    const te = window.adminTranslations?.te || {};
    const map = new Map();
    Object.keys(en).forEach((key) => map.set(language() === 'te' ? en[key] : te[key], language() === 'te' ? te[key] : en[key]));
    Object.keys(extra).forEach((key) => map.set(language() === 'te' ? key : extra[key], language() === 'te' ? extra[key] : key));
    return map;
  }

  function translateText() {
    const map = phraseMap();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach((textNode) => {
      if (!textNode.nodeValue.trim() || textNode.parentElement?.closest('script,style,.admin-language-switcher')) return;
      const value = textNode.nodeValue.trim();
      if (!map.has(value)) return;
      textNode.nodeValue = textNode.nodeValue.replace(value, map.get(value));
    });
  }

  function updateAttributes() {
    const attributes = {
      '#admin-username': ['placeholder', 'Enter admin email'],
      '#admin-password': ['placeholder', 'Enter admin password'],
      '#admin-name': ['placeholder', 'Enter admin name'],
      '#admin-email': ['placeholder', 'Enter admin email'],
      '#admin-register-password': ['placeholder', 'At least 6 characters'],
      '#admin-confirm-password': ['placeholder', 'Confirm your password'],
      '#admin-registration-code': ['placeholder', 'Enter authorization code']
    };
    Object.entries(attributes).forEach(([selector, [attribute, source]]) => {
      const element = document.querySelector(selector);
      if (element) element.setAttribute(attribute, translate(source));
    });
    document.querySelectorAll('.admin-profile-button').forEach((element) => element.setAttribute('aria-label', translate('Admin profile')));
    document.querySelectorAll('.notification-badge').forEach((element) => {
      const count = element.textContent.trim();
      element.setAttribute('aria-label', `${count} ${translate('unread notifications')}`);
    });
    document.documentElement.lang = language();
  }

  function buildSwitcher() {
    const host = document.querySelector('.admin-welcome, .admin-login-card');
    if (!host || document.querySelector('.admin-language-switcher')) return;
    const switcher = document.createElement('div');
    switcher.className = 'admin-language-switcher';
    switcher.setAttribute('aria-label', 'Admin language selection');
    switcher.innerHTML = '<button type="button" data-admin-language="en">English</button><span>|</span><button type="button" data-admin-language="te">తెలుగు</button>';
    switcher.querySelectorAll('[data-admin-language]').forEach((button) => button.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, button.dataset.adminLanguage);
      apply();
    }));
    host.appendChild(switcher);
  }

  function updateSwitcher() {
    document.querySelectorAll('[data-admin-language]').forEach((button) => {
      const active = button.dataset.adminLanguage === language();
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function apply() {
    buildSwitcher();
    translateText();
    updateAttributes();
    updateSwitcher();
  }

  apply();
  const observer = new MutationObserver(() => {
    clearTimeout(observer.timer);
    observer.timer = setTimeout(apply, 0);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
