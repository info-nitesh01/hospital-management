"use client";

import * as React from "react";
import { Column } from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HiOutlineBars3 } from "react-icons/hi2";
import { BsPin } from "react-icons/bs";
import { Button } from "@/components/commonComponents/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { HiOutlineArrowsRightLeft } from "react-icons/hi2";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Helper function to extract column title from column definition
 */
function getColumnTitle<TData>(column: Column<TData, unknown>): string {
  // Check if meta has title
  if (column.columnDef.meta && 'title' in column.columnDef.meta && typeof column.columnDef.meta.title === 'string') {
    return column.columnDef.meta.title;
  }

  // Check if header is a string
  if (typeof column.columnDef.header === 'string') {
    return column.columnDef.header;
  }

  // Fallback to column id with formatting
  return column.id
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
}

interface SortableColumnItemProps<TData> {
  column: Column<TData, unknown>;
  id: string;
  isPinned: boolean;
  onTogglePin: (columnId: string) => void;
}

function SortableColumnItem<TData>({
  column,
  id,
  isPinned,
  onTogglePin,
}: SortableColumnItemProps<TData>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
        isDragging ? "opacity-50 bg-muted" : "hover:bg-muted/50"
      )}
    >
      <button
        className="cursor-grab hover:cursor-grabbing focus:outline-none"
        {...attributes}
        {...listeners}
      >
        <HiOutlineBars3 className="h-4 w-4 text-muted-foreground" />
      </button>

      <Checkbox
        checked={column.getIsVisible()}
        onCheckedChange={(value) => column.toggleVisibility(!!value)}
        className="mr-2"
      />

      <span className="flex-1 text-sm">{getColumnTitle(column)}</span>

      <button
        onClick={() => onTogglePin(column.id)}
        className={cn(
          "p-1 rounded hover:bg-muted transition-colors",
          isPinned && "text-primary"
        )}
        title={isPinned ? "Unpin column" : "Pin column to start"}
      >
        <BsPin className={cn("h-4 w-4", isPinned && "fill-current")} />
      </button>
    </div>
  );
}

interface ColumnOrderDialogProps<TData> {
  columns: Column<TData, unknown>[];
  columnOrder: string[];
  onColumnOrderChange: (newOrder: string[]) => void;
  pinnedColumn: string | null;
  onPinnedColumnChange: (columnId: string | null) => void;
}


export function ColumnOrderDialog<TData>({
  columns,
  columnOrder,
  onColumnOrderChange,
  pinnedColumn,
  onPinnedColumnChange,
}: ColumnOrderDialogProps<TData>) {
  const [localColumnOrder, setLocalColumnOrder] = React.useState(columnOrder);
  const [open, setOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get hideable columns in the current order
  const hideableColumns = React.useMemo(() => {
    const columnsById = Object.fromEntries(
      columns
        .filter((column) => column.getCanHide())
        .map((column) => [column.id, column])
    );

    // Get columns in the specified order
    const orderedColumns = localColumnOrder
      .filter((id) => columnsById[id])
      .map((id) => columnsById[id]);

    // If there's a pinned column, move it to the top
    if (pinnedColumn) {
      const pinnedIndex = orderedColumns.findIndex((col) => col.id === pinnedColumn);
      if (pinnedIndex > -1) {
        const [pinned] = orderedColumns.splice(pinnedIndex, 1);
        orderedColumns.unshift(pinned);
      }
    }

    return orderedColumns;
  }, [columns, localColumnOrder, pinnedColumn]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localColumnOrder.indexOf(active.id as string);
      const newIndex = localColumnOrder.indexOf(over.id as string);

      const newOrder = arrayMove(localColumnOrder, oldIndex, newIndex);
      setLocalColumnOrder(newOrder);
      onColumnOrderChange(newOrder);
    }
  };

  // Reset local order when dropdown closes
  React.useEffect(() => {
    if (open) {
      setLocalColumnOrder(columnOrder);
    }
  }, [open, columnOrder]);

  // Handle toggling pin for a column
  const handleTogglePin = (columnId: string) => {
    // If this column is already pinned, unpin it
    if (pinnedColumn === columnId) {
      onPinnedColumnChange(null);
    } else {
      // Pin this column (only one can be pinned at a time)
      onPinnedColumnChange(columnId);
    }
  };

  // const visibleCount = hideableColumns.filter(col => col.getIsVisible()).length;
  // const totalCount = hideableColumns.length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="aspect-square">
                  <HiOutlineArrowsRightLeft />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Manage columns</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[300px] p-2"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="mb-2 px-3 py-2 text-sm font-medium text-muted-foreground">
          Drag to reorder • Click to toggle
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localColumnOrder.filter((id) =>
              hideableColumns.some((col) => col.id === id)
            )}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {hideableColumns.map((column) => (
                <SortableColumnItem
                  key={column.id}
                  id={column.id}
                  column={column}
                  isPinned={pinnedColumn === column.id}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="mt-3 flex items-center justify-between px-3 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              hideableColumns.forEach((col) => col.toggleVisibility(true));
            }}
            className="h-8 text-xs"
          >
            Show all
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              hideableColumns.forEach((col) => col.toggleVisibility(false));
            }}
            className="h-8 text-xs"
          >
            Hide all
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
