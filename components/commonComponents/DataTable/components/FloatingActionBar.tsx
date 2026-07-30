"use client";

import React from "react";
import { Table } from "@tanstack/react-table";
import { HiOutlineXMark } from "react-icons/hi2";
import { Button } from "@/components/commonComponents/Button";
import type { UseCrossPageSelectionReturn } from "../hooks/useCrossPageSelection";

interface FloatingActionBarProps<TData> {
  table: Table<TData>;
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onEdit?: (selectedRows: TData[]) => void;
  onDelete?: (selectedRows: TData[]) => void;
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: TData[]) => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
    className?: string;
  }>;
  // Cross-page selection props
  enableCrossPageSelection?: boolean;
  crossPageSelection?: UseCrossPageSelectionReturn;
  getRowId?: (row: TData) => string;
}

export function FloatingActionBar<TData>({
  table,
  setRowSelection,
  customActions = [],
  enableCrossPageSelection = false,
  crossPageSelection,
  getRowId,
}: FloatingActionBarProps<TData>) {
  // Calculate selection count and data - use selectionState to trigger re-renders
  const selectedCount = React.useMemo(() => {
    if (enableCrossPageSelection && crossPageSelection) {
      const selectionInfo = crossPageSelection.getSelectionInfo();
      return selectionInfo.count;
    } else {
      return table.getFilteredSelectedRowModel().rows.length;
    }
  }, [enableCrossPageSelection, crossPageSelection, table]);

  const selectedData = React.useMemo(() => {
    if (enableCrossPageSelection && crossPageSelection && getRowId) {
      const selectedIds = crossPageSelection.getSelectedIds();
      // Get row data for selected IDs from current page data
      return table.getCoreRowModel().rows
        .filter(row => selectedIds.includes(getRowId(row.original)))
        .map(row => row.original);
    }
    return table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  }, [enableCrossPageSelection, crossPageSelection, table, getRowId]);

  // Hide if nothing selected
  if (selectedCount === 0) {
    return null;
  }

  const handleClearSelection = () => {
    if (enableCrossPageSelection && crossPageSelection) {
      crossPageSelection.clearSelection();
    } else {
      setRowSelection({});
    }
  };

  return (
    <div className="sticky bottom-6 left-0 right-0 z-50 animate-in slide-in-from-bottom-5 fade-in-0 duration-300 flex justify-center px-4">
      <div className="bg-primary/95 backdrop-blur-sm border-2 border-primary rounded-full shadow-xl p-2 px-4 flex items-center gap-4 max-w-fit">
        <div className="text-sm font-medium pl-2">
          <span className="text-primary-foreground/90">Selected:</span>{" "}
          <span className="font-bold text-primary-foreground">{selectedCount}</span>{" "}
          <span className="text-primary-foreground/90">
            {selectedCount === 1 ? "row" : "rows"}
          </span>
        </div>
        <div className="h-6 w-px bg-primary-foreground/30" />
        <div className="flex items-center gap-2">
          {/* Custom Actions */}
          {customActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "outline"}
              size="sm"
              className={`rounded-full ${action.className || ""}`}
              onClick={() => action.onClick(selectedData)}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}

          {/* Clear Selection */}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full hover:bg-primary-foreground/20 text-primary-foreground"
            onClick={handleClearSelection}
          >
            <HiOutlineXMark className="h-4 w-4" />
            <span className="sr-only">Clear Selection</span>
          </Button>
        </div>
      </div>
    </div>
  );
}