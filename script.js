const mainNav = document.querySelector('.main-nav');
const toast = document.querySelector('.toast');
const page = document.querySelector('.site-shell');
const main = document.querySelector('main');
history.scrollRestoration = 'manual';

document.querySelectorAll('.back-home').forEach((button) => button.remove());
document.querySelector('.dashboard-cards')?.remove();
document.querySelector('.site-footer')?.remove();
document.querySelector('#dashboard-preview')?.remove();

const publicCentersSection = document.getElementById('centers-detail');
if (publicCentersSection) publicCentersSection.id = 'public-centers';
document.querySelectorAll('[data-detail="centers-detail"]').forEach((link) => {
	if (!link.closest('#farmer-dashboard')) {
		link.dataset.detail = 'public-centers';
		link.href = '#public-centers';
	}
});

const publicStatusSection = document.getElementById('status-detail');
if (publicStatusSection) publicStatusSection.id = 'public-status';
document.querySelectorAll('[data-detail="status-detail"]').forEach((link) => {
	if (!link.closest('#farmer-dashboard')) {
		link.dataset.detail = 'public-status';
		link.href = '#public-status';
	}
});

const publicNotificationsSection = document.getElementById('notifications-detail');
if (publicNotificationsSection) publicNotificationsSection.id = 'public-notifications';
document.querySelectorAll('[data-detail="notifications-detail"]').forEach((link) => {
	if (!link.closest('#farmer-dashboard')) {
		link.dataset.detail = 'public-notifications';
		link.href = '#public-notifications';
	}
});

const dashboardViewIds = ['farmer-dashboard', 'dashboard-centers', 'token-detail', 'status-detail', 'notifications-detail'];
const procurementCenters = [
	{ name: 'Vijayawada Procurement Center', distance: 2.4, status: 'open', statusLabel: 'Open', waiting: 'low', waitingLabel: 'Low', waitDuration: '20 min', slots: 24, hours: '9:00 AM – 5:00 PM' },
	{ name: 'Gannavaram Procurement Center', distance: 5.1, status: 'almost', statusLabel: 'Almost Full', waiting: 'medium', waitingLabel: 'Medium', waitDuration: '45 min', slots: 8, hours: '8:30 AM – 4:30 PM' },
	{ name: 'Mangalagiri Procurement Center', distance: 8.7, status: 'open', statusLabel: 'Open', waiting: 'low', waitingLabel: 'Low', waitDuration: '30 min', slots: 18, hours: '9:00 AM – 5:00 PM' },
	{ name: 'Ibrahimpatnam Procurement Center', distance: 12.3, status: 'closed', statusLabel: 'Closed', waiting: 'high', waitingLabel: 'High', waitDuration: '1 hr 15 min', slots: 0, hours: 'Opens tomorrow · 9:00 AM' }
];

function renderCenterCards(root = document) {
	const results = root.querySelector('#center-results');
	if (!results) return;
	const search = root.querySelector('#center-search')?.value.trim().toLowerCase() || '';
	const distance = root.querySelector('#center-distance')?.value || 'all';
	const status = root.querySelector('#center-status')?.value || 'all';
	const waiting = root.querySelector('#center-waiting')?.value || 'all';
	const filtered = procurementCenters.filter((center) => {
		return center.name.toLowerCase().includes(search) &&
			(distance === 'all' || center.distance <= Number(distance)) &&
			(status === 'all' || center.status === status) &&
			(waiting === 'all' || center.waiting === waiting);
	});
	const summary = root.querySelector('#center-summary');
	if (summary) {
		const totalSlots = filtered.reduce((total, center) => total + center.slots, 0);
		const averageWait = filtered.length ? Math.round(filtered.reduce((total, center) => total + (center.waiting === 'low' ? 25 : center.waiting === 'medium' ? 45 : 75), 0) / filtered.length) : 0;
		summary.innerHTML = `<span><strong>${filtered.length}</strong> centers found</span><span><strong>${totalSlots}</strong> available slots</span><span><strong>${averageWait ? `${averageWait} min` : '—'}</strong> average waiting time</span>`;
	}
	results.innerHTML = filtered.length ? filtered.map((center) => `<article class="center-card" data-center-name="${center.name}"><div class="center-card-heading"><span class="center-icon">⌖</span><div><h3>${center.name}</h3><p>${center.distance.toFixed(1)} km away</p></div><span class="center-status ${center.status}">${center.statusLabel}</span></div><div class="center-card-data"><span><small>Waiting time</small><strong class="wait-${center.waiting}">${center.waitDuration} · ${center.waitingLabel}</strong></span><span><small>Available slots</small><strong>${center.slots} slots</strong></span><span><small>Operating hours</small><strong>${center.hours}</strong></span></div><div class="center-card-actions"><button class="button button-outline center-map-action" type="button" data-center-action="map">View on Map</button><button class="button button-primary center-book-action" type="button" data-center-action="book" ${center.status === 'closed' ? 'disabled' : ''}>Book Slot</button></div></article>`).join('') : '<div class="empty-centers"><strong>No centers match your filters.</strong><span>Try another search or filter.</span></div>';
	results.querySelectorAll('[data-center-action="map"]').forEach((button) => button.addEventListener('click', () => {
		toast.textContent = 'Map integration is planned for the next phase.';
		toast.classList.add('show');
		window.setTimeout(() => toast.classList.remove('show'), 3200);
	}));
	results.querySelectorAll('[data-center-action="book"]:not([disabled])').forEach((button) => button.addEventListener('click', () => {
		if (sessionStorage.getItem('smartProcureLoggedIn')) showDetail('token-detail');
		else showDetail('login-detail');
	}));
}

