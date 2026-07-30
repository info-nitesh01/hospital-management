import * as React from "react";
import { Button } from "@/components/commonComponents/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PercentageInput } from "@/components/commonComponents/PercentageInput";
import { HiOutlineTrash, HiOutlinePlus } from "react-icons/hi2";
import type { TierSetting } from "./types";

interface TierSettingsTableProps {
  tierSettings: TierSetting[];
  onAddTier: () => void;
  onRemoveTier: (index: number) => void;
  onTierChange: (index: number, field: keyof TierSetting, value: string | number) => void;
}

export const TierSettingsTable = React.memo(function TierSettingsTable({
  tierSettings,
  onAddTier,
  onRemoveTier,
  onTierChange,
}: TierSettingsTableProps) {
  // Validate that Savings From is less than Savings To
  const getValidationError = (tier: TierSetting) => {
    if (tier.savingsFrom && tier.savingsTo && tier.savingsFrom >= tier.savingsTo) {
      return "Savings From must be less than Savings To";
    }
    return null;
  };

  return (
    <div>
      <Label className="block mb-2">Tier Settings</Label>
      <div className="space-y-2">
        {tierSettings.length > 0 && (
          <div className="border border-gray-200 rounded-md overflow-x-auto">
            <table className="w-full border-collapse">
                <TableHeader>
                  <TableRow className="bg-blue-500 hover:bg-blue-500">
                    <TableHead className="text-white text-xs font-light border-r border-blue-600 rounded-tl-md">
                      Tier
                    </TableHead>
                    <TableHead className="text-white text-xs font-light border-r border-blue-600">
                      Savings From
                    </TableHead>
                    <TableHead className="text-white text-xs font-light border-r border-blue-600">
                      Savings To
                    </TableHead>
                    <TableHead className="text-white text-xs font-light border-r border-blue-600">
                      Percentage
                    </TableHead>
                    <TableHead className="text-white text-xs font-light text-center w-20 rounded-tr-md">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tierSettings.map((tier, index) => {
                    const validationError = getValidationError(tier);
                    const hasError = !!validationError;

                    return (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell className="border-r border-gray-200">
                            <Input
                              type="text"
                              placeholder="Tier name"
                              value={tier.tier || ""}
                              onChange={(e) => onTierChange(index, "tier", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="border-r border-gray-200">
                            <Input
                              type="number"
                              placeholder="0"
                              value={tier.savingsFrom || ""}
                              onChange={(e) =>
                                onTierChange(index, "savingsFrom", Number(e.target.value))
                              }
                              className={hasError ? "border-red-500 focus-visible:ring-red-500" : ""}
                            />
                          </TableCell>
                          <TableCell className="border-r border-gray-200">
                            <Input
                              type="number"
                              placeholder="0"
                              value={tier.savingsTo || ""}
                              onChange={(e) =>
                                onTierChange(index, "savingsTo", Number(e.target.value))
                              }
                              className={hasError ? "border-red-500 focus-visible:ring-red-500" : ""}
                            />
                          </TableCell>
                          <TableCell className="border-r border-gray-200">
                            <PercentageInput
                              value={tier.percentage || ""}
                              onChange={(value) =>
                                onTierChange(index, "percentage", Number(value))
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveTier(index)}
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <HiOutlineTrash className="h-5 w-5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {hasError && (
                          <TableRow>
                            <TableCell colSpan={5} className="py-1 px-3">
                              <p className="text-xs text-red-500">{validationError}</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </table>
          </div>
        )}
        <Button type="button" variant="outline" onClick={onAddTier} className="w-auto">
          <HiOutlinePlus className="h-4 w-4 mr-2" />
          Add Tier
        </Button>
      </div>
    </div>
  );
});
