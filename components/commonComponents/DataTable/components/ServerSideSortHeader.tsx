"use client";

import * as React from "react";
import { Button } from "@/components/commonComponents/Button";
import { HiOutlineArrowsUpDown, HiMiniBarsArrowUp, HiMiniBarsArrowDown } from "react-icons/hi2";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Server-side sorting header component
 *
 * This component handles server-side sorting by calling the onSortChange callback
 * with the sortIndex (from ColumnConfig.sortOrder) and sortBy direction.
 *
 * @example
 * ```tsx
 * <ServerSideSortHeader
 *   column={column}
 *   label="Client Name"
 *   sortIndex={1}
 *   currentSortIndex={activeSortIndex}
 *   currentSortBy={sortDirection}
 *   onSortChange={(sortIndex, sortBy) => handleSort(sortIndex, sortBy)}
 * />
 * ```
 */

interface ServerSideSortHeaderProps {
  /** Display label for the column header */
  label: string;
  /** The sortIndex from ColumnConfig.sortOrder (used in API call) */
  sortIndex: number;
  /** Currently active sort index from API state */
  currentSortIndex?: number;
  /** Currently active sort direction from API state */
  currentSortBy?: "asc" | "desc";
  /** Callback when sort is changed - passes sortIndex and sortBy to parent, or undefined to clear sorting */
  onSortChange?: (sortIndex: number | undefined, sortBy: "asc" | "desc" | undefined) => void;
}



export function ServerSideSortHeader({
  label,
  sortIndex,
  currentSortIndex,
  currentSortBy,
  onSortChange,
}: ServerSideSortHeaderProps) {
  // Check if this column is currently sorted
  const isCurrentlySorted = currentSortIndex === sortIndex;
  const currentDirection = isCurrentlySorted ? currentSortBy : undefined;

  const handleSort = React.useCallback(() => {
    if (!onSortChange) return;

    if (!isCurrentlySorted) {
      // If not currently sorted, start with ascending
      onSortChange(sortIndex, "asc");
    } else if (currentDirection === "asc") {
      // If currently ascending, switch to descending
      onSortChange(sortIndex, "desc");
    } else {
      // If currently descending, remove sorting (pass undefined to clear)
      onSortChange(undefined, undefined);
    }
  }, [sortIndex, isCurrentlySorted, currentDirection, onSortChange]);

  // Render the sort icon based on current sort state
  const renderSortIcon = () => {
    if (isCurrentlySorted && currentDirection === "asc") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <HiMiniBarsArrowUp className="ml-2 h-4 w-4" />
              <div className="absolute -top-1 -right-1 flex h-2 w-2 items-center justify-center rounded-full bg-black text-xs font-semibold text-black"></div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sorted Ascending</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    if (isCurrentlySorted && currentDirection === "desc") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <HiMiniBarsArrowDown className="ml-2 h-4 w-4" />
              <div className="absolute -top-1 -right-1 flex h-2 w-2 items-center justify-center rounded-full bg-black text-xs font-semibold text-black"></div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sorted Descending</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    return <HiOutlineArrowsUpDown className="ml-2 h-4 w-4" />;
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSort}
      className="sort-button"
      aria-label={`Sort by ${label}`}
    >
      {label}
      {renderSortIcon()}
    </Button>
  );
}
