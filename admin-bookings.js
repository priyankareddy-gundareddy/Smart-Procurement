const bookingTable =
    document.querySelector('#bookings-table');

const bookingToast =
    document.querySelector('.admin-toast');

let bookingRecords = [];


/* ================= TOAST ================= */

function showBookingToast(message) {

  if (!bookingToast) {
    return;
  }

  bookingToast.textContent = message;

  bookingToast.classList.add('show');

  window.setTimeout(() => {
    bookingToast.classList.remove('show');
  }, 2600);
}


/* ================= DATE ================= */

function formatDate(dateString) {

  if (!dateString) {
    return '-';
  }

  const date =
      new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
  );
}


/* ================= STATUS CLASS ================= */

function statusClass(status) {

  if (
      status === 'COMPLETED' ||
      status === 'PAID'
  ) {
    return 'completed';
  }

  if (
      status === 'WAITING' ||
      status === 'CANCELLED'
  ) {
    return 'pending';
  }

  return 'confirmed';
}


/* ================= LOAD BOOKINGS ================= */

async function loadBookings() {

  if (!bookingTable) {
    console.error('Bookings table not found');
    return;
  }

  bookingTable.tBodies[0].innerHTML = `
        <tr>
            <td colspan="8">
                Loading bookings...
            </td>
        </tr>
    `;


  try {

    // Get bookings from backend
    const bookingsResponse =
        await fetch(
            'http://localhost:8080/api/bookings'
        );


    if (!bookingsResponse.ok) {
      throw new Error(
          'Failed to load bookings'
      );
    }


    const bookings =
        await bookingsResponse.json();


    // Get farmers from backend
    const farmersResponse =
        await fetch(
            'http://localhost:8080/api/farmers'
        );


    const farmers =
        farmersResponse.ok
            ? await farmersResponse.json()
            : [];


    bookingRecords =
        bookings.map((booking) => {

          const farmer =
              farmers.find(
                  (item) =>
                      item.id ===
                      booking.farmerId
              );


          return {

            id: booking.id,

            farmerId:
            booking.farmerId,

            farmer:
                farmer
                    ? farmer.name
                    : `Farmer ${booking.farmerId}`,

            crop:
            booking.cropName,

            date:
            booking.bookingDate,

            slot:
            booking.slotTime,

            quantity:
            booking.quantity,

            status:
            booking.status,

            tokenNumber:
            booking.tokenNumber,

            centreId:
            booking.centreId

          };

        });


    renderBookings();


  } catch (error) {

    console.error(
        'Error loading bookings:',
        error
    );

    bookingTable.tBodies[0].innerHTML = `
            <tr>
                <td colspan="8">
                    Failed to load bookings.
                </td>
            </tr>
        `;
  }
}


/* ================= RENDER ================= */

function renderBookings() {

  if (!bookingTable) {
    return;
  }


  const query =
      document
          .querySelector('#booking-search')
          ?.value
          .trim()
          .toLowerCase() || '';


  const statusFilter =
      document
          .querySelector('#booking-status-filter')
          ?.value || 'all';


  const filtered =
      bookingRecords.filter(
          (booking) => {

            const matchesText =
                `${booking.id} ${booking.farmer}`
                    .toLowerCase()
                    .includes(query);


            const matchesStatus =
                statusFilter === 'all' ||
                booking.status === statusFilter;


            return (
                matchesText &&
                matchesStatus
            );

          }
      );


  if (!filtered.length) {

    bookingTable.tBodies[0].innerHTML = `
            <tr>
                <td colspan="8">
                    No bookings match your search.
                </td>
            </tr>
        `;

    return;
  }


  bookingTable.tBodies[0].innerHTML =
      filtered.map(
          (booking) => `

            <tr data-booking-id="${booking.id}">

                <td data-label="Booking ID">
                    <strong>
                        BK-${booking.id}
                    </strong>
                </td>


                <td data-label="Farmer Name">

                    <strong>
                        ${booking.farmer}
                    </strong>

                    <small>
                        Farmer ID · ${booking.farmerId}
                    </small>

                </td>


                <td data-label="Product/Crop">
                    ${booking.crop}
                </td>


                <td data-label="Booking Date">
                    ${formatDate(booking.date)}
                </td>


                <td data-label="Procurement Slot">
                    ${booking.slot}
                </td>


                <td data-label="Quantity">
                    ${booking.quantity} kg
                </td>


                <td data-label="Booking Status">

                    <span class="admin-status ${statusClass(booking.status)}">
                        ${booking.status}
                    </span>

                </td>


                <td data-label="Actions">

                    <button
                        class="admin-table-action booking-details"
                        type="button"
                    >
                        View Details
                    </button>


                    ${
              booking.status === 'BOOKED'
                  ? `
                                <button
                                    class="admin-table-action booking-approve"
                                    type="button"
                                >
                                    Approve
                                </button>

                                <button
                                    class="admin-table-action booking-reject"
                                    type="button"
                                >
                                    Reject
                                </button>
                            `
                  : ''
          }


                    <button
                        class="admin-table-action booking-update"
                        type="button"
                    >
                        Update Status
                    </button>

                </td>

            </tr>

        `
      ).join('');


  bindBookingActions();
}


/* ================= UPDATE STATUS ================= */

