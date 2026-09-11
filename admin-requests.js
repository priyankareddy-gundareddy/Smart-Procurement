const procurementTable = document.querySelector('.admin-requests-table');

// For now, we are using Officer ID 1.
// Officer ID 1 belongs to the Guntur Procurement Centre.
const officerId = 1;


// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


// Format status CSS class
function getStatusClass(status) {

    if (status === 'COMPLETED') {
        return 'completed';
    }

    if (status === 'PAID') {
        return 'completed';
    }

    if (status === 'PROCESSING') {
        return 'confirmed';
    }

    if (status === 'BOOKED') {
        return 'confirmed';
    }

    if (status === 'WAITING') {
        return 'pending';
    }

    if (status === 'CANCELLED') {
        return 'pending';
    }

    return 'confirmed';
}


// Load Officer/Admin queue
async function loadOfficerQueue() {

    if (!procurementTable) {
        console.error('Queue table not found');
        return;
    }

    const tbody = procurementTable.querySelector('tbody');

    tbody.innerHTML = `
        <tr>
            <td colspan="7">
                Loading procurement queue...
            </td>
        </tr>
    `;

    const date = getTodayDate();

    try {

        const response = await fetch(
            `http://localhost:8080/api/officers/${officerId}/queue?date=${date}`
        );

        if (!response.ok) {
            throw new Error('Failed to load officer queue');
        }

        const queue = await response.json();

        console.log('OFFICER QUEUE FROM BACKEND:', queue);


        if (!queue.length) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        No farmers are scheduled in the queue for ${date}.
                    </td>
                </tr>
            `;

            return;
        }


        tbody.innerHTML = queue.map((item) => {

            const statusClass = getStatusClass(item.status);

            return `
                <tr>

                    <td>
                        <strong>#${item.tokenNumber}</strong>
                    </td>

                    <td>
                        <strong>${item.farmerName}</strong>
                        <small>
                            Farmer ID · ${item.farmerId}
                        </small>
                    </td>

                    <td>
                        ${item.cropName}
                    </td>

                    <td>
                        ${item.quantity} kg
                    </td>

                    <td>
                        ${item.centreName}
                    </td>

                    <td>
                        ${item.slotTime}
                    </td>

                    <td>
                        <span class="admin-status ${statusClass}">
                            ${item.status}
                        </span>
                    </td>

                </tr>
            `;

        }).join('');


    } catch (error) {

        console.error(
            'Error loading officer queue:',
            error
        );

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    Failed to load procurement queue.
                </td>
            </tr>
        `;
    }
}


// Load queue when page opens
loadOfficerQueue();