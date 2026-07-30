import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { TableData } from "./types";

/**
 * Boolean column (Yes/No, Active/Inactive, etc.)
 */
export const booleanColumn = <T extends TableData>(
  accessor: string,
  label: string,
  trueLabel: string = "Yes",
  falseLabel: string = "No"
): ColumnDef<T> => ({
  accessorKey: accessor,
  header: label,
  cell: ({ row }) => {
    const value = row.getValue(accessor) as boolean;
    return (
      <Badge variant={value ? "default" : "outline"}>
        {value ? trueLabel : falseLabel}
      </Badge>
    );
  },
});