import * as XLSX from "xlsx";
import { ColumnDef, Row } from "@tanstack/react-table";

export type ExportMode = "all" | "filtered" | "selected";

/**
 * Export table data to Excel file
 * @param data - The data array to export (can be raw data or Row objects)
 * @param columns - The column definitions
 * @param fileName - The base filename for the export
 * @param mode - Export mode: all, filtered, or selected data
 */
export function exportToExcel<TData, TValue = unknown>(
  data: TData[] | Row<TData>[],
  columns: ColumnDef<TData, TValue>[],
  fileName: string = "table_data",
  mode: ExportMode = "all"
) {
  // Check if data is an array of Row objects or raw data
  const isRowData = data.length > 0 && "original" in (data[0] as Row<TData>);

  // Extract the actual data from Row objects if needed
  const extractedData = isRowData
    ? (data as Row<TData>[]).map(row => row.original)
    : data as TData[];
  // Get visible columns (excluding actions column and select column)
  const visibleColumns = columns.filter(
    (col) => col.id !== "actions" && col.id !== "select"
  );

  // Get column headers
  const headers = visibleColumns.map((col) => {
    // Extract header text from column definition
    if (typeof col.header === "string") return col.header;
    if (col.id) return col.id.charAt(0).toUpperCase() + col.id.slice(1);
    if ("accessorKey" in col && col.accessorKey) {
      const key = String(col.accessorKey);
      return key.charAt(0).toUpperCase() + key.slice(1);
    }
    return "";
  });

  // Transform data for export
  const exportData = extractedData.map((row) => {
    const rowData: Record<string, unknown> = {};
    visibleColumns.forEach((col, index) => {
      const key = headers[index];
      if ("accessorKey" in col && col.accessorKey) {
        rowData[key] = (row as Record<string, unknown>)[String(col.accessorKey)];
      } else if (col.id && col.id in (row as Record<string, unknown>)) {
        rowData[key] = (row as Record<string, unknown>)[col.id];
      }
    });
    return rowData;
  });

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Generate Excel file and trigger download
  const timestamp = new Date().toISOString().split("T")[0];
  const formattedFileName = `${mode}_${fileName}_records_${timestamp}.xlsx`;
  XLSX.writeFile(workbook, formattedFileName);
}

/**
 * Helper function to determine what data to export based on selection and filter state
 */
export function getExportData<TData>(
  allData: TData[],
  filteredRows: Row<TData>[],
  selectedRows: Row<TData>[]
): { data: TData[] | Row<TData>[]; mode: ExportMode; count: number } {
  // Priority 1: If rows are selected, export selected rows
  if (selectedRows.length > 0) {
    return {
      data: selectedRows,
      mode: "selected",
      count: selectedRows.length
    };
  }

  // Priority 2: If filters are applied (filtered data differs from all data), export filtered
  if (filteredRows.length > 0 && filteredRows.length !== allData.length) {
    return {
      data: filteredRows,
      mode: "filtered",
      count: filteredRows.length
    };
  }

  // Priority 3: Export all data
  return {
    data: allData,
    mode: "all",
    count: allData.length
  };
}