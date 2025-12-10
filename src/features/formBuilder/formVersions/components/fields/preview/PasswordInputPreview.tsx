// src/features/formVersion/components/fields/preview/PasswordInputPreview.tsx

/**
 * Password Input Preview Component
 *
 * Displays a preview of how the Password Input field will appear in the form
 * Shows password input with toggle visibility and strength indicator
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Eye } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * PasswordInputPreview Component
 *
 * Preview component for Password Input field type
 * Features:
 * - Label with lock icon
 * - Disabled password input with visibility toggle
 * - Static strength indicator
 * - Rule/required hints
 */
export const PasswordInputPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[PasswordInputPreview] Rendering for field:', field.id);

  const hasRules = field.rules && field.rules.length > 0;
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Lock className="h-3.5 w-3.5 text-red-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
        {hasRules && (
          <span className="text-[10px] text-muted-foreground font-normal">
            ({field.rules.length} rule{field.rules.length !== 1 ? 's' : ''})
          </span>
        )}
      </div>

      {/* Password Input with Toggle Visibility */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Lock className="h-4 w-4 text-red-500" />
        </div>
        <Input
          type="password"
          placeholder={field.placeholder || ''}
          disabled
          className="pl-9 pr-10 h-10 bg-white"
        />
        {/* Toggle Visibility Button (visual only) */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2"
          disabled
        >
          <Eye className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Password Strength Indicator (static preview) */}
      <div className="space-y-1">
        <div className="flex gap-1">
          <div className="h-1.5 flex-1 rounded-full bg-red-200" />
          <div className="h-1.5 flex-1 rounded-full bg-muted" />
          <div className="h-1.5 flex-1 rounded-full bg-muted" />
          <div className="h-1.5 flex-1 rounded-full bg-muted" />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Password strength:{' '}
          <span className="text-red-600 font-medium">Weak</span>
        </p>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
};
