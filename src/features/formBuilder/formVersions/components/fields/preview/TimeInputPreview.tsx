// src/features/formVersion/components/fields/preview/TimeInputPreview.tsx

/**
 * Time Input Preview Component
 * 
 * Displays preview of how the Time Input field will appear in the form
 * Shows native time picker with clock interface
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * TimeInputPreview Component
 * 
 * Preview component for Time Input field type
 * Features:
 * - Shows label with clock icon and badge
 * - Disabled time input with native picker
 * - Helper text display
 * - Time-specific hints
 * - Rules indicator
 */
export const TimeInputPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[TimeInputPreview] Rendering for field:', field.id);

  // Determine if field has validation rules
  const hasRules = field.rules && field.rules.length > 0;
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-2">
      {/* Label with icon and badge */}
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-teal-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {isRequired && <span className="text-destructive">*</span>}
          {hasRules && (
            <span className="text-[10px] text-muted-foreground font-normal ml-1">
              ({field.rules.length} rule{field.rules.length !== 1 ? 's' : ''})
            </span>
          )}
        </Label>
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
          Time
        </Badge>
      </div>

      {/* Input preview */}
      <Input
        type="time"
        placeholder={field.placeholder ?? 'HH:MM'}
        defaultValue={field.default_value ?? undefined}
        disabled
        className="bg-muted/30"
      />

      {/* Helper text */}
      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      {/* Time-specific hint */}
      <p className="text-[10px] text-teal-600 italic">
        ✓ Normalized to HH:MM:SS format (24-hour). Supports time range validation.
      </p>
    </div>
  );
};
