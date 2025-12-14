// src/features/formVersion/components/fields/config/DateTimeInputFieldConfig.tsx

/**
 * DateTime Input Field Configuration Component
 *
 * Provides UI for configuring a DateTime Input field:
 * - Label, placeholder, helper text
 * - Default value (datetime format)
 * - Min/Max datetime hints (for validation rules)
 * - DateTime format (Y-m-d H:i:s standard)
 * - Timezone awareness
 * - Visibility conditions
 */

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Trash2 } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';
import { useFormVersionBuilder } from '../../../hooks/useFormVersionBuilder';
import type { VisibilityCondition } from '../../../components/shared/VisibilityConditionsBuilder';
import {
  VisibilityConditionsBuilder,
  parseVisibilityConditions,
  serializeVisibilityConditions,
} from '../../../components/shared/VisibilityConditionsBuilder';

// ============================================================================
// Component
// ============================================================================

/**
 * DateTimeInputFieldConfig Component
 *
 * Configuration UI for DateTime Input field type
 * Features:
 * - Native datetime-local picker with "Now" quick button
 * - Min/Max datetime hints
 * - Timezone awareness alert
 * - DateTime validation rule guidance
 */
export const DateTimeInputFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[DateTimeInputFieldConfig] Rendering for field:', field.id);
  const { stages } = useFormVersionBuilder();
  const [visibilityEditorOpen, setVisibilityEditorOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState<VisibilityCondition>(null);

  useEffect(() => {
    const raw =
      field.visibility_conditions ?? field.visibility_condition ?? null;
    setBuilderValue(parseVisibilityConditions(raw));
  }, [field.visibility_conditions, field.visibility_condition]);

  // Helper function to validate datetime format
  const isValidDateTime = (datetimeString: string): boolean => {
    if (!datetimeString) return true; // Empty is okay
    const date = new Date(datetimeString);
    return !isNaN(date.getTime());
  };

  const defaultValueValid = isValidDateTime(field.default_value || '');

  // Get current datetime in YYYY-MM-DDTHH:MM format (for datetime-local input)
  const getCurrentDateTime = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <>
      <Card className="p-4 border-l-4 border-l-indigo-500">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-purple-500" />
              <Badge variant="outline" className="text-xs">
                DateTime Input
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
              placeholder="Additional information (e.g., 'Select appointment date and time')"
              className="min-h-[60px] text-xs"
            />
          </div>

          {/* Default Value */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Default Value (DateTime)
            </label>
            <div className="flex gap-2">
              <Input
                type="datetime-local"
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
                  onFieldChange({ default_value: getCurrentDateTime() })
                }
                className="h-9 text-xs"
              >
                Now
              </Button>
            </div>
            {!defaultValueValid && (
              <p className="text-[10px] text-destructive">
                ⚠️ Please enter a valid datetime
              </p>
            )}
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
