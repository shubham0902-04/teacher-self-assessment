"use client";

import { useState, useEffect } from "react";
import { getCurrentAcademicYear } from "@/app/services/api";

// ─────────────────────────────────────────────────────────────────────────────
// useAcademicYear
// Returns the current academic year string computed dynamically.
// Optionally accepts an override (e.g. from user preference stored in localStorage).
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "preferredAcademicYear";

export function useAcademicYear() {
  const [academicYear, setAcademicYear] = useState<string>(
    getCurrentAcademicYear,
  );

  // Load user-preferred year from localStorage (if set)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && /^\d{4}-\d{2}$/.test(stored)) {
        setAcademicYear(stored);
      }
    } catch {
      // ignore — SSR or private browsing
    }
  }, []);

  /**
   * Override the current academic year. Persists to localStorage.
   */
  function setYear(year: string) {
    setAcademicYear(year);
    try {
      localStorage.setItem(STORAGE_KEY, year);
    } catch {
      /* ignore */
    }
  }

  /**
   * Reset to the dynamically computed current year.
   */
  function resetToCurrentYear() {
    const current = getCurrentAcademicYear();
    setAcademicYear(current);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  /**
   * Generate a list of recent academic years (current + 2 past).
   */
  const yearOptions: string[] = (() => {
    const current = getCurrentAcademicYear();
    const startYear = parseInt(current.split("-")[0]);
    return [0, 1, 2].map((offset) => {
      const y = startYear - offset;
      return `${y}-${String(y + 1).slice(-2)}`;
    });
  })();

  return { academicYear, setYear, resetToCurrentYear, yearOptions };
}
