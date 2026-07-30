"use client";

import * as React from "react";
import { ColumnDef, HeaderContext, Row } from "@tanstack/react-table";
import { HiOutlineArrowsUpDown, HiOutlineEllipsisVertical } from "react-icons/hi2";
import { FilterPopover } from "../Filters/FilterPopover";
import { RangeFilterPopover } from "../Filters/RangeFilterPopover";
import { DateRangeFilterPopover } from "../Filters/DateRangeFilterPopover";
import { StatusFilterPopover } from "../Filters/StatusFilterPopover";
import { Button } from "@/components/commonComponents/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Helper function to create a sortable column header with optional filter
 */
export function createSortableHeader(
  label: string,
  enableFilter: boolean | "range" | "dateRange" | "status" = false,
  currency?: string
) {
  const SortableHeader = <TData = unknown,>({
    column,
    table,
  }: HeaderContext<TData, unknown>) => {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="sort-button"
        >
          {label}
          <HiOutlineArrowsUpDown className="ml-2 h-4 w-4" />
        </Button>
        {enableFilter === "range" && column.getCanFilter() && (
          <RangeFilterPopover
            column={column}
            title={label}
            table={table}
            currency={currency}
          />
        )}
        {enableFilter === "dateRange" && column.getCanFilter() && (
          <DateRangeFilterPopover column={column} title={label} table={table} />
        )}
        {enableFilter === "status" && column.getCanFilter() && (
          <StatusFilterPopover column={column} table={table} title={label} />
        )}
        {enableFilter === true && column.getCanFilter() && (
          <FilterPopover column={column} title={label} table={table} />
        )}
      </div>
    );
  };
  SortableHeader.displayName = `SortableHeader(${label})`;
  return SortableHeader;
}

/**
 * Helper function to create action column with dropdown menu
 */
export function createActionColumn<TData>(
  actions: Array<{
    label: string;
    onClick: (data: TData) => void;
    icon?: React.ReactNode;
  }>,
  headerLabel: string = "Action"
): ColumnDef<TData> {
  return {
    id: "actions",
    header: () => <div className="text-right">{headerLabel}</div>,
    enableHiding: false,
    cell: ({ row }: { row: Row<TData> }) => {
      const rowData = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <HiOutlineEllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => action.onClick(rowData)}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  };
}
