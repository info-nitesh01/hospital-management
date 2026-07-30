import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PercentageInputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PercentageInput({
  value,
  onChange,
  placeholder = "0",
  className,
  disabled = false,
}: PercentageInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === "") {
      onChange(inputValue);
      return;
    }

    const numValue = parseFloat(inputValue);

    if (!isNaN(numValue)) {
      if (numValue < 0) {
        onChange("0");
      } else if (numValue > 100) {
        onChange("100");
      } else {
        onChange(inputValue);
      }
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="pr-8"
        min="0"
        max="100"
        disabled={disabled}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        %
      </span>
    </div>
  );
}
