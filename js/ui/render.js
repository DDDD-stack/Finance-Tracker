/* render.js – table and summary card rendering */

function renderAll() {
  const transactions = getTransactions();
  renderSummary(transactions);
  renderTable(transactions);
  renderGoal();
}

function renderSummary(transactions) {
  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  $('#summary-income').text(formatCurrency(totalIncome));
  $('#summary-expense').text(formatCurrency(totalExpense));
  $('#summary-balance').text(formatCurrency(totalIncome - totalExpense));
}

function renderTable(transactions) {
  const $tbody = $('#transaction-body');
  $tbody.empty();

  if (transactions.length === 0) {
    $tbody.append('<tr class="empty-row"><td colspan="6">No transactions yet. Click "+ Add Transaction" to get started.</td></tr>');
    return;
  }

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  sorted.forEach(t => {
    const sign      = t.type === 'income' ? '+' : '−';
    const amountCls = t.type === 'income' ? 'amount-income' : 'amount-expense';
    const badgeCls  = t.type === 'expense' ? 'badge expense' : 'badge';

    $tbody.append(`
      <tr>
        <td>${formatDate(t.date)}</td>
        <td>${escapeHtml(t.description)}</td>
        <td>${escapeHtml(t.category)}</td>
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
