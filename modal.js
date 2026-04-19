const STORAGE_KEY = 'ft_transactions';

/* Holds the id of the transaction waiting to be deleted. */
let pendingDeleteId = null;

function getTransactions() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/* Writes the full array back to localStorage as JSON. */
function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

/* Appends a new transaction object to the stored list.*/
function addTransaction(transaction) {
  const all = getTransactions();
  all.push(transaction);
  saveTransactions(all);
}

/* Finds the transaction with the matching id and replaces it.*/
function updateTransaction(updated) {
  const all = getTransactions().map(t => t.id === updated.id ? updated : t);
  saveTransactions(all);
}

/* Removes the transaction with the given id from the list.*/
function deleteTransaction(id) {
  const remaining = getTransactions().filter(t => t.id !== id);
  saveTransactions(remaining);
}

/* Creates a unique numeric id using the current timestamp. */
function generateId() {
  return Date.now();
}

/* Shows the category dropdown only when "Expense" is selected. */
function toggleCategoryField() {
  const isExpense = $('input[name="type"]:checked').val() === 'expense';

  if (isExpense) {
    $('#category-group').show();
  } else {
    /* Hide the dropdown and reset its value so no stale */
    $('#category-group').hide();
    $('#field-category').val('');
  }
}

/* Resets the form to blank, sets the title to "Add Transaction", and shows the modal. */
function openAddModal() {
  $('#transaction-form')[0].reset();
  $('#field-id').val('');
  $('#field-date').val(getTodayISO());
  $('#modal-title').text('Add Transaction');
  toggleCategoryField();
  $('#modal-overlay').removeClass('hidden');
}

/* Looks up the transaction by id, fills the form with its values, and shows the modal in edit mode. */
function openEditModal(id) {
  const t = getTransactions().find(t => t.id === id);
  if (!t) return;

  /* Fill every form field with the existing values */
  $('#field-id').val(t.id);
  $('#field-date').val(t.date);
  $('#field-description').val(t.description);
  $('#field-amount').val(t.amount);
  $(`input[name="type"][value="${t.type}"]`).prop('checked', true);
  $('#field-category').val(t.category || '');

  $('#modal-title').text('Edit Transaction');

  /* Show or hide the category field to match the saved type */
  toggleCategoryField();

  $('#modal-overlay').removeClass('hidden');
}

/* Hides the Add/Edit modal. */
function closeModal() {
  $('#modal-overlay').addClass('hidden');
}

/* Reads the form, validates it, then either adds a new transaction or updates an existing one. Closes the modal
   and re-renders the table when done. */
function saveTransaction() {
  const date        = $('#field-date').val();
  const description = $('#field-description').val().trim();
  const amount      = parseFloat($('#field-amount').val());
  const type        = $('input[name="type"]:checked').val();
  const category    = type === 'expense' ? $('#field-category').val() : 'Income';

  /* Validate required fields.
     Category is only required when the type is Expense. */
  if (!date || !description || !amount || amount <= 0) {
    alert('Please fill in all fields with valid values.');
    return;
  }

  if (type === 'expense' && !category) {
    alert('Please select a category for this expense.');
    return;
  }

  const existingId = $('#field-id').val();

  const transaction = {
    id: existingId ? parseInt(existingId) : generateId(),
    date,
    description,
    amount,
    type,
    category
  };

  if (existingId) {
    updateTransaction(transaction); /* edit mode */
  } else {
    addTransaction(transaction);    /* add mode  */
  }

  closeModal();
  renderAll();
}

/* Stores the target id and shows the confirm dialog. */
function openDeleteConfirm(id) {
  pendingDeleteId = id;
  $('#confirm-overlay').removeClass('hidden');
}

/* Hides the confirm dialog and clears the pending id. */
function closeDeleteConfirm() {
  pendingDeleteId = null;
  $('#confirm-overlay').addClass('hidden');
}

/* Deletes the pending transaction and refreshes the UI. */
function confirmDelete() {
  if (pendingDeleteId === null) return;
  deleteTransaction(pendingDeleteId);
  closeDeleteConfirm();
  renderAll();
}

/* Returns today's date as "YYYY-MM-DD" for the date input. */
function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}


$(document).ready(function () {

  /* Initial render on page load */
  renderAll();

  /* Open the Add modal */
  $('#btn-open-add').on('click', openAddModal);

  /* Close the modal via X or Cancel */
  $('#btn-close-modal, #btn-cancel').on('click', closeModal);

  /* Close modal when clicking the dark backdrop */
  $('#modal-overlay').on('click', function (e) {
    if ($(e.target).is('#modal-overlay')) closeModal();
  });

  /* Show/hide the category field whenever the type radio changes */
  $('input[name="type"]').on('change', toggleCategoryField);

  /* Save the form (add or edit) */
  $('#transaction-form').on('submit', function (e) {
    e.preventDefault();
    saveTransaction();
  });

  /* Edit button — delegated because rows are dynamic */
  $('#transaction-body').on('click', '.btn-edit', function () {
    openEditModal(parseInt($(this).data('id')));
  });

  /* Delete button — delegated */
  $('#transaction-body').on('click', '.btn-delete', function () {
    openDeleteConfirm(parseInt($(this).data('id')));
  });

  /* Delete confirmation buttons */
  $('#btn-cancel-delete').on('click', closeDeleteConfirm);
  $('#btn-confirm-delete').on('click', confirmDelete);

  /* Close modals with the Escape key */
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); closeDeleteConfirm(); }
  });

});