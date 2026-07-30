import * as React from "react";
import type { TransformedFilters } from "../types";

export interface TableState {
  pageNumber: number;
  pageSize: number;
  sortIndex?: number;
  sortBy: "asc" | "desc";
}

export interface UseTableStateReturn {
  tableState: TableState;
  filters: TransformedFilters;
  handleFiltersChange: (newFilters: TransformedFilters) => void;
  handlePaginationChange: (pageNumber: number, pageSize: number) => void;
  handleSortChange: (sortIndex?: number, sortBy?: "asc" | "desc") => void;
}

/**
 * Custom hook to manage table state (pagination, filters, sorting)
 * Works with DataTable's TransformedFilters format
 */
export function useTableState(initialPageSize: number = 10): UseTableStateReturn {
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [filters, setFilters] = React.useState<TransformedFilters>({});
  const [sortIndex, setSortIndex] = React.useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = React.useState<"asc" | "desc">("desc");

  const handleFiltersChange = React.useCallback((newFilters: TransformedFilters) => {
    setFilters(newFilters);
    setPageNumber(1);
  }, []);

  const handlePaginationChange = React.useCallback((newPageNumber: number, newPageSize: number) => {
    setPageNumber(newPageNumber);
    setPageSize(newPageSize);
  }, []);

  const handleSortChange = React.useCallback((index?: number, direction?: "asc" | "desc") => {
    if (index === undefined && direction === undefined) {
      setSortIndex(undefined);
      setSortBy("desc");
    } else {
      if (index !== undefined) setSortIndex(index);
      if (direction) setSortBy(direction);
    }
  }, []);

  return {
    tableState: { pageNumber, pageSize, sortIndex, sortBy },
    filters,
    handleFiltersChange,
    handlePaginationChange,
    handleSortChange,
  };
}
