// src/features/formVersion/components/fields/config/SliderFieldConfig.tsx

/**
 * Slider Field Configuration Component
 *
 * Provides UI for configuring a Slider field:
 * - Label (main question)
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
import { Slider } from '@/components/ui/slider';
import { Trash2, SlidersHorizontal } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * SliderFieldConfig Component
 *
 * Configuration UI for Slider field type
 * Features:
 * - Label, helper text
 * - Default numeric value with live slider preview
 * - Visibility conditions (JSON)
 * - Validation rule guidance
 */
export const SliderFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[SliderFieldConfig] Rendering for field:', field.id);

  const [defaultValue, setDefaultValue] = useState(field.default_value || '50');

  const minValue = 0;
  const maxValue = 100;
  const step = 1;

  const parsedValue =
    Number.isNaN(parseInt(defaultValue, 10)) || defaultValue === ''
      ? 50
      : parseInt(defaultValue, 10);

  return (
    <Card className="p-4 border-l-4 border-l-indigo-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
            <Badge variant="outline" className="text-xs">
              Slider
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
            placeholder="e.g., Select your budget range"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Default Value with Preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value
          </label>
          <div className="space-y-3">
            <Input
              type="number"
              value={defaultValue}
              onChange={(e) => {
                const val = e.target.value;
                setDefaultValue(val);
                onFieldChange({ default_value: val || null });
              }}
              placeholder="50"
              className="h-9"
              min={minValue}
              max={maxValue}
              step={step}
            />
            {/* Visual Slider Preview */}
            <div className="p-3 border rounded-md bg-muted/30">
              <Slider
                value={[parsedValue]}
                onValueChange={(value) => {
                  const next = String(value[0]);
                  setDefaultValue(next);
                  onFieldChange({ default_value: next });
                }}
                min={minValue}
                max={maxValue}
                step={step}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                <span>{minValue}</span>
                <span className="font-medium text-indigo-600">
                  {defaultValue || parsedValue}
                </span>
                <span>{maxValue}</span>
              </div>
            </div>
          </div>
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
            placeholder="Additional information (e.g., 'Select your preferred price range')"
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
      </div>
    </Card>
  );
};
