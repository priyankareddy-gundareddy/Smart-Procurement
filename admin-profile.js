const profileSession = (() => {
  try {
    return JSON.parse(localStorage.getItem('smartProcureAdminSession') || 'null');
  } catch (error) {
    return null;
  }
})();
const profileAccountsKey = 'smartProcureAdminAccounts';
let profileAccounts = JSON.parse(localStorage.getItem(profileAccountsKey) || '[]');
let currentProfile = profileAccounts.find((account) => account.email === profileSession?.email && account.role === 'admin');
const profileName = document.querySelector('#profile-name');
const profileEmail = document.querySelector('#profile-email');
const profileHeading = document.querySelector('#profile-heading');
const profileAvatar = document.querySelector('#profile-avatar');

function formatRegistrationDate(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function refreshProfile() {
  if (!currentProfile) return;
  const initials = currentProfile.name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  profileHeading.textContent = currentProfile.name;
  profileAvatar.textContent = initials || 'AD';
  profileName.textContent = currentProfile.name;
  profileEmail.textContent = currentProfile.email;
  document.querySelector('#profile-registration-date').textContent = formatRegistrationDate(currentProfile.registrationDate);
  document.querySelector('#profile-edit-name').value = currentProfile.name;
  document.querySelector('#profile-edit-email').value = currentProfile.email;
}

function saveAccounts() {
  localStorage.setItem(profileAccountsKey, JSON.stringify(profileAccounts));
}

function showProfileMessage(selector, message) {
  document.querySelector(selector).textContent = message;
}

if (!currentProfile) {
  window.location.replace('admin-login.html');
} else {
  refreshProfile();

  document.querySelector('#edit-profile-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = event.currentTarget.elements.name.value.trim();
    const email = event.currentTarget.elements.email.value.trim().toLowerCase();
    showProfileMessage('#profile-edit-error', '');
    showProfileMessage('#profile-edit-success', '');
    if (!name || !email || !event.currentTarget.checkValidity()) {
      showProfileMessage('#profile-edit-error', 'Enter a valid admin name and email.');
      return;
    }
    const duplicate = profileAccounts.some((account) => account.email === email && account !== currentProfile);
    if (duplicate) {
      showProfileMessage('#profile-edit-error', 'Another admin account already uses this email.');
      return;
    }
    currentProfile.name = name;
    currentProfile.email = email;
    profileAccounts = profileAccounts.map((account) => account === currentProfile ? currentProfile : account);
    localStorage.setItem('smartProcureAdminSession', JSON.stringify({ email, role: 'admin' }));
    saveAccounts();
    refreshProfile();
    showProfileMessage('#profile-edit-success', 'Profile changes saved successfully.');
  });

  document.querySelector('#change-password-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const currentPassword = event.currentTarget.elements.currentPassword.value;
    const newPassword = event.currentTarget.elements.newPassword.value;
    const confirmPassword = event.currentTarget.elements.confirmNewPassword.value;
    showProfileMessage('#password-error', '');
    showProfileMessage('#password-success', '');
    if (currentPassword !== currentProfile.password) {
      showProfileMessage('#password-error', 'Current password is incorrect.');
      return;
    }
    if (newPassword.length < 6) {
      showProfileMessage('#password-error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showProfileMessage('#password-error', 'New passwords do not match.');
      return;
    }
    currentProfile.password = newPassword;
    saveAccounts();
    event.currentTarget.reset();
    showProfileMessage('#password-success', 'Password changed successfully.');
  });
}
