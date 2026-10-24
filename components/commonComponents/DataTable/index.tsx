"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import type { DataTableProps, ActiveFilter } from "./types";

// Re-export types for external use
export type { TransformedFilters } from "./types";

// Components
import { FloatingActionBar } from "./components/FloatingActionBar";
import { Pagination } from "./components/Pagination";
import { DataTableToolbar } from "./components/DataTableToolbar";
import { DataTableContent } from "./components/DataTableContent";

// Hooks
import { useSavedFilters } from "./hooks/useSavedFilters";
import { useCrossPageSelection } from "./hooks/useCrossPageSelection";
import { useColumnOrdering } from "./hooks/useColumnOrdering";
import { useQuickSearchFilter } from "./hooks/useQuickSearchFilter";
import { useFilterNotification } from "./hooks/useFilterNotification";
import { usePaginationState } from "./hooks/usePaginationState";

// Utils
import { crossPageCheckboxColumn } from "./columnFunctions/crossPageCheckboxColumn";
import { customFilterFns } from "./utils/filterFunctions";

// Context
import { FilterProvider } from "./FilterContext";

// Auth hook
import { useAuth } from "@/hooks/useAuth";

const EMPTY_ROW_IDS: string[] = [];

export function DataTable<TData, TValue>({
  columns,
  data,
  showPagination = true,
  showColumnVisibility = false,
  className,
  pageSize = 15,
  storageKey,
  toolbarActions,
  toolbarSearch,
  onFiltersChange,
  onPaginationChange,
  serverSideSort,
  showQuickSearch = false,
  quickSearchApiUrl,
  onQuickSearchSelect,
  onQuickSearchClear,
  enableCrossPageSelection = false,
  getRowId,
  allRowIds = EMPTY_ROW_IDS,
  customActions,
  filterApiFunctions,
  disableFiltering = [],
  showExport = false,
  exportConfig,
}: DataTableProps<TData, TValue>) {
  const { userId } = useAuth();

  // Core state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  // Cross-page selection hook
  const crossPageSelection = useCrossPageSelection(allRowIds);

  // Quick search filter hook
  const quickSearch = useQuickSearchFilter({
    setColumnFilters,
    onQuickSearchSelect,
    onQuickSearchClear,
  });

  // Pagination state hook
  const pagination = usePaginationState({
    pageSize,
    data,
    onPaginationChange,
  });

  // Filter notification hook (notifies parent when filters change)
  useFilterNotification({
    columnFilters,
    onFiltersChange,
    resetPageNumber: pagination.resetPageNumber,
  });

  // Saved filters hook
  const savedFiltersHook = useSavedFilters({
    storageKey,
    columnFilters,
    setColumnFilters,
    userId: userId || undefined,
  });

  // Column ordering hook
  const columnOrdering = useColumnOrdering({
    columns,
    storageKey,
  });

  // Process columns: apply cross-page selection
  const processedColumns = React.useMemo(() => {
    let cols = [...columns];

    if (enableCrossPageSelection && getRowId) {
      cols = cols.map((col) => {
        if (col.id === "select") {
          return crossPageCheckboxColumn(crossPageSelection, getRowId, data);
        }
        return col;
      });
    }

    return cols;
  }, [columns, enableCrossPageSelection, getRowId, crossPageSelection, data]);

  // Determine server-side modes
  const isServerSidePagination = !!onFiltersChange;
  const isServerSideFiltering = !!onFiltersChange;
  const isServerSideSorting = !!serverSideSort;

  // Table instance
  const table = useReactTable({
    data,
    columns: processedColumns,
    onSortingChange: isServerSideSorting ? undefined : setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerSidePagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: isServerSideSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: isServerSideFiltering ? undefined : getFilteredRowModel(),
    onColumnVisibilityChange: columnOrdering.setColumnVisibility,
    onRowSelectionChange: enableCrossPageSelection ? undefined : setRowSelection,
    onColumnOrderChange: columnOrdering.setColumnOrder,
    manualPagination: isServerSidePagination,
    manualFiltering: isServerSideFiltering,
    manualSorting: isServerSideSorting,
    enableRowSelection: enableCrossPageSelection ? false : true,
    getRowId: enableCrossPageSelection && getRowId ? (row) => getRowId(row) : undefined,
    pageCount:
      isServerSidePagination && pagination.paginationMetadata.totalRecords
        ? Math.ceil(pagination.paginationMetadata.totalRecords / pagination.currentPageSize)
        : undefined,
    state: {
      sorting: isServerSideSorting ? [] : sorting,
      columnFilters,
      columnVisibility: columnOrdering.columnVisibility,
      rowSelection,
      columnOrder: columnOrdering.columnOrder,
      ...(isServerSidePagination && {
        pagination: {
          pageIndex: pagination.currentPageNumber - 1,
          pageSize: pagination.currentPageSize,
        },
      }),
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    filterFns: customFilterFns,
  });

  // Calculate active filters
  const activeFilters = React.useMemo<ActiveFilter[]>(() => {
    return columnFilters.map((filter) => {
      let columnName = filter.id;
      columnName = columnName
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      let filterCount = 0;
      if (Array.isArray(filter.value)) {
        filterCount = filter.value.length;
      } else if (filter.value) {
        filterCount = 1;
      }

      return {
        id: filter.id,
        name: columnName,
        count: filterCount,
      };
    });
  }, [columnFilters]);

  const clearAllFilters = React.useCallback(() => {
    setColumnFilters([]);
  }, []);

  const content = (
    <div className={cn("data-table-wrapper", className)}>
      <DataTableToolbar
        table={table}
        showQuickSearch={showQuickSearch}
        quickSearchApiUrl={quickSearchApiUrl}
        onQuickSearchSelect={quickSearch.handleQuickSearchSelect}
        onQuickSearchClear={quickSearch.handleQuickSearchClear}
        savedFilters={savedFiltersHook.savedFilters}
        selectedFilterId={savedFiltersHook.selectedFilterId}
        onSelectFilter={savedFiltersHook.handleSelectFilter}
        onDeleteFilter={savedFiltersHook.handleDeleteFilter}
        onUpdateFilter={savedFiltersHook.handleUpdateFilter}
        showSaveFilterDialog={savedFiltersHook.showSaveFilterDialog}
        setShowSaveFilterDialog={savedFiltersHook.setShowSaveFilterDialog}
        onSaveFilter={savedFiltersHook.handleSaveFilter}
        activeFilters={activeFilters}
        onClearAllFilters={clearAllFilters}
        toolbarSearch={toolbarSearch}
        showColumnVisibility={showColumnVisibility}
        columnOrder={columnOrdering.columnOrder}
        onColumnOrderChange={columnOrdering.setColumnOrder}
        pinnedColumn={columnOrdering.pinnedColumn}
        onPinnedColumnChange={columnOrdering.setPinnedColumn}
        toolbarActions={toolbarActions}
        enableCrossPageSelection={enableCrossPageSelection}
        crossPageSelection={crossPageSelection}
        showExport={showExport}
        exportConfig={exportConfig}
        getRowId={getRowId}
      />

      <DataTableContent
        table={table}
        columns={columns}
        pinnedColumn={columnOrdering.pinnedColumn}
        getOrderedHeaders={columnOrdering.getOrderedHeaders}
        getOrderedCells={columnOrdering.getOrderedCells}
      />

      {showPagination && (
        <Pagination
          table={table}
          totalCount={pagination.paginationMetadata.totalRecords}
          filteredCount={pagination.paginationMetadata.totalRecords}
          onPageChange={pagination.handlePageChange}
          onPageSizeChange={pagination.handlePageSizeChange}
        />
      )}

      <FloatingActionBar
        table={table}
        setRowSelection={setRowSelection}
        enableCrossPageSelection={enableCrossPageSelection}
        crossPageSelection={crossPageSelection}
        customActions={customActions}
        getRowId={getRowId}
      />
    </div>
  );

  if (filterApiFunctions) {
    return (
      <FilterProvider registry={filterApiFunctions} disableFiltering={disableFiltering}>
        {content}
      </FilterProvider>
    );
  }

  return content;
}

// Re-export helper functions from utils
export { createSortableHeader, createActionColumn } from "./utils/columnHelpers";
