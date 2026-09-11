const farmerTable =
    document.querySelector('#farmers-table');

const farmerSearch =
    document.getElementById('farmer-search');

const farmerEmptyState =
    document.getElementById('farmer-empty-state');

const farmerToast =
    document.querySelector('.admin-toast');

let farmers = [];


/* ================= TOAST ================= */

function showFarmerToast(message) {

  if (!farmerToast) {
    return;
  }

  farmerToast.textContent = message;

  farmerToast.classList.add('show');

  window.setTimeout(() => {
    farmerToast.classList.remove('show');
  }, 2600);
}


/* ================= LOAD FARMERS ================= */

async function loadFarmers() {

  if (!farmerTable) {
    console.error('Farmers table not found');
    return;
  }

  const tbody =
      farmerTable.querySelector('tbody');


  tbody.innerHTML = `
        <tr>
            <td colspan="7">
                Loading farmers...
            </td>
        </tr>
    `;


  try {

    const response =
        await fetch(
            'http://localhost:8080/api/farmers'
        );


    if (!response.ok) {
      throw new Error(
          'Failed to load farmers'
      );
    }


    farmers =
        await response.json();


    renderFarmers();


  } catch (error) {

    console.error(
        'Error loading farmers:',
        error
    );


    tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    Failed to load farmers.
                </td>
            </tr>
        `;

  }
}


/* ================= RENDER FARMERS ================= */

function renderFarmers() {

  if (!farmerTable) {
    return;
  }


  const tbody =
      farmerTable.querySelector('tbody');


  const query =
      farmerSearch?.value
          .trim()
          .toLowerCase() || '';


  const filtered =
      farmers.filter((farmer) => {

        return `
                ${farmer.id}
                ${farmer.name}
                ${farmer.phone}
                ${farmer.state}
                ${farmer.district}
            `
            .toLowerCase()
            .includes(query);

      });


  if (!filtered.length) {

    tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    No farmers found.
                </td>
            </tr>
        `;


    if (farmerEmptyState) {
      farmerEmptyState.hidden = false;
    }


    return;
  }


  if (farmerEmptyState) {
    farmerEmptyState.hidden = true;
  }


  tbody.innerHTML =
      filtered.map(
          (farmer) => `

            <tr data-farmer-id="${farmer.id}">

                <td data-label="Farmer ID">
                    <strong>
                        ${farmer.id}
                    </strong>
                </td>


                <td data-label="Farmer Name">

                    <strong>
                        ${farmer.name}
                    </strong>

                </td>


                <td data-label="Phone">
                    ${farmer.phone}
                </td>


                <td data-label="State">
                    ${farmer.state || '-'}
                </td>


                <td data-label="District">
                    ${farmer.district || '-'}
                </td>


                <td data-label="Status">

                    <span class="admin-status completed">
                        Active
                    </span>

                </td>


                <td data-label="Actions">

                    <button
                        class="admin-table-action farmer-details"
                        type="button"
                    >
                        View Details
                    </button>

                </td>

            </tr>

        `
      ).join('');


  bindFarmerActions();
}


/* ================= ACTIONS ================= */

function bindFarmerActions() {

  document
      .querySelectorAll('.farmer-details')
      .forEach((button) => {

        button.addEventListener(
            'click',
            () => {

              const row =
                  button.closest('tr');

              const farmerId =
                  Number(
                      row.dataset.farmerId
                  );


              const farmer =
                  farmers.find(
                      (item) =>
                          item.id ===
                          farmerId
                  );


              if (!farmer) {
                return;
              }


              showFarmerToast(
                  `${farmer.name} · ${farmer.phone} · ${farmer.district || 'District not available'}`
              );

            }
        );

      });

}


/* ================= SEARCH ================= */

farmerSearch?.addEventListener(
    'input',
    renderFarmers
);


/* ================= START ================= */

loadFarmers();