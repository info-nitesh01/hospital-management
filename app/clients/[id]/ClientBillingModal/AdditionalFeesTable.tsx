import * as React from "react";
import { Button } from "@/components/commonComponents/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableInput } from "@/components/commonComponents/SearchableInput";
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { HiOutlineTrash, HiOutlinePlus } from "react-icons/hi2";
import type { AdditionalFee } from "@/lib/api/clients/types";
import type { SearchableInputOption } from "@/components/commonComponents/SearchableInput";

interface AdditionalFeesTableProps {
  additionalFees: AdditionalFee[];
  feeTypeOptions: SearchableInputOption[];
  isLoadingFeeTypes: boolean;
  onAddFee: () => void;
  onRemoveFee: (index: number) => void;
  onFeeChange: (index: number, field: keyof AdditionalFee, value: string | number) => void;
  onFocusFeeType: () => void;
}

export const AdditionalFeesTable = React.memo(function AdditionalFeesTable({
  additionalFees,
  feeTypeOptions,
  isLoadingFeeTypes,
  onAddFee,
  onRemoveFee,
  onFeeChange,
  onFocusFeeType,
}: AdditionalFeesTableProps) {
  return (
    <div>
      <Label className="block mb-2">Additional Fees</Label>
      <div className="space-y-2">
        {additionalFees.length > 0 && (
          <div className="border border-gray-200 rounded-md overflow-visible">
            <table className="w-full border-collapse">
                <TableHeader>
                  <TableRow className="bg-blue-500 hover:bg-blue-500">
                    <TableHead className="text-white text-xs font-light border-r border-blue-600 rounded-tl-md">
                      Fee Type
                    </TableHead>
                    <TableHead className="text-white text-xs font-light border-r border-blue-600">
                      Fee Value
                    </TableHead>
                    <TableHead className="text-white text-xs font-light text-center w-20 rounded-tr-md">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {additionalFees.map((fee, index) => (
                    <TableRow key={index}>
                      <TableCell className="border-r border-gray-200">
                        <SearchableInput
                          value={fee.feeType}
                          onChange={(value) => onFeeChange(index, "feeType", value)}
                          options={feeTypeOptions}
                          placeholder="Select fee type"
                          isLoading={isLoadingFeeTypes}
                          onFocus={onFocusFeeType}
                        />
                      </TableCell>
                      <TableCell className="border-r border-gray-200">
                        <Input
                          type="number"
                          placeholder="0"
                          value={fee.feeValue || ""}
                          onChange={(e) =>
                            onFeeChange(index, "feeValue", Number(e.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveFee(index)}
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <HiOutlineTrash className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </table>
          </div>
        )}
        <Button type="button" variant="outline" onClick={onAddFee} className="w-auto">
          <HiOutlinePlus className="h-4 w-4 mr-2" />
          Add Fee
        </Button>
      </div>
    </div>
  );
});