function setupCentersPage(root = document) {
	['center-search', 'center-distance', 'center-status', 'center-waiting'].forEach((id) => {
		const control = root.querySelector(`#${id}`);
		if (control && !control.dataset.ready) {
			control.dataset.ready = 'true';
			control.addEventListener('input', () => renderCenterCards(root));
			control.addEventListener('change', () => renderCenterCards(root));
		}
	});
	renderCenterCards(root);
}

function dashboardCentersMarkup() {
	return `<span class="section-kicker">Farmer dashboard · Step 6</span><h2>Nearby Procurement Centers</h2><p class="dashboard-subview-lede">Find nearby procurement centers, check availability, and book your slot.</p><div class="center-tools"><label class="center-search"><span>⌕</span><input id="center-search" type="search" placeholder="Search procurement centers..." aria-label="Search procurement centers"></label><label><span>Distance</span><select id="center-distance"><option value="all">All distances</option><option value="5">Within 5 km</option><option value="10">Within 10 km</option></select></label><label><span>Status</span><select id="center-status"><option value="all">All statuses</option><option value="open">Open</option><option value="almost">Almost Full</option><option value="closed">Closed</option></select></label><label><span>Waiting Time</span><select id="center-waiting"><option value="all">Any wait</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label></div><div class="center-summary" id="center-summary"></div><div class="centers-layout"><div class="center-results" id="center-results"></div><aside class="centers-map" aria-label="Procurement Centers Map"><div class="map-grid"></div><span class="map-marker marker-one">⌖</span><span class="map-marker marker-two">⌖</span><span class="map-marker marker-three">⌖</span><div class="map-copy"><span>🗺️</span><h3>Procurement Centers Map</h3><p>Interactive map will be available here.</p></div></aside></div>`;
}

function setDashboardCentersContext(isDashboardContext) {
	const centersPage = document.getElementById('public-centers');
	if (!centersPage) return;
	centersPage.classList.toggle('dashboard-centers-context', isDashboardContext);
	page.classList.toggle('dashboard-centers-mode', isDashboardContext);
	if (isDashboardContext && !centersPage.querySelector('.dashboard-centers-bar')) {
		const bar = document.createElement('div');
		bar.className = 'dashboard-centers-bar';
		bar.innerHTML = '<span class="dashboard-context-brand"><span class="brand-mark">S</span><b>Smart<span>Procure</span></b></span><strong>Farmer Dashboard</strong>';
		centersPage.prepend(bar);
	}
}

function prepareDashboardView() {
	const dashboard = document.getElementById('farmer-dashboard');
	if (!dashboard || dashboard.querySelector('.dashboard-subview')) return;
	dashboard.querySelector('.dashboard-header')?.classList.add('dashboard-overview');
	dashboard.querySelector('.today-procurement')?.classList.add('dashboard-overview');
	dashboard.querySelector('.dashboard-feature-grid')?.classList.add('dashboard-overview');
	dashboard.querySelector('.procurement-status')?.classList.add('dashboard-overview');
	const panel = document.createElement('section');
	panel.className = 'dashboard-subview';
	dashboard.querySelector('.dashboard-page-nav')?.after(panel);
	dashboard._subview = panel;
}

