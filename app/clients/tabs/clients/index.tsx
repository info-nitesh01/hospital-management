"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/commonComponents/Card";
import { DataTable } from "@/components/commonComponents/DataTable";
import { generateColumnsFromConfig } from "@/components/commonComponents/DataTable/utils";
import { useTableState } from "@/components/commonComponents/DataTable/hooks/useTableState";
import { Button } from "@/components/commonComponents/Button";
import { HiOutlinePlus } from "react-icons/hi2";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTableSkeleton } from "@/components/commonComponents/SkeletonLoader";
import { Loader } from "@/components/commonComponents/Loader";
import { getErrorMessage, showErrorToast } from "@/lib/api";
import { ErrorPage } from "@/components/commonComponents/ErrorPage";
import type { ApiClientData } from "@/lib/api/clients/types";
import * as clientsApi from "@/lib/api/clients";
import { SCREEN_NAMES } from "@/lib/constants";
import { CLIENTS_FILTER_API_FUNCTIONS } from "@/lib/api/clients/filter";
import { ClientModal } from "./ClientModal";

type Client = ApiClientData;

const AddClientButton = ({ onClick }: { onClick: () => void }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          icon={<HiOutlinePlus className="h-4 w-4" />}
          iconPosition="left"
          aria-label="Add new client"
          className="aspect-square"
          size="sm"
        />
      </TooltipTrigger>
      <TooltipContent>Add New Client</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface ClientsTabProps {
  onClientsCountChange?: (count: number) => void;
}

export function ClientsTab({ onClientsCountChange }: ClientsTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingClientId, setEditingClientId] = React.useState<string | undefined>(undefined);
  const screenName = SCREEN_NAMES.CLIENTS;

  // Table state management
  const {
    tableState: { pageNumber, pageSize, sortIndex, sortBy },
    filters,
    handleFiltersChange,
    handlePaginationChange,
    handleSortChange,
  } = useTableState(15);

  // Fetch clients data
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["clients", pageNumber, pageSize, sortBy, sortIndex, filters],
    queryFn: () => clientsApi.getClients(pageNumber, pageSize, sortBy, sortIndex, filters),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });

  // Show error toast on API error
  React.useEffect(() => {
    if (isError && error) {
      showErrorToast(error, { title: "Failed to load clients" });
    }
  }, [isError, error]);

  const clients = data?.content?.Data || [];

  // Fetch all client IDs for cross-page selection (with current filters applied)
  const { data: clientCheckboxData } = useQuery({
    queryKey: [screenName, "checkboxes", filters],
    queryFn: () =>
      clientsApi.getClientCheckBoxes({
        pageNumber: 1,
        pageSize: 2147483647,
        filters,
      }),
    staleTime: 3 * 60 * 1000,
  });

  // Extract client IDs
  const allClientIds = React.useMemo(() => {
    return clientCheckboxData?.map((item) => item.clientId) || [];
  }, [clientCheckboxData]);

  // Notify parent component about count changes
  React.useEffect(() => {
    if (clientCheckboxData && onClientsCountChange) {
      onClientsCountChange(clientCheckboxData.length);
    }
  }, [clientCheckboxData, onClientsCountChange]);

  const handleAddClient = React.useCallback(() => {
    setEditingClientId(undefined);
    setIsAddModalOpen(true);
  }, []);

  const handleEditClient = React.useCallback((clientId: string) => {
    setEditingClientId(clientId);
    setIsAddModalOpen(true);
  }, []);

  const handleModalClose = React.useCallback((open: boolean) => {
    setIsAddModalOpen(open);
    if (!open) setEditingClientId(undefined);
  }, []);

  // Create toolbar actions
  const renderToolbarActions = React.useCallback(
    () => (
      <div className="flex items-center gap-2">
        <AddClientButton onClick={handleAddClient} />
      </div>
    ),
    [handleAddClient]
  );

  const columns = React.useMemo(() => {
    const columnConfigs = data?.content?.ColumnConfigs;
    if (!columnConfigs?.length) return [];

    return generateColumnsFromConfig<Client>(columnConfigs, {
      includeCheckbox: true,
      includeActions: true,
      linkBaseUrl: "/clients",
      actions: {
        onView: (client) => window.open(`/clients/${client.clientId}`, '_blank'),
        onEdit: (client) => handleEditClient(client.clientId),
      },
      serverSideSort: {
        sortIndex,
        sortBy,
        onSortChange: handleSortChange,
      },
    });
  }, [data?.content?.ColumnConfigs, sortIndex, sortBy, handleSortChange, handleEditClient]);

  if (isLoading && !data) {
    return (
      <Card title="Clients Overview" className="shadow">
        <DataTableSkeleton rows={16} showPagination showSearch />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card title="Clients Overview" className="shadow">
        <ErrorPage
          errorType="500"
          customTitle="Failed to load clients"
          customDescription={getErrorMessage(error)}
          showHomeButton={false}
          showBackButton={false}
          showSupportLink={false}
          reset={refetch}
        />
      </Card>
    );
  }

  return (
    <>
      <Card title="Clients Overview" className="shadow">
        <div className="relative">
          {isFetching && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center pointer-events-none">
              <Loader size="sm" />
            </div>
          )}
          <DataTable
            columns={columns}
            data={clients}
            filterApiFunctions={CLIENTS_FILTER_API_FUNCTIONS}
            disableFiltering={["state", "city", "county", "zip", "address", "clientManager", "fairMarketValue", "taxableValue", "finalSavings", "salesManager", "notes"]}
            showPagination
            showColumnVisibility
            pageSize={pageSize}
            storageKey="clients-table"
            toolbarActions={renderToolbarActions}
            onFiltersChange={handleFiltersChange}
            onPaginationChange={handlePaginationChange}
            showQuickSearch
            enableCrossPageSelection
            getRowId={(row) => row.clientId}
            allRowIds={allClientIds}
            showExport
            exportConfig={{ screenName }}
          />
        </div>
      </Card>

      <ClientModal
        open={isAddModalOpen}
        onOpenChange={handleModalClose}
        clientId={editingClientId}
      />
    </>
  );
}
