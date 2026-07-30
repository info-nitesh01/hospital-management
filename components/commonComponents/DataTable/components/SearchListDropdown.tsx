import * as React from "react";
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from "react-icons/hi2";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuickSearchResult } from "../hooks/useQuickSearch";
import { Loader } from "@/components/commonComponents/Loader";

interface SearchListDropdownProps {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  results: QuickSearchResult[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectResult?: (result: QuickSearchResult) => void;
  onClearSearch?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchListDropdown({
  searchText,
  onSearchTextChange,
  results,
  isLoading,
  error,
  isOpen,
  onOpenChange,
  onSelectResult,
  onClearSearch,
  placeholder = "Search...",
  className,
}: SearchListDropdownProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClearSearch = () => {
    onSearchTextChange("");
    onOpenChange(false);
    // Notify parent to clear the search filter
    if (onClearSearch) {
      onClearSearch();
    }
    // Keep focus on input after clearing
    inputRef.current?.focus();
  };

  const handleSelectResult = (result: QuickSearchResult) => {
    if (onSelectResult) {
      onSelectResult(result);
    }
    onOpenChange(false);
  };

  return (
    <Popover
      open={isOpen && (results.length > 0 || error !== null || searchText.trim() !== "")}
      onOpenChange={onOpenChange}
      modal={false}
    >
      <PopoverTrigger asChild>
        <div className={cn("relative w-full", className)}>
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={searchText}
            onChange={(e) => {
              onSearchTextChange(e.target.value);
              // Close dropdown and clear filter when clearing input
              if (!e.target.value.trim()) {
                onOpenChange(false);
                if (onClearSearch) {
                  onClearSearch();
                }
              }
            }}
            className="pl-9 pr-9 h-8"
            autoComplete="off"
          />
          {searchText && !isLoading && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <HiOutlineXMark className="h-4 w-4" />
            </button>
          )}
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader size="sm" />
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <div className="p-2">
          {error && (
            <div className="p-4 text-sm text-destructive">
              {error}
            </div>
          )}
          {!error && !isLoading && results.length === 0 && searchText && (
            <div className="p-4 text-sm text-center text-muted-foreground">
              No results found.
            </div>
          )}
          {!error && results.length > 0 && (
            <ScrollArea className="max-h-[300px] overflow-y-auto">
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div
                    key={`${result.key}-${index}`}
                    onClick={() => handleSelectResult(result)}
                    className="flex flex-col gap-1 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors"
                  >
                    <span className="text-sm font-medium">
                      {result.quickSearchDescription}
                    </span>
                    {result.description !== result.quickSearchDescription && (
                      <span className="text-xs text-muted-foreground">
                        {result.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