function renderDashboardView(viewId) {
	prepareDashboardView();
	const dashboard = document.getElementById('farmer-dashboard');
	const panel = dashboard?._subview;
	if (!dashboard || !panel) return;
	dashboard.classList.toggle('dashboard-subview-active', viewId !== 'farmer-dashboard');
	const views = {
		'dashboard-centers': ['Nearby Centers', 'Centers near your registered location, Gannavaram.', `<div class="dashboard-data-grid dashboard-center-grid">${procurementCenters.map((center) => `<article><span class="dashboard-data-icon">${center.distance.toFixed(1)} km away · ${center.statusLabel}</span><h3>${center.name}</h3><p>Waiting time: <strong>${center.waitDuration} · ${center.waitingLabel}</strong></p><strong>${center.slots} available slots</strong><button class="button button-primary dashboard-demo-button" type="button" ${center.status === 'closed' ? 'disabled' : ''}>Book Slot</button></article>`).join('')}</div>`],
		'token-detail': ['My Bookings', 'View your upcoming and previous slot bookings.', '<div class="dashboard-info-card"><span class="dashboard-data-icon">Booking</span><h3>Upcoming booking</h3><p>Vijayawada Procurement Center · Rice · 500 kg</p><div class="dashboard-info-row"><span>Today, 10:00 AM – 11:00 AM</span><strong>Token P-1024</strong></div><button class="button button-primary dashboard-demo-button" type="button">Manage Booking</button></div>'],
		'status-detail': ['My Procurement', 'Track your procurement history and completed transactions.', '<div class="dashboard-info-card"><span class="dashboard-data-icon">Procurement</span><h3>Rice procurement request</h3><p>Vijayawada Procurement Center · 500 kg</p><div class="dashboard-info-row"><span>Request submitted</span><strong>In progress</strong></div><button class="button button-dark dashboard-demo-button" type="button">View Details</button></div>'],
		'notifications-detail': ['Notifications', 'Check important updates about your bookings and procurement.', '<div class="dashboard-notification-list"><article><span>New</span><div><strong>Your slot has been confirmed.</strong><small>Today, 9:15 AM</small></div></article><article><span>Info</span><div><strong>Your procurement center has 15 available slots.</strong><small>Yesterday</small></div></article><article><span>Update</span><div><strong>Center operating hours have changed.</strong><small>12 September 2026</small></div></article></div>']
	};
	if (viewId === 'farmer-dashboard') {
		panel.innerHTML = '';
		return;
	}
	if (viewId === 'dashboard-centers') {
		panel.innerHTML = dashboardCentersMarkup();
		setupCentersPage(panel);
		return;
	}
	const view = views[viewId];
	if (!view) return;
	panel.innerHTML = `<span class="section-kicker">Farmer dashboard</span><h2>${view[0]}</h2><p class="dashboard-subview-lede">${view[1]}</p>${view[2]}`;
	panel.querySelectorAll('.dashboard-demo-button').forEach((button) => button.addEventListener('click', () => {
		toast.textContent = 'This is demo data. This action will connect to the backend later.';
		toast.classList.add('show');
		window.setTimeout(() => toast.classList.remove('show'), 3200);
	}));
}

function showDetail(detailId) {
	if (detailId === 'token-detail' && !sessionStorage.getItem('smartProcureLoggedIn')) {
		showDetail('login-detail');
		return;
	}
	if (detailId === 'dashboard-centers') {
		document.querySelectorAll('.detail-page').forEach((detail) => detail.classList.toggle('active', detail.id === 'farmer-dashboard'));
		setDashboardCentersContext(false);
		renderDashboardView('dashboard-centers');
		main.classList.add('detail-mode');
		page.classList.add('detail-mode');
		page.classList.add('dashboard-mode');
		setupDashboardNavigation();
		history.pushState({ detailId }, '', '#dashboard-centers');
		setActiveNavigation(detailId);
		window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0);
		return;
	}
	const dashboardView = dashboardViewIds.includes(detailId);
	if (dashboardView) {
		setDashboardCentersContext(false);
		document.querySelectorAll('.detail-page').forEach((detail) => detail.classList.toggle('active', detail.id === 'farmer-dashboard'));
		renderDashboardView(detailId);
	} else {
		document.querySelectorAll('.detail-page').forEach((detail) => detail.classList.toggle('active', detail.id === detailId));
		setDashboardCentersContext(false);
		if (detailId === 'public-centers') setupCentersPage();
	}
	main.classList.add('detail-mode');
	page.classList.add('detail-mode');
	page.classList.toggle('dashboard-mode', dashboardView);
	setupDashboardNavigation();
	history.pushState({ detailId }, '', `#${detailId}`);
	setActiveNavigation(detailId);
	window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0);
}

