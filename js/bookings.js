const bookingsList = document.getElementById('booking-list');

function formatBookingDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function loadBookings() {
  if (!bookingsList) return;

  const storageKey = 'smartProcureBookings';
  const existingBookings = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const latestBooking = JSON.parse(localStorage.getItem('smartProcureLatestBooking') || 'null');

  const bookings = latestBooking && !existingBookings.some((booking) => booking.token === latestBooking.token)
    ? [latestBooking, ...existingBookings]
    : existingBookings;
  localStorage.setItem(storageKey, JSON.stringify(bookings));

  if (!bookings.length) {
    bookingsList.innerHTML = `
      <div class="empty-bookings">
        <h3>No bookings yet</h3>
        <p>Your booked procurement slots will appear here after confirmation.</p>
      </div>
    `;
    return;
  }

  bookingsList.innerHTML = bookings.map((booking, index) => `
    <article class="booking-item">
      <div class="booking-item-top">
        <span class="booking-id">${booking.token || `SP-${index + 1}`}</span>
        <span class="booking-status">${booking.status || 'Confirmed'}</span>
      </div>
      <h3>${window.farmerI18n?.getCenterName(booking.center || 'Selected Center') || booking.center || 'Selected Center'}</h3>
      <div class="booking-meta-grid">
        <div>
          <small>Date</small>
          <strong>${formatBookingDate(booking.date)}</strong>
        </div>
        <div>
          <small>Time</small>
          <strong>${booking.time || 'Not selected'}</strong>
        </div>
        <div>
          <small>Crop</small>
          <strong>${booking.crop || 'Rice'}</strong>
        </div>
        <div>
          <small>Quantity</small>
          <strong>${booking.quantity ? `${booking.quantity} kg` : '—'}</strong>
        </div>
      </div>
    </article>
  `).join('');
}

loadBookings();
