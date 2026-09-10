const procurementTable = document.querySelector('#procurement-table');
const procurementToast = document.querySelector('.admin-toast');
const detailsDialog = document.querySelector('#procurement-details-dialog');
const detailsList = document.querySelector('#procurement-details-list');
detailsDialog?.querySelector('.admin-dialog-close')?.addEventListener('click', () => detailsDialog.close());
document.querySelectorAll('#completed-procurement-table tbody tr').forEach((row) => {
  ['Farmer Name', 'Crop / Product', 'Quantity', 'Final Price', 'Completed Date', 'Details'].forEach((label, index) => row.cells[index]?.setAttribute('data-label', label));
});
const procurementRequests = [
  { id: 'PR-1001', farmer: 'Ravi Kumar', crop: 'Rice', quantity: '500 kg', price: '₹24,500', date: '2026-09-10', displayDate: '10 Sep 2026', status: 'Pending' },
  { id: 'PR-1002', farmer: 'Sita Devi', crop: 'Wheat', quantity: '300 kg', price: '₹18,200', date: '2026-09-10', displayDate: '10 Sep 2026', status: 'Completed' },
  { id: 'PR-1003', farmer: 'Ramesh Rao', crop: 'Rice', quantity: '700 kg', price: '₹33,600', date: '2026-09-11', displayDate: '11 Sep 2026', status: 'Approved' },
  { id: 'PR-1004', farmer: 'Anita Singh', crop: 'Maize', quantity: '400 kg', price: '₹16,800', date: '2026-09-11', displayDate: '11 Sep 2026', status: 'Processing' }
];

function showProcurementToast(message) {
  if (!procurementToast) return;
  procurementToast.textContent = message;
  procurementToast.classList.add('show');
  window.setTimeout(() => procurementToast.classList.remove('show'), 2600);
}

function procurementStatusClass(status) {
  return status === 'Completed' ? 'completed' : status === 'Pending' || status === 'Rejected' ? 'pending' : 'confirmed';
}

function renderProcurementRequests() {
  const query = document.querySelector('#procurement-search')?.value.trim().toLowerCase() || '';
  const date = document.querySelector('#procurement-date')?.value || '';
  const status = document.querySelector('#procurement-status')?.value || 'all';
  const filtered = procurementRequests.filter((request) => {
    const matchesText = `${request.farmer} ${request.crop}`.toLowerCase().includes(query);
    return matchesText && (!date || request.date === date) && (status === 'all' || request.status === status);
  });
  procurementTable.tBodies[0].innerHTML = filtered.length ? filtered.map((request) => `<tr data-request-id="${request.id}"><td data-label="Request ID"><strong>${request.id}</strong></td><td data-label="Farmer Name">${request.farmer}</td><td data-label="Crop / Product">${request.crop}</td><td data-label="Quantity">${request.quantity}</td><td data-label="Requested Price">${request.price}</td><td data-label="Request Date">${request.displayDate}</td><td data-label="Status"><span class="admin-status ${procurementStatusClass(request.status)}">${request.status}</span></td><td data-label="Actions"><button class="admin-table-action procurement-details" type="button">View Details</button> <button class="admin-table-action procurement-approve" type="button" ${request.status !== 'Pending' ? 'hidden' : ''}>Approve</button> <button class="admin-table-action procurement-reject" type="button" ${request.status !== 'Pending' ? 'hidden' : ''}>Reject</button> <button class="admin-table-action procurement-update" type="button">Change Status</button></td></tr>`).join('') : '<tr><td colspan="8">No procurement requests match your filters.</td></tr>';
  bindProcurementActions();
}

function updateProcurementStatus(row, status) {
  const request = procurementRequests.find((item) => item.id === row.dataset.requestId);
  if (!request) return;
  request.status = status;
  renderProcurementRequests();
  showProcurementToast(`${request.farmer}'s procurement is now ${status}.`);
}

function bindProcurementActions() {
  document.querySelectorAll('.procurement-details').forEach((button) => button.addEventListener('click', () => {
    const request = procurementRequests.find((item) => item.id === button.closest('tr').dataset.requestId);
    if (!request || !detailsDialog || !detailsList) return;
    detailsList.innerHTML = [['Request ID', request.id], ['Farmer Name', request.farmer], ['Crop/Product', request.crop], ['Quantity', request.quantity], ['Requested Price', request.price], ['Request Date', request.displayDate], ['Current Status', request.status]].map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    detailsDialog.showModal();
  }));
  document.querySelectorAll('.procurement-approve').forEach((button) => button.addEventListener('click', () => {
    const row = button.closest('tr');
    if (window.confirm('Approve this procurement request?')) updateProcurementStatus(row, 'Approved');
  }));
  document.querySelectorAll('.procurement-reject').forEach((button) => button.addEventListener('click', () => {
    const row = button.closest('tr');
    if (window.confirm('Reject this procurement request?')) updateProcurementStatus(row, 'Rejected');
  }));
  document.querySelectorAll('.procurement-update').forEach((button) => button.addEventListener('click', () => {
    const row = button.closest('tr');
    const request = procurementRequests.find((item) => item.id === row.dataset.requestId);
    const statuses = ['Pending', 'Approved', 'Processing', 'Completed'];
    const nextStatus = statuses[(statuses.indexOf(request.status) + 1) % statuses.length];
    updateProcurementStatus(row, nextStatus);
  }));
}

document.querySelectorAll('.procurement-filters input, .procurement-filters select').forEach((control) => control.addEventListener('input', renderProcurementRequests));
document.querySelectorAll('.procurement-details').forEach((button) => button.addEventListener('click', () => showProcurementToast(`Completed procurement details for ${button.dataset.name}.`)));
renderProcurementRequests();
