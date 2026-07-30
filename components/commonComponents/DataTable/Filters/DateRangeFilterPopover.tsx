"use client";

import * as React from "react";
import { HiOutlineFunnel, HiOutlineXMark, HiOutlineCalendar } from "react-icons/hi2";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/commonComponents/Button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Column, Table } from "@tanstack/react-table";

interface DateRangeFilterPopoverProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  table: Table<TData>;
}

export function DateRangeFilterPopover<TData, TValue>({
  column,
  title,
  table,
}: DateRangeFilterPopoverProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);

  // Get current filter value (stored in ISO format YYYY-MM-DD)
  const filterValue = column.getFilterValue() as { from?: string; to?: string } | undefined;

  // State stores ISO format for date inputs
  const [startDate, setStartDate] = React.useState<string>(
    filterValue?.from || ""
  );
  const [endDate, setEndDate] = React.useState<string>(filterValue?.to || "");

  // Calculate min and max dates from data
  const { minDate, maxDate } = React.useMemo(() => {
    let min: Date | null = null;
    let max: Date | null = null;

    table.getPreFilteredRowModel().rows.forEach((row) => {
      const value = row.getValue(column.id);
      if (value !== null && value !== undefined) {
        const date = new Date(value as string | Date);
        if (!isNaN(date.getTime())) {
          if (!min || date < min) min = date;
          if (!max || date > max) max = date;
        }
      }
    });

    return {
      minDate: min !== null ? (min as Date).toISOString().split("T")[0] : "",
      maxDate: max !== null ? (max as Date).toISOString().split("T")[0] : "",
    };
  }, [column.id, table]);

  const applyFilter = () => {
    if (!startDate && !endDate) {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue({
        from: startDate || minDate,
        to: endDate || maxDate
      });
    }
    setOpen(false);
  };

  const clearFilter = () => {
    column.setFilterValue(undefined);
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilter = filterValue !== undefined;

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle quick range selections
  const setQuickRange = (range: "today" | "week" | "month" | "year") => {
    const today = new Date();
    const start = new Date();

    switch (range) {
      case "today":
        setStartDate(today.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
      case "week":
        start.setDate(today.getDate() - 7);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
      case "month":
        start.setMonth(today.getMonth() - 1);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
      case "year":
        start.setFullYear(today.getFullYear() - 1);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("h-6 w-6 p-0")}
          >
            <HiOutlineFunnel className="h-3 w-3" />
          </Button>
          {hasActiveFilter && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-2 h-4 min-w-4 p-0 px-1 text-[10px] bg-black"
            >
              1
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[340px] p-0">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-sm">Filter {title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select a date range to filter
              </p>
            </div>
            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={clearFilter}
                className="h-6 w-6"
                title="Clear filter"
              >
                <HiOutlineXMark className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <div className="p-4 space-y-4">
          {minDate && maxDate && (
            <div className="text-xs text-muted-foreground text-center">
              Data range: {formatDateForDisplay(minDate)} -{" "}
              {formatDateForDisplay(maxDate)}
            </div>
          )}

          {/* Quick range buttons */}
          <div className="flex flex-wrap gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickRange("today")}
              className="text-xs h-7 px-2"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickRange("week")}
              className="text-xs h-7 px-2"
            >
              Last 7 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickRange("month")}
              className="text-xs h-7 px-2"
            >
              Last month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickRange("year")}
              className="text-xs h-7 px-2"
            >
              Last year
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor={`start-${column.id}`}
                className="text-xs font-medium block mb-1"
              >
                <HiOutlineCalendar className="inline h-3 w-3 mr-1" />
                Start Date
              </label>
              <Input
                id={`start-${column.id}`}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor={`end-${column.id}`}
                className="text-xs font-medium block mb-1"
              >
                <HiOutlineCalendar className="inline h-3 w-3 mr-1" />
                End Date
              </label>
              <Input
                id={`end-${column.id}`}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilter}
              className="flex-1"
            >
              Clear
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={applyFilter}
              className="flex-1"
            >
              Apply Filter
            </Button>
          </div>
        </div>
        {hasActiveFilter && (
          <div className="border-t p-2 bg-muted/30">
            <div className="text-xs text-center">
              <span className="text-muted-foreground">
                Showing dates between{" "}
                <span className="font-medium text-foreground">
                  {formatDateForDisplay(filterValue?.from || minDate)}
                </span>
                {" and "}
                <span className="font-medium text-foreground">
                  {formatDateForDisplay(filterValue?.to || maxDate)}
                </span>
              </span>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
