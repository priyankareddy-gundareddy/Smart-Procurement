const mainNav = document.querySelector('.main-nav');
const toast = document.querySelector('.toast');
const page = document.querySelector('.site-shell');
const main = document.querySelector('main');
history.scrollRestoration = 'manual';

document.querySelectorAll('.back-home').forEach((button) => button.remove());
document.querySelector('.dashboard-cards')?.remove();
document.querySelector('.site-footer')?.remove();
document.querySelector('#dashboard-preview')?.remove();

function showDetail(detailId) {
	document.querySelectorAll('.detail-page').forEach((detail) => detail.classList.toggle('active', detail.id === detailId));
	main.classList.add('detail-mode');
	page.classList.add('detail-mode');
	history.pushState({ detailId }, '', `#${detailId}`);
	setActiveNavigation(detailId);
	window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0);
}

function showHome() {
	document.querySelectorAll('.detail-page').forEach((detail) => detail.classList.remove('active'));
	main.classList.remove('detail-mode');
	page.classList.remove('detail-mode');
	history.pushState({}, '', '#home');
	setActiveNavigation('home');
	window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0);
}

function setActiveNavigation(viewId) {
	document.querySelectorAll('.site-header .main-nav a, .dashboard-masthead-nav a').forEach((link) => {
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
	if (document.getElementById(detailId)?.classList.contains('detail-page')) showDetail(detailId);
	else showHome();
});

document.querySelectorAll('.demo-action').forEach((button) => {
	button.addEventListener('click', () => {
		toast.classList.add('show');
		window.setTimeout(() => toast.classList.remove('show'), 3200);
	});
});

const loginForm = document.getElementById('login-form');
if (loginForm) {
	loginForm.addEventListener('submit', (event) => {
		event.preventDefault();
		toast.textContent = 'Demo login accepted. Farmer Dashboard will be added in the next step.';
		toast.classList.add('show');
		window.setTimeout(() => toast.classList.remove('show'), 3200);
	});
}

const registerButton = document.getElementById('register-demo');
if (registerButton) {
	registerButton.addEventListener('click', () => {
		toast.textContent = 'Demo registration selected. Account creation will be added next.';
		toast.classList.add('show');
		window.setTimeout(() => toast.classList.remove('show'), 3200);
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
if (document.getElementById(initialDetail)?.classList.contains('detail-page')) showDetail(initialDetail);
else setActiveNavigation('home');
if (!initialDetail || initialDetail === 'home') {
	window.scrollTo({ top: 0, behavior: 'auto' });
	window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 100);
}