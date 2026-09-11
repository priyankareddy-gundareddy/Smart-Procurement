const ADMIN_NOTIFICATIONS_KEY = 'smartProcureAdminNotifications';

function getAdminNotifications() {
  try {
    const stored = JSON.parse(localStorage.getItem(ADMIN_NOTIFICATIONS_KEY) || 'null');
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    return [{ read: false }, { read: false }, { read: false }, { read: true }];
  }
}

function updateNotificationBadges() {
  const unreadCount = getAdminNotifications().filter((notification) => !notification.read).length;
  document.querySelectorAll('.notification-badge').forEach((badge) => {
    badge.textContent = unreadCount;
    badge.setAttribute('aria-label', `${unreadCount} unread notifications`);
    badge.hidden = unreadCount === 0;
  });
  const count = document.querySelector('#notification-count');
  if (count) count.innerHTML = `<strong>${unreadCount}</strong> unread notification${unreadCount === 1 ? '' : 's'}`;
}

window.updateNotificationBadges = updateNotificationBadges;
updateNotificationBadges();
