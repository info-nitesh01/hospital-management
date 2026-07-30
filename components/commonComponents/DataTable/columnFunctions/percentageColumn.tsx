import { ColumnDef } from "@tanstack/react-table";
import { createSortableHeader } from "../index";
import { TableData } from "./types";

/**
 * Percentage column with progress bar
 */
export const percentageColumn = <T extends TableData>(
  accessor: string,
  label: string = "Percentage"
): ColumnDef<T> => ({
  accessorKey: accessor,
  header: createSortableHeader(label),
  cell: ({ row }) => {
    const value = parseFloat(row.getValue(accessor) as string);
    if (isNaN(value)) return <span className="text-muted-foreground">-</span>;

    return (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
          <div
            className="bg-primary h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
        <span className="text-sm font-medium">{value}%</span>
      </div>
    );
  },
});