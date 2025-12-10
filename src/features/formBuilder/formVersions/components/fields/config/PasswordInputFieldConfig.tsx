// src/features/formVersion/components/fields/config/PasswordInputFieldConfig.tsx

/**
 * Password Input Field Configuration Component
 *
 * Provides UI for configuring a Password Input field:
 * - Label (main question)
 * - Placeholder
 * - Helper text with security tips
 * - Visibility conditions
 * - Security warnings
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Lock, Info, AlertTriangle } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * PasswordInputFieldConfig Component
 *
 * Configuration UI for Password Input field type
 * Features:
 * - Label, placeholder, helper text
 * - Visibility conditions (JSON)
 * - Strong security guidance and rules
 */
export const PasswordInputFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[PasswordInputFieldConfig] Rendering for field:', field.id);

  return (
    <Card className="p-4 border-l-4 border-l-red-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-red-500" />
            <Badge variant="outline" className="text-xs">
              Password Input
            </Badge>
            <span className="text-xs text-muted-foreground">
              Field {fieldIndex + 1}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Security Alert */}
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-xs text-red-900">
            <strong>Security:</strong> Passwords are hashed (bcrypt) before storage and never stored as plain text. Password values should not be filterable or searchable.
          </AlertDescription>
        </Alert>

        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Label <span className="text-destructive">*</span>
          </label>
          <Input
            value={field.label}
            onChange={(e) => onFieldChange({ label: e.target.value })}
            placeholder="e.g., Password"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Placeholder */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Placeholder
          </label>
          <Input
            value={field.placeholder ?? ''}
            onChange={(e) =>
              onFieldChange({ placeholder: e.target.value || null })
            }
            placeholder="e.g., Enter your password"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* No Default Value for Security */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Note:</strong> Default values are not recommended for password fields for security reasons. Each user should set a unique password.
          </AlertDescription>
        </Alert>

        {/* Helper Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Helper Text
          </label>
          <Textarea
            value={field.helper_text ?? ''}
            onChange={(e) =>
              onFieldChange({ helper_text: e.target.value || null })
            }
            placeholder="Additional information (e.g., 'Must be at least 8 characters with letters and numbers')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Visibility Conditions */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Visibility Conditions (JSON)
          </label>
          <Textarea
            value={
              field.visibility_conditions ?? field.visibility_condition ?? ''
            }
            onChange={(e) =>
              onFieldChange({
                visibility_conditions: e.target.value || null,
              })
            }
            placeholder='e.g., {"field_id": 5, "operator": "equals", "value": "yes"}'
            className="min-h-[60px] text-xs font-mono"
          />
        </div>

        {/* Available Validation Rules Info */}
        <div className="pt-2 border-t">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            📋 Suggested Validation Rules:
          </p>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
            <span>• required</span>
            <span>• min (length)</span>
            <span>• max (length)</span>
            <span>• confirmed</span>
            <span>• regex</span>
            <span>• same</span>
            <span>• different</span>
          </div>
          <p className="text-[10px] text-red-700 mt-2 font-medium">
            ⚠️ Use "confirmed" with a confirmation field, and "min" for at least 8 characters.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> Add "min" rule with props:{' '}
            <code className="bg-amber-100 px-1 rounded">
              {'{ "value": 8 }'}
            </code>
            , a "confirmed" rule, and "regex" with props:{' '}
            <code className="bg-amber-100 px-1 rounded">
              {'{ "pattern": "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\\\d).+$/" }'}
            </code>{' '}
            for complexity requirements.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
};
