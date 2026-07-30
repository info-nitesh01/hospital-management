/**
 * Authentication API
 *
 * All API calls related to authentication and user management
 */

import { authApi } from "../global-http";
import { setToken, setRefreshToken, clearTokens } from "./token-manager";
import type { LoginCredentials, AuthResponse, User } from "./types";

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await authApi.getInstance().post<AuthResponse>(
    "/Account/login",
    credentials
  );

  // Store tokens if login successful
  if (response.data.token) {
    setToken(response.data.token);
    setRefreshToken(response.data.refreshToken);
  }

  return response.data;
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User> => {
  return await authApi.get<User>("/users/me");
};

/**
 * Refresh token
 */
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await authApi.post<AuthResponse>("/auth/refresh", { refreshToken });

  // Update stored token
  if (response.token) {
    setToken(response.token);
  }

  return response;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  // Clear tokens locally (no API call since endpoint doesn't exist)
  clearTokens();

  // Redirect to login
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

/**
 * Reset password
 */
export const resetPassword = async (email: string): Promise<void> => {
  await authApi.post("/auth/reset-password", { email });
};

/**
 * Verify email
 */
export const verifyEmail = async (token: string): Promise<void> => {
  await authApi.post("/auth/verify-email", { token });
};

// Export all auth API functions
const authApiModule = {
  login,
  logout,
  getCurrentUser,
  refreshToken,
  resetPassword,
  verifyEmail,
};

export default authApiModule;

// Re-export token management utilities
export * from "./token-manager";