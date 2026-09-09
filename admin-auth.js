/* Frontend-only admin authentication. Replace this demo check with a backend later. */
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_LOGIN_KEY = 'smartProcureAdminLoggedIn';

function isAdminDashboard() {
  return document.body.classList.contains('admin-protected-page');
}

function redirectToAdminLogin() {
  window.location.replace('admin-login.html');
}

function protectAdminDashboard() {
  if (isAdminDashboard() && localStorage.getItem(ADMIN_LOGIN_KEY) !== 'true') {
    redirectToAdminLogin();
    return false;
  }
  return true;
}

if (!isAdminDashboard() && localStorage.getItem(ADMIN_LOGIN_KEY) === 'true') {
  window.location.replace('admin-dashboard.html');
}

if (!protectAdminDashboard()) {
  // Stop registering dashboard handlers when the access check failed.
} else {
  const loginForm = document.getElementById('admin-login-form');
  const loginError = document.getElementById('admin-login-error');

  // Demo login: replace this hardcoded check with a server-side authentication request later.
  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = loginForm.elements.username.value.trim();
    const password = loginForm.elements.password.value;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_LOGIN_KEY, 'true');
      window.location.replace('admin-dashboard.html');
      return;
    }
    loginError.textContent = 'Invalid admin credentials';
  });

  // Logout clears the frontend session and uses replace() so Back cannot reopen the dashboard.
  document.querySelectorAll('[data-admin-logout]').forEach((button) => {
    button.addEventListener('click', () => {
      localStorage.removeItem(ADMIN_LOGIN_KEY);
      window.location.replace('index.html');
    });
  });

  document.querySelectorAll('[data-admin-demo]').forEach((button) => {
    button.addEventListener('click', () => {
      const toast = document.querySelector('.admin-toast');
      if (!toast) return;
      toast.textContent = 'This admin action is a frontend demo.';
      toast.classList.add('show');
      window.setTimeout(() => toast.classList.remove('show'), 2400);
    });
  });

  const sidebar = document.getElementById('protected-admin-sidebar');
  const menuButton = document.querySelector('.admin-menu-toggle');
  menuButton?.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  window.addEventListener('pageshow', () => {
    if (isAdminDashboard() && localStorage.getItem(ADMIN_LOGIN_KEY) !== 'true') redirectToAdminLogin();
  });

  window.addEventListener('popstate', () => {
    if (isAdminDashboard() && localStorage.getItem(ADMIN_LOGIN_KEY) !== 'true') redirectToAdminLogin();
  });
}
