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
		'dashboard-centers': ['Nearby Centers', 'Centers near your registered location, Gannavaram.', '<div class="dashboard-data-grid"><article><span class="dashboard-data-icon">Nearest · 2.4 km</span><h3>AP State Procurement Center</h3><p>Rice accepted · Open today · Vijayawada</p><strong>24 slots available · 20 min wait</strong><button class="button button-primary dashboard-demo-button" type="button">Book This Center</button></article><article><span class="dashboard-data-icon">5.1 km away</span><h3>Vijayawada Farmers Hub</h3><p>Rice and Wheat · Busy · Vijayawada</p><strong>12 slots available · 45 min wait</strong><button class="button button-dark dashboard-demo-button" type="button">See Availability</button></article></div>'],
		'token-detail': ['My Bookings', 'View your upcoming and previous slot bookings.', '<div class="dashboard-info-card"><span class="dashboard-data-icon">Booking</span><h3>Upcoming booking</h3><p>Vijayawada Procurement Center · Rice · 500 kg</p><div class="dashboard-info-row"><span>Today, 10:00 AM – 11:00 AM</span><strong>Token P-1024</strong></div><button class="button button-primary dashboard-demo-button" type="button">Manage Booking</button></div>'],
		'status-detail': ['My Procurement', 'Track your procurement history and completed transactions.', '<div class="dashboard-info-card"><span class="dashboard-data-icon">Procurement</span><h3>Rice procurement request</h3><p>Vijayawada Procurement Center · 500 kg</p><div class="dashboard-info-row"><span>Request submitted</span><strong>In progress</strong></div><button class="button button-dark dashboard-demo-button" type="button">View Details</button></div>'],
		'notifications-detail': ['Notifications', 'Check important updates about your bookings and procurement.', '<div class="dashboard-notification-list"><article><span>New</span><div><strong>Your slot has been confirmed.</strong><small>Today, 9:15 AM</small></div></article><article><span>Info</span><div><strong>Your procurement center has 15 available slots.</strong><small>Yesterday</small></div></article><article><span>Update</span><div><strong>Center operating hours have changed.</strong><small>12 September 2026</small></div></article></div>']
	};
	if (viewId === 'farmer-dashboard') {
		panel.innerHTML = '';
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
	const dashboardView = dashboardViewIds.includes(detailId);
	if (dashboardView) {
		document.querySelectorAll('.detail-page').forEach((detail) => detail.classList.toggle('active', detail.id === 'farmer-dashboard'));
		renderDashboardView(detailId);
	} else {
		document.querySelectorAll('.detail-page').forEach((detail) => detail.classList.toggle('active', detail.id === detailId));
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
	dashboardNav.querySelector('[data-detail="farmer-dashboard"]')?.remove();
	if (!dashboardNav.querySelector('.dashboard-nav-home')) {
		const homeLink = document.createElement('a');
		homeLink.className = 'dashboard-nav-home';
		homeLink.href = '#home';
		homeLink.textContent = 'Home';
		homeLink.addEventListener('click', (event) => {
			event.preventDefault();
			showHome();
		});
		dashboardNav.prepend(homeLink);
	}
	const centersLink = dashboardNav.querySelector('[data-detail="centers-detail"]');
	if (centersLink) {
		centersLink.dataset.detail = 'dashboard-centers';
		centersLink.href = '#dashboard-centers';
	}
	if (dashboardNav.querySelector('.dashboard-nav-logout')) return;
	const logoutButton = document.createElement('button');
	logoutButton.className = 'dashboard-nav-logout';
	logoutButton.type = 'button';
	logoutButton.textContent = 'Logout';
	logoutButton.addEventListener('click', () => {
		sessionStorage.removeItem('smartProcureLoggedIn');
		showDetail('login-detail');
	});
	dashboardNav.appendChild(logoutButton);
}

function showHome() {
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
	if (dashboardViewIds.includes(detailId) || document.getElementById(detailId)?.classList.contains('detail-page')) showDetail(detailId);
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
if (dashboardViewIds.includes(initialDetail) || document.getElementById(initialDetail)?.classList.contains('detail-page')) showDetail(initialDetail);
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

document.querySelector('.dashboard-logout')?.addEventListener('click', () => showDetail('login-detail'));