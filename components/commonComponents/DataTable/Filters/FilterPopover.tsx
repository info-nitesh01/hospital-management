"use client";

import * as React from "react";
import { HiOutlineFunnel, HiOutlineXMark } from "react-icons/hi2";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/commonComponents/Button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Column, Table } from "@tanstack/react-table";
import { Loader } from "@/components/commonComponents/Loader";

interface FilterPopoverProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  table: Table<TData>;
}

export function FilterPopover<TData, TValue>({
  column,
  title,
  table,
}: FilterPopoverProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [uniqueValues, setUniqueValues] = React.useState<Array<{ value: string; count: number }>>([]);

  // Separate state for pending selections (before applying)
  const [pendingSelections, setPendingSelections] = React.useState<Set<string>>(new Set());

  // Process unique values when popover opens
  React.useEffect(() => {
    if (open && uniqueValues.length === 0) {
      setIsLoading(true);

      // Use requestAnimationFrame for better performance with large datasets
      const frameId = requestAnimationFrame(() => {
        const valueCounts = new Map<string, number>();
        const rows = table.getPreFilteredRowModel().rows;
        const batchSize = 1000; // Process in batches for very large datasets

        let currentIndex = 0;

        const processBatch = () => {
          const endIndex = Math.min(currentIndex + batchSize, rows.length);

          for (let i = currentIndex; i < endIndex; i++) {
            const value = rows[i].getValue(column.id);
            if (value !== null && value !== undefined) {
              const strValue = String(value);
              valueCounts.set(strValue, (valueCounts.get(strValue) || 0) + 1);
            }
          }

          currentIndex = endIndex;

          if (currentIndex < rows.length) {
            // Continue processing next batch
            requestAnimationFrame(processBatch);
          } else {
            // All done, convert to array and sort
            const processedValues = Array.from(valueCounts.entries())
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([value, count]) => ({ value, count }));

            setUniqueValues(processedValues);
            setIsLoading(false);
          }
        };

        processBatch();
      });

      return () => cancelAnimationFrame(frameId);
    }
  }, [open, column.id, table, uniqueValues.length]);

  // Initialize pending selections with current filter when opening
  React.useEffect(() => {
    if (open) {
      const filterValue = column.getFilterValue();
      if (Array.isArray(filterValue)) {
        setPendingSelections(new Set(filterValue as string[]));
      } else {
        setPendingSelections(new Set());
      }
    }
  }, [open, column]);

  // Reset cached values when table data changes significantly
  React.useEffect(() => {
    if (!open) {
      // Reset when popover is closed to ensure fresh data next time
      const timer = setTimeout(() => {
        setUniqueValues([]);
        setSearchTerm("");
      }, 300); // Small delay to avoid flashing during close animation

      return () => clearTimeout(timer);
    }
  }, [open]);

  // Get currently applied filter values
  const filterValue = column.getFilterValue();
  const appliedValues = React.useMemo(() => {
    if (Array.isArray(filterValue)) {
      return new Set(filterValue as string[]);
    }
    return new Set<string>();
  }, [filterValue]);

  // Filter values based on search
  const filteredValues = React.useMemo(() => {
    return uniqueValues.filter((item) =>
      item.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueValues, searchTerm]);

  const handleSelect = (value: string) => {
    const newPendingSelections = new Set(pendingSelections);

    if (newPendingSelections.has(value)) {
      newPendingSelections.delete(value);
    } else {
      newPendingSelections.add(value);
    }

    setPendingSelections(newPendingSelections);
  };

  const applyFilter = () => {
    const filterValues = Array.from(pendingSelections);

    // Apply filter
    if (filterValues.length === 0) {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue(filterValues);
    }

    setOpen(false);
  };

  const clearFilter = () => {
    setPendingSelections(new Set());
    column.setFilterValue(undefined);
    setSearchTerm("");
  };

  const selectAll = () => {
    const values = filteredValues.map(item => item.value);
    setPendingSelections(new Set(values));
  };

  const hasActiveFilter = appliedValues.size > 0;
  const hasPendingChanges =
    pendingSelections.size !== appliedValues.size ||
    Array.from(pendingSelections).some(val => !appliedValues.has(val));

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
          {hasActiveFilter && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-2 h-4 min-w-4 p-0 px-1 text-[10px] bg-black"
            >
              {appliedValues.size}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[280px] p-0">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-sm">Filter {title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select multiple values to filter
              </p>
            </div>
            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={clearFilter}
                className="h-6 w-6"
                title="Clear all filters"
              >
                <HiOutlineXMark className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
            disabled={isLoading}
          />
          {!isLoading && filteredValues.length > 0 && (
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="text-xs"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilter}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
        <div className="max-h-[300px] overflow-auto p-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader />
            </div>
          ) : filteredValues.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No results found
            </p>
          ) : (
            filteredValues.map((item) => {
              const isSelected = pendingSelections.has(item.value);
              return (
                <div
                  key={item.value}
                  onClick={() => handleSelect(item.value)}
                  className={cn(
                    "flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-pointer",
                    isSelected && "bg-accent/50"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleSelect(item.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={cn("truncate", isSelected && "font-medium")}>{item.value}</span>
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {item.count}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {!isLoading && uniqueValues.length > 0 && (
          <div className="border-t p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {pendingSelections.size} of {uniqueValues.length} selected
              </span>
              {hasActiveFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilter}
                  className="h-6 text-xs px-2"
                >
                  Clear all
                </Button>
              )}
            </div>
            <Button
              onClick={applyFilter}
              className="w-full"
              size="sm"
              disabled={!hasPendingChanges}
            >
              Apply Filter
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}