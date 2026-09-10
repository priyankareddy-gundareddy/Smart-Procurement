(function () {
  const STORAGE_KEY = 'smartProcureFarmerLanguage';
  const supportedLanguages = ['te', 'en'];
  const extraPhrases = {
    'Smart Procurement for Every Farmer': ['ప్రతి రైతు కోసం స్మార్ట్ కొనుగోలు', 'Smart Procurement for Every Farmer'],
    'Welcome,': ['స్వాగతం,', 'Welcome,'],
    'Manage your procurement, bookings, and center visits from one place.': ['మీ కొనుగోలు, బుకింగ్‌లు మరియు కేంద్ర సందర్శనలను ఒకే చోట నిర్వహించండి.', 'Manage your procurement, bookings, and center visits from one place.'],
    'Start with a': ['ప్రారంభించండి', 'Start with a'],
    'smarter visit.': ['మెరుగైన సందర్శనతో.', 'smarter visit.'],
    'Create Your': ['మీ', 'Create Your'],
    'Farmer Account': ['రైతు ఖాతాను సృష్టించండి', 'Farmer Account'],
    'Choose a state first': ['ముందుగా రాష్ట్రాన్ని ఎంచుకోండి', 'Choose a state first'],
    'Select a state first': ['ముందుగా రాష్ట్రాన్ని ఎంచుకోండి', 'Select a state first'],
    'Available': ['అందుబాటులో ఉంది', 'Available'],
    'Full': ['నిండింది', 'Full'],
    'Today': ['ఈ రోజు', 'Today'],
    'Confirmed': ['నిర్ధారించబడింది', 'Confirmed'],
    'No bookings yet': ['ఇంకా బుకింగ్‌లు లేవు', 'No bookings yet'],
    'Your confirmed procurement slots will appear here.': ['మీ నిర్ధారించిన కొనుగోలు స్లాట్‌లు ఇక్కడ కనిపిస్తాయి.', 'Your confirmed procurement slots will appear here.'],
    "Today's Procurement": ['ఈ రోజు కొనుగోలు', "Today's Procurement"],
    'Choose from nearby options': ['సమీపంలోని ఎంపికల నుండి ఎంచుకోండి', 'Choose from nearby options'],
    'Available Slots:': ['అందుబాటులో ఉన్న స్లాట్‌లు:', 'Available Slots:'],
    'Open listings': ['అందుబాటులో ఉన్న జాబితాలు', 'Open listings'],
    'Find procurement centers near your location.': ['మీ ప్రాంతానికి సమీపంలోని కొనుగోలు కేంద్రాలను కనుగొనండి.', 'Find procurement centers near your location.'],
    'View your upcoming and previous slot bookings.': ['మీ రాబోయే మరియు గత స్లాట్ బుకింగ్‌లను చూడండి.', 'View your upcoming and previous slot bookings.'],
    'Track your procurement history and completed transactions.': ['మీ కొనుగోలు చరిత్ర మరియు పూర్తయిన లావాదేవీలను ట్రాక్ చేయండి.', 'Track your procurement history and completed transactions.'],
    'Your journey': ['మీ ప్రయాణం', 'Your journey'],
    '3 of 4 complete': ['4లో 3 పూర్తయ్యాయి', '3 of 4 complete'],
    'Request Submitted': ['అభ్యర్థన పంపబడింది', 'Request Submitted'],
    'Slot Allocated': ['స్లాట్ కేటాయించబడింది', 'Slot Allocated'],
    'Arrived at Center': ['కేంద్రానికి చేరుకున్నారు', 'Arrived at Center'],
    'Procurement Completed': ['కొనుగోలు పూర్తయింది', 'Procurement Completed'],
    'Completed': ['పూర్తయింది', 'Completed'],
    'Pending': ['పెండింగ్', 'Pending'],
    'Rice': ['బియ్యం', 'Rice'],
    'Wheat': ['గోధుమ', 'Wheat'],
    'Maize': ['మొక్కజొన్న', 'Maize'],
    'Cotton': ['పత్తి', 'Cotton'],
    'Other': ['ఇతర', 'Other'],
    '← Back to Dashboard': ['← డ్యాష్‌బోర్డ్‌కు వెనుకకు', '← Back to Dashboard']
    , 'Center': ['కేంద్రం', 'Center']
    , 'Not selected': ['ఎంచుకోలేదు', 'Not selected']
    , 'Farmer access': ['రైతు యాక్సెస్', 'Farmer access']
    , 'Login and registration will connect to the farmer authentication flow in the next step. This is a demo entry point for now.': ['లాగిన్ మరియు రిజిస్ట్రేషన్ ద్వారా రైతు ధృవీకరణను ఉపయోగించవచ్చు. ఇది ప్రస్తుతానికి డెమో ప్రవేశం మాత్రమే.', 'Login and registration will connect to the farmer authentication flow in the next step. This is a demo entry point for now.']
    , 'Farmer bookings': ['రైతు బుకింగ్‌లు', 'Farmer bookings']
    , 'Booking History': ['బుకింగ్ చరిత్ర', 'Booking History']
    , 'Review your current and upcoming procurement slot bookings.': ['మీ ప్రస్తుత మరియు రాబోయే కొనుగోలు స్లాట్ బుకింగ్‌లను పరిశీలించండి.', 'Review your current and upcoming procurement slot bookings.']
    , 'New Booking': ['కొత్త బుకింగ్', 'New Booking']
    , '+ New Booking': ['+ కొత్త బుకింగ్', '+ New Booking']
    , 'Your booked procurement slots will appear here after confirmation.': ['నిర్ధారణ తర్వాత మీ బుక్ చేసిన కొనుగోలు స్లాట్‌లు ఇక్కడ కనిపిస్తాయి.', 'Your booked procurement slots will appear here after confirmation.']
    , 'Waiting time': ['వేచి ఉండే సమయం', 'Waiting time']
    , 'Operating hours': ['పని వేళలు', 'Operating hours']
    , 'Please select a crop, quantity, center, date, and time slot before continuing.': ['కొనసాగించే ముందు పంట, పరిమాణం, కేంద్రం, తేదీ మరియు సమయ స్లాట్‌ను ఎంచుకోండి.', 'Please select a crop, quantity, center, date, and time slot before continuing.']
    , "Built for India's farming communities": ['భారతదేశ రైతు సమాజాల కోసం రూపొందించబడింది', "Built for India's farming communities"]
    , 'Smart Procurement': ['స్మార్ట్ కొనుగోలు', 'Smart Procurement']
    , 'for Every Farmer': ['ప్రతి రైతు కోసం', 'for Every Farmer']
    , 'Find nearby procurement centers, check availability, reduce waiting time, and track your procurement status — all in one place.': ['సమీపంలోని కొనుగోలు కేంద్రాలను కనుగొని, అందుబాటును చూసి, వేచి ఉండే సమయాన్ని తగ్గించి, మీ కొనుగోలు స్థితిని ఒకే చోట ట్రాక్ చేయండి.', 'Find nearby procurement centers, check availability, reduce waiting time, and track your procurement status — all in one place.']
    , 'Get Started': ['ప్రారంభించండి', 'Get Started']
    , '▶ Explore How It Works': ['▶ ఇది ఎలా పనిచేస్తుందో చూడండి', '▶ Explore How It Works']
    , 'Explore How It Works': ['ఇది ఎలా పనిచేస్తుందో చూడండి', 'Explore How It Works']
    , 'Less Waiting • Better Planning • Transparent Procurement': ['తక్కువ వేచి ఉండటం • మెరుగైన ప్రణాళిక • పారదర్శక కొనుగోలు', 'Less Waiting • Better Planning • Transparent Procurement']
    , 'Farm': ['పొలం', 'Farm']
    , 'Token': ['టోకెన్', 'Token']
    , 'Center availability': ['కేంద్రం అందుబాటు', 'Center availability']
    , '4 centers open nearby': ['సమీపంలో 4 కేంద్రాలు తెరిచి ఉన్నాయి', '4 centers open nearby']
    , 'Next slot': ['తదుపరి స్లాట్', 'Next slot']
    , 'Today · 10:30 AM': ['ఈ రోజు · 10:30 AM', 'Today · 10:30 AM']
    , 'One platform, every step': ['ప్రతి దశకు ఒకే వేదిక', 'One platform, every step']
    , 'Everything a farmer needs': ['రైతుకు కావాల్సిన ప్రతిదీ', 'Everything a farmer needs']
    , 'Simple tools to help farmers plan their procurement visit with clarity and confidence.': ['రైతులు తమ కొనుగోలు సందర్శనను స్పష్టతతో మరియు నమ్మకంతో ప్లాన్ చేసుకునేందుకు సరళమైన సాధనాలు.', 'Simple tools to help farmers plan their procurement visit with clarity and confidence.']
    , 'Discover nearby centers and view their distance, status, timings, and availability.': ['సమీప కేంద్రాలను కనుగొని వాటి దూరం, స్థితి, సమయాలు మరియు అందుబాటును చూడండి.', 'Discover nearby centers and view their distance, status, timings, and availability.']
    , 'Explore centers →': ['కేంద్రాలను చూడండి →', 'Explore centers →']
    , 'Procurement Schedule': ['కొనుగోలు షెడ్యూల్', 'Procurement Schedule']
    , 'View upcoming procurement dates, crop-wise schedules, and center timings.': ['రాబోయే కొనుగోలు తేదీలు, పంటల వారీ షెడ్యూల్‌లు మరియు కేంద్ర సమయాలను చూడండి.', 'View upcoming procurement dates, crop-wise schedules, and center timings.']
    , 'View schedule →': ['షెడ్యూల్ చూడండి →', 'View schedule →']
    , 'Token / Slot Booking': ['టోకెన్ / స్లాట్ బుకింగ్', 'Token / Slot Booking']
    , 'Reserve a procurement slot and reduce unnecessary waiting at the center.': ['కొనుగోలు స్లాట్‌ను రిజర్వ్ చేసి కేంద్రంలో అనవసరమైన వేచి ఉండటాన్ని తగ్గించండి.', 'Reserve a procurement slot and reduce unnecessary waiting at the center.']
    , 'See token flow →': ['టోకెన్ విధానం చూడండి →', 'See token flow →']
    , 'Track your procurement journey from registration to completion with clear updates.': ['రిజిస్ట్రేషన్ నుండి పూర్తయ్యే వరకు మీ కొనుగోలు ప్రయాణాన్ని స్పష్టమైన అప్‌డేట్‌లతో ట్రాక్ చేయండి.', 'Track your procurement journey from registration to completion with clear updates.']
    , 'View status flow →': ['స్థితి విధానం చూడండి →', 'View status flow →']
    , 'Smart Notifications': ['స్మార్ట్ నోటిఫికేషన్‌లు', 'Smart Notifications']
    , 'Receive timely alerts about tokens, schedule changes, availability, and updates.': ['టోకెన్‌లు, షెడ్యూల్ మార్పులు, అందుబాటు మరియు అప్‌డేట్‌ల గురించి సమయానుకూల హెచ్చరికలు పొందండి.', 'Receive timely alerts about tokens, schedule changes, availability, and updates.']
    , 'Stay informed →': ['సమాచారం పొందండి →', 'Stay informed →']
    , 'Smart Recommendations': ['స్మార్ట్ సిఫార్సులు', 'Smart Recommendations']
    , 'Get intelligent suggestions for suitable centers and convenient procurement times.': ['సరైన కేంద్రాలు మరియు అనుకూలమైన కొనుగోలు సమయాల కోసం తెలివైన సూచనలు పొందండి.', 'Get intelligent suggestions for suitable centers and convenient procurement times.']
    , 'See intelligence →': ['సూచనలు చూడండి →', 'See intelligence →']
    , 'Nearby procurement centers': ['సమీపంలోని కొనుగోలు కేంద్రాలు', 'Nearby procurement centers']
    , 'Find nearby procurement centers, check availability, and book your slot.': ['సమీప కేంద్రాలను కనుగొని, అందుబాటును చూసి, మీ స్లాట్ బుక్ చేయండి.', 'Find nearby procurement centers, check availability, and book your slot.']
    , 'Procurement schedule': ['కొనుగోలు షెడ్యూల్', 'Procurement schedule']
    , 'Token and slot booking': ['టోకెన్ మరియు స్లాట్ బుకింగ్', 'Token and slot booking']
    , 'Procurement status': ['కొనుగోలు స్థితి', 'Procurement status']
    , 'Smart notifications': ['స్మార్ట్ నోటిఫికేషన్‌లు', 'Smart notifications']
    , 'Smart recommendations': ['స్మార్ట్ సిఫార్సులు', 'Smart recommendations']
    , 'Farmer profile': ['రైతు ప్రొఫైల్', 'Farmer profile']
    , 'A clearer path from farm': ['పొలం నుండి స్పష్టమైన మార్గం', 'A clearer path from farm']
    , 'to': ['కు', 'to']
    , 'procurement.': ['కొనుగోలుకు.', 'procurement.']
    , 'Know where you stand,': ['మీ స్థితిని తెలుసుకోండి,', 'Know where you stand,']
    , 'every step of the way.': ['ప్రతి దశలో.', 'every step of the way.']
    , 'Important updates,': ['ముఖ్యమైన అప్‌డేట్‌లు,', 'Important updates,']
    , 'when they matter.': ['అవసరమైనప్పుడు.', 'when they matter.']
    , 'Better choices,': ['మెరుగైన ఎంపికలు,', 'Better choices,']
    , 'less effort.': ['తక్కువ శ్రమతో.', 'less effort.']
    , 'Plan your visit': ['మీ సందర్శనను ప్లాన్ చేయండి', 'Plan your visit']
    , 'with confidence.': ['నమ్మకంతో.', 'with confidence.']
    , 'A future schedule API can provide crop-wise dates, center timings, and available procurement days. Here is the planned frontend experience.': ['భవిష్యత్ షెడ్యూల్ ద్వారా పంటల వారీ తేదీలు, కేంద్ర సమయాలు మరియు అందుబాటులో ఉన్న కొనుగోలు రోజులు లభిస్తాయి. ఇది ప్రణాళిక చేసిన అనుభవం.', 'A future schedule API can provide crop-wise dates, center timings, and available procurement days. Here is the planned frontend experience.']
    , 'Next available date': ['తదుపరి అందుబాటులో ఉన్న తేదీ', 'Next available date']
    , 'Center hours': ['కేంద్ర పని వేళలు', 'Center hours']
    , 'Clear status updates help farmers understand what happens after a request is submitted.': ['అభ్యర్థన పంపిన తర్వాత జరిగే విషయాలను రైతులు అర్థం చేసుకునేందుకు స్పష్టమైన స్థితి అప్‌డేట్‌లు సహాయపడతాయి.', 'Clear status updates help farmers understand what happens after a request is submitted.']
    , 'Example request · Token P-1024': ['ఉదాహరణ అభ్యర్థన · టోకెన్ P-1024', 'Example request · Token P-1024']
    , 'Slot Confirmed': ['స్లాట్ నిర్ధారించబడింది', 'Slot Confirmed']
    , 'Static demo alerts can later be replaced by backend-generated notifications for every farmer.': ['ప్రతి రైతు కోసం డెమో నోటిఫికేషన్‌లను తరువాత బ్యాక్‌ఎండ్ సమాచారం ద్వారా భర్తీ చేయవచ్చు.', 'Static demo alerts can later be replaced by backend-generated notifications for every farmer.']
    , 'Your slot has been confirmed.': ['మీ స్లాట్ నిర్ధారించబడింది.', 'Your slot has been confirmed.']
    , 'Your procurement center has 15 available slots.': ['మీ కొనుగోలు కేంద్రంలో 15 స్లాట్‌లు అందుబాటులో ఉన్నాయి.', 'Your procurement center has 15 available slots.']
    , 'Center operating hours have changed.': ['కేంద్ర పని వేళలు మారాయి.', 'Center operating hours have changed.']
    , 'Yesterday': ['నిన్న', 'Yesterday']
    , 'Recommended for you': ['మీ కోసం సిఫార్సు', 'Recommended for you']
    , '2.4 km away · 20 min estimated wait': ['2.4 కిమీ దూరంలో · అంచనా వేచి ఉండే సమయం 20 నిమిషాలు', '2.4 km away · 20 min estimated wait']
    , 'Best match': ['ఉత్తమ ఎంపిక', 'Best match']
    , 'Your Profile': ['మీ ప్రొఫైల్', 'Your Profile']
    , 'Manage the details connected to your signed-in farmer account.': ['మీ రైతు ఖాతాకు సంబంధించిన వివరాలను నిర్వహించండి.', 'Manage the details connected to your signed-in farmer account.']
    , 'Signed-in farmer account': ['లాగిన్ చేసిన రైతు ఖాతా', 'Signed-in farmer account']
    , 'Choose your': ['మీ', 'Choose your']
    , 'login type.': ['లాగిన్ రకాన్ని ఎంచుకోండి.', 'login type.']
    , 'Select the account type you use to continue.': ['కొనసాగించడానికి మీరు ఉపయోగించే ఖాతా రకాన్ని ఎంచుకోండి.', 'Select the account type you use to continue.']
    , 'Within 5 km': ['5 కిమీ లోపు', 'Within 5 km']
    , 'Within 10 km': ['10 కిమీ లోపు', 'Within 10 km']
    , 'Farmer dashboard · Step 6': ['రైతు డ్యాష్‌బోర్డ్ · దశ 6', 'Farmer dashboard · Step 6']
  };

  function getLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return supportedLanguages.includes(stored) ? stored : 'te';
  }

  function getValue(key, language = getLanguage()) {
    const dictionary = window.farmerTranslations?.[language] || window.farmerTranslations?.te || {};
    return key.split('.').reduce((value, part) => value?.[part], dictionary) ?? key;
  }

  function getCenterName(name, language = getLanguage()) {
    return getValue(`center.names.${name}`, language) === `center.names.${name}` ? name : getValue(`center.names.${name}`, language);
  }

  function setLanguage(language) {
    if (!supportedLanguages.includes(language)) return;
    localStorage.setItem(STORAGE_KEY, language);
    applyTranslations();
    window.dispatchEvent(new CustomEvent('farmer-language-changed', { detail: { language } }));
  }

  function getPhraseMap(language) {
    const otherLanguage = language === 'te' ? 'en' : 'te';
    const map = new Map();
    const add = (source, target) => {
      if (source && target && source !== target) map.set(source, target);
    };
    const walk = (value, otherValue) => {
      if (typeof value === 'string' && typeof otherValue === 'string') add(value, otherValue);
      if (!value || typeof value !== 'object' || !otherValue || typeof otherValue !== 'object') return;
      Object.keys(value).forEach((key) => walk(value[key], otherValue[key]));
    };
    walk(window.farmerTranslations?.[otherLanguage], window.farmerTranslations?.[language]);
    Object.entries(extraPhrases).forEach(([english, translations]) => {
      add(language === 'te' ? english : translations[0], language === 'te' ? translations[0] : english);
    });
    return map;
  }

  function translateTextNodes(root, phraseMap) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach((textNode) => {
      if (!textNode.nodeValue.trim() || textNode.parentElement?.closest('.farmer-language-switcher, .farmer-voice-button, script, style')) return;
      const leading = textNode.nodeValue.match(/^\s*/)?.[0] || '';
      const trailing = textNode.nodeValue.match(/\s*$/)?.[0] || '';
      const content = textNode.nodeValue.trim();
      if (phraseMap.has(content)) textNode.nodeValue = leading + phraseMap.get(content) + trailing;
    });
  }

  function setAttribute(selector, attribute, key) {
    const element = document.querySelector(selector);
    if (element) element.setAttribute(attribute, getValue(key));
  }

  function buildLanguageSwitcher() {
    const dashboardRoute = /#(farmer-dashboard|dashboard-centers|token-detail|status-detail|notifications-detail|profile-detail)/.test(window.location.hash);
    const host = dashboardRoute
      ? document.querySelector('.dashboard-header')
      : document.querySelector('.site-header, .booking-header-inner');
    if (!host) return;
    const existing = document.querySelector('.farmer-language-switcher');
    if (existing) {
      if (existing.parentElement !== host) host.appendChild(existing);
      return;
    }
    const switcher = document.createElement('div');
    switcher.className = 'farmer-language-switcher';
    switcher.setAttribute('aria-label', 'Language selection');
    switcher.innerHTML = '<span aria-hidden="true">🌐</span><button type="button" data-language="te">తెలుగు</button><span aria-hidden="true">|</span><button type="button" data-language="en">English</button>';
    switcher.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.language)));
    host.appendChild(switcher);
  }

  function updateControls() {
    const language = getLanguage();
    document.documentElement.lang = language === 'te' ? 'te' : 'en';
    document.querySelectorAll('.farmer-language-switcher [data-language]').forEach((button) => {
      const selected = button.dataset.language === language;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    setAttribute('#mobile', 'placeholder', 'login.phonePlaceholder');
    setAttribute('#password', 'placeholder', 'login.passwordPlaceholder');
    setAttribute('#full-name', 'placeholder', 'registration.fullNamePlaceholder');
    setAttribute('#registration-mobile', 'placeholder', 'registration.phone');
    setAttribute('#registration-password', 'placeholder', 'registration.passwordPlaceholder');
    setAttribute('#confirm-password', 'placeholder', 'registration.confirmPlaceholder');
    setAttribute('#center-search', 'placeholder', 'center.search');
    setAttribute('#center-search', 'aria-label', 'center.search');
    setAttribute('#booking-quantity', 'placeholder', 'booking.quantityPlaceholder');
    document.querySelectorAll('#booking-center option').forEach((option) => {
      const originalName = option.value;
      if (!option.dataset.centerLabel) option.dataset.centerLabel = option.textContent;
      const baseLabel = option.dataset.centerLabel;
      const suffix = baseLabel.startsWith(originalName) ? baseLabel.slice(originalName.length) : '';
      const nextLabel = `${getCenterName(originalName)}${suffix}`;
      if (option.textContent !== nextLabel) option.textContent = nextLabel;
    });
  }

  function applyFarmerActionLabels() {
    const language = getLanguage();
    const labels = [
      ['.trust-strip > span:last-child', 'Less Waiting • Better Planning • Transparent Procurement'],
      ['#features .feature-card:nth-child(1) a', 'Explore centers →'],
      ['#features .feature-card:nth-child(2) a', 'View schedule →'],
      ['#features .feature-card:nth-child(3) a', 'See token flow →'],
      ['#features .feature-card:nth-child(4) a', 'View status flow →'],
      ['#features .feature-card:nth-child(5) a', 'Stay informed →'],
      ['#features .feature-card:nth-child(6) a', 'See intelligence →']
    ];
    labels.forEach(([selector, source]) => {
      const element = document.querySelector(selector);
      const translation = extraPhrases[source];
      if (!element || !translation) return;
      const audioButton = element.querySelector('.farmer-voice-button');
      element.textContent = language === 'te' ? translation[0] : translation[1];
      if (audioButton) element.insertAdjacentElement('afterend', audioButton);
    });
  }

  function syncAdminLanguageLink() {
    document.querySelectorAll('a[href="admin-login.html"], a[href="admin-register.html"]').forEach((link) => {
      if (link.dataset.adminLanguageReady) return;
      link.addEventListener('click', () => {
        localStorage.setItem('smartProcureAdminLanguage', getLanguage());
      });
      link.dataset.adminLanguageReady = 'true';
    });
  }

  function applyTranslations() {
    buildLanguageSwitcher();
    const phraseMap = getPhraseMap(getLanguage());
    translateTextNodes(document.body, phraseMap);
    applyFarmerActionLabels();
    updateControls();
    syncAdminLanguageLink();
  }

  window.farmerI18n = { getLanguage, getValue, getCenterName, setLanguage, applyTranslations };
  buildLanguageSwitcher();
  applyTranslations();
  const observer = new MutationObserver(() => {
    window.clearTimeout(observer.timer);
    observer.timer = window.setTimeout(applyTranslations, 0);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
