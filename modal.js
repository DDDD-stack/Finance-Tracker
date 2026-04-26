/* modal.js – modal logic and all event bindings */

let pendingDeleteId = null;

/* --- Transaction Modal --- */

function toggleCategoryField() {
  const isExpense = $('input[name="type"]:checked').val() === 'expense';
  if (isExpense) {
    $('#category-group').show();
  } else {
    $('#category-group').hide();
    $('#field-category').val('');
  }
}

function openAddModal() {
  $('#transaction-form')[0].reset();
  $('#field-id').val('');
  $('#field-date').val(getTodayISO());
  $('#modal-title').text('Add Transaction');
  toggleCategoryField();
  $('#modal-overlay').removeClass('hidden');
}

function openEditModal(id) {
  const t = getTransactions().find(t => t.id === id);
  if (!t) return;

  $('#field-id').val(t.id);
  $('#field-date').val(t.date);
  $('#field-description').val(t.description);
  $('#field-amount').val(t.amount);
  $(`input[name="type"][value="${t.type}"]`).prop('checked', true);
  $('#field-category').val(t.category || '');
  $('#modal-title').text('Edit Transaction');
  toggleCategoryField();
  $('#modal-overlay').removeClass('hidden');
}

function closeModal() {
  $('#modal-overlay').addClass('hidden');
}

function saveTransaction() {
  const date        = $('#field-date').val();
  const description = $('#field-description').val().trim();
  const amount      = parseFloat($('#field-amount').val());
  const type        = $('input[name="type"]:checked').val();
  const category    = type === 'expense' ? $('#field-category').val() : 'Income';

  if (!date || !description || !amount || amount <= 0) {
    alert('Please fill in all fields with valid values.');
    return;
  }

  if (type === 'expense' && !category) {
    alert('Please select a category for this expense.');
    return;
  }

  const existingId  = $('#field-id').val();
  const transaction = {
    id: existingId ? parseInt(existingId) : generateId(),
    date, description, amount, type, category
  };

  existingId ? updateTransaction(transaction) : addTransaction(transaction);

  closeModal();
  renderAll();
}

/* --- Delete Confirm --- */

function openDeleteConfirm(id) {
  pendingDeleteId = id;
  $('#confirm-overlay').removeClass('hidden');
}

function closeDeleteConfirm() {
  pendingDeleteId = null;
  $('#confirm-overlay').addClass('hidden');
}

function confirmDelete() {
  if (pendingDeleteId === null) return;
  deleteTransaction(pendingDeleteId);
  closeDeleteConfirm();
  renderAll();
}

/* --- Event Bindings --- */

$(document).ready(function () {
  renderAll();

  /* Header */
  $('#btn-open-add').on('click', openAddModal);

  /* Transaction modal */
  $('#btn-close-modal, #btn-cancel').on('click', closeModal);
  $('#modal-overlay').on('click', function (e) {
    if ($(e.target).is('#modal-overlay')) closeModal();
  });
  $('input[name="type"]').on('change', toggleCategoryField);
  $('#transaction-form').on('submit', function (e) {
    e.preventDefault();
    saveTransaction();
  });

  /* Table row buttons (delegated) */
  $('#transaction-body').on('click', '.btn-edit', function () {
    openEditModal(parseInt($(this).data('id')));
  });
  $('#transaction-body').on('click', '.btn-delete', function () {
    openDeleteConfirm(parseInt($(this).data('id')));
  });

  /* Delete confirm */
  $('#btn-cancel-delete').on('click', closeDeleteConfirm);
  $('#btn-confirm-delete').on('click', confirmDelete);

  /* Goal modal (delegated because #goal-section content is dynamic) */
  $('#goal-section').on('click', '#btn-open-goal', openGoalModal);
  $('#goal-section').on('click', '#btn-delete-goal', function () {
    if (confirm('Delete this savings goal?')) { deleteGoal(); renderGoal(); }
  });
  $('#btn-close-goal-modal, #btn-cancel-goal').on('click', closeGoalModal);
  $('#goal-modal-overlay').on('click', function (e) {
    if ($(e.target).is('#goal-modal-overlay')) closeGoalModal();
  });
  $('#goal-form').on('submit', function (e) {
    e.preventDefault();
    saveGoalFromForm();
  });

  /* Escape closes any open modal */
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); closeDeleteConfirm(); closeGoalModal(); }
  });
});
