/**
 * Token Manager
 *
 * JWT token storage and management utilities
 */

import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import type { DecodedToken } from "./types";

// Auth cookie name (used by middleware for route protection)
const AUTH_COOKIE_NAME = "auth_session";

// Re-export DecodedToken type for convenience
export type { DecodedToken } from "./types";

// Token storage keys
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// ============================================================================
// Token Storage
// ============================================================================

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearTokens(): void {
  removeToken();
  removeAuthCookie();
  if (typeof window !== "undefined") {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

// ============================================================================
// Auth Cookie (for middleware route protection)
// ============================================================================

export function setAuthCookie(): void {
  if (typeof window === "undefined") return;
  Cookies.set(AUTH_COOKIE_NAME, "true", {
    expires: 7, // 7 days
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function removeAuthCookie(): void {
  if (typeof window === "undefined") return;
  Cookies.remove(AUTH_COOKIE_NAME);
}

export function hasAuthCookie(): boolean {
  if (typeof window === "undefined") return false;
  return !!Cookies.get(AUTH_COOKIE_NAME);
}

// ============================================================================
// Token Decoding and Validation
// ============================================================================

export function decodeToken(token?: string): DecodedToken | null {
  try {
    const tokenToUse = token || getToken();
    if (!tokenToUse) return null;
    return jwtDecode<DecodedToken>(tokenToUse);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to decode token:", error);
    }
    return null;
  }
}

export function isTokenExpired(token?: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}

export function getTokenExpiration(token?: string): Date | null {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return null;
  return new Date(decoded.exp * 1000);
}

// ============================================================================
// User Information
// ============================================================================

export function getCurrentUserFromToken() {
  const decoded = decodeToken();
  if (!decoded) return null;

  const userId = decoded.sub ||
                 (decoded.userId as string) ||
                 (decoded.user_id as string) ||
                 (decoded.uid as string) ||
                 (decoded.id as string) ||
                 null;

  const roleField = decoded.role || decoded.urole || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  const roles = roleField
    ? (Array.isArray(roleField) ? roleField : [roleField])
    : [];

  return {
    id: userId,
    email: decoded.email || null,
    name: decoded.name || decoded.username || null,
    roles,
    isExpired: isTokenExpired(),
    expiresAt: getTokenExpiration(),
    raw: decoded
  };
}

export function hasRole(role: string): boolean {
  const user = getCurrentUserFromToken();
  return user?.roles.includes(role) || false;
}

export function hasAnyRole(roles: string[]): boolean {
  const user = getCurrentUserFromToken();
  if (!user) return false;
  return roles.some(role => user.roles.includes(role));
}

export function hasAllRoles(roles: string[]): boolean {
  const user = getCurrentUserFromToken();
  if (!user) return false;
  return roles.every(role => user.roles.includes(role));
}

// ============================================================================
// TokenManager Class (for backward compatibility)
// ============================================================================

export class TokenManager {
  static getToken = getToken;
  static setToken = setToken;
  static removeToken = removeToken;
  static getRefreshToken = getRefreshToken;
  static setRefreshToken = setRefreshToken;
  static removeRefreshToken = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  };
  static clearAll = clearTokens;
  static decodeToken = decodeToken;
  static isTokenExpired = isTokenExpired;
  static getTokenExpiration = getTokenExpiration;
  static getDecodedToken = decodeToken;
  static setAuthCookie = setAuthCookie;
  static removeAuthCookie = removeAuthCookie;
  static hasAuthCookie = hasAuthCookie;

  static getUserId(): string | null {
    const user = getCurrentUserFromToken();
    return user?.id || null;
  }

  static getUserEmail(): string | null {
    const user = getCurrentUserFromToken();
    return user?.email || null;
  }

  static getUserName(): string | null {
    const user = getCurrentUserFromToken();
    return user?.name || null;
  }

  static getUserRoles(): string[] {
    const user = getCurrentUserFromToken();
    return user?.roles || [];
  }
}