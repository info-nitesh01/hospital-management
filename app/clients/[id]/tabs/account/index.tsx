"use client";

import * as React from "react";
import { DataTable } from "@/components/commonComponents/DataTable";
import { generateColumnsFromConfig } from "@/components/commonComponents/DataTable/utils";
import { Button } from "@/components/commonComponents/Button";
import { HiOutlinePlus } from "react-icons/hi2";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ExportButton } from "@/components/commonComponents/DataTable/components/ExportButton";
import type { AccountData, StaticAccountData } from "./types";
import staticDataJson from "@/data/account-data.json";
import { AddAccountModal } from "./AddAccountModal";

const staticData: StaticAccountData = staticDataJson as StaticAccountData;

const AddAccountButton = ({ onClick }: { onClick: () => void }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          icon={<HiOutlinePlus className="h-4 w-4" />}
          iconPosition="left"
          aria-label="Add new account"
          className="aspect-square"
          size="sm"
        />
      </TooltipTrigger>
      <TooltipContent>Add New Account</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function AccountTab() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingAccountId, setEditingAccountId] = React.useState<string | undefined>(undefined);

  const allAccountIds = React.useMemo(() => staticData.Data.map((account) => account.accountId), []);

  const handleAddAccount = React.useCallback(() => {
    setEditingAccountId(undefined);
    setIsAddModalOpen(true);
  }, []);

  const handleEditAccount = React.useCallback((accountId: string) => {
    setEditingAccountId(accountId);
    setIsAddModalOpen(true);
  }, []);

  const handleModalClose = React.useCallback((open: boolean) => {
    setIsAddModalOpen(open);
    if (!open) setEditingAccountId(undefined);
  }, []);

  const renderToolbarActions = React.useCallback(
    (selectedIds: string[]) => (
      <div className="flex items-center gap-2">
        <AddAccountButton onClick={handleAddAccount} />
        {selectedIds && selectedIds.length > 0 && (
          <ExportButton screenName="client" selectedIds={selectedIds} variant="outline" />
        )}
      </div>
    ),
    [handleAddAccount]
  );

  const columns = React.useMemo(() => {
    const columnConfigs = staticData.ColumnConfigs;
    if (!columnConfigs?.length) return [];

    return generateColumnsFromConfig<AccountData>(columnConfigs, {
      includeCheckbox: true,
      includeActions: true,
      linkBaseUrl: "#",
      actions: {
        onView: (account) => console.log("View account:", account.accountId),
        onEdit: (account) => handleEditAccount(account.accountId),
      },
    });
  }, [handleEditAccount]);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={staticData.Data}
        showPagination
        showColumnVisibility
        pageSize={15}
        storageKey="accounts-table"
        toolbarActions={renderToolbarActions}
        enableCrossPageSelection
        getRowId={(row) => row.accountId}
        allRowIds={allAccountIds}
      />

      <AddAccountModal
        open={isAddModalOpen}
        onOpenChange={handleModalClose}
        accountId={editingAccountId}
      />
    </div>
  );
}
