// src/features/formVersion/components/fields/preview/EmailInputPreview.tsx

/**
 * Email Input Preview Component
 * Displays preview of how the Email Input field will appear in the form
 * Shows email-specific features like type="email" and lowercase hint
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * EmailInputPreview Component
 * 
 * Preview component for Email Input field type
 * Features:
 * - Shows label with email icon
 * - Disabled input with placeholder
 * - Helper text display
 * - Default value preview
 */
export const EmailInputPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[EmailInputPreview] Rendering for field:', field.id);

  // Determine if field has validation rules
  const hasRules = field.rules && field.rules.length > 0;
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-2">
      {/* Label with icon */}
      <div className="flex items-center gap-2">
        <Mail className="h-3 w-3 text-purple-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {hasRules && (
          <span className="text-xs text-gray-500">
            ({field.rules.length} rule{field.rules.length !== 1 ? 's' : ''})
          </span>
        )}
      </div>

      {/* Input preview */}
      <Input
        type="email"
        placeholder={field.placeholder ?? 'Enter email address'}
        defaultValue={field.default_value ?? undefined}
        disabled
        className="bg-muted/30 cursor-not-allowed"
      />

      {/* Helper text */}
      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      {/* Email-specific hint */}
      <p className="text-xs text-purple-600 italic">
        Email format • Lowercase conversion
      </p>
    </div>
  );
};
