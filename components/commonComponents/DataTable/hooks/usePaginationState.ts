"use client";

import * as React from "react";

interface UsePaginationStateProps<TData> {
  pageSize: number;
  data: TData[];
  onPaginationChange?: (pageNumber: number, pageSize: number) => void;
}

export interface UsePaginationStateReturn {
  currentPageNumber: number;
  currentPageSize: number;
  paginationMetadata: { totalRecords: number | undefined };
  setCurrentPageNumber: React.Dispatch<React.SetStateAction<number>>;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  resetPageNumber: () => void;
}

/**
 * Hook to manage internal pagination state and notify parent for API refetch
 */
export function usePaginationState<TData>({
  pageSize,
  data,
  onPaginationChange,
}: UsePaginationStateProps<TData>): UsePaginationStateReturn {
  const [currentPageNumber, setCurrentPageNumber] = React.useState(1);
  const [currentPageSize, setCurrentPageSize] = React.useState(pageSize);

  // Extract pagination metadata from data automatically (only totalRecords)
  const paginationMetadata = React.useMemo(() => {
    if (data && data.length > 0) {
      const firstRow = data[0] as Record<string, unknown>;
      if (firstRow && "totalRecords" in firstRow) {
        return {
          totalRecords: firstRow.totalRecords as number,
        };
      }
    }
    return { totalRecords: undefined };
  }, [data]);

  // Internal pagination handlers - manage pagination state and notify parent for API refetch
  const handlePageChange = React.useCallback(
    (page: number) => {
      setCurrentPageNumber(page);
      // Notify parent about pagination change for API refetch
      if (onPaginationChange) {
        onPaginationChange(page, currentPageSize);
      }
    },
    [currentPageSize, onPaginationChange]
  );

  const handlePageSizeChange = React.useCallback(
    (size: number) => {
      setCurrentPageSize(size);
      setCurrentPageNumber(1); // Reset to page 1
      // Notify parent about pagination change for API refetch
      if (onPaginationChange) {
        onPaginationChange(1, size);
      }
    },
    [onPaginationChange]
  );

  const resetPageNumber = React.useCallback(() => {
    setCurrentPageNumber(1);
  }, []);

  return {
    currentPageNumber,
    currentPageSize,
    paginationMetadata,
    setCurrentPageNumber,
    handlePageChange,
    handlePageSizeChange,
    resetPageNumber,
  };
}
