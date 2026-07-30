"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVendors } from "@/hooks/api/useVendors";
import { useAppSelector } from "@/store/hooks";
import type { Vendor } from "@/lib/api/vendors/types";
import { VendorLogo } from "./VendorLogo";
import { setActiveVendor } from "@/lib/api/vendors";
import { showErrorToast, showSuccessToast } from "@/lib/api/error-utils";

export function VendorWorkspaceSelector() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.userId);
  const { data: vendors, isLoading } = useVendors();
  const [isChanging, setIsChanging] = React.useState(false);

  // Find the currently active vendor from the list
  const activeVendor = vendors?.find((v: Vendor) => v.isActive);

  const handleValueChange = async (vendorId: string) => {
    if (!userId) return;

    // Don't allow changing if already changing
    if (isChanging) return;

    // Get the vendor name for the success message
    const selectedVendor = vendors?.find((v: Vendor) => v.vendorId === vendorId);

    try {
      setIsChanging(true);

      // Call API to set active vendor
      await setActiveVendor(userId, vendorId);

      // Invalidate all queries to refetch fresh data
      await queryClient.invalidateQueries();

      // Refresh Next.js server components data
      router.refresh();

      setIsChanging(false);

      // Show success toast
      showSuccessToast(
        "Vendor Workspace Changed",
        `Successfully switched to ${selectedVendor?.vendorName || "the selected vendor"}`
      );
    } catch (error) {
      setIsChanging(false);
      showErrorToast(error, {
        title: "Failed to switch vendor",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading vendors...</div>
    );
  }

  if (!vendors || vendors.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">
        Vendor Workspace:
      </span>
      <Select
        value={activeVendor?.vendorId}
        onValueChange={handleValueChange}
        disabled={isChanging}
      >
        <SelectTrigger className="w-[200px] h-9 bg-background" aria-label="Select vendor workspace">
          <div className="flex items-center gap-2">
            <VendorLogo
              src={activeVendor?.vendorLogo || ""}
              alt={activeVendor?.vendorName || "Vendor"}
            />
            <SelectValue>
              {isChanging
                ? "Switching..."
                : activeVendor?.vendorName || "Select vendor"}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {vendors.map((vendor: Vendor) => (
            <SelectItem key={vendor.vendorId} value={vendor.vendorId}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <VendorLogo
                    src={vendor.vendorLogo}
                    alt={vendor.vendorName}
                  />
                  <span>{vendor.vendorName}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
