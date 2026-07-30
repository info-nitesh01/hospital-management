"use client";

import React from "react";
import { Card } from "@/components/commonComponents/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { HiOutlinePencil } from "react-icons/hi2";
import type { ClientDetailData } from "@/lib/api/clients/types";

interface ClientBillingCardProps {
  client: ClientDetailData;
  isModalOpen?: boolean;
  setIsModalOpen?: (open: boolean) => void;
}

interface TierSetting {
  Tier: string;
  SavingsFrom: number;
  SavingsTo: number;
  Percentage: number;
}

export const ClientBillingCard: React.FC<ClientBillingCardProps> = ({
  client,
  setIsModalOpen: externalSetModalOpen,
}) => {
  const [, setInternalModalOpen] = React.useState(false);

  // Use external state if provided, otherwise use internal state
  const setIsModalOpen = externalSetModalOpen || setInternalModalOpen;

  const hasAnyFees = client.additionalFees && client.additionalFees.length > 0;

  // Parse tier settings from billingSettings if billing method is Tier
  const tierSettings = React.useMemo(() => {
    if (client.billingMethod?.toLowerCase() === "tier" && client.billingSettings) {
      try {
        const billingSettingsArray = JSON.parse(client.billingSettings);
        if (Array.isArray(billingSettingsArray) && billingSettingsArray.length > 0) {
          const settings = billingSettingsArray[0];
          if (settings.TierSettings && Array.isArray(settings.TierSettings)) {
            return settings.TierSettings;
          }
        }
      } catch (error) {
        console.error("Failed to parse tier settings:", error);
      }
    }
    return [];
  }, [client.billingSettings, client.billingMethod]);

  // Check if any billing data exists (excluding null/undefined and 0 values)
  const hasBillingData = !!(
    (client.billingMethod && client.billingMethod.trim()) ||
    (client.contingency && client.contingency.trim()) ||
    (client.contingencyPercentage !== null &&
      client.contingencyPercentage !== undefined &&
      client.contingencyPercentage !== 0) ||
    hasAnyFees ||
    (client.discount !== null &&
      client.discount !== undefined &&
      client.discount !== 0) ||
    (client.maximumCap !== null &&
      client.maximumCap !== undefined &&
      client.maximumCap !== 0) ||
    (client.minimumBilling !== null &&
      client.minimumBilling !== undefined &&
      client.minimumBilling !== 0) ||
    (client.billingClientNotes && client.billingClientNotes.trim()) ||
    (client.billingManagerName && client.billingManagerName.trim()) ||
    (client.defaultTaxRateSource && client.defaultTaxRateSource.trim()) ||
    (client.defaultTaxRateType && client.defaultTaxRateType.trim()) ||
    (client.defaultAssessment && client.defaultAssessment.trim())
  );

  // If no billing data exists, don't show the card (button is in page header)
  if (!hasBillingData) {
    return null;
  }

  return (
    <>
      <Card
        title="Client Billing"
        className="shadow"
        extra={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-8 w-8 p-0"
            aria-label="Edit billing information"
          >
            <HiOutlinePencil className="h-4 w-4" />
          </Button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-6 grid grid-cols-1 md:grid-cols-2">
            {/* Billing Method */}
            {client.billingMethod && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Billing Method
                </p>
                <Badge variant="outline">{client.billingMethod}</Badge>
              </div>
            )}

            {/* Contingency Percentage */}
            {client.contingencyPercentage !== null &&
              client.contingencyPercentage !== undefined && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Contingency Percentage
                  </p>
                  <p className="text-sm font-medium">
                    {client.contingencyPercentage}%
                  </p>
                </div>
              )}

            {/* Tier Settings */}
            {client.billingMethod?.toLowerCase() === "tier" && tierSettings.length > 0 && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Tier Settings
                </p>
                <div className="border border-gray-200 rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-500 hover:bg-blue-500">
                        <TableHead className="text-white border-r border-blue-600">
                          Tier
                        </TableHead>
                        <TableHead className="text-white border-r border-blue-600">
                          Savings From
                        </TableHead>
                        <TableHead className="text-white border-r border-blue-600">
                          Savings To
                        </TableHead>
                        <TableHead className="text-white">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tierSettings.map((tier: TierSetting, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="border-r border-gray-200">
                            {tier.Tier || "-"}
                          </TableCell>
                          <TableCell className="border-r border-gray-200">
                            {tier.SavingsFrom !== null && tier.SavingsFrom !== undefined
                              ? `$${tier.SavingsFrom.toLocaleString()}`
                              : "-"}
                          </TableCell>
                          <TableCell className="border-r border-gray-200">
                            {tier.SavingsTo !== null && tier.SavingsTo !== undefined
                              ? `$${tier.SavingsTo.toLocaleString()}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {tier.Percentage !== null && tier.Percentage !== undefined
                              ? `${tier.Percentage}%`
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Additional Fees */}
            {hasAnyFees && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Additional Fees
                </p>
                <div className="border border-gray-200 rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-500 hover:bg-blue-500">
                        <TableHead className="text-white border-r border-blue-600">
                          Fee Type
                        </TableHead>
                        <TableHead className="text-white">Fee Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.additionalFees!.map((fee, index) => (
                        <TableRow key={index}>
                          <TableCell className="border-r border-gray-200">
                            {fee.feeType || "-"}
                          </TableCell>
                          <TableCell>
                            {fee.feeValue !== null && fee.feeValue !== undefined
                              ? `$${fee.feeValue.toLocaleString()}`
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Discount */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Discount</p>
              {client.discount !== null && client.discount !== undefined ? (
                <p className="text-sm font-medium">
                  ${client.discount.toLocaleString()}
                </p>
              ) : (
                <Badge variant="outline">Not Applied</Badge>
              )}
            </div>

            {/* Maximum Cap */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Maximum Cap</p>
              {client.maximumCap !== null && client.maximumCap !== undefined ? (
                <p className="text-sm font-medium">
                  ${client.maximumCap.toLocaleString()}
                </p>
              ) : (
                <Badge variant="outline">Not Applied</Badge>
              )}
            </div>

            {/* Minimum Billing */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Minimum Billing
              </p>
              {client.minimumBilling !== null &&
              client.minimumBilling !== undefined ? (
                <p className="text-sm font-medium">
                  ${client.minimumBilling.toLocaleString()}
                </p>
              ) : (
                <Badge variant="outline">Not Applied</Badge>
              )}
            </div>

            {/* Client Billing and Invoicing Note */}
            {client.billingClientNotes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Client Billing and Invoicing Note
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {client.billingClientNotes}
                </p>
              </div>
            )}

            {/* Billing Manager */}
            {client.billingManagerName && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Billing Manager
                </p>
                <p className="text-sm font-medium">
                  {client.billingManagerName}
                </p>
              </div>
            )}
          </div>

          {/* Appeal Savings Settings */}
          {(client.defaultTaxRateSource ||
            client.defaultTaxRateType ||
            client.defaultAssessment) && (
            <div className="space-y-4 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-8">
              <h3 className="text-sm font-semibold mb-4">
                Appeal Savings Settings
              </h3>
              <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Default Tax Rate Source */}
                {client.defaultTaxRateSource && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Default Tax Rate Source
                    </p>
                    <Badge variant="outline">
                      {client.defaultTaxRateSource}
                    </Badge>
                  </div>
                )}

                {/* Default Tax Rate Type */}
                {client.defaultTaxRateType && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Default Tax Rate Type
                    </p>
                    <Badge variant="outline">{client.defaultTaxRateType}</Badge>
                  </div>
                )}

                {/* Default Assessment */}
                {client.defaultAssessment && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Default Assessment
                    </p>
                    <Badge variant="outline">{client.defaultAssessment}</Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};
