// src/features/formVersion/components/fields/preview/TextAreaPreview.tsx

/**
 * Text Area Preview Component
 *
 * Displays preview of how the Text Area field will appear in the form
 * Shows multi-line text support with proper formatting
 */

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlignLeft } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * TextAreaPreview Component
 *
 * Preview component for Text Area field type
 * Features:
 * - Shows label with text area icon
 * - Disabled multi-line textarea with larger height
 * - Helper text display
 * - Rules indicator
 * - Multi-line placeholder support
 */
export const TextAreaPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[TextAreaPreview] Rendering for field:', field.id);

  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined,
  );

  return (
    <div className="space-y-2">
      {/* Label with icon */}
      <Label className="text-sm font-medium flex items-center gap-2">
        <AlignLeft className="h-3.5 w-3.5 text-orange-500" />
        {field.label}
        {isRequired && <span className="text-destructive">*</span>}
      </Label>

      {/* Textarea preview */}
      <Textarea
        placeholder={field.placeholder ?? 'Enter your text here...'}
        defaultValue={field.default_value ?? undefined}
        disabled
        className="bg-muted/30 min-h-[100px]"
        rows={4}
      />

      {/* Helper text */}
      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
};
