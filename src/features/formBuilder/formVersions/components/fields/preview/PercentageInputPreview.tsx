// src/features/formVersion/components/fields/preview/PercentageInputPreview.tsx

/**
 * Percentage Input Preview Component
 *
 * Displays a preview of how the Percentage Input field will appear in the form
 * Shows percentage input with visual progress bar
 */

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Percent } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * PercentageInputPreview Component
 *
 * Preview component for Percentage Input field type
 * Features:
 * - Label with percent icon and badge
 * - Disabled numeric input with % suffix
 * - Progress bar visualization
 * - Rule/required hints
 */
export const PercentageInputPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[PercentageInputPreview] Rendering for field:', field.id);

  const [value, setValue] = useState(field.default_value || '50');
  const numValue = parseFloat(value) || 0;

  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Percent className="h-3.5 w-3.5 text-blue-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>

      {/* Percentage Input */}
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={field.placeholder || '0'}
          disabled
          className="h-11 pr-12 text-right text-lg font-semibold border-blue-200 focus:border-blue-500"
          min={0}
          max={100}
          step={0.1}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-xl">
          %
        </span>
      </div>

      {/* Visual Progress Bar */}
      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Progress:</span>
            <span className="text-xs font-bold text-blue-600">{numValue}%</span>
          </div>

          <Progress value={numValue} className="h-4 bg-blue-500" />

          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span className="font-bold text-blue-600 text-sm">{numValue}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
};
