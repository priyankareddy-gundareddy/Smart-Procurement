const paymentsTable = document.querySelector('.admin-requests-table');
const paymentToast = document.querySelector('.admin-toast');

const pendingPaymentCount =
    document.querySelector('#pending-payment-count');

const completedPaymentCount =
    document.querySelector('#completed-payment-count');

const totalPaidAmount =
    document.querySelector('#total-paid-amount');

let paymentRecords = [];


async function loadPayments() {

    if (!paymentsTable) {
        console.error('Payments table not found');
        return;
    }

    const tbody = paymentsTable.querySelector('tbody');

    tbody.innerHTML = `
        <tr>
            <td colspan="6">
                Loading payment records...
            </td>
        </tr>
    `;

    try {

        // Get all bookings from backend
        const bookingsResponse = await fetch(
            'http://localhost:8080/api/bookings'
        );

        if (!bookingsResponse.ok) {
            throw new Error('Failed to load bookings');
        }

        const bookings = await bookingsResponse.json();


        // Get all farmers from backend
        const farmersResponse = await fetch(
            'http://localhost:8080/api/farmers'
        );

        const farmers = farmersResponse.ok
            ? await farmersResponse.json()
            : [];


        // Convert bookings into payment records
        paymentRecords = bookings.map((booking) => {

            const farmer = farmers.find(
                (item) => item.id === booking.farmerId
            );

            const farmerName = farmer
                ? farmer.name
                : `Farmer ${booking.farmerId}`;


            let paymentStatus = 'Pending';

            if (booking.status === 'PAID') {
                paymentStatus = 'Completed';
            }


            return {

                bookingId: booking.id,

                farmerId: booking.farmerId,

                farmerName: farmerName,

                crop: booking.cropName,

                quantity: booking.quantity,

                date: booking.bookingDate,

                status: booking.status,

                paymentStatus: paymentStatus

            };

        });


        updatePaymentSummary();

        renderPayments();


    } catch (error) {

        console.error(
            'Error loading payments:',
            error
        );

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    Failed to load payment records.
                </td>
            </tr>
        `;
    }
}


/* ================= PAYMENT SUMMARY ================= */

function updatePaymentSummary() {

    const completedPayments =
        paymentRecords.filter(
            (payment) =>
                payment.paymentStatus === 'Completed'
        ).length;


    const pendingPayments =
        paymentRecords.filter(
            (payment) =>
                payment.paymentStatus === 'Pending'
        ).length;


    if (pendingPaymentCount) {

        pendingPaymentCount.textContent =
            pendingPayments;

    }


    if (completedPaymentCount) {

        completedPaymentCount.textContent =
            completedPayments;

    }


    /*
     * Amount is not available in the current
     * bookings table, so we do not create
     * a fake amount.
     */
    if (totalPaidAmount) {

        totalPaidAmount.textContent = '-';

    }
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

function getPaymentStatusClass(status) {

    if (status === 'Completed') {
        return 'completed';
    }

    return 'pending';
}


/* ================= RENDER PAYMENTS ================= */

function renderPayments() {

    if (!paymentsTable) {
        return;
    }

    const tbody =
        paymentsTable.querySelector('tbody');


    if (!paymentRecords.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    No payment records found.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML = paymentRecords.map(
        (payment) => {

            const statusClass =
                getPaymentStatusClass(
                    payment.paymentStatus
                );


            const actionText =
                payment.paymentStatus === 'Completed'
                    ? 'View'
                    : 'Mark Paid';


            return `
                <tr data-booking-id="${payment.bookingId}">

                    <td>
                        <strong>
                            ${payment.farmerName}
                        </strong>

                        <small>
                            Farmer ID · ${payment.farmerId}
                        </small>
                    </td>


                    <td>
                        ${payment.crop} ·
                        ${payment.quantity} kg
                    </td>


                    <td>
                        -
                    </td>


                    <td>
                        ${formatDate(payment.date)}
                    </td>


                    <td>
                        <span class="admin-status ${statusClass}">
                            ${payment.paymentStatus}
                        </span>
                    </td>


                    <td>
                        <button
                            class="admin-table-action payment-action"
                            type="button"
                        >
                            ${actionText}
                        </button>
                    </td>

                </tr>
            `;

        }
    ).join('');


    bindPaymentActions();
}


/* ================= TOAST ================= */

function showPaymentToast(message) {

    if (!paymentToast) {
        return;
    }

    paymentToast.textContent = message;

    paymentToast.classList.add('show');


    window.setTimeout(() => {

        paymentToast.classList.remove('show');

    }, 2600);
}


/* ================= PAYMENT ACTION ================= */

function bindPaymentActions() {

    document
        .querySelectorAll('.payment-action')
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


                    const payment =
                        paymentRecords.find(
                            (item) =>
                                item.bookingId ===
                                bookingId
                        );


                    if (!payment) {
                        return;
                    }


                    // Already paid
                    if (
                        payment.paymentStatus ===
                        'Completed'
                    ) {

                        showPaymentToast(
                            `Booking #${bookingId} is already marked as PAID.`
                        );

                        return;
                    }


                    const confirmed =
                        window.confirm(
                            `Mark Booking #${bookingId} as PAID?`
                        );


                    if (!confirmed) {
                        return;
                    }


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
                                        status: 'PAID'
                                    })
                                }
                            );


                        if (!response.ok) {

                            throw new Error(
                                'Failed to update payment status'
                            );

                        }


                        // Update frontend data
                        payment.status = 'PAID';

                        payment.paymentStatus =
                            'Completed';


                        // Update summary
                        updatePaymentSummary();


                        // Update table
                        renderPayments();


                        showPaymentToast(
                            `Booking #${bookingId} payment marked as PAID.`
                        );


                    } catch (error) {

                        console.error(
                            'Error updating payment:',
                            error
                        );


                        showPaymentToast(
                            'Failed to update payment status.'
                        );
                    }

                }
            );

        });
}


/* ================= START ================= */

loadPayments();