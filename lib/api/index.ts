/**
 * API Module
 *
 * Main entry point for all API functionality
 * Organized by page/feature with shared global utilities
 */

// ============================================================================
// Auth API Exports
// ============================================================================
export * as authApi from "./auth";
export {
  login,
  logout,
  getCurrentUser,
  refreshToken,
  resetPassword,
  verifyEmail,
} from "./auth";

export {
  TokenManager,
  getToken,
  setToken,
  clearTokens,
  decodeToken,
  isTokenExpired,
  getCurrentUserFromToken,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  type DecodedToken,
} from "./auth/token-manager";

export type {
  LoginCredentials,
  AuthResponse,
  User,
  RefreshTokenInput,
} from "./auth/types";

// ============================================================================
// Clients API Exports
// ============================================================================
export * as clientsApi from "./clients";
export {
  getClients,
  getClientCheckBoxes,
  getClientById,
  getClientGraphData,
} from "./clients";

export type {
  ApiClientData,
  ColumnConfig,
  ApiClientsResponse,
  ClientContact,
  ClientDetailData,
  GetClientByIdResponse,
  GraphDataPoint,
  GetGraphDataResponse,
} from "./clients/types";

// ============================================================================
// Global HTTP & Configuration Exports
// ============================================================================
export {
  HttpClient,
  clientsApi as globalClientsApi,
  authApi as globalAuthApi,
  handleApiError,
  // Legacy exports
  apiClient,
  authClient,
} from "./global-http";

export {
  GLOBAL_CONFIG,
  GLOBAL_ENDPOINTS,
  isDevelopment,
  isProduction,
  // Legacy exports
  API_CONFIG,
  API_ENDPOINTS,
} from "./global-config";

// ============================================================================
// Global Types Exports
// ============================================================================
export type {
  ApiResponse,
  ApiError,
  RequestConfig,
  QueryOptions,
  MutationCallbacks,
  PaginationParams,
  PaginatedResponse,
} from "./global-types";

// ============================================================================
// Error Utilities Exports
// ============================================================================
export {
  getErrorMessage,
  showErrorToast,
  showSuccessToast,
  showWarningToast,
  processClientErrorMessage,
} from "./error-utils";

// ============================================================================
// Legacy Support Exports
// ============================================================================
export { authApi as identityClient } from "./global-http";
export { handleApiError as ApiErrorHandler } from "./global-http";

// ============================================================================
// Default Export
// ============================================================================
import * as auth from "./auth";
import * as clients from "./clients";
import * as token from "./auth/token-manager";
import { GLOBAL_CONFIG, GLOBAL_ENDPOINTS } from "./global-config";
import {
  getErrorMessage,
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "./error-utils";

const apiModule = {
  // Auth
  auth: auth.default,

  // Clients
  clients: clients.default,

  // Token Management
  token: {
    getToken: token.getToken,
    setToken: token.setToken,
    clearTokens: token.clearTokens,
    decodeToken: token.decodeToken,
    isTokenExpired: token.isTokenExpired,
    getCurrentUserFromToken: token.getCurrentUserFromToken,
    hasRole: token.hasRole,
    hasAnyRole: token.hasAnyRole,
    hasAllRoles: token.hasAllRoles,
  },

  // Config
  config: GLOBAL_CONFIG,
  endpoints: GLOBAL_ENDPOINTS,

  // Error utilities
  error: {
    getErrorMessage,
    showErrorToast,
    showSuccessToast,
    showWarningToast,
  },
};

export default apiModule;