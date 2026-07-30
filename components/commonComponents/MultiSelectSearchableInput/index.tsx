"use client";

import * as React from "react";
import { HiOutlineXMark, HiOutlineChevronDown, HiMagnifyingGlass } from "react-icons/hi2";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/commonComponents/Button";
import { Loader } from "@/components/commonComponents/Loader";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectSearchableInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onFocus?: () => void;
  showSelectAll?: boolean;
  maxDisplayItems?: number;
}

export function MultiSelectSearchableInput({
  values,
  onChange,
  options,
  placeholder = "Select...",
  className,
  disabled = false,
  isLoading = false,
  onFocus,
  showSelectAll = true,
  maxDisplayItems = 2,
}: MultiSelectSearchableInputProps) {
  const [searchText, setSearchText] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Filter options based on search text
  const filteredOptions = React.useMemo(() => {
    if (!searchText.trim()) {
      return options;
    }
    const searchLower = searchText.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchLower)
    );
  }, [options, searchText]);

  // Get display text for selected values
  const displayText = React.useMemo(() => {
    if (values.length === 0) return "";
    const selectedLabels = options
      .filter((opt) => values.includes(opt.value))
      .map((opt) => opt.label);

    if (selectedLabels.length <= maxDisplayItems) {
      return selectedLabels.join(", ");
    }
    return `${selectedLabels.length} selected`;
  }, [values, options, maxDisplayItems]);

  // Handle clicks outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchText("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown when Escape key is pressed
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchText("");
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleToggle = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter((v) => v !== optionValue));
    } else {
      onChange([...values, optionValue]);
    }
  };

  const handleSelectAll = () => {
    const filteredIds = filteredOptions.map((opt) => opt.value);
    const allSelected = filteredIds.every((id) => values.includes(id));

    if (allSelected) {
      onChange(values.filter((v) => !filteredIds.includes(v)));
    } else {
      onChange([...new Set([...values, ...filteredIds])]);
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    onFocus?.();
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setSearchText("");
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
    setSearchText("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger */}
      <div
        className={cn(
          "flex items-center justify-between w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm cursor-pointer hover:bg-muted/50",
          disabled && "opacity-50 pointer-events-none"
        )}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) onFocus?.();
          }
        }}
      >
        <span className={cn("truncate", values.length === 0 && "text-muted-foreground")}>
          {values.length === 0 ? placeholder : displayText}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {values.length > 0 && !disabled && (
            <button
              type="button"
              className="p-0.5 rounded-full hover:bg-muted"
              onClick={handleClearAll}
            >
              <HiOutlineXMark className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <HiOutlineChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg"
        >
          {/* Search input */}
          <div className="p-2 border-b">
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={handleInputFocus}
                className="h-8 text-sm pl-9"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-4">
              <Loader size="sm" withText />
            </div>
          ) : (
            <>
              {/* Select All */}
              {showSelectAll && filteredOptions.length > 0 && (
                <div
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer border-b"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAll();
                  }}
                >
                  <Checkbox
                    checked={
                      filteredOptions.length > 0 &&
                      filteredOptions.every((opt) => values.includes(opt.value))
                    }
                  />
                  <span className="text-sm">Select All</span>
                </div>
              )}

              {/* Options */}
              <div className="max-h-[150px] overflow-y-auto">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(option.value);
                    }}
                  >
                    <Checkbox checked={values.includes(option.value)} />
                    <span className="text-sm">{option.label}</span>
                  </div>
                ))}
                {filteredOptions.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No options found
                  </div>
                )}
              </div>

              {/* Cancel / Apply buttons */}
              <div className="flex gap-2 p-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  onClick={handleApply}
                >
                  Apply
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
