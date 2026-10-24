/**
 * Global HTTP
 *
 * Shared HTTP utilities with interceptors for authentication and error handling
 * Used across all API modules
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { getToken, setToken, getRefreshToken, clearTokens } from "./auth/token-manager";
import { GLOBAL_CONFIG } from "./global-config";
import type { ApiResponse, ApiError } from "./global-types";

// ============================================================================
// Global Error Handler
// ============================================================================

export function handleApiError(error: AxiosError, redirectOnUnauthorized = true): ApiError {
  if (error.response) {
    const { status, data } = error.response;
    const errorData = data as Record<string, unknown>;

    // Handle 401 Unauthorized
    if (status === 401 && redirectOnUnauthorized) {
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return {
      message: (errorData?.message as string) || error.message || "An error occurred",
      code: (errorData?.code as string) || `HTTP_${status}`,
      status,
      errors: errorData?.errors as Record<string, string[]> | undefined,
    };
  } else if (error.request) {
    return {
      message: "No response from server. Please check your connection.",
      code: "NETWORK_ERROR",
      status: 0,
    };
  } else {
    return {
      message: error.message || "An unexpected error occurred",
      code: "REQUEST_ERROR",
    };
  }
}

// ============================================================================
// HTTP Client Class
// ============================================================================

export class HttpClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.instance = axios.create({
      baseURL,
      timeout: GLOBAL_CONFIG.TIMEOUT,
      headers: GLOBAL_CONFIG.DEFAULT_HEADERS,
      ...config,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors and token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        const isLoginRequest = originalRequest.url?.includes("/Account/login") ?? false;

        // Handle token refresh for 401 errors
        if (
          error.response?.status === 401 &&
          !isLoginRequest &&
          !originalRequest._retry &&
          getRefreshToken()
        ) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.instance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = getRefreshToken();
            const response = await this.instance.post("/auth/refresh", { refreshToken });
            const { token } = response.data;

            setToken(token);
            this.isRefreshing = false;

            this.refreshSubscribers.forEach((callback) => callback(token));
            this.refreshSubscribers = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            clearTokens();

            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }

            return Promise.reject(refreshError);
          }
        }

        const apiError = handleApiError(error, !isLoginRequest);
        return Promise.reject(apiError);
      }
    );
  }

  // HTTP Methods
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// ============================================================================
// Global API Instances
// ============================================================================

// Client pages API instance
export const clientsApi = new HttpClient(GLOBAL_CONFIG.CLIENTS_API_URL);

// Authentication API instance
export const authApi = new HttpClient(GLOBAL_CONFIG.IDENTITY_URL);

// Export API instance (uses same base URL as clients API)
export const exportApi = new HttpClient(GLOBAL_CONFIG.CLIENTS_API_URL);

// Legacy exports for backward compatibility
export const apiClient = clientsApi;
export const authClient = authApi;

// Default export
const globalHttpModule = {
  clientsApi,
  authApi,
  HttpClient,
  handleApiError,
};

export default globalHttpModule;