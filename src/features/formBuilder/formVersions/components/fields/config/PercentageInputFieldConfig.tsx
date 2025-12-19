// src/features/formVersion/components/fields/config/PercentageInputFieldConfig.tsx

/**
 * Percentage Input Field Configuration Component
 *
 * Provides UI for configuring a Percentage Input field:
 * - Label (main question)
 * - Default value
 * - Helper text
 * - Visibility conditions
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, Percent } from 'lucide-react';
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
 * PercentageInputFieldConfig Component
 *
 * Configuration UI for Percentage Input field type
 * Features:
 * - Label, placeholder, helper text
 * - Default percentage with progress preview
 * - Visibility conditions (JSON)
 * - Validation rule guidance (0–100 range)
 */
export const PercentageInputFieldConfig: React.FC<
  FieldConfigComponentProps
> = ({ field, fieldIndex, onFieldChange, onDelete }) => {
  console.debug('[PercentageInputFieldConfig] Rendering for field:', field.id);
  const { stages } = useFormVersionBuilder();
  const [visibilityEditorOpen, setVisibilityEditorOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState<VisibilityCondition>(null);

  useEffect(() => {
    const raw =
      field.visibility_conditions ?? field.visibility_condition ?? null;
    setBuilderValue(parseVisibilityConditions(raw));
  }, [field.visibility_conditions, field.visibility_condition]);
  const [defaultValue, setDefaultValue] = useState(field.default_value || '50');

  // Ensure default value is preserved on mount/init
  useEffect(() => {
    if (!field.default_value) {
      onFieldChange({ default_value: '50' });
    }
  }, []);

  const numValue = parseFloat(defaultValue);
  const safeValue = Number.isNaN(numValue) ? 0 : numValue;

  return (
    <>
      <Card className="p-4 border-l-4 border-l-blue-500">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-blue-500" />
              <Badge variant="outline" className="text-xs">
                Percentage Input
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
              placeholder="e.g., What is your completion rate?"
              className="h-9"
              maxLength={255}
            />
          </div>

          {/* Default Value with Visual Progress */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Default Value
            </label>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type="number"
                  value={defaultValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDefaultValue(value);
                    onFieldChange({ default_value: value || null });
                  }}
                  placeholder="50"
                  className="h-9 pr-10"
                  min={0}
                  max={100}
                  step={0.1}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                  %
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="p-3 border rounded-md bg-muted/30">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Preview:</span>
                    <span className="font-bold text-blue-600">
                      {defaultValue || 0}%
                    </span>
                  </div>
                  <Progress value={safeValue} className="h-3 bg-blue-500" />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
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
              placeholder="Additional information (e.g., 'Enter a value between 0 and 100')"
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
