const procurementTable =
    document.querySelector('#procurement-table');

const procurementToast =
    document.querySelector('.admin-toast');

const detailsDialog =
    document.querySelector('#procurement-details-dialog');

const detailsList =
    document.querySelector('#procurement-details-list');


/* ================= DETAILS DIALOG ================= */

detailsDialog?.querySelector('.admin-dialog-close')?.addEventListener(
    'click',
    () => detailsDialog.close()
);


/* =====================================================
   LOAD PROCUREMENT REQUESTS FROM BACKEND
   ===================================================== */

async function loadProcurementRequests() {

    try {

        const response =
            await fetch(
                'http://localhost:8080/api/bookings'
            );


        if (!response.ok) {
            throw new Error(
                'Failed to fetch procurement requests'
            );
        }


        const bookings =
            await response.json();


        console.log(
            'BOOKINGS FROM BACKEND:',
            bookings
        );


        /* ================= LOAD FARMERS ONCE ================= */

        let farmers = [];

        try {

            const farmersResponse =
                await fetch(
                    'http://localhost:8080/api/farmers'
                );


            if (farmersResponse.ok) {
                farmers =
                    await farmersResponse.json();
            }

        } catch (error) {

            console.error(
                'Error loading farmers:',
                error
            );
        }


        /* ================= CREATE REQUEST DATA ================= */

        const requests =
            await Promise.all(

                bookings.map(
                    async (booking) => {

                        /* ================= FARMER ================= */

                        let farmerName =
                            `Farmer ${booking.farmerId}`;


                        const farmer =
                            farmers.find(
                                (item) =>
                                    item.id === booking.farmerId
                            );


                        if (farmer) {
                            farmerName =
                                farmer.name;
                        }


                        /* ================= CENTRE ================= */

                        let centreName =
                            `Centre ${booking.centreId}`;


                        try {

                            const centreResponse =
                                await fetch(
                                    `http://localhost:8080/api/centres/${booking.centreId}`
                                );


                            if (centreResponse.ok) {

                                const centre =
                                    await centreResponse.json();


                                centreName =
                                    centre.name ||
                                    `Centre ${booking.centreId}`;
                            }


                        } catch (error) {

                            console.error(
                                'Error loading centre:',
                                error
                            );
                        }


                        /* ================= RETURN REQUEST ================= */

                        return {

                            id:
                                `BK-${booking.id}`,

                            bookingId:
                            booking.id,

                            farmerId:
                            booking.farmerId,

                            farmer:
                            farmerName,

                            crop:
                            booking.cropName,

                            quantity:
                                `${booking.quantity} kg`,

                            price:
                                '-',

                            centreId:
                            booking.centreId,

                            centre:
                            centreName,

                            date:
                            booking.bookingDate,

                            displayDate:
                                formatProcurementDate(
                                    booking.bookingDate
                                ),

                            status:
                            booking.status,

                            tokenNumber:
                            booking.tokenNumber,

                            slotTime:
                            booking.slotTime
                        };

                    }
                )

            );


        renderProcurementRequests(
            requests
        );


    } catch (error) {

        console.error(
            'Error loading procurement requests:',
            error
        );


        if (procurementTable?.tBodies?.[0]) {

            procurementTable.tBodies[0].innerHTML = `
                <tr>
                    <td colspan="8">
                        Failed to load procurement requests.
                    </td>
                </tr>
            `;
        }
    }
}


/* =====================================================
   FORMAT DATE
   ===================================================== */

function formatProcurementDate(
    dateString
) {

    if (!dateString) {
        return '-';
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return date.toLocaleDateString(
        'en-IN',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }
    );
}


/* =====================================================
   TOAST
   ===================================================== */

function showProcurementToast(
    message
) {

    if (!procurementToast) {
        return;
    }


    procurementToast.textContent =
        message;


    procurementToast.classList.add(
        'show'
    );


    window.setTimeout(
        () =>
            procurementToast.classList.remove(
                'show'
            ),
        2600
    );
}


/* =====================================================
   STATUS CLASS
   ===================================================== */

function procurementStatusClass(
    status
) {

    if (status === 'COMPLETED') {
        return 'completed';
    }


    if (
        status === 'WAITING' ||
        status === 'CANCELLED'
    ) {
        return 'pending';
    }


    if (status === 'PAID') {
        return 'completed';
    }


    return 'confirmed';
}


