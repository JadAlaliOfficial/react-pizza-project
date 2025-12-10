// src/features/formVersion/components/fields/config/CurrencyInputFieldConfig.tsx

/**
 * Currency Input Field Configuration Component
 *
 * Provides UI for configuring a Currency Input field:
 * - Label (main question)
 * - Currency symbol
 * - Default value
 * - Helper text
 * - Visibility conditions
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, DollarSign, Info } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * CurrencyInputFieldConfig Component
 *
 * Configuration UI for Currency Input field type
 * Features:
 * - Label, placeholder, helper text
 * - Default formatted amount with symbol
 * - Visibility conditions (JSON)
 * - Validation rule guidance
 */
export const CurrencyInputFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[CurrencyInputFieldConfig] Rendering for field:', field.id);

  const [currencySymbol] = useState('$');
  const [defaultValue, setDefaultValue] = useState(field.default_value || '');

  const formatCurrency = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned || '0');
    return num.toFixed(2);
  };

  return (
    <Card className="p-4 border-l-4 border-l-emerald-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <Badge variant="outline" className="text-xs">
              Currency Input
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
            Currency input for monetary amounts. Values are stored as numeric strings with two decimal places.
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
            placeholder="e.g., Enter your budget"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Default Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
              {currencySymbol}
            </span>
            <Input
              type="text"
              value={defaultValue}
              onChange={(e) => {
                const formatted = formatCurrency(e.target.value);
                setDefaultValue(formatted);
                onFieldChange({ default_value: formatted || null });
              }}
              placeholder="0.00"
              className="h-9 pl-8 text-right"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            💡 Values are normalized to two decimal places.
          </p>
        </div>

        {/* Placeholder */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Placeholder Text
          </label>
          <Input
            value={field.placeholder ?? ''}
            onChange={(e) =>
              onFieldChange({ placeholder: e.target.value || null })
            }
            placeholder="e.g., 0.00"
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
            placeholder="Additional information (e.g., 'Enter amount in USD')"
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
            <span>• min (amount)</span>
            <span>• max (amount)</span>
            <span>• between</span>
            <span>• numeric</span>
            <span>• regex</span>
          </div>
          <p className="text-[10px] text-emerald-700 mt-2 font-medium">
            💡 Use "min" and "max" to control allowed amount range; ensure values are numeric.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> Add "min" with props:{' '}
            <code className="bg-amber-100 px-1 rounded">
              {'{ "value": 0 }'}
            </code>{' '}
            for non-negative amounts and "max" with props:{' '}
            <code className="bg-amber-100 px-1 rounded">
              {'{ "value": 10000 }'}
            </code>{' '}
            to cap the maximum.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
};
