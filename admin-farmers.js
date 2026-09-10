const farmerSearch = document.getElementById('farmer-search');
const farmerRows = [...document.querySelectorAll('#farmers-table tbody tr')];
const farmerEmptyState = document.getElementById('farmer-empty-state');
const farmerToast = document.querySelector('.admin-toast');

function showFarmerToast(message) {
  if (!farmerToast) return;
  farmerToast.textContent = message;
  farmerToast.classList.add('show');
  window.setTimeout(() => farmerToast.classList.remove('show'), 2600);
}

farmerSearch?.addEventListener('input', () => {
  const query = farmerSearch.value.trim().toLowerCase().replace(/\D/g, '') || farmerSearch.value.trim().toLowerCase();
  let visibleRows = 0;
  farmerRows.forEach((row) => {
    const matches = row.dataset.farmer.includes(query);
    row.hidden = !matches;
    if (matches) visibleRows += 1;
  });
  if (farmerEmptyState) farmerEmptyState.hidden = visibleRows !== 0;
});

document.querySelectorAll('.farmer-details').forEach((button) => {
  button.addEventListener('click', () => showFarmerToast(`${button.dataset.name}'s farmer details are available in the frontend demo.`));
});

document.querySelectorAll('.farmer-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const status = button.closest('tr').querySelector('.admin-status');
    const isActive = status.textContent.trim() === 'Active';
    status.textContent = isActive ? 'Inactive' : 'Active';
    status.className = `admin-status ${isActive ? 'pending' : 'completed'}`;
    button.textContent = isActive ? 'Activate' : 'Deactivate';
    showFarmerToast(`Farmer account ${isActive ? 'deactivated' : 'activated'}.`);
  });
});
