// src/features/formVersion/components/fields/preview/NumberInputPreview.tsx

/**
 * Number Input Preview Component
 * 
 * Displays preview of how the Number Input field will appear in the form
 * Shows number-specific features like type="number" and step attribute
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hash } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * NumberInputPreview Component
 * 
 * Preview component for Number Input field type
 * Features:
 * - Shows label with number icon
 * - Disabled number input with step="any"
 * - Helper text display
 * - Default value preview as number
 * - Rules indicator
 */
export const NumberInputPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[NumberInputPreview] Rendering for field:', field.id);

  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  // Parse default value as number if present
  const defaultValue = field.default_value
    ? Number(field.default_value)
    : undefined;

  return (
    <div className="space-y-2">
      {/* Label with icon */}
      <Label className="text-sm font-medium flex items-center gap-2">
        <Hash className="h-3.5 w-3.5 text-green-500" />
        {field.label}
        {isRequired && <span className="text-destructive">*</span>}
      </Label>

      {/* Input preview */}
      <Input
        type="number"
        step="any"
        placeholder={field.placeholder ?? '0'}
        defaultValue={defaultValue}
        disabled
        className="bg-muted/30"
      />

      {/* Helper text */}
      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
};
