/**
 * Academic Year Utilities
 *
 * The academic year runs from October to September.
 * For example:
 * - Academic Year 2025-2026 = October 2025 to September 2026
 * - Academic Year 2026-2027 = October 2026 to September 2027
 *
 * The year value stored in the database is the starting year (e.g., 2025 for 2025-2026)
 */

/**
 * Get the current academic year based on today's date
 *
 * @returns {number} The starting year of the current academic year
 *
 * @example
 * // If today is January 1, 2026
 * getCurrentAcademicYear() // Returns 2025 (for academic year 2025-2026)
 *
 * @example
 * // If today is October 1, 2026
 * getCurrentAcademicYear() // Returns 2026 (for academic year 2026-2027)
 */
export const getCurrentAcademicYear = (): number => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  // Academic year starts in October (month 10)
  // Oct-Dec of current year = current year academic year (e.g., 2025-2026)
  // Jan-Sep of current year = previous year academic year (e.g., still 2025-2026)
  return month >= 10 ? year : year - 1;
};

/**
 * Format an academic year for display
 *
 * @param {number} year - The starting year of the academic year
 * @returns {string} Formatted academic year (e.g., "2025-2026")
 *
 * @example
 * formatAcademicYear(2025) // Returns "2025-2026"
 */
export const formatAcademicYear = (year: number): string => {
  return `${year}-${year + 1}`;
};

/**
 * Get academic year options for dropdowns
 * Generates options from 1 year before to 2 years after the current year
 *
 * @returns {Array<{value: string, label: string}>} Array of year options
 *
 * @example
 * // If current year is 2025
 * getAcademicYearOptions()
 * // Returns:
 * // [
 * //   { value: "2024", label: "2024-2025" },
 * //   { value: "2025", label: "2025-2026" },
 * //   { value: "2026", label: "2026-2027" },
 * //   { value: "2027", label: "2027-2028" }
 * // ]
 */
export const getAcademicYearOptions = (): Array<{ value: string; label: string }> => {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let i = -1; i <= 2; i++) {
    const year = currentYear + i;
    years.push({
      value: year.toString(),
      label: formatAcademicYear(year),
    });
  }

  return years;
};

/**
 * Get academic year options with custom range
 *
 * @param {number} yearsBefore - Number of years before current year
 * @param {number} yearsAfter - Number of years after current year
 * @returns {Array<{value: string, label: string}>} Array of year options
 *
 * @example
 * getAcademicYearOptionsCustom(2, 5)
 * // Returns options from 2 years ago to 5 years in the future
 */
export const getAcademicYearOptionsCustom = (
  yearsBefore: number,
  yearsAfter: number
): Array<{ value: string; label: string }> => {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let i = -yearsBefore; i <= yearsAfter; i++) {
    const year = currentYear + i;
    years.push({
      value: year.toString(),
      label: formatAcademicYear(year),
    });
  }

  return years;
};

/**
 * Check if a given date falls within a specific academic year
 *
 * @param {Date} date - The date to check
 * @param {number} academicYear - The starting year of the academic year
 * @returns {boolean} True if the date is in the academic year
 *
 * @example
 * isDateInAcademicYear(new Date('2026-01-15'), 2025) // Returns true
 * isDateInAcademicYear(new Date('2026-10-15'), 2025) // Returns false
 */
export const isDateInAcademicYear = (date: Date, academicYear: number): boolean => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // October to December of the academic year
  if (year === academicYear && month >= 10) {
    return true;
  }

  // January to September of the next year
  if (year === academicYear + 1 && month <= 9) {
    return true;
  }

  return false;
};

/**
 * Get the academic year for a given date
 *
 * @param {Date} date - The date to get the academic year for
 * @returns {number} The starting year of the academic year
 *
 * @example
 * getAcademicYearForDate(new Date('2026-01-15')) // Returns 2025
 * getAcademicYearForDate(new Date('2026-10-15')) // Returns 2026
 */
export const getAcademicYearForDate = (date: Date): number => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return month >= 10 ? year : year - 1;
};

/**
 * Get start and end dates for an academic year
 *
 * @param {number} academicYear - The starting year of the academic year
 * @returns {{ start: Date, end: Date }} Object with start and end dates
 *
 * @example
 * getAcademicYearDates(2025)
 * // Returns:
 * // {
 * //   start: Date("2025-10-01"),
 * //   end: Date("2026-09-30")
 * // }
 */
export const getAcademicYearDates = (academicYear: number): { start: Date; end: Date } => {
  return {
    start: new Date(academicYear, 9, 1), // October 1
    end: new Date(academicYear + 1, 8, 30), // September 30
  };
};
