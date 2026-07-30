/**
 * Query Keys Factory for Column Filter APIs
 * Provides centralized, type-safe query keys for TanStack Query
 */

import type { ColumnFilterParams } from "./types";

export const columnFilterKeys = {
  /**
   * Base key for all column filter queries
   */
  all: ['columnFilter'] as const,

  /**
   * All queries for a specific filter type
   * @param filterType - The filter type (e.g., "clientName", "clientStatus")
   */
  type: (filterType: string) => [...columnFilterKeys.all, filterType] as const,

  /**
   * Paginated list query for a specific filter type
   * @param filterType - The filter type
   * @param params - Pagination and search parameters
   */
  list: (filterType: string, params: ColumnFilterParams) =>
    [...columnFilterKeys.type(filterType), 'list', params] as const,

  /**
   * Search query for a specific filter type
   * @param filterType - The filter type
   * @param searchTerm - The search term
   */
  search: (filterType: string, searchTerm: string) =>
    [...columnFilterKeys.type(filterType), 'search', searchTerm] as const,

  /**
   * Individual filter item query
   * @param filterType - The filter type
   * @param id - The filter item ID
   */
  detail: (filterType: string, id: string) =>
    [...columnFilterKeys.type(filterType), 'detail', id] as const,
};
