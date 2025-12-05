// src/features/formVersion/components/fields/CurrencyInputFieldConfig.tsx

/**
 * Currency Input Field Configuration Component
 *
 * Provides UI for configuring a Currency Input field:
 * - Label (main question)
 * - Currency symbol
 * - Min/max amounts
 * - Default value
 * - Decimal places (fixed at 2)
 * - Helper text
 * - Visibility conditions
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, DollarSign, Info } from 'lucide-react';
import type { Field } from '@/features/formBuilder/formVersions/types';

type CurrencyInputFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function CurrencyInputFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: CurrencyInputFieldConfigProps) {
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
            📋 Available Validation Rules:
          </p>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-[10px] text-muted-foreground">
              • required
            </span>
            <span className="text-[10px] text-muted-foreground">
              • min (amount)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • max (amount)
            </span>
            <span className="text-[10px] text-muted-foreground">• between</span>
            <span className="text-[10px] text-muted-foreground">• numeric</span>
            <span className="text-[10px] text-muted-foreground">• regex</span>
          </div>
          <p className="text-[10px] text-emerald-700 mt-2 font-medium">
            💡 Use "min" and "max" rules to set allowed amount range. Values
            validated as numeric.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> Add "min" rule with props:{' '}
            <code className="bg-amber-100 px-1 rounded">{`{ "value": 0 }`}</code>{' '}
            for non-negative amounts, "max" rule with props:{' '}
            <code className="bg-amber-100 px-1 rounded">
              {`{ "value": 10000 }`}
            </code>{' '}
            to cap amount.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}
