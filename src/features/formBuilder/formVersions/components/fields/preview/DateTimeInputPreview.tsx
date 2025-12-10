// src/features/formVersion/components/fields/preview/DateTimeInputPreview.tsx

/**
 * DateTime Input Preview Component
 * 
 * Displays preview of how the DateTime Input field will appear in the form
 * Shows native datetime-local picker with both date and time selection
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CalendarClock } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * DateTimeInputPreview Component
 * 
 * Preview component for DateTime Input field type
 * Features:
 * - Shows label with datetime icon and badge
 * - Disabled datetime-local input with native picker
 * - Helper text display
 * - DateTime-specific hints
 * - Rules indicator
 */
export const DateTimeInputPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[DateTimeInputPreview] Rendering for field:', field.id);

  // Determine if field has validation rules
  const hasRules = field.rules && field.rules.length > 0;
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-2">
      {/* Label with icon and badge */}
      <div className="flex items-center gap-2">
        <CalendarClock className="h-3.5 w-3.5 text-purple-500" />
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
          DateTime
        </Badge>
      </div>

      {/* Input preview */}
      <Input
        type="datetime-local"
        placeholder={field.placeholder ?? 'YYYY-MM-DD HH:MM'}
        defaultValue={field.default_value ?? undefined}
        disabled
        className="bg-muted/30"
      />

      {/* Helper text */}
      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      {/* DateTime-specific hint */}
      <p className="text-[10px] text-purple-600 italic">
        ✓ Normalized to YYYY-MM-DD HH:MM:SS format. Combines date and time in a single field.
      </p>
    </div>
  );
};
