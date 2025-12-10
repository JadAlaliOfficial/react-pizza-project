// src/features/formVersion/components/fields/config/EmailInputFieldConfig.tsx

/**
 * Email Input Field Configuration Component
 * Example field config component adapted for Form Version Builder
 * Provides UI for configuring an Email Input field properties
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Mail, Info } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * EmailInputFieldConfig Component
 * 
 * Configuration UI for Email Input field type
 * Features:
 * - Label, placeholder, helper text
 * - Default value with email validation
 * - Visibility conditions (JSON)
 * - Email-specific notes
 */
export const EmailInputFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[EmailInputFieldConfig] Rendering for field:', field.id);

  /**
   * Validates email format for default value
   */
  const isValidEmail = (email: string): boolean => {
    if (!email) return true; // Empty is okay
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const defaultValueValid = isValidEmail(field.default_value || '');

  return (
    <Card className="p-4 border-l-4 border-l-purple-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-purple-500" />
            <Badge variant="outline" className="text-xs">
              Email Input
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

        {/* Info Alert */}
        <Alert className="bg-purple-50 border-purple-200">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-xs text-purple-900">
            Email values are automatically converted to lowercase and trimmed.
            Built-in email validation is available via rules.
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
            placeholder="Enter field label"
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
            placeholder="e.g., user@example.com"
            className="h-9"
            maxLength={255}
          />
        </div>

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
            placeholder="Additional information (e.g., 'We'll never share your email')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Default Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value (Email Address)
          </label>
          <Input
            type="email"
            value={field.default_value ?? ''}
            onChange={(e) =>
              onFieldChange({ default_value: e.target.value || null })
            }
            placeholder="default@example.com"
            className={`h-9 ${!defaultValueValid ? 'border-destructive' : ''}`}
          />
          {!defaultValueValid && (
            <p className="text-[10px] text-destructive">
              ⚠️ Please enter a valid email format
            </p>
          )}
        </div>

        {/* Visibility Conditions */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Visibility Conditions (JSON)
          </label>
          <Textarea
            value={field.visibility_conditions ?? ''}
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
          <div className="grid grid-cols-2 gap-1">
            <span className="text-[10px] text-muted-foreground">
              • required
            </span>
            <span className="text-[10px] text-muted-foreground">• email</span>
            <span className="text-[10px] text-muted-foreground">• min/max</span>
            <span className="text-[10px] text-muted-foreground">• unique</span>
            <span className="text-[10px] text-muted-foreground">
              • confirmed
            </span>
            <span className="text-[10px] text-muted-foreground">• regex</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            💡 Configure validation rules in the Field Validation Rules section below
          </p>
        </div>
      </div>
    </Card>
  );
};
