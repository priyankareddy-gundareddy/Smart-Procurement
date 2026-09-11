const slotData = [
  { label: '09:00 AM', status: 'Available', available: true },
  { label: '10:00 AM', status: 'Available', available: true },
  { label: '11:00 AM', status: 'Available', available: true },
  { label: '12:00 PM', status: 'Available', available: true }
];

const bookingCropInput = document.getElementById('booking-crop');
const bookingQuantityInput = document.getElementById('booking-quantity');
const bookingCenterInput = document.getElementById('booking-center');
const bookingDateInput = document.getElementById('booking-date');
const slotGrid = document.getElementById('slot-grid');
const validationBox = document.getElementById('booking-validation');
const bookingStep1 = document.getElementById('booking-step-1');
const bookingStep2 = document.getElementById('booking-step-2');
const bookingStep3 = document.getElementById('booking-step-3');
const confirmCrop = document.getElementById('confirm-crop');
const confirmQuantity = document.getElementById('confirm-quantity');
const confirmCenter = document.getElementById('confirm-center');
const confirmDate = document.getElementById('confirm-date');
const confirmTime = document.getElementById('confirm-time');
const successBookingId = document.getElementById('success-booking-id');
const successCenter = document.getElementById('success-center');
const successCrop = document.getElementById('success-crop');
const successQuantity = document.getElementById('success-quantity');
const successDate = document.getElementById('success-date');
const successTime = document.getElementById('success-time');

let selectedBookingSlot = null;
let bookingSelection = {
  crop: '',
  quantity: '',
  center: 'Vijayawada Procurement Center',
  date: '',
  time: ''
};

const fallbackCenters = [
  { name: 'Vijayawada Procurement Center', distanceKm: 2.4, status: 'open' },
  { name: 'Guntur Procurement Center', distanceKm: 5.1, status: 'open' },
  { name: 'Mangalagiri Procurement Center', distanceKm: 8.7, status: 'open' },
  { name: 'Amaravati Procurement Center', distanceKm: 12.3, status: 'closed' }
];

function formatReadableDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
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

function setBookingCenters(centers) {
  if (!bookingCenterInput || !Array.isArray(centers) || !centers.length) return;
  bookingCenterInput.innerHTML = centers.map((center) => {
    const name = center.name || center.centerName || 'Procurement Center';
    const distance = Number(center.distanceKm ?? center.distance);
    const suffix = Number.isFinite(distance) ? ` · ${distance.toFixed(1)} km` : '';
    const disabled = String(center.status || '').toLowerCase() === 'inactive' || String(center.status || '').toLowerCase() === 'full' || String(center.status || '').toLowerCase() === 'closed';
    const displayName = window.farmerI18n?.getCenterName(name) || name;
    return `<option value="${name}" ${disabled ? 'disabled' : ''}>${displayName}${suffix}${disabled ? ' (Unavailable)' : ''}</option>`;
  }).join('');
  const firstAvailable = [...bookingCenterInput.options].find((option) => !option.disabled);
  if (firstAvailable) {
    bookingCenterInput.value = firstAvailable.value;
    bookingSelection.center = firstAvailable.value;
  }
}

function loadBookingCenters() {
  if (!bookingCenterInput || !navigator.geolocation) {
    setBookingCenters(fallbackCenters);
    return;
  }
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    try {
      const params = new URLSearchParams({ latitude: String(coords.latitude), longitude: String(coords.longitude) });
      const response = await fetch(`/api/procurement-centers?${params}`);
      if (!response.ok) throw new Error(`Centers API returned ${response.status}`);
      const payload = await response.json();
      setBookingCenters(Array.isArray(payload) ? payload : payload.centers);
    } catch (error) {
      console.warn('Booking centers API unavailable; using fallback centers.', error);
      setBookingCenters(fallbackCenters);
    }
  }, () => setBookingCenters(fallbackCenters), { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
}

function setDateDefault() {
  if (!bookingDateInput) return;
  const today = new Date();
  const isoDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  bookingDateInput.min = isoDate;
  bookingDateInput.value = isoDate;
  bookingSelection.date = isoDate;
}

