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

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, DollarSign } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';
import { useFormVersionBuilder } from '../../../hooks/useFormVersionBuilder';
import type { VisibilityCondition } from '../../shared/VisibilityConditionsBuilder';
import {
  VisibilityConditionsBuilder,
  parseVisibilityConditions,
  serializeVisibilityConditions,
} from '../../shared/VisibilityConditionsBuilder';

// ============================================================================
// Component
// ============================================================================

/**
 * CurrencyInputFieldConfig Component
 *
 * Configuration UI for Currency Input field type
 * Features:
 * - Label, placeholder, helper text
 * - Default formatted amount with symbol and thousand separators
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
  const { stages } = useFormVersionBuilder();
  const [visibilityEditorOpen, setVisibilityEditorOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState<VisibilityCondition>(null);

  useEffect(() => {
    const raw =
      field.visibility_conditions ?? field.visibility_condition ?? null;
    setBuilderValue(parseVisibilityConditions(raw));
  }, [field.visibility_conditions, field.visibility_condition]);
  const currencySymbol = '$';

  /**
   * Format number with thousand separators
   * Example: "1234.56" => "1,234.56"
   * Preserves trailing decimal point for better UX
   */
  const formatWithCommas = (value: string): string => {
    // Handle empty or just decimal point
    if (!value || value === '.') return value;

    // Check if ends with decimal point
    const endsWithDecimal = value.endsWith('.');

    // Remove all non-numeric characters except dot
    const cleaned = value.replace(/[^0-9.]/g, '');

    // Split into integer and decimal parts
    const parts = cleaned.split('.');

    // Add thousand separators to integer part
    const integerPart = parts[0]
      ? parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      : '';

    // Handle decimal part (limit to 2 places)
    if (parts.length > 1) {
      const decimalPart = parts[1].substring(0, 2);
      return `${integerPart}.${decimalPart}`;
    }

    // Preserve trailing decimal point if user just typed it
    if (endsWithDecimal && parts.length === 1) {
      return `${integerPart}.`;
    }

    return integerPart;
  };

  /**
   * Remove formatting for storage (store raw number)
   * Example: "1,234.56" => "1234.56"
   */
  const removeFormatting = (value: string): string => {
    return value.replace(/,/g, '');
  };

  const handleDefaultValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Allow empty input
    if (input === '') {
      onFieldChange({ default_value: null });
      return;
    }

    // Allow just a decimal point
    if (input === '.') {
      onFieldChange({ default_value: '0.' });
      return;
    }

    // Remove all non-numeric characters except dot
    const cleaned = input.replace(/[^0-9.]/g, '');

    // Prevent multiple dots
    const dotCount = (cleaned.match(/\./g) || []).length;
    if (dotCount > 1) {
      return;
    }

    // Store raw value (without commas) in field
    const rawValue = removeFormatting(cleaned);
    onFieldChange({ default_value: rawValue || null });
  };

  // Get display value (formatted with commas)
  const displayValue = field.default_value
    ? formatWithCommas(field.default_value)
    : '';

  return (
    <>
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
                value={displayValue}
                onChange={handleDefaultValueChange}
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
              Visibility Conditions
            </label>
            <div className="flex items-center justify-between rounded border p-2">
              <div className="text-[11px] text-muted-foreground">
                {field.visibility_conditions
                  ? 'Conditions configured'
                  : 'No conditions'}
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setVisibilityEditorOpen(true)}
              >
                Edit Conditions
              </Button>
            </div>
          </div>
        </div>
      </Card>
      {visibilityEditorOpen && (
        <VisibilityConditionsBuilder
          value={builderValue}
          onChange={(condition) => {
            setBuilderValue(condition);
            const serialized = serializeVisibilityConditions(condition);
            onFieldChange({ visibility_conditions: serialized });
          }}
          stages={stages}
          excludeFieldId={field.id}
          open={visibilityEditorOpen}
          onClose={() => setVisibilityEditorOpen(false)}
        />
      )}
    </>
  );
};
