// ─────────────────────────────────────────────────────────────────────────────
// API Service helpers for Teacher Self-Assessment System
// Centralises all fetch() calls — import from "@/app/services/api"
// ─────────────────────────────────────────────────────────────────────────────

// ── Utility ───────────────────────────────────────────────────────────────────

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<{ success: boolean; data: T; message?: string }> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.json();
}

// ── Academic Year helper ──────────────────────────────────────────────────────

/**
 * Returns the current academic year in "YYYY-YY" format.
 * Rule: if current month is June (6) or later → new year, else same year.
 * e.g. April 2025 → "2024-25", July 2025 → "2025-26"
 */
export function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed
  const startYear = month >= 6 ? year : year - 1;
  const endYY = String(startYear + 1).slice(-2);
  return `${startYear}-${endYY}`;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => fetch("/api/auth/logout", { method: "POST" }),
};

// ── Faculty ───────────────────────────────────────────────────────────────────

export const facultyApi = {
  getMe: (academicYear?: string) => {
    const yr = academicYear ?? getCurrentAcademicYear();
    return request(`/api/faculty/me?academicYear=${yr}`);
  },

  getFormData: (facultyId: string, academicYear?: string) => {
    const yr = academicYear ?? getCurrentAcademicYear();
    return request(
      `/api/faculty-evaluation/form-data?facultyId=${facultyId}&academicYear=${yr}`,
    );
  },
};

// ── Evaluations ───────────────────────────────────────────────────────────────

export const evaluationApi = {
  getAll: () => request("/api/evaluations"),

  getMy: (academicYear?: string) => {
    const yr = academicYear ?? getCurrentAcademicYear();
    return request(`/api/evaluations/my?academicYear=${yr}`);
  },

  getById: (id: string) => request(`/api/evaluations/${id}`),

  create: (body: unknown) =>
    request("/api/evaluations", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: string, body: unknown) =>
    request(`/api/evaluations/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  getStats: (academicYear?: string) => {
    const yr = academicYear ?? getCurrentAcademicYear();
    return request(`/api/evaluations/stats?academicYear=${yr}`);
  },
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: () => request("/api/users"),

  getFaculties: () => request("/api/faculties"),

  create: (body: unknown) =>
    request("/api/users", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: unknown) =>
    request(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request(`/api/users/${id}`, { method: "DELETE" }),
};

// ── Categories ────────────────────────────────────────────────────────────────

export const categoriesApi = {
  getAll: () => request("/api/categories"),

  create: (body: unknown) =>
    request("/api/categories", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: unknown) =>
    request(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request(`/api/categories/${id}`, { method: "DELETE" }),
};

// ── Parameters ────────────────────────────────────────────────────────────────

export const parametersApi = {
  getAll: () => request("/api/parameters"),

  create: (body: unknown) =>
    request("/api/parameters", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: unknown) =>
    request(`/api/parameters/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request(`/api/parameters/${id}`, { method: "DELETE" }),
};

// ── Parameter Fields ──────────────────────────────────────────────────────────

export const parameterFieldsApi = {
  getAll: () => request("/api/parameter-fields"),

  create: (body: unknown) =>
    request("/api/parameter-fields", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: string, body: unknown) =>
    request(`/api/parameter-fields/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request(`/api/parameter-fields/${id}`, { method: "DELETE" }),
};

// ── Schools ───────────────────────────────────────────────────────────────────

export const schoolsApi = {
  getAll: () => request("/api/schools"),

  create: (body: unknown) =>
    request("/api/schools", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: unknown) =>
    request(`/api/schools/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request(`/api/schools/${id}`, { method: "DELETE" }),
};

// ── Departments ───────────────────────────────────────────────────────────────

export const departmentsApi = {
  getAll: () => request("/api/departments"),

  create: (body: unknown) =>
    request("/api/departments", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: string, body: unknown) =>
    request(`/api/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request(`/api/departments/${id}`, { method: "DELETE" }),
};

// ── Assignments ───────────────────────────────────────────────────────────────

export const assignmentsApi = {
  getAll: () => request("/api/faculty-category-assignments"),

  bulkUpsert: (body: unknown) =>
    request("/api/faculty-category-assignments/bulk", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ── File Upload ───────────────────────────────────────────────────────────────

export const uploadApi = {
  upload: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch("/api/upload", { method: "POST", body: fd }).then((r) =>
      r.json(),
    );
  },
};
