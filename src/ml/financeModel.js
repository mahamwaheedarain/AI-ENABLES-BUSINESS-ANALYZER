export function predictProfit(revenueData, expenseData) {
  if (revenueData.length === 0 || expenseData.length === 0) return 0;
  const avgRevenue = revenueData.reduce((a, b) => a + b, 0) / revenueData.length;
  const avgExpense = expenseData.reduce((a, b) => a + b, 0) / expenseData.length;
  return Math.round(avgRevenue - avgExpense + Math.random() * 2000 - 1000);
}
