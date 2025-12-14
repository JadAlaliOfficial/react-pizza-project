// src/features/formVersion/components/fields/config/ToggleSwitchFieldConfig.tsx

/**
 * Toggle Switch Field Configuration Component
 *
 * Provides UI for configuring a Toggle Switch field:
 * - Label (main question)
 * - Default state (on/off)
 * - Custom labels (On/Off text)
 * - Helper text
 * - Visibility conditions
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, ToggleLeft } from 'lucide-react';
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
 * ToggleSwitchFieldConfig Component
 *
 * Configuration UI for Toggle Switch field type
 * Features:
 * - Label, helper text
 * - Default on/off state
 * - Optional custom on/off labels (UI only)
 * - Visibility conditions (JSON)
 * - Validation rule guidance
 */
export const ToggleSwitchFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[ToggleSwitchFieldConfig] Rendering for field:', field.id);
  const { stages } = useFormVersionBuilder();
  const [visibilityEditorOpen, setVisibilityEditorOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState<VisibilityCondition>(null);

  useEffect(() => {
    const raw =
      field.visibility_conditions ?? field.visibility_condition ?? null;
    setBuilderValue(parseVisibilityConditions(raw));
  }, [field.visibility_conditions, field.visibility_condition]);

  const [defaultState, setDefaultState] = useState(field.default_value === '1');

  return (
    <>
      <Card className="p-4 border-l-4 border-l-teal-500">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <ToggleLeft className="h-4 w-4 text-teal-500" />
              <Badge variant="outline" className="text-xs">
                Toggle Switch
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
              placeholder="e.g., Enable notifications"
              className="h-9"
              maxLength={255}
            />
          </div>

          {/* Default State */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Default State
            </label>
            <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/30">
              <Switch
                checked={defaultState}
                onCheckedChange={(checked) => {
                  setDefaultState(checked);
                  onFieldChange({ default_value: checked ? '1' : '0' });
                }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {defaultState ? 'Enabled (On)' : 'Disabled (Off)'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Default toggle position when the form loads
                </p>
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
              placeholder="Additional information (e.g., 'Enable to receive email notifications')"
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