async function renderTimeSlots() {
  if (!slotGrid) return;

  const centreName = bookingCenterInput?.value;
  const date = bookingDateInput?.value;

  // If centre or date is not selected, show all slots as available
  if (!centreName || !date) {
    slotData.forEach(slot => {
      slot.available = true;
      slot.status = 'Available';
    });
  } else {

    const centreIds = {
      'Vijayawada Procurement Center': 3,
      'Guntur Procurement Center': 1,
      'Tenali Procurement Center': 2
    };

    const centreId = centreIds[centreName];

    if (centreId) {
      try {
        const response = await fetch(
            `http://localhost:8080/api/bookings/centre/${centreId}/date/${date}`
        );

        if (response.ok) {
          const bookings = await response.json();

          slotData.forEach(slot => {
            const alreadyBooked = bookings.some(
                booking => booking.slotTime === slot.label
            );

            slot.available = !alreadyBooked;
            slot.status = alreadyBooked ? 'Full' : 'Available';
          });
        }
      } catch (error) {
        console.error('Could not load booked slots:', error);
      }
    }
  }

  slotGrid.innerHTML = '';

  slotData.forEach((slot) => {
    const card = document.createElement('button');

    card.type = 'button';
    card.className = 'slot-card';
    card.disabled = !slot.available;

    card.innerHTML = `
      <span class="slot-time">${slot.label}</span>
      <span class="slot-status ${slot.available ? 'available' : 'full'}">
        ${slot.status}
      </span>
    `;

    if (selectedBookingSlot === slot.label && slot.available) {
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
  if (!confirmCrop || !confirmQuantity || !confirmCenter || !confirmDate || !confirmTime) return;
  confirmCrop.textContent = bookingSelection.crop;
  confirmQuantity.textContent = `${bookingSelection.quantity} kg`;
  confirmCenter.textContent = window.farmerI18n?.getCenterName(bookingSelection.center) || bookingSelection.center;
  confirmDate.textContent = formatReadableDate(bookingSelection.date);
  confirmTime.textContent = selectedBookingSlot || bookingSelection.time || '10:00 AM';
}

if (bookingCropInput) {
  bookingCropInput.addEventListener('change', () => {
    bookingSelection.crop = bookingCropInput.value;
  });
}

if (bookingQuantityInput) {
  bookingQuantityInput.addEventListener('change', () => {
    bookingSelection.quantity = bookingQuantityInput.value;
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
    selectedBookingSlot = null;
    bookingSelection.time = '';
    renderTimeSlots();
  });
}

if (bookingDateInput) {
  bookingDateInput.addEventListener('change', () => {
    bookingSelection.date = bookingDateInput.value;
    selectedBookingSlot = null;
    bookingSelection.time = '';
    renderTimeSlots();
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
  const quantity = bookingQuantityInput?.value;
  const center = bookingCenterInput?.value;
  const date = bookingDateInput?.value;
  const slot = selectedBookingSlot;

  if (!crop || !quantity || !center || !date || !slot) {
    setValidation('Please select a crop, quantity, center, date, and time slot before continuing.');
    return;
  }

  clearValidation();
  bookingSelection.crop = crop;
  bookingSelection.quantity = quantity;
  bookingSelection.center = center;
  bookingSelection.date = date;
  bookingSelection.time = slot;
  updateBookingSummary();
  showScreen(bookingStep2);
});

document.getElementById('back-to-step-1')?.addEventListener('click', () => showScreen(bookingStep1));
document.getElementById('confirm-back')?.addEventListener('click', () => showScreen(bookingStep1));

// BACKEND BOOKING

const confirmBookingButton = document.getElementById('confirm-booking');

if (confirmBookingButton) {
  confirmBookingButton.addEventListener('click', async () => {

    let farmer = null;

    try {
      farmer = JSON.parse(
          sessionStorage.getItem('smartProcureCurrentFarmer') ||
          localStorage.getItem('smartProcureCurrentFarmer') ||
          'null'
      );
    } catch (error) {
      farmer = null;
    }
    if (!farmer || !farmer.id) {
      alert('Please login again.');
      return;
    }

    // Convert center name to database center ID
    const centreIds = {
      'Vijayawada Procurement Center': 3,
      'Guntur Procurement Center': 1,
      'Tenali Procurement Center': 2
    };

    const centreId = centreIds[bookingSelection.center];

    if (!centreId) {
      alert('Invalid procurement center.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          farmerId: farmer.id,
          centreId: centreId,
          cropName: bookingSelection.crop,
          quantity: Number(bookingSelection.quantity),
          bookingDate: bookingSelection.date,
          slotTime: bookingSelection.time
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Booking failed:', errorText);
        alert('Booking failed. Please try again.');
        return;
      }

      const booking = await response.json();

      console.log('Booking created successfully:', booking);

      // Show REAL database booking ID
      if (successBookingId) {
        successBookingId.textContent = booking.id;
      }

      if (successCenter) {
        successCenter.textContent = bookingSelection.center;
      }

      if (successCrop) {
        successCrop.textContent = bookingSelection.crop;
      }

      if (successQuantity) {
        successQuantity.textContent =
            `${bookingSelection.quantity} kg`;
      }

      if (successDate) {
        successDate.textContent =
            formatReadableDate(bookingSelection.date);
      }

      if (successTime) {
        successTime.textContent = bookingSelection.time;
      }

      showScreen(bookingStep3);

    } catch (error) {
      console.error('Backend connection error:', error);
      alert('Cannot connect to backend. Make sure Spring Boot is running.');
    }
  });
}
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
  const selectedCenter = sessionStorage.getItem('smartProcureSelectedCenter');

  if (selectedCenter) {
    bookingCenterInput.value = selectedCenter;
    bookingSelection.center = selectedCenter;
    sessionStorage.removeItem('smartProcureSelectedCenter');
  } else {
    bookingCenterInput.value = 'Vijayawada Procurement Center';
    bookingSelection.center = bookingCenterInput.value;
  }

  loadBookingCenters();
}
setDateDefault();
renderTimeSlots();
showScreen(bookingStep1);
