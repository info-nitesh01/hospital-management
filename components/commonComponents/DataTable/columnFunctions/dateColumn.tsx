import { ColumnDef, FilterFnOption } from "@tanstack/react-table";
import { HiOutlineCalendar } from "react-icons/hi2";
import { createSortableHeader } from "../index";
import { TableData } from "./types";

/**
 * Date column with consistent formatting and optional date range filter
 */
export const dateColumn = <T extends TableData>(
  accessor: string,
  label: string = "Date",
  enableFilter: boolean | "dateRange" = false
): ColumnDef<T> => ({
  accessorKey: accessor,
  header: createSortableHeader(label, enableFilter),
  filterFn: enableFilter === "dateRange" ? ("inDateRange" as FilterFnOption<T>) : undefined,
  cell: ({ row }) => {
    const dateValue = row.getValue(accessor);
    if (!dateValue) return <span className="text-muted-foreground">-</span>;

    const date = new Date(dateValue as string);
    return (
      <div className="inline-flex items-center gap-1">
        <HiOutlineCalendar className="h-3 w-3" />
        {date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </div>
    );
  },
});