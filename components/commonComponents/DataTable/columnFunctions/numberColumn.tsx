import { ColumnDef, FilterFnOption } from "@tanstack/react-table";
import { createSortableHeader } from "../index";
import { TableData } from "./types";

/**
 * Number column with optional formatting and range filter
 */
export const numberColumn = <T extends TableData>(
  accessor: string,
  label: string,
  suffix?: string,
  enableFilter: boolean | "range" = false
): ColumnDef<T> => ({
  accessorKey: accessor,
  header: createSortableHeader(label, enableFilter),
  filterFn: enableFilter === "range" ? ("inNumberRange" as FilterFnOption<T>) : undefined,
  cell: ({ row }) => {
    const value = row.getValue(accessor) as number | null | undefined;
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>;
    }
    return (
      <div className="font-medium">
        {value.toLocaleString()}{suffix && ` ${suffix}`}
      </div>
    );
  },
});