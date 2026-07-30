import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { UseCrossPageSelectionReturn } from "../hooks/useCrossPageSelection";

/**
 * Cross-page checkbox column for row selection
 * This column works with the useCrossPageSelection hook to enable selection across pages
 */
export const crossPageCheckboxColumn = <T,>(
  crossPageSelection: UseCrossPageSelectionReturn,
  getRowId: (row: T) => string,
  currentPageData: T[]
): ColumnDef<T> => ({
  id: "select",
  header: () => {
    const selectionInfo = crossPageSelection.getSelectionInfo();
    const allRecordsSelected = selectionInfo.isSelectAll;

    // Check if all visible rows are selected (for indeterminate state)
    const allPageRowsSelected = currentPageData.length > 0 && currentPageData.every((row) => {
      const rowId = getRowId(row);
      return crossPageSelection.isRowSelected(rowId);
    });

    const somePageRowsSelected = currentPageData.some((row) => {
      const rowId = getRowId(row);
      return crossPageSelection.isRowSelected(rowId);
    }) && !allPageRowsSelected && !allRecordsSelected;

    return (
      <Checkbox
        checked={allRecordsSelected || allPageRowsSelected || (somePageRowsSelected && "indeterminate")}
        onCheckedChange={(checked) => {
          // When checking: select all records across all pages
          // When unchecking: clear all selections
          if (checked) {
            crossPageSelection.toggleSelectAllPages(true);
          } else {
            crossPageSelection.clearSelection();
          }
        }}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    );
  },
  cell: ({ row }) => {
    const rowData = row.original;
    const rowId = getRowId(rowData);
    const isSelected = crossPageSelection.isRowSelected(rowId);

    return (
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => {
          crossPageSelection.toggleRow(rowId);
        }}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    );
  },
  enableSorting: false,
  enableHiding: false,
});
