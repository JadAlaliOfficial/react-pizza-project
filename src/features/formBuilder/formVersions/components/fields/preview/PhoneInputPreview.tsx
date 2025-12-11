// src/features/formVersion/components/fields/preview/PhoneInputPreview.tsx

/**
 * Phone Input Preview Component
 *
 * Displays preview of how the Phone Input field will appear in the form
 * Shows phone-specific features like type="tel" and format guidance
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * PhoneInputPreview Component
 *
 * Preview component for Phone Input field type
 * Features:
 * - Shows label with phone icon and badge
 * - Disabled tel input with placeholder
 * - Helper text display
 * - Phone-specific hints
 * - Rules indicator
 */
export const PhoneInputPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[PhoneInputPreview] Rendering for field:', field.id);

  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined,
  );

  return (
    <div className="space-y-2">
      {/* Label with icon and badge */}
      <div className="flex items-center gap-2">
        <Phone className="h-3.5 w-3.5 text-cyan-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {isRequired && <span className="text-destructive">*</span>}
        </Label>
      </div>

      {/* Input preview */}
      <Input
        type="tel"
        placeholder={field.placeholder ?? '+1 (555) 123-4567'}
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
