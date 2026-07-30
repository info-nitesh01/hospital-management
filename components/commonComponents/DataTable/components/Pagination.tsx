"use client";

import * as React from "react";
import { Table as TableType } from "@tanstack/react-table";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
} from "react-icons/hi2";
import { Button } from "@/components/commonComponents/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PaginationProps<TData> {
  table: TableType<TData>;
  totalCount?: number;
  filteredCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function Pagination<TData>({
  table,
  totalCount,
  filteredCount,
  onPageChange,
  onPageSizeChange,
}: PaginationProps<TData>) {
  // State for jump to page input
  const [jumpToPage, setJumpToPage] = React.useState("");

  // Calculate the range of items being displayed
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  // Use filteredCount when available (server-side filtering), otherwise use totalCount or client-side filtered rows
  const displayCount = filteredCount ?? totalCount ?? table.getFilteredRowModel().rows.length;
  const isFiltered = filteredCount !== undefined && filteredCount !== totalCount;

  // For server-side pagination, calculate total pages based on displayCount
  // For client-side pagination, use table.getPageCount()
  const isServerSide = totalCount !== undefined || filteredCount !== undefined;
  const totalPages = isServerSide
    ? Math.ceil(displayCount / pageSize)
    : table.getPageCount();

  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, displayCount);
  const total = displayCount;

  // Handle jump to page
  const handleJumpToPage = (value: string) => {
    const page = parseInt(value, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      if (onPageChange) {
        onPageChange(page);
      } else {
        table.setPageIndex(page - 1);
      }
      setJumpToPage("");
    }
  };

  // Generate page numbers with ellipsis
  const generatePaginationNumbers = (): (number | string)[] => {
    const currentPage = table.getState().pagination.pageIndex + 1;
    const delta = 2; // Number of pages to show on each side of current page
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    // Generate the range of pages to display
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    // Add dots where there are gaps
    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        {/* Pagination range info */}
        <div className="row-selection-info">
          {total > 0 ? (
            <>
              {start}-{end} of {total.toLocaleString()}
              {isFiltered && totalCount && (
                <span className="text-xs text-muted-foreground ml-1">
                  (filtered from {totalCount.toLocaleString()})
                </span>
              )}
            </>
          ) : (
            "No results"
          )}
        </div>

        {/* Page size selector */}
        <div className="page-size-selector">
          <span className="page-size-label">Rows:</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              const newPageSize = Number(value);
              if (onPageSizeChange) {
                onPageSizeChange(newPageSize);
              } else {
                table.setPageSize(newPageSize);
              }
            }}
          >
            <SelectTrigger className="page-size-select">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 15, 20, 30, 40, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="pagination-controls">
        {/* First page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (onPageChange) {
              onPageChange(1);
            } else {
              table.setPageIndex(0);
            }
          }}
          disabled={pageIndex === 0}
          className="page-button"
          title="Go to first page"
          aria-label="Go to first page"
        >
          <HiOutlineChevronDoubleLeft className="h-4 w-4" />
        </Button>

        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (onPageChange) {
              onPageChange(pageIndex);
            } else {
              table.previousPage();
            }
          }}
          disabled={pageIndex === 0}
          className="page-button"
          title="Go to previous page"
          aria-label="Go to previous page"
        >
          <HiOutlineChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page number buttons - hidden on small screens for better mobile experience */}
        <div className="page-numbers">
          {generatePaginationNumbers().map((pageNumber, index) => {
            if (pageNumber === "...") {
              return (
                <span key={`dots-${index}`} className="page-dots">
                  ...
                </span>
              );
            }

            const isCurrentPage =
              pageNumber === table.getState().pagination.pageIndex + 1;

            return (
              <Button
                key={pageNumber}
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (onPageChange) {
                    onPageChange(Number(pageNumber));
                  } else {
                    table.setPageIndex(Number(pageNumber) - 1);
                  }
                }}
                className={cn(
                  "page-button",
                  isCurrentPage && "current-page",
                  Number(pageNumber) > 999 && "page-button-wide"
                )}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={isCurrentPage ? "page" : undefined}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (onPageChange) {
              onPageChange(pageIndex + 2);
            } else {
              table.nextPage();
            }
          }}
          disabled={pageIndex >= table.getPageCount() - 1}
          className="page-button"
          title="Go to next page"
          aria-label="Go to next page"
        >
          <HiOutlineChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (onPageChange) {
              onPageChange(table.getPageCount());
            } else {
              table.setPageIndex(table.getPageCount() - 1);
            }
          }}
          disabled={pageIndex >= table.getPageCount() - 1}
          className="page-button"
          title="Go to last page"
          aria-label="Go to last page"
        >
          <HiOutlineChevronDoubleRight className="h-4 w-4" />
        </Button>

        {/* Page info */}
        <span className="page-info">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
      </div>
      {/* Jump to page */}
      <div className="flex items-center gap-2">
        <label htmlFor="jump-to-page" className="text-sm text-muted-foreground">Go to:</label>
        <Input
          id="jump-to-page"
          type="number"
          min={1}
          max={totalPages}
          value={jumpToPage}
          onChange={(e) => setJumpToPage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleJumpToPage(jumpToPage);
            }
          }}
          onBlur={() => {
            if (jumpToPage) {
              handleJumpToPage(jumpToPage);
            }
          }}
          placeholder={`1-${totalPages}`}
          className="w-20 h-8 text-sm"
          aria-label={`Jump to page, enter a number between 1 and ${totalPages}`}
        />
      </div>
    </div>
  );
}
