"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface YearPickerProps {
  value?: string;
  onChange?: (year: string) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
  className?: string;
}

const YEARS_PER_PAGE = 12;

export function YearPicker({
  value,
  onChange,
  placeholder = "Select Year",
  minYear = new Date().getFullYear() - 50,
  maxYear = new Date().getFullYear(),
  disabled = false,
  className,
}: YearPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [startYear, setStartYear] = React.useState(() => {
    const selectedYear = value ? parseInt(value) : new Date().getFullYear();
    return Math.floor(selectedYear / YEARS_PER_PAGE) * YEARS_PER_PAGE;
  });

  const years = React.useMemo(() => {
    const yearList: number[] = [];
    for (let i = 0; i < YEARS_PER_PAGE; i++) {
      const year = startYear + i;
      if (year >= minYear && year <= maxYear) {
        yearList.push(year);
      }
    }
    return yearList;
  }, [startYear, minYear, maxYear]);

  const canGoPrev = startYear > minYear;
  const canGoNext = startYear + YEARS_PER_PAGE <= maxYear;

  const handlePrevious = () => {
    if (canGoPrev) {
      setStartYear((prev) => prev - YEARS_PER_PAGE);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setStartYear((prev) => prev + YEARS_PER_PAGE);
    }
  };

  const handleSelectYear = (year: number) => {
    onChange?.(year.toString());
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value || placeholder}
          <div className="flex items-center gap-1 ml-2">
            {value && (
              <span
                role="button"
                onClick={handleClear}
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100 rounded-sm hover:bg-muted flex items-center justify-center"
              >
                <XIcon className="h-3 w-3" />
              </span>
            )}
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-3">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePrevious}
              disabled={!canGoPrev}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {startYear} - {Math.min(startYear + YEARS_PER_PAGE - 1, maxYear)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleNext}
              disabled={!canGoNext}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Year Grid */}
          <div className="grid grid-cols-3 gap-2">
            {years.map((year) => (
              <Button
                key={year}
                variant={value === year.toString() ? "default" : "ghost"}
                size="sm"
                className="h-9"
                onClick={() => handleSelectYear(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
