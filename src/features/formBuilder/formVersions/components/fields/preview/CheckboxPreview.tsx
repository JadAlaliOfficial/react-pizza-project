// src/features/formVersion/components/fields/preview/CheckboxPreview.tsx

/**
 * Checkbox Preview Component
 *
 * Displays preview of how the Checkbox field will appear in the form
 * Shows checkbox with label next to it
 */

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * CheckboxPreview Component
 *
 * Preview component for Checkbox field type
 * Features:
 * - Shows checkbox with label next to it (authentic layout)
 * - Default checked state preview
 * - Helper text with proper indentation
 * - Rules indicator
 * - Checkbox-specific hints
 */
export const CheckboxPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[CheckboxPreview] Rendering for field:', field.id);

  const isDefaultChecked = field.default_value === '1';
   const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-2">
      {/* Checkbox with label (authentic layout) */}
      <div className="flex items-center space-x-3">
        {isRequired && <span className="text-destructive">*</span>}
        <Checkbox
          id={`preview-checkbox-${field.id}`}
          defaultChecked={isDefaultChecked}
          disabled
        />
        <Label
          htmlFor={`preview-checkbox-${field.id}`}
          className="text-sm font-medium cursor-pointer"
        >
          {field.label}
        </Label>
      </div>

      {/* Helper text (indented to align with checkbox content) */}
      {field.helper_text && (
        <p className="text-xs text-muted-foreground ml-7">
          {field.helper_text}
        </p>
      )}
    </div>
  );
};
