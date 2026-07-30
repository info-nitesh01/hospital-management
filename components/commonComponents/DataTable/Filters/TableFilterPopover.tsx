"use client";

import * as React from "react";
import { Column, Table } from "@tanstack/react-table";
import { HiOutlineFunnel, HiOutlineMagnifyingGlass, HiOutlineExclamationCircle, HiOutlineArrowPath } from "react-icons/hi2";
import { Button } from "@/components/commonComponents/Button";
import { Loader } from "@/components/commonComponents/Loader";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useInfiniteFilter } from "../hooks/useInfiniteFilter";

interface TableFilterPopoverProps<TData> {
  column: Column<TData>;
  table: Table<TData>;
  title?: string;
  filterType?: string;
  pageSize?: number;
  useServerSearch?: boolean;
}

export function TableFilterPopover<TData>({
  column,
  table,
  title,
  filterType = "clientName",
  pageSize = 50,
  useServerSearch = true,
}: TableFilterPopoverProps<TData>) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = React.useState("");
  const [selectedValues, setSelectedValues] = React.useState<Set<string>>(new Set());
  const [pendingSelections, setPendingSelections] = React.useState<Set<string>>(new Set());

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Get all current filters from the table, excluding the current column's filter
  const getCurrentFilters = React.useCallback(() => {
    const columnFilters = table.getState().columnFilters;

    // Convert column filters to API format, excluding the current filter
    const filters: Record<string, string | number | undefined> = {};

    columnFilters.forEach((filter) => {
      // Skip the current column's filter
      if (filter.id !== column.id) {
        const value = filter.value;

        if (Array.isArray(value) && value.length > 0) {
          // Convert array to comma-separated string for API
          filters[filter.id] = value.join(',');
        } else if (typeof value === 'string' && value !== '') {
          filters[filter.id] = value;
        } else if (typeof value === 'number') {
          filters[filter.id] = value;
        } else if (typeof value === 'object' && value !== null) {
          const rangeValue = value as Record<string, unknown>;

          if (rangeValue.from || rangeValue.to) {
            if (rangeValue.from) filters[`${filter.id}Start`] = String(rangeValue.from);
            if (rangeValue.to) filters[`${filter.id}End`] = String(rangeValue.to);
          }

          if (rangeValue.min !== undefined || rangeValue.max !== undefined) {
            if (rangeValue.min !== undefined) filters[`${filter.id}Min`] = Number(rangeValue.min);
            if (rangeValue.max !== undefined) filters[`${filter.id}Max`] = Number(rangeValue.max);
          }
        }
      }
    });

    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [column, table]);

  // Get current filters when the popover opens
  const currentFilters = React.useMemo(() => {
    const filters = open ? getCurrentFilters() : undefined;

    // Debug: Log the filters being sent to API
    if (filters && process.env.NODE_ENV === 'development') {
      console.log(`[TableFilterPopover] ${filterType} - Current filters:`, filters);
    }

    return filters;
  }, [open, getCurrentFilters, filterType]);

  const {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    handleScroll,
    refresh,
    isFilterDisabled,
  } = useInfiniteFilter(filterType, {
    enabled: open,
    pageSize,
    searchTerm: debouncedSearchValue,
    useServerSearch,
    currentFilters,
  });

  const options = React.useMemo(
    () => items.map(item => ({
      value: item.clientName,
      label: item.clientName,
    })),
    [items]
  );

  const handleSelect = (value: string, checked: boolean) => {
    const newValues = new Set(pendingSelections);
    if (checked) {
      newValues.add(value);
    } else {
      newValues.delete(value);
    }
    setPendingSelections(newValues);
    // Don't apply filter immediately - wait for Apply button
  };

  const applyFilter = React.useCallback(() => {
    const filterValues = Array.from(pendingSelections);
    column.setFilterValue(filterValues.length ? filterValues : undefined);
    setSelectedValues(new Set(pendingSelections)); // Update the displayed state
    setOpen(false); // Close the popover
  }, [column, pendingSelections]);

  const handleClear = () => {
    setPendingSelections(new Set()); // Clear pending selections only
    setSearchValue("");
    // Don't apply immediately - let user click Apply if they want to clear filters
  };

  const handleReset = React.useCallback(() => {
    // Clear the applied filter on the current column
    column.setFilterValue(undefined);
    setPendingSelections(new Set());
    setSelectedValues(new Set());
    setSearchValue("");
    setOpen(false);
  }, [column]);

  const handleSelectAll = React.useCallback(() => {
    // Select all currently visible options
    const allValues = new Set(options.map(opt => opt.value));
    setPendingSelections(allValues);
  }, [options]);

  const isAllSelected = React.useMemo(
    () => options.length > 0 && options.every(opt => pendingSelections.has(opt.value)),
    [options, pendingSelections]
  );

  // Keyboard navigation support
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    // Close popover on Escape
    if (event.key === 'Escape') {
      setOpen(false);
    }
    // Apply filter on Ctrl+Enter or Cmd+Enter
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      applyFilter();
    }
  }, [applyFilter]);

  // Sync selectedValues with column filter value
  React.useEffect(() => {
    const currentFilter = column.getFilterValue();

    if (Array.isArray(currentFilter) && currentFilter.length > 0) {
      setSelectedValues(new Set(currentFilter));
    } else {
      setSelectedValues(new Set());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [column, JSON.stringify(column.getFilterValue())]);

  // Initialize pending selections when popover opens
  React.useEffect(() => {
    if (open) {
      const currentFilter = column.getFilterValue();
      if (Array.isArray(currentFilter)) {
        setPendingSelections(new Set(currentFilter));
      } else {
        setPendingSelections(new Set());
      }
    }
  }, [open, column]);

  React.useEffect(() => {
    if (open && !isFilterDisabled) refresh();
  }, [open, refresh, isFilterDisabled]);

  // Don't render if filter is disabled for this column
  if (isFilterDisabled) {
    return null;
  }

  const isFiltered = selectedValues.size > 0;

  // Check if there are unsaved changes
  const hasPendingChanges =
    pendingSelections.size !== selectedValues.size ||
    Array.from(pendingSelections).some(val => !selectedValues.has(val)) ||
    Array.from(selectedValues).some(val => !pendingSelections.has(val));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "h-6 w-6 p-0"
            )}
            aria-label={`Filter ${title || column?.id}${isFiltered ? ` (${selectedValues.size} active)` : ''}`}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <HiOutlineFunnel className="h-3 w-3" aria-hidden="true" />
          </Button>
          {isFiltered && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-2 h-4 min-w-4 p-0 px-1 text-[10px] bg-black"
              aria-label={`${selectedValues.size} filters active`}
            >
              {selectedValues.size}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0"
        align="start"
        role="dialog"
        aria-label={`Filter options for ${title || column?.id}`}
        onKeyDown={handleKeyDown}
      >
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm mb-2" id={`filter-title-${column?.id}`}>
            Filter by {title || column?.id}
          </h4>
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-8 h-8 text-xs"
              aria-label={`Search ${title || column?.id} filters`}
              autoComplete="off"
              autoFocus
            />
          </div>
        </div>

        {/* Select All - Sticky at top */}
        {!error && !isLoading && options.length > 0 && (
          <div className="sticky top-0 bg-background z-10 px-2 pt-2 pb-1 border-b">
            <label className="flex items-center space-x-2 py-1.5 px-2 hover:bg-accent rounded cursor-pointer">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleSelectAll();
                  } else {
                    handleClear();
                  }
                }}
                className="h-3.5 w-3.5"
                aria-label="Select all filters"
              />
              <span className="text-sm font-medium flex-1">
                {isAllSelected ? "Deselect All" : "Select All"}
              </span>
              <span className="text-xs text-muted-foreground">
                ({pendingSelections.size}/{options.length})
              </span>
            </label>
          </div>
        )}

        <div
          className="h-[200px] overflow-y-auto"
          onScroll={handleScroll}
          role="group"
          aria-labelledby={`filter-title-${column?.id}`}
        >
          <div className="p-2">
            {error ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <HiOutlineExclamationCircle className="h-8 w-8 text-destructive mb-3" />
                <p className="text-sm font-medium text-destructive mb-1">
                  Failed to load filters
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {error.message || "An unexpected error occurred"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  className="gap-2"
                >
                  <HiOutlineArrowPath className="h-3.5 w-3.5" />
                  Try Again
                </Button>
              </div>
            ) : isLoading && !isLoadingMore ? (
              <div className="py-8">
                <Loader size="sm" withText />
              </div>
            ) : options.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {searchValue ? "No results found" : "No filters available"}
              </div>
            ) : (
              <>
                {options.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 py-1.5 px-2 hover:bg-accent rounded cursor-pointer"
                  >
                    <Checkbox
                      checked={pendingSelections.has(option.value)}
                      onCheckedChange={checked => handleSelect(option.value, !!checked)}
                      className="h-3.5 w-3.5"
                      aria-label={`Filter by ${option.label}`}
                    />
                    <span className="text-sm flex-1 truncate">{option.label}</span>
                  </label>
                ))}

                {isLoadingMore && (
                  <div className="py-2 flex justify-center">
                    <Loader size="sm" />
                  </div>
                )}

                {!hasMore && options.length > 0 && (
                  <div className="text-center py-2 text-xs text-muted-foreground">
                    End of list
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="p-3 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={selectedValues.size === 0}
              className="flex-1"
              aria-label="Reset applied filter on this column"
            >
              Reset
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={applyFilter}
              className="flex-1"
              disabled={!hasPendingChanges && pendingSelections.size === 0}
              aria-label={`Apply ${pendingSelections.size} filter${pendingSelections.size !== 1 ? 's' : ''}${hasPendingChanges ? ' (unsaved changes)' : ''}`}
              title="Ctrl+Enter or Cmd+Enter to apply"
            >
              Apply {pendingSelections.size > 0 && `(${pendingSelections.size})`}
              {hasPendingChanges && <span className="ml-1 text-orange-400" aria-hidden="true">•</span>}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Ctrl+Enter</kbd> to apply
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};