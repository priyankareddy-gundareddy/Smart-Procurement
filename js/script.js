const slotData = [
  { label: '09:00 AM', status: 'Available', available: true },
  { label: '10:00 AM', status: 'Available', available: true },
  { label: '11:00 AM', status: 'Full', available: false },
  { label: '12:00 PM', status: 'Available', available: true }
];

const bookingCropInput = document.getElementById('booking-crop');
const bookingCenterInput = document.getElementById('booking-center');
const bookingDateInput = document.getElementById('booking-date');
const slotGrid = document.getElementById('slot-grid');
const validationBox = document.getElementById('booking-validation');
const bookingStep1 = document.getElementById('booking-step-1');
const bookingStep2 = document.getElementById('booking-step-2');
const bookingStep3 = document.getElementById('booking-step-3');
const confirmCrop = document.getElementById('confirm-crop');
const confirmCenter = document.getElementById('confirm-center');
const confirmDate = document.getElementById('confirm-date');
const confirmTime = document.getElementById('confirm-time');
const successBookingId = document.getElementById('success-booking-id');
const successCenter = document.getElementById('success-center');
const successCrop = document.getElementById('success-crop');
const successDate = document.getElementById('success-date');
const successTime = document.getElementById('success-time');

let selectedBookingSlot = null;
let bookingSelection = {
  crop: '',
  center: 'Vijayawada Procurement Center',
  date: '',
  time: ''
};

function formatReadableDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function generateBookingId() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const code = String(Math.floor(Math.random() * 900) + 100);
  return `SP${stamp}${code}`;
}

function setValidation(message, isError = true) {
  if (!validationBox) return;
  validationBox.textContent = message;
  validationBox.classList.toggle('error', isError);
}

function clearValidation() {
  if (!validationBox) return;
  validationBox.textContent = '';
}

function setDateDefault() {
  if (!bookingDateInput) return;
  const today = new Date();
  const isoDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  bookingDateInput.min = isoDate;
  bookingDateInput.value = isoDate;
  bookingSelection.date = isoDate;
}

function renderTimeSlots() {
  if (!slotGrid) return;

  slotGrid.innerHTML = '';
  slotData.forEach((slot) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'slot-card';
    card.disabled = !slot.available;
    card.innerHTML = `
      <span class="slot-time">${slot.label}</span>
      <span class="slot-status ${slot.available ? 'available' : 'full'}">${slot.status}</span>
    `;

    if (selectedBookingSlot === slot.label) {
      card.classList.add('selected');
    }

    if (slot.available) {
      card.addEventListener('click', () => {
        selectedBookingSlot = slot.label;
        bookingSelection.time = slot.label;
        renderTimeSlots();
      });
    }

    slotGrid.appendChild(card);
  });
}

function updateBookingSummary() {
  if (!confirmCrop || !confirmCenter || !confirmDate || !confirmTime) return;
  confirmCrop.textContent = bookingSelection.crop;
  confirmCenter.textContent = bookingSelection.center;
  confirmDate.textContent = formatReadableDate(bookingSelection.date);
  confirmTime.textContent = selectedBookingSlot || bookingSelection.time || '10:00 AM';
}

if (bookingCropInput) {
  bookingCropInput.addEventListener('change', () => {
    bookingSelection.crop = bookingCropInput.value;
  });
}

function showScreen(screen) {
  const screens = [bookingStep1, bookingStep2, bookingStep3];
  screens.forEach((item) => {
    if (!item) return;
    item.classList.add('hidden');
  });

  if (screen) screen.classList.remove('hidden');
}

function saveBookingToHistory(booking) {
  const bookings = JSON.parse(localStorage.getItem('smartProcureBookings') || '[]');
  bookings.unshift(booking);
  localStorage.setItem('smartProcureBookings', JSON.stringify(bookings));
  localStorage.setItem('smartProcureLatestBooking', JSON.stringify(booking));
}

if (bookingCenterInput) {
  bookingCenterInput.addEventListener('change', () => {
    bookingSelection.center = bookingCenterInput.value;
  });
}

if (bookingDateInput) {
  bookingDateInput.addEventListener('change', () => {
    bookingSelection.date = bookingDateInput.value;
  });
}

document.getElementById('back-to-dashboard')?.addEventListener('click', () => {
  window.location.href = 'index.html#farmer-dashboard';
});

document.getElementById('cancel-booking')?.addEventListener('click', () => {
  window.location.href = 'index.html#farmer-dashboard';
});

document.getElementById('continue-booking')?.addEventListener('click', () => {
  const crop = bookingCropInput?.value;
  const center = bookingCenterInput?.value;
  const date = bookingDateInput?.value;
  const slot = selectedBookingSlot;

  if (!crop || !center || !date || !slot) {
    setValidation('Please select a crop, center, date, and time slot before continuing.');
    return;
  }

  clearValidation();
  bookingSelection.crop = crop;
  bookingSelection.center = center;
  bookingSelection.date = date;
  bookingSelection.time = slot;
  updateBookingSummary();
  showScreen(bookingStep2);
});

document.getElementById('back-to-step-1')?.addEventListener('click', () => showScreen(bookingStep1));
document.getElementById('confirm-back')?.addEventListener('click', () => showScreen(bookingStep1));

document.getElementById('confirm-booking')?.addEventListener('click', () => {
  const bookingId = generateBookingId();
  let currentFarmer = null;
  try {
    currentFarmer = JSON.parse(sessionStorage.getItem('smartProcureCurrentFarmer') || 'null');
  } catch (error) {
    currentFarmer = null;
  }
  const booking = {
    token: bookingId,
    crop: bookingSelection.crop,
    quantity: 500,
    center: bookingSelection.center,
    date: bookingSelection.date,
    time: selectedBookingSlot,
    status: 'Confirmed',
    farmer: 'Priyanka',
    mobile: 'XXXXXXXXXX',
    farmerMobile: currentFarmer?.mobile || ''
  };

  saveBookingToHistory(booking);

  if (successBookingId) successBookingId.textContent = bookingId;
  if (successCenter) successCenter.textContent = bookingSelection.center;
  if (successCrop) successCrop.textContent = bookingSelection.crop;
  if (successDate) successDate.textContent = formatReadableDate(bookingSelection.date);
  if (successTime) successTime.textContent = selectedBookingSlot || bookingSelection.time;

  showScreen(bookingStep3);
});

document.getElementById('view-bookings')?.addEventListener('click', () => {
  window.location.href = 'my-bookings.html';
});

document.getElementById('view-procurement-status')?.addEventListener('click', () => {
  window.location.href = 'index.html#status-detail';
});

document.getElementById('success-dashboard')?.addEventListener('click', () => {
  window.location.href = 'index.html#farmer-dashboard';
});

if (bookingCenterInput) {
  bookingCenterInput.value = 'Vijayawada Procurement Center';
  bookingSelection.center = bookingCenterInput.value;
}

setDateDefault();
renderTimeSlots();
showScreen(bookingStep1);
