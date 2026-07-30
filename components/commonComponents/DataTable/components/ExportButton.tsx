"use client";

import * as React from "react";
import { HiOutlineArrowUpTray } from "react-icons/hi2";
import { Button } from "@/components/commonComponents/Button";
import { exportToExcel } from "@/lib/api/export";
import type { ScreenName } from "@/lib/constants";
import type { ExportConfig } from "../types";
import { toast } from "sonner";

interface ExportButtonProps {
  selectedIds: string[];
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  // Support both screenName (legacy) and exportConfig (new)
  screenName?: ScreenName;
  exportConfig?: ExportConfig;
}

/**
 * ExportButton Component
 *
 * Reusable button component for exporting selected records to Excel
 * Works with any table that has cross-page selection enabled
 *
 * Supports two modes:
 * 1. screenName prop - Uses generic exportToExcel API
 * 2. exportConfig prop - Can use screenName or custom onExport function
 *
 * @param selectedIds - Array of selected record IDs
 * @param disabled - Whether the button is disabled
 * @param variant - Button variant
 * @param size - Button size
 * @param className - Additional CSS classes
 * @param screenName - Screen identifier (legacy prop, use exportConfig instead)
 * @param exportConfig - Export configuration object
 */
export function ExportButton({
  selectedIds,
  disabled = false,
  variant = "outline",
  className = "",
  screenName,
  exportConfig,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  // Determine the effective screen name for filename generation
  const getFileName = (): string => {
    if (exportConfig && "fileName" in exportConfig && exportConfig.fileName) {
      return exportConfig.fileName;
    }
    if (exportConfig && "screenName" in exportConfig) {
      return exportConfig.screenName;
    }
    if (screenName) {
      return screenName;
    }
    return "export";
  };

  const handleExport = async () => {
    if (selectedIds.length === 0) {
      toast.error("No records selected", {
        description: "Please select at least one record to export",
      });
      return;
    }

    setIsExporting(true);

    try {
      let blob: Blob;

      // Determine which export method to use
      if (exportConfig && "onExport" in exportConfig) {
        // Custom export function
        blob = await exportConfig.onExport(selectedIds);
      } else {
        // Use screenName-based export (from exportConfig or legacy prop)
        const effectiveScreenName =
          exportConfig && "screenName" in exportConfig
            ? exportConfig.screenName
            : screenName;

        if (!effectiveScreenName) {
          throw new Error("No screenName or onExport function provided");
        }

        blob = await exportToExcel({
          screenName: effectiveScreenName,
          ids: selectedIds,
        });
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `${getFileName()}-export-${timestamp}.xlsx`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Export successful", {
        description: `Exported ${selectedIds.length} record${selectedIds.length > 1 ? "s" : ""} to Excel`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "Failed to export records",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting || selectedIds.length === 0}
      variant={variant}
      className={className}
      icon={<HiOutlineArrowUpTray className="h-4 w-4" />}
      iconPosition="left"
    >
      {isExporting ? "Exporting..." : `Export (${selectedIds.length})`}
    </Button>
  );
}
