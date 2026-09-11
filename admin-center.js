const centerBoard =
    document.querySelector('.admin-management-grid');

const centerToast =
    document.querySelector('.admin-toast');


/* ================= LOAD CENTRES ================= */

async function loadCenters() {

    if (!centerBoard) {
        console.error('Center board not found');
        return;
    }

    centerBoard.innerHTML = `
        <p class="admin-empty-state">
            Loading procurement centres...
        </p>
    `;


    try {

        const response =
            await fetch(
                'http://localhost:8080/api/centres'
            );


        if (!response.ok) {
            throw new Error(
                'Failed to load procurement centres'
            );
        }


        const centres =
            await response.json();


        if (!centres.length) {

            centerBoard.innerHTML = `
                <p class="admin-empty-state">
                    No procurement centres found.
                </p>
            `;

            return;
        }


        centerBoard.innerHTML =
            centres.map(
                (centre) => {

                    const isActive =
                        centre.isActive === true;


                    const statusText =
                        isActive
                            ? 'Active'
                            : 'Inactive';


                    const statusClass =
                        isActive
                            ? 'completed'
                            : 'pending';


                    return `

                        <article>

                            <span>⌖</span>

                            <h3>
                                ${centre.name}
                            </h3>

                            <p>
                                ${centre.location}<br>
                                ${centre.openingTime || '-'}
                                –
                                ${centre.closingTime || '-'}
                            </p>


                            <div style="
                                margin: 12px 0;
                            ">

                                <span
                                    class="admin-status ${statusClass}"
                                >
                                    ${statusText}
                                </span>

                            </div>


                            <p>
                                District:
                                ${centre.district || '-'}
                            </p>


                            <p>
                                Contact:
                                ${centre.contactNumber || '-'}
                            </p>


                            <button
                                type="button"
                                class="centre-status-btn"
                                onclick="changeCentreStatus(
                                    ${centre.id},
                                    ${!isActive}
                                )"
                            >
                                ${
                        isActive
                            ? 'Deactivate Centre'
                            : 'Activate Centre'
                    }
                            </button>

                        </article>

                    `;

                }
            ).join('');


    } catch (error) {

        console.error(
            'Error loading centres:',
            error
        );


        centerBoard.innerHTML = `
            <p class="admin-empty-state">
                Failed to load procurement centres.
            </p>
        `;
    }
}


/* ================= CHANGE CENTRE STATUS ================= */

async function changeCentreStatus(
    centreId,
    newStatus
) {

    try {

        const response =
            await fetch(
                `http://localhost:8080/api/centres/${centreId}/status`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        isActive: newStatus
                    })
                }
            );


        if (!response.ok) {
            throw new Error(
                'Failed to update centre status'
            );
        }


        const updatedCentre =
            await response.json();


        const statusText =
            updatedCentre.isActive
                ? 'Active'
                : 'Inactive';


        console.log(
            `${updatedCentre.name} is now ${statusText}`
        );


        /*
         * Reload the centres so the new
         * status and button are displayed.
         */

        await loadCenters();


    } catch (error) {

        console.error(
            'Error updating centre status:',
            error
        );


        alert(
            'Failed to update procurement centre status.'
        );
    }
}


/* ================= START ================= */

loadCenters();