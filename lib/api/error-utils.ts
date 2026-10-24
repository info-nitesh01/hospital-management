/**
 * Error Utilities
 *
 * Common error handling utilities for API responses
 */

import { toast } from "sonner";
import type { ApiError } from "./global-types";

/**
 * Error message configuration for different HTTP status codes
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input and try again.",
  401: "Your session has expired. Please log in again.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  408: "Request timeout. Please try again.",
  409: "A conflict occurred. The resource may already exist.",
  422: "Unable to process the request. Please check your input.",
  429: "Too many requests. Please try again later.",
  500: "Internal server error. Please try again later.",
  502: "Service temporarily unavailable. Please try again.",
  503: "Service unavailable. Please try again later.",
  504: "Gateway timeout. Please try again.",
};

/**
 * Get a user-friendly error message from an API error
 */
export function getErrorMessage(error: unknown): string {
  // Handle ApiError type
  if (error && typeof error === "object" && "message" in error) {
    const apiError = error as ApiError;
    if (apiError.status === 401 && apiError.message) {
      return apiError.message;
    }
    if (apiError.status && ERROR_MESSAGES[apiError.status]) {
      return ERROR_MESSAGES[apiError.status];
    }
    return apiError.message || "An unexpected error occurred";
  }

  // Handle standard Error
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Default message
  return "An unexpected error occurred. Please try again.";
}

/**
 * Show an error toast notification
 */
export function showErrorToast(
  error: unknown,
  options?: {
    title?: string;
    description?: string;
    duration?: number;
  }
) {
  const message = getErrorMessage(error);

  toast.error(options?.title || "Error", {
    description: options?.description || message,
    duration: options?.duration || 5000,
  });
}

/**
 * Show a success toast notification
 */
export function showSuccessToast(
  title: string,
  description?: string,
  duration: number = 4000
) {
  toast.success(title, {
    description,
    duration,
  });
}

/**
 * Show a warning toast notification
 */
export function showWarningToast(
  title: string,
  description?: string,
  duration: number = 4000
) {
  toast.warning(title, {
    description,
    duration,
  });
}

/**
 * Process client error messages (legacy function for compatibility)
 */
export function processClientErrorMessage(error: unknown): string {
  return getErrorMessage(error);
}

// Default export for convenience
const errorUtils = {
  getErrorMessage,
  showErrorToast,
  showSuccessToast,
  showWarningToast,
  processClientErrorMessage,
};

export default errorUtils;