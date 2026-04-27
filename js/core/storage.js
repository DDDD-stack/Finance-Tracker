/* storage.js – localStorage data layer */

const STORAGE_KEY = 'ft_transactions';
const GOAL_KEY    = 'ft_goal';

/* --- Transactions --- */

function getTransactions() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function addTransaction(transaction) {
  const all = getTransactions();
  all.push(transaction);
  saveTransactions(all);
}

function updateTransaction(updated) {
  const all = getTransactions().map(t => t.id === updated.id ? updated : t);
  saveTransactions(all);
}

function deleteTransaction(id) {
  saveTransactions(getTransactions().filter(t => t.id !== id));
}

function generateId() {
  return Date.now();
}

/* --- Savings Goal --- */

function getGoal() {
  const raw = localStorage.getItem(GOAL_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveGoal(goal) {
  localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
}

function deleteGoal() {
  localStorage.removeItem(GOAL_KEY);
}
