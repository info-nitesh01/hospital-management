"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterSelect } from "./FilterSelect";
import type { DashboardFilters } from "@/app/dashboard/utils/filterHelpers";
import { getDefaultFilters } from "@/app/dashboard/utils/filterHelpers";

interface DashboardFilterSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  filterOptions: {
    clients: string[];
    owners: string[];
    properties: string[];
    states: string[];
    counties: string[];
    years: string[];
  };
  currentTab?: string;
}

export function DashboardFilterSidebar({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  filterOptions,
  currentTab = "notices-appeals",
}: DashboardFilterSidebarProps) {
  // Local pending state - only updates parent when Apply is clicked
  const [pendingFilters, setPendingFilters] = React.useState<DashboardFilters>(filters);
  const [isYearRange, setIsYearRange] = React.useState(false);
  const [fromYear, setFromYear] = React.useState<string>("");
  const [toYear, setToYear] = React.useState<string>("");

  // Sync pending filters when the sheet opens or filters prop changes
  React.useEffect(() => {
    if (open) {
      setPendingFilters(filters);
      setIsYearRange(false);
      setFromYear("");
      setToYear("");
    }
  }, [open, filters]);

  const handleFilterChange = (key: keyof DashboardFilters, value: string[]) => {
    setPendingFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleYearRangeChange = () => {
    if (fromYear && toYear) {
      const from = parseInt(fromYear);
      const to = parseInt(toYear);
      const yearRange: string[] = [];

      for (let year = from; year <= to; year++) {
        if (filterOptions.years.includes(year.toString())) {
          yearRange.push(year.toString());
        }
      }

      setPendingFilters((prev) => ({
        ...prev,
        years: yearRange,
      }));
    }
  };

  React.useEffect(() => {
    if (isYearRange && fromYear && toYear) {
      handleYearRangeChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromYear, toYear, isYearRange]);

  const handleApply = () => {
    console.log("Applied Filters:", pendingFilters);
    onFiltersChange(pendingFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    const defaultFilters = getDefaultFilters();
    setPendingFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  // Check if current tab is billing-pipeline or calendar
  const isBillingPipeline = currentTab === "billing-pipeline";
  const isCalendar = currentTab === "calendar";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[400px] sm:max-w-[400px] flex flex-col">
        <SheetHeader className="border-b">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-6">
          {!isCalendar && (
            <FilterSelect
              label="Client"
              value={pendingFilters.clients}
              onChange={(value) => handleFilterChange("clients", value)}
              options={filterOptions.clients}
              placeholder="All Clients"
              multiple
            />
          )}

          {!isBillingPipeline && !isCalendar && (
            <>
              <FilterSelect
                label="Owner"
                value={pendingFilters.owners}
                onChange={(value) => handleFilterChange("owners", value)}
                options={filterOptions.owners}
                placeholder="All Owners"
                multiple
              />

              <FilterSelect
                label="Properties"
                value={pendingFilters.properties}
                onChange={(value) => handleFilterChange("properties", value)}
                options={filterOptions.properties}
                placeholder="All Properties"
                multiple
              />

              <FilterSelect
                label="State"
                value={pendingFilters.states}
                onChange={(value) => handleFilterChange("states", value)}
                options={filterOptions.states}
                placeholder="All States"
              />

              <FilterSelect
                label="County"
                value={pendingFilters.counties}
                onChange={(value) => handleFilterChange("counties", value)}
                options={filterOptions.counties}
                placeholder="All Counties"
                multiple
              />
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">{isBillingPipeline || isCalendar ? "Tax Year" : "Years"}</label>
            <Select
              value={isYearRange ? "range" : (pendingFilters.years.length > 0 ? pendingFilters.years[0] : "all")}
              onValueChange={(value) => {
                if (value === "range") {
                  setIsYearRange(true);
                  setPendingFilters((prev) => ({ ...prev, years: [] }));
                } else if (value === "all") {
                  setIsYearRange(false);
                  setFromYear("");
                  setToYear("");
                  handleFilterChange("years", []);
                } else {
                  setIsYearRange(false);
                  setFromYear("");
                  setToYear("");
                  handleFilterChange("years", [value]);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent className="z-61">
                <SelectItem value="all">All Years</SelectItem>
                {filterOptions.years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
                <SelectItem value="range">Select Range</SelectItem>
              </SelectContent>
            </Select>

            {isYearRange && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">From Year</label>
                  <Select value={fromYear} onValueChange={setFromYear}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="z-61">
                      {filterOptions.years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">To Year</label>
                  <Select value={toYear} onValueChange={setToYear}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="z-61">
                      {filterOptions.years
                        .filter((year) => !fromYear || parseInt(year) >= parseInt(fromYear))
                        .map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="flex flex-row gap-2 sm:gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1"
          >
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
