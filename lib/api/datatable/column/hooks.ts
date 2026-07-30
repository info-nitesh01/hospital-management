/**
 * React Query Hooks for Column Filter APIs
 * Provides utility hooks for cache management
 */

import { useQueryClient } from "@tanstack/react-query";
import { columnFilterKeys } from "./queryKeys";
import type { ColumnFilterParams, ColumnFilterResponse } from "./types";

/**
 * Hook to invalidate filter cache
 */
export function useInvalidateFilterData() {
  const queryClient = useQueryClient();

  const invalidateFilter = (filterType?: string) => {
    if (filterType) {
      return queryClient.invalidateQueries({
        queryKey: columnFilterKeys.type(filterType),
      });
    }
    return queryClient.invalidateQueries({
      queryKey: columnFilterKeys.all,
    });
  };

  return { invalidateFilter };
}

/**
 * Hook to get cached filter data without fetching
 */
export function useFilterDataCache(filterType: string, params: ColumnFilterParams) {
  const queryClient = useQueryClient();

  const getCachedData = () => {
    return queryClient.getQueryData<ColumnFilterResponse>(
      columnFilterKeys.list(filterType, params)
    );
  };

  const setCachedData = (data: ColumnFilterResponse) => {
    queryClient.setQueryData(columnFilterKeys.list(filterType, params), data);
  };

  return { getCachedData, setCachedData };
}
