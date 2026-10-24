import { authApi } from "../global-http";
import type { ColumnConfig } from "../clients/types";

export interface UserRecord {
  userId: string;
  name: string;
  email: string;
  role: string;
  activeClientId: string | null;
  createdAt: string;
  [key: string]: unknown;
}

interface UsersResponse {
  code: number;
  content: {
    Data: UserRecord[];
    ColumnConfigs: ColumnConfig[];
  };
  currentFileId: string | null;
  currentAssessmentId: string | null;
}

export const getUsers = async (): Promise<UsersResponse> => {
  const response = await authApi.getInstance().get<UsersResponse>("/users");
  return response.data;
};
