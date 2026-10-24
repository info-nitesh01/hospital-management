"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClientWorkspaces } from "@/hooks/api/useClientWorkspaces";
import { useAppSelector } from "@/store/hooks";
import { setActiveClient } from "@/lib/api/client-workspaces";
import { showErrorToast, showSuccessToast } from "@/lib/api/error-utils";
import type { ClientWorkspace } from "@/lib/api/client-workspaces/types";

export function ClientWorkspaceSelector() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.userId);
  const { data: workspaces, isLoading } = useClientWorkspaces();
  const [isChanging, setIsChanging] = React.useState(false);
  const activeWorkspace = workspaces?.find((workspace) => workspace.isActive);

  const handleValueChange = async (clientId: string) => {
    if (!userId || isChanging) return;
    const selectedWorkspace = workspaces?.find((workspace) => workspace.clientId === clientId);

    try {
      setIsChanging(true);
      await setActiveClient(clientId);
      await queryClient.invalidateQueries({ queryKey: ["client-workspaces", userId] });
      await queryClient.invalidateQueries();
      router.refresh();
      showSuccessToast(
        "Client Workspace Changed",
        `Successfully switched to ${selectedWorkspace?.clientName || "the selected client"}`
      );
    } catch (error) {
      showErrorToast(error, { title: "Failed to switch client workspace" });
    } finally {
      setIsChanging(false);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading client workspaces...</div>;
  }

  if (!workspaces?.length) return null;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="hidden shrink-0 text-sm text-muted-foreground xl:inline">Client Workspace:</span>
      <Select value={activeWorkspace?.clientId} onValueChange={handleValueChange} disabled={isChanging}>
        <SelectTrigger
          className="h-9 w-[min(220px,48vw)] min-w-0 bg-background sm:w-[220px]"
          aria-label="Select client workspace"
          title={activeWorkspace?.clientName || "Select client"}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            <HiOutlineBuildingOffice2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <SelectValue className="min-w-0 flex-1 truncate">
              {isChanging ? "Switching..." : activeWorkspace?.clientName || "Select client"}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace: ClientWorkspace) => (
            <SelectItem key={workspace.clientId} value={workspace.clientId}>
              <div className="flex w-full items-center gap-2">
                <HiOutlineBuildingOffice2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="max-w-[min(18rem,65vw)] truncate">{workspace.clientName}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
