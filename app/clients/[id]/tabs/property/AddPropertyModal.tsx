"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/commonComponents/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccessToast } from "@/lib/api";

interface AddPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId?: string; // Optional for edit mode
}

export function AddPropertyModal({
  open,
  onOpenChange,
  propertyId,
}: AddPropertyModalProps) {
  const [formData, setFormData] = React.useState({
    propertyNumber: "",
    propertyName: "",
    propertyType: "",
    status: "Active",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    marketValue: "",
    taxableValue: "",
    squareFeet: "",
    yearBuilt: "",
    acquisitionDate: "",
    propertyManager: "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isEditMode = !!propertyId;

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      setFormData({
        propertyNumber: "",
        propertyName: "",
        propertyType: "",
        status: "Active",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        marketValue: "",
        taxableValue: "",
        squareFeet: "",
        yearBuilt: "",
        acquisitionDate: "",
        propertyManager: "",
      });
    }
  }, [open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showSuccessToast(
      isEditMode ? "Property Updated" : "Property Created",
      isEditMode
        ? "The property has been updated successfully."
        : "The property has been created successfully."
    );

    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Property" : "Add New Property"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the property information below."
              : "Fill in the details to create a new property."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Property Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyNumber">
                  Property Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="propertyNumber"
                  placeholder="e.g., P-1001"
                  value={formData.propertyNumber}
                  onChange={(e) =>
                    handleChange("propertyNumber", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyName">
                  Property Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="propertyName"
                  placeholder="e.g., Downtown Office Tower"
                  value={formData.propertyName}
                  onChange={(e) => handleChange("propertyName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">
                  Property Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) => handleChange("propertyType", value)}
                  required
                >
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Medical">Medical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyManager">
                  Property Manager <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="propertyManager"
                  placeholder="e.g., John Smith"
                  value={formData.propertyManager}
                  onChange={(e) =>
                    handleChange("propertyManager", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="acquisitionDate">Acquisition Date</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={formData.acquisitionDate}
                  onChange={(e) =>
                    handleChange("acquisitionDate", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Location</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., 123 Main Street"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g., Austin"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="e.g., TX"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  placeholder="e.g., 78701"
                  value={formData.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Property Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Property Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marketValue">Market Value</Label>
                <Input
                  id="marketValue"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2500000.00"
                  value={formData.marketValue}
                  onChange={(e) => handleChange("marketValue", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxableValue">Taxable Value</Label>
                <Input
                  id="taxableValue"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2250000.00"
                  value={formData.taxableValue}
                  onChange={(e) =>
                    handleChange("taxableValue", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="squareFeet">Square Feet</Label>
                <Input
                  id="squareFeet"
                  type="number"
                  placeholder="e.g., 15000"
                  value={formData.squareFeet}
                  onChange={(e) => handleChange("squareFeet", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Input
                  id="yearBuilt"
                  type="number"
                  placeholder="e.g., 2018"
                  value={formData.yearBuilt}
                  onChange={(e) => handleChange("yearBuilt", e.target.value)}
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Property"
                : "Create Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
