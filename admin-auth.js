const ADMIN_LOGIN_KEY = 'smartProcureAdminLoggedIn';
const ADMIN_ACCOUNTS_KEY = 'smartProcureAdminAccounts';
const ADMIN_SESSION_KEY = 'smartProcureAdminSession';
// Temporary frontend-only demo secret. Replace this check with a secure backend invitation flow.
const ADMIN_REGISTRATION_CODE = 'SIH-ADMIN-2026';

function isAdminDashboard() {
  return document.body.classList.contains('admin-protected-page');
}

function redirectToAdminLogin() {
  window.location.replace('admin-login.html');
}

function getAdminAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(ADMIN_ACCOUNTS_KEY) || '[]');
    return Array.isArray(accounts) ? accounts : [];
  } catch (error) {
    return [];
  }
}

function getAdminSession() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || 'null');
  } catch (error) {
    return null;
  }
}

function hasAdminSession() {
  const session = getAdminSession();
  return localStorage.getItem(ADMIN_LOGIN_KEY) === 'true' && session?.role === 'admin';
}

function showAdminProfile() {
  const session = getAdminSession();
  const account = getAdminAccounts().find((candidate) => candidate.email === session?.email);
  const existingDialog = document.querySelector('#admin-profile-dialog');
  if (existingDialog) {
    existingDialog.showModal();
    return;
  }
  const dialog = document.createElement('dialog');
  dialog.id = 'admin-profile-dialog';
  dialog.className = 'admin-details-dialog';
  dialog.innerHTML = `<div class="admin-details-dialog-heading"><div><span class="admin-eyebrow">Account</span><h2>Admin Profile</h2></div><button class="admin-dialog-close" type="button" aria-label="Close profile">×</button></div><div class="admin-profile-summary"><span class="admin-profile-large">${String(account?.name || 'Admin').trim().slice(0, 2).toUpperCase()}</span><div><strong>${account?.name || 'Admin'}</strong><small>${account?.email || session?.email || 'Admin account'}</small></div></div><dl class="admin-details-list"><div><dt>Role</dt><dd>Administrator</dd></div><div><dt>Access</dt><dd>SmartProcure Admin Dashboard</dd></div></dl>`;
  document.body.appendChild(dialog);
  dialog.querySelector('.admin-dialog-close').addEventListener('click', () => dialog.close());
  dialog.showModal();
}

function protectAdminDashboard() {
  if (isAdminDashboard() && !hasAdminSession()) {
    redirectToAdminLogin();
    return false;
  }
  return true;
}

if (!isAdminDashboard() && hasAdminSession() && !document.getElementById('admin-register-form')) {
  window.location.replace('admin-dashboard.html');
}

if (!protectAdminDashboard()) {
  // Stop registering dashboard handlers when the access check failed.
} else {
  const loginForm = document.getElementById('admin-login-form');
  const loginError = document.getElementById('admin-login-error');
  const registrationForm = document.getElementById('admin-register-form');
  const registrationError = document.getElementById('admin-register-error');
  const registrationSuccess = document.getElementById('admin-register-success');

  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = loginForm.elements.username.value.trim().toLowerCase();
    const password = loginForm.elements.password.value;
    loginError.textContent = '';
    if (!username || !password || !loginForm.checkValidity()) {
      loginError.textContent = 'Enter a valid email and password.';
      return;
    }
    const account = getAdminAccounts().find((candidate) => candidate.email === username && candidate.password === password);
    if (account?.role === 'admin') {
      localStorage.setItem(ADMIN_LOGIN_KEY, 'true');
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ email: account.email, role: account.role }));
      window.location.replace('admin-dashboard.html');
      return;
    }
    loginError.textContent = account ? 'This account is not authorized for admin access.' : 'Invalid admin email or password.';
  });

  registrationForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    registrationError.textContent = '';
    registrationSuccess.textContent = '';
    const name = registrationForm.elements.name.value.trim();
    const email = registrationForm.elements.email.value.trim().toLowerCase();
    const password = registrationForm.elements.password.value;
    const confirmPassword = registrationForm.elements.confirmPassword.value;
    const registrationCode = registrationForm.elements.registrationCode.value;
    if (!name || !email || !password || !confirmPassword || !registrationCode || !registrationForm.checkValidity()) {
      registrationError.textContent = 'Complete all fields with a valid email address.';
      return;
    }
    if (password.length < 6) {
      registrationError.textContent = 'Password must be at least 6 characters.';
      return;
    }
    if (password !== confirmPassword) {
      registrationError.textContent = 'Passwords do not match.';
      return;
    }
    if (registrationCode !== ADMIN_REGISTRATION_CODE) {
      registrationError.textContent = 'Invalid admin registration code. Only authorized administrators can register.';
      return;
    }
    const accounts = getAdminAccounts();
    if (accounts.some((account) => account.email === email)) {
      registrationError.textContent = 'An admin account with this email already exists.';
      return;
    }
    accounts.push({ name, email, password, role: 'admin', registrationDate: new Date().toISOString() });
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
    registrationSuccess.textContent = 'Registration successful. Redirecting to Admin Login...';
    window.setTimeout(() => window.location.replace('admin-login.html'), 700);
  });

  // Logout clears the frontend session and uses replace() so Back cannot reopen the dashboard.
  document.querySelectorAll('[data-admin-logout]').forEach((button) => {
    button.addEventListener('click', () => {
      localStorage.removeItem(ADMIN_LOGIN_KEY);
      localStorage.removeItem(ADMIN_SESSION_KEY);
      window.location.replace('index.html');
    });
  });

  document.querySelectorAll('.admin-profile-button').forEach((button) => {
    button.addEventListener('click', () => {
      if (!window.location.pathname.endsWith('admin-profile.html')) {
        window.location.href = 'admin-profile.html';
      }
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
    if (isAdminDashboard() && !hasAdminSession()) redirectToAdminLogin();
  });

  window.addEventListener('popstate', () => {
    if (isAdminDashboard() && !hasAdminSession()) redirectToAdminLogin();
  });
}

