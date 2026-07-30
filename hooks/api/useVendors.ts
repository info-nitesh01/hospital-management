/**
 * Vendor API Hooks
 * Provides type-safe React Query hooks for vendor operations
 */

import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import { getAllVendors } from "@/lib/api/vendors";
import type { Vendor } from "@/lib/api/vendors/types";
import type { QueryOptions } from "@/lib/api/global-types";

/**
 * Fetch all vendors for the current user
 */
export function useVendors(options?: QueryOptions) {
  const userId = useAppSelector((state) => state.auth.userId);

  return useQuery({
    queryKey: ["vendors", userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("User ID not found");
      }
      return getAllVendors(userId);
    },
    enabled: !!userId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
}

/**
 * Get active vendors only (filter out inactive)
 */
export function useActiveVendors(options?: QueryOptions) {
  const vendorsQuery = useVendors(options);

  const activeVendors = vendorsQuery.data?.filter((v: Vendor) => v.isActive) ?? [];

  return {
    ...vendorsQuery,
    data: activeVendors,
  };
}
