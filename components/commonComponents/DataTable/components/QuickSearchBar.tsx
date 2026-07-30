"use client";

import * as React from "react";
import { SearchListDropdown } from "./SearchListDropdown";
import { useQuickSearch } from "../hooks/useQuickSearch";
import type { QuickSearchResult } from "../types";

interface QuickSearchBarProps {
  apiUrl?: string;
  placeholder?: string;
  onSearchSelect?: (result: QuickSearchResult) => void;
  onSearchClear?: () => void;
  className?: string;
}

/**
 * QuickSearchBar Component
 *
 * A self-contained search bar component that handles its own state and API calls.
 * Simply pass the API URL and callbacks, and it manages everything else.
 */
export function QuickSearchBar({
  apiUrl,
  placeholder = "Search...",
  onSearchSelect,
  onSearchClear,
  className,
}: QuickSearchBarProps) {
  const quickSearch = useQuickSearch(apiUrl);

  const handleSearchSelect = (result: QuickSearchResult) => {
    if (onSearchSelect) {
      onSearchSelect(result);
    }
  };

  const handleSearchClear = () => {
    if (onSearchClear) {
      onSearchClear();
    }
  };

  return (
    <SearchListDropdown
      searchText={quickSearch.searchText}
      onSearchTextChange={quickSearch.setSearchText}
      results={quickSearch.results}
      isLoading={quickSearch.isLoading}
      error={quickSearch.error}
      isOpen={quickSearch.isOpen}
      onOpenChange={quickSearch.setIsOpen}
      onSelectResult={handleSearchSelect}
      onClearSearch={handleSearchClear}
      placeholder={placeholder}
      className={className}
    />
  );
}
