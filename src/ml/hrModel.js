export function predictAttrition(employeeData) {
  if (!employeeData || employeeData.length === 0) return 0;
  // simple random attrition percentage
  return Math.round(Math.random() * 15); // 0% to 15%
}
