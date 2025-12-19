// src/features/formVersion/components/fields/config/ColorPickerFieldConfig.tsx

/**
 * Color Picker Field Configuration Component
 *
 * Provides UI for configuring a Color Picker field:
 * - Label (main question)
 * - Placeholder (e.g., "Select a color")
 * - Default value (hex color)
 * - Helper text
 * - Visibility conditions
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Palette } from 'lucide-react';
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
 * ColorPickerFieldConfig Component
 *
 * Configuration UI for Color Picker field type
 * Features:
 * - Label, placeholder, helper text
 * - Default hex color with live preview + native color input
 * - Visibility conditions (JSON)
 * - Color format and validation guidance
 */
export const ColorPickerFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[ColorPickerFieldConfig] Rendering for field:', field.id);
  const { stages } = useFormVersionBuilder();
  const [visibilityEditorOpen, setVisibilityEditorOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState<VisibilityCondition>(null);

  useEffect(() => {
    const raw =
      field.visibility_conditions ?? field.visibility_condition ?? null;
    setBuilderValue(parseVisibilityConditions(raw));
  }, [field.visibility_conditions, field.visibility_condition]);
  const [defaultColor, setDefaultColor] = useState(
    field.default_value || '#3B82F6',
  );

  // Ensure default value is preserved on mount/init
  useEffect(() => {
    if (!field.default_value) {
      onFieldChange({ default_value: '#3B82F6' });
    }
  }, []);

  return (
    <>
      <Card className="p-4 border-l-4 border-l-purple-500">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-purple-500" />
              <Badge variant="outline" className="text-xs">
                Color Picker
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
              placeholder="e.g., Choose your brand color"
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
              placeholder="e.g., Select a color"
              className="h-9"
              maxLength={255}
            />
          </div>

          {/* Default Value (Color) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Default Color Value
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={defaultColor}
                  onChange={(e) => {
                    setDefaultColor(e.target.value);
                    onFieldChange({
                      default_value: e.target.value || null,
                    });
                  }}
                  placeholder="#3B82F6"
                  className="h-9 pl-12 font-mono"
                  maxLength={7}
                />
                <div
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded border-2 border-gray-300"
                  style={{ backgroundColor: defaultColor }}
                />
              </div>
              <input
                type="color"
                value={defaultColor}
                onChange={(e) => {
                  setDefaultColor(e.target.value);
                  onFieldChange({ default_value: e.target.value || null });
                }}
                className="h-9 w-16 cursor-pointer rounded border"
              />
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
              placeholder="Additional information (e.g., 'Choose a color that represents your brand')"
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
