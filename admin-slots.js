const slotsKey = 'smartProcureSlots';
const slotsTable = document.querySelector('#slots-table');
const slotDialog = document.querySelector('#slot-dialog');
const slotToast = document.querySelector('.admin-toast');
const defaultSlots = [
  { id: 'slot-1', date: '2026-09-10', start: '10:00', end: '11:00', capacity: 24, booked: 18, active: true },
  { id: 'slot-2', date: '2026-09-10', start: '11:30', end: '12:30', capacity: 20, booked: 20, active: true },
  { id: 'slot-3', date: '2026-09-11', start: '09:00', end: '10:00', capacity: 30, booked: 0, active: false },
  { id: 'slot-4', date: '2026-09-12', start: '14:00', end: '15:00', capacity: 25, booked: 5, active: true }
];

function getSlots() {
  try {
    const stored = JSON.parse(localStorage.getItem(slotsKey) || 'null');
    if (Array.isArray(stored)) return stored;
  } catch (error) { /* Use demo slots. */ }
  localStorage.setItem(slotsKey, JSON.stringify(defaultSlots));
  return [...defaultSlots];
}
function saveSlots(slots) { localStorage.setItem(slotsKey, JSON.stringify(slots)); }
function showSlotToast(message) { if (!slotToast) return; slotToast.textContent = message; slotToast.classList.add('show'); window.setTimeout(() => slotToast.classList.remove('show'), 2400); }
function formatDate(value) { return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
function formatTime(value) { const [hours, minutes] = value.split(':'); const date = new Date(2000, 0, 1, Number(hours), Number(minutes)); return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
function getStatus(slot) { if (!slot.active) return 'Inactive'; if (slot.booked >= slot.capacity) return 'Full'; if (slot.date < '2026-09-10') return 'Completed'; return 'Available'; }
function statusClass(status) { return status === 'Available' ? 'completed' : status === 'Full' ? 'pending' : status === 'Inactive' ? 'pending' : 'confirmed'; }
function renderSlots() {
  const date = document.querySelector('#slot-date-filter').value;
  const status = document.querySelector('#slot-status-filter').value;
  const slots = getSlots().filter((slot) => (!date || slot.date === date) && (status === 'all' || getStatus(slot) === status));
  slotsTable.tBodies[0].innerHTML = slots.length ? slots.map((slot) => { const currentStatus = getStatus(slot); return `<tr data-slot-id="${slot.id}"><td data-label="Date">${formatDate(slot.date)}</td><td data-label="Start Time">${formatTime(slot.start)}</td><td data-label="End Time">${formatTime(slot.end)}</td><td data-label="Maximum Capacity">${slot.capacity}</td><td data-label="Booked Count">${slot.booked}</td><td data-label="Status"><span class="admin-status ${statusClass(currentStatus)}">${currentStatus}</span></td><td data-label="Actions"><button class="admin-table-action edit-slot" type="button">Edit</button> <button class="admin-table-action delete-slot" type="button">Delete</button> <button class="admin-table-action toggle-slot" type="button">${slot.active ? 'Deactivate' : 'Activate'}</button></td></tr>`; }).join('') : '<tr><td colspan="7">No slots match your filters.</td></tr>';
  bindSlotActions();
}
function bindSlotActions() {
  document.querySelectorAll('.edit-slot').forEach((button) => button.addEventListener('click', () => openSlotDialog(button.closest('tr').dataset.slotId)));
  document.querySelectorAll('.delete-slot').forEach((button) => button.addEventListener('click', () => { const id = button.closest('tr').dataset.slotId; if (!window.confirm('Delete this procurement slot?')) return; saveSlots(getSlots().filter((slot) => slot.id !== id)); renderSlots(); showSlotToast('Slot deleted.'); }));
  document.querySelectorAll('.toggle-slot').forEach((button) => button.addEventListener('click', () => { const slots = getSlots(); const slot = slots.find((item) => item.id === button.closest('tr').dataset.slotId); slot.active = !slot.active; saveSlots(slots); renderSlots(); showSlotToast(`Slot ${slot.active ? 'activated' : 'deactivated'}.`); }));
}
function openSlotDialog(id = '') { const slot = getSlots().find((item) => item.id === id); document.querySelector('#slot-dialog-title').textContent = slot ? 'Edit Slot' : 'Add Slot'; document.querySelector('#slot-id').value = slot?.id || ''; document.querySelector('#slot-date').value = slot?.date || ''; document.querySelector('#slot-start').value = slot?.start || ''; document.querySelector('#slot-end').value = slot?.end || ''; document.querySelector('#slot-capacity').value = slot?.capacity || ''; slotDialog.showModal(); }
document.querySelector('#add-slot').addEventListener('click', () => openSlotDialog());
document.querySelector('#save-slot').addEventListener('click', () => { const form = document.querySelector('#slot-form'); if (!form.reportValidity()) return; const slots = getSlots(); const id = document.querySelector('#slot-id').value || `slot-${Date.now()}`; const existing = slots.find((slot) => slot.id === id); const values = { id, date: document.querySelector('#slot-date').value, start: document.querySelector('#slot-start').value, end: document.querySelector('#slot-end').value, capacity: Number(document.querySelector('#slot-capacity').value), booked: existing?.booked || 0, active: existing?.active ?? true }; if (existing) Object.assign(existing, values); else slots.push(values); saveSlots(slots); slotDialog.close(); renderSlots(); showSlotToast(existing ? 'Slot updated.' : 'Slot added.'); });
document.querySelector('#slot-date-filter').addEventListener('input', renderSlots); document.querySelector('#slot-status-filter').addEventListener('change', renderSlots); renderSlots();
