"use client";

import * as React from "react";
import { Table, Column } from "@tanstack/react-table";
import { HiOutlineBookmark } from "react-icons/hi2";
import { Button } from "@/components/commonComponents/Button";
import { QuickSearchBar } from "./QuickSearchBar";
import { SavedFilterSelect } from "./SavedFilterSelect";
import { SaveFilterDialog } from "./SaveFilterDialog";
import { ColumnOrderDialog } from "./ColumnOrderDialog";
import { ActiveFiltersPopover } from "./ActiveFiltersPopover";
import { ExportButton } from "./ExportButton";
import type { ActiveFilter, SavedFilter, QuickSearchResult, ExportConfig } from "../types";
import type { UseCrossPageSelectionReturn } from "../hooks/useCrossPageSelection";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  // Quick search props
  showQuickSearch?: boolean;
  quickSearchApiUrl?: string;
  onQuickSearchSelect: (result: QuickSearchResult) => void;
  onQuickSearchClear: () => void;
  // Saved filters props
  savedFilters: SavedFilter[];
  selectedFilterId: string | null;
  onSelectFilter: (filterId: string | null) => void;
  onDeleteFilter: (filterId: string) => void;
  onUpdateFilter: (filterId: string) => void;
  showSaveFilterDialog: boolean;
  setShowSaveFilterDialog: (show: boolean) => void;
  onSaveFilter: (name: string) => void;
  // Active filters props
  activeFilters: ActiveFilter[];
  onClearAllFilters: () => void;
  // Column ordering props
  showColumnVisibility?: boolean;
  columnOrder: string[];
  onColumnOrderChange: React.Dispatch<React.SetStateAction<string[]>>;
  pinnedColumn: string | null;
  onPinnedColumnChange: React.Dispatch<React.SetStateAction<string | null>>;
  // Toolbar actions
  toolbarActions?: React.ReactNode | ((selectedIds: string[]) => React.ReactNode);
  // Cross-page selection
  enableCrossPageSelection?: boolean;
  crossPageSelection?: UseCrossPageSelectionReturn;
  // Export props
  showExport?: boolean;
  exportConfig?: ExportConfig;
  getRowId?: (row: TData) => string;
}

export function DataTableToolbar<TData>({
  table,
  showQuickSearch = false,
  quickSearchApiUrl,
  onQuickSearchSelect,
  onQuickSearchClear,
  savedFilters,
  selectedFilterId,
  onSelectFilter,
  onDeleteFilter,
  onUpdateFilter,
  showSaveFilterDialog,
  setShowSaveFilterDialog,
  onSaveFilter,
  activeFilters,
  onClearAllFilters,
  showColumnVisibility = false,
  columnOrder,
  onColumnOrderChange,
  pinnedColumn,
  onPinnedColumnChange,
  toolbarActions,
  enableCrossPageSelection = false,
  crossPageSelection,
  showExport = false,
  exportConfig,
  getRowId,
}: DataTableToolbarProps<TData>) {
  // Get selected IDs for export functionality
  const selectedIds = React.useMemo(() => {
    if (enableCrossPageSelection && crossPageSelection) {
      return crossPageSelection.getSelectedIds();
    }
    // For regular selection, extract IDs using getRowId or fallback to row index
    if (getRowId) {
      return table.getFilteredSelectedRowModel().rows.map((row) => getRowId(row.original));
    }
    return table.getFilteredSelectedRowModel().rows.map((row) => row.id);
  }, [enableCrossPageSelection, crossPageSelection, table, getRowId]);
  return (
    <div className="flex flex-col md:flex-row justify-between gap-2 pb-4">
      <div className="flex flex-col md:flex-row lg:w-1/2 items-center gap-3">
        {showQuickSearch && (
          <QuickSearchBar
            apiUrl={quickSearchApiUrl}
            placeholder="Search..."
            onSearchSelect={onQuickSearchSelect}
            onSearchClear={onQuickSearchClear}
            className="w-full md:max-w-sm"
          />
        )}
        {savedFilters.length > 0 && (
          <SavedFilterSelect
            savedFilters={savedFilters}
            selectedFilterId={selectedFilterId}
            onSelectFilter={onSelectFilter}
            onDeleteFilter={onDeleteFilter}
            onUpdateFilter={onUpdateFilter}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        {activeFilters.length > 0 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveFilterDialog(true)}
              className="save-filter-btn"
            >
              <HiOutlineBookmark className="h-3 w-3 mr-1" />
              Save Filter
            </Button>
            <SaveFilterDialog
              open={showSaveFilterDialog}
              onOpenChange={setShowSaveFilterDialog}
              onSave={onSaveFilter}
              existingFilterNames={savedFilters.map((f) => f.name)}
            />
          </>
        )}
        <ActiveFiltersPopover
          table={table}
          activeFilters={activeFilters}
          onClearAllFilters={onClearAllFilters}
        />
        {showColumnVisibility && (
          <ColumnOrderDialog
            columns={table.getAllColumns() as Column<unknown, unknown>[]}
            columnOrder={columnOrder}
            onColumnOrderChange={onColumnOrderChange}
            pinnedColumn={pinnedColumn}
            onPinnedColumnChange={onPinnedColumnChange}
          />
        )}
        {typeof toolbarActions === "function"
          ? toolbarActions(
              enableCrossPageSelection && crossPageSelection
                ? crossPageSelection.getSelectedIds()
                : []
            )
          : toolbarActions}
        {showExport && exportConfig && selectedIds.length > 0 && (
          <ExportButton
            selectedIds={selectedIds}
            exportConfig={exportConfig}
            variant="outline"
          />
        )}
      </div>
    </div>
  );
}
