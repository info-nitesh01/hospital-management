/**
 * Authentication API Hooks
 * Provides type-safe React Query hooks for authentication operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/global-http";
import { TokenManager } from "@/lib/api/auth/token-manager";
import { API_ENDPOINTS } from "@/lib/api/global-config";
import { useAuth as useAuthContext } from "@/hooks/useAuth";
import type {
  LoginCredentials,
  AuthResponse,
  User,
  RefreshTokenInput,
} from "@/lib/api/auth/types";
import type {
  QueryOptions,
  MutationCallbacks,
} from "@/lib/api/global-types";
import { showErrorToast, showSuccessToast } from "@/lib/api/error-utils";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get current authenticated user
 */
export function useCurrentUser(options?: QueryOptions) {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: () => authApi.get<User>("/users/me"),
    enabled: !!TokenManager.getToken() && options?.enabled !== false,
    retry: false,
    ...options,
  });
}

/**
 * Check authentication status
 */
export function useIsAuthenticated(): boolean {
  const { data: user, isLoading } = useCurrentUser();
  return !isLoading && !!user;
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Login user
 * @param callbackUrl - URL to redirect to after successful login (defaults to "/")
 */
export function useLogin(callbackUrl?: string, callbacks?: MutationCallbacks<AuthResponse, LoginCredentials>) {
  const router = useRouter();
  const { login: authLogin } = useAuthContext();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const response = await authApi.getInstance().post<AuthResponse>(
          API_ENDPOINTS.AUTH.LOGIN,
          credentials
        );

        return response.data;
      } catch (error) {
        throw error;
      }
    },

    onSuccess: (data, variables) => {
      // Check if login was successful
      if (data.status !== 200 || !data.token) {
        showErrorToast(data.message || "Invalid credentials", {
          title: "Login failed",
        });
        return;
      }

      // Use auth context to manage authentication state and hydrate user data
      authLogin(data.token, data.refreshToken, data.userId, data.hash, data.projectId);

      showSuccessToast("Login successful", data.message || "Welcome back!");

      // Redirect to callback URL or dashboard
      const redirectUrl = callbackUrl || "/";
      router.push(redirectUrl);

      callbacks?.onSuccess?.(data, variables);
    },

    onError: (error, variables) => {
      showErrorToast(error, {
        title: "Login failed",
      });

      callbacks?.onError?.(error, variables);
    },

    onSettled: callbacks?.onSettled,
  });
}

/**
 * Logout user
 * Note: No logout API endpoint available, so this only clears local state
 */
export function useLogout(callbacks?: MutationCallbacks<void, void>) {
  const queryClient = useQueryClient();
  const { logout: authLogout } = useAuthContext();

  return useMutation({
    mutationFn: async () => {
      return Promise.resolve();
    },

    onSuccess: (data, variables) => {
      // Clear all cache
      queryClient.clear();

      showSuccessToast("Logged out successfully");

      // Use auth context to handle logout (clears tokens and redirects)
      authLogout();

      callbacks?.onSuccess?.(data, variables);
    },

    onError: (error, variables) => {
      // Still logout even on error
      queryClient.clear();
      authLogout();

      callbacks?.onError?.(error, variables);
    },

    onSettled: callbacks?.onSettled,
  });
}

/**
 * Refresh authentication token
 */
export function useRefreshToken(callbacks?: MutationCallbacks<AuthResponse, RefreshTokenInput>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RefreshTokenInput) =>
      authApi.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, data),

    onSuccess: (data, variables) => {
      // Update tokens
      TokenManager.setToken(data.token);
      if (data.refreshToken) {
        TokenManager.setRefreshToken(data.refreshToken);
      }

      callbacks?.onSuccess?.(data, variables);
    },

    onError: (error, variables) => {
      // Clear tokens and redirect to login on refresh failure
      TokenManager.clearAll();
      queryClient.clear();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      callbacks?.onError?.(error, variables);
    },

    onSettled: callbacks?.onSettled,
  });
}

/**
 * Reset password
 */
export function useResetPassword(callbacks?: MutationCallbacks<void, { email: string }>) {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      authApi.post<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data),

    onSuccess: (data, variables) => {
      showSuccessToast("Password reset email sent", `Check your email at ${variables.email}`);

      callbacks?.onSuccess?.(data, variables);
    },

    onError: (error, variables) => {
      showErrorToast(error, {
        title: "Failed to send reset email",
      });

      callbacks?.onError?.(error, variables);
    },

    onSettled: callbacks?.onSettled,
  });
}

/**
 * Verify email
 */
export function useVerifyEmail(callbacks?: MutationCallbacks<void, { token: string }>) {
  return useMutation({
    mutationFn: (data: { token: string }) =>
      authApi.post<void>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data),

    onSuccess: (data, variables) => {
      showSuccessToast("Email verified successfully");

      callbacks?.onSuccess?.(data, variables);
    },

    onError: (error, variables) => {
      showErrorToast(error, {
        title: "Email verification failed",
      });

      callbacks?.onError?.(error, variables);
    },

    onSettled: callbacks?.onSettled,
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Check if user has specific role
 */
export function useHasRole(role: string): boolean {
  const { data: user } = useCurrentUser();
  return user?.role === role;
}

/**
 * Get user permissions (extend based on your permission system)
 */
export function usePermissions(): string[] {
  const { data: user } = useCurrentUser();
  // Implement your permission logic here
  return user ? [] : [];
}
