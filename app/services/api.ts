// ─────────────────────────────────────────────────────────────────────────────
// Shared Helpers for Teacher Self-Assessment System
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the current academic year in "YYYY-YY" format.
 * August starts the new year.
 */
export function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed
  const startYear = month >= 8 ? year : year - 1;
  const endYY = String(startYear + 1).slice(-2);
  return `${startYear}-${endYY}`;
}

/**
 * Returns current semester based on month.
 * ODD  → Aug (8) to Dec (12)
 * EVEN → Jan (1) to Jul (7)
 */
export function getCurrentSemester(): "ODD" | "EVEN" {
  const month = new Date().getMonth() + 1;
  return month >= 8 ? "ODD" : "EVEN";
}
