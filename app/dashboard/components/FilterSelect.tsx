"use client";

import * as React from "react";
import { HiOutlineCheck, HiOutlineChevronDown } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FilterSelectProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  placeholder?: string;
  multiple?: boolean;
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder = `All ${label}`,
  multiple = false,
}: FilterSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Multi-select variant
  if (multiple) {
    const handleToggle = (option: string) => {
      const newValue = value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option];
      onChange(newValue);
    };

    const handleClearAll = () => {
      onChange([]);
    };

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-9"
            >
              {value.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {value.length} selected
                  </Badge>
                </div>
              )}
              <HiOutlineChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-61" align="start">
            <div className="max-h-[300px] overflow-y-auto">
              {value.length > 0 && (
                <div className="flex items-center justify-between p-2 border-b">
                  <span className="text-xs text-muted-foreground">
                    {value.length} of {options.length} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-7 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              )}
              <div className="p-1">
                {options.map((option) => {
                  const isSelected = value.includes(option);
                  return (
                    <div
                      key={option}
                      className={cn(
                        "flex items-center space-x-2 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent",
                        isSelected && "bg-accent/50"
                      )}
                      onClick={() => handleToggle(option)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggle(option)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm flex-1">{option}</span>
                      {isSelected && (
                        <HiOutlineCheck className="size-4 text-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Single-select variant
  const handleChange = (newValue: string) => {
    if (newValue === "all") {
      onChange([]);
    } else {
      onChange([newValue]);
    }
  };

  const selectedValue = value.length > 0 ? value[0] : "all";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select value={selectedValue} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="z-61">
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
