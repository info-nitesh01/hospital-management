"use client";

import * as React from "react";
import { ColumnDef, Header, Cell, VisibilityState } from "@tanstack/react-table";

interface UseColumnOrderingProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  storageKey?: string;
}

export interface UseColumnOrderingReturn<TData> {
  columnOrder: string[];
  setColumnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  columnVisibility: VisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  pinnedColumn: string | null;
  setPinnedColumn: React.Dispatch<React.SetStateAction<string | null>>;
  getOrderedHeaders: (headers: Header<TData, unknown>[]) => Header<TData, unknown>[];
  getOrderedCells: (cells: Cell<TData, unknown>[]) => Cell<TData, unknown>[];
}

export function useColumnOrdering<TData, TValue>({
  columns,
  storageKey,
}: UseColumnOrderingProps<TData, TValue>): UseColumnOrderingReturn<TData> {
  // Initialize column order from columns
  const initialColumnOrder = React.useMemo(
    () =>
      columns
        .map((col) => {
          if (typeof col.id === "string") return col.id;
          if ("accessorKey" in col && typeof col.accessorKey === "string")
            return col.accessorKey;
          return null;
        })
        .filter(Boolean) as string[],
    [columns]
  );

  // Initialize with default values to prevent hydration mismatch
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = React.useState<string[]>(initialColumnOrder);
  const [pinnedColumn, setPinnedColumn] = React.useState<string | null>(null);

  // Update column order when columns change (from API)
  React.useEffect(() => {
    // Check if current columnOrder matches initialColumnOrder
    const orderChanged =
      initialColumnOrder.length !== columnOrder.length ||
      initialColumnOrder.some((id, idx) => id !== columnOrder[idx]);

    if (orderChanged) {
      // If no saved preferences, use initialColumnOrder directly
      if (!storageKey || typeof window === "undefined") {
        setColumnOrder(initialColumnOrder);
        return;
      }

      try {
        const saved = localStorage.getItem(`table-preferences-${storageKey}`);
        if (!saved) {
          // No saved preferences, use API order
          setColumnOrder(initialColumnOrder);
        } else {
          // Merge saved order with new columns from API
          const preferences = JSON.parse(saved);
          const savedOrder = (preferences.columnOrder as string[]) || [];

          // Filter saved order to only include columns that still exist
          const validSavedOrder = savedOrder.filter((id) =>
            initialColumnOrder.includes(id)
          );

          // Add any new columns that aren't in the saved order (in API's sortOrder)
          const newColumns = initialColumnOrder.filter(
            (id) => !savedOrder.includes(id)
          );

          // Merge: valid saved order + new columns
          const mergedOrder = [...validSavedOrder, ...newColumns];

          setColumnOrder(mergedOrder);
        }
      } catch (error) {
        console.error("Error loading column order:", error);
        setColumnOrder(initialColumnOrder);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialColumnOrder, storageKey]);

  // Load saved preferences from localStorage after mount (visibility and pinned column)
  React.useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(`table-preferences-${storageKey}`);
      if (saved) {
        const preferences = JSON.parse(saved);
        if (preferences.columnVisibility) {
          setColumnVisibility(preferences.columnVisibility);
        }
        if (preferences.pinnedColumn !== undefined) {
          setPinnedColumn(preferences.pinnedColumn);
        }
      }
    } catch (error) {
      console.error("Error loading table preferences:", error);
    }
  }, [storageKey]);

  // Save preferences to localStorage
  React.useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;

    const savePreferences = () => {
      try {
        const preferences = {
          columnOrder,
          columnVisibility,
          pinnedColumn,
        };
        localStorage.setItem(
          `table-preferences-${storageKey}`,
          JSON.stringify(preferences)
        );
      } catch (error) {
        console.error("Error saving table preferences:", error);
      }
    };

    // Debounce saving to avoid excessive localStorage writes
    const timeoutId = setTimeout(savePreferences, 500);
    return () => clearTimeout(timeoutId);
  }, [columnOrder, columnVisibility, pinnedColumn, storageKey]);

  // Helper function to order headers based on columnOrder state
  const getOrderedHeaders = React.useCallback(
    (headers: Header<TData, unknown>[]): Header<TData, unknown>[] => {
      const headerMap = new Map(headers.map((h) => [h.id, h]));
      const orderedHeaders: Header<TData, unknown>[] = [];

      // First, add the select column if it exists
      if (headerMap.has("select")) {
        orderedHeaders.push(headerMap.get("select")!);
      }

      // Then, add the pinned column if it exists
      if (pinnedColumn && headerMap.has(pinnedColumn)) {
        orderedHeaders.push(headerMap.get(pinnedColumn)!);
      }

      // Add remaining headers in the specified order (excluding select, pinned, and actions)
      columnOrder.forEach((colId) => {
        if (
          headerMap.has(colId) &&
          colId !== "select" &&
          colId !== pinnedColumn &&
          colId !== "actions"
        ) {
          orderedHeaders.push(headerMap.get(colId)!);
        }
      });

      // Finally, add actions column if it exists
      if (headerMap.has("actions")) {
        orderedHeaders.push(headerMap.get("actions")!);
      }

      // Add any remaining headers not in columnOrder
      headers.forEach((header) => {
        if (
          !columnOrder.includes(header.id) &&
          header.id !== "select" &&
          header.id !== pinnedColumn &&
          header.id !== "actions"
        ) {
          orderedHeaders.push(header);
        }
      });

      return orderedHeaders;
    },
    [columnOrder, pinnedColumn]
  );

  // Helper function to order cells based on columnOrder state
  const getOrderedCells = React.useCallback(
    (cells: Cell<TData, unknown>[]): Cell<TData, unknown>[] => {
      const cellMap = new Map(cells.map((c) => [c.column.id, c]));
      const orderedCells: Cell<TData, unknown>[] = [];

      // First, add the select column if it exists
      if (cellMap.has("select")) {
        orderedCells.push(cellMap.get("select")!);
      }

      // Then, add the pinned column if it exists
      if (pinnedColumn && cellMap.has(pinnedColumn)) {
        orderedCells.push(cellMap.get(pinnedColumn)!);
      }

      // Add remaining cells in the specified order (excluding select, pinned, and actions)
      columnOrder.forEach((colId) => {
        if (
          cellMap.has(colId) &&
          colId !== "select" &&
          colId !== pinnedColumn &&
          colId !== "actions"
        ) {
          orderedCells.push(cellMap.get(colId)!);
        }
      });

      // Finally, add actions column if it exists
      if (cellMap.has("actions")) {
        orderedCells.push(cellMap.get("actions")!);
      }

      // Add any remaining cells not in columnOrder
      cells.forEach((cell) => {
        if (
          !columnOrder.includes(cell.column.id) &&
          cell.column.id !== "select" &&
          cell.column.id !== pinnedColumn &&
          cell.column.id !== "actions"
        ) {
          orderedCells.push(cell);
        }
      });

      return orderedCells;
    },
    [columnOrder, pinnedColumn]
  );

  return {
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
    pinnedColumn,
    setPinnedColumn,
    getOrderedHeaders,
    getOrderedCells,
  };
}
