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
	if (link.closest('#farmer-dashboard')) {
		link.dataset.detail = 'dashboard-centers';
		link.href = '#dashboard-centers';
	} else {
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

const dashboardViewIds = ['farmer-dashboard', 'dashboard-centers', 'token-detail', 'status-detail', 'notifications-detail', 'profile-detail'];
const notificationState = [
	{ icon: '🔵', type: 'Booking', title: 'Slot Confirmed', message: 'Your procurement slot has been confirmed.', date: '10 September 2026 · 10:00 AM', unread: true },
	{ icon: '🟢', type: 'Center Availability', title: 'Center Available', message: 'Vijayawada Procurement Center currently has 15 available slots.', date: 'Today · 9:15 AM', unread: true },
	{ icon: '🟡', type: 'Reminder', title: 'Procurement Reminder', message: 'Your procurement appointment is tomorrow at 10:00 AM.', date: '9 September 2026 · 8:00 AM', unread: true },
	{ icon: '✓', type: 'Procurement', title: 'Procurement Completed', message: 'Your Rice procurement has been completed successfully.', date: '8 September 2026 · 4:30 PM', unread: false }
];
let procurementCenters = [
	{ name: 'Vijayawada Procurement Center', distance: 2.4, status: 'open', statusLabel: 'Open', waiting: 'low', waitingLabel: 'Low', waitDuration: '20 min', slots: 24, hours: '9:00 AM – 5:00 PM' },
	{ name: 'Gannavaram Procurement Center', distance: 5.1, status: 'almost', statusLabel: 'Almost Full', waiting: 'medium', waitingLabel: 'Medium', waitDuration: '45 min', slots: 8, hours: '8:30 AM – 4:30 PM' },
	{ name: 'Mangalagiri Procurement Center', distance: 8.7, status: 'open', statusLabel: 'Open', waiting: 'low', waitingLabel: 'Low', waitDuration: '30 min', slots: 18, hours: '9:00 AM – 5:00 PM' },
	{ name: 'Ibrahimpatnam Procurement Center', distance: 12.3, status: 'closed', statusLabel: 'Closed', waiting: 'high', waitingLabel: 'High', waitDuration: '1 hr 15 min', slots: 0, hours: 'Opens tomorrow · 9:00 AM' }
];

function hasBookableProcurementSlot() {
	try {
		const slots = JSON.parse(localStorage.getItem('smartProcureSlots') || 'null');
		if (!Array.isArray(slots)) return true;
		return slots.some((slot) => slot.active && Number(slot.booked) < Number(slot.capacity));
	} catch (error) {
		return true;
	}
}

function showCenterMessage(root, message) {
	const summary = root.querySelector('#center-summary');
	if (summary) summary.innerHTML = `<span>${message}</span>`;
}

function farmerText(key, fallback) {
	return window.farmerI18n?.getValue(key) || fallback;
}

function farmerCenterName(name) {
	return window.farmerI18n?.getCenterName(name) || name;
}

function farmerDuration(value) {
	if (window.farmerI18n?.getLanguage() !== 'te') return value;
	return String(value).replace(/\bhr\b/g, farmerText('center.hoursShort', 'hr')).replace(/\bmin\b/g, farmerText('center.minutes', 'min'));
}

function normalizeCenter(center) {
	const status = String(center.status || 'open').toLowerCase();
	const statusMap = { open: ['open', 'Open'], available: ['open', 'Available'], almost: ['almost', 'Almost Full'], almost_full: ['almost', 'Almost Full'], closed: ['closed', 'Closed'] };
	const [statusKey, statusLabel] = statusMap[status] || ['open', 'Open'];
	const distance = Number(center.distanceKm ?? center.distance ?? 0);
	return {
		name: center.name || center.centerName || 'Procurement Center',
		distance: Number.isFinite(distance) ? distance : 0,
		status: statusKey,
		statusLabel,
		waiting: center.waiting || 'low',
		waitingLabel: center.waitingLabel || 'Low',
		waitDuration: center.waitDuration || 'Not available',
		slots: Number(center.availableSlots ?? center.slots ?? 0),
		hours: center.hours || center.operatingHours || 'Hours not available'
	};
}

async function loadNearbyCenters(root) {
	if (!navigator.geolocation) {
		showCenterMessage(root, farmerText('center.locationUnsupported', 'Location is not supported by this browser. Showing demo centers.'));
		return;
	}
	showCenterMessage(root, farmerText('center.requesting', 'Requesting your location...'));
	navigator.geolocation.getCurrentPosition(async (position) => {
		const { latitude, longitude } = position.coords;
		try {
			const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) });
			const response = await fetch(`/api/procurement-centers?${params}`);
			if (!response.ok) throw new Error(`Centers API returned ${response.status}`);
			const payload = await response.json();
			const centers = Array.isArray(payload) ? payload : payload.centers;
			if (!Array.isArray(centers)) throw new Error('Invalid centers response');
			procurementCenters = centers.map(normalizeCenter);
			showCenterMessage(root, `${farmerText('center.centersNear', 'Centers near')} ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
			renderCenterCards(root);
		} catch (error) {
			console.warn('Nearby centers API unavailable; using demo centers.', error);
			showCenterMessage(root, farmerText('center.liveUnavailable', 'Live center data unavailable. Showing demo centers.'));
			renderCenterCards(root);
		}
	}, () => {
		showCenterMessage(root, farmerText('center.permissionDenied', 'Location permission was denied. Showing demo centers.'));
		renderCenterCards(root);
	}, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
}

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
		summary.innerHTML = `<span><strong>${filtered.length}</strong> ${farmerText('center.found', 'centers found')}</span><span><strong>${totalSlots}</strong> ${farmerText('center.availableSlots', 'available slots')}</span><span><strong>${averageWait ? `${averageWait} ${farmerText('center.minutes', 'min')}` : '—'}</strong> ${farmerText('center.averageWait', 'average waiting time')}</span>`;
	}
	results.innerHTML = filtered.length ? filtered.map((center) => `<article class="center-card" data-center-name="${center.name}"><div class="center-card-heading"><span class="center-icon">⌖</span><div><h3>${farmerCenterName(center.name)}</h3><p>${center.distance.toFixed(1)} ${farmerText('center.away', 'km away')}</p></div><span class="center-status ${center.status}">${center.statusLabel}</span></div><div class="center-card-data"><span><small>${farmerText('center.waiting', 'Waiting Time')}</small><strong class="wait-${center.waiting}">${farmerDuration(center.waitDuration)} · ${farmerText(`center.${center.waiting}`, center.waitingLabel)}</strong></span><span><small>${farmerText('center.availableSlots', 'available slots')}</small><strong>${center.slots} ${farmerText('center.slots', 'slots')}</strong></span><span><small>${farmerText('center.hours', 'Operating hours')}</small><strong>${farmerDuration(center.hours.replace('Opens tomorrow', farmerText('center.opensTomorrow', 'Opens tomorrow')))}</strong></span></div><div class="center-card-actions"><button class="button button-outline center-map-action" type="button" data-center-action="map">${farmerText('center.viewMap', 'View on Map')}</button><button class="button button-primary center-book-action" type="button" data-center-action="book" ${center.status === 'closed' ? 'disabled' : ''}>${farmerText('center.book', 'Book Slot')}</button></div></article>`).join('') : `<div class="empty-centers"><strong>${farmerText('center.noMatch', 'No centers match your filters.')}</strong><span>${farmerText('center.tryAnother', 'Try another search or filter.')}</span></div>`;
	results.querySelectorAll('[data-center-action="map"]').forEach((button) => button.addEventListener('click', () => {
		toast.textContent = 'Map integration is planned for the next phase.';
		toast.classList.add('show');
		window.setTimeout(() => toast.classList.remove('show'), 3200);
	}));
	results.querySelectorAll('[data-center-action="book"]:not([disabled])').forEach((button) => button.addEventListener('click', () => {
		if (!hasBookableProcurementSlot()) {
			toast.textContent = 'No active procurement slots are available. Please try again later.';
			toast.classList.add('show');
			window.setTimeout(() => toast.classList.remove('show'), 3200);
			return;
		}
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
	if (!root.querySelector('#center-location-ready')) {
		const marker = document.createElement('span');
		marker.id = 'center-location-ready';
		marker.hidden = true;
		root.querySelector('#center-summary')?.after(marker);
		loadNearbyCenters(root);
	}
}

window.addEventListener('farmer-language-changed', () => {
	document.querySelectorAll('#center-results').forEach((results) => {
		const root = results.closest('.centers-page, .dashboard-subview') || document;
		renderCenterCards(root);
	});
});

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
		'dashboard-centers': ['Nearby Centers', 'Centers near your registered location, Gannavaram.', `<div class="dashboard-data-grid dashboard-center-grid">${procurementCenters.map((center) => `<article><span class="dashboard-data-icon">${center.distance.toFixed(1)} km away · ${center.statusLabel}</span><h3>${farmerCenterName(center.name)}</h3><p>Waiting time: <strong>${center.waitDuration} · ${center.waitingLabel}</strong></p><strong>${center.slots} available slots</strong><button class="button button-primary dashboard-demo-button" type="button" ${center.status === 'closed' ? 'disabled' : ''}>Book Slot</button></article>`).join('')}</div>`],
		'token-detail': ['My Bookings', 'View your upcoming and previous slot bookings.', getAllBookingsMarkup()],
		'status-detail': ['Procurement Status', 'Track the procurement status of all your bookings', getAllProcurementStatusMarkup()],
		'notifications-detail': ['Notifications', 'Stay updated about your procurement activities.', getNotificationsMarkup()],
		'profile-detail': ['Your Profile', 'Manage the details connected to your signed-in farmer account.', getProfileMarkup()]
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
	if (viewId === 'notifications-detail') setupNotifications(panel);
	panel.querySelectorAll('.dashboard-demo-button').forEach((button) => button.addEventListener('click', () => {
		toast.textContent = 'This is demo data. This action will connect to the backend later.';
		toast.classList.add('show');
		window.setTimeout(() => toast.classList.remove('show'), 3200);
	}));
}

function getCurrentFarmer() {
	try {
		return JSON.parse(sessionStorage.getItem('smartProcureCurrentFarmer') || 'null');
	} catch (error) {
		return null;
	}
}

function getLatestBooking() {
	try {
		return JSON.parse(localStorage.getItem('smartProcureLatestBooking') || 'null');
	} catch (error) {
		return null;
	}
}

function getStatusBookings() {
	const storedBookings = (() => {
		try {
			const bookings = JSON.parse(localStorage.getItem('smartProcureBookings') || '[]');
			return Array.isArray(bookings) ? bookings : [];
		} catch (error) {
			return [];
		}
	})();
	const latestBooking = getLatestBooking();
	const bookings = latestBooking && !storedBookings.some((booking) => booking.token === latestBooking.token)
		? [latestBooking, ...storedBookings]
		: storedBookings;
	const currentFarmer = getCurrentFarmer();
	const currentMobile = normalizeMobile(currentFarmer?.mobile);
	const taggedBookings = bookings.filter((booking) => booking.farmerMobile);
	if (!currentMobile || !taggedBookings.length) return bookings;
	return bookings.filter((booking) => !booking.farmerMobile || normalizeMobile(booking.farmerMobile) === currentMobile);
}

function formatStatusDate(dateString) {
	if (!dateString) return '10 September 2026';
	const date = new Date(`${dateString}T00:00:00`);
	return Number.isNaN(date.getTime()) ? dateString : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function formatStatusTime(time) {
	if (!time) return '10:00 AM – 11:00 AM';
	const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
	if (!match) return time;
	let hour = Number(match[1]);
	const period = match[3].toUpperCase();
	hour = hour === 12 ? 1 : hour + 1;
	return `${time} – ${String(hour).padStart(2, '0')}:${match[2]} ${period}`;
}

function getProcurementStatusMarkup() {
	const booking = getLatestBooking() || {};
	const details = {
		token: booking.token || 'SP-1024',
		crop: booking.crop || 'Paddy',
		quantity: booking.quantity ? `${booking.quantity} kg` : '500 kg',
		center: farmerCenterName(booking.center || 'Vijayawada Procurement Center'),
		date: formatStatusDate(booking.date),
		time: formatStatusTime(booking.time)
	};
	return `<div class="procurement-status-page"><div class="procurement-details-card"><div class="procurement-detail"><small>Booking / Token</small><strong>${details.token}</strong></div><div class="procurement-detail"><small>Crop</small><strong>${details.crop}</strong></div><div class="procurement-detail"><small>Quantity</small><strong>${details.quantity}</strong></div><div class="procurement-detail"><small>Procurement Center</small><strong>${details.center}</strong></div><div class="procurement-detail"><small>Booking Date</small><strong>${details.date}</strong></div><div class="procurement-detail"><small>Slot Time</small><strong>${details.time}</strong></div></div><div class="procurement-timeline" aria-label="Procurement status timeline"><div class="status-timeline-step complete"><span>✓</span><div><strong>Request Submitted</strong><small>Completed</small></div></div><div class="status-timeline-step complete"><span>✓</span><div><strong>Slot Confirmed</strong><small>Completed</small></div></div><div class="status-timeline-step current"><span>●</span><div><strong>Waiting for Procurement</strong><small>Current status</small></div></div><div class="status-timeline-step pending"><span>○</span><div><strong>Procurement Completed</strong><small>Pending</small></div></div></div><button class="button button-dark dashboard-action procurement-back-button" type="button" data-dashboard-action="back-dashboard">Back to Dashboard</button></div>`;
}

function getAllProcurementStatusMarkup() {
	const bookings = getStatusBookings();
	if (!bookings.length) return '<div class="empty-status-board"><strong>No procurement bookings yet.</strong><span>Confirmed bookings will appear here.</span></div>';
	return `<div class="procurement-status-board">${bookings.map((booking) => getProcurementStatusCardMarkup(booking)).join('')}</div>`;
}

function getAllBookingsMarkup() {
	const bookings = getStatusBookings();
	if (!bookings.length) return '<div class="empty-status-board"><strong>No bookings yet.</strong><span>Your confirmed procurement slots will appear here.</span></div>';
	return `<div class="dashboard-booking-board">${bookings.map((booking, index) => `<article class="dashboard-booking-card"><div class="dashboard-booking-card-top"><span class="dashboard-data-icon">Booking ${index + 1}</span><span class="booking-status">${booking.status || 'Confirmed'}</span></div><h3>${booking.token || `SP-${index + 1}`}</h3><p>${farmerCenterName(booking.center || 'Selected Center')}</p><div class="dashboard-booking-meta"><span><small>Crop</small><strong>${booking.crop || 'Rice'}</strong></span><span><small>Quantity</small><strong>${booking.quantity ? `${booking.quantity} kg` : '500 kg'}</strong></span><span><small>Date</small><strong>${formatStatusDate(booking.date)}</strong></span><span><small>Time</small><strong>${formatStatusTime(booking.time)}</strong></span></div></article>`).join('')}</div>`;
}

function getProcurementStatusCardMarkup(booking) {
	const details = {
		token: booking.token || 'SP-1024',
		crop: booking.crop || 'Paddy',
		quantity: booking.quantity ? `${booking.quantity} kg` : '500 kg',
		center: farmerCenterName(booking.center || 'Vijayawada Procurement Center'),
		date: formatStatusDate(booking.date),
		time: formatStatusTime(booking.time)
	};
	return `<article class="procurement-status-card"><div class="procurement-details-card"><div class="procurement-detail"><small>Booking / Token</small><strong>${details.token}</strong></div><div class="procurement-detail"><small>Crop</small><strong>${details.crop}</strong></div><div class="procurement-detail"><small>Quantity</small><strong>${details.quantity}</strong></div><div class="procurement-detail"><small>Procurement Center</small><strong>${details.center}</strong></div><div class="procurement-detail"><small>Booking Date</small><strong>${details.date}</strong></div><div class="procurement-detail"><small>Slot Time</small><strong>${details.time}</strong></div></div><div class="procurement-timeline" aria-label="Procurement status timeline"><div class="status-timeline-step complete"><span>✓</span><div><strong>Request Submitted</strong><small>Completed</small></div></div><div class="status-timeline-step complete"><span>✓</span><div><strong>Slot Confirmed</strong><small>Completed</small></div></div><div class="status-timeline-step current"><span>●</span><div><strong>Waiting for Procurement</strong><small>Current status</small></div></div><div class="status-timeline-step pending"><span>○</span><div><strong>Procurement Completed</strong><small>Pending</small></div></div></div></article>`;
}

function getFarmerInitials(farmer) {
	return String(farmer?.fullName || '').trim().split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function updateDashboardProfileBadge(farmer) {
	const profileButton = document.querySelector('.dashboard-profile-button');
	if (profileButton) profileButton.querySelector('.profile-button-avatar')?.replaceChildren();
}

function getProfileMarkup() {
	const farmer = getCurrentFarmer() || {};
	const name = farmer.fullName || 'Farmer';
	const mobile = farmer.mobile || 'Not provided';
	const state = farmer.state || 'Not provided';
	const district = farmer.district || 'Not provided';
	return `<div class="dashboard-profile-card"><div class="dashboard-profile-identity"><span class="profile-avatar-large">${getFarmerInitials(farmer)}</span><div><h3>${name}</h3><p>Signed-in farmer account</p></div></div><dl><div><dt>Mobile Number</dt><dd>${mobile}</dd></div><div><dt>State</dt><dd>${state}</dd></div><div><dt>District</dt><dd>${district}</dd></div></dl></div>`;
}

function getNotificationsMarkup() {
	const unreadCount = notificationState.filter((notification) => notification.unread).length;
	return `<div class="notifications-toolbar"><span class="notification-count"><strong>${unreadCount}</strong> unread updates</span><div><button class="button button-primary notification-mark-all" type="button">Mark All as Read</button><button class="button button-outline notification-clear-all" type="button">Clear All</button></div></div><div class="notification-board">${notificationState.map((notification, index) => `<article class="notification-card${notification.unread ? ' unread' : ''}" data-notification-index="${index}" tabindex="0"><span class="notification-card-icon" aria-hidden="true">${notification.icon}</span><div class="notification-card-content"><div class="notification-card-heading"><div><span class="notification-type">${notification.type}</span><h3>${notification.title}</h3></div><span class="notification-state">${notification.unread ? 'Unread' : 'Read'}</span></div><p>${notification.message}</p><small>${notification.date}</small></div></article>`).join('')}</div><button class="button button-dark notification-back-button dashboard-action" type="button" data-dashboard-action="back-dashboard">Back to Dashboard</button>`;
}

function updateNotificationBell() {
	const unreadCount = notificationState.filter((notification) => notification.unread).length;
	const bell = document.querySelector('.dashboard-bell');
	if (!bell) return;
	bell.innerHTML = `🔔<i${unreadCount === 0 ? ' hidden' : ''}>${unreadCount}</i>`;
}

function setupNotifications(panel) {
	updateNotificationBell();
	panel.querySelectorAll('.notification-card').forEach((card) => {
		const markRead = () => {
			const notification = notificationState[Number(card.dataset.notificationIndex)];
			if (!notification?.unread) return;
			notification.unread = false;
			renderDashboardView('notifications-detail');
		};
		card.addEventListener('click', markRead);
		card.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				markRead();
			}
		});
	});
	panel.querySelector('.notification-mark-all')?.addEventListener('click', () => {
		notificationState.forEach((notification) => { notification.unread = false; });
		renderDashboardView('notifications-detail');
	});
	panel.querySelector('.notification-clear-all')?.addEventListener('click', () => {
		notificationState.length = 0;
		renderDashboardView('notifications-detail');
	});
	panel.querySelector('.notification-back-button')?.addEventListener('click', () => showDetail('farmer-dashboard'));
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
	const digits = String(value || '').replace(/\D/g, '');
	return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}

function getStoredAccounts() {
	const accounts = [];
	try {
		const list = JSON.parse(localStorage.getItem('smartProcureAccounts') || '[]');
		if (Array.isArray(list)) accounts.push(...list.filter(Boolean));
	} catch (error) {
		console.warn('Failed to parse stored accounts:', error);
	}
	try {
		const legacyFarmer = JSON.parse(localStorage.getItem('smartProcureFarmer') || 'null');
		if (legacyFarmer) accounts.push(legacyFarmer);
	} catch (error) {
		console.warn('Failed to parse legacy farmer profile:', error);
	}
	const uniqueAccounts = accounts.filter((account, index, all) => {
		const mobile = normalizeMobile(account?.mobile);
		return mobile && all.findIndex((candidate) => normalizeMobile(candidate?.mobile) === mobile && String(candidate?.password || '') === String(account?.password || '')) === index;
	});
	if (uniqueAccounts.length && localStorage.getItem('smartProcureAccounts') !== JSON.stringify(uniqueAccounts)) {
		localStorage.setItem('smartProcureAccounts', JSON.stringify(uniqueAccounts));
	}
	return uniqueAccounts;
}

function saveStoredAccounts(accounts) {
	const uniqueAccounts = accounts.filter((account, index, all) => {
		const mobile = normalizeMobile(account?.mobile);
		return mobile && all.findIndex((candidate) => normalizeMobile(candidate?.mobile) === mobile) === index;
	});
	localStorage.setItem('smartProcureAccounts', JSON.stringify(uniqueAccounts));
	const lastAccount = uniqueAccounts[uniqueAccounts.length - 1];
	if (lastAccount) localStorage.setItem('smartProcureFarmer', JSON.stringify(lastAccount));
}

function findMatchingAccount(mobile, password) {
	const accounts = getStoredAccounts();
	return accounts.find((account) => normalizeMobile(account.mobile) === mobile && String(account.password) === String(password)) || null;
}

if (loginForm) {
	loginForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const mobile = normalizeMobile(loginForm.querySelector('#mobile').value);
		const password = loginForm.querySelector('#password').value;
		const farmer = findMatchingAccount(mobile, password);
		if (farmer) {
			sessionStorage.setItem('smartProcureLoggedIn', 'true');
			sessionStorage.setItem('smartProcureCurrentFarmer', JSON.stringify(farmer));
			updateDashboardProfileBadge(farmer);
			toast.textContent = `${farmerText('messages.loginSuccess', 'Login successful. Welcome back.')} ${farmer.fullName}.`;
			showDetail('farmer-dashboard');
		} else if (!getStoredAccounts().length) {
			toast.textContent = farmerText('login.noAccountFound', 'No account found. Please register first.');
		} else {
			toast.textContent = farmerText('login.invalid', 'The mobile number or password does not match your account.');
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
		const normalizedMobile = normalizeMobile(values.mobile);
		const storedAccounts = getStoredAccounts();
		const hasExistingAccount = storedAccounts.some((account) => normalizeMobile(account.mobile) === normalizedMobile);
		if (hasExistingAccount) {
			success.textContent = 'This mobile number is already registered. Please login.';
			return;
		}
		values.mobile = normalizedMobile;
		const updatedAccounts = [...storedAccounts, values];
		saveStoredAccounts(updatedAccounts);
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

const dashboardLogout = document.querySelector('.dashboard-logout');
if (dashboardLogout && !document.querySelector('.dashboard-profile-button')) {
	const currentFarmer = getCurrentFarmer();
	const profileButton = document.createElement('button');
	profileButton.className = 'dashboard-profile-button button button-dark';
	profileButton.type = 'button';
	profileButton.innerHTML = '<span class="profile-button-avatar" aria-hidden="true"><svg viewBox="0 0 40 40" role="presentation"><circle cx="20" cy="10" r="7" fill="#000"/><path d="M4 36c0-8.7 7.2-14 16-14s16 5.3 16 14c0 1.2-.8 2-2 2H6c-1.2 0-2-.8-2-2Z" fill="#000"/></svg></span>';
	profileButton.setAttribute('aria-label', 'My Profile');
	profileButton.title = 'My Profile';
	profileButton.addEventListener('click', () => showDetail('profile-detail'));
	dashboardLogout.before(profileButton);
}

document.querySelectorAll('.dashboard-action').forEach((button) => {
	button.addEventListener('click', () => {
		const destinations = { centers: 'dashboard-centers', bookings: 'token-detail', procurement: 'status-detail', notifications: 'notifications-detail' };
		if (button.dataset.dashboardAction === 'book') {
			window.location.href = 'booking.html';
			return;
		}
		if (destinations[button.dataset.dashboardAction]) {
			showDetail(destinations[button.dataset.dashboardAction]);
			return;
		}
		if (button.dataset.dashboardAction === 'back-dashboard') {
			showDetail('farmer-dashboard');
			return;
		}
		toast.textContent = 'Demo slot selected. Your booking flow will continue here.';
		toast.classList.add('show');
		window.setTimeout(() => toast.classList.remove('show'), 3200);
	});
});

dashboardLogout?.addEventListener('click', () => {
	sessionStorage.removeItem('smartProcureLoggedIn');
	sessionStorage.removeItem('smartProcureCurrentFarmer');
	showDetail('login-detail');
});

updateNotificationBell();