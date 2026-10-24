"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Card } from "@/components/commonComponents/Card";
import { DataTable } from "@/components/commonComponents/DataTable";
import { generateColumnsFromConfig } from "@/components/commonComponents/DataTable/utils";
import { useTableState } from "@/components/commonComponents/DataTable/hooks/useTableState";
import { Button } from "@/components/commonComponents/Button";
import { Loader } from "@/components/commonComponents/Loader";
import { getErrorMessage } from "@/lib/api/error-utils";
import { getUsers, type UserRecord } from "@/lib/api/users";
import { USERS_FILTER_API_FUNCTIONS } from "@/lib/api/users/filter";
import { SCREEN_NAMES } from "@/lib/constants";

const EMPTY_USERS: UserRecord[] = [];

export function UsersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const screenName = SCREEN_NAMES.USERS;

  // Table state management
  const {
    tableState: { pageNumber, pageSize, sortIndex, sortBy },
    filters,
    handleFiltersChange,
    handlePaginationChange,
    handleSortChange,
  } = useTableState(15);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: 60_000,
    retry: false,
  });
  const users = data?.content?.Data ?? EMPTY_USERS;
  const filteredUsers = useMemo(() => users, [users]);
  const columns = useMemo(
    () => data?.content.ColumnConfigs?.length
      ? generateColumnsFromConfig<UserRecord>(data.content.ColumnConfigs, { includeCheckbox: true })
      : [],
    [data?.content.ColumnConfigs]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader size="lg" withText />
      </div>
    );
  }

  if (error) {
    return (
      <Card title="Users" className="shadow">
        <div className="flex items-center justify-between gap-4 py-6">
          <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
          <button className="text-sm font-medium text-primary hover:underline" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card title={`Users (${users.length})`} className="shadow">
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loader size="sm" />
          </div>
        )}
        <DataTable
          columns={columns}
          data={filteredUsers}
          showColumnVisibility
          pageSize={pageSize}
          storageKey="users-table"
          toolbarActions={(
            <div className="flex items-center gap-2">
              {/* Toolbar actions for users table */}
            </div>
          )}
          onFiltersChange={handleFiltersChange}
          onPaginationChange={handlePaginationChange}
          serverSideSort={{ sortIndex, sortBy, onSortChange: handleSortChange }}
          showQuickSearch
          enableCrossPageSelection
          allRowIds={users.map((user) => user.userId)}
          getRowId={(user) => user.userId}
          showExport
          exportConfig={{ screenName: "users" }}
          filterApiFunctions={USERS_FILTER_API_FUNCTIONS}
          disableFiltering={[]}
        />
      </div>
    </Card>
  );
}

export default UsersPage;
