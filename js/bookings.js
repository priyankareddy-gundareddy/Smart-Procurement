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


async function loadBookings() {

  console.log("NEW BACKEND BOOKINGS.JS IS RUNNING");

  if (!bookingsList) return;


  // --------------------------------
  // GET LOGGED-IN FARMER
  // --------------------------------

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


  console.log("Current farmer:", farmer);


  // --------------------------------
  // CHECK LOGIN
  // --------------------------------

  if (!farmer || !farmer.id) {

    bookingsList.innerHTML = `
      <div class="empty-bookings">

        <h3>Please login</h3>

        <p>
          Please login to view your bookings.
        </p>

      </div>
    `;

    return;
  }


  // --------------------------------
  // LOADING
  // --------------------------------

  bookingsList.innerHTML = `
    <div class="empty-bookings">

      <p>
        Loading bookings...
      </p>

    </div>
  `;


  try {


    // --------------------------------
    // GET FARMER BOOKINGS FROM BACKEND
    // --------------------------------

    const response = await fetch(
        `http://localhost:8080/api/bookings/farmer/${farmer.id}`
    );


    console.log(
        "Bookings API status:",
        response.status
    );


    if (!response.ok) {

      throw new Error(
          'Failed to load bookings'
      );
    }


    const bookings = await response.json();


    console.log(
        "Bookings from backend:",
        bookings
    );


    // --------------------------------
    // NO BOOKINGS
    // --------------------------------

    if (!bookings.length) {

      bookingsList.innerHTML = `
        <div class="empty-bookings">

          <h3>
            No bookings yet
          </h3>

          <p>
            Your booked procurement slots will appear here after confirmation.
          </p>

        </div>
      `;

      return;
    }


    // --------------------------------
    // GET CENTRE NAMES
    // --------------------------------

    const centreCache = {};


    const bookingsWithCentreNames =
        await Promise.all(

            bookings.map(
                async (booking) => {


                  if (!centreCache[booking.centreId]) {

                    const centreResponse =
                        await fetch(
                            `http://localhost:8080/api/centres/${booking.centreId}`
                        );


                    if (centreResponse.ok) {

                      centreCache[booking.centreId] =
                          await centreResponse.json();

                    }

                  }


                  return {

                    ...booking,

                    centreName:
                        centreCache[booking.centreId]?.name ||
                        `Procurement Centre ${booking.centreId}`

                  };

                }
            )

        );


    // --------------------------------
    // DISPLAY BOOKINGS
    // --------------------------------

    bookingsList.innerHTML =
        bookingsWithCentreNames.map(
            (booking, index) => {

              return `

            <article class="booking-item">


              <div class="booking-item-top">


                <span class="booking-id">

                  Booking ${index + 1}

                </span>


                <span class="booking-status">

                  ${booking.status || 'BOOKED'}

                </span>


              </div>


              <h3>

                ${booking.centreName}

              </h3>


              <div class="booking-meta-grid">


                <div>

                  <small>
                    Booking ID
                  </small>

                  <strong>
                    #${booking.id}
                  </strong>

                </div>


                <div>

                  <small>
                    Date
                  </small>

                  <strong>

                    ${formatBookingDate(
                  booking.bookingDate
              )}

                  </strong>

                </div>


                <div>

                  <small>
                    Time
                  </small>

                  <strong>

                    ${booking.slotTime ||
              'Not selected'}

                  </strong>

                </div>


                <div>

                  <small>
                    Crop
                  </small>

                  <strong>

                    ${booking.cropName || '—'}

                  </strong>

                </div>


                <div>

                  <small>
                    Quantity
                  </small>

                  <strong>

                    ${
                  booking.quantity != null
                      ? `${booking.quantity} kg`
                      : '—'
              }

                  </strong>

                </div>


                <div>

                  <small>
                    Token Number
                  </small>

                  <strong>

                    ${booking.tokenNumber || '—'}

                  </strong>

                </div>


              </div>


            </article>

          `;

            }
        ).join('');


  } catch (error) {


    console.error(
        'Could not load bookings:',
        error
    );


    bookingsList.innerHTML = `

      <div class="empty-bookings">

        <h3>
          Unable to load bookings
        </h3>

        <p>
          Make sure Spring Boot is running on port 8080.
        </p>

      </div>

    `;

  }

}


// --------------------------------
// START
// --------------------------------

loadBookings();