/* =====================================================
   RENDER PROCUREMENT REQUESTS
   ===================================================== */

function renderProcurementRequests(
    procurementRequests
) {

    if (!procurementTable) {
        return;
    }


    const query =
        document
            .querySelector(
                '#procurement-search'
            )
            ?.value
            .trim()
            .toLowerCase() || '';


    const date =
        document
            .querySelector(
                '#procurement-date'
            )
            ?.value || '';


    const status =
        document
            .querySelector(
                '#procurement-status'
            )
            ?.value || 'all';


    const filtered =
        procurementRequests.filter(
            (request) => {

                const matchesText =
                    `${request.farmer} ${request.crop}`
                        .toLowerCase()
                        .includes(query);


                const matchesDate =
                    !date ||
                    request.date === date;


                const matchesStatus =
                    status === 'all' ||
                    request.status === status;


                return (
                    matchesText &&
                    matchesDate &&
                    matchesStatus
                );

            }
        );


    procurementTable.tBodies[0].innerHTML =
        filtered.length

            ? filtered.map(
                (request) => {

                    const canCancel =
                        request.status !== 'CANCELLED' &&
                        request.status !== 'COMPLETED' &&
                        request.status !== 'PAID';


                    const canChangeStatus =
                        request.status !== 'CANCELLED' &&
                        request.status !== 'COMPLETED' &&
                        request.status !== 'PAID';


                    return `

                        <tr
                            data-request-id="${request.bookingId}"
                        >

                            <td data-label="Request ID">

                                <strong>
                                    BK-${request.bookingId}
                                </strong>

                            </td>


                            <td data-label="Farmer Name">

                                ${request.farmer}

                                <small>
                                    Farmer ID ·
                                    ${request.farmerId}
                                </small>

                            </td>


                            <td data-label="Crop / Product">

                                ${request.crop}

                            </td>


                            <td data-label="Quantity">

                                ${request.quantity}

                            </td>


                            <td data-label="Requested Price">

                                ${request.price}

                            </td>


                            <td data-label="Request Date">

                                ${request.displayDate}

                            </td>


                            <td data-label="Status">

                                <span
                                    class="admin-status ${procurementStatusClass(
                        request.status
                    )}"
                                >
                                    ${request.status}
                                </span>

                            </td>


                            <td data-label="Actions">

                                <button
                                    class="admin-table-action procurement-details"
                                    type="button"
                                >
                                    View Details
                                </button>


                                ${
                        canChangeStatus
                            ? `
                                            <button
                                                class="admin-table-action procurement-update"
                                                type="button"
                                            >
                                                Change Status
                                            </button>
                                        `
                            : ''
                    }


                                ${
                        canCancel
                            ? `
                                            <button
                                                class="admin-table-action procurement-cancel"
                                                type="button"
                                            >
                                                Cancel Booking
                                            </button>
                                        `
                            : ''
                    }

                            </td>

                        </tr>

                    `;

                }
            ).join('')

            : `
                <tr>
                    <td colspan="8">
                        No procurement requests match your filters.
                    </td>
                </tr>
            `;


    bindProcurementActions(
        procurementRequests
    );
}


/* =====================================================
   UPDATE STATUS
   ===================================================== */

async function updateProcurementStatus(
    row,
    status,
    procurementRequests
) {

    const bookingId =
        Number(
            row.dataset.requestId
        );


    const request =
        procurementRequests.find(
            (item) =>
                item.bookingId === bookingId
        );


    if (!request) {
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
                        status: status
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                'Failed to update booking status'
            );
        }


        request.status =
            status;


        renderProcurementRequests(
            procurementRequests
        );


        showProcurementToast(
            `${request.farmer}'s procurement is now ${status}.`
        );


    } catch (error) {

        console.error(
            'Error updating procurement status:',
            error
        );


        showProcurementToast(
            'Failed to update procurement status.'
        );
    }
}


/* =====================================================
   CANCEL BOOKING
   ===================================================== */

