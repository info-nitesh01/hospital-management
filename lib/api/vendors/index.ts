/**
 * Vendor API
 *
 * All API calls related to vendor management
 */

import { authApi } from "../global-http";
import type { Vendor } from "./types";

/**
 * Get all vendors for a user
 * @param userId - User ID from Redux auth state
 * @returns Promise resolving to array of vendors
 */
export const getAllVendors = async (userId: string): Promise<Vendor[]> => {
  const response = await authApi.getInstance().get<Vendor[]>(
    `/Account/getallvendor/${userId}`
  );
  // API returns array directly, not wrapped in data object
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Set active vendor for a user
 * @param userId - User ID from Redux auth state
 * @param vendorId - Vendor ID to set as active
 * @returns Promise resolving when vendor is set
 */
export const setActiveVendor = async (
  userId: string,
  vendorId: string
): Promise<void> => {
  await authApi.getInstance().post("/Account/useractivevendor", {
    userId,
    vendorId,
  });
};

// Export all vendor API functions
const vendorsApiModule = {
  getAllVendors,
  setActiveVendor,
};

export default vendorsApiModule;
