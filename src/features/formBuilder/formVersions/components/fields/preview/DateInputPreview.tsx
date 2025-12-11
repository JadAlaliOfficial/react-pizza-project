// src/features/formVersion/components/fields/preview/DateInputPreview.tsx

/**
 * Date Input Preview Component
 * 
 * Displays preview of how the Date Input field will appear in the form
 * Shows native date picker with calendar interface
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * DateInputPreview Component
 * 
 * Preview component for Date Input field type
 * Features:
 * - Shows label with calendar icon and badge
 * - Disabled date input with native picker
 * - Helper text display
 * - Date-specific hints
 * - Rules indicator
 */
export const DateInputPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[DateInputPreview] Rendering for field:', field.id);

  // Determine if field has validation rules
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-2">
      {/* Label with icon and badge */}
      <div className="flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5 text-indigo-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {isRequired && <span className="text-destructive">*</span>}
        </Label>
      </div>

      {/* Input preview */}
      <Input
        type="date"
        placeholder={field.placeholder ?? 'YYYY-MM-DD'}
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
