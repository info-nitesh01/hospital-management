/**
 * Export API
 *
 * All API calls related to exporting data to Excel
 */

import { exportApi } from "../global-http";
import type { ScreenName } from "@/lib/constants";

export interface ExportToExcelParams {
  screenName: ScreenName;
  ids: string[];
}

export interface ExportToExcelResponse {
  code: number;
  message?: string;
  content?: {
    fileUrl?: string;
    fileName?: string;
  };
}

/**
 * Export selected records to Excel
 * @param params - Export parameters (screenName and ids)
 * @returns Promise with export response
 */
export const exportToExcel = async (params: ExportToExcelParams): Promise<Blob> => {
  const { screenName, ids } = params;

  // Join IDs with comma as required by API
  const idsString = ids.join(",");

  const response = await exportApi.getInstance().post(
    `/Export/Export/ExportToExcel?screenName=${screenName}`,
    { id: idsString },
    {
      responseType: "blob", // Important: tells axios to expect binary data
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

// Export all export API functions
const exportApiModule = {
  exportToExcel,
};

export default exportApiModule;
