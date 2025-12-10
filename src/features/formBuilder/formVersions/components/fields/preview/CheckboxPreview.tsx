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
import { Badge } from '@/components/ui/badge';
import { CheckSquare } from 'lucide-react';
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

  // Determine if field has validation rules
  const hasRules = field.rules && field.rules.length > 0;
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-2">
      {/* Header with icon and badge */}
      <div className="flex items-center gap-2">
        <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
          Checkbox
        </Badge>
        {isRequired && <span className="text-destructive text-xs">*</span>}
        {hasRules && (
          <span className="text-[10px] text-muted-foreground font-normal">
            ({field.rules.length} rule{field.rules.length !== 1 ? 's' : ''})
          </span>
        )}
      </div>

      {/* Checkbox with label (authentic layout) */}
      <div className="flex items-center space-x-3">
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

      {/* Checkbox-specific hint */}
      <p className="text-[10px] text-emerald-600 italic ml-7">
        ✓ Value: "1" (checked) or "0" (unchecked). Binary boolean field.
      </p>
    </div>
  );
};
