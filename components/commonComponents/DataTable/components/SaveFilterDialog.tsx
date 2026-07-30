"use client";

import * as React from "react";
import { HiOutlineBookmark } from "react-icons/hi2";
import { Button } from "@/components/commonComponents/Button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
interface SaveFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (filterName: string) => void;
  existingFilterNames?: string[];
}

export function SaveFilterDialog({
  open,
  onOpenChange,
  onSave,
  existingFilterNames = [],
}: SaveFilterDialogProps) {
  const [filterName, setFilterName] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setFilterName("");
      setError("");
    }
  }, [open]);

  const handleSave = () => {
    const trimmedName = filterName.trim();

    if (!trimmedName) {
      setError("Please enter a filter name");
      return;
    }

    if (existingFilterNames.includes(trimmedName)) {
      setError("A filter with this name already exists");
      return;
    }

    onSave(trimmedName);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filterName.trim()) {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Current Filter</DialogTitle>
          <DialogDescription>
            Give your filter configuration a name to reuse it later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="filter-name" className="text-sm font-medium">
              Filter Name
            </label>
            <Input
              id="filter-name"
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Active Premium Clients"
              className={error ? "border-red-500" : ""}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!filterName.trim()}
            icon={<HiOutlineBookmark className="h-4 w-4" />}
            iconPosition="left"
          >
            Save Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}