import type { Row } from "@tanstack/react-table";

/**
 * Custom filter function for multi-select filtering
 * Checks if the row value is included in the filter array
 */
export function multiSelectFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown
): boolean {
  if (
    !filterValue ||
    !Array.isArray(filterValue) ||
    filterValue.length === 0
  ) {
    return true;
  }
  const value = String(row.getValue(columnId));
  return filterValue.includes(value);
}

/**
 * Custom filter function for number range filtering
 * Checks if the row value falls within the min/max range
 */
export function inNumberRangeFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown
): boolean {
  const [min, max] = filterValue as [number | undefined, number | undefined];
  if (min === undefined && max === undefined) {
    return true;
  }
  const value = row.getValue(columnId);
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return false;
  }
  if (min !== undefined && numValue < min) {
    return false;
  }
  if (max !== undefined && numValue > max) {
    return false;
  }
  return true;
}

/**
 * Custom filter function for date range filtering
 * Checks if the row date value falls within the start/end date range
 */
export function inDateRangeFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown
): boolean {
  const [startDate, endDate] = filterValue as [
    string | undefined,
    string | undefined
  ];
  if (!startDate && !endDate) {
    return true;
  }
  const value = row.getValue(columnId);
  if (!value) {
    return false;
  }
  const date = new Date(value as string | Date);
  if (isNaN(date.getTime())) {
    return false;
  }
  if (startDate && date < new Date(startDate)) {
    return false;
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end day
    if (date > end) {
      return false;
    }
  }
  return true;
}

/**
 * Filter functions object for use with useReactTable
 */
export const customFilterFns = {
  multiSelect: multiSelectFilterFn,
  inNumberRange: inNumberRangeFilterFn,
  inDateRange: inDateRangeFilterFn,
};
