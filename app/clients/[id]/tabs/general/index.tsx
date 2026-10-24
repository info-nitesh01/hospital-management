"use client";

import * as React from "react";
import { Card } from "@/components/commonComponents/Card";
import { Button } from "@/components/commonComponents/Button";
import {
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlinePencil,
  HiOutlineMapPin,
} from "react-icons/hi2";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";

const LocationMap = dynamic(
  () => import("@/components/commonComponents/LocationMap").then((m) => m.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] flex items-center justify-center">
        <div className="custom-loader text-muted-foreground" style={{ width: 32, height: 32 }} />
      </div>
    ),
  }
);
import { showErrorToast, getClientById } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { ClientDetailData } from "@/lib/api/clients/types";
import type { ApiError } from "@/lib/api/global-types";
import { CardSkeleton } from "@/components/commonComponents/SkeletonLoader";
import { Skeleton } from "@/components/ui/skeleton";
import { FmvChartCard } from "./FmvChartCard";
import { ClientModal } from "../../../tabs/clients/ClientModal";

interface GeneralInfoTabProps {
  clientId: string;
}

export function GeneralInfoTab({ clientId }: GeneralInfoTabProps) {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedTaxYear, setSelectedTaxYear] = React.useState("2024");

  const {
    data: client,
    isLoading,
    error,
  } = useQuery<ClientDetailData, ApiError>({
    queryKey: ["client-detail", clientId],
    queryFn: () => getClientById(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const onEditClick = () => {
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 ml-auto" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton lines={10} />
          <CardSkeleton lines={10} />
          <CardSkeleton lines={10} />
        </div>
        <CardSkeleton lines={15} />
      </div>
    );
  }

  if (error) {
    showErrorToast(error, {
      title: "Failed to load client details",
    });
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-2">Failed to load client details</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-2">Client not found</p>
        <p className="text-sm text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  const getStatusVariant = (
    status: string
  ): "success" | "warning" | "outline" | "destructive" => {
    const lower = status?.toLowerCase();
    if (lower === "active") return "success";
    if (lower === "pending") return "warning";
    if (lower === "inactive") return "outline";
    if (lower === "suspended") return "destructive";
    return "outline";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="flex gap-2">
          <Button
            icon={<HiOutlinePencil className="h-3 w-3 textxs" />}
            size="sm"
            iconPosition="left"
            onClick={onEditClick}
          >
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-3 2xl:gap-4 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
        <Card title="Contact Information" className="shadow">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Client Name</p>
              <p className="text-base">{client.clientName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Short Name</p>
              <p className="text-base">{client.clientShortName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Primary Contact Email
              </p>
              {client.primaryContactEmail ? (
                <a
                  href={`mailto:${client.primaryContactEmail}`}
                  className="font-medium hover:underline text-primary flex items-center gap-1"
                >
                  <HiOutlineEnvelope className="h-4 w-4" />
                  {client.primaryContactEmail}
                </a>
              ) : (
                <p className="font-medium">-</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Billing Contact Email
              </p>
              {client.billingContactEmail ? (
                <a
                  href={`mailto:${client.billingContactEmail}`}
                  className="font-medium hover:underline text-primary flex items-center gap-1"
                >
                  <HiOutlineEnvelope className="h-4 w-4" />
                  {client.billingContactEmail}
                </a>
              ) : (
                <p className="font-medium">-</p>
              )}
            </div>
          </div>
        </Card>

        <Card title="Account Details" className="shadow">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={getStatusVariant(client.clientStatus)}>
                {client.clientStatus || "-"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant="outline">{client.clientType || "-"}</Badge>
            </div>
            {client.propertyType && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Property Type
                </span>
                <Badge variant="outline">{client.propertyType}</Badge>
              </div>
            )}
            {client.industry && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Industry</span>
                <Badge variant="outline">{client.industry}</Badge>
              </div>
            )}
            {client.clientSource && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Source</span>
                <Badge variant="outline">{client.clientSource}</Badge>
              </div>
            )}
            {client.contractStatus && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Contract Status
                </span>
                <Badge variant="outline">{client.contractStatus}</Badge>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm flex items-center gap-1">
                <HiOutlineCalendar className="h-3 w-3" />
                {new Date(client.createdOn).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Created By</span>
              <span className="text-sm">{client.createdByName || "-"}</span>
            </div>
            {client.updateOn && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Updated</span>
                <span className="text-sm flex items-center gap-1">
                  <HiOutlineCalendar className="h-3 w-3" />
                  {new Date(client.updateOn).toLocaleDateString()}
                </span>
              </div>
            )}
            {client.updatedByName && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Updated By
                </span>
                <span className="text-sm">{client.updatedByName}</span>
              </div>
            )}
          </div>
        </Card>

        <Card
          title="Financial Summary"
          className="shadow"
          extra={
            <Select value={selectedTaxYear} onValueChange={setSelectedTaxYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Tax Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
              </SelectContent>
            </Select>
          }
        >
          <div className="grid gap-3 2xl:gap-4 md:grid-cols-2">
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-2">
                Fair Market Value
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(client.fairMarketValue || 0)}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-2">
                Taxable Value
              </h3>
              <p className="text-2xl font-bold text-foreground">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(client.taxableValue || 0)}
              </p>
              {/* <p className="text-xs text-muted-foreground mt-1">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(client.taxableValue || 0)}
              </p> */}
            </div>

            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-2">
                Final Savings
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(client.finalSavings || 0)}
              </p>
            </div>
          </div>
        </Card>

        {client.clientContacts && client.clientContacts.length > 0 && (
          <Card title="Client Contacts" className="shadow">
            <div className="space-y-4">
              {client.clientContacts.map((contact) => (
                <div
                  key={contact.contactId}
                  className="border-b last:border-b-0 pb-4 last:pb-0"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        contact.contactType === "Primary"
                          ? "default"
                          : "outline"
                      }
                    >
                      {contact.contactType || "-"}
                    </Badge>
                    <h4 className="text-base">
                      {contact.contactName || "-"}
                    </h4>
                  </div>
                  <div className="space-y-2 pl-1">
                    <div className="flex items-center gap-2 text-sm">
                      <HiOutlineEnvelope className="h-4 w-4 text-muted-foreground" />
                      {contact.contactEmail ? (
                        <a
                          href={`mailto:${contact.contactEmail}`}
                          className="hover:underline text-primary"
                        >
                          {contact.contactEmail}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HiOutlinePhone className="h-4 w-4 text-muted-foreground" />
                      {contact.contactPhone ? (
                        <a
                          href={`tel:${contact.contactPhone}`}
                          className="hover:underline text-primary"
                        >
                          {contact.contactPhone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card title="Management" className="shadow">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Client Manager
              </span>
              <span className="text-sm font-medium">
                {client.clientManagerName || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Sales Manager
              </span>
              <span className="text-sm font-medium">
                {client.salesManagerName || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Billing Manager
              </span>
              <span className="text-sm font-medium">
                {client.billingManagerName || "-"}
              </span>
            </div>
          </div>
        </Card>

        {client.clientDescription && (
          <Card title="Description" className="shadow">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {client.clientDescription}
            </p>
          </Card>
        )}

        <Card title="Notes" className="shadow">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {client.notes || "-"}
          </p>
        </Card>

        <Card title="Location" className="shadow 2xl:col-span-2">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <HiOutlineMapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm">{client.address || "-"}</p>
                <p className="text-sm text-muted-foreground">
                  {[client.city, client.county, client.state, client.zip]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </p>
              </div>
            </div>
            {(client.lattitude ||
              client.longitude ||
              client.address ||
              client.city ||
              client.county ||
              client.state) && (
              <LocationMap
                latitude={
                  client.lattitude ? parseFloat(client.lattitude) : null
                }
                longitude={
                  client.longitude ? parseFloat(client.longitude) : null
                }
                address={client.address}
                city={client.city}
                county={client.county}
                state={client.state}
                zip={client.zip}
              />
            )}
          </div>
        </Card>

        <FmvChartCard clientId={client.clientId} />
      </div>

      <ClientModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        clientId={clientId}
      />
    </div>
  );
}
