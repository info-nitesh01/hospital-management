"use client";

import * as React from "react";
import { DataTable } from "@/components/commonComponents/DataTable";
import { generateColumnsFromConfig } from "@/components/commonComponents/DataTable/utils";
import { Button } from "@/components/commonComponents/Button";
import { HiOutlinePlus } from "react-icons/hi2";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ExportButton } from "@/components/commonComponents/DataTable/components/ExportButton";
import type { PropertyData, StaticPropertyData } from "./types";
import staticDataJson from "@/data/property-data.json";
import { AddPropertyModal } from "./AddPropertyModal";

const staticData: StaticPropertyData = staticDataJson as StaticPropertyData;

const AddPropertyButton = ({ onClick }: { onClick: () => void }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          icon={<HiOutlinePlus className="h-4 w-4" />}
          iconPosition="left"
          aria-label="Add new property"
          className="aspect-square"
          size="sm"
        />
      </TooltipTrigger>
      <TooltipContent>Add New Property</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function PropertyTab() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingPropertyId, setEditingPropertyId] = React.useState<string | undefined>(undefined);

  const allPropertyIds = React.useMemo(() => staticData.Data.map((property) => property.propertyId), []);

  const handleAddProperty = React.useCallback(() => {
    setEditingPropertyId(undefined);
    setIsAddModalOpen(true);
  }, []);

  const handleEditProperty = React.useCallback((propertyId: string) => {
    setEditingPropertyId(propertyId);
    setIsAddModalOpen(true);
  }, []);

  const handleModalClose = React.useCallback((open: boolean) => {
    setIsAddModalOpen(open);
    if (!open) setEditingPropertyId(undefined);
  }, []);

  const renderToolbarActions = React.useCallback(
    (selectedIds: string[]) => (
      <div className="flex items-center gap-2">
        <AddPropertyButton onClick={handleAddProperty} />
        {selectedIds && selectedIds.length > 0 && (
          <ExportButton screenName="client" selectedIds={selectedIds} variant="outline" />
        )}
      </div>
    ),
    [handleAddProperty]
  );

  const columns = React.useMemo(() => {
    const columnConfigs = staticData.ColumnConfigs;
    if (!columnConfigs?.length) return [];

    return generateColumnsFromConfig<PropertyData>(columnConfigs, {
      includeCheckbox: true,
      includeActions: true,
      linkBaseUrl: "#",
      actions: {
        onView: (property) => console.log("View property:", property.propertyId),
        onEdit: (property) => handleEditProperty(property.propertyId),
      },
    });
  }, [handleEditProperty]);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={staticData.Data}
        showPagination
        showColumnVisibility
        pageSize={15}
        storageKey="properties-table"
        toolbarActions={renderToolbarActions}
        enableCrossPageSelection
        getRowId={(row) => row.propertyId}
        allRowIds={allPropertyIds}
      />

      <AddPropertyModal
        open={isAddModalOpen}
        onOpenChange={handleModalClose}
        propertyId={editingPropertyId}
      />
    </div>
  );
}