async function updateBookingStatus(
    bookingId,
    newStatus
) {

  try {

    const response =
        await fetch(
            `http://localhost:8080/api/bookings/${bookingId}/status`,
            {
              method: 'PUT',

              headers: {
                'Content-Type':
                    'application/json'
              },

              body: JSON.stringify({
                status: newStatus
              })
            }
        );


    if (!response.ok) {

      throw new Error(
          'Failed to update booking status'
      );

    }


    const booking =
        bookingRecords.find(
            (item) =>
                item.id === bookingId
        );


    if (booking) {
      booking.status = newStatus;
    }


    renderBookings();


    showBookingToast(
        `Booking #${bookingId} status updated to ${newStatus}.`
    );


  } catch (error) {

    console.error(
        'Error updating booking status:',
        error
    );


    showBookingToast(
        'Failed to update booking status.'
    );

  }
}


/* ================= BUTTON ACTIONS ================= */

function bindBookingActions() {


  // View Details
  document
      .querySelectorAll('.booking-details')
      .forEach((button) => {

        button.addEventListener(
            'click',
            () => {

              const row =
                  button.closest('tr');

              const bookingId =
                  Number(
                      row.dataset.bookingId
                  );


              const booking =
                  bookingRecords.find(
                      (item) =>
                          item.id ===
                          bookingId
                  );


              if (!booking) {
                return;
              }


              showBookingToast(
                  `Booking #${booking.id} · ${booking.farmer} · ${booking.crop} · ${booking.quantity} kg · Token #${booking.tokenNumber}`
              );

            }
        );

      });


  // Approve
  document
      .querySelectorAll('.booking-approve')
      .forEach((button) => {

        button.addEventListener(
            'click',
            async () => {

              const row =
                  button.closest('tr');

              const bookingId =
                  Number(
                      row.dataset.bookingId
                  );


              const confirmed =
                  window.confirm(
                      `Approve Booking #${bookingId}?`
                  );


              if (!confirmed) {
                return;
              }


              await updateBookingStatus(
                  bookingId,
                  'WAITING'
              );

            }
        );

      });


  // Reject
  document
      .querySelectorAll('.booking-reject')
      .forEach((button) => {

        button.addEventListener(
            'click',
            async () => {

              const row =
                  button.closest('tr');

              const bookingId =
                  Number(
                      row.dataset.bookingId
                  );


              const confirmed =
                  window.confirm(
                      `Reject Booking #${bookingId}?`
                  );


              if (!confirmed) {
                return;
              }


              await updateBookingStatus(
                  bookingId,
                  'CANCELLED'
              );

            }
        );

      });


  // Update Status
  document
      .querySelectorAll('.booking-update')
      .forEach((button) => {

        button.addEventListener(
            'click',
            async () => {

              const row =
                  button.closest('tr');

              const bookingId =
                  Number(
                      row.dataset.bookingId
                  );


              const booking =
                  bookingRecords.find(
                      (item) =>
                          item.id ===
                          bookingId
                  );


              if (!booking) {
                return;
              }


              const statuses = [
                'BOOKED',
                'WAITING',
                'PROCESSING',
                'COMPLETED',
                'PAID'
              ];


              const currentIndex =
                  statuses.indexOf(
                      booking.status
                  );


              const nextStatus =
                  currentIndex === -1 ||
                  currentIndex ===
                  statuses.length - 1
                      ? 'BOOKED'
                      : statuses[
                      currentIndex + 1
                          ];


              const confirmed =
                  window.confirm(
                      `Change Booking #${bookingId} from ${booking.status} to ${nextStatus}?`
                  );


              if (!confirmed) {
                return;
              }


              await updateBookingStatus(
                  bookingId,
                  nextStatus
              );

            }
        );

      });

}


/* ================= TABLE HEADER ================= */

if (bookingTable) {

  bookingTable.tHead.innerHTML = `
        <tr>
            <th>Booking ID</th>
            <th>Farmer Name</th>
            <th>Product/Crop</th>
            <th>Booking Date</th>
            <th>Procurement Slot</th>
            <th>Quantity</th>
            <th>Booking Status</th>
            <th>Actions</th>
        </tr>
    `;


  const heading =
      bookingTable
          .closest('.admin-page-content')
          ?.querySelector(
              '.admin-section-heading'
          );


  if (heading) {

    const filters =
        document.createElement('div');

    filters.className =
        'admin-page-actions booking-filters';


    filters.innerHTML = `
            <input
                class="admin-search-input"
                id="booking-search"
                type="search"
                placeholder="Search farmer or booking ID"
                aria-label="Search by farmer name or booking ID"
            >

            <select
                class="admin-search-input"
                id="booking-status-filter"
                aria-label="Filter bookings by status"
            >

                <option value="all">
                    All statuses
                </option>

                <option value="BOOKED">
                    BOOKED
                </option>

                <option value="WAITING">
                    WAITING
                </option>

                <option value="PROCESSING">
                    PROCESSING
                </option>

                <option value="COMPLETED">
                    COMPLETED
                </option>

                <option value="PAID">
                    PAID
                </option>

                <option value="CANCELLED">
                    CANCELLED
                </option>

            </select>
        `;


    heading.appendChild(filters);


    filters
        .querySelectorAll(
            'input, select'
        )
        .forEach((control) => {

          control.addEventListener(
              'input',
              renderBookings
          );

        });

  }


  loadBookings();
}