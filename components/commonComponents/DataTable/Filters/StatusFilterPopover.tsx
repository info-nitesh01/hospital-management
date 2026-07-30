"use client";

import * as React from "react";
import { HiOutlineFunnel, HiOutlineExclamationCircle, HiOutlineArrowPath } from "react-icons/hi2";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/commonComponents/Button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "@/components/commonComponents/Loader";
import { cn } from "@/lib/utils";
import { Column, Table } from "@tanstack/react-table";
import { useInfiniteFilter } from "../hooks/useInfiniteFilter";

interface StatusOption {
  value: string;
  label: string;
  variant?: "default" | "secondary" | "outline" | "destructive";
}

interface StatusFilterPopoverProps<TData, TValue> {
  column: Column<TData, TValue>;
  table: Table<TData>;
  title?: string;
  filterType?: string;
}

// Map status values to badge variants (supports both client and document statuses)
const getStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
  const normalized = status.toLowerCase();

  // Client statuses
  if (normalized === "active") return "default";
  if (normalized === "inactive") return "outline";
  if (normalized === "suspended") return "destructive";

  // Document statuses
  if (normalized === "draft") return "secondary";
  if (normalized === "pending") return "outline";
  if (normalized === "viewed") return "default";
  if (normalized === "signed") return "default";
  if (normalized === "completed") return "default";
  if (normalized === "expired") return "destructive";
  if (normalized === "declined") return "destructive";

  return "outline";
};

export function StatusFilterPopover<TData, TValue>({
  column,
  table,
  title = "Status",
  filterType = "clientStatus",
}: StatusFilterPopoverProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);
  const [pendingSelections, setPendingSelections] = React.useState<Set<string>>(new Set());

  // Get all current filters from the table, excluding the current column's filter
  const getCurrentFilters = React.useCallback(() => {
    const columnFilters = table.getState().columnFilters;
    const filters: Record<string, string | number | undefined> = {};

    columnFilters.forEach((filter) => {
      if (filter.id !== column.id) {
        const value = filter.value;
        if (Array.isArray(value) && value.length > 0) {
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

  const currentFilters = React.useMemo(() => {
    return open ? getCurrentFilters() : undefined;
  }, [open, getCurrentFilters]);

  const {
    items,
    isLoading,
    error,
    refresh,
    isFilterDisabled,
  } = useInfiniteFilter(filterType, {
    enabled: open,
    pageSize: 50,
    currentFilters,
  });

  // Map API response to StatusOption format
  const options: StatusOption[] = React.useMemo(
    () => items.map(item => ({
      value: item.clientName,
      label: item.clientName,
      variant: getStatusVariant(item.clientName),
    })),
    [items]
  );

  // Get current filter value
  const filterValue = column.getFilterValue();
  const selectedValues = React.useMemo(() => {
    if (Array.isArray(filterValue)) {
      return new Set(filterValue as string[]);
    }
    return new Set<string>();
  }, [filterValue]);

  // Initialize pending selections when popover opens
  React.useEffect(() => {
    if (open) {
      setPendingSelections(new Set(selectedValues));
    }
  }, [open, selectedValues]);

  // Refresh data when popover opens
  React.useEffect(() => {
    if (open && !isFilterDisabled) refresh();
  }, [open, refresh, isFilterDisabled]);

  const handleSelect = (value: string, checked: boolean) => {
    const newValues = new Set(pendingSelections);
    if (checked) {
      newValues.add(value);
    } else {
      newValues.delete(value);
    }
    setPendingSelections(newValues);
  };

  const applyFilter = () => {
    const filterValues = Array.from(pendingSelections);
    column.setFilterValue(filterValues.length ? filterValues : undefined);
    setOpen(false);
  };

  const handleReset = React.useCallback(() => {
    // Clear the applied filter on the current column
    column.setFilterValue(undefined);
    setPendingSelections(new Set());
    setOpen(false);
  }, [column]);

  const hasPendingChanges =
    pendingSelections.size !== selectedValues.size ||
    Array.from(pendingSelections).some(val => !selectedValues.has(val)) ||
    Array.from(selectedValues).some(val => !pendingSelections.has(val));

  const isFiltered = selectedValues.size > 0;

  // Don't render if filter is disabled for this column
  if (isFilterDisabled) {
    return null;
  }

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
          >
            <HiOutlineFunnel className="h-3 w-3" />
          </Button>
          {isFiltered && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-2 h-4 min-w-4 p-0 px-1 text-[10px] bg-black"
            >
              {selectedValues.size}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">
            Filter by {title}
          </h4>
        </div>

        <div className="p-2 space-y-1 min-h-[100px]">
          {error ? (
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
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
          ) : isLoading ? (
            <div className="py-6">
              <Loader size="sm" withText />
            </div>
          ) : options.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No statuses available
            </div>
          ) : (
            options.map(option => (
              <label
                key={option.value}
                className="flex items-center space-x-2 py-1.5 px-2 hover:bg-accent rounded cursor-pointer"
              >
                <Checkbox
                  checked={pendingSelections.has(option.value)}
                  onCheckedChange={checked => handleSelect(option.value, !!checked)}
                  className="h-3.5 w-3.5"
                />
                <span className="text-sm flex-1">{option.label}</span>
                <Badge variant={option.variant || "outline"} className="h-5 text-[10px]">
                  {option.label}
                </Badge>
              </label>
            ))
          )}
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
            >
              Apply {pendingSelections.size > 0 && `(${pendingSelections.size})`}
              {hasPendingChanges && <span className="ml-1 text-orange-400">•</span>}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}