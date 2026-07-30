import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFilterDataByType } from "@/lib/api/datatable/column";
import { columnFilterKeys } from "@/lib/api/datatable/column/queryKeys";
import type { ClientNameFilterItem, FilterTypeConfig } from "@/lib/api/datatable/column/types";
import { useFilterRegistryOptional, useDisableFiltering } from "../FilterContext";

interface UseInfiniteFilterOptions {
  enabled?: boolean;
  pageSize?: number;
  searchTerm?: string;
  useServerSearch?: boolean;
  currentFilters?: Record<string, string | number | undefined>;
}

interface UseInfiniteFilterReturn {
  items: ClientNameFilterItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => void;
  refresh: () => void;
  handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  isFilterDisabled: boolean;
}

export const useInfiniteFilter = (
  filterType: string,
  options: UseInfiniteFilterOptions = {}
): UseInfiniteFilterReturn => {
  const { enabled = true, pageSize = 50, searchTerm = "", useServerSearch = true, currentFilters } = options;

  // Get filter registry and disabled filters from context
  const filterRegistry = useFilterRegistryOptional();
  const disableFiltering = useDisableFiltering();

  const [items, setItems] = useState<ClientNameFilterItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Check if this filter type is disabled
  const isFilterDisabled = useMemo(() => {
    return disableFiltering.includes(filterType);
  }, [filterType, disableFiltering]);

  // Validate that the filter type is registered and not disabled
  const isValidFilterType = useMemo(() => {
    if (isFilterDisabled) return false;
    return filterRegistry ? filterType in filterRegistry : false;
  }, [filterType, filterRegistry, isFilterDisabled]);

  // Create query params object
  const queryParams = useMemo(() => ({
    fromRange: 0,
    toRange: pageSize,
    ...(useServerSearch && searchTerm && { searchTerm }),
    ...(currentFilters && { currentFilters }),
  }), [pageSize, searchTerm, useServerSearch, currentFilters]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: columnFilterKeys.list(filterType, queryParams),
    queryFn: () => getFilterDataByType(filterType, queryParams, filterRegistry as Record<string, FilterTypeConfig>),
    enabled: enabled && isValidFilterType,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (data?.data) {
      setItems(data.data);
      setCurrentPage(0);
      setHasMore(data.hasMore);
    }
  }, [data]);

  // Reset pagination when search term changes
  useEffect(() => {
    if (useServerSearch && searchTerm !== undefined) {
      setCurrentPage(0);
      setHasMore(true);
      setIsLoadingMore(false);
    }
  }, [searchTerm, useServerSearch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !isValidFilterType || !filterRegistry) return;

    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const fromRange = nextPage;
      const toRange = pageSize;

      const response = await getFilterDataByType(filterType, {
        fromRange,
        toRange,
        ...(useServerSearch && searchTerm && { searchTerm }),
        ...(currentFilters && { currentFilters }),
      }, filterRegistry);

      if (response.data.length > 0) {
        setItems(prev => [...prev, ...response.data]);
        setCurrentPage(nextPage);
        setHasMore(response.hasMore);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, pageSize, isLoadingMore, filterType, isValidFilterType, searchTerm, useServerSearch, currentFilters, filterRegistry]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const nearBottom = scrollHeight - scrollTop - clientHeight <= 50;

      if (nearBottom && hasMore && !isLoadingMore) {
        loadMore();
      }
    },
    [hasMore, isLoadingMore, loadMore]
  );

  const refresh = useCallback(() => {
    setCurrentPage(0);
    setHasMore(true);
    setIsLoadingMore(false);
    refetch();
  }, [refetch]);

  // Apply client-side filtering only when server-side search is disabled
  const filteredItems = useMemo(() => {
    if (!searchTerm || useServerSearch) return items;

    return items.filter(item =>
      item.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm, useServerSearch]);

  return {
    items: filteredItems,
    isLoading,
    isLoadingMore,
    hasMore,
    error: error as Error | null,
    loadMore,
    refresh,
    handleScroll,
    isFilterDisabled,
  };
};
