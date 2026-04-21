"use client";

import { useState, useEffect } from "react";
import type { UserRole } from "@/app/types";

// ─────────────────────────────────────────────────────────────────────────────
// useAuth
// Reads the authenticated user's basic info (name, role) from localStorage.
// This data is written by the login page after a successful login.
// It does NOT verify the JWT — that is done server-side by the middleware.
// ─────────────────────────────────────────────────────────────────────────────

export type AuthUser = {
  _id?: string;
  name: string;
  email?: string;
  role: UserRole;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
      }
    } catch {
      // ignore — SSR or corrupted storage
    }
  }, []);

  return {
    /** Resolved auth user, or null if not yet loaded / not logged in */
    user,
    /** true once the client has read localStorage */
    mounted,
    /** Convenience: the user's display name */
    userName: user?.name ?? "",
    /** Convenience: the user's role */
    role: user?.role ?? null,
  };
}
