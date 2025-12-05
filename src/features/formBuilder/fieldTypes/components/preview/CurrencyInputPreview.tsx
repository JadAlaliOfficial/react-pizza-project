// src/features/formVersion/components/preview/CurrencyInputPreview.tsx

/**
 * Currency Input Preview Component
 *
 * Displays a preview of how the Currency Input field will appear in the form
 * Shows formatted currency input with symbol and decimal places
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type CurrencyInputPreviewProps = {
  field: Field;
};

export function CurrencyInputPreview({ field }: CurrencyInputPreviewProps) {
  const currencySymbol = "$"; // Can be configured
  const [value, setValue] = useState(field.default_value || "");

  const formatCurrency = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, "");
    const num = parseFloat(cleaned || "0");
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cleaned = input.replace(/[^0-9.]/g, "");
    setValue(cleaned);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DollarSign className="h-3 w-3 text-emerald-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
      </div>

      {/* Currency Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-lg">
          {currencySymbol}
        </span>
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={field.placeholder || "0.00"}
          disabled
          className="h-11 pl-10 pr-4 text-right text-lg font-semibold border-emerald-200 focus:border-emerald-500"
        />
      </div>

      {/* Formatted Display */}
      {value && (
        <div className="p-3 border border-emerald-200 rounded-md bg-emerald-50">
          <p className="text-xs text-muted-foreground mb-1">Formatted Value:</p>
          <p className="text-2xl font-bold text-emerald-600">
            {currencySymbol} {formatCurrency(value)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Stored as: {parseFloat(value || "0").toFixed(2)}
          </p>
        </div>
      )}

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
}
