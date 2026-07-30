"use client";

import * as React from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import { transformFiltersToApi } from "../utils/transformFilters";
import type { TransformedFilters } from "../types";

interface UseFilterNotificationProps {
  columnFilters: ColumnFiltersState;
  onFiltersChange?: (filters: TransformedFilters) => void;
  resetPageNumber: () => void;
}

/**
 * Hook to notify parent component when filters change (for server-side filtering)
 * Handles debouncing and transformation of filters to API format
 */
export function useFilterNotification({
  columnFilters,
  onFiltersChange,
  resetPageNumber,
}: UseFilterNotificationProps): void {
  const onFiltersChangeRef = React.useRef(onFiltersChange);
  const isInitialMount = React.useRef(true);
  const previousFiltersRef = React.useRef<ColumnFiltersState>(columnFilters);

  React.useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);

  React.useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousFiltersRef.current = columnFilters;
      return;
    }

    // Check if filters actually changed (deep comparison)
    const filtersChanged =
      JSON.stringify(previousFiltersRef.current) !==
      JSON.stringify(columnFilters);

    if (filtersChanged) {
      previousFiltersRef.current = columnFilters;
      resetPageNumber();

      // Transform and notify parent with API-ready filters
      if (onFiltersChangeRef.current) {
        const transformedFilters = transformFiltersToApi(columnFilters);
        onFiltersChangeRef.current(transformedFilters);
      }
    }
  }, [columnFilters, resetPageNumber]);
}
