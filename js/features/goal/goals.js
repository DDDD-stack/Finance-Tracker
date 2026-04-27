/* goals.js – savings goal feature */

/* Returns net savings for the most recent calendar month with any data.
   Uses income - expenses for that month only. */
function getMonthlySavingsRate() {
  const transactions = getTransactions();
  if (!transactions.length) return 0;

  // Find the most recent month that has transactions
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const latestDate  = sorted[0].date;           // "YYYY-MM-DD"
  const latestMonth = latestDate.slice(0, 7);   // "YYYY-MM"

  const monthTx = transactions.filter(t => t.date.startsWith(latestMonth));

  const income  = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return income - expense;
}

function renderGoal() {
  const goal = getGoal();
  const $section = $('#goal-section');

  if (!goal) {
    $section.html(`
      <div class="goal-empty">
        <p>No savings goal set.</p>
        <button id="btn-open-goal">+ Set a Goal</button>
      </div>
    `);
    return;
  }

  const monthlySavings = getMonthlySavingsRate();
  const remaining      = Math.max(goal.target - (goal.saved || 0), 0);

  let predictionHtml;

  if (remaining === 0) {
    predictionHtml = `<p class="goal-achieved">🎉 Goal reached! Congratulations.</p>`;
  } else if (monthlySavings <= 0) {
    predictionHtml = `<p class="goal-warn">⚠️ Your most recent month shows no net savings. Add more income or reduce expenses to reach this goal.</p>`;
  } else {
    const months = Math.ceil(remaining / monthlySavings);
    const date   = monthsFromNow(months);
    predictionHtml = `
      <p class="goal-prediction">
        At your current savings rate of <strong>${formatCurrency(monthlySavings)}/mo</strong>,
        you'll reach this goal in <strong>${months} month${months !== 1 ? 's' : ''}</strong>
        (around <strong>${date}</strong>).
      </p>`;
  }

  const progressPct = goal.target > 0
    ? Math.min(Math.round(((goal.saved || 0) / goal.target) * 100), 100)
    : 0;

  $section.html(`
    <div class="goal-card">
      <div class="goal-card-header">
        <div>
          <p class="goal-name">${escapeHtml(goal.name)}</p>
          <p class="goal-amounts">${formatCurrency(goal.saved || 0)} saved of ${formatCurrency(goal.target)}</p>
        </div>
        <div class="goal-actions">
          <button class="btn-edit" id="btn-open-goal">Edit</button>
          <button class="btn-delete" id="btn-delete-goal">Delete</button>
        </div>
      </div>

      <div class="goal-progress-track">
        <div class="goal-progress-bar" style="width: ${progressPct}%"></div>
      </div>
      <p class="goal-pct">${progressPct}% there</p>

      ${predictionHtml}
    </div>
  `);
}

/* Returns a human-readable month/year N months from today. */
function monthsFromNow(n) {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function openGoalModal() {
  const goal = getGoal();
  if (goal) {
    $('#goal-field-name').val(goal.name);
    $('#goal-field-target').val(goal.target);
    $('#goal-field-saved').val(goal.saved || 0);
  } else {
    $('#goal-field-name').val('');
    $('#goal-field-target').val('');
    $('#goal-field-saved').val('0');
  }
  $('#goal-modal-overlay').removeClass('hidden');
}

function closeGoalModal() {
  $('#goal-modal-overlay').addClass('hidden');
}

function saveGoalFromForm() {
  const name   = $('#goal-field-name').val().trim();
  const target = parseFloat($('#goal-field-target').val());
  const saved  = parseFloat($('#goal-field-saved').val()) || 0;

  if (!name || !target || target <= 0) {
    alert('Please enter a goal name and a valid target amount.');
    return;
  }

  saveGoal({ name, target, saved });
  closeGoalModal();
  renderGoal();
}
