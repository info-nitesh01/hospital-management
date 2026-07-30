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
import { cn } from "@/lib/utils";
import { Column, Table } from "@tanstack/react-table";

interface RangeFilterPopoverProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  table: Table<TData>;
  currency?: string;
}

export function RangeFilterPopover<TData, TValue>({
  column,
  title,
  table,
  currency,
}: RangeFilterPopoverProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);

  // Get current filter value
  const filterValue = column.getFilterValue() as { from?: number; to?: number } | undefined;
  const [minValue, setMinValue] = React.useState<string>(filterValue?.from?.toString() || "");
  const [maxValue, setMaxValue] = React.useState<string>(filterValue?.to?.toString() || "");

  // Calculate min and max from data
  const { dataMin, dataMax } = React.useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    table.getPreFilteredRowModel().rows.forEach((row) => {
      const value = row.getValue(column.id);
      if (value !== null && value !== undefined) {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          min = Math.min(min, numValue);
          max = Math.max(max, numValue);
        }
      }
    });

    return {
      dataMin: min === Infinity ? 0 : min,
      dataMax: max === -Infinity ? 0 : max,
    };
  }, [column.id, table]);

  const applyFilter = () => {
    const min = minValue === "" ? undefined : Number(minValue);
    const max = maxValue === "" ? undefined : Number(maxValue);

    if (min === undefined && max === undefined) {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue({
        from: min ?? dataMin,
        to: max ?? dataMax
      });
    }
    setOpen(false);
  };

  const clearFilter = () => {
    column.setFilterValue(undefined);
    setMinValue("");
    setMaxValue("");
  };

  const hasActiveFilter = filterValue !== undefined;

  const formatCurrency = (value: number) => {
    if (currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString();
  };

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
              1
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-sm">Filter {title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set a range to filter values
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
          <div className="text-xs text-muted-foreground text-center">
            Data range: {formatCurrency(dataMin)} - {formatCurrency(dataMax)}
          </div>
          <div className="space-y-3">
            <div>
              <label htmlFor={`min-${column.id}`} className="text-xs font-medium block mb-1">
                Minimum {currency && `(${currency})`}
              </label>
              <Input
                id={`min-${column.id}`}
                type="number"
                placeholder={dataMin.toString()}
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`max-${column.id}`} className="text-xs font-medium block mb-1">
                Maximum {currency && `(${currency})`}
              </label>
              <Input
                id={`max-${column.id}`}
                type="number"
                placeholder={dataMax.toString()}
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
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
                Showing values between{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(filterValue?.from ?? dataMin)}
                </span>
                {" and "}
                <span className="font-medium text-foreground">
                  {formatCurrency(filterValue?.to ?? dataMax)}
                </span>
              </span>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}