const adminToast = document.querySelector('.admin-toast');
const adminSidebar = document.getElementById('admin-sidebar');
const adminMenuToggle = document.querySelector('.admin-menu-toggle');

function showAdminToast(message) {
  if (!adminToast) return;
  adminToast.textContent = message;
  adminToast.classList.add('show');
  window.setTimeout(() => adminToast.classList.remove('show'), 2600);
}

adminMenuToggle?.addEventListener('click', () => {
  const isOpen = adminSidebar.classList.toggle('open');
  adminMenuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.admin-nav a').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    document.querySelectorAll('.admin-nav a').forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
    adminSidebar?.classList.remove('open');
    showAdminToast(`${link.textContent.trim()} is a static admin view for now.`);
  });
});

document.querySelectorAll('[data-request]').forEach((button) => {
  button.addEventListener('click', () => showAdminToast(`Opening ${button.dataset.request}'s procurement request.`));
});

document.querySelectorAll('[data-admin-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.adminAction;
    if (action === 'logout') {
      localStorage.removeItem('smartProcureAdminLoggedIn');
      window.location.replace('index.html');
      return;
    }
    if (action === 'profile') {
      showAdminToast('Admin profile is a frontend demo view.');
      return;
    }
    if (action === 'back-dashboard') return;
    const labels = {
      'view-requests': 'All procurement requests',
      'manage-farmers': 'Farmer management',
      'manage-centers': 'Center management',
      'manage-slots': 'Slot management',
      'update-status': 'Procurement status updates'
    };
    showAdminToast(`${labels[action] || 'This admin action'} will connect to the backend later.`);
  });
});

document.querySelector('.admin-notification-button')?.addEventListener('click', () => {
  document.querySelector('#notifications')?.scrollIntoView({ behavior: 'smooth' });
});
