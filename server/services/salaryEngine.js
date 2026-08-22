/**
 * Salary Calculation Engine
 * Computes component breakdown from Base Wage & Component configuration.
 */

function calculateSalaryBreakdown(salaryStructure) {
  if (!salaryStructure) return null;

  const baseWage = Number(salaryStructure.base_wage) || 0;
  const basicPct = Number(salaryStructure.basic_percentage) || 50;
  const hraPct = Number(salaryStructure.hra_percentage) || 50;
  const standardAllowance = Number(salaryStructure.standard_allowance) || 4167;
  const performanceBonus = Number(salaryStructure.performance_bonus) || 3000;
  const lta = Number(salaryStructure.lta) || 2500;
  const fixedAllowance = Number(salaryStructure.fixed_allowance) || 1800;
  const pfPct = Number(salaryStructure.pf_percentage) || 12;
  const professionalTax = Number(salaryStructure.professional_tax) || 200;

  // Earnings
  const basicSalary = Math.round(baseWage * (basicPct / 100));
  const hra = Math.round(basicSalary * (hraPct / 100));
  const grossSalary = Math.round(basicSalary + hra + standardAllowance + performanceBonus + lta + fixedAllowance);

  // Deductions
  const pf = Math.round(basicSalary * (pfPct / 100));
  const totalDeductions = Math.round(pf + professionalTax);

  // Net Take Home
  const netSalary = Math.round(grossSalary - totalDeductions);

  return {
    base_wage: baseWage,
    earnings: {
      basic_salary: basicSalary,
      basic_percentage: basicPct,
      hra: hra,
      hra_percentage: hraPct,
      standard_allowance: standardAllowance,
      performance_bonus: performanceBonus,
      lta: lta,
      fixed_allowance: fixedAllowance,
      gross_salary: grossSalary
    },
    deductions: {
      provident_fund: pf,
      pf_percentage: pfPct,
      professional_tax: professionalTax,
      total_deductions: totalDeductions
    },
    net_salary: netSalary
  };
}

module.exports = {
  calculateSalaryBreakdown
};
