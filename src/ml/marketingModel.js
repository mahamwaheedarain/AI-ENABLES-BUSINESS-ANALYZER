export function predictSales(leadsData, conversionData) {
    if (!leadsData || leadsData.length === 0) return 0;
    const totalLeads = leadsData.reduce((a, b) => a + b, 0);
    return Math.round(totalLeads * 0.2 + Math.random() * 500); // 20% conversion + noise
  }
  