"use client";

import * as React from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import type { QuickSearchResult } from "../types";

interface UseQuickSearchFilterProps {
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  onQuickSearchSelect?: (result: QuickSearchResult) => void;
  onQuickSearchClear?: () => void;
}

export interface UseQuickSearchFilterReturn {
  quickSearchFilter: { key: string; value: string } | null;
  handleQuickSearchSelect: (result: QuickSearchResult) => void;
  handleQuickSearchClear: () => void;
}

export function useQuickSearchFilter({
  setColumnFilters,
  onQuickSearchSelect,
  onQuickSearchClear,
}: UseQuickSearchFilterProps): UseQuickSearchFilterReturn {
  const [quickSearchFilter, setQuickSearchFilter] = React.useState<{
    key: string;
    value: string;
  } | null>(null);

  // Handle quick search result selection
  const handleQuickSearchSelect = React.useCallback(
    (result: QuickSearchResult) => {
      // Store the quick search filter internally
      setQuickSearchFilter({
        key: result.key,
        value: result.description.toLowerCase(),
      });

      // Apply the filter to columnFilters state
      setColumnFilters((prev) => {
        // Remove any existing filter for this column
        const filtered = prev.filter((f) => f.id !== result.key);
        // Add the new filter
        return [
          ...filtered,
          { id: result.key, value: result.description.toLowerCase() },
        ];
      });

      // Also notify parent if callback is provided
      if (onQuickSearchSelect) {
        onQuickSearchSelect(result);
      }
    },
    [setColumnFilters, onQuickSearchSelect]
  );

  // Handle quick search clear
  const handleQuickSearchClear = React.useCallback(() => {
    // Clear the internal quick search filter
    if (quickSearchFilter) {
      // Remove the filter from columnFilters state
      setColumnFilters((prev) =>
        prev.filter((f) => f.id !== quickSearchFilter.key)
      );
      setQuickSearchFilter(null);
    }

    // Also notify parent if callback is provided
    if (onQuickSearchClear) {
      onQuickSearchClear();
    }
  }, [quickSearchFilter, setColumnFilters, onQuickSearchClear]);

  return {
    quickSearchFilter,
    handleQuickSearchSelect,
    handleQuickSearchClear,
  };
}