async function cancelProcurementBooking(
    row,
    procurementRequests
) {

    const bookingId =
        Number(
            row.dataset.requestId
        );


    const request =
        procurementRequests.find(
            (item) =>
                item.bookingId === bookingId
        );


    if (!request) {
        return;
    }


    const confirmed =
        window.confirm(
            `Are you sure you want to cancel Booking #${bookingId} for ${request.farmer}?`
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
                        status: 'CANCELLED'
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                'Failed to cancel booking'
            );
        }


        request.status =
            'CANCELLED';


        renderProcurementRequests(
            procurementRequests
        );


        showProcurementToast(
            `Booking #${bookingId} has been cancelled.`
        );


    } catch (error) {

        console.error(
            'Error cancelling booking:',
            error
        );


        showProcurementToast(
            'Failed to cancel booking.'
        );
    }
}


/* =====================================================
   BIND BUTTON ACTIONS
   ===================================================== */

function bindProcurementActions(
    procurementRequests
) {


    /* ================= VIEW DETAILS ================= */

    document
        .querySelectorAll(
            '.procurement-details'
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    () => {

                        const row =
                            button.closest('tr');


                        const bookingId =
                            Number(
                                row.dataset.requestId
                            );


                        const request =
                            procurementRequests.find(
                                (item) =>
                                    item.bookingId ===
                                    bookingId
                            );


                        if (
                            !request ||
                            !detailsDialog ||
                            !detailsList
                        ) {
                            return;
                        }


                        detailsList.innerHTML = [

                            [
                                'Booking ID',
                                `#${request.bookingId}`
                            ],

                            [
                                'Token Number',
                                request.tokenNumber
                            ],

                            [
                                'Farmer Name',
                                request.farmer
                            ],

                            [
                                'Farmer ID',
                                request.farmerId
                            ],

                            [
                                'Crop',
                                request.crop
                            ],

                            [
                                'Quantity',
                                request.quantity
                            ],

                            [
                                'Centre',
                                request.centre
                            ],

                            [
                                'Booking Date',
                                request.displayDate
                            ],

                            [
                                'Slot Time',
                                request.slotTime
                            ],

                            [
                                'Current Status',
                                request.status
                            ]

                        ]
                            .map(
                                ([label, value]) => `
                                    <div>
                                        <dt>
                                            ${label}
                                        </dt>

                                        <dd>
                                            ${value}
                                        </dd>
                                    </div>
                                `
                            )
                            .join('');


                        detailsDialog.showModal();

                    }
                );

            }
        );


    /* ================= CHANGE STATUS ================= */

    document
        .querySelectorAll(
            '.procurement-update'
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    async () => {

                        const row =
                            button.closest('tr');


                        const bookingId =
                            Number(
                                row.dataset.requestId
                            );


                        const request =
                            procurementRequests.find(
                                (item) =>
                                    item.bookingId ===
                                    bookingId
                            );


                        if (!request) {
                            return;
                        }


                        let nextStatus;


                        /*
                         * Normal workflow:
                         *
                         * BOOKED
                         *    ↓
                         * WAITING
                         *    ↓
                         * PROCESSING
                         *    ↓
                         * COMPLETED
                         */


                        if (
                            request.status ===
                            'BOOKED'
                        ) {

                            nextStatus =
                                'WAITING';

                        } else if (
                            request.status ===
                            'WAITING'
                        ) {

                            nextStatus =
                                'PROCESSING';

                        } else if (
                            request.status ===
                            'PROCESSING'
                        ) {

                            nextStatus =
                                'COMPLETED';

                        } else {

                            showProcurementToast(
                                'This booking cannot be changed further.'
                            );

                            return;
                        }


                        const confirmed =
                            window.confirm(
                                `Change status from ${request.status} to ${nextStatus}?`
                            );


                        if (!confirmed) {
                            return;
                        }


                        await updateProcurementStatus(
                            row,
                            nextStatus,
                            procurementRequests
                        );

                    }
                );

            }
        );


    /* ================= CANCEL BOOKING ================= */

    document
        .querySelectorAll(
            '.procurement-cancel'
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    async () => {

                        const row =
                            button.closest('tr');


                        await cancelProcurementBooking(
                            row,
                            procurementRequests
                        );

                    }
                );

            }
        );

}


/* =====================================================
   FILTERS
   ===================================================== */

document
    .querySelectorAll(
        '.procurement-filters input, .procurement-filters select'
    )
    .forEach(
        (control) => {

            control.addEventListener(
                'input',
                () => {

                    loadProcurementRequests();

                }
            );

        }
    );


/* =====================================================
   START
   ===================================================== */

loadProcurementRequests();