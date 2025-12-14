// src/features/formVersion/components/fields/config/TimeInputFieldConfig.tsx

/**
 * Time Input Field Configuration Component
 *
 * Provides UI for configuring a Time Input field:
 * - Label, placeholder, helper text
 * - Default value (time format)
 * - Min/Max time hints (for validation rules)
 * - Time format (H:i:s standard - 24 hour)
 * - Step configuration (seconds, minutes)
 * - Visibility conditions
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Clock } from 'lucide-react';
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
 * TimeInputFieldConfig Component
 *
 * Configuration UI for Time Input field type
 * Features:
 * - Native time picker with configurable step (minutes/seconds)
 * - "Now" quick button
 * - Min/Max time hints
 * - Time validation rule guidance
 */
export const TimeInputFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[TimeInputFieldConfig] Rendering for field:', field.id);
  const { stages } = useFormVersionBuilder();
  const [visibilityEditorOpen, setVisibilityEditorOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState<VisibilityCondition>(null);

  useEffect(() => {
    const raw =
      field.visibility_conditions ?? field.visibility_condition ?? null;
    setBuilderValue(parseVisibilityConditions(raw));
  }, [field.visibility_conditions, field.visibility_condition]);

  const [stepType] = useState<'seconds' | 'minutes'>('minutes');

  // Helper function to validate time format
  const isValidTime = (timeString: string): boolean => {
    if (!timeString) return true; // Empty is okay
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return timeRegex.test(timeString);
  };

  const defaultValueValid = isValidTime(field.default_value || '');

  // Get current time in HH:MM format
  const getCurrentTime = (): string => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM
  };

  return (
    <>
      <Card className="p-4 border-l-4 border-l-teal-500">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-500" />
              <Badge variant="outline" className="text-xs">
                Time Input
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
              placeholder="Enter field label"
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
              placeholder="Additional information (e.g., 'Select appointment time')"
              className="min-h-[60px] text-xs"
            />
          </div>

          {/* Default Value */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Default Value (Time)
            </label>
            <div className="flex gap-2">
              <Input
                type="time"
                step={stepType === 'seconds' ? '1' : '60'}
                value={field.default_value ?? ''}
                onChange={(e) =>
                  onFieldChange({ default_value: e.target.value || null })
                }
                className={`h-9 flex-1 ${
                  !defaultValueValid ? 'border-destructive' : ''
                }`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onFieldChange({ default_value: getCurrentTime() })
                }
                className="h-9 text-xs"
              >
                Now
              </Button>
            </div>
            {!defaultValueValid && (
              <p className="text-[10px] text-destructive">
                ⚠️ Please enter a valid time
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              💡 Will be normalized to HH:MM:SS format (24-hour)
            </p>
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
