/**
 * Filter Prefetching Utilities
 * Utilities for managing filter cache
 */

import { QueryClient } from "@tanstack/react-query";
import { columnFilterKeys } from "@/lib/api/datatable/column/queryKeys";

/**
 * Clear filter cache for specific type or all types
 */
export function clearFilterCache(queryClient: QueryClient, filterType?: string) {
  if (filterType) {
    queryClient.removeQueries({ queryKey: columnFilterKeys.type(filterType) });
  } else {
    queryClient.removeQueries({ queryKey: columnFilterKeys.all });
  }
}
