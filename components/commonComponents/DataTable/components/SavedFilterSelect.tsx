"use client";

import * as React from "react";
import { BiFilterAlt } from "react-icons/bi";
import { PiTrash } from "react-icons/pi";
import { IoCheckmark } from "react-icons/io5";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/commonComponents/Button";
import {
  DropdownMenuSeparator
  } from "@/components/ui/dropdown-menu";
import type { SavedFilter } from "../types";

interface SavedFilterSelectProps {
  savedFilters: SavedFilter[];
  selectedFilterId: string | null;
  onSelectFilter: (filterId: string | null) => void;
  onDeleteFilter: (filterId: string) => void;
  onUpdateFilter: (filterId: string) => void;
}

export function SavedFilterSelect({
  savedFilters,
  selectedFilterId,
  onSelectFilter,
  onDeleteFilter,
  onUpdateFilter,
}: SavedFilterSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedFilter = savedFilters.find(f => f.id === selectedFilterId);

  const handleSelect = (value: string) => {
    if (value === "none") {
      onSelectFilter(null);
    } else {
      onSelectFilter(value);
    }
  };

  const handleDelete = (e: React.MouseEvent, filterId: string) => {
    e.stopPropagation();
    onDeleteFilter(filterId);
    if (selectedFilterId === filterId) {
      onSelectFilter(null);
    }
  };

  const handleUpdate = (e: React.MouseEvent, filterId: string) => {
    e.stopPropagation();
    onUpdateFilter(filterId);
  };

  if (savedFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 w-full relative">
      <BiFilterAlt className="h-4 w-4 text-muted-foreground absolute left-3" />
      <Select
        value={selectedFilterId || "none"}
        onValueChange={handleSelect}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className="w-full lg:w-1/2 ps-10" size="sm">
          <SelectValue placeholder="Select a saved filter">
            {selectedFilter ? selectedFilter.name : "No filter selected"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <div className="flex items-center gap-2">
              <span>No filter</span>
            </div>
          </SelectItem>
          <DropdownMenuSeparator />
          {savedFilters.map((filter) => (
            <div
              key={filter.id}
              className="relative flex items-center justify-between group"
            >
              <SelectItem
                value={filter.id}
                className="flex-1 pr-20"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{filter.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {filter.updatedAt.split('T')[0]}
                    </span>
                  </div>
                </div>
              </SelectItem>
              <div
                className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => handleUpdate(e, filter.id)}
                  title="Update filter with current settings"
                >
                  <IoCheckmark className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:text-destructive"
                  onClick={(e) => handleDelete(e, filter.id)}
                  title="Delete filter"
                >
                  <PiTrash className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}