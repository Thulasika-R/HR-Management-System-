const config = require('../config');
const db = require('../models/db');

/**
 * Generates an immutable, structured Login ID based on:
 * [Company Code] + [Employee Name Code (first 4 letters)] + [Joining Year] + [Serial 4-digits]
 * Example: OI + TODO + 2022 + 0001 = OITODO20220001
 */
function generateLoginId(firstName, lastName, joiningDate) {
  const companyCode = config.COMPANY_CODE || 'OI';
  
  // Extract 4-character uppercase name code
  const cleanFirst = (firstName || 'USER').replace(/[^a-zA-Z]/g, '').toUpperCase();
  const cleanLast = (lastName || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  let nameCode = (cleanFirst + cleanLast).slice(0, 4);
  while (nameCode.length < 4) {
    nameCode += 'X';
  }

  // Extract joining year
  const joinYear = joiningDate ? new Date(joiningDate).getFullYear().toString() : new Date().getFullYear().toString();

  // Find existing serial count
  const allEmployees = db.find('employees');
  const count = allEmployees.length + 1;
  const serial = count.toString().padStart(4, '0');

  const generatedId = `${companyCode}${nameCode}${joinYear}${serial}`;
  return generatedId;
}

/**
 * Generates a secure temporary password for initial employee onboarding
 * Example: Dayflow@7892
 */
function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomNum = Math.floor(1000 + Math.random() * 9000);
  return `Dayflow@${randomNum}`;
}

module.exports = {
  generateLoginId,
  generateTemporaryPassword
};
