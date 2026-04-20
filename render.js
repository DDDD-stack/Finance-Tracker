/* RENDER.JS  –  Draws the table rows and summary cards. It is called by modal.js after every add, edit, or delete. */

/*Reads all transactions from localStorage, then redraws the summary cards and table. */
function renderAll() {
  const transactions = getTransactions();
  renderSummary(transactions);
  renderTable(transactions);
}

/* Calculates income, expense, and balance totals and injects them into the three summary cards. */
function renderSummary(transactions) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  $('#summary-income').text(formatCurrency(totalIncome));
  $('#summary-expense').text(formatCurrency(totalExpense));
  $('#summary-balance').text(formatCurrency(balance));
}

/* Clears the <tbody> and rebuilds one row per transaction.
   Shows a placeholder message when the list is empty. */
function renderTable(transactions) {
  const $tbody = $('#transaction-body');
  $tbody.empty();

  if (transactions.length === 0) {
    $tbody.append(
      '<tr class="empty-row"><td colspan="6">No transactions yet. Click "+ Add Transaction" to get started.</td></tr>'
    );
    return;
  }

  /* Sort by date, newest first, before rendering */
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  sorted.forEach(t => {
    const sign       = t.type === 'income' ? '+' : '−';
    const amountCls  = t.type === 'income' ? 'amount-income' : 'amount-expense';
    const badgeCls   = t.type === 'expense' ? 'badge expense' : 'badge';

    $tbody.append(`
      <tr>
        <td>${formatDate(t.date)}</td>
        <td>${escapeHtml(t.description)}</td>
        <td>${t.category}</td>
        <td><span class="${badgeCls}">${capitalise(t.type)}</span></td>
        <td class="${amountCls}">${sign}${formatCurrency(t.amount)}</td>
        <td>
          <button class="btn-edit"   data-id="${t.id}">Edit</button>
          <button class="btn-delete" data-id="${t.id}">Delete</button>
        </td>
      </tr>
    `);
  });
}

/* Converts a number to a "$1,234.56" formatted string. */
function formatCurrency(n) {
  return '$' + Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/* Converts "2026-04-01" to "Apr 1, 2026". */
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* capitalise(str)  –  "income" → "Income" */
function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* Prevents XSS by escaping special HTML characters in any user-supplied text before it is written into the DOM. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
