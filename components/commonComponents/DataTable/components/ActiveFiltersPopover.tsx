"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { HiOutlineXMark, HiOutlineFunnel } from "react-icons/hi2";
import { Button } from "@/components/commonComponents/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import type { ActiveFilter } from "../types";

interface ActiveFiltersPopoverProps<TData> {
  table: Table<TData>;
  activeFilters: ActiveFilter[];
  onClearAllFilters: () => void;
}

export function ActiveFiltersPopover<TData>({
  table,
  activeFilters,
  onClearAllFilters,
}: ActiveFiltersPopoverProps<TData>) {
  if (activeFilters.length === 0) {
    return null;
  }

  const handleClearAll = () => {
    const filterCount = activeFilters.length;
    onClearAllFilters();
    toast.success("All filters cleared", {
      description: `Removed ${filterCount} active filter(s)`,
    });
  };

  return (
    <TooltipProvider>
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                className="h-8 w-8"
                aria-label="Clear all filters"
              >
                <HiOutlineFunnel className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear all filters</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">
                Active Filters ({activeFilters.length})
              </h4>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
                className="h-7 text-xs"
              >
                Clear all
              </Button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {activeFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-start justify-between p-2 rounded-md bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{filter.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {filter.count} {filter.count === 1 ? "item" : "items"}{" "}
                      selected
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      table.getColumn(filter.id)?.setFilterValue(undefined);
                    }}
                    className="h-6 w-6 ml-2"
                    aria-label={`Remove ${filter.name} filter`}
                  >
                    <HiOutlineXMark className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
