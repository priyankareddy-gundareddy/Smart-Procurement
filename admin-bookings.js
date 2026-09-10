const bookingTable = document.querySelector('#bookings-table');
const bookingToast = document.querySelector('.admin-toast');
const bookingRecords = [
  { id: 'BK-1024', farmer: 'Ravi Kumar', crop: 'Rice', date: '10 Sep 2026', slot: '10:00 AM - 11:00 AM', quantity: '500 kg', status: 'Pending' },
  { id: 'BK-1025', farmer: 'Sita Devi', crop: 'Wheat', date: '10 Sep 2026', slot: '11:30 AM - 12:30 PM', quantity: '300 kg', status: 'Approved' },
  { id: 'BK-1026', farmer: 'Ramesh Rao', crop: 'Rice', date: '11 Sep 2026', slot: '09:00 AM - 10:00 AM', quantity: '700 kg', status: 'Rejected' },
  { id: 'BK-1027', farmer: 'Anita Singh', crop: 'Maize', date: '11 Sep 2026', slot: '02:00 PM - 03:00 PM', quantity: '400 kg', status: 'Pending' }
];

function showBookingToast(message) {
  if (!bookingToast) return;
  bookingToast.textContent = message;
  bookingToast.classList.add('show');
  window.setTimeout(() => bookingToast.classList.remove('show'), 2600);
}

function statusClass(status) {
  return status === 'Approved' ? 'completed' : status === 'Rejected' ? 'pending' : 'confirmed';
}

function renderBookings() {
  const query = document.querySelector('#booking-search')?.value.trim().toLowerCase() || '';
  const statusFilter = document.querySelector('#booking-status-filter')?.value || 'all';
  const filtered = bookingRecords.filter((booking) => {
    const matchesText = `${booking.id} ${booking.farmer}`.toLowerCase().includes(query);
    return matchesText && (statusFilter === 'all' || booking.status === statusFilter);
  });
  bookingTable.tBodies[0].innerHTML = filtered.length ? filtered.map((booking) => `<tr data-booking-id="${booking.id}"><td data-label="Booking ID"><strong>${booking.id}</strong></td><td data-label="Farmer Name">${booking.farmer}</td><td data-label="Product/Crop">${booking.crop}</td><td data-label="Booking Date">${booking.date}</td><td data-label="Procurement Slot">${booking.slot}</td><td data-label="Quantity">${booking.quantity}</td><td data-label="Booking Status"><span class="admin-status ${statusClass(booking.status)}">${booking.status}</span></td><td data-label="Actions"><button class="admin-table-action booking-details" type="button">View Details</button> <button class="admin-table-action booking-approve" type="button" ${booking.status !== 'Pending' ? 'hidden' : ''}>Approve</button> <button class="admin-table-action booking-reject" type="button" ${booking.status !== 'Pending' ? 'hidden' : ''}>Reject</button> <button class="admin-table-action booking-update" type="button">Update Status</button></td></tr>`).join('') : '<tr><td colspan="8">No bookings match your search.</td></tr>';
  bindBookingActions();
}

function updateBookingStatus(row, status) {
  const booking = bookingRecords.find((item) => item.id === row.dataset.bookingId);
  if (!booking) return;
  booking.status = status;
  renderBookings();
  showBookingToast(`${booking.id} status updated to ${status}.`);
}

function bindBookingActions() {
  document.querySelectorAll('.booking-details').forEach((button) => button.addEventListener('click', () => showBookingToast(`Complete details for ${button.closest('tr').dataset.bookingId} are available in the frontend demo.`)));
  document.querySelectorAll('.booking-approve').forEach((button) => button.addEventListener('click', () => updateBookingStatus(button.closest('tr'), 'Approved')));
  document.querySelectorAll('.booking-reject').forEach((button) => button.addEventListener('click', () => updateBookingStatus(button.closest('tr'), 'Rejected')));
  document.querySelectorAll('.booking-update').forEach((button) => button.addEventListener('click', () => showBookingToast(`Choose a new status for ${button.closest('tr').dataset.bookingId} in the backend workflow.`)));
}

if (bookingTable) {
  bookingTable.tHead.innerHTML = '<tr><th>Booking ID</th><th>Farmer Name</th><th>Product/Crop</th><th>Booking Date</th><th>Procurement Slot</th><th>Quantity</th><th>Booking Status</th><th>Actions</th></tr>';
  const heading = bookingTable.closest('.admin-page-content').querySelector('.admin-section-heading');
  const filters = document.createElement('div');
  filters.className = 'admin-page-actions booking-filters';
  filters.innerHTML = '<input class="admin-search-input" id="booking-search" type="search" placeholder="Search farmer or booking ID" aria-label="Search by farmer name or booking ID"><select class="admin-search-input" id="booking-status-filter" aria-label="Filter bookings by status"><option value="all">All statuses</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select>';
  heading.appendChild(filters);
  filters.querySelectorAll('input, select').forEach((control) => control.addEventListener('input', renderBookings));
  renderBookings();
}
