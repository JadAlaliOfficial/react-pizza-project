// src/features/formVersion/components/fields/config/CheckboxFieldConfig.tsx

/**
 * Checkbox Field Configuration Component
 * 
 * Provides UI for configuring a Checkbox field:
 * - Label (appears after checkbox)
 * - Helper text
 * - Default value ("1" checked, "0" unchecked)
 * - No placeholder needed for checkbox
 * - Visibility conditions
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Trash2, CheckSquare, Info } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * CheckboxFieldConfig Component
 * 
 * Configuration UI for Checkbox field type
 * Features:
 * - Live checkbox preview for default state
 * - Boolean value handling ("1"/"0")
 * - Common use case guidance
 * - No placeholder (checkbox-specific)
 */
export const CheckboxFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[CheckboxFieldConfig] Rendering for field:', field.id);

  const isDefaultChecked = field.default_value === '1';

  return (
    <Card className="p-4 border-l-4 border-l-emerald-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-emerald-500" />
            <Badge variant="outline" className="text-xs">
              Checkbox
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
        <Alert className="bg-emerald-50 border-emerald-200">
          <Info className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-xs text-emerald-900">
            Boolean field with checked/unchecked states. Value is normalized to "1" (checked) or "0" (unchecked). Perfect for agreements, opt-ins, and yes/no questions.
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
            placeholder="e.g., I agree to the terms and conditions"
            className="h-9"
            maxLength={255}
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Label appears next to the checkbox (not above it)
          </p>
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
            placeholder="Additional information (e.g., 'You must accept to continue')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Default Value (Checked State) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default State
          </label>
          <div className="flex items-center space-x-3 p-3 border rounded-md bg-muted/30">
            <Checkbox
              id="default-checked"
              checked={isDefaultChecked}
              onCheckedChange={(checked) =>
                onFieldChange({ default_value: checked ? '1' : '0' })
              }
            />
            <Label
              htmlFor="default-checked"
              className="text-sm font-normal cursor-pointer"
            >
              {isDefaultChecked ? 'Checked by default' : 'Unchecked by default'}
            </Label>
          </div>
          <p className="text-[10px] text-muted-foreground">
            💡 Value stored: "1" = checked, "0" = unchecked
          </p>
        </div>

        {/* Common Use Cases */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            ✅ Common Use Cases:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>• <strong>Terms & Conditions:</strong> User must agree to proceed</div>
            <div>• <strong>Newsletter Opt-in:</strong> Subscribe to updates</div>
            <div>• <strong>Consent Forms:</strong> Permission for data usage</div>
            <div>• <strong>Feature Toggles:</strong> Enable/disable options</div>
            <div>• <strong>Preferences:</strong> Remember me, notifications</div>
          </div>
          <p className="text-[10px] text-emerald-700 mt-2">
            💡 Use "required" validation to make checkbox mandatory (must be checked)
          </p>
        </div>

        {/* Placeholder Notice */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Note:</strong> Checkboxes don't use placeholder text. The label serves as the checkbox description.
          </AlertDescription>
        </Alert>

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
            <span>• required (must be checked)</span>
            <span>• in</span>
            <span>• notin</span>
          </div>
          <p className="text-[10px] text-emerald-700 mt-2 font-medium">
            ⚠️ "required" rule enforces checkbox must be checked (value = "1")
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            💡 Configure validation rules in the Field Validation Rules section below
          </p>
        </div>
      </div>
    </Card>
  );
};
