// src/features/formVersion/components/fields/preview/TextInputPreview.tsx

/**
 * Text Input Preview Component
 *
 * Displays preview of how the Text Input field will appear in the form
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Type } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * TextInputPreview Component
 *
 * Preview component for Text Input field type
 * Features:
 * - Shows label with text icon
 * - Disabled input with placeholder
 * - Helper text display
 * - Default value preview
 */
export const TextInputPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[TextInputPreview] Rendering for field:', field.id);

  // Determine if field has validation rules
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined,
  );

  return (
    <div className="space-y-2">
      {/* Label with icon */}
      <Label className="text-sm font-medium flex items-center gap-2">
        <Type className="h-3.5 w-3.5 text-blue-500" />
        {field.label}
        {isRequired && <span className="text-destructive">*</span>}
      </Label>

      {/* Input preview */}
      <Input
        type="text"
        placeholder={field.placeholder ?? undefined}
        defaultValue={field.default_value ?? undefined}
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
