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

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Trash2, CheckSquare } from 'lucide-react';
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
  const { stages } = useFormVersionBuilder();
  const [visibilityEditorOpen, setVisibilityEditorOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState<VisibilityCondition>(null);

  useEffect(() => {
    const raw =
      field.visibility_conditions ?? field.visibility_condition ?? null;
    setBuilderValue(parseVisibilityConditions(raw));
  }, [field.visibility_conditions, field.visibility_condition]);
  const isDefaultChecked = field.default_value === '1';

  return (
    <>
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
                {isDefaultChecked
                  ? 'Checked by default'
                  : 'Unchecked by default'}
              </Label>
            </div>
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
