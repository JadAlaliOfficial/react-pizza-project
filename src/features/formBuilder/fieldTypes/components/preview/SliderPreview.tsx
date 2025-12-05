// src/features/formVersion/components/preview/SliderPreview.tsx

/**
 * Slider Preview Component
 *
 * Displays a preview of how the Slider field will appear in the form
 * Shows interactive range slider with live value display
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type SliderPreviewProps = {
  field: Field;
};

export function SliderPreview({ field }: SliderPreviewProps) {
  const defaultValue = parseInt(field.default_value || "50");
  const [value, setValue] = useState([defaultValue]);
  const minValue = 0; // Can be configured via validation rules
  const maxValue = 100; // Can be configured via validation rules
  const step = 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-3 w-3 text-indigo-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
      </div>

      {/* Slider Component */}
      <div className="space-y-3 px-1">
        {/* Value Display */}
        <div className="flex items-center justify-center">
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
            <span className="text-2xl font-bold text-indigo-600">
              {value[0]}
            </span>
          </div>
        </div>

        {/* Slider Track */}
        <div className="relative">
          <Slider
            value={value}
            onValueChange={setValue}
            min={minValue}
            max={maxValue}
            step={step}
            className="w-full"
            disabled
          />
          {/* Min/Max Labels */}
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span className="font-medium">{minValue}</span>
            <span className="text-[10px] italic">Drag to adjust</span>
            <span className="font-medium">{maxValue}</span>
          </div>
        </div>

        {/* Tick Marks (Optional) */}
        <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
          {[0, 25, 50, 75, 100].map((tick) => (
            <div key={tick} className="flex flex-col items-center">
              <div className="w-px h-2 bg-gray-300"></div>
              <span className="mt-1">{tick}</span>
            </div>
          ))}
        </div>
      </div>

      {field.placeholder && (
        <p className="text-xs text-muted-foreground italic">
          {field.placeholder}
        </p>
      )}

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
}
