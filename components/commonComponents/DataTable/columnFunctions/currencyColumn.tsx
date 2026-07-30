import { ColumnDef } from "@tanstack/react-table";
import { createSortableHeader } from "../index";
import { TableData } from "./types";

/**
 * Currency column with formatting and optional range filter
 */
export const currencyColumn = <T extends TableData>(
  accessor: string,
  label: string = "Amount",
  currency: string = "USD",
  enableFilter: boolean | "range" = false
): ColumnDef<T> => ({
  accessorKey: accessor,
  header: createSortableHeader(label, enableFilter, currency),
  filterFn: enableFilter === "range" ? "inNumberRange" : undefined,
  cell: ({ row }) => {
    const amount = parseFloat(row.getValue(accessor) as string);
    if (isNaN(amount)) return <span className="text-muted-foreground">-</span>;

    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);

    return (
      <div className="font-medium inline-flex items-center gap-1">
        {formatted}
      </div>
    );
  },
});