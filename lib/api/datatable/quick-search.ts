/**
 * Quick Search API
 *
 * Handles quick search functionality for DataTable components
 */

import { getToken } from "../auth/token-manager";
import { GLOBAL_CONFIG, GLOBAL_ENDPOINTS } from "../global-config";

// ============================================================================
// Types
// ============================================================================

export interface QuickSearchResult {
  key: string;
  description: string;
  quickSearchDescription: string;
}

export interface QuickSearchResponse {
  code: number;
  content: QuickSearchResult[];
  currentFileId: null;
  currentAssessmentId: null;
}

export interface QuickSearchParams {
  quicksearch: string;
  roleName?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Performs a quick search via the API
 * @param params - Search parameters
 * @param apiUrl - Optional custom API URL (uses env config by default)
 * @param signal - Optional AbortSignal for cancellation
 * @returns Promise with search results
 */
export async function quickSearch(
  params: QuickSearchParams,
  apiUrl?: string,
  signal?: AbortSignal
): Promise<QuickSearchResult[]> {
  // Use provided URL or construct from environment config
  const baseUrl = apiUrl || `${GLOBAL_CONFIG.CLIENTS_API_URL}${GLOBAL_ENDPOINTS.DATATABLE.QUICK_SEARCH}`;

  // Build query parameters
  const queryParams = new URLSearchParams({
    quicksearch: params.quicksearch,
    roleName: params.roleName || "",
  });

  const url = `${baseUrl}?${queryParams.toString()}`;

  // Get auth token
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Make API request
  const response = await fetch(url, {
    method: "GET",
    headers,
    signal,
  });

  // Handle error responses
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized. Please log in again.");
    } else if (response.status === 403) {
      throw new Error("Access denied.");
    } else if (response.status === 404) {
      throw new Error("Search endpoint not found.");
    } else if (response.status >= 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      throw new Error(`API error: ${response.status}`);
    }
  }

  // Parse response
  const data: QuickSearchResponse = await response.json();

  // Validate response
  if (data.code === 200) {
    return data.content || [];
  } else {
    throw new Error(`Unexpected response code: ${data.code}`);
  }
}

/**
 * Client-specific quick search
 * @param searchText - Text to search for
 * @param signal - Optional AbortSignal for cancellation
 * @returns Promise with search results
 */
export async function clientQuickSearch(
  searchText: string,
  signal?: AbortSignal
): Promise<QuickSearchResult[]> {
  return quickSearch(
    {
      quicksearch: searchText,
      roleName: "",
    },
    undefined, // Use default API URL
    signal
  );
}

// ============================================================================
// Export all types and functions
// ============================================================================

const quickSearchAPI = {
  quickSearch,
  clientQuickSearch,
};

export default quickSearchAPI;
