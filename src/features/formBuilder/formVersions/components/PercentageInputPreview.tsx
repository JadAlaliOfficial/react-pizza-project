// src/features/formVersion/components/preview/PercentageInputPreview.tsx

/**
 * Percentage Input Preview Component
 *
 * Displays a preview of how the Percentage Input field will appear in the form
 * Shows percentage input with visual progress bar and color coding
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Percent } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type PercentageInputPreviewProps = {
  field: Field;
};

export function PercentageInputPreview({ field }: PercentageInputPreviewProps) {
  const [value, setValue] = useState(field.default_value || "50");

  const getProgressColor = (val: number): string => {
    if (val <= 33) return "bg-red-500";
    if (val <= 66) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = (val: number): string => {
    if (val <= 33) return "Low";
    if (val <= 66) return "Medium";
    return "High";
  };

  const getStatusColor = (val: number): string => {
    if (val <= 33) return "bg-red-100 text-red-700 border-red-300";
    if (val <= 66) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-green-100 text-green-700 border-green-300";
  };

  const numValue = parseFloat(value) || 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Percent className="h-3 w-3 text-violet-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Percentage
        </Badge>
      </div>

      {/* Percentage Input */}
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={field.placeholder || "0"}
          disabled
          className="h-11 pr-12 text-right text-lg font-semibold border-violet-200 focus:border-violet-500"
          min="0"
          max="100"
          step="0.1"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-600 font-bold text-xl">
          %
        </span>
      </div>

      {/* Visual Progress Bar */}
      <div className="p-4 border border-violet-200 rounded-lg bg-violet-50/50">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Progress:</span>
            <Badge
              className={`text-xs font-bold border ${getStatusColor(
                numValue
              )}`}
            >
              {getStatusText(numValue)}
            </Badge>
          </div>

          <Progress
            value={numValue}
            className={`h-4 ${getProgressColor(numValue)}`}
          />

          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span className="font-bold text-violet-600 text-sm">
              {numValue}%
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-violet-600 italic">
        📊 Percentage input with visual progress bar. Stored as numeric string
        without %. Filter by percentage ranges.
      </p>
    </div>
  );
}
