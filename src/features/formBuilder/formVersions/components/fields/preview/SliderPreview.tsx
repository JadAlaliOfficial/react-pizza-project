// src/features/formVersion/components/fields/preview/SliderPreview.tsx

/**
 * Slider Preview Component
 *
 * Displays a preview of how the Slider field will appear in the form
 * Shows range slider with live value display
 */

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * SliderPreview Component
 *
 * Preview component for Slider field type
 * Features:
 * - Label with slider icon
 * - Disabled slider with live value display
 * - Min/max and tick labels
 * - Rule/required hints
 */
export const SliderPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[SliderPreview] Rendering for field:', field.id);

  const initial = parseInt(field.default_value || '50', 10);
  const defaultValue = Number.isNaN(initial) ? 50 : initial;

  const [value, setValue] = useState<number[]>([defaultValue]);
  const minValue = 0;
  const maxValue = 100;
  const step = 1;

  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
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
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
};
