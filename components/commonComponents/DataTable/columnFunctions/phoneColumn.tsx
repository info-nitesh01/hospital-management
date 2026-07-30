import { ColumnDef } from "@tanstack/react-table";
import { HiOutlinePhone } from "react-icons/hi2";
import { createSortableHeader } from "../index";
import { TableData } from "./types";

/**
 * Phone column with tel link
 */
export const phoneColumn = <T extends TableData>(accessor: string = "phone"): ColumnDef<T> => ({
  accessorKey: accessor,
  header: createSortableHeader("Phone"),
  cell: ({ row }) => {
    const phone = row.getValue(accessor) as string;
    return phone ? (
      <a
        href={`tel:${phone}`}
        className="text-primary hover:underline inline-flex items-center gap-1"
      >
        <HiOutlinePhone className="h-3 w-3" />
        {phone}
      </a>
    ) : (
      <span className="text-muted-foreground">-</span>
    );
  },
});