function setupDashboardNavigation() {
	const dashboardNav = document.querySelector('.dashboard-page-nav');
	if (!dashboardNav) return;
	const dashboardLink = dashboardNav.querySelector('[data-detail="farmer-dashboard"]');
	if (dashboardLink) {
		dashboardLink.href = '#farmer-dashboard';
		dashboardLink.textContent = 'Dashboard';
	}
	const centersLink = [...dashboardNav.querySelectorAll('a')].find((link) => link.textContent.trim() === 'Centers');
	if (centersLink) {
		centersLink.dataset.detail = 'dashboard-centers';
		centersLink.href = '#dashboard-centers';
	}
}

function showHome() {
	setDashboardCentersContext(false);
	document.querySelectorAll('.detail-page').forEach((detail) => detail.classList.remove('active'));
	main.classList.remove('detail-mode');
	page.classList.remove('detail-mode');
	page.classList.remove('dashboard-mode');
	history.pushState({}, '', '#home');
	setActiveNavigation('home');
	window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0);
}

function setActiveNavigation(viewId) {
	document.querySelectorAll('.site-header .main-nav a, .dashboard-masthead-nav a, .dashboard-page-nav a').forEach((link) => {
		const target = link.dataset.detail || (link.dataset.home === 'true' ? 'home' : '');
		link.classList.toggle('active', target === viewId);
	});
}

document.querySelectorAll('[data-detail]').forEach((link) => {
	link.addEventListener('click', (event) => {
		event.preventDefault();
		showDetail(link.dataset.detail);
	});
});

document.querySelectorAll('[data-home]').forEach((button) => button.addEventListener('click', showHome));

window.addEventListener('popstate', () => {
	const detailId = window.location.hash.replace('#', '');
	if (detailId === 'dashboard-centers' || dashboardViewIds.includes(detailId) || document.getElementById(detailId)?.classList.contains('detail-page')) showDetail(detailId);
	else showHome();
});

document.querySelectorAll('.demo-action').forEach((button) => {
	button.addEventListener('click', () => {
		toast.classList.add('show');
		window.setTimeout(() => toast.classList.remove('show'), 3200);
	});
});

document.querySelector('.center-booking-action')?.addEventListener('click', () => {
	if (sessionStorage.getItem('smartProcureLoggedIn')) {
		showDetail('token-detail');
		return;
	}
	toast.textContent = 'Please login or register to book a procurement slot.';
	toast.classList.add('show');
	showDetail('login-detail');
	window.setTimeout(() => toast.classList.remove('show'), 3200);
});

const loginForm = document.getElementById('login-form');
function normalizeMobile(value) {
	const digits = value.replace(/\D/g, '');
	return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}

if (loginForm) {
	loginForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const farmer = JSON.parse(localStorage.getItem('smartProcureFarmer') || 'null');
		const mobile = normalizeMobile(loginForm.querySelector('#mobile').value);
		const password = loginForm.querySelector('#password').value;
		if (farmer && normalizeMobile(farmer.mobile) === mobile && farmer.password === password) {
			sessionStorage.setItem('smartProcureLoggedIn', 'true');
			toast.textContent = 'Login successful. Welcome back, ' + farmer.fullName + '.';
			showDetail('farmer-dashboard');
		} else if (!farmer) {
			toast.textContent = 'No demo account found. Please register first.';
		} else {
			toast.textContent = 'The mobile number or password does not match your demo account.';
		}
		toast.classList.add('show');
		window.setTimeout(() => toast.classList.remove('show'), 3200);
	});
}

const registerButton = document.getElementById('register-demo');
if (registerButton) {
	registerButton.addEventListener('click', () => {
		showDetail('register-detail');
	});
}

