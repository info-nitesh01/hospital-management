import { authApi } from '../global-http';
import type { ClientWorkspace } from './types';

export const getClientWorkspaces = async (userId: string): Promise<ClientWorkspace[]> => {
  const response = await authApi.getInstance().get<ClientWorkspace[]>(
    `/Account/getallclientworkspace/${encodeURIComponent(userId)}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const setActiveClient = async (clientId: string): Promise<void> => {
  await authApi.getInstance().post('/Account/useractiveclient', { clientId });
};