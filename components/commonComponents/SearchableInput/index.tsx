"use client";

import * as React from "react";
import { HiOutlineXMark, HiOutlineChevronDown } from "react-icons/hi2";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader } from "../Loader";

export interface SearchableInputOption {
  value: string;
  label: string;
}

interface SearchableInputProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableInputOption[];
  placeholder?: string;
  className?: string;
  bgColor?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onFocus?: () => void;
}

export function SearchableInput({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  bgColor,
  disabled = false,
  isLoading = false,
  onFocus,
}: SearchableInputProps) {
  const [searchText, setSearchText] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState<"below" | "above">("below");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Find the label for the current value
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : value;

  // Filter options based on search text
  const filteredOptions = React.useMemo(() => {
    if (!searchText.trim()) {
      return options;
    }
    const searchLower = searchText.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchLower) ||
        option.value.toLowerCase().includes(searchLower)
    );
  }, [options, searchText]);

  // Calculate dropdown position when opening
  React.useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 200; // Max height of dropdown

      // Find the scrollable parent (modal content)
      let scrollableParent = containerRef.current.parentElement;
      while (scrollableParent) {
        const style = window.getComputedStyle(scrollableParent);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          break;
        }
        scrollableParent = scrollableParent.parentElement;
      }

      if (scrollableParent) {
        const parentRect = scrollableParent.getBoundingClientRect();
        const spaceBelow = parentRect.bottom - rect.bottom;
        const spaceAbove = rect.top - parentRect.top;

        // Show above if there's not enough space below but enough space above
        if (spaceBelow < dropdownHeight + 10 && spaceAbove > dropdownHeight) {
          setDropdownPosition("above");
        } else {
          setDropdownPosition("below");
        }
      } else {
        // Fallback to viewport calculation
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < dropdownHeight + 10 && spaceAbove > dropdownHeight) {
          setDropdownPosition("above");
        } else {
          setDropdownPosition("below");
        }
      }
    }
  }, [isOpen]);

  // Handle clicks outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if clicking on modal overlay or outside the component
      const target = event.target as Node;
      const isClickingModalOverlay = (event.target as HTMLElement).getAttribute?.('data-radix-dialog-overlay') !== null;

      if (
        isClickingModalOverlay ||
        (containerRef.current &&
          !containerRef.current.contains(target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(target))
      ) {
        setIsOpen(false);
        setSearchText("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
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

  const handleSelectOption = (optionValue: string) => {
    onChange(optionValue);
    setSearchText("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchText("");
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    onFocus?.();
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative w-full">
        {/* <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" /> */}
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={isOpen ? searchText : displayValue}
          onChange={(e) => setSearchText(e.target.value)}
          onFocus={handleInputFocus}
          className={cn(
            "pr-16", bgColor
          )}
          autoComplete="off"
          disabled={disabled}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-muted-foreground hover:text-foreground rounded-sm hover:bg-accent"
            >
              <HiOutlineXMark className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) {
                inputRef.current?.focus();
              }
            }}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <HiOutlineChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute left-0 right-0 z-[100] rounded-md border bg-popover text-popover-foreground shadow-md outline-hidden animate-in fade-in-0 zoom-in-95 w-full",
            dropdownPosition === "below" ? "top-full mt-1" : "bottom-full mb-1"
          )}
          style={{ position: 'absolute' }}
        >
          {isLoading ? (
            <div className="p-4">
              <Loader size="sm" withText />
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
              No options found.
            </div>
          ) : (
            <div className="max-h-[200px] overflow-y-auto p-2">
              <div className="space-y-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectOption(option.value);
                    }}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                      value === option.value && "bg-accent"
                    )}
                  >
                    <span className="text-sm">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