const districtOptions = {
	'Andhra Pradesh': ['Anantapur', 'Chittoor', 'Guntur', 'Krishna', 'Kurnool', 'Nellore', 'Prakasam', 'Visakhapatnam'],
	'Karnataka': ['Bengaluru Urban', 'Belagavi', 'Dharwad', 'Mysuru', 'Shivamogga', 'Tumakuru'],
	'Kerala': ['Ernakulam', 'Idukki', 'Kollam', 'Kottayam', 'Kozhikode', 'Thiruvananthapuram'],
	'Maharashtra': ['Ahmednagar', 'Aurangabad', 'Nashik', 'Nagpur', 'Pune', 'Solapur'],
	'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Thanjavur', 'Tiruchirappalli'],
	'Telangana': ['Adilabad', 'Hyderabad', 'Karimnagar', 'Khammam', 'Nalgonda', 'Warangal'],
	'West Bengal': ['Bankura', 'Hooghly', 'Howrah', 'Nadia', 'North 24 Parganas', 'South 24 Parganas']
};

const registrationForm = document.getElementById('registration-form');
const stateSelect = document.getElementById('state');
const districtSelect = document.getElementById('district');
if (stateSelect && districtSelect) {
	stateSelect.addEventListener('change', () => {
		const districts = districtOptions[stateSelect.value] || ['Central district', 'North district', 'South district'];
		districtSelect.innerHTML = '<option value="">Choose your district</option>' + districts.map((district) => `<option>${district}</option>`).join('');
		districtSelect.disabled = false;
	});
}

if (registrationForm) {
	registrationForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const values = Object.fromEntries(new FormData(registrationForm).entries());
		const errors = {};
		if (!values.fullName.trim()) errors['full-name'] = 'Enter your full name.';
		if (!/^\d{10}$/.test(values.mobile)) errors['registration-mobile'] = 'Enter a valid 10-digit mobile number.';
		if (values.password.length < 6) errors['registration-password'] = 'Use at least 6 characters.';
		if (!values.confirmPassword) errors['confirm-password'] = 'Confirm your password.';
		else if (values.password !== values.confirmPassword) errors['confirm-password'] = 'Passwords do not match.';
		if (!values.state) errors.state = 'Select your state.';
		if (!values.district) errors.district = 'Select your district.';
		registrationForm.querySelectorAll('.field-error').forEach((error) => { error.textContent = errors[error.dataset.errorFor] || ''; });
		registrationForm.querySelectorAll('input, select').forEach((field) => field.classList.toggle('invalid', Boolean(errors[field.id])));
		const success = document.getElementById('registration-success');
		if (Object.keys(errors).length) {
			success.textContent = '';
			return;
		}
		values.mobile = normalizeMobile(values.mobile);
		localStorage.setItem('smartProcureFarmer', JSON.stringify(values));
		success.textContent = 'Registration successful! You can now login.';
		registrationForm.reset();
		districtSelect.innerHTML = '<option value="">Select a state first</option>';
		districtSelect.disabled = true;
		registrationForm.querySelectorAll('input, select').forEach((field) => field.classList.remove('invalid'));
	});
}

const sections = document.querySelectorAll('main section[id], header[id]');
const navLinks = document.querySelectorAll('.main-nav a');

const sectionObserver = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (!entry.isIntersecting) return;
		if (entry.target.id === 'hero' || entry.target.id === 'dashboard-preview' || entry.target.id === 'features') setActiveNavigation('home');
	});
}, { rootMargin: '-35% 0px -55% 0px' });

sections.forEach((section) => sectionObserver.observe(section));

const initialDetail = window.location.hash.replace('#', '');
setupDashboardNavigation();
	if (initialDetail === 'dashboard-centers' || dashboardViewIds.includes(initialDetail) || document.getElementById(initialDetail)?.classList.contains('detail-page')) showDetail(initialDetail);
else setActiveNavigation('home');
if (!initialDetail || initialDetail === 'home') {
	window.scrollTo({ top: 0, behavior: 'auto' });
	window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 100);
}

document.querySelectorAll('.dashboard-action').forEach((button) => {
	button.addEventListener('click', () => {
		const destinations = { centers: 'dashboard-centers', bookings: 'token-detail', procurement: 'status-detail', notifications: 'notifications-detail' };
		if (destinations[button.dataset.dashboardAction]) {
			showDetail(destinations[button.dataset.dashboardAction]);
			return;
		}
		toast.textContent = 'Demo slot selected. Your booking flow will continue here.';
		toast.classList.add('show');
		window.setTimeout(() => toast.classList.remove('show'), 3200);
	});
});

document.querySelector('.dashboard-logout')?.addEventListener('click', () => {
	sessionStorage.removeItem('smartProcureLoggedIn');
	showDetail('login-detail');
});