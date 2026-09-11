

const notificationBoard =
    document.querySelector('#notification-board');

const notificationToast =
    document.querySelector('.admin-toast');

const readStateKey =
    'smartProcureAdminNotificationRead';

let notifications = [];


/* ================= LOAD BACKEND DATA ================= */

async function loadNotifications() {

  if (!notificationBoard) {
    console.error('Notification board not found');
    return;
  }

  notificationBoard.innerHTML = `
        <p class="admin-empty-state">
            Loading notifications...
        </p>
    `;

  try {

    // Get real bookings
    const bookingsResponse = await fetch(
        'http://localhost:8080/api/bookings'
    );

    if (!bookingsResponse.ok) {
      throw new Error('Failed to load bookings');
    }

    const bookings =
        await bookingsResponse.json();


    // Get real farmers
    const farmersResponse = await fetch(
        'http://localhost:8080/api/farmers'
    );

    const farmers = farmersResponse.ok
        ? await farmersResponse.json()
        : [];


    const readState =
        getReadState();


    notifications = bookings.map((booking) => {

      const farmer =
          farmers.find(
              (farmer) =>
                  farmer.id === booking.farmerId
          );


      const farmerName =
          farmer
              ? farmer.name
              : `Farmer ${booking.farmerId}`;


      let title =
          'New procurement request';

      let icon =
          '▤';

      let message =
          `${farmerName} submitted a ${booking.cropName} request for ${booking.quantity} kg.`;


      /* Status-based notification */

      if (booking.status === 'PROCESSING') {

        title =
            'Procurement in progress';

        icon =
            '◷';

        message =
            `Booking #${booking.id} for ${farmerName} is currently being processed.`;

      }

      else if (booking.status === 'COMPLETED') {

        title =
            'Procurement completed';

        icon =
            '✓';

        message =
            `Procurement for ${farmerName} has been completed.`;

      }

      else if (booking.status === 'PAID') {

        title =
            'Payment completed';

        icon =
            '₹';

        message =
            `Payment for Booking #${booking.id} for ${farmerName} has been marked as paid.`;

      }

      else if (booking.status === 'WAITING') {

        title =
            'Booking waiting';

        icon =
            '◷';

        message =
            `Booking #${booking.id} for ${farmerName} is waiting in the procurement queue.`;

      }

      else if (booking.status === 'CANCELLED') {

        title =
            'Booking cancelled';

        icon =
            '×';

        message =
            `Booking #${booking.id} for ${farmerName} has been cancelled.`;

      }


      const notificationId =
          `booking-${booking.id}`;


      return {

        id: notificationId,

        icon: icon,

        title: title,

        message: message,

        time:
            formatDate(
                booking.bookingDate
            ),

        read:
            readState[notificationId] === true

      };

    });


    // Show newest bookings first
    notifications.reverse();


    renderNotifications();


  } catch (error) {

    console.error(
        'Error loading notifications:',
        error
    );

    notificationBoard.innerHTML = `
            <p class="admin-empty-state">
                Failed to load notifications.
            </p>
        `;
  }
}


/* ================= READ STATE ================= */

function getReadState() {

  try {

    return JSON.parse(
        localStorage.getItem(readStateKey)
        || '{}'
    );

  } catch (error) {

    return {};

  }
}


function saveReadState(state) {

  localStorage.setItem(
      readStateKey,
      JSON.stringify(state)
  );

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


/* ================= TOAST ================= */

function showNotificationToast(message) {

  if (!notificationToast) {
    return;
  }

  notificationToast.textContent =
      message;

  notificationToast.classList.add(
      'show'
  );

  window.setTimeout(() => {

    notificationToast.classList.remove(
        'show'
    );

  }, 2400);

}


/* ================= RENDER ================= */

function renderNotifications() {

  if (!notificationBoard) {
    return;
  }


  notificationBoard.innerHTML =
      notifications.length

          ? notifications.map(
              (notification) => `

                <article
                    class="notification-card ${notification.read ? '' : 'unread'}"
                    data-notification-id="${notification.id}"
                >

                    <span class="notification-card-icon">
                        ${notification.icon}
                    </span>


                    <div class="notification-card-content">

                        <strong>
                            ${notification.title}
                        </strong>

                        <small>
                            ${notification.message}
                        </small>

                        <small>
                            ${notification.time}
                        </small>

                    </div>


                    <div class="notification-card-actions">

                        <button
                            type="button"
                            class="notification-read-button"
                        >
                            ${notification.read
                  ? 'Mark Unread'
                  : 'Mark Read'}
                        </button>


                        <button
                            type="button"
                            class="notification-delete-button"
                        >
                            Delete
                        </button>

                    </div>

                </article>

            `
          ).join('')

          : `
                <p class="admin-empty-state">
                    No notifications available.
                </p>
            `;


  bindNotificationActions();


  window.updateNotificationBadges?.();

}


/* ================= BUTTON ACTIONS ================= */

function bindNotificationActions() {

  document
      .querySelectorAll(
          '.notification-read-button'
      )
      .forEach((button) => {

        button.addEventListener(
            'click',
            () => {

              const card =
                  button.closest(
                      '.notification-card'
                  );

              const id =
                  card.dataset.notificationId;

              toggleRead(id);

            }
        );

      });


  document
      .querySelectorAll(
          '.notification-delete-button'
      )
      .forEach((button) => {

        button.addEventListener(
            'click',
            () => {

              const card =
                  button.closest(
                      '.notification-card'
                  );

              const id =
                  card.dataset.notificationId;

              deleteNotification(id);

            }
        );

      });

}


/* ================= MARK READ ================= */

function toggleRead(id) {

  const readState =
      getReadState();

  const notification =
      notifications.find(
          (item) => item.id === id
      );

  if (!notification) {
    return;
  }


  notification.read =
      !notification.read;


  readState[id] =
      notification.read;


  saveReadState(readState);

  renderNotifications();

}


/* ================= DELETE ================= */

function deleteNotification(id) {

  notifications =
      notifications.filter(
          (notification) =>
              notification.id !== id
      );


  renderNotifications();

  showNotificationToast(
      'Notification deleted.'
  );

}


/* ================= MARK ALL READ ================= */

document
    .querySelector('#mark-all-read')
    ?.addEventListener(
        'click',
        () => {

          const readState =
              getReadState();


          notifications.forEach(
              (notification) => {

                notification.read = true;

                readState[
                    notification.id
                    ] = true;

              }
          );


          saveReadState(readState);

          renderNotifications();

          showNotificationToast(
              'All notifications marked as read.'
          );

        }
    );


/* ================= START ================= */

loadNotifications();