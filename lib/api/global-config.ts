/**
 * Global API Configuration
 *
 * Shared configuration used across all API modules
 */

// Get API version from environment or default to 1
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1";

// Build base URL with version
const buildBaseUrl = (baseUrl: string): string => {
  if (!baseUrl) return "";

  // Replace ${NEXT_PUBLIC_API_VERSION} with actual version value
  let processedUrl = baseUrl.replace(/\$\{NEXT_PUBLIC_API_VERSION\}/g, API_VERSION);

  // Remove trailing slash if present
  processedUrl = processedUrl.replace(/\/$/, "");

  return processedUrl;
};

// Global API Configuration
export const GLOBAL_CONFIG = {
  // Identity API for authentication (no version needed)
  IDENTITY_URL: process.env.NEXT_PUBLIC_IDENTITY_BASE_URL || "",

  // Clients API - built with version
  CLIENTS_API_URL: buildBaseUrl(process.env.NEXT_PUBLIC_BASE_URL || ""),

  // API Version
  API_VERSION,

  // Timeouts
  TIMEOUT: 30000, // 30 seconds

  // Default Headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Global API Endpoints
export const GLOBAL_ENDPOINTS = {
  AUTH: {
    LOGIN: "/Account/login",
    LOGOUT: "/Account/logout",
    REFRESH: "/auth/refresh",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
  },
  DATATABLE: {
    QUICK_SEARCH: "/ColumnFilter/GetClientQuickSearch/Client/ClientQuickSearch",
  },
} as const;

// Validate URLs at runtime (only in browser to avoid build-time issues)
if (typeof window !== "undefined") {
  if (!GLOBAL_CONFIG.IDENTITY_URL) {
    console.error("NEXT_PUBLIC_IDENTITY_BASE_URL is not set. Authentication will fail.");
  }
  if (!GLOBAL_CONFIG.CLIENTS_API_URL) {
    console.error("NEXT_PUBLIC_BASE_URL is not set. API calls will fail.");
  }
}

// Helper functions
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

// Legacy exports for backward compatibility
export const API_CONFIG = GLOBAL_CONFIG;
export const API_ENDPOINTS = GLOBAL_ENDPOINTS;

// Default export
export default GLOBAL_CONFIG;