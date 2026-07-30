/**
 * Vendor API Types
 *
 * Type definitions for vendor-related API responses and state management
 */

/**
 * Vendor object from API response
 */
export interface Vendor {
  vendorId: string;
  vendorName: string;
  vendorLogo: string;
  vendorSlogan: string | null;
  isActive: boolean;
}

/**
 * Selected vendor for Redux state
 * (excludes isActive since inactive vendors won't be selectable)
 */
export interface SelectedVendor {
  vendorId: string;
  vendorName: string;
  vendorLogo: string;
  vendorSlogan: string | null;
}
