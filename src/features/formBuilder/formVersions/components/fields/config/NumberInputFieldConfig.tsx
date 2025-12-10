// src/features/formVersion/components/fields/config/NumberInputFieldConfig.tsx

/**
 * Number Input Field Configuration Component
 * 
 * Provides UI for configuring a Number Input field:
 * - Label, placeholder, helper text
 * - Default value (numeric)
 * - Min/Max value hints (actual validation rules added later)
 * - Integer vs Decimal toggle hint
 * - Step value for decimals
 * - Visibility conditions
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Hash, Info } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * NumberInputFieldConfig Component
 * 
 * Configuration UI for Number Input field type
 * Features:
 * - Label, placeholder, helper text
 * - Default value with numeric validation
 * - Visibility conditions (JSON)
 * - Number-specific validation rules info
 */
export const NumberInputFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[NumberInputFieldConfig] Rendering for field:', field.id);

  // Helper function to validate numeric format for default value
  const isValidNumber = (value: string): boolean => {
    if (!value) return true; // Empty is okay
    return !isNaN(Number(value)) && value.trim() !== '';
  };

  const defaultValueValid = isValidNumber(field.default_value || '');

  return (
    <Card className="p-4 border-l-4 border-l-green-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-green-500" />
            <Badge variant="outline" className="text-xs">
              Number Input
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
        <Alert className="py-2">
          <Info className="h-3 w-3" />
          <AlertDescription className="text-xs">
            Accepts both integers and decimals. Use validation rules to enforce min/max values, integer-only, or ranges.
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
            placeholder="e.g., 0, 100, 3.14"
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
            placeholder="Additional information (e.g., 'Enter a value between 1 and 100')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Default Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value (Number)
          </label>
          <Input
            type="number"
            step="any"
            value={field.default_value ?? ''}
            onChange={(e) =>
              onFieldChange({ default_value: e.target.value || null })
            }
            placeholder="0"
            className={`h-9 ${!defaultValueValid ? 'border-destructive' : ''}`}
          />
          {!defaultValueValid && (
            <p className="text-[10px] text-destructive">
              ⚠️ Please enter a valid number
            </p>
          )}
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
            <span>• numeric</span>
            <span>• min (value)</span>
            <span>• max (value)</span>
            <span>• integer</span>
            <span>• between</span>
            <span>• unique</span>
            <span>• same/different</span>
          </div>
          <p className="text-[10px] text-green-700 mt-2 font-medium">
            ⚠️ Note: min/max rules validate the NUMERIC VALUE, not string length
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            💡 Configure validation rules in the Field Validation Rules section below
          </p>
        </div>
      </div>
    </Card>
  );
};
