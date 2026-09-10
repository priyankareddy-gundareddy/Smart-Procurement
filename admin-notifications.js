const defaultNotifications = [
  { id: 'notification-1', icon: '▤', title: 'New procurement request', message: 'Ravi Kumar submitted a Rice request for 500 kg.', time: '10 Sep 2026 · 10:42 AM', read: false },
  { id: 'notification-2', icon: '◷', title: 'Booking status changed', message: 'Booking BK-1025 for Sita Devi was approved.', time: '10 Sep 2026 · 9:30 AM', read: false },
  { id: 'notification-3', icon: '✓', title: 'Procurement completed', message: 'Wheat procurement for Sita Devi was marked completed.', time: '09 Sep 2026 · 4:15 PM', read: false },
  { id: 'notification-4', icon: '⌖', title: 'System alert', message: 'Vijayawada Procurement Center has 15 slots available.', time: '09 Sep 2026 · 11:00 AM', read: true }
];
const notificationsKey = 'smartProcureAdminNotifications';
const notificationBoard = document.querySelector('#notification-board');
const notificationToast = document.querySelector('.admin-toast');

function getNotifications() {
  try {
    const stored = JSON.parse(localStorage.getItem(notificationsKey) || 'null');
    if (Array.isArray(stored)) return stored;
  } catch (error) {
    // Use the demo alerts when stored data is unavailable.
  }
  localStorage.setItem(notificationsKey, JSON.stringify(defaultNotifications));
  return [...defaultNotifications];
}

function saveNotifications(notifications) {
  localStorage.setItem(notificationsKey, JSON.stringify(notifications));
  window.updateNotificationBadges?.();
}

function showNotificationToast(message) {
  if (!notificationToast) return;
  notificationToast.textContent = message;
  notificationToast.classList.add('show');
  window.setTimeout(() => notificationToast.classList.remove('show'), 2400);
}

function renderNotifications() {
  const notifications = getNotifications();
  notificationBoard.innerHTML = notifications.length ? notifications.map((notification) => `<article class="notification-card ${notification.read ? '' : 'unread'}" data-notification-id="${notification.id}"><span class="notification-card-icon">${notification.icon}</span><div class="notification-card-content"><strong>${notification.title}</strong><small>${notification.message}</small><small>${notification.time}</small></div><div class="notification-card-actions"><button type="button" class="notification-read-button">${notification.read ? 'Mark Unread' : 'Mark Read'}</button><button type="button" class="notification-delete-button">Delete</button></div></article>`).join('') : '<p class="admin-empty-state">No notifications available.</p>';
  document.querySelectorAll('.notification-read-button').forEach((button) => button.addEventListener('click', () => toggleRead(button.closest('.notification-card').dataset.notificationId)));
  document.querySelectorAll('.notification-delete-button').forEach((button) => button.addEventListener('click', () => deleteNotification(button.closest('.notification-card').dataset.notificationId)));
  window.updateNotificationBadges?.();
}

function toggleRead(id) {
  const notifications = getNotifications().map((notification) => notification.id === id ? { ...notification, read: !notification.read } : notification);
  saveNotifications(notifications);
  renderNotifications();
}

function deleteNotification(id) {
  saveNotifications(getNotifications().filter((notification) => notification.id !== id));
  renderNotifications();
  showNotificationToast('Notification deleted.');
}

document.querySelector('#mark-all-read')?.addEventListener('click', () => {
  saveNotifications(getNotifications().map((notification) => ({ ...notification, read: true })));
  renderNotifications();
  showNotificationToast('All notifications marked as read.');
});

renderNotifications